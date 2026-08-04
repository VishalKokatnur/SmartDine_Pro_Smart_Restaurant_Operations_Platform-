from django.db import models


class MenuItem(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    available = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class RestaurantTable(models.Model):
    TABLE_STATUS = [
        ("Available", "Available"),
        ("Reserved", "Reserved"),
        ("Occupied", "Occupied"),
        ("Billing", "Billing"),
        ("Cleaning", "Cleaning"),
    ]

    table_number = models.CharField(max_length=20, unique=True)
    capacity = models.IntegerField()
    status = models.CharField(
        max_length=20,
        choices=TABLE_STATUS,
        default="Available"
    )

    def __str__(self):
        return f"Table {self.table_number} - {self.status}"


class Order(models.Model):
    ORDER_STATUS = [
        ("Pending", "Pending"),
        ("Preparing", "Preparing"),
        ("Ready", "Ready"),
        ("Served", "Served"),
        ("Billed", "Billed"),
        ("Cancelled", "Cancelled"),
    ]

    table = models.ForeignKey(
        RestaurantTable,
        on_delete=models.CASCADE
    )

    items = models.ManyToManyField(MenuItem)

    status = models.CharField(
        max_length=20,
        choices=ORDER_STATUS,
        default="Pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - Table {self.table.table_number}"


class KitchenOrder(models.Model):
    KITCHEN_STATUS = [
        ("Pending", "Pending"),
        ("Preparing", "Preparing"),
        ("Ready", "Ready"),
        ("Served", "Served"),
    ]

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE
    )

    chef_name = models.CharField(max_length=100, blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=KITCHEN_STATUS,
        default="Pending"
    )

    preparation_time = models.IntegerField(
        help_text="Time in minutes",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"KOT for Order #{self.order.id} - {self.status}"


class Bill(models.Model):
    PAYMENT_METHOD = [
        ("Cash", "Cash"),
        ("UPI", "UPI"),
        ("Card", "Card"),
        ("Online", "Online"),
    ]

    PAYMENT_STATUS = [
        ("Pending", "Pending"),
        ("Paid", "Paid"),
        ("Cancelled", "Cancelled"),
    ]

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE
    )

    customer_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2)

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD,
        default="Cash"
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default="Pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bill #{self.id} - {self.payment_status}"


class Customer(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, unique=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    loyalty_points = models.IntegerField(default=0)
    birthday = models.DateField(blank=True, null=True)
    anniversary = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.phone}"


class WaiterCall(models.Model):
    REQUEST_TYPES = [
        ("Water", "Water"),
        ("Tissue", "Tissue"),
        ("Bill", "Bill"),
        ("Waiter", "Waiter"),
    ]

    CALL_STATUS = [
        ("Pending", "Pending"),
        ("Resolved", "Resolved"),
    ]

    table = models.ForeignKey(
        RestaurantTable,
        on_delete=models.CASCADE,
        related_name="waiter_calls",
    )

    request_type = models.CharField(
        max_length=20,
        default="Waiter",
    )

    status = models.CharField(
        max_length=20,
        choices=CALL_STATUS,
        default="Pending",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"Table {self.table.table_number} - "
            f"{self.request_type} - {self.status}"
        )