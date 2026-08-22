# from django.contrib import admin
# from .models import Room, RoomBooking


# admin.site.register(Room)
# admin.site.register(RoomBooking)

from django.contrib import admin
from .models import Room, RoomBooking


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("room_number", "room_type", "capacity", "price_per_day", "status")
    list_filter = ("room_type", "status")
    search_fields = ("room_number",)


@admin.register(RoomBooking)
class RoomBookingAdmin(admin.ModelAdmin):
    list_display = (
        "guest_name",
        "room",
        "check_in_date",
        "check_out_date",
        "booking_status",
        "payment_status",
        "amount_paid",
        "total_amount",
    )
    list_filter = ("booking_status", "payment_status")
    search_fields = ("guest_name", "guest_phone", "room__room_number")