from django.db import models
from inventory.models import InventoryItem


class Purchase(models.Model):
    purchase_number = models.CharField(max_length=20, unique=True)
    vendor = models.CharField(max_length=100)
    purchase_date = models.DateField(auto_now_add=True)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    gst = models.DecimalField(max_digits=10, decimal_places=2)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2)

    STATUS = (
        ("Completed", "Completed"),
        ("Pending", "Pending"),
    )

    status = models.CharField(max_length=20, choices=STATUS, default="Completed")

    def __str__(self):
        return self.purchase_number


class PurchaseItem(models.Model):
    purchase = models.ForeignKey(
        Purchase,
        on_delete=models.CASCADE,
        related_name="items"
    )

    inventory_item = models.ForeignKey(
        InventoryItem,
        on_delete=models.CASCADE
    )

    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.inventory_item.name