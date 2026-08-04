from django.db import models


class Employee(models.Model):
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('Manager', 'Manager'),
        ('Cashier', 'Cashier'),
        ('Waiter', 'Waiter'),
        ('Chef', 'Chef'),
        ('Cleaner', 'Cleaner'),
    ]

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    shift_time = models.CharField(max_length=50)
    joining_date = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.role}"