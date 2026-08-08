from django.db import models
from restaurant.models import MenuItem


class InventoryItem(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20)
    low_stock_limit = models.DecimalField(max_digits=10, decimal_places=2)
    vendor_name = models.CharField(max_length=100, blank=True, null=True)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name


class RecipeItem(models.Model):
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    quantity_used = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.menu_item.name} uses {self.quantity_used} {self.inventory_item.unit} {self.inventory_item.name}"