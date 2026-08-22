
# from decimal import Decimal

# from django.db import transaction
# from rest_framework import viewsets
# from rest_framework.exceptions import ValidationError
# from rest_framework.decorators import action
# from rest_framework.response import Response

# from .models import Room, RoomBooking
# from .serializers import RoomSerializer, RoomBookingSerializer

# # --------------------------------------------------
# # Booking Status Rules
# # --------------------------------------------------

# ACTIVE_BOOKING_STATUSES = ["Booked", "Checked In"]
# PRESERVED_ROOM_STATUSES = ["Cleaning", "Maintenance"]

from decimal import Decimal
import threading

from django.db import transaction
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Room, RoomBooking
from .serializers import RoomSerializer, RoomBookingSerializer

# --------------------------------------------------
# Booking Status Rules
# --------------------------------------------------

ACTIVE_BOOKING_STATUSES = ["Booked", "Checked In"]
PRESERVED_ROOM_STATUSES = ["Cleaning", "Maintenance"]


# --------------------------------------------------
# In-process room locks (race-condition safety net)
# --------------------------------------------------
#
# select_for_update() below only takes a REAL lock on databases that
# support row locking (e.g. Postgres, used in production on Render).
# On SQLite (the default when running the backend locally with no
# DATABASE_URL set) select_for_update() is a silent no-op, so two
# booking requests for the same room that land close together
# (double-clicking "Book Room", two browser tabs, a retried request,
# etc.) could both pass the "is this room free?" check before either
# one has actually saved - resulting in the same room being booked
# twice for overlapping dates.
#
# To close that gap regardless of which database is in use, we also
# take a plain Python lock keyed by room id before doing the check +
# save. This guarantees only one request per room can be in the
# "check availability, then book it" critical section at the same
# time within this server process.
_room_locks = {}
_room_locks_guard = threading.Lock()


def get_room_lock(room_id):
    with _room_locks_guard:
        lock = _room_locks.get(room_id)
        if lock is None:
            lock = threading.Lock()
            _room_locks[room_id] = lock
        return lock
# --------------------------------------------------
# Room Status Helpers
# --------------------------------------------------

def sync_room_status(room):
    """
    Recomputes a room's status from its bookings, the same way
    restaurant tables are kept in sync with their orders.

    - Any booking currently "Checked In"  -> room is Occupied
    - Else any booking currently "Booked" -> room is Booked
    - Otherwise                           -> room is Available

    Rooms manually set to Cleaning/Maintenance are left alone so a
    housekeeping/maintenance flag isn't silently overwritten.
    """
    if not room:
        return

    if room.status in PRESERVED_ROOM_STATUSES:
        return

    if RoomBooking.objects.filter(room=room, booking_status="Checked In").exists():
        new_status = "Occupied"
    elif RoomBooking.objects.filter(room=room, booking_status="Booked").exists():
        new_status = "Booked"
    else:
        new_status = "Available"

    if room.status != new_status:
        room.status = new_status
        room.save()


def sync_payment_status(booking):
    """Keeps payment_status consistent with amount_paid vs total_amount."""
    total = booking.total_amount or 0
    paid = booking.amount_paid or 0

    if paid <= 0:
        new_status = "Unpaid"
    elif paid >= total:
        new_status = "Paid"
    else:
        new_status = "Partial"

    if booking.payment_status != new_status:
        booking.payment_status = new_status
        booking.save()


def has_overlapping_booking(room, check_in, check_out, exclude_id=None):
    qs = RoomBooking.objects.filter(
        room=room,
        booking_status__in=ACTIVE_BOOKING_STATUSES,
        check_in_date__lt=check_out,
        check_out_date__gt=check_in,
    )

    if exclude_id:
        qs = qs.exclude(id=exclude_id)

    return qs.exists()


# --------------------------------------------------
# ViewSets
# --------------------------------------------------

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().order_by("room_number")
    serializer_class = RoomSerializer

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """
        GET /api/hotel/rooms/summary/
        Quick counts for dashboard-style "how many rooms available" widgets.
        """
        rooms = Room.objects.all()
        data = {
            "total": rooms.count(),
            "available": rooms.filter(status="Available").count(),
            "booked": rooms.filter(status="Booked").count(),
            "occupied": rooms.filter(status="Occupied").count(),
            "cleaning": rooms.filter(status="Cleaning").count(),
            "maintenance": rooms.filter(status="Maintenance").count(),
        }
        return Response(data)


