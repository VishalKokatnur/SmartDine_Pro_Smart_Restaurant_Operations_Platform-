
from django.db import models
# from django.contrib.auth.models import AbstractUser


# class User(AbstractUser):

#     ROLE_CHOICES = [
#         ('Admin', 'Admin'),
#         ('Manager', 'Manager'),
#         ('Cashier', 'Cashier'),
#         ('Waiter', 'Waiter'),
#         ('Chef', 'Chef'),
#         ('Customer', 'Customer'),
#     ]

#     role = models.CharField(
#         max_length=20,
#         choices=ROLE_CHOICES,
#         default='Customer'
#     )

#     phone = models.CharField(max_length=15, blank=True)

#     def __str__(self):
#         return self.username