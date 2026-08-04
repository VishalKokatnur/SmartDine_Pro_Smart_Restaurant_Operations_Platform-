
from rest_framework import serializers
from . import models


MenuItem = models.MenuItem
RestaurantTable = models.RestaurantTable
Order = models.Order
Bill = models.Bill
Customer = models.Customer
WaiterCall = models.WaiterCall


OrderItem = (
    getattr(models, "OrderItem", None)
    or getattr(models, "OrderItems", None)
    or getattr(models, "RestaurantOrderItem", None)
    or getattr(models, "OrderMenuItem", None)
)


BillItem = (
    getattr(models, "BillItem", None)
    or getattr(models, "BillItems", None)
    or getattr(models, "RestaurantBillItem", None)
)


def read_value(obj, *names):
    for name in names:
        try:
            if isinstance(obj, dict):
                value = obj.get(name)
            else:
                value = getattr(obj, name, None)

            if value is not None and value != "":
                return value

        except Exception:
            pass

    return None


def to_float(value):
    try:
        return float(value)
    except Exception:
        return 0.0


def to_int(value):
    try:
        return int(value)
    except Exception:
        return 1


def has_data(data):
    try:
        if data is None:
            return False

        if hasattr(data, "exists"):
            return data.exists()

        return len(data) > 0

    except Exception:
        try:
            return bool(data)
        except Exception:
            return False


def get_related_list(obj, *related_names):
    for related_name in related_names:
        try:
            relation = getattr(obj, related_name, None)

            if relation is None:
                continue

            if hasattr(relation, "all"):
                data = relation.all()
            else:
                data = relation

            if has_data(data):
                return data

        except Exception:
            pass

    return []


def get_order_items(order):
    if not order:
        return []

    related_items = get_related_list(
        order,
        "items",
        "order_items",
        "orderitem_set",
        "orderitems_set",
        "order_menu_items",
        "ordermenuitem_set",
    )

    if has_data(related_items):
        return related_items

    if OrderItem:
        try:
            items = OrderItem.objects.filter(order=order)

            if items.exists():
                return items

        except Exception:
            pass

    return []


def get_bill_items(bill):
    if not bill:
        return []

    related_items = get_related_list(
        bill,
        "items",
        "bill_items",
        "billitem_set",
        "billitems_set",
    )

    if has_data(related_items):
        return related_items

    if BillItem:
        try:
            items = BillItem.objects.filter(bill=bill)

            if items.exists():
                return items

        except Exception:
            pass

    order = read_value(bill, "order")

    if order:
        return get_order_items(order)

    return []


class MenuItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = MenuItem
        fields = "__all__"


class RestaurantTableSerializer(serializers.ModelSerializer):

    class Meta:
        model = RestaurantTable
        fields = "__all__"


class CustomerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Customer
        fields = "__all__"


class OrderItemSerializer(serializers.Serializer):

    id = serializers.SerializerMethodField()
    item_name = serializers.SerializerMethodField()
    quantity = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    def get_id(self, obj):
        return read_value(obj, "id", "pk")

    def get_item_name(self, obj):

        direct_name = read_value(
            obj,
            "item_name",
            "menu_item_name",
            "product_name",
            "name",
            "title",
        )

        if direct_name:
            return direct_name

        related_item = read_value(
            obj,
            "menu_item",
            "item",
            "product",
            "menu",
        )

        if related_item:

            related_name = read_value(
                related_item,
                "name",
                "title",
                "item_name",
            )

            if related_name:
                return related_name

        return "Item"

    def get_quantity(self, obj):

        quantity = read_value(
            obj,
            "quantity",
            "qty",
            "count",
            "no_of_items",
        )

        if quantity is not None:
            return to_int(quantity)

        return 1

    def get_price(self, obj):

        price = read_value(
            obj,
            "price",
            "rate",
            "unit_price",
            "menu_item_price",
            "selling_price",
        )

        if price is not None:
            return to_float(price)

        related_item = read_value(
            obj,
            "menu_item",
            "item",
            "product",
            "menu",
        )

        if related_item:

            related_price = read_value(
                related_item,
                "price",
                "rate",
                "unit_price",
                "selling_price",
            )

            if related_price is not None:
                return to_float(related_price)

        return 0.0

    def get_subtotal(self, obj):

        subtotal = read_value(
            obj,
            "subtotal",
            "sub_total",
            "total",
            "item_total",
            "amount",
        )

        if subtotal is not None:
            return to_float(subtotal)

        quantity = self.get_quantity(obj)
        price = self.get_price(obj)

        return round(price * quantity, 2)


