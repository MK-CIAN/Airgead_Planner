from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from data.models import IncomeTax

class IncomeTaxViewSetTest(TestCase):
    def setUp(self):
        """
        Set up the test user and authenticated client.
        """
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com",
            username="testuser",
            password="testpassword"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # URL from the router (basename='income') → income-tax-list
        self.income_tax_list_url = reverse("income-list")

        # Create an IncomeTax instance for retrieval tests
        self.tax = IncomeTax.objects.create(
            user=self.user,
            salary=60000,
            pension_contribution=5000,
            taxable_income=55000,
            income_tax=11000,
            tax_credit=3300,
            net_tax=7700,
            usc=1200,
            prsi=2400,
            total_deductions=11300,
            net_salary=48700,
            net_monthly=4058.33,
            net_weekly=936.54
        )
        self.income_tax_detail_url = reverse("income-detail", args=[self.tax.id])

    def test_get_income_tax_list(self):
        """Test retrieving income tax records for authenticated user."""
        response = self.client.get(self.income_tax_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.tax.id)

    def test_create_income_tax(self):
        """Test creating a new income tax entry."""
        data = {
            "salary": 70000,
            "pension_contribution": 7000,
            "taxable_income": 63000,
            "income_tax": 12600,
            "tax_credit": 3500,
            "net_tax": 9100,
            "usc": 1400,
            "prsi": 2600,
            "total_deductions": 13100,
            "net_salary": 56900,
            "net_monthly": 4741.67,
            "net_weekly": 1094.23
        }
        response = self.client.post(self.income_tax_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(IncomeTax.objects.count(), 2)
        self.assertEqual(IncomeTax.objects.last().user, self.user)

    def test_retrieve_income_tax_detail(self):
        """Test retrieving a specific income tax record."""
        response = self.client.get(self.income_tax_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.tax.id)

    def test_unauthenticated_access_denied(self):
        """Test access is denied for unauthenticated users."""
        self.client.force_authenticate(user=None)
        response = self.client.get(self.income_tax_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
