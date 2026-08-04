from django.contrib import admin
from django.urls import path, include
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from accounts.views import MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
urlpatterns = [
    path("admin/", admin.site.urls),

    path(
        "api/token/",
        MyTokenObtainPairView.as_view(),
        name="token_obtain_pair"
    ),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("api/accounts/", include("accounts.urls")),

    path("api/restaurant/", include("restaurant.urls")),
    path("api/inventory/", include("inventory.urls")),
    path("api/hotel/", include("hotel.urls")),
    path("api/employees/", include("employees.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/purchase/", include("purchase.urls")),
]