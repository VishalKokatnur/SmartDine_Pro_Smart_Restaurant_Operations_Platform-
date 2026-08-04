from django.urls import path
from .views import user_role

urlpatterns = [
    path("user-role/", user_role, name="user-role"),
]