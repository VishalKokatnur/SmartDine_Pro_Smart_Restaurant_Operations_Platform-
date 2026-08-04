from django.contrib import admin
from .models import MenuItem, RestaurantTable, Order, KitchenOrder, Bill
from .models import MenuItem, RestaurantTable, Order, KitchenOrder, Bill, Customer

admin.site.register(MenuItem)
admin.site.register(RestaurantTable)
admin.site.register(Order)
admin.site.register(KitchenOrder)
admin.site.register(Bill)
admin.site.register(Customer)