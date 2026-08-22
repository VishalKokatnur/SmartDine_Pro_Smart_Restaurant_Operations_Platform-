# from rest_framework import serializers
# from .models import Room, RoomBooking

# class RoomSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Room
#         fields = '__all__'

# class RoomBookingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = RoomBooking
#         fields = '__all__'

from rest_framework import serializers
from .models import Room, RoomBooking


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'


class RoomBookingSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    room_type = serializers.CharField(source='room.room_type', read_only=True)
    room_capacity = serializers.IntegerField(source='room.capacity', read_only=True)
    price_per_day = serializers.DecimalField(
        source='room.price_per_day', read_only=True, max_digits=10, decimal_places=2
    )
    nights = serializers.SerializerMethodField()
    balance_due = serializers.SerializerMethodField()

    class Meta:
        model = RoomBooking
        fields = '__all__'

    def get_nights(self, obj):
        if obj.check_in_date and obj.check_out_date:
            return max((obj.check_out_date - obj.check_in_date).days, 0)
        return 0

    def get_balance_due(self, obj):
        total = obj.total_amount or 0
        paid = obj.amount_paid or 0
        due = total - paid
        return due if due > 0 else 0