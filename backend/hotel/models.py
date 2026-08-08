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

    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    guest_name = models.CharField(max_length=100)
    guest_phone = models.CharField(max_length=15)
    guest_email = models.EmailField(blank=True, null=True)
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    number_of_guests = models.IntegerField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    booking_status = models.CharField(
        max_length=20,
        choices=BOOKING_STATUS,
        default='Booked'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.guest_name} - Room {self.room.room_number}"