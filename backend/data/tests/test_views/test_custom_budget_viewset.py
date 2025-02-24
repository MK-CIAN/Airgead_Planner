from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from data.models import CustomBudget, BudgetItem
from django.urls import reverse

class CustomBudgetViewSetTest(TestCase):
    def setUp(self):
        """
        Set up the test user, API client, and a custom budget.
        """
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com",
            username="testuser",
            password="testpassword"
        )
        self.friend = get_user_model().objects.create_user(
            email="friend@example.com",
            username="frienduser",
            password="friendpassword"
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.custom_budget = CustomBudget.objects.create(
            user=self.user,
            name="Travel Budget",
            start_date="2024-06-01",
            end_date="2024-12-01"
        )

        self.budget_list_url = reverse("custom-budget-list")
        self.budget_detail_url = reverse("custom-budget-detail", args=[self.custom_budget.id])

    def test_get_custom_budgets(self):
        """Ensure the API returns budgets for the authenticated user."""
        response = self.client.get(self.budget_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.custom_budget.id)

    def test_create_custom_budget(self):
        """Ensure a user can create a new custom budget."""
        data = {
            "name": "New Budget",
            "start_date": "2024-07-01",
            "end_date": "2024-12-31"
        }
        response = self.client.post(self.budget_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CustomBudget.objects.count(), 2)

    def test_add_item_to_custom_budget(self):
        """Ensure we can add an item to a specific custom budget."""
        add_item_url = reverse("custom-budget-add-item", kwargs={"pk": self.custom_budget.id})
        data = {
            "category": "Flights",
            "amount": "500.00",
            "transaction_type": "expense"
        }
        response = self.client.post(add_item_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.custom_budget.items.count(), 1)

    def test_delete_budget_item(self):
        """Ensure we can delete an item from a custom budget."""
        item = BudgetItem.objects.create(
            budget=self.custom_budget,
            category="Hotel",
            amount="300.00",
            transaction_type="expense"
        )
        delete_item_url = reverse("custom-budget-delete-item", kwargs={"pk": self.custom_budget.id, "item_id": item.id})
        response = self.client.delete(delete_item_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.custom_budget.items.count(), 0)

    def test_invite_friend_to_custom_budget(self):
        """Ensure a user can invite a friend to join a budget."""
        invite_url = reverse("custom-budget-invite-friend", kwargs={"pk": self.custom_budget.id})
        data = {"friend_id": self.friend.id}
        response = self.client.post(invite_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
