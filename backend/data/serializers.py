from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import *

class MonthlyBudgetItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyBudgetItem
        fields = ['id', 'category', 'amount', 'transaction_type', 'created_at']

class MonthlyBudgetSerializer(serializers.ModelSerializer):
    items = MonthlyBudgetItemSerializer(many=True, read_only=True)  # Include items in response

    class Meta:
        model = MonthlyBudget
        fields = ['id', 'month', 'user', 'items']
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
    image_url = serializers.SerializerMethodField()  # Add this field

    class Meta:
        model = SavingsGoal
        fields = [
            'id',
            'user',
            'name',
            'target_amount',
            'current_amount',
            'start_date',
            'target_date',
            'monthly_contribution',
            'contributors',
            'image',
            'image_url',  # Include the image URL
        ]
        read_only_fields = ['user']

    def get_image_url(self, obj):
        """
        Return the full URL for the image field if it exists.
        """
        request = self.context.get('request')  # Get the current request context
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None


class LoanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = ['id', 'user', 'name', 'balance', 'interest_rate', 'term_length', 'monthly_payment', 'total_interest', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']
        
class LoanPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanPayment
        fields = ['id', 'loan', 'amount', 'payment_date']

class ActiveLoanSerializer(serializers.ModelSerializer):
    payments = LoanPaymentSerializer(many=True, read_only=True)

    class Meta:
        model = ActiveLoan
        fields = [
            'id', 'user', 'name', 'original_balance', 'balance', 'interest_rate', 'term_length',
            'monthly_payment', 'total_interest', 'payment_due_date', 'extra_payments',
            'next_payment_date', 'status', 'created_at', 'payments'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'status', 'payments']
        
class IncomeTaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeTax
        fields = [
            'id', 'user', 'salary', 'pension_contribution', 'taxable_income', 'income_tax', 'tax_credit', 'net_tax',
            'usc', 'prsi', 'total_deductions', 'net_salary', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']  # Only 'user' and 'created_at' are read-only

class PensionProjectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PensionProjection
        fields = ['id', 'user', 'starting_age', 'retirement_age', 'annual_salary', 'contribution_rate',
                  'employer_match', 'roi', 'total_contributions', 'total_growth', 'final_pension_balance', 'created_at'
        ]
        
        read_only_fields = ['id', 'user', 'created_at']  # Only 'user' and 'created_at' are read-only
        
class StockDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockData
        fields = ['ticker', 'date', 'open_price', 'high_price', 'low_price', 'close_price', 'adj_close_price', 'volume']

class StockRealTimeDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockRealTimeData
        fields = ['ticker', 'timestamp', 'open_price', 'high_price', 'low_price', 'close_price', 'volume']


class StockHoldingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockHolding
        fields = ['ticker', 'quantity']

class PortfolioSerializer(serializers.ModelSerializer):
    holdings = StockHoldingSerializer(many=True, read_only=True)

    class Meta:
        model = Portfolio
        fields = ['balance', 'totalbalance', 'holdings']

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
        
class FinancialSuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialSuggestion
        fields = ["id", "suggestion_text", "created_at", "status", "user_feedback", "suggestion_category"]