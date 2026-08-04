# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from django.apps import apps
# from django.db.models import Sum, Count
# from django.db.models.functions import TruncDate
# from django.utils import timezone


# def get_model_safe(app_name, model_name):
#     try:
#         return apps.get_model(app_name, model_name)
#     except LookupError:
#         return None


# def has_field(model, field_name):
#     if not model:
#         return False

#     try:
#         model._meta.get_field(field_name)
#         return True
#     except Exception:
#         return False


# def money(value):
#     if value is None:
#         return 0
#     return float(value)


# def safe_sum(queryset, field_name):
#     try:
#         return money(queryset.aggregate(total=Sum(field_name))["total"])
#     except Exception:
#         return 0


# def get_first_model(app_name, model_names):
#     for model_name in model_names:
#         model = get_model_safe(app_name, model_name)
#         if model:
#             return model
#     return None


# @api_view(["GET"])
# def dashboard_report(request):
#     Bill = get_model_safe("restaurant", "Bill")
#     Order = get_model_safe("restaurant", "Order")
#     Customer = get_model_safe("restaurant", "Customer")
#     MenuItem = get_model_safe("restaurant", "MenuItem")
#     RestaurantTable = get_model_safe("restaurant", "RestaurantTable")

#     Employee = get_first_model("employees", ["Employee", "Staff"])
#     InventoryItem = get_first_model(
#         "inventory",
#         ["InventoryItem", "Inventory", "StockItem"]
#     )

#     today = timezone.localdate()

#     total_sales = 0
#     today_sales = 0
#     payment_summary = []
#     recent_bills = []

#     if Bill:
#         bills = Bill.objects.all().order_by("-created_at")
#         today_bills = bills.filter(created_at__date=today)

#         total_sales = safe_sum(bills, "final_amount")
#         today_sales = safe_sum(today_bills, "final_amount")

#         if has_field(Bill, "payment_method"):
#             payment_data = (
#                 bills.values("payment_method")
#                 .annotate(total=Sum("final_amount"), count=Count("id"))
#                 .order_by("payment_method")
#             )

#             payment_summary = [
#                 {
#                     "payment_method": item["payment_method"],
#                     "total": money(item["total"]),
#                     "count": item["count"],
#                 }
#                 for item in payment_data
#             ]

#         for bill in bills[:5]:
#             recent_bills.append(
#                 {
#                     "id": bill.id,
#                     "bill_number": getattr(bill, "bill_number", bill.id),
#                     "customer_name": getattr(bill, "customer_name", "") or "-",
#                     "phone": getattr(bill, "phone", "") or "-",
#                     "final_amount": money(getattr(bill, "final_amount", 0)),
#                     "payment_method": getattr(bill, "payment_method", "-"),
#                     "created_at": getattr(bill, "created_at", None),
#                 }
#             )

#     low_stock_count = 0

#     if InventoryItem:
#         try:
#             if has_field(InventoryItem, "quantity"):
#                 low_stock_count = InventoryItem.objects.filter(quantity__lte=10).count()
#             elif has_field(InventoryItem, "stock"):
#                 low_stock_count = InventoryItem.objects.filter(stock__lte=10).count()
#         except Exception:
#             low_stock_count = 0

#     data = {
#         "total_sales": total_sales,
#         "today_sales": today_sales,
#         "revenue": total_sales,
#         "total_orders": Order.objects.count() if Order else 0,
#         "total_customers": Customer.objects.count() if Customer else 0,
#         "total_employees": Employee.objects.count() if Employee else 0,
#         "total_inventory": InventoryItem.objects.count() if InventoryItem else 0,
#         "total_menu_items": MenuItem.objects.count() if MenuItem else 0,
#         "total_tables": RestaurantTable.objects.count() if RestaurantTable else 0,
#         "low_stock": low_stock_count,
#         "low_stock_count": low_stock_count,
#         "payment_summary": payment_summary,
#         "recent_bills": recent_bills,
#     }

#     return Response(data)


# @api_view(["GET"])
# def sales_report(request):
#     Bill = get_model_safe("restaurant", "Bill")

#     if not Bill:
#         return Response(
#             {
#                 "summary": {
#                     "total_sales": 0,
#                     "total_gst": 0,
#                     "total_discount": 0,
#                     "total_bills": 0,
#                     "cash_sales": 0,
#                     "upi_sales": 0,
#                     "card_sales": 0,
#                 },
#                 "payment_summary": [],
#                 "date_wise_sales": [],
#                 "bills": [],
#             }
#         )

#     bills = Bill.objects.all().order_by("-created_at")