class RoomBookingViewSet(viewsets.ModelViewSet):
    queryset = RoomBooking.objects.all().order_by("-created_at")
    serializer_class = RoomBookingSerializer

    @action(detail=True, methods=["post"])
    def pay(self, request, pk=None):
        """
        POST /api/hotel/bookings/<id>/pay/
        body: { "amount": 1500, "payment_method": "Cash" }

        Records a guest payment against a booking (supports partial
        payments) and keeps payment_status in sync automatically.
        """
        booking = self.get_object()

        try:
            amount = Decimal(str(request.data.get("amount", 0)))
        except Exception:
            raise ValidationError({"amount": "Enter a valid amount."})

        if amount <= 0:
            raise ValidationError({"amount": "Amount must be greater than 0."})

        booking.amount_paid = (booking.amount_paid or 0) + amount

        payment_method = request.data.get("payment_method")
        if payment_method:
            booking.payment_method = payment_method

        booking.save()
        sync_payment_status(booking)

        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    def perform_create(self, serializer):
        room = serializer.validated_data.get("room")
        check_in = serializer.validated_data.get("check_in_date")
        check_out = serializer.validated_data.get("check_out_date")
        booking_status = serializer.validated_data.get("booking_status", "Booked")

        if check_out <= check_in:
            raise ValidationError(
                {"check_out_date": "Check-out date must be after check-in date."}
            )

        # --------------------------------------------------------------
        # Race-condition guard: two people booking the SAME room for the
        # SAME dates at (almost) the SAME instant must not both succeed.
        #
        # select_for_update() locks the Room row for the duration of this
        # transaction, so if two requests arrive together, the second one
        # waits until the first has committed (and its booking is now
        # visible) before it runs its own overlap check.
        # --------------------------------------------------------------
        with get_room_lock(room.pk):
            with transaction.atomic():
                room = Room.objects.select_for_update().get(pk=room.pk)

                if booking_status in ACTIVE_BOOKING_STATUSES and has_overlapping_booking(
                    room, check_in, check_out
                ):
                    raise ValidationError(
                        {
                            "room": (
                                f"Room {room.room_number} is already booked for "
                                f"these dates. Please pick another room or "
                                f"different dates."
                            )
                        }
                    )

                booking = serializer.save()
                sync_payment_status(booking)
                sync_room_status(booking.room)
        
        # with transaction.atomic():
        #     room = Room.objects.select_for_update().get(pk=room.pk)

        #     if booking_status in ACTIVE_BOOKING_STATUSES and has_overlapping_booking(
        #         room, check_in, check_out
        #     ):
        #         raise ValidationError(
        #             {
        #                 "room": (
        #                     f"Room {room.room_number} is already booked for "
        #                     f"these dates. Please pick another room or "
        #                     f"different dates."
        #                 )
        #             }
        #         )

        #     booking = serializer.save()
        #     sync_payment_status(booking)
        #     sync_room_status(booking.room)
        

    def perform_update(self, serializer):
        instance = serializer.instance
        old_room = instance.room

        room = serializer.validated_data.get("room", instance.room)
        check_in = serializer.validated_data.get("check_in_date", instance.check_in_date)
        check_out = serializer.validated_data.get("check_out_date", instance.check_out_date)
        booking_status = serializer.validated_data.get(
            "booking_status", instance.booking_status
        )

        if check_out <= check_in:
            raise ValidationError(
                {"check_out_date": "Check-out date must be after check-in date."}
            )
        with get_room_lock(room.pk):
            with transaction.atomic():
                room = Room.objects.select_for_update().get(pk=room.pk)

                if booking_status in ACTIVE_BOOKING_STATUSES and has_overlapping_booking(
                    room, check_in, check_out, exclude_id=instance.id
                ):
                    raise ValidationError(
                        {
                            "room": (
                                f"Room {room.room_number} is already booked for "
                                f"these dates. Please pick another room or "
                                f"different dates."
                            )
                        }
                    )

                booking = serializer.save()
                sync_payment_status(booking)

                sync_room_status(old_room)
                sync_room_status(booking.room)
        # with transaction.atomic():
        #     room = Room.objects.select_for_update().get(pk=room.pk)

        #     if booking_status in ACTIVE_BOOKING_STATUSES and has_overlapping_booking(
        #         room, check_in, check_out, exclude_id=instance.id
        #     ):
        #         raise ValidationError(
        #             {
        #                 "room": (
        #                     f"Room {room.room_number} is already booked for "
        #                     f"these dates. Please pick another room or "
        #                     f"different dates."
        #                 )
        #             }
        #         )

        #     booking = serializer.save()
        #     sync_payment_status(booking)

        #     sync_room_status(old_room)
        #     sync_room_status(booking.room)

    def perform_destroy(self, instance):
        room = instance.room
        instance.delete()
        sync_room_status(room)