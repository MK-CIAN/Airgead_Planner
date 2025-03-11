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
        
    def validate(self, data):
        user = self.context["request"].user
        month = data.get("month")

        if MonthlyBudget.objects.filter(user=user, month=month).exists():
            raise serializers.ValidationError({"non_field_errors": ["A budget already exists for this month."]})

        return data

        
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

class SavingsContributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsContribution
        fields = ['id', 'savings_goal', 'amount', 'contribution_date']

class SavingsGoalSerializer(serializers.ModelSerializer):
    contributions = SavingsContributionSerializer(many=True, read_only=True)
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
            'contributions',
        ]
        read_only_fields = ['user']

    def get_image_url(self, obj):
        """
        Return the full URL for the image field if it exists.
        """
        request = self.context.get('request')  # Get the current request context
        if obj.image and request:
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
            'usc', 'prsi', 'total_deductions', 'net_salary', 'net_monthly', 'net_weekly', 'created_at'
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
        fields = ['portfolio_type', 'league_id', 'balance', 'totalbalance', 'holdings']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['ticker', 'transaction_type', 'quantity', 'price_per_share', 'date']
        
class PortfolioHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioHistory
        fields = ['portfolio', 'timestamp', 'total_value', 'cash_balance', 'transaction_label']
        
class StockLeagueSerializer(serializers.ModelSerializer):
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    is_creator = serializers.SerializerMethodField()
    members = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = StockLeague
        fields = ["id", "name", "created_by", "members", "created_at", "is_creator"]
        read_only_fields = ["id", "created_by", "members", "created_at", "is_creator"]
        
    def get_is_creator(self, obj):
        """Check if the logged-in user is the creator of the league."""
        request = self.context.get("request")  # Get request context
        return request.user == obj.created_by if request else False

class FinancialArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialArticle
        fields = [
            "id", "article_id", "title", "link", "description", "source_name", "pub_date", "image_url", "keywords"]
        
class FinancialSuggestionSerializer(serializers.ModelSerializer):
    suggestion_category = serializers.CharField(source="suggestion_type.category")  # Fetch category name
    acceptance_rate = serializers.SerializerMethodField()  # Fetch category-wide acceptance rate

    class Meta:
        model = FinancialSuggestion
        fields = ["id", "suggestion_text", "created_at", "status", "suggestion_category", "acceptance_rate"]

    def get_acceptance_rate(self, obj):
        if obj.suggestion_type:
            total_accepted = obj.suggestion_type.total_accepted
            total_declined = obj.suggestion_type.total_declined
            total_responses = total_accepted + total_declined

            return round((total_accepted / total_responses) * 100, 1) if total_responses > 0 else 0
        return 0