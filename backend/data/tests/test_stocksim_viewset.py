from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from data.models import StockData, StockRealTimeData, Portfolio, StockHolding, StockLeague
from django.urls import reverse
from decimal import Decimal
from django.utils.timezone import now

class StockDataViewSetTest(TestCase):
    def setUp(self):
        """Set up test users, API client, and stock data."""
        self.user = get_user_model().objects.create_user(
            email="stockuser@example.com",
            username="stockuser",
            password="testpassword"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.stock_data = StockData.objects.create(
            ticker="AAPL",
            date="2024-06-01",
            open_price=Decimal("150.00"),
            high_price=Decimal("155.00"),
            low_price=Decimal("148.00"),
            close_price=Decimal("152.00"),
            volume=1000000
        )

        self.stock_data_url = reverse("stocks-list") + "?ticker=AAPL"

    def test_get_stock_data(self):
        """Ensure stock data can be retrieved."""
        response = self.client.get(self.stock_data_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["ticker"], "AAPL")

    def test_missing_ticker(self):
        """Ensure missing ticker returns error."""
        response = self.client.get(reverse("stocks-list"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class StockRealTimeDataViewSetTest(TestCase):
    def setUp(self):
        """Set up test users, API client, and real-time stock data."""
        self.user = get_user_model().objects.create_user(
            email="realstockuser@example.com",
            username="realstockuser",
            password="testpassword"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.real_time_stock = StockRealTimeData.objects.create(
            ticker="GOOGL",
            timestamp=now(),
            open_price=Decimal("2800.00"),
            high_price=Decimal("2850.00"),
            low_price=Decimal("2780.00"),
            close_price=Decimal("2825.00"),
            volume=500000
        )

        self.real_time_stock_url = reverse("stocks-realtime-list") + "?ticker=GOOGL"

    def test_get_real_time_stock_data(self):
        """Ensure real-time stock data can be retrieved."""
        response = self.client.get(self.real_time_stock_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["ticker"], "GOOGL")

    def test_missing_ticker_real_time(self):
        """Ensure missing ticker returns error."""
        response = self.client.get(reverse("stocks-realtime-list"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class PortfolioViewSetTest(TestCase):
    def setUp(self):
        """Set up test users, API client, and portfolio."""
        self.user = get_user_model().objects.create_user(
            email="portfoliouser@example.com",
            username="portfoliouser",
            password="testpassword"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.portfolio = Portfolio.objects.create(
            user=self.user,
            portfolio_type="personal",
            balance=Decimal("10000.00"),
            totalbalance=Decimal("10000.00")
        )

        self.portfolio_list_url = reverse("portfolio-list")

    def test_get_portfolio(self):
        """Ensure the API returns the portfolio for the authenticated user."""
        response = self.client.get(self.portfolio_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_buy_stock(self):
        """Ensure buying a stock updates portfolio correctly."""
        buy_data = {
            "ticker": "TSLA",
            "transaction_type": "BUY",
            "quantity": "2.00",
            "price_per_share": "600.00"
        }
        response = self.client.post(self.portfolio_list_url, buy_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_sell_stock(self):
        """Ensure selling a stock updates portfolio correctly."""
        StockHolding.objects.create(portfolio=self.portfolio, ticker="TSLA", quantity=Decimal("2.00"))

        sell_data = {
            "ticker": "TSLA",
            "transaction_type": "SELL",
            "quantity": "1.00",
            "price_per_share": "610.00"
        }
        response = self.client.post(self.portfolio_list_url, sell_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class StockLeagueViewSetTest(TestCase):
    def setUp(self):
        """Set up test users, API client, and stock league."""
        self.user = get_user_model().objects.create_user(
            email="leagueuser@example.com",
            username="leagueuser",
            password="testpassword"
        )
        self.friend = get_user_model().objects.create_user(
            email="friend@example.com",
            username="frienduser",
            password="friendpassword"
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.stock_league = StockLeague.objects.create(
            name="Tech League",
            created_by=self.user
        )
        self.stock_league.members.add(self.user)

        self.league_list_url = reverse("leagues-list")
        self.league_detail_url = reverse("leagues-detail", args=[self.stock_league.id])
        self.league_invite_url = reverse("leagues-invite-friend", kwargs={"pk": self.stock_league.id})

    def test_get_leagues(self):
        """Ensure the API returns leagues for the authenticated user."""
        response = self.client.get(self.league_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.stock_league.id)

    def test_invite_friend_to_league(self):
        """Ensure a user can invite a friend to a league."""
        data = {"friend_id": self.friend.id}
        response = self.client.post(self.league_invite_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
