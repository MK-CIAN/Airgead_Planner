from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from data.models import FinancialSuggestion, MonthlyBudget
from django.urls import reverse
from unittest.mock import patch

class FinancialSuggestionViewSetTest(TestCase):
    def setUp(self):
        """Set up test user, API client, and sample suggestions."""
        self.user = get_user_model().objects.create_user(
            email="user@example.com",
            username="testuser",
            password="testpassword"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        self.budget = MonthlyBudget.objects.create(user=self.user, month="2024-06-01")

        self.suggestions_url = reverse("financial-suggestions")
        self.analyze_url = reverse("analyze-spending")
        self.generate_url = reverse("generate-suggestions")

        self.suggestion1 = FinancialSuggestion.objects.create(
            user=self.user,
            suggestion_text="Consider increasing your savings contributions.",
            status="NEW",
            suggestion_category="Suggestion"
        )
        self.suggestion2 = FinancialSuggestion.objects.create(
            user=self.user,
            suggestion_text="You're spending too much on entertainment.",
            status="NEW",
            suggestion_category="Analyzation"
        )

        self.accept_url = reverse("accept-suggestion", kwargs={"pk": self.suggestion1.id})
        self.dismiss_url = reverse("dismiss-suggestion", kwargs={"pk": self.suggestion1.id})

    @patch("data.views.FinancialSuggestionViewSet.generate_suggestions")
    def test_generate_suggestions(self, mock_generate):
        """Ensure financial suggestions can be generated."""
        mock_generate.return_value = None  # Simulate suggestion generation
        response = self.client.get(self.generate_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "New financial suggestions have been generated!")

    def test_get_financial_suggestions(self):
        """Ensure the API returns financial suggestions."""
        response = self.client.get(self.suggestions_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Only "Suggestion" category should be returned

    def test_get_spending_analysis(self):
        """Ensure the API returns a spending analysis."""
        response = self.client.get(self.analyze_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_accept_suggestion(self):
        """Ensure a user can accept a suggestion."""
        response = self.client.post(self.accept_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.suggestion1.refresh_from_db()
        self.assertEqual(self.suggestion1.status, "ACCEPTED")
        self.assertTrue(self.suggestion1.user_feedback)

    def test_dismiss_suggestion(self):
        """Ensure a user can dismiss a suggestion."""
        response = self.client.post(self.dismiss_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.suggestion1.refresh_from_db()
        self.assertEqual(self.suggestion1.status, "DISMISSED")
        self.assertFalse(self.suggestion1.user_feedback)
