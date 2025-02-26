from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from data.serializers import *
from data.models import MonthlyBudget, MonthlyBudgetItem, FinancialSuggestion, SavingsGoal
from decimal import Decimal

class MonthlyBudgetSerializerTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com",
            username="testuser",
            password="testpassword"
        )
        self.valid_data = {
            "month": "2024-06-01",
        }
        
    def test_validate_prevents_duplicate_budget(self):
        """Ensure serializer validation prevents duplicate budgets."""
        MonthlyBudget.objects.create(user=self.user, month="2024-06-01")
        serializer = MonthlyBudgetSerializer(data=self.valid_data, context={"request": self._fake_request()})

        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            self.assertIn("non_field_errors", e.detail)
            self.assertEqual(str(e.detail["non_field_errors"][0]), "A budget already exists for this month.")
            return

        self.fail("Expected ValidationError was not raised.")

    def _fake_request(self):
        """Mock request object to simulate authentication in serializer context."""
        class FakeRequest:
            user = self.user
        return FakeRequest()
    
class CustomBudgetSerializerTest(TestCase):
    def setUp(self):
        """Set up test user and custom budget data."""
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com",
            username="testuser",
            password="testpassword"
        )

        self.budget = CustomBudget.objects.create(
            user=self.user,
            name="Vacation Fund",
            start_date="2024-06-01",
            end_date="2024-12-01"
        )

    def test_custom_budget_serialization(self):
        """Ensure CustomBudget is serialized correctly."""
        serializer = CustomBudgetSerializer(self.budget)
        self.assertEqual(serializer.data["name"], "Vacation Fund")
        self.assertEqual(serializer.data["user"], self.user.id)

    def test_readonly_user_field(self):
        """Ensure user field is read-only."""
        serializer = CustomBudgetSerializer(self.budget)
        self.assertEqual(serializer.data["user"], self.user.id)
        
class SavingsGoalSerializerTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="savingsuser@example.com",
            username="savingsuser",
            password="testpassword"
        )
        self.savings_goal = SavingsGoal.objects.create(
            user=self.user,
            name="Car Fund",
            target_amount=Decimal("10000.00"),
            current_amount=Decimal("2000.00"),
            monthly_contribution=Decimal("500.00")
        )

    def test_readonly_user_field(self):
        """Ensure user field is read-only."""
        serializer = SavingsGoalSerializer(self.savings_goal)
        self.assertEqual(serializer.data["user"], self.user.id)

    def test_image_url_field(self):
        """Ensure `image_url` field returns None when no image is set."""
        serializer = SavingsGoalSerializer(self.savings_goal, context={"request": None})
        self.assertIsNone(serializer.data["image_url"])

class LoanSerializerTest(TestCase):
    def setUp(self):
        """Set up test user and loan data."""
        self.user = get_user_model().objects.create_user(
            email="loanuser@example.com",
            username="loanuser",
            password="testpassword"
        )

        self.loan = Loan.objects.create(
            user=self.user,
            name="Home Loan",
            balance=Decimal("200000.00"),
            interest_rate=Decimal("3.5"),
            term_length=360,
            monthly_payment=Decimal("1200.00"),
            total_interest=Decimal("50000.00"),
        )

    def test_loan_serialization(self):
        """Ensure Loan is serialized correctly."""
        serializer = LoanSerializer(self.loan)
        self.assertEqual(serializer.data["name"], "Home Loan")
        self.assertEqual(serializer.data["user"], self.user.id)

    def test_readonly_fields(self):
        """Ensure `user` and `created_at` are read-only."""
        serializer = LoanSerializer(self.loan)
        self.assertIn("user", serializer.fields)
        self.assertIn("created_at", serializer.fields)


class ActiveLoanSerializerTest(TestCase):
    def setUp(self):
        """Set up test user and active loan data."""
        self.user = get_user_model().objects.create_user(
            email="activeloanuser@example.com",
            username="activeloanuser",
            password="testpassword"
        )

        self.active_loan = ActiveLoan.objects.create(
            user=self.user,
            name="Car Loan",
            balance=Decimal("25000.00"),
            interest_rate=Decimal("4.2"),
            term_length=60,
            monthly_payment=Decimal("450.00"),
            total_interest=Decimal("5000.00"),
            original_balance=Decimal("25000.00"),
            extra_payments=Decimal("0.00"),
            payment_due_date="2024-06-01",
            status="active"
        )

    def test_active_loan_serialization(self):
        """Ensure ActiveLoan is serialized correctly."""
        serializer = ActiveLoanSerializer(self.active_loan)
        self.assertEqual(serializer.data["name"], "Car Loan")
        self.assertEqual(serializer.data["user"], self.user.id)
        
class PortfolioSerializerTest(TestCase):
    def setUp(self):
        """Set up test user and portfolio data."""
        self.user = get_user_model().objects.create_user(
            email="portfolio@example.com",
            username="portfoliouser",
            password="testpassword"
        )

        self.portfolio = Portfolio.objects.create(
            user=self.user,
            portfolio_type="personal",
            balance=Decimal("10000.00"),
            totalbalance=Decimal("10000.00")
        )

    def test_portfolio_serialization(self):
        """Ensure Portfolio is serialized correctly."""
        serializer = PortfolioSerializer(self.portfolio)
        self.assertEqual(serializer.data["balance"], "10000.00")


class StockLeagueSerializerTest(TestCase):
    def setUp(self):
        """Set up test user and stock league data."""
        self.user = get_user_model().objects.create_user(
            email="leagueuser@example.com",
            username="leagueuser",
            password="testpassword"
        )

        self.stock_league = StockLeague.objects.create(
            name="Tech League",
            created_by=self.user
        )

    def test_stock_league_serialization(self):
        """Ensure StockLeague is serialized correctly."""
        serializer = StockLeagueSerializer(self.stock_league)
        self.assertEqual(serializer.data["name"], "Tech League")


class FinancialSuggestionSerializerTest(TestCase):
    def test_serialization(self):
        """Ensure FinancialSuggestion is serialized correctly."""
        suggestion = FinancialSuggestion(
            id=1,
            suggestion_text="Consider saving 20% of your income.",
            status="NEW",
            user_feedback=None,
            suggestion_category="Suggestion"
        )
        serializer = FinancialSuggestionSerializer(suggestion)
        self.assertEqual(serializer.data["suggestion_text"], "Consider saving 20% of your income.")

    def test_validation(self):
        """Ensure FinancialSuggestion serializer enforces required fields."""
        invalid_data = {}
        serializer = FinancialSuggestionSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("suggestion_text", serializer.errors)
