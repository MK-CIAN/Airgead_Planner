from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import *

class MonthlyBudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyBudget
        fields = ['id', 'category', 'amount', 'month', 'user', 'transaction_type']
        read_only_fields = ['user']
        
class BudgetItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetItem
        fields = ['id', 'category', 'amount', 'transaction_type', 'created_at']

class CustomBudgetSerializer(serializers.ModelSerializer):
    contributors = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=get_user_model().objects.all(),
        required=False
    )
    items = BudgetItemSerializer(many=True, read_only=True)  # Include items in the response

    class Meta:
        model = CustomBudget
        fields = [
            'id', 'name', 'start_date', 'end_date', 'user', 'contributors', 'items'
        ]
        read_only_fields = ['user']
        
class SavingsGoalSerializer(serializers.ModelSerializer):
    contributors = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=get_user_model().objects.all(),
        required=False
    )
    
    class Meta:
        model = SavingsGoal
        fields = ['id', 'user', 'name', 'target_amount', 'current_amount', 'start_date', 'target_date', 'monthly_contribution', 'contributors']
        read_only_fields = ['user']

class LoanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = ['id', 'user', 'name', 'balance', 'interest_rate', 'term_length', 'monthly_payment', 'total_interest', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']
        
class IncomeTaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeTax
        fields = [
            'id', 'user', 'salary', 'pension_contribution', 'income_tax',
            'usc', 'prsi', 'total_deductions', 'net_salary', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']  # Only 'user' and 'created_at' are read-only




class StockDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockData
        fields = ['ticker', 'date', 'open_price', 'high_price', 'low_price', 'close_price', 'adj_close_price', 'volume']

class StockHoldingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockHolding
        fields = ['ticker', 'quantity']

class PortfolioSerializer(serializers.ModelSerializer):
    holdings = StockHoldingSerializer(many=True, read_only=True)

    class Meta:
        model = Portfolio
        fields = ['balance', 'holdings']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['ticker', 'transaction_type', 'quantity', 'price_per_share', 'date']
        
class PortfolioHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioHistory
        fields = ['timestamp', 'total_value', 'cash_balance', 'transaction_label']

class FinancialArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialArticle
        fields = [
            "id", "article_id", "title", "link", "description", "source_name", "pub_date", "image_url", "keywords"]