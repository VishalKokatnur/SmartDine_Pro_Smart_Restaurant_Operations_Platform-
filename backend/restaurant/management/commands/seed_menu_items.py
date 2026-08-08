from django.core.management.base import BaseCommand
from restaurant.models import MenuItem


class Command(BaseCommand):
    help = "Seeds the database with 60+ sample restaurant menu items grouped by category."

    MENU_DATA = {
        "Breakfast": [
            ("Idli", 50),
            ("Masala Dosa", 90),
            ("Plain Dosa", 70),
            ("Poha", 60),
            ("Upma", 60),
            ("Medu Vada", 55),
            ("Uttapam", 85),
            ("Bread Omelette", 70),
        ],
        "Starters": [
            ("Paneer Tikka", 220),
            ("Chicken Wings", 250),
            ("Veg Spring Rolls", 180),
            ("Chilli Paneer", 210),
            ("Chicken 65", 240),
            ("Veg Manchurian", 190),
            ("Hara Bhara Kabab", 200),
            ("Fish Fingers", 260),
        ],
        "Soups": [
            ("Tomato Soup", 120),
            ("Sweet Corn Soup", 130),
            ("Hot & Sour Soup", 140),
            ("Chicken Clear Soup", 150),
            ("Cream of Mushroom Soup", 150),
        ],
        "Main Course": [
            ("Veg Biryani", 220),
            ("Chicken Biryani", 280),
            ("Paneer Butter Masala", 260),
            ("Dal Tadka", 180),
            ("Butter Chicken", 320),
            ("Chana Masala", 190),
            ("Palak Paneer", 240),
            ("Malai Kofta", 250),
            ("Egg Curry", 200),
            ("Mutton Curry", 380),
        ],
        "Breads": [
            ("Butter Naan", 60),
            ("Garlic Naan", 70),
            ("Tandoori Roti", 40),
            ("Lachha Paratha", 65),
            ("Missi Roti", 55),
            ("Kulcha", 65),
        ],
        "Rice": [
            ("Jeera Rice", 150),
            ("Steamed Rice", 120),
            ("Veg Pulao", 180),
            ("Curd Rice", 140),
            ("Lemon Rice", 150),
        ],
        "Lunch Specials": [
            ("Veg Thali", 280),
            ("Non-Veg Thali", 350),
            ("Rajma Chawal", 190),
            ("Kadhi Chawal", 180),
            ("Chole Bhature", 200),
        ],
        "Dinner Specials": [
            ("Tandoori Chicken", 320),
            ("Fish Curry", 300),
            ("Mutton Rogan Josh", 400),
            ("Paneer Lababdar", 260),
            ("Veg Kolhapuri", 220),
        ],
        "Desserts": [
            ("Gulab Jamun", 120),
            ("Brownie with Ice Cream", 220),
            ("Rasmalai", 140),
            ("Gajar Halwa", 150),
            ("Kheer", 130),
        ],
        "Beverages": [
            ("Fresh Lime Soda", 60),
            ("Cold Coffee", 130),
            ("Masala Tea", 40),
            ("Mango Lassi", 100),
            ("Buttermilk", 40),
            ("Filter Coffee", 60),
        ],
    }

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for category, items in self.MENU_DATA.items():
            for name, price in items:
                obj, created = MenuItem.objects.update_or_create(
                    name=name,
                    defaults={
                        "category": category,
                        "price": price,
                        "available": True,
                    },
                )

                if created:
                    created_count += 1
                else:
                    updated_count += 1

        total = created_count + updated_count

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. {created_count} items created, {updated_count} items updated. "
                f"Total menu items processed: {total}."
            )
        )