from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, RoomBookingViewSet

router = DefaultRouter()
router.register('rooms', RoomViewSet)
router.register('bookings', RoomBookingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]