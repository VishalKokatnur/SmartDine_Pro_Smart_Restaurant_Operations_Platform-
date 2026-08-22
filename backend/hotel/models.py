# from django.db import models


# class Room(models.Model):
#     ROOM_TYPES = [
#         ('Single Room', 'Single Room'),
#         ('Double Room', 'Double Room'),
#         ('Deluxe Room', 'Deluxe Room'),
#         ('Suite Room', 'Suite Room'),
#     ]

#     ROOM_STATUS = [
#         ('Available', 'Available'),
#         ('Booked', 'Booked'),
#         ('Occupied', 'Occupied'),
#         ('Cleaning', 'Cleaning'),
#         ('Maintenance', 'Maintenance'),
#     ]

#     room_number = models.CharField(max_length=20, unique=True)
#     room_type = models.CharField(max_length=50, choices=ROOM_TYPES)
#     price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
#     status = models.CharField(
#         max_length=20,
#         choices=ROOM_STATUS,
#         default='Available'
#     )

#     def __str__(self):
#         return f"Room {self.room_number} - {self.room_type}"
    
# class RoomBooking(models.Model):
#     BOOKING_STATUS = [
#         ('Booked', 'Booked'),
#         ('Checked In', 'Checked In'),
#         ('Checked Out', 'Checked Out'),
#         ('Cancelled', 'Cancelled'),
#     ]

#     room = models.ForeignKey(Room, on_delete=models.CASCADE)
#     guest_name = models.CharField(max_length=100)
#     guest_phone = models.CharField(max_length=15)
#     guest_email = models.EmailField(blank=True, null=True)
#     check_in_date = models.DateField()
#     check_out_date = models.DateField()
#     number_of_guests = models.IntegerField()
#     total_amount = models.DecimalField(max_digits=10, decimal_places=2)

#     booking_status = models.CharField(
#         max_length=20,
#         choices=BOOKING_STATUS,
#         default='Booked'
#     )

#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.guest_name} - Room {self.room.room_number}"

from django.db import models


class Room(models.Model):
    ROOM_TYPES = [
        ('Single Room', 'Single Room'),
        ('Double Room', 'Double Room'),
        ('Deluxe Room', 'Deluxe Room'),
        ('Suite Room', 'Suite Room'),
    ]

    ROOM_STATUS = [
        ('Available', 'Available'),
        ('Booked', 'Booked'),
        ('Occupied', 'Occupied'),
        ('Cleaning', 'Cleaning'),
        ('Maintenance', 'Maintenance'),
    ]

    room_number = models.CharField(max_length=20, unique=True)
    room_type = models.CharField(max_length=50, choices=ROOM_TYPES)
    capacity = models.IntegerField(default=2, help_text="Maximum number of guests who can stay in this room")
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=ROOM_STATUS,
        default='Available'
    )

    def __str__(self):
        return f"Room {self.room_number} - {self.room_type}"


class RoomBooking(models.Model):
    BOOKING_STATUS = [
        ('Booked', 'Booked'),
        ('Checked In', 'Checked In'),
        ('Checked Out', 'Checked Out'),
        ('Cancelled', 'Cancelled'),
    ]

    PAYMENT_STATUS = [
        ('Unpaid', 'Unpaid'),
        ('Partial', 'Partial'),
        ('Paid', 'Paid'),
    ]

    PAYMENT_METHODS = [
        ('Cash', 'Cash'),
        ('Card', 'Card'),
        ('UPI', 'UPI'),
        ('Online', 'Online'),
    ]

    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='bookings')
    guest_name = models.CharField(max_length=100)
    guest_phone = models.CharField(max_length=15)
    guest_email = models.EmailField(blank=True, null=True)

    check_in_date = models.DateField()
    check_in_time = models.TimeField(blank=True, null=True)
    check_out_date = models.DateField()
    check_out_time = models.TimeField(blank=True, null=True)

    number_of_guests = models.IntegerField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    booking_status = models.CharField(
        max_length=20,
        choices=BOOKING_STATUS,
        default='Booked'
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default='Unpaid'
    )
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
        blank=True,
        null=True,
    )

    notes = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.guest_name} - Room {self.room.room_number}"