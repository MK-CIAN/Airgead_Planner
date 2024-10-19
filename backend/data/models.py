# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models

class MonthlyBudget(models.Model):
    category = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.DateField()

    class Meta:
        db_table = 'monthly_budget'
    
    def __str__(self):
        return "{self.category}: ${self.amount} (Month: {self.month})"

class Supermarketsales(models.Model):
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    quantity = models.IntegerField(blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    country = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    customertype = models.CharField(max_length=20, blank=True, null=True)
    branch = models.CharField(max_length=10, blank=True, null=True)
    productline = models.CharField(max_length=50, blank=True, null=True)
    payment = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'supermarketsales'