class OrderSerializer(serializers.ModelSerializer):

    item_details = serializers.SerializerMethodField()
    table_name = serializers.SerializerMethodField()
    customer_name_display = serializers.SerializerMethodField()
    customer_phone_display = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = "__all__"

    def get_item_details(self, obj):

        items = get_order_items(obj)

        return OrderItemSerializer(
            items,
            many=True
        ).data

    def get_table_name(self, obj):

        table = read_value(obj, "table")

        if table:

            table_number = read_value(
                table,
                "table_number",
                "number",
                "name",
            )

            if table_number:
                return f"Table {table_number}"

            return str(table)

        return "-"

    def get_customer_name_display(self, obj):

        customer_name = read_value(
            obj,
            "customer_name",
            "name",
        )

        if customer_name:
            return customer_name

        customer = read_value(obj, "customer")

        if customer:

            customer_name = read_value(
                customer,
                "name",
                "customer_name",
            )

            if customer_name:
                return customer_name

        return "-"

    def get_customer_phone_display(self, obj):

        phone = read_value(
            obj,
            "phone",
            "customer_phone",
            "mobile",
        )

        if phone:
            return phone

        customer = read_value(obj, "customer")

        if customer:

            phone = read_value(
                customer,
                "phone",
                "mobile",
                "customer_phone",
            )

            if phone:
                return phone

        return "-"


class KitchenOrderSerializer(serializers.ModelSerializer):

    item_details = serializers.SerializerMethodField()
    table_name = serializers.SerializerMethodField()
    customer_name_display = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = "__all__"

    def get_item_details(self, obj):

        items = get_order_items(obj)

        return OrderItemSerializer(
            items,
            many=True
        ).data

    def get_table_name(self, obj):

        table = read_value(obj, "table")

        if table:

            table_number = read_value(
                table,
                "table_number",
                "number",
                "name",
            )

            if table_number:
                return f"Table {table_number}"

            return str(table)

        return "-"

    def get_customer_name_display(self, obj):

        customer_name = read_value(
            obj,
            "customer_name",
            "name",
        )

        if customer_name:
            return customer_name

        customer = read_value(obj, "customer")

        if customer:

            customer_name = read_value(
                customer,
                "name",
                "customer_name",
            )

            if customer_name:
                return customer_name

        return "-"


class BillSerializer(serializers.ModelSerializer):

    class Meta:
        model = Bill
        fields = "__all__"


class BillHistorySerializer(serializers.ModelSerializer):

    bill_number = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    table_name = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()

    class Meta:
        model = Bill

        fields = [
            "id",
            "bill_number",
            "order",
            "customer_name",
            "phone",
            "table_name",
            "total_amount",
            "discount",
            "tax_amount",
            "final_amount",
            "payment_method",
            "payment_status",
            "created_at",
            "items",
        ]

    def get_bill_number(self, obj):

        bill_number = read_value(
            obj,
            "bill_number",
            "invoice_number",
        )

        if bill_number:
            return bill_number

        return obj.id

    def get_customer_name(self, obj):

        customer_name = read_value(
            obj,
            "customer_name",
            "name",
        )

        if customer_name:
            return customer_name

        customer = read_value(obj, "customer")

        if customer:

            customer_name = read_value(
                customer,
                "name",
                "customer_name",
            )

            if customer_name:
                return customer_name

        order = read_value(obj, "order")

        if order:

            customer_name = read_value(
                order,
                "customer_name",
                "name",
            )

            if customer_name:
                return customer_name

            order_customer = read_value(
                order,
                "customer",
            )

            if order_customer:

                customer_name = read_value(
                    order_customer,
                    "name",
                    "customer_name",
                )

                if customer_name:
                    return customer_name

        return "-"

    def get_phone(self, obj):

        phone = read_value(
            obj,
            "phone",
            "customer_phone",
            "mobile",
        )

        if phone:
            return phone

        customer = read_value(obj, "customer")

        if customer:

            phone = read_value(
                customer,
                "phone",
                "mobile",
                "customer_phone",
            )

            if phone:
                return phone

        order = read_value(obj, "order")

        if order:

            phone = read_value(
                order,
                "phone",
                "customer_phone",
                "mobile",
            )

            if phone:
                return phone

            order_customer = read_value(
                order,
                "customer",
            )

            if order_customer:

                phone = read_value(
                    order_customer,
                    "phone",
                    "mobile",
                    "customer_phone",
                )

                if phone:
                    return phone

        return "-"

    def get_table_name(self, obj):

        order = read_value(
            obj,
            "order",
        )

        if order:

            table = read_value(
                order,
                "table",
            )

            if table:

                table_number = read_value(
                    table,
                    "table_number",
                    "number",
                    "name",
                )

                if table_number:
                    return f"Table {table_number}"

                return str(table)

        return "-"

    def get_items(self, obj):

        items = get_bill_items(obj)

        return OrderItemSerializer(
            items,
            many=True
        ).data


class WaiterCallSerializer(serializers.ModelSerializer):

    table_name = serializers.SerializerMethodField()

    class Meta:
        model = WaiterCall
        fields = "__all__"

    def get_table_name(self, obj):

        table = read_value(
            obj,
            "table",
        )

        if table:

            table_number = read_value(
                table,
                "table_number",
                "number",
                "name",
            )

            if table_number:
                return f"Table {table_number}"

        return "-"


class PublicMenuItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "name",
            "category",
            "price",
            "available",
        ]