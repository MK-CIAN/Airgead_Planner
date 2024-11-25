from rest_framework import serializers
from .models import *

class BranchDataSerializer(serializers.Serializer):
    id = serializers.CharField()  # This will be used as the id in the chart
    total_sales = serializers.DecimalField(max_digits=10, decimal_places=2)  # Total sales as a decimal
    label = serializers.CharField()  # Use branch name for the label

class MonthlyBudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyBudget
        fields = ['id', 'category', 'amount', 'month', 'user', 'transaction_type']
        read_only_fields = ['user']

class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = ['id', 'user', 'name', 'target_amount', 'current_amount', 'start_date', 'target_date', 'monthly_contribution']
        read_only_fields = ['user']

class LoanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = ['id', 'user', 'name', 'balance', 'interest_rate', 'term_length', 'monthly_payment', 'total_interest', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']

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

class FinancialArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialArticle
        fields = [
            "id", "article_id", "title", "link", "description", "source_name", "pub_date", "image_url", "keywords"]