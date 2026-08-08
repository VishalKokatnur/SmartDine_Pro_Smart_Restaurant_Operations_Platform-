from decimal import Decimal

from django.core.management.base import BaseCommand

from inventory.models import InventoryItem, RecipeItem
from restaurant.models import MenuItem


class Command(BaseCommand):
    help = "Automatically create recipes for all menu items"

    RECIPES = {
        # ---------------- BREAKFAST ----------------

        "Idli": [
            ("Rice", 0.20),
            ("Urad Dal", 0.05),
        ],

        "Masala Dosa": [
            ("Rice", 0.25),
            ("Potato", 0.15),
            ("Oil", 0.02),
        ],

        "Plain Dosa": [
            ("Rice", 0.25),
            ("Oil", 0.02),
        ],

        "Poha": [
            ("Poha", 0.20),
            ("Onion", 0.05),
            ("Oil", 0.02),
        ],

        "Upma": [
            ("Rava", 0.20),
            ("Oil", 0.02),
        ],

        "Medu Vada": [
            ("Urad Dal", 0.15),
            ("Oil", 0.05),
        ],

        "Uttapam": [
            ("Rice", 0.25),
            ("Onion", 0.05),
            ("Tomato", 0.05),
        ],

        "Bread Omelette": [
            ("Bread", 2),
            ("Egg", 2),
            ("Oil", 0.01),
        ],

        # ---------------- STARTERS ----------------

        "Paneer Tikka": [
            ("Paneer", 0.20),
            ("Oil", 0.02),
            ("Spices", 0.01),
        ],

        "Chicken Wings": [
            ("Chicken", 0.25),
            ("Oil", 0.03),
            ("Spices", 0.02),
        ],

        "Veg Spring Rolls": [
            ("Vegetables", 0.20),
            ("Oil", 0.02),
        ],

        "Chilli Paneer": [
            ("Paneer", 0.20),
            ("Capsicum", 0.05),
            ("Onion", 0.05),
        ],

        "Chicken 65": [
            ("Chicken", 0.25),
            ("Oil", 0.03),
        ],

        "Veg Manchurian": [
            ("Vegetables", 0.20),
            ("Corn Flour", 0.02),
        ],

        "Hara Bhara Kabab": [
            ("Potato", 0.15),
            ("Spinach", 0.05),
        ],

        "Fish Fingers": [
            ("Fish", 0.25),
            ("Oil", 0.02),
        ],

        # ---------------- SOUPS ----------------

        "Tomato Soup": [
            ("Tomato", 0.20),
        ],

        "Sweet Corn Soup": [
            ("Sweet Corn", 0.20),
        ],

        "Hot & Sour Soup": [
            ("Vegetables", 0.20),
        ],

        "Chicken Clear Soup": [
            ("Chicken", 0.20),
        ],

        "Cream of Mushroom Soup": [
            ("Mushroom", 0.20),
            ("Milk", 0.10),
        ],

        # ---------------- MAIN COURSE ----------------

        "Veg Biryani": [
            ("Rice", 0.30),
            ("Vegetables", 0.20),
            ("Oil", 0.03),
            ("Spices", 0.01),
        ],

        "Chicken Biryani": [
            ("Rice", 0.30),
            ("Chicken", 0.25),
            ("Oil", 0.03),
        ],

        "Paneer Butter Masala": [
            ("Paneer", 0.25),
            ("Butter", 0.02),
            ("Tomato", 0.05),
        ],

        "Dal Tadka": [
            ("Dal", 0.25),
            ("Oil", 0.02),
        ],

        "Butter Chicken": [
            ("Chicken", 0.25),
            ("Butter", 0.03),
        ],

        "Chana Masala": [
            ("Chickpeas", 0.25),
        ],

        "Palak Paneer": [
            ("Paneer", 0.20),
            ("Spinach", 0.15),
        ],

        "Malai Kofta": [
            ("Paneer", 0.15),
            ("Potato", 0.10),
        ],

        "Egg Curry": [
            ("Egg", 2),
            ("Onion", 0.05),
        ],

        "Mutton Curry": [
            ("Mutton", 0.30),
        ],

        # ---------------- BREADS ----------------

        "Butter Naan": [("Flour", 0.15), ("Butter", 0.02)],
        "Garlic Naan": [("Flour", 0.15), ("Garlic", 0.01)],
        "Tandoori Roti": [("Flour", 0.15)],
        "Lachha Paratha": [("Flour", 0.18), ("Oil", 0.02)],
        "Missi Roti": [("Flour", 0.15)],
        "Kulcha": [("Flour", 0.15)],

        # ---------------- RICE ----------------

        "Jeera Rice": [("Rice", 0.25)],
        "Steamed Rice": [("Rice", 0.25)],
        "Veg Pulao": [("Rice", 0.25), ("Vegetables", 0.15)],
        "Curd Rice": [("Rice", 0.25), ("Curd", 0.10)],
        "Lemon Rice": [("Rice", 0.25), ("Lemon", 1)],

        # ---------------- DESSERTS ----------------

        "Gulab Jamun": [("Sugar", 0.05), ("Milk Powder", 0.10)],
        "Brownie with Ice Cream": [("Chocolate", 0.10), ("Milk", 0.10)],
        "Rasmalai": [("Milk", 0.25)],
        "Gajar Halwa": [("Carrot", 0.20), ("Milk", 0.10)],
        "Kheer": [("Milk", 0.20), ("Rice", 0.05)],

        # ---------------- DRINKS ----------------

        "Fresh Lime Soda": [("Lemon", 1), ("Sugar", 0.02)],
        "Cold Coffee": [("Milk", 0.20), ("Coffee Powder", 0.01), ("Sugar", 0.02)],
        "Masala Tea": [("Tea Powder", 0.01), ("Milk", 0.10), ("Sugar", 0.02)],
        "Mango Lassi": [("Curd", 0.20), ("Mango", 0.15)],
        "Buttermilk": [("Curd", 0.20)],
        "Filter Coffee": [("Coffee Powder", 0.01), ("Milk", 0.10)],
    }

    def handle(self, *args, **kwargs):

        RecipeItem.objects.all().delete()

        for menu_name, ingredients in self.RECIPES.items():

            try:
                menu = MenuItem.objects.get(name=menu_name)
            except MenuItem.DoesNotExist:
                self.stdout.write(f"Menu not found: {menu_name}")
                continue

            for ing_name, qty in ingredients:

                inventory = InventoryItem.objects.filter(name=ing_name).first()

                if not inventory:
                    inventory = InventoryItem.objects.create(
                        name=ing_name,
                        category="General",
                        quantity=100,
                        unit="kg",
                        low_stock_limit=10,
                        vendor_name="Default Vendor",
                        purchase_price=50,
                    )

                RecipeItem.objects.get_or_create(
                    menu_item=menu,
                    inventory_item=inventory,
                    defaults={
                        "quantity_used": Decimal(str(qty))
                    },
                )

        self.stdout.write(self.style.SUCCESS("Recipes created successfully."))