from decimal import Decimal, InvalidOperation

from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from django.db import transaction
from django.apps import apps
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as http_status

from .models import (
    MenuItem,
    RestaurantTable,
    Order,
    Bill,
    Customer,
    WaiterCall,
)

from .serializers import (
    MenuItemSerializer,
    RestaurantTableSerializer,
    OrderSerializer,
    KitchenOrderSerializer,
    BillSerializer,
    BillHistorySerializer,
    CustomerSerializer,
    WaiterCallSerializer,
    PublicMenuItemSerializer,
)

# --------------------------------------------------
# Order Status Rules
# --------------------------------------------------

KITCHEN_ACTIVE_STATUSES = ["Pending", "Preparing", "Ready"]
BILLING_STATUS = "Served"

ACTIVE_ORDER_STATUSES = ["Pending", "Preparing", "Ready", "Served"]
INACTIVE_ORDER_STATUSES = ["Billed", "Cancelled"]


# --------------------------------------------------
# Safe Helpers
# --------------------------------------------------

def decimal_value(value):
    try:
        return Decimal(str(value or 0))
    except (InvalidOperation, TypeError, ValueError):
        return Decimal("0")


def get_model_safe(app_label, model_name):
    try:
        return apps.get_model(app_label, model_name)
    except LookupError:
        return None


def set_table_status(table, status):
    if table and hasattr(table, "status"):
        table.status = status
        table.save()


def get_order_table(order):
    if order and hasattr(order, "table"):
        return order.table
    return None


# --------------------------------------------------
# Table Status Helpers
# --------------------------------------------------

def table_has_active_order(table, exclude_order_id=None):
    if not table:
        return False

    active_orders = Order.objects.filter(
        table=table,
        status__in=ACTIVE_ORDER_STATUSES,
    )

    if exclude_order_id:
        active_orders = active_orders.exclude(id=exclude_order_id)

    return active_orders.exists()


def table_has_served_order(table):
    if not table:
        return False

    return Order.objects.filter(
        table=table,
        status="Served",
    ).exists()


def table_has_kitchen_active_order(table):
    if not table:
        return False

    return Order.objects.filter(
        table=table,
        status__in=KITCHEN_ACTIVE_STATUSES,
    ).exists()


def sync_all_table_statuses():
    """
    Professional table flow:

    Pending / Preparing / Ready -> Occupied
    Served -> Billing
    Billed / Cancelled -> Available

    Reserved and Cleaning are not auto-changed unless active order exists.
    """

    tables = RestaurantTable.objects.all()

    for table in tables:
        has_served_order = table_has_served_order(table)
        has_kitchen_order = table_has_kitchen_active_order(table)
        has_active_order = table_has_active_order(table)

        if has_served_order:
            if table.status != "Billing":
                table.status = "Billing"
                table.save()

        elif has_kitchen_order:
            if table.status != "Occupied":
                table.status = "Occupied"
                table.save()

        elif has_active_order:
            if table.status != "Occupied":
                table.status = "Occupied"
                table.save()

        else:
            if table.status not in ["Reserved", "Cleaning"]:
                if table.status != "Available":
                    table.status = "Available"
                    table.save()


def update_table_status_by_order(order):
    table = get_order_table(order)

    if not table:
        return

    if order.status in KITCHEN_ACTIVE_STATUSES:
        set_table_status(table, "Occupied")

    elif order.status == "Served":
        set_table_status(table, "Billing")

    else:
        set_table_status(table, "Available")


def validate_table_for_new_order(table):
    if not table:
        raise ValidationError({"table": "Please select a table."})

    sync_all_table_statuses()
    table.refresh_from_db()

    if table.status != "Available":
        raise ValidationError(
            {
                "table": f"Table {table.table_number} is {table.status}. Please select an available table."
            }
        )

    if table_has_active_order(table):
        raise ValidationError(
            {
                "table": f"Table {table.table_number} already has an active order."
            }
        )


# --------------------------------------------------
# Stock Deduction Helpers
# --------------------------------------------------