#     selected_date = request.GET.get("date")
#     start_date = request.GET.get("start_date")
#     end_date = request.GET.get("end_date")
#     payment_method = request.GET.get("payment_method")

#     if selected_date:
#         bills = bills.filter(created_at__date=selected_date)

#     if start_date and end_date:
#         bills = bills.filter(created_at__date__range=[start_date, end_date])

#     if payment_method:
#         bills = bills.filter(payment_method__iexact=payment_method)

#     total_sales = safe_sum(bills, "final_amount")
#     total_gst = safe_sum(bills, "tax_amount")
#     total_discount = safe_sum(bills, "discount")
#     total_bills = bills.count()

#     cash_sales = safe_sum(bills.filter(payment_method__iexact="Cash"), "final_amount")
#     upi_sales = safe_sum(bills.filter(payment_method__iexact="UPI"), "final_amount")
#     card_sales = safe_sum(bills.filter(payment_method__iexact="Card"), "final_amount")

#     payment_data = (
#         bills.values("payment_method")
#         .annotate(total=Sum("final_amount"), count=Count("id"))
#         .order_by("payment_method")
#     )

#     payment_summary = [
#         {
#             "payment_method": item["payment_method"],
#             "total": money(item["total"]),
#             "count": item["count"],
#         }
#         for item in payment_data
#     ]

#     date_data = (
#         bills.annotate(sale_date=TruncDate("created_at"))
#         .values("sale_date")
#         .annotate(total=Sum("final_amount"), count=Count("id"))
#         .order_by("-sale_date")
#     )

#     date_wise_sales = [
#         {
#             "sale_date": str(item["sale_date"]),
#             "total": money(item["total"]),
#             "count": item["count"],
#         }
#         for item in date_data
#     ]

#     bill_list = []

#     for bill in bills:
#         order = getattr(bill, "order", None)

#         bill_list.append(
#             {
#                 "id": bill.id,
#                 "bill_number": getattr(bill, "bill_number", bill.id),
#                 "order": order.id if order else None,
#                 "customer_name": getattr(bill, "customer_name", "") or "-",
#                 "phone": getattr(bill, "phone", "") or "-",
#                 "total_amount": money(getattr(bill, "total_amount", 0)),
#                 "discount": money(getattr(bill, "discount", 0)),
#                 "tax_amount": money(getattr(bill, "tax_amount", 0)),
#                 "final_amount": money(getattr(bill, "final_amount", 0)),
#                 "payment_method": getattr(bill, "payment_method", "-"),
#                 "payment_status": getattr(bill, "payment_status", "Paid"),
#                 "created_at": getattr(bill, "created_at", None),
#             }
#         )

#     return Response(
#         {
#             "summary": {
#                 "total_sales": total_sales,
#                 "total_gst": total_gst,
#                 "total_discount": total_discount,
#                 "total_bills": total_bills,
#                 "cash_sales": cash_sales,
#                 "upi_sales": upi_sales,
#                 "card_sales": card_sales,
#             },
#             "payment_summary": payment_summary,
#             "date_wise_sales": date_wise_sales,
#             "bills": bill_list,
#         }
#     )

from decimal import Decimal

from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.apps import apps
from django.db.models import Sum, Count
from django.utils import timezone


# --------------------------------------------------
# Safe model helpers
# --------------------------------------------------

def get_model_safe(app_label, model_name):
    try:
        return apps.get_model(app_label, model_name)
    except LookupError:
        return None


def get_first_model(app_label, model_names):
    for model_name in model_names:
        model = get_model_safe(app_label, model_name)
        if model:
            return model
    return None


def money(value):
    if value is None:
        return 0

    try:
        return float(value)
    except Exception:
        return 0


def get_number_field(model, possible_fields):
    if not model:
        return None

    model_fields = [field.name for field in model._meta.get_fields()]

    for field_name in possible_fields:
        if field_name in model_fields:
            return field_name

    return None


def get_date_field(model):
    if not model:
        return None

    model_fields = [field.name for field in model._meta.get_fields()]

    possible_fields = [
        "created_at",
        "created",
        "date",
        "bill_date",
        "order_date",
        "purchase_date",
    ]

    for field_name in possible_fields:
        if field_name in model_fields:
            return field_name

    return None


def get_stock_value(item):
    possible_fields = [
        "quantity",
        "stock",
        "current_stock",
        "available_stock",
    ]

    for field_name in possible_fields:
        if hasattr(item, field_name):
            try:
                return Decimal(str(getattr(item, field_name) or 0))
            except Exception:
                return Decimal("0")

    return Decimal("0")


