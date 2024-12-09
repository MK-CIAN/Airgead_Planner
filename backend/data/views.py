from decimal import Decimal
from django.shortcuts import render
from rest_framework import viewsets, permissions
from .serializers import *
from .models import *
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import F, Sum
from datetime import datetime, timedelta
from data.utils.news_utils import recommend_articles

# Monthly Budget Viewset
class MonthlyBudgetViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MonthlyBudgetSerializer

    def get_queryset(self):
        month = self.request.query_params.get('month')
        queryset = MonthlyBudget.objects.filter(user=self.request.user)
        if month:
            queryset = queryset.filter(month__startswith=month)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Savings Goal Viewset
class SavingsGoalViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SavingsGoalSerializer

    def get_queryset(self):
        queryset = SavingsGoal.objects.filter(user=self.request.user)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Loans Viewset
class LoanViewSet(viewsets.ModelViewSet):
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return only loans for the authenticated user
        return Loan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically associate the loan with the authenticated user
        serializer.save(user=self.request.user)

# Stock Data Viewset
class StockDataViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        # Fetch the latest stock data for each FAANG stock
        ticker = request.query_params.get('ticker')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date', datetime.now().date())

        if not ticker:
            return Response({'error': 'Please provide a ticker'}, status=400)

        start_date = start_date or (datetime.now() - timedelta(days=365)).date()  # Defaulting to 1 year ago

        stock_data = StockData.objects.filter(
            ticker=ticker,
            date__range=[start_date, end_date]
        ).order_by('date')

        serializer = StockDataSerializer(stock_data, many=True)
        return Response(serializer.data)

# Portfolio Viewset
class PortfolioViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def _get_stock_price(self, ticker):
        """
        Retrieve the latest stock price for the given ticker.
        """
        latest_stock = StockData.objects.filter(ticker=ticker).order_by('-date').first()
        if latest_stock:
            return latest_stock.close_price
        return 0  # Return 0 if no stock data is available

    def list(self, request):
        portfolio, created = Portfolio.objects.get_or_create(user=request.user)
        holdings = StockHolding.objects.filter(portfolio=portfolio)

        response_data = {
            "balance": str(portfolio.balance),
            "holdings": [
                {
                    "ticker": h.ticker,
                    "quantity": h.quantity,
                    "current_price": self._get_stock_price(h.ticker),  # Include current stock price
                }
                for h in holdings
            ],
        }
        return Response(response_data)

    def create(self, request):
        portfolio = Portfolio.objects.get(user=request.user)
        ticker = request.data.get("ticker")
        transaction_type = request.data.get("transaction_type")
        quantity = int(request.data.get("quantity", 0))
        price_per_share = float(request.data.get("price_per_share", 0))

        if not ticker or quantity <= 0 or price_per_share <= 0:
            return Response({"error": "Invalid transaction data"}, status=400)

        if transaction_type == "BUY":
            return self._buy_stock(portfolio, ticker, quantity, price_per_share)
        elif transaction_type == "SELL":
            return self._sell_stock(portfolio, ticker, quantity, price_per_share)
        else:
            return Response({"error": "Invalid transaction type"}, status=400)

    def _buy_stock(self, portfolio, ticker, quantity, price_per_share):
        total_cost = Decimal(quantity) * Decimal(price_per_share)

        if portfolio.balance < total_cost:
            return Response({"error": "Insufficient balance"}, status=400)

        portfolio.balance -= total_cost
        portfolio.save()

        holding, created = StockHolding.objects.get_or_create(
            portfolio=portfolio, ticker=ticker, defaults={"quantity": 0}
        )
        holding.quantity += quantity
        holding.save()

        transaction = Transaction.objects.create(
            portfolio=portfolio,
            ticker=ticker,
            transaction_type="BUY",
            quantity=quantity,
            price_per_share=Decimal(price_per_share),
        )

        self._update_portfolio_history(
            portfolio=portfolio, transaction_type="BUY", ticker=ticker, quantity=quantity
        )

        return Response(TransactionSerializer(transaction).data)

    def _sell_stock(self, portfolio, ticker, quantity, price_per_share):
        quantity = int(quantity)
        price_per_share = Decimal(price_per_share)
        total_earnings = Decimal(quantity) * price_per_share

        holding = StockHolding.objects.filter(portfolio=portfolio, ticker=ticker).first()
        if not holding or holding.quantity < quantity:
            return Response({"error": "Not enough shares to sell"}, status=400)

        portfolio.balance += total_earnings
        holding.quantity -= quantity
        if holding.quantity == 0:
            holding.delete()
        else:
            holding.save()
        portfolio.save()

        transaction = Transaction.objects.create(
            portfolio=portfolio,
            ticker=ticker,
            transaction_type="SELL",
            quantity=quantity,
            price_per_share=price_per_share,
        )

        self._update_portfolio_history(
            portfolio=portfolio, transaction_type="SELL", ticker=ticker, quantity=quantity
        )

        return Response(TransactionSerializer(transaction).data)

    def _update_portfolio_history(self, portfolio, transaction_type=None, ticker=None, quantity=None):
        holdings = StockHolding.objects.filter(portfolio=portfolio)
        total_holdings_value = sum(
            holding.quantity * self._get_stock_price(holding.ticker) for holding in holdings
        )
        total_value = portfolio.balance + total_holdings_value

        transaction_label = None
        if transaction_type and ticker and quantity:
            action = "Bought" if transaction_type == "BUY" else "Sold"
            transaction_label = f"{action} {quantity} {ticker} shares"

        PortfolioHistory.objects.create(
            user=portfolio.user,
            total_value=total_value,
            cash_balance=portfolio.balance,
            transaction_label=transaction_label,
            timestamp=datetime.now(),
        )
        

class PortfolioHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        history = PortfolioHistory.objects.filter(user=request.user).order_by('timestamp')
        serializer = PortfolioHistorySerializer(history, many=True)
        return Response(serializer.data)

    
# Financial Articles View
class RecommendedArticlesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Hardcoding user interests needs to be dynamic later
        recommended_article_ids = recommend_articles()

        # Fetch articles matching the recommended IDs
        articles = FinancialArticle.objects.filter(id__in=recommended_article_ids)
        serializer = FinancialArticleSerializer(articles, many=True)
        return Response(serializer.data)