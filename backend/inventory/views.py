from rest_framework import viewsets, serializers, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.apps import apps


# --------------------------------------------------
# Safe model finder
# --------------------------------------------------

def get_model_safe(app_name, model_name):
    try:
        return apps.get_model(app_name, model_name)
    except LookupError:
        return None


def get_first_model(app_name, model_names):
    for model_name in model_names:
        model = get_model_safe(app_name, model_name)
        if model:
            return model
    return None


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

RecipeItem = get_first_model(
    "inventory",
    [
        "RecipeItem",
        "Recipe",
        "MenuRecipeItem",
        "MenuIngredient",
    ],
)

MenuItem = get_first_model(
    "restaurant",
    [
        "MenuItem",
        "FoodItem",
        "Product",
    ],
)


# --------------------------------------------------
# Safe serializer imports
# --------------------------------------------------

try:
    from .serializers import InventoryItemSerializer
except Exception:
    InventoryItemSerializer = None

try:
    from .serializers import RecipeItemSerializer
except Exception:
    RecipeItemSerializer = None


# --------------------------------------------------
# Fallback serializers
# --------------------------------------------------

if InventoryItem and InventoryItemSerializer is None:
    class InventoryItemSerializer(serializers.ModelSerializer):
        class Meta:
            model = InventoryItem
            fields = "__all__"


if RecipeItem and RecipeItemSerializer is None:
    class RecipeItemSerializer(serializers.ModelSerializer):
        class Meta:
            model = RecipeItem
            fields = "__all__"


# --------------------------------------------------
# Helper functions
# --------------------------------------------------

def read_value(obj, field_names, default=None):
    for field_name in field_names:
        try:
            value = getattr(obj, field_name, None)

            if value is not None and value != "":
                return value
        except Exception:
            pass

    return default


def to_float(value):
    try:
        return float(value)
    except Exception:
        return 0.0


def get_stock_field(model):
    possible_fields = [
        "quantity",
        "stock",
        "current_stock",
        "available_stock",
        "qty",
        "current_quantity",
    ]

    model_fields = [field.name for field in model._meta.fields]

    for field in possible_fields:
        if field in model_fields:
            return field

    return None


def get_item_name(item):
    return read_value(
        item,
        [
            "name",
            "item_name",
            "ingredient_name",
            "material_name",
            "title",
        ],
        "Item",
    )


def get_item_unit(item):
    return read_value(
        item,
        [
            "unit",
            "unit_name",
            "measurement_unit",
        ],
        "",
    )


def get_item_quantity(item):
    return read_value(
        item,
        [
            "quantity",
            "stock",
            "current_stock",
            "available_stock",
            "qty",
            "current_quantity",
        ],
        0,
    )


def get_item_low_limit(item):
    minimum_stock = read_value(
        item,
        [
            "low_limit",
            "low_stock_limit",
            "low_stock",
            "minimum_stock",
            "min_stock",
            "reorder_level",
            "low_stock_level",
            "alert_quantity",
            "minimum_quantity",
            "min_quantity",
            "minimum_level",
            "threshold",
            "stock_limit",
            "limit",
        ],
        None,
    )

    if minimum_stock is not None:
        return minimum_stock

    # Auto-detect low limit field if exact name is different
    try:
        for field in item._meta.fields:
            field_name = field.name.lower()

            if field_name in [
                "id",
                "price",
                "purchase_price",
                "selling_price",
                "created_at",
                "updated_at",
            ]:
                continue

            if (
                "low" in field_name
                or "min" in field_name
                or "limit" in field_name
                or "alert" in field_name
                or "reorder" in field_name
                or "threshold" in field_name
            ):
                value = getattr(item, field.name, None)

                if value is not None and value != "":
                    return value
    except Exception:
        pass

    return 10


def get_menu_item_from_recipe(recipe):
    return read_value(
        recipe,
        [
            "menu_item",
            "menu",
            "food_item",
            "product",
        ],
        None,
    )


def get_inventory_item_from_recipe(recipe):
    return read_value(
        recipe,
        [
            "inventory_item",
            "ingredient",
            "raw_material",
            "stock_item",
            "item",
        ],
        None,
    )


def get_required_quantity_from_recipe(recipe):
    return read_value(
        recipe,
        [
            "quantity",
            "required_quantity",
            "qty",
            "usage_quantity",
            "amount",
        ],
        0,
    )


