from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from inventory.models import InventoryItem, RecipeItem
from restaurant.models import MenuItem


class Command(BaseCommand):
    help = "Automatically create and synchronize recipes and required inventory items for all menu items"

    RECIPES = {
        # ============================================================
        # BREAKFAST
        # ============================================================

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

        # ============================================================
        # STARTERS
        # ============================================================

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

        # ============================================================
        # SOUPS
        # ============================================================

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

        # ============================================================
        # MAIN COURSE
        # ============================================================

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

        # ============================================================
        # BREADS
        # ============================================================

        "Butter Naan": [
            ("Flour", 0.15),
            ("Butter", 0.02),
        ],

        "Garlic Naan": [
            ("Flour", 0.15),
            ("Garlic", 0.01),
        ],

        "Tandoori Roti": [
            ("Flour", 0.15),
        ],

        "Lachha Paratha": [
            ("Flour", 0.18),
            ("Oil", 0.02),
        ],

        "Missi Roti": [
            ("Flour", 0.15),
        ],

        "Kulcha": [
            ("Flour", 0.15),
        ],

        # ============================================================
        # RICE
        # ============================================================

        "Jeera Rice": [
            ("Rice", 0.25),
        ],

        "Steamed Rice": [
            ("Rice", 0.25),
        ],

        "Veg Pulao": [
            ("Rice", 0.25),
            ("Vegetables", 0.15),
        ],

        "Curd Rice": [
            ("Rice", 0.25),
            ("Curd", 0.10),
        ],

        "Lemon Rice": [
            ("Rice", 0.25),
            ("Lemon", 1),
        ],

        # ============================================================
        # DESSERTS
        # ============================================================

        "Gulab Jamun": [
            ("Sugar", 0.05),
            ("Milk Powder", 0.10),
        ],

        "Brownie with Ice Cream": [
            ("Chocolate", 0.10),
            ("Milk", 0.10),
        ],

        "Rasmalai": [
            ("Milk", 0.25),
        ],

        "Gajar Halwa": [
            ("Carrot", 0.20),
            ("Milk", 0.10),
        ],

        "Kheer": [
            ("Milk", 0.20),
            ("Rice", 0.05),
        ],

        # ============================================================
        # DRINKS
        # ============================================================

        "Fresh Lime Soda": [
            ("Lemon", 1),
            ("Sugar", 0.02),
        ],

        "Cold Coffee": [
            ("Milk", 0.20),
            ("Coffee Powder", 0.01),
            ("Sugar", 0.02),
        ],

        "Masala Tea": [
            ("Tea Powder", 0.01),
            ("Milk", 0.10),
            ("Sugar", 0.02),
        ],

        "Mango Lassi": [
            ("Curd", 0.20),
            ("Mango", 0.15),
        ],

        "Buttermilk": [
            ("Curd", 0.20),
        ],

        "Filter Coffee": [
            ("Coffee Powder", 0.01),
            ("Milk", 0.10),
        ],

            # ============================================================
    # ADDITIONAL MAIN COURSE / SPECIAL ITEMS
    # ============================================================

    "Veg Thali": [
        ("Rice", 0.25),
        ("Dal", 0.15),
        ("Vegetables", 0.15),
        ("Curd", 0.10),
        ("Spices", 0.01),
        ("Oil", 0.02),
    ],

    "Non-Veg Thali": [
        ("Rice", 0.25),
        ("Dal", 0.15),
        ("Chicken", 0.20),
        ("Vegetables", 0.10),
        ("Curd", 0.10),
        ("Spices", 0.01),
        ("Oil", 0.02),
    ],

    "Rajma Chawal": [
        ("Rice", 0.25),
        ("Dal", 0.20),
        ("Onion", 0.05),
        ("Tomato", 0.05),
        ("Spices", 0.01),
        ("Oil", 0.02),
    ],

    "Kadhi Chawal": [
        ("Rice", 0.25),
        ("Curd", 0.20),
        ("Spices", 0.01),
        ("Oil", 0.02),
    ],

    "Chole Bhature": [
        ("Chickpeas", 0.25),
        ("Flour", 0.20),
        ("Onion", 0.05),
        ("Tomato", 0.05),
        ("Spices", 0.01),
        ("Oil", 0.03),
    ],

    "Tandoori Chicken": [
        ("Chicken", 0.30),
        ("Curd", 0.10),
        ("Spices", 0.02),
        ("Oil", 0.02),
    ],

    "Fish Curry": [
        ("Fish", 0.25),
        ("Tomato", 0.10),
        ("Onion", 0.05),
        ("Spices", 0.02),
        ("Oil", 0.03),
    ],

    "Mutton Rogan Josh": [
        ("Mutton", 0.30),
        ("Onion", 0.05),
        ("Tomato", 0.05),
        ("Spices", 0.02),
        ("Oil", 0.03),
    ],

    "Paneer Lababdar": [
        ("Paneer", 0.25),
        ("Tomato", 0.10),
        ("Onion", 0.05),
        ("Spices", 0.02),
        ("Butter", 0.02),
    ],

    "Veg Kolhapuri": [
        ("Vegetables", 0.25),
        ("Tomato", 0.10),
        ("Onion", 0.05),
        ("Spices", 0.02),
        ("Oil", 0.03),
    ],

    "Boast": [
        ("Bread", 2),
        ("Butter", 0.02),
    ],
    }

    def handle(self, *args, **kwargs):

        created_inventory = []
        existing_inventory = []
        created_recipes = []
        updated_recipes = []
        missing_menu_items = []

        with transaction.atomic():

            for menu_name, ingredients in self.RECIPES.items():

                # ----------------------------------------------------
                # Find menu item
                # ----------------------------------------------------

                menu = MenuItem.objects.filter(name=menu_name).first()

                if not menu:
                    missing_menu_items.append(menu_name)

                    self.stdout.write(
                        self.style.WARNING(
                            f"Menu item not found: {menu_name}"
                        )
                    )

                    continue

                # ----------------------------------------------------
                # Process every ingredient
                # ----------------------------------------------------

                for ing_name, qty in ingredients:

                    quantity_used = Decimal(str(qty))

                    # ------------------------------------------------
                    # Find existing inventory item
                    # ------------------------------------------------

                    inventory = InventoryItem.objects.filter(
                        name=ing_name
                    ).first()

                    # ------------------------------------------------
                    # Create inventory item ONLY if it doesn't exist
                    # ------------------------------------------------

                    if not inventory:

                        inventory = InventoryItem.objects.create(
                            name=ing_name,
                            category="General",
                            quantity=Decimal("100"),
                            unit="kg",
                            low_stock_limit=Decimal("10"),
                            vendor_name="Default Vendor",
                            purchase_price=Decimal("50"),
                        )

                        created_inventory.append(ing_name)

                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Inventory created: {ing_name}"
                            )
                        )

                    else:

                        existing_inventory.append(ing_name)

                    # ------------------------------------------------
                    # Create or update recipe
                    #
                    # IMPORTANT:
                    # get_or_create alone does NOT update an existing
                    # recipe quantity.
                    # update_or_create keeps the recipe correct.
                    # ------------------------------------------------

                    recipe, created = RecipeItem.objects.update_or_create(
                        menu_item=menu,
                        inventory_item=inventory,
                        defaults={
                            "quantity_used": quantity_used
                        },
                    )

                    if created:
                        created_recipes.append(
                            f"{menu_name} -> {ing_name}"
                        )

                    else:
                        updated_recipes.append(
                            f"{menu_name} -> {ing_name}"
                        )

        # ============================================================
        # SUMMARY
        # ============================================================

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "=============================================="
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "SMARTDINE RECIPE + INVENTORY SYNC COMPLETED"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "=============================================="
            )
        )

        self.stdout.write(
            f"Inventory items created : {len(created_inventory)}"
        )

        self.stdout.write(
            f"Recipes created         : {len(created_recipes)}"
        )

        self.stdout.write(
            f"Recipes updated         : {len(updated_recipes)}"
        )

        self.stdout.write(
            f"Menu items missing      : {len(missing_menu_items)}"
        )

        # ------------------------------------------------------------
        # Show created inventory
        # ------------------------------------------------------------

        if created_inventory:

            self.stdout.write("")
            self.stdout.write(
                self.style.SUCCESS(
                    "New inventory items:"
                )
            )

            for name in created_inventory:
                self.stdout.write(
                    f"  + {name}"
                )

        # ------------------------------------------------------------
        # Show missing menu items
        # ------------------------------------------------------------

        if missing_menu_items:

            self.stdout.write("")
            self.stdout.write(
                self.style.WARNING(
                    "Menu items not found in database:"
                )
            )

            for name in missing_menu_items:
                self.stdout.write(
                    f"  - {name}"
                )

        self.stdout.write("")

        self.stdout.write(
            self.style.SUCCESS(
                "Existing inventory quantities were NOT reset."
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Existing recipes were NOT deleted."
            )
        )