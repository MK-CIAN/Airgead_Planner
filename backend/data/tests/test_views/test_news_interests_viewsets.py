from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from data.models import UserInterest, FinancialArticle
from django.urls import reverse
from unittest.mock import patch
from django.utils.timezone import now, make_aware
from datetime import datetime

class UserInterestsViewTest(TestCase):
    def setUp(self):
        """Set up test user and API client."""
        self.user = get_user_model().objects.create_user(
            email="user@example.com",
            username="testuser",
            password="testpassword"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.interests_url = reverse("user-interests")

    def test_set_user_interests(self):
        """Ensure users can save their interests."""
        data = {"interests": ["stocks", "crypto"]}
        response = self.client.post(self.interests_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(UserInterest.objects.filter(user=self.user).exists())
        self.assertEqual(UserInterest.objects.get(user=self.user).interests, ["stocks", "crypto"])

    def test_set_invalid_interests(self):
        """Ensure invalid interests input is handled."""
        data = {"interests": "stocks"}  # Not a list
        response = self.client.post(self.interests_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_user_interests(self):
        """Ensure users can retrieve their saved interests."""
        UserInterest.objects.create(user=self.user, interests=["forex", "real estate"])
        response = self.client.get(self.interests_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["interests"], ["forex", "real estate"])

    def test_get_user_interests_empty(self):
        """Ensure an empty list is returned if no interests are set."""
        response = self.client.get(self.interests_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["interests"], [])


class RecommendedArticlesViewTest(TestCase):
    def setUp(self):
        """Set up test user, API client, and sample articles."""
        self.user = get_user_model().objects.create_user(
            email="user@example.com",
            username="testuser",
            password="testpassword"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.articles_url = reverse("reccomended-articles")

        self.article1 = FinancialArticle.objects.create(
            article_id="1", title="Stock Market Trends", source_name="Finance News",
            pub_date=make_aware(datetime(2024, 6, 1)),
            keywords=["stocks"]
        )
        self.article2 = FinancialArticle.objects.create(
            article_id="2", title="Bitcoin Hits New High", source_name="Crypto News",
            pub_date=make_aware(datetime(2024, 6, 2)),
            keywords=["crypto"]
        )

    @patch("data.views.recommend_articles")
    def test_get_recommended_articles(self, mock_recommend):
        """Ensure the API returns recommended articles based on interests."""
        UserInterest.objects.create(user=self.user, interests=["stocks", "crypto"])
        mock_recommend.return_value = [self.article1.id, self.article2.id]

        response = self.client.get(self.articles_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["title"], "Stock Market Trends")
        self.assertEqual(response.data[1]["title"], "Bitcoin Hits New High")

    @patch("data.views.recommend_articles")
    def test_get_recommended_articles_no_results(self, mock_recommend):
        """Ensure an empty list is returned when no relevant articles exist."""
        UserInterest.objects.create(user=self.user, interests=["real estate"])
        mock_recommend.return_value = []  # No matching articles

        response = self.client.get(self.articles_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])
