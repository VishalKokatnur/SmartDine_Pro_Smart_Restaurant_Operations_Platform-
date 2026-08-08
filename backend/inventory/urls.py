from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InventoryItemViewSet,
    RecipeItemViewSet,
    low_stock_items,
    check_recipe_stock,
)

router = DefaultRouter()

router.register("items", InventoryItemViewSet, basename="inventory-items")
router.register("recipe-items", RecipeItemViewSet, basename="recipe-items")

urlpatterns = [
    path("", include(router.urls)),
    path("low-stock/", low_stock_items, name="low-stock-items"),
    path("check-stock/", check_recipe_stock, name="check-recipe-stock"),
]