def get_low_limit_value(item):
    possible_fields = [
        "low_limit",
        "low_stock_limit",
        "minimum_stock",
        "min_stock",
        "reorder_level",
    ]

    for field_name in possible_fields:
        if hasattr(item, field_name):
            try:
                return Decimal(str(getattr(item, field_name) or 0))
            except Exception:
                return Decimal("0")

    return Decimal("0")


# --------------------------------------------------
# Dashboard Report
# --------------------------------------------------

@api_view(["GET"])
def dashboard_report(request):
    today = timezone.localdate()

    Bill = get_model_safe("restaurant", "Bill")
    Order = get_model_safe("restaurant", "Order")
    Customer = get_model_safe("restaurant", "Customer")
    MenuItem = get_model_safe("restaurant", "MenuItem")
    RestaurantTable = get_model_safe("restaurant", "RestaurantTable")

    Employee = get_first_model("employees", ["Employee", "Staff"])
    InventoryItem = get_first_model(
        "inventory",
        ["InventoryItem", "Inventory", "StockItem", "Ingredient", "RawMaterial"],
    )

    # -------------------------------
    # Bills / Sales
    # -------------------------------

    total_sales = 0
    today_sales = 0
    total_bills = 0
    today_bills = 0
    payment_summary = []
    recent_bills = []

    if Bill:
        amount_field = get_number_field(
            Bill,
            ["final_amount", "grand_total", "total_amount", "amount"],
        )

        date_field = get_date_field(Bill)

        total_bills = Bill.objects.count()

        if amount_field:
            total_sales = money(
                Bill.objects.aggregate(total=Sum(amount_field))["total"]
            )

        if date_field:
            today_filter = {f"{date_field}__date": today}
            today_bills_queryset = Bill.objects.filter(**today_filter)

            today_bills = today_bills_queryset.count()

            if amount_field:
                today_sales = money(
                    today_bills_queryset.aggregate(total=Sum(amount_field))[
                        "total"
                    ]
                )

        if hasattr(Bill, "payment_method"):
            payment_queryset = Bill.objects.values("payment_method").annotate(
                count=Count("id")
            )

            if amount_field:
                payment_queryset = Bill.objects.values("payment_method").annotate(
                    count=Count("id"),
                    total=Sum(amount_field),
                )

            payment_summary = list(payment_queryset)

            for payment in payment_summary:
                payment["total"] = money(payment.get("total", 0))

        latest_bills = Bill.objects.all().order_by("-id")[:5]

        for bill in latest_bills:
            recent_bills.append(
                {
                    "id": bill.id,
                    "order": getattr(bill, "order_id", None),
                    "customer_name": getattr(bill, "customer_name", "Walk-in Customer"),
                    "phone": getattr(bill, "phone", "-"),
                    "payment_method": getattr(bill, "payment_method", "-"),
                    "payment_status": getattr(bill, "payment_status", "-"),
                    "final_amount": money(
                        getattr(
                            bill,
                            "final_amount",
                            getattr(bill, "total_amount", 0),
                        )
                    ),
                    "created_at": str(
                        getattr(
                            bill,
                            "created_at",
                            getattr(bill, "bill_date", ""),
                        )
                    ),
                }
            )

    # -------------------------------
    # Orders
    # -------------------------------

    total_orders = 0
    today_orders = 0
    active_orders = 0
    billed_orders = 0
    cancelled_orders = 0

    if Order:
        total_orders = Order.objects.count()

        order_date_field = get_date_field(Order)

        if order_date_field:
            today_orders = Order.objects.filter(
                **{f"{order_date_field}__date": today}
            ).count()

        if hasattr(Order, "status"):
            active_orders = Order.objects.filter(
                status__in=["Pending", "Preparing", "Ready", "Served"]
            ).count()

            billed_orders = Order.objects.filter(status="Billed").count()
            cancelled_orders = Order.objects.filter(status="Cancelled").count()

    # -------------------------------
    # Customers / Employees / Menu / Tables
    # -------------------------------

    total_customers = Customer.objects.count() if Customer else 0
    total_employees = Employee.objects.count() if Employee else 0
    total_menu_items = MenuItem.objects.count() if MenuItem else 0
    total_tables = RestaurantTable.objects.count() if RestaurantTable else 0

    available_tables = 0
    occupied_tables = 0
    billing_tables = 0

    if RestaurantTable and hasattr(RestaurantTable, "status"):
        available_tables = RestaurantTable.objects.filter(status="Available").count()
        occupied_tables = RestaurantTable.objects.filter(status="Occupied").count()
        billing_tables = RestaurantTable.objects.filter(status="Billing").count()

    # -------------------------------
    # Inventory / Low Stock
    # -------------------------------

    total_inventory_items = 0
    low_stock_count = 0
    out_of_stock_count = 0

    if InventoryItem:
        inventory_items = InventoryItem.objects.all()
        total_inventory_items = inventory_items.count()

        for item in inventory_items:
            stock = get_stock_value(item)
            low_limit = get_low_limit_value(item)

            if stock <= 0:
                out_of_stock_count += 1
                low_stock_count += 1
            elif low_limit > 0 and stock <= low_limit:
                low_stock_count += 1

    data = {
        "today_sales": today_sales,
        "total_sales": total_sales,
        "today_orders": today_orders,
        "total_orders": total_orders,
        "active_orders": active_orders,
        "billed_orders": billed_orders,
        "cancelled_orders": cancelled_orders,
        "today_bills": today_bills,
        "total_bills": total_bills,
        "total_customers": total_customers,
        "total_employees": total_employees,
        "total_menu_items": total_menu_items,
        "total_tables": total_tables,
        "available_tables": available_tables,
        "occupied_tables": occupied_tables,
        "billing_tables": billing_tables,
        "total_inventory_items": total_inventory_items,
        "low_stock": low_stock_count,
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "payment_summary": payment_summary,
        "recent_bills": recent_bills,
    }

    return Response(data)


