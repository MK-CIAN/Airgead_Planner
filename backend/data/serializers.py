from rest_framework import serializers
from .models import *

class SupermarketsalesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supermarketsales
        fields = '__all__'

class BranchDataSerializer(serializers.Serializer):
    id = serializers.CharField()  # This will be used as the id in the chart
    total_sales = serializers.DecimalField(max_digits=10, decimal_places=2)  # Total sales as a decimal
    label = serializers.CharField()  # Use branch name for the label

class MonthlyBudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyBudget
        fields = ['category', 'amount', 'month', 'user', 'transaction_type']
        read_only_fields = ['user']