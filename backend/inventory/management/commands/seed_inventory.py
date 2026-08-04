from django.core.management.base import BaseCommand
from inventory.models import InventoryItem


class Command(BaseCommand):
    help = "Create default inventory items"

    def handle(self, *args, **kwargs):
        items = [
            ["Rice", "Grocery", 50, "Kg", 5, "Local Vendor", 2500],
            ["Chicken", "Non-Veg", 20, "Kg", 3, "Meat Vendor", 4000],
            ["Tea Powder", "Beverage", 10, "Kg", 2, "Tea Vendor", 1200],
            ["Coffee Powder", "Beverage", 8, "Kg", 2, "Coffee Vendor", 1500],
            ["Milk", "Dairy", 30, "Liter", 5, "Dairy Vendor", 1800],
            ["Sugar", "Grocery", 25, "Kg", 5, "Local Vendor", 1000],
            ["Oil", "Grocery", 20, "Liter", 4, "Oil Vendor", 3000],
            ["Masala", "Spices", 10, "Kg", 2, "Spices Vendor", 2000],
        ]

        for item in items:
            InventoryItem.objects.get_or_create(
                name=item[0],
                defaults={
                    "category": item[1],
                    "quantity": item[2],
                    "unit": item[3],
                    "low_stock_limit": item[4],
                    "vendor_name": item[5],
                    "purchase_price": item[6],
                },
            )

        self.stdout.write(self.style.SUCCESS("Default inventory created successfully"))