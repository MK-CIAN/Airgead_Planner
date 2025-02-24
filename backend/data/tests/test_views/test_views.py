from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from data.models import MonthlyBudget
from django.urls import reverse

class MonthlyBudgetViewSetTest(TestCase):
    def setUp(self):
        """
        Set up the test user and API client.
        """
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com",
            username="testuser",
            password="testpassword"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.budget = MonthlyBudget.objects.create(user=self.user, month="2024-03-01")

        self.budget_list_url = reverse("budget-list")
        self.budget_detail_url = reverse("budget-detail", args=[self.budget.id])

    def test_get_budgets(self):
        """Ensure the API returns budgets for the authenticated user."""
        response = self.client.get(self.budget_list_url) 
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.budget.id)

    def test_create_budget(self):
        """Ensure a user can create a new budget."""
        response = self.client.post(self.budget_list_url, {"month": "2024-04-01"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MonthlyBudget.objects.count(), 2)

    def test_duplicate_budget_prevention(self):
        """Ensure the API prevents duplicate budgets for the same month."""
        response = self.client.post(self.budget_list_url, {"month": "2024-03-01"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(MonthlyBudget.objects.count(), 1)

    def test_add_item_to_budget(self):
        """Ensure we can add an item to a specific budget."""
        add_item_url = reverse("monthly-budget-add-item", kwargs={"pk": self.budget.id})
        data = {
            "category": "Groceries",
            "amount": "150.00",
            "transaction_type": "expense"
        }
        response = self.client.post(add_item_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


    def test_delete_budget_item(self):
        """Ensure we can delete a budget item."""
        item = self.budget.items.create(category="Food", amount="50.00", transaction_type="expense")
        delete_item_url = reverse("monthly-budget-delete-item", kwargs={"pk": self.budget.id, "item_id": item.id})
        response = self.client.delete(delete_item_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