def get_stock_field_name(inventory_item):
    """
    Supports different inventory field names.
    Your project mostly uses quantity.
    """

    possible_fields = [
        "quantity",
        "stock",
        "current_stock",
        "available_stock",
    ]

    for field_name in possible_fields:
        try:
            inventory_item._meta.get_field(field_name)
            return field_name
        except Exception:
            pass

    return None


def get_inventory_stock(inventory_item):
    stock_field = get_stock_field_name(inventory_item)

    if not stock_field:
        raise ValidationError(
            {
                "stock": f"No stock field found for inventory item {inventory_item}."
            }
        )

    return decimal_value(getattr(inventory_item, stock_field)), stock_field


def cast_stock_value(inventory_item, stock_field, value):
    """
    Cast stock value based on Django model field type.
    """

    try:
        field = inventory_item._meta.get_field(stock_field)
        field_type = field.get_internal_type()
    except Exception:
        return value

    if field_type in [
        "IntegerField",
        "PositiveIntegerField",
        "PositiveSmallIntegerField",
        "SmallIntegerField",
        "BigIntegerField",
    ]:
        return int(value)

    if field_type == "FloatField":
        return float(value)

    return value


def get_recipe_quantity(recipe):
    """
    Your backend uses quantity_used.
    Other names are kept for safety.
    """

    quantity = (
        getattr(recipe, "quantity_used", None)
        or getattr(recipe, "quantity_required", None)
        or getattr(recipe, "required_quantity", None)
        or getattr(recipe, "quantity", None)
        or 0
    )

    return decimal_value(quantity)


def get_order_menu_items(order):
    """
    Gets menu items from order.
    Current project uses order.items ManyToMany.
    """

    if hasattr(order, "items"):
        try:
            return list(order.items.all())
        except Exception:
            return []

    if hasattr(order, "menu_items"):
        try:
            return list(order.menu_items.all())
        except Exception:
            return []

    return []


def deduct_stock_for_order(order):
    """
    Deduct recipe ingredients from inventory after bill is saved.

    Example:
    Idli recipe:
    Rice = 1

    Current Rice stock = 20
    Bill saved for 1 Idli
    New Rice stock = 19
    """

    RecipeItem = get_model_safe("inventory", "RecipeItem")

    if RecipeItem is None:
        raise ValidationError(
            {
                "stock": "RecipeItem model not found. Please check inventory app."
            }
        )

    menu_items = get_order_menu_items(order)

    if not menu_items:
        raise ValidationError(
            {
                "stock": f"Order #{order.id} has no menu items. Stock cannot be deducted."
            }
        )

    # Count menu item quantity
    # If one order has Idli once, count = 1
    # If future quantity system is added, this can be expanded.
    menu_counts = {}

    for menu_item in menu_items:
        menu_id = menu_item.id

        if menu_id not in menu_counts:
            menu_counts[menu_id] = {
                "menu_item": menu_item,
                "count": Decimal("0"),
            }

        menu_counts[menu_id]["count"] += Decimal("1")

    deduction_plan = []
    errors = []

    for data in menu_counts.values():
        menu_item = data["menu_item"]
        ordered_count = data["count"]

        recipes = list(
            RecipeItem.objects.select_related("inventory_item").filter(
                menu_item=menu_item
            )
        )

        if not recipes:
            errors.append(
                f"{menu_item.name}: Recipe is not configured. Please add recipe ingredients first."
            )
            continue

        for recipe in recipes:
            inventory_item = getattr(recipe, "inventory_item", None)

            if not inventory_item:
                errors.append(
                    f"{menu_item.name}: Recipe ingredient is missing inventory item."
                )
                continue

            quantity_used = get_recipe_quantity(recipe)

            if quantity_used <= 0:
                errors.append(
                    f"{menu_item.name} → {inventory_item.name}: Quantity used must be greater than 0."
                )
                continue

            required_quantity = quantity_used * ordered_count

            try:
                current_stock, stock_field = get_inventory_stock(inventory_item)
            except ValidationError as exc:
                errors.append(str(exc.detail))
                continue

            if current_stock < required_quantity:
                unit = getattr(inventory_item, "unit", "")
                errors.append(
                    f"{inventory_item.name}: Required {required_quantity} {unit}, Available {current_stock} {unit}."
                )
                continue

            deduction_plan.append(
                {
                    "inventory_item": inventory_item,
                    "stock_field": stock_field,
                    "required_quantity": required_quantity,
                }
            )

    if errors:
        raise ValidationError({"stock": errors})

    # Combine same inventory item deduction
    combined_deductions = {}

    for item in deduction_plan:
        inventory_item = item["inventory_item"]
        stock_field = item["stock_field"]
        required_quantity = item["required_quantity"]

        key = f"{inventory_item.__class__.__name__}_{inventory_item.id}_{stock_field}"

        if key not in combined_deductions:
            combined_deductions[key] = {
                "inventory_item": inventory_item,
                "stock_field": stock_field,
                "required_quantity": Decimal("0"),
            }

        combined_deductions[key]["required_quantity"] += required_quantity

    # Final stock check with row lock
    final_errors = []

    for item in combined_deductions.values():
        inventory_item = item["inventory_item"]
        stock_field = item["stock_field"]
        required_quantity = item["required_quantity"]

        locked_inventory_item = inventory_item.__class__.objects.select_for_update().get(
            id=inventory_item.id
        )

        current_stock, stock_field = get_inventory_stock(locked_inventory_item)

        if current_stock < required_quantity:
            unit = getattr(locked_inventory_item, "unit", "")
            final_errors.append(
                f"{locked_inventory_item.name}: Required {required_quantity} {unit}, Available {current_stock} {unit}."
            )

    if final_errors:
        raise ValidationError({"stock": final_errors})

    # Deduct stock
    for item in combined_deductions.values():
        inventory_item = item["inventory_item"]
        required_quantity = item["required_quantity"]

        locked_inventory_item = inventory_item.__class__.objects.select_for_update().get(
            id=inventory_item.id
        )

        current_stock, stock_field = get_inventory_stock(locked_inventory_item)

        new_stock = current_stock - required_quantity

        setattr(
            locked_inventory_item,
            stock_field,
            cast_stock_value(locked_inventory_item, stock_field, new_stock),
        )

        locked_inventory_item.save(update_fields=[stock_field])


