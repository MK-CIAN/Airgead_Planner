from django.test import TestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
from data.models import *

class MonthlyBudgetModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com",  # ✅ Added required email field
            username="testuser",
            password="testpassword"
        )
        self.budget = MonthlyBudget.objects.create(
            user=self.user,
            month="2024-03-01"
        )

    def test_budget_creation(self):
        """Test that a MonthlyBudget instance is created properly"""
        self.assertEqual(self.budget.user, self.user)
        self.assertEqual(str(self.budget.month), "2024-03-01")

    def test_budget_unique_constraint(self):
        """Test that a user cannot have duplicate budgets for the same month"""
        with self.assertRaises(Exception):
            MonthlyBudget.objects.create(user=self.user, month="2024-03-01")
            
class MonthlyBudgetItemModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="budgetuser@example.com",
            username="budgetuser",
            password="testpassword"
        )
        self.budget = MonthlyBudget.objects.create(user=self.user, month="2024-03-01")
        self.item = MonthlyBudgetItem.objects.create(
            budget=self.budget,
            category="Groceries",
            amount=Decimal("150.00"),
            transaction_type="expense"
        )

    def test_budget_item_creation(self):
        """Ensure MonthlyBudgetItem is correctly associated with MonthlyBudget"""
        self.assertEqual(self.item.budget, self.budget)
        self.assertEqual(self.item.category, "Groceries")
        self.assertEqual(self.item.amount, Decimal("150.00"))
        self.assertEqual(self.item.transaction_type, "expense")
        
class CustomBudgetModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="custombudgetuser@example.com",
            username="custombudgetuser",
            password="securepassword"
        )
        self.custom_budget = CustomBudget.objects.create(
            user=self.user,
            name="Holiday Fund",
            start_date="2024-06-01",
            end_date="2024-12-01"
        )
        self.budget_item = BudgetItem.objects.create(
            budget=self.custom_budget,
            category="Travel",
            amount=Decimal("1000.00"),
            transaction_type="expense"
        )

    def test_custom_budget_creation(self):
        """Ensure CustomBudget is correctly created"""
        self.assertEqual(self.custom_budget.user, self.user)
        self.assertEqual(self.custom_budget.name, "Holiday Fund")

    def test_budget_item_creation(self):
        """Ensure BudgetItem is correctly linked to CustomBudget"""
        self.assertEqual(self.budget_item.budget, self.custom_budget)
        self.assertEqual(self.budget_item.category, "Travel")
        self.assertEqual(self.budget_item.amount, Decimal("1000.00"))

class SavingsGoalModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="savingsuser@example.com",  # ✅ Fixed missing email
            username="savingsuser",
            password="securepassword"
        )
        self.savings_goal = SavingsGoal.objects.create(
            user=self.user,
            name="Vacation Fund",
            target_amount=Decimal("2000.00"),
            current_amount=Decimal("500.00"),
            monthly_contribution=Decimal("250.00"),
        )

    def test_savings_goal_creation(self):
        """Ensure the SavingsGoal model stores data correctly"""
        self.assertEqual(self.savings_goal.user, self.user)
        self.assertEqual(self.savings_goal.name, "Vacation Fund")
        self.assertEqual(self.savings_goal.target_amount, Decimal("2000.00"))
        self.assertEqual(self.savings_goal.current_amount, Decimal("500.00"))

    def test_savings_goal_contributions(self):
        """Test updating current savings amount"""
        self.savings_goal.current_amount += Decimal("250.00")
        self.savings_goal.save()
        self.assertEqual(self.savings_goal.current_amount, Decimal("750.00"))


class LoanModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="loanuser@example.com",  # ✅ Fixed missing email
            username="loanuser",
            password="loansecurepass"
        )
        self.loan = Loan.objects.create(
            user=self.user,
            name="Car Loan",
            balance=Decimal("10000.00"),
            interest_rate=Decimal("5.5"),
            term_length=60,
            monthly_payment=Decimal("200.00"),
            total_interest=Decimal("1200.00"),
        )

    def test_loan_creation(self):
        """Ensure the Loan model stores correct data"""
        self.assertEqual(self.loan.user, self.user)
        self.assertEqual(self.loan.name, "Car Loan")
        self.assertEqual(self.loan.balance, Decimal("10000.00"))
        self.assertEqual(self.loan.interest_rate, Decimal("5.5"))

    def test_string_representation(self):
        """Ensure the __str__ method returns the expected output"""
        self.assertEqual(str(self.loan), "Car Loan")


class ActiveLoanModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="activeloanuser@example.com",  # ✅ Fixed missing email
            username="activeloanuser",
            password="securepass"
        )
        self.active_loan = ActiveLoan.objects.create(
            user=self.user,
            name="Mortgage",
            balance=Decimal("250000.00"),
            interest_rate=Decimal("3.2"),
            term_length=360,
            monthly_payment=Decimal("1200.00"),
            total_interest=Decimal("100000.00"),
            original_balance=Decimal("250000.00"),
            extra_payments=Decimal("0.00"),
            payment_due_date="2024-04-01",
        )

    def test_loan_payment_updates_balance(self):
        """Ensure making a payment reduces the balance"""
        self.active_loan.update_remaining_balance(Decimal("1200.00"))
        self.assertEqual(self.active_loan.balance, Decimal("248800.00"))

    def test_loan_fully_paid(self):
        """Ensure loan status updates to 'paid' when balance reaches zero"""
        self.active_loan.update_remaining_balance(Decimal("250000.00"))
        self.assertEqual(self.active_loan.balance, Decimal("0.00"))
        self.assertEqual(self.active_loan.status, "paid")
        
class IncomeTaxModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="taxuser@example.com",
            username="taxuser",
            password="testpassword"
        )
        self.income_tax = IncomeTax.objects.create(
            user=self.user,
            salary=Decimal("50000.00"),
            pension_contribution=Decimal("5000.00"),
            taxable_income=Decimal("45000.00"),
            income_tax=Decimal("9000.00"),
            tax_credit=Decimal("3000.00"),
            net_tax=Decimal("6000.00"),
            usc=Decimal("1000.00"),
            prsi=Decimal("2000.00"),
            total_deductions=Decimal("9000.00"),
            net_salary=Decimal("41000.00"),
            net_monthly=Decimal("3416.67"),
            net_weekly=Decimal("788.46"),
        )

    def test_income_tax_calculation(self):
        """Ensure IncomeTax model correctly stores tax details"""
        self.assertEqual(self.income_tax.net_salary, Decimal("41000.00"))
        self.assertEqual(self.income_tax.net_monthly, Decimal("3416.67"))
        self.assertEqual(self.income_tax.net_weekly, Decimal("788.46"))
        
class PensionProjectionModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="pensionuser@example.com",
            username="pensionuser",
            password="securepassword"
        )
        self.pension_projection = PensionProjection.objects.create(
            user=self.user,
            starting_age=25,
            retirement_age=65,
            annual_salary=Decimal("55000.00"),
            contribution_rate=Decimal("5.00"),
            employer_match=Decimal("3.00"),
            roi=Decimal("6.00"),
            total_contributions=Decimal("200000.00"),
            total_growth=Decimal("150000.00"),
            final_pension_balance=Decimal("350000.00"),
        )

    def test_pension_projection_values(self):
        """Ensure PensionProjection stores correct projections"""
        self.assertEqual(self.pension_projection.total_contributions, Decimal("200000.00"))
        self.assertEqual(self.pension_projection.final_pension_balance, Decimal("350000.00"))


class PortfolioModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="portfolio@example.com",
            username="portfolioUser",
            password="securepassword"
        )
        self.portfolio = Portfolio.objects.create(
            user=self.user,
            portfolio_type="personal",
            balance=Decimal("10000.00"),
            totalbalance=Decimal("11000.00"),
        )
        self.stock_holding = StockHolding.objects.create(
            portfolio=self.portfolio,
            ticker="AAPL",
            quantity=Decimal("5.00")
        )

    def test_portfolio_creation(self):
        """Ensure Portfolio model is correctly initialized"""
        self.assertEqual(self.portfolio.user, self.user)
        self.assertEqual(self.portfolio.balance, Decimal("10000.00"))

    def test_stock_holding_creation(self):
        """Ensure StockHolding model is correctly linked"""
        self.assertEqual(self.stock_holding.portfolio, self.portfolio)
        self.assertEqual(self.stock_holding.ticker, "AAPL")
        self.assertEqual(self.stock_holding.quantity, Decimal("5.00"))

class TransactionModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="transaction@example.com",
            username="transactionUser",
            password="securepassword"
        )
        self.portfolio = Portfolio.objects.create(user=self.user)
        self.transaction = Transaction.objects.create(
            portfolio=self.portfolio,
            ticker="GOOGL",
            transaction_type="buy",
            quantity=Decimal("2.00"),
            price_per_share=Decimal("2800.00"),
        )

    def test_transaction_creation(self):
        """Ensure Transaction model is correctly stored"""
        self.assertEqual(self.transaction.ticker, "GOOGL")
        self.assertEqual(self.transaction.quantity, Decimal("2.00"))

class FinancialSuggestionModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="suggestion@example.com",
            username="suggestionUser",
            password="securepassword"
        )
        self.suggestion = FinancialSuggestion.objects.create(
            user=self.user,
            suggestion_text="You should consider diversifying your investments.",
            status="NEW"
        )

    def test_suggestion_creation(self):
        """Ensure FinancialSuggestion model stores data correctly"""
        self.assertEqual(self.suggestion.user, self.user)
        self.assertEqual(self.suggestion.status, "NEW")

class UserInterestModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="interest@example.com",
            username="interestUser",
            password="securepassword"
        )
        self.user_interest = UserInterest.objects.create(
            user=self.user,
            interests=["Stocks", "Real Estate"]
        )

    def test_user_interest_creation(self):
        """Ensure UserInterest model stores data correctly"""
        self.assertEqual(self.user_interest.interests, ["Stocks", "Real Estate"])
