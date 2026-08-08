from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PurchaseViewSet, purchase_restock

router = DefaultRouter()
router.register("purchases", PurchaseViewSet, basename="purchases")

urlpatterns = [
    path("", include(router.urls)),
    path("restock/", purchase_restock, name="purchase-restock"),
]