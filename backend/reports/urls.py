# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import SalesReportViewSet, dashboard_analytics

# router = DefaultRouter()
# router.register("sales-reports", SalesReportViewSet)

# urlpatterns = [
#     path("", include(router.urls)),
#     path("dashboard/", dashboard_analytics),
#     path("sales/", sales_report, name="sales-report"),

# ]

from django.urls import path
from .views import dashboard_report, sales_report

urlpatterns = [
    path("dashboard/", dashboard_report, name="dashboard-report"),
    path("sales/", sales_report, name="sales-report"),
]