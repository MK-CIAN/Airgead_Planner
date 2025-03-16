from django.test import TestCase
from django.contrib.auth import get_user_model
from data.models import FinancialArticle, UserInterest, UserProfile
from data.views import recommend_articles
from datetime import datetime
from django.utils.timezone import make_aware

class FinancialNewsRecommendationTest(TestCase):
    def setUp(self):
        """Set up test users and articles."""
        self.user_saver = get_user_model().objects.create_user(email="saver@example.com", username="saver", password="password")
        self.user_spender = get_user_model().objects.create_user(email="spender@example.com", username="spender", password="password")
        self.user_balanced = get_user_model().objects.create_user(email="balanced@example.com", username="balanced", password="password")

        # Assign financial profiles
        UserProfile.objects.create(user=self.user_saver, category="SAVER")
        UserProfile.objects.create(user=self.user_spender, category="SPENDER")
        UserProfile.objects.create(user=self.user_balanced, category="BALANCED")

        # Assign user interests
        UserInterest.objects.create(user=self.user_saver, interests=["investment", "retirement", "stocks", "wealth"])
        UserInterest.objects.create(user=self.user_spender, interests=["budget", "saving", "debt", "spending"])
        UserInterest.objects.create(user=self.user_balanced, interests=["economy", "finance", "wealth", "market"])

        # Create more test articles to ensure better recommendations
        self.create_article("Investment Strategies for 2025", ["investment", "stocks", "retirement", "wealth"])
        self.create_article("How to Budget and Save Money", ["budget", "saving", "debt", "spending"])
        self.create_article("Global Economic Trends", ["economy", "finance", "wealth", "market"])
        self.create_article("How to Retire Early with Smart Investing", ["retirement", "investment", "stocks", "savings"])
        self.create_article("Managing Debt: A Guide to Financial Freedom", ["debt", "budget", "saving", "money"])
        self.create_article("Stock Market Predictions for Next Year", ["market", "stocks", "finance", "investment"])

    def create_article(self, title, keywords):
        """Helper function to create financial articles."""
        FinancialArticle.objects.create(
            article_id=title.replace(" ", "_"),
            title=title,
            link="https://example.com",
            description=f"Test financial article about {title}.",
            source_name="Test Source",
            pub_date=make_aware(datetime.now()),
            image_url="https://example.com/image.jpg",
            keywords=keywords
        )

    def print_recommendations(self, user, user_type):
        """Helper function to print recommended articles for a user."""
        recommended_articles = recommend_articles(user)
        print(f"\nRecommended articles for {user_type}:")
        for article_id in recommended_articles:
            article = FinancialArticle.objects.get(id=article_id)
            print(f" - {article.title} (Keywords: {article.keywords})")

    def test_saver_recommendation(self):
        """Test that a SAVER user gets investment and retirement-related news."""
        self.print_recommendations(self.user_saver, "SAVER")
        recommended_articles = recommend_articles(self.user_saver)
        self.assertTrue(any(FinancialArticle.objects.get(id=article_id).title == "Investment Strategies for 2025" for article_id in recommended_articles),
                        "Saver user should receive investment-related news.")
        self.assertTrue(any(FinancialArticle.objects.get(id=article_id).title == "How to Retire Early with Smart Investing" for article_id in recommended_articles),
                        "Saver user should receive retirement-related news.")

    def test_spender_recommendation(self):
        """Test that a SPENDER user gets budgeting and debt-related news."""
        self.print_recommendations(self.user_spender, "SPENDER")
        recommended_articles = recommend_articles(self.user_spender)
        self.assertTrue(any(FinancialArticle.objects.get(id=article_id).title == "How to Budget and Save Money" for article_id in recommended_articles),
                        "Spender user should receive budgeting-related news.")
        self.assertTrue(any(FinancialArticle.objects.get(id=article_id).title == "Managing Debt: A Guide to Financial Freedom" for article_id in recommended_articles),
                        "Spender user should receive debt-related news.")

    def test_balanced_recommendation(self):
        """Test that a BALANCED user gets general financial and market-related news."""
        self.print_recommendations(self.user_balanced, "BALANCED")
        recommended_articles = recommend_articles(self.user_balanced)
        self.assertTrue(any(FinancialArticle.objects.get(id=article_id).title == "Global Economic Trends" for article_id in recommended_articles),
                        "Balanced user should receive economy/finance-related news.")
        self.assertTrue(any(FinancialArticle.objects.get(id=article_id).title == "Stock Market Predictions for Next Year" for article_id in recommended_articles),
                        "Balanced user should receive market-related news.")