# --------------------------------------------------
# Billing Validation
# --------------------------------------------------

def validate_order_for_billing(order):
    if not order:
        raise ValidationError({"order": "Order is required."})

    if Bill.objects.filter(order=order).exists():
        raise ValidationError(
            {
                "order": f"Order #{order.id} already has a bill. Please print old bill from Bill History."
            }
        )

    if order.status == "Cancelled":
        raise ValidationError(
            {
                "order": f"Order #{order.id} is Cancelled. Billing is not allowed."
            }
        )

    if order.status == "Billed":
        raise ValidationError(
            {
                "order": f"Order #{order.id} is already Billed."
            }
        )

    if order.status != "Served":
        raise ValidationError(
            {
                "order": f"Order #{order.id} must be Served before billing."
            }
        )


# --------------------------------------------------
# Menu Items
# --------------------------------------------------

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all().order_by("-id")
    serializer_class = MenuItemSerializer


# --------------------------------------------------
# Tables
# --------------------------------------------------

class RestaurantTableViewSet(viewsets.ModelViewSet):
    serializer_class = RestaurantTableSerializer

    def get_queryset(self):
        sync_all_table_statuses()
        return RestaurantTable.objects.all().order_by("id")

    def perform_update(self, serializer):
        table = self.get_object()
        new_status = serializer.validated_data.get("status", table.status)

        if new_status == "Available":
            if table_has_active_order(table):
                raise ValidationError(
                    {
                        "status": f"Table {table.table_number} has an active order. Complete bill or cancel order first."
                    }
                )

        serializer.save()
        sync_all_table_statuses()

    def perform_destroy(self, instance):
        if table_has_active_order(instance):
            raise ValidationError(
                {
                    "status": f"Table {instance.table_number} has an active order. Complete bill or cancel order first."
                }
            )

        instance.delete()
        sync_all_table_statuses()