# --------------------------------------------------
# Sales Report
# --------------------------------------------------

@api_view(["GET"])
def sales_report(request):
    Bill = get_model_safe("restaurant", "Bill")

    if not Bill:
        return Response(
            {
                "total_sales": 0,
                "total_gst": 0,
                "total_discount": 0,
                "total_bills": 0,
                "payment_summary": [],
                "date_wise_sales": [],
                "bills": [],
            }
        )

    amount_field = get_number_field(
        Bill,
        ["final_amount", "grand_total", "total_amount", "amount"],
    )

    tax_field = get_number_field(
        Bill,
        ["tax_amount", "gst_amount", "gst", "tax"],
    )

    discount_field = get_number_field(
        Bill,
        ["discount", "discount_amount"],
    )

    date_field = get_date_field(Bill)

    queryset = Bill.objects.all().order_by("-id")

    total_sales = 0
    total_gst = 0
    total_discount = 0

    if amount_field:
        total_sales = money(queryset.aggregate(total=Sum(amount_field))["total"])

    if tax_field:
        total_gst = money(queryset.aggregate(total=Sum(tax_field))["total"])

    if discount_field:
        total_discount = money(
            queryset.aggregate(total=Sum(discount_field))["total"]
        )

    payment_summary = []

    if hasattr(Bill, "payment_method"):
        payment_queryset = queryset.values("payment_method").annotate(
            count=Count("id")
        )

        if amount_field:
            payment_queryset = queryset.values("payment_method").annotate(
                count=Count("id"),
                total=Sum(amount_field),
            )

        payment_summary = list(payment_queryset)

        for payment in payment_summary:
            payment["total"] = money(payment.get("total", 0))

    date_wise_sales = []

    if date_field and amount_field:
        date_wise_sales = list(
            queryset.extra(
                select={"date": f"date({date_field})"}
            )
            .values("date")
            .annotate(total=Sum(amount_field), bills=Count("id"))
            .order_by("-date")
        )

        for row in date_wise_sales:
            row["total"] = money(row.get("total", 0))

    bills = []

    for bill in queryset[:100]:
        bills.append(
            {
                "id": bill.id,
                "order": getattr(bill, "order_id", None),
                "customer_name": getattr(bill, "customer_name", "Walk-in Customer"),
                "phone": getattr(bill, "phone", "-"),
                "payment_method": getattr(bill, "payment_method", "-"),
                "payment_status": getattr(bill, "payment_status", "-"),
                "total_amount": money(getattr(bill, "total_amount", 0)),
                "tax_amount": money(getattr(bill, "tax_amount", 0)),
                "discount": money(getattr(bill, "discount", 0)),
                "final_amount": money(
                    getattr(
                        bill,
                        "final_amount",
                        getattr(bill, "total_amount", 0),
                    )
                ),
                "created_at": str(
                    getattr(
                        bill,
                        "created_at",
                        getattr(bill, "bill_date", ""),
                    )
                ),
            }
        )

    data = {
        "total_sales": total_sales,
        "total_gst": total_gst,
        "total_discount": total_discount,
        "total_bills": queryset.count(),
        "payment_summary": payment_summary,
        "date_wise_sales": date_wise_sales,
        "bills": bills,
    }

    return Response(data)