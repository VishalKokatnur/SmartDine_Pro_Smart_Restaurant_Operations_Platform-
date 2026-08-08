# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from django.urls import path
# from .views import TableListAPIView
# from .views import (
#     MenuItemViewSet,
#     RestaurantTableViewSet,
#     OrderViewSet,
#     KitchenOrderViewSet,
#     BillViewSet,
#     CustomerViewSet,
#     WaiterCallViewSet,
#     PublicMenuListView,
#     PublicTableDetailView,
#     PublicOrderCreateView,
#     PublicOrderStatusView,
#     PublicWaiterCallCreateView,
# )

# router = DefaultRouter()

# router.register("menu-items", MenuItemViewSet, basename="menu-items")
# router.register("tables", RestaurantTableViewSet, basename="tables")
# router.register("orders", OrderViewSet, basename="orders")
# router.register("kitchen-orders", KitchenOrderViewSet, basename="kitchen-orders")
# router.register("bills", BillViewSet, basename="bills")
# router.register("customers", CustomerViewSet, basename="customers")
# router.register("waiter-calls", WaiterCallViewSet, basename="waiter-calls")

# urlpatterns = [
#     path("", include(router.urls)),
#     path("public/menu/", PublicMenuListView.as_view()),
#     path("public/table/<int:table_id>/", PublicTableDetailView.as_view()),
#     path("public/order/", PublicOrderCreateView.as_view()),
#     path("public/order-status/<int:table_id>/", PublicOrderStatusView.as_view()),
#     path("public/waiter-call/", PublicWaiterCallCreateView.as_view()),
#     path("tables/", TableListAPIView.as_view(), name="table-list"),
# ]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import TableListAPIView
from .views import (
    MenuItemViewSet,
    RestaurantTableViewSet,
    OrderViewSet,
    KitchenOrderViewSet,
    BillViewSet,
    CustomerViewSet,
    WaiterCallViewSet,
    PublicMenuListView,
    PublicTableDetailView,
    PublicTableLookupView,
    PublicOrderCreateView,
    PublicOrderStatusView,
    PublicWaiterCallCreateView,
)

router = DefaultRouter()

router.register("menu-items", MenuItemViewSet, basename="menu-items")
router.register("tables", RestaurantTableViewSet, basename="tables")
router.register("orders", OrderViewSet, basename="orders")
router.register("kitchen-orders", KitchenOrderViewSet, basename="kitchen-orders")
router.register("bills", BillViewSet, basename="bills")
router.register("customers", CustomerViewSet, basename="customers")
router.register("waiter-calls", WaiterCallViewSet, basename="waiter-calls")

urlpatterns = [
    path("", include(router.urls)),
    path("public/menu/", PublicMenuListView.as_view()),
    path("public/table/<int:table_id>/", PublicTableDetailView.as_view()),
    path("public/table-lookup/<str:table_number>/", PublicTableLookupView.as_view()),
    path("public/order/", PublicOrderCreateView.as_view()),
    path("public/order-status/<int:table_id>/", PublicOrderStatusView.as_view()),
    path("public/waiter-call/", PublicWaiterCallCreateView.as_view()),
    path("tables/", TableListAPIView.as_view(), name="table-list"),
]

