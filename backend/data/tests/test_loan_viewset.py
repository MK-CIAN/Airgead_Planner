from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from data.models import Loan, ActiveLoan, LoanPayment
from django.urls import reverse
from decimal import Decimal

class LoanViewSetTest(TestCase):
    def setUp(self):
        """
        Set up test users, API client, and loan instances.
        """
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com",
            username="testuser",
            password="testpassword"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.loan = Loan.objects.create(
            user=self.user,
            name="Car Loan",
            balance=Decimal("20000.00"),
            interest_rate=Decimal("5.5"),
            term_length=60,
            monthly_payment=Decimal("400.00"),
            total_interest=Decimal("5000.00")
        )

        self.loan_list_url = reverse("loans-list")
        self.loan_detail_url = reverse("loans-detail", args=[self.loan.id])

    def test_get_loans(self):
        """Ensure the API returns loans for the authenticated user."""
        response = self.client.get(self.loan_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.loan.id)

    def test_create_loan(self):
        """Ensure a user can create a new loan."""
        data = {
            "name": "Personal Loan",
            "balance": "10000.00",
            "interest_rate": "4.5",
            "term_length": 48,
            "monthly_payment": "250.00",
            "total_interest": "2000.00"
        }
        response = self.client.post(self.loan_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Loan.objects.count(), 2)


class ActiveLoanViewSetTest(TestCase):
    def setUp(self):
        """
        Set up test users, API client, and active loan instances.
        """
        self.user = get_user_model().objects.create_user(
            email="activeloanuser@example.com",
            username="activeloanuser",
            password="testpassword"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

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
            status="active"
        )

        self.active_loan_list_url = reverse("active-loan-list")
        self.active_loan_detail_url = reverse("active-loan-detail", args=[self.active_loan.id])
        self.make_payment_url = reverse("active-loan-make-payment", args=[self.active_loan.id])
        self.delete_loan_url = reverse("active-loan-delete-loan", args=[self.active_loan.id])

    def test_get_active_loans(self):
        """Ensure the API returns active loans for the authenticated user."""
        response = self.client.get(self.active_loan_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.active_loan.id)

    def test_create_active_loan(self):
        """Ensure a user can create a new active loan."""
        data = {
            "name": "Home Loan",
            "balance": "150000.00",
            "interest_rate": "3.5",
            "term_length": 300,
            "monthly_payment": "800.00",
            "total_interest": "60000.00",
            "payment_due_date": "2024-06-01"
        }
        response = self.client.post(self.active_loan_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ActiveLoan.objects.count(), 2)

    def test_make_payment(self):
        """Ensure making a payment reduces the loan balance correctly."""
        data = {"amount": "5000.00"}
        response = self.client.post(self.make_payment_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Refresh the loan instance and check the balance
        self.active_loan.refresh_from_db()
        self.assertEqual(self.active_loan.balance, Decimal("245000.00"))

    def test_fully_paid_loan_updates_status(self):
        """Ensure the loan is marked as 'paid' when balance reaches zero."""
        data = {"amount": "250000.00"}
        response = self.client.post(self.make_payment_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Refresh the loan instance and check the status
        self.active_loan.refresh_from_db()
        self.assertEqual(self.active_loan.balance, Decimal("0.00"))
        self.assertEqual(self.active_loan.status, "paid")

    def test_delete_loan(self):
        """Ensure deleting a loan removes all associated payments."""
        # Make a payment first
        LoanPayment.objects.create(loan=self.active_loan, amount=Decimal("1000.00"))

        response = self.client.delete(self.delete_loan_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Ensure loan and payments are deleted
        self.assertFalse(ActiveLoan.objects.filter(id=self.active_loan.id).exists())
        self.assertFalse(LoanPayment.objects.filter(loan=self.active_loan).exists())
