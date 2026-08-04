from django.contrib import admin
from .models import InventoryItem, RecipeItem


admin.site.register(InventoryItem)
admin.site.register(RecipeItem)