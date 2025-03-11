from django.test import TestCase
from django.contrib.auth import get_user_model
from data.models import MonthlyBudget, MonthlyBudgetItem, UserProfile
from data.utils.user_classification import classify_user
from decimal import Decimal

class UserClassificationTest(TestCase):
    def setUp(self):
        """Set up test user and budgets."""
        self.user = get_user_model().objects.create_user(
            email="test@example.com",
            username="testuser",
            password="testpassword"
        )

    def create_budget(self, income, savings, expenses, debt):
        """Helper function to create a budget with given values."""
        budget = MonthlyBudget.objects.create(user=self.user, month="2024-06-01")

        MonthlyBudgetItem.objects.create(budget=budget, transaction_type="income", amount=Decimal(income))
        MonthlyBudgetItem.objects.create(budget=budget, transaction_type="savings", amount=Decimal(savings))
        MonthlyBudgetItem.objects.create(budget=budget, transaction_type="expense", amount=Decimal(expenses))
        MonthlyBudgetItem.objects.create(budget=budget, transaction_type="debt", amount=Decimal(debt))

    def test_saver_classification(self):
        """Test classification for a Saver user (high savings rate)."""
        self.create_budget(income=1000, savings=500, expenses=300, debt=100)  # High savings

        category = classify_user(self.user)
        self.assertEqual(category, "SAVER", f"Expected SAVER but got {category}")

    def test_spender_classification(self):
        """Test classification for a Spender user (high expenses)."""
        self.create_budget(income=1000, savings=100, expenses=800, debt=50)  # High expenses

        category = classify_user(self.user)
        self.assertEqual(category, "SPENDER", f"Expected SPENDER but got {category}")

    def test_balanced_classification(self):
        """Test classification for a Balanced user (moderate spending/savings)."""
        self.create_budget(income=1000, savings=200, expenses=500, debt=100)  # Balanced spending

        category = classify_user(self.user)
        self.assertEqual(category, "BALANCED", f"Expected BALANCED but got {category}")

    def test_no_budget_data(self):
        """Test classification when user has no budget data (should default to BALANCED)."""
        category = classify_user(self.user)
        self.assertEqual(category, "BALANCED", f"Expected BALANCED but got {category}")