def get_recipe_items_for_menu(menu_item_id):
    if not RecipeItem:
        return []

    all_recipes = RecipeItem.objects.all()
    matched_recipes = []

    for recipe in all_recipes:
        recipe_menu_item = get_menu_item_from_recipe(recipe)

        if recipe_menu_item and str(recipe_menu_item.id) == str(menu_item_id):
            matched_recipes.append(recipe)

    return matched_recipes


# --------------------------------------------------
# Inventory Item API
# URL: /api/inventory/items/
# --------------------------------------------------

class InventoryItemViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryItemSerializer

    def get_queryset(self):
        if InventoryItem:
            return InventoryItem.objects.all().order_by("-id")
        return []


# --------------------------------------------------
# Recipe Item API
# URL: /api/inventory/recipe-items/
# --------------------------------------------------

class RecipeItemViewSet(viewsets.ModelViewSet):
    serializer_class = RecipeItemSerializer

    def get_queryset(self):
        if RecipeItem:
            return RecipeItem.objects.all().order_by("-id")
        return []


# --------------------------------------------------
# Extra aliases to avoid import errors
# --------------------------------------------------

InventoryViewSet = InventoryItemViewSet
StockItemViewSet = InventoryItemViewSet
IngredientViewSet = InventoryItemViewSet
RecipeViewSet = RecipeItemViewSet


# --------------------------------------------------
# Low Stock Alert API
# URL: /api/inventory/low-stock/
# --------------------------------------------------

@api_view(["GET"])
def low_stock_items(request):
    if not InventoryItem:
        return Response([])

    items = InventoryItem.objects.all().order_by("id")
    low_stock_list = []

    for item in items:
        name = get_item_name(item)
        quantity = get_item_quantity(item)
        unit = get_item_unit(item)
        minimum_stock = get_item_low_limit(item)

        quantity_value = to_float(quantity)
        minimum_stock_value = to_float(minimum_stock)

        if quantity_value <= 0:
            item_status = "Out of Stock"
        elif quantity_value <= minimum_stock_value:
            item_status = "Low Stock"
        else:
            item_status = "Available"

        if item_status in ["Low Stock", "Out of Stock"]:
            low_stock_list.append(
                {
                    "id": item.id,
                    "name": name,
                    "quantity": quantity_value,
                    "unit": unit,
                    "minimum_stock": minimum_stock_value,
                    "status": item_status,
                }
            )

    return Response(low_stock_list)


# --------------------------------------------------
# Recipe Stock Check API
# URL: /api/inventory/check-stock/
# --------------------------------------------------

@api_view(["POST"])
def check_recipe_stock(request):
    menu_item_id = request.data.get("menu_item")
    order_quantity = request.data.get("quantity", 1)

    if not menu_item_id:
        return Response(
            {
                "available": False,
                "message": "Menu item is required",
                "missing_items": [],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        order_quantity = float(order_quantity)
    except Exception:
        order_quantity = 1

    if order_quantity <= 0:
        return Response(
            {
                "available": False,
                "message": "Quantity must be greater than 0",
                "missing_items": [],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not RecipeItem:
        return Response(
            {
                "available": False,
                "message": "Recipe model not found. Please configure recipe module first.",
                "missing_items": [],
            }
        )

    recipe_items = get_recipe_items_for_menu(menu_item_id)

    if len(recipe_items) == 0:
        return Response(
            {
                "available": False,
                "message": "Recipe is not configured for this menu item. Please add recipe ingredients first.",
                "missing_items": [],
            }
        )

    missing_items = []

    for recipe in recipe_items:
        inventory_item = get_inventory_item_from_recipe(recipe)

        if not inventory_item:
            missing_items.append(
                {
                    "name": "Unknown Ingredient",
                    "required": 0,
                    "available": 0,
                    "unit": "",
                    "message": "Inventory item not linked with recipe",
                }
            )
            continue

        required_per_item = to_float(get_required_quantity_from_recipe(recipe))
        total_required = required_per_item * order_quantity

        stock_field = get_stock_field(inventory_item.__class__)

        if not stock_field:
            available_quantity = 0
        else:
            available_quantity = to_float(getattr(inventory_item, stock_field, 0))

        if available_quantity < total_required:
            missing_items.append(
                {
                    "id": inventory_item.id,
                    "name": get_item_name(inventory_item),
                    "required": total_required,
                    "available": available_quantity,
                    "unit": get_item_unit(inventory_item),
                }
            )

    if len(missing_items) > 0:
        return Response(
            {
                "available": False,
                "message": "Not enough stock for this menu item",
                "missing_items": missing_items,
            }
        )

    return Response(
        {
            "available": True,
            "message": "Stock available",
            "missing_items": [],
        }
    )