# --------------------------------------------------
# Orders
# --------------------------------------------------

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        sync_all_table_statuses()
        return Order.objects.all().order_by("-id")

    def perform_create(self, serializer):
        with transaction.atomic():
            table = serializer.validated_data.get("table")

            validate_table_for_new_order(table)

            # New orders must always start as Pending
            order = serializer.save(status="Pending")

            update_table_status_by_order(order)
            sync_all_table_statuses()

    def perform_update(self, serializer):
        with transaction.atomic():
            old_order = self.get_object()
            old_table = old_order.table

            if old_order.status == "Billed":
                raise ValidationError(
                    {
                        "status": "Billed order cannot be edited."
                    }
                )

            new_table = serializer.validated_data.get("table", old_table)
            new_status = serializer.validated_data.get("status", old_order.status)

            if new_status == "Billed":
                raise ValidationError(
                    {
                        "status": "Use Billing page to mark order as Billed."
                    }
                )

            if old_table.id != new_table.id:
                validate_table_for_new_order(new_table)

            order = serializer.save(status=new_status)

            if old_table.id != order.table.id:
                set_table_status(old_table, "Available")

            update_table_status_by_order(order)
            sync_all_table_statuses()

    def perform_destroy(self, instance):
        with transaction.atomic():
            table = instance.table

            if instance.status == "Billed":
                raise ValidationError(
                    {
                        "order": "Billed order cannot be deleted."
                    }
                )

            instance.delete()
            set_table_status(table, "Available")
            sync_all_table_statuses()


# --------------------------------------------------
# Kitchen Orders
# Chef Flow:
# Pending -> Preparing -> Ready
# --------------------------------------------------

class KitchenOrderViewSet(viewsets.ModelViewSet):
    serializer_class = KitchenOrderSerializer

    def get_queryset(self):
        sync_all_table_statuses()

        return Order.objects.filter(
            status__in=["Pending", "Preparing", "Ready"]
        ).order_by("-id")

    def perform_update(self, serializer):
        with transaction.atomic():
            old_order = self.get_object()
            old_status = old_order.status
            new_status = serializer.validated_data.get("status", old_status)

            allowed_flow = {
                "Pending": ["Preparing", "Cancelled"],
                "Preparing": ["Ready", "Cancelled"],
                "Ready": ["Ready"],
                "Served": ["Served"],
                "Billed": ["Billed"],
                "Cancelled": ["Cancelled"],
            }

            if new_status not in allowed_flow.get(old_status, []):
                raise ValidationError(
                    {
                        "status": f"Invalid kitchen flow: {old_status} cannot be changed to {new_status}."
                    }
                )

            order = serializer.save(status=new_status)

            update_table_status_by_order(order)
            sync_all_table_statuses()


# --------------------------------------------------
# Bills
# --------------------------------------------------

class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all().order_by("-created_at")
    serializer_class = BillSerializer

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return BillHistorySerializer

        return BillSerializer

    def get_queryset(self):
        sync_all_table_statuses()

        queryset = Bill.objects.all().order_by("-created_at")

        search = self.request.query_params.get("search", "").strip()
        payment_method = self.request.query_params.get("payment_method", "").strip()
        date = self.request.query_params.get("date", "").strip()

        if search:
            search_query = Q(id__icontains=search) | Q(order__id__icontains=search)

            bill_fields = [field.name for field in Bill._meta.get_fields()]
            order_fields = [field.name for field in Order._meta.get_fields()]

            if "bill_number" in bill_fields:
                search_query |= Q(bill_number__icontains=search)

            if "customer_name" in bill_fields:
                search_query |= Q(customer_name__icontains=search)

            if "phone" in bill_fields:
                search_query |= Q(phone__icontains=search)

            if "customer_name" in order_fields:
                search_query |= Q(order__customer_name__icontains=search)

            if "phone" in order_fields:
                search_query |= Q(order__phone__icontains=search)

            if "customer_phone" in order_fields:
                search_query |= Q(order__customer_phone__icontains=search)

            if "customer" in order_fields:
                search_query |= (
                    Q(order__customer__name__icontains=search)
                    | Q(order__customer__phone__icontains=search)
                )

            queryset = queryset.filter(search_query)

        if payment_method:
            queryset = queryset.filter(payment_method__iexact=payment_method)

        if date:
            queryset = queryset.filter(created_at__date=date)

        return queryset

    def perform_create(self, serializer):
        with transaction.atomic():
            order = serializer.validated_data.get("order")

            validate_order_for_billing(order)

            # Important:
            # Stock deduction happens only when bill is saved.
            # If stock is not enough, bill will not be created.
            deduct_stock_for_order(order)

            bill = serializer.save(payment_status="Paid")

            order.status = "Billed"
            order.save()

            set_table_status(order.table, "Available")
            sync_all_table_statuses()

    def perform_update(self, serializer):
        with transaction.atomic():
            # Updating bill should not deduct stock again.
            bill = serializer.save()

            order = getattr(bill, "order", None)

            if order:
                order.status = "Billed"
                order.save()
                set_table_status(order.table, "Available")

            sync_all_table_statuses()


