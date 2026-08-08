from decimal import Decimal

from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.apps import apps
from django.db import transaction

from .models import Purchase
from .serializers import PurchaseSerializer


# --------------------------------------------------
# Helper functions
# --------------------------------------------------

def get_first_model(app_name, model_names):
    for model_name in model_names:
        try:
            return apps.get_model(app_name, model_name)
        except LookupError:
            pass
    return None


def get_stock_field(model):
    possible_fields = [
        "quantity",
        "stock",
        "current_stock",
        "available_stock",
        "qty",
    ]

    model_fields = [field.name for field in model._meta.fields]

    for field in possible_fields:
        if field in model_fields:
            return field

    return None


def get_item_name(item):
    return (
        getattr(item, "name", None)
        or getattr(item, "item_name", None)
        or getattr(item, "ingredient_name", None)
        or getattr(item, "material_name", None)
        or "Item"
    )


def get_item_unit(item):
    return (
        getattr(item, "unit", None)
        or getattr(item, "unit_name", None)
        or getattr(item, "measurement_unit", None)
        or ""
    )


def get_inventory_item_id(data):
    return (
        data.get("inventory_item")
        or data.get("item")
        or data.get("stock_item")
        or data.get("ingredient")
        or data.get("raw_material")
    )


def get_purchase_quantity(data):
    return (
        data.get("quantity")
        or data.get("purchase_quantity")
        or data.get("qty")
        or data.get("stock")
    )


def update_inventory_stock(inventory_item_id, purchase_quantity):
    InventoryItem = get_first_model(
        "inventory",
        [
            "InventoryItem",
            "Inventory",
            "StockItem",
            "Ingredient",
            "RawMaterial",
        ],
    )

    if not InventoryItem:
        return None, Response(
            {"error": "Inventory item model not found"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not inventory_item_id:
        return None, Response(
            {"error": "Inventory item is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not purchase_quantity:
        return None, Response(
            {"error": "Quantity is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        purchase_quantity = Decimal(str(purchase_quantity))
    except Exception:
        return None, Response(
            {"error": "Invalid quantity"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if purchase_quantity <= 0:
        return None, Response(
            {"error": "Quantity must be greater than 0"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        item = InventoryItem.objects.get(id=inventory_item_id)
    except InventoryItem.DoesNotExist:
        return None, Response(
            {"error": "Inventory item not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    stock_field = get_stock_field(InventoryItem)

    if not stock_field:
        return None, Response(
            {"error": "Stock quantity field not found in inventory model"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    old_quantity = Decimal(str(getattr(item, stock_field) or 0))
    new_quantity = old_quantity + purchase_quantity

    setattr(item, stock_field, new_quantity)
    item.save()

    result = {
        "item_id": item.id,
        "item_name": get_item_name(item),
        "old_quantity": float(old_quantity),
        "purchased_quantity": float(purchase_quantity),
        "new_quantity": float(new_quantity),
        "unit": get_item_unit(item),
    }

    return result, None


# --------------------------------------------------
# Existing Purchase ViewSet
# URL example:
# /api/purchase/purchases/
# --------------------------------------------------

class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all().order_by("-id")
    serializer_class = PurchaseSerializer

    def perform_create(self, serializer):
        """
        If purchase is saved using normal Purchase API,
        inventory stock will also increase automatically.
        """
        with transaction.atomic():
            purchase = serializer.save()

            inventory_item = (
                getattr(purchase, "inventory_item", None)
                or getattr(purchase, "item", None)
                or getattr(purchase, "stock_item", None)
                or getattr(purchase, "ingredient", None)
                or getattr(purchase, "raw_material", None)
            )

            quantity = (
                getattr(purchase, "quantity", None)
                or getattr(purchase, "purchase_quantity", None)
                or getattr(purchase, "qty", None)
            )

            if inventory_item and quantity:
                update_inventory_stock(inventory_item.id, quantity)


# --------------------------------------------------
# Purchase Restock API
# URL:
# /api/purchase/restock/
# --------------------------------------------------

@api_view(["POST"])
def purchase_restock(request):
    """
    This API is used by frontend Purchase page.

    Example JSON:
    {
        "inventory_item": 5,
        "quantity": 20,
        "unit_price": 10,
        "vendor_name": "ABC Traders"
    }
    """

    inventory_item_id = get_inventory_item_id(request.data)
    purchase_quantity = get_purchase_quantity(request.data)

    with transaction.atomic():
        stock_result, error_response = update_inventory_stock(
            inventory_item_id,
            purchase_quantity,
        )

        if error_response:
            return error_response

        purchase_saved = False
        purchase_id = None

        try:
            serializer = PurchaseSerializer(data=request.data)

            if serializer.is_valid():
                purchase = serializer.save()
                purchase_saved = True
                purchase_id = purchase.id
        except Exception:
            purchase_saved = False

    return Response(
        {
            "message": "Purchase saved and inventory updated successfully",
            "purchase_saved": purchase_saved,
            "purchase_id": purchase_id,
            "stock_update": stock_result,
        },
        status=status.HTTP_200_OK,
    )