# --------------------------------------------------
# Customers
# --------------------------------------------------

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by("-id")
    serializer_class = CustomerSerializer


# --------------------------------------------------
# Waiter Calls (staff-facing)
# --------------------------------------------------


class WaiterCallViewSet(viewsets.ModelViewSet):
    serializer_class = WaiterCallSerializer

    def get_queryset(self):
        return WaiterCall.objects.all().order_by("-created_at")


# --------------------------------------------------
# Public Customer QR Ordering
# No authentication required. These endpoints power
# the customer-facing menu opened by scanning a table QR.
# --------------------------------------------------


class PublicMenuListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        items = MenuItem.objects.filter(available=True).order_by("category", "name")
        serializer = PublicMenuItemSerializer(items, many=True)
        return Response(serializer.data)


class PublicTableDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, table_id):
        try:
            table = RestaurantTable.objects.get(id=table_id)
        except RestaurantTable.DoesNotExist:
            return Response(
                {"detail": "Table not found."},
                status=http_status.HTTP_404_NOT_FOUND,
            )

        if table.status == "Cleaning":
            return Response(
                {"detail": "This table is being cleaned. Please ask staff for assistance."},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "id": table.id,
                "table_number": table.table_number,
                "capacity": table.capacity,
                "status": table.status,
            }
        )


class PublicOrderCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        table_id = request.data.get("table")
        item_ids = request.data.get("items", [])

        if not table_id:
            return Response(
                {"table": "Table is required."},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        if not item_ids or not isinstance(item_ids, list):
            return Response(
                {"items": "Please select at least one item."},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        try:
            table = RestaurantTable.objects.get(id=table_id)
        except RestaurantTable.DoesNotExist:
            return Response(
                {"table": "Table not found."},
                status=http_status.HTTP_404_NOT_FOUND,
            )

        if table.status == "Cleaning":
            return Response(
                {"table": "This table is being cleaned. Please ask staff for assistance."},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        valid_items = list(MenuItem.objects.filter(id__in=item_ids, available=True))

        if not valid_items:
            return Response(
                {"items": "Selected items are not available."},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            existing_order = Order.objects.filter(
                table=table,
                status__in=KITCHEN_ACTIVE_STATUSES,
            ).first()

            if existing_order:
                existing_order.items.add(*valid_items)
                order = existing_order
            else:
                order = Order.objects.create(table=table, status="Pending")
                order.items.add(*valid_items)

            set_table_status(table, "Occupied")
            sync_all_table_statuses()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=http_status.HTTP_201_CREATED)


class PublicOrderStatusView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, table_id):
        order = (
            Order.objects.filter(
                table_id=table_id,
                status__in=["Pending", "Preparing", "Ready", "Served"],
            )
            .order_by("-id")
            .first()
        )

        if not order:
            return Response({"order": None})

        serializer = OrderSerializer(order)
        return Response({"order": serializer.data})


class PublicWaiterCallCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        table_id = request.data.get("table")
        request_type = request.data.get("request_type", "Waiter")

        if not table_id:
            return Response(
                {"table": "Table is required."},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        try:
            table = RestaurantTable.objects.get(id=table_id)
        except RestaurantTable.DoesNotExist:
            return Response(
                {"table": "Table not found."},
                status=http_status.HTTP_404_NOT_FOUND,
            )

        call = WaiterCall.objects.create(
            table=table,
            request_type=request_type,
            status="Pending",
        )

        serializer = WaiterCallSerializer(call)
        return Response(serializer.data, status=http_status.HTTP_201_CREATED)