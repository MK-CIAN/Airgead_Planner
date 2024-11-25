from decimal import Decimal
from django.shortcuts import render
from rest_framework import viewsets, permissions
from .serializers import *
from .models import *
from rest_framework.response import Response
from django.db.models import F, Sum
from datetime import datetime, timedelta

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

class StockDataViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        # Fetch the latest stock data for each FAANG stock
        ticker = request.query_params.get('ticker')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date', datetime.now().date())

        if not ticker:
            return Response({'error': 'Please provide a ticker'}, status=400)

        start_date = start_date or (datetime.now() - timedelta(days=365)).date()  # Default to 1 year ago

        stock_data = StockData.objects.filter(
            ticker=ticker,
            date__range=[start_date, end_date]
        ).order_by('date')

        serializer = StockDataSerializer(stock_data, many=True)
        return Response(serializer.data)
    
class PortfolioViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Fetch the user's portfolio and its holdings."""
        portfolio, created = Portfolio.objects.get_or_create(user=request.user)
        holdings = StockHolding.objects.filter(portfolio=portfolio)

        # Prepare the response data
        response_data = {
            "balance": str(portfolio.balance),  # Convert Decimal to string
            "holdings": [{"ticker": h.ticker, "quantity": h.quantity} for h in holdings],
        }
        return Response(response_data)

    def create(self, request):
        """Handle buy/sell transactions."""
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
        total_cost = Decimal(quantity) * Decimal(price_per_share)  # Ensure total_cost is a Decimal

        if portfolio.balance < total_cost:
            return Response({"error": "Insufficient balance"}, status=400)

        portfolio.balance -= total_cost
        portfolio.save()

        # Ensure that the `quantity` field is initialized during creation
        holding, created = StockHolding.objects.get_or_create(
            portfolio=portfolio,
            ticker=ticker,
            defaults={"quantity": 0}  # Default to 0 if creating a new holding
        )

        holding.quantity += quantity
        holding.save()

        transaction = Transaction.objects.create(
            portfolio=portfolio,
            ticker=ticker,
            transaction_type="BUY",
            quantity=quantity,
            price_per_share=Decimal(price_per_share)  # Ensure this is a Decimal
        )
        return Response(TransactionSerializer(transaction).data)

    def _sell_stock(self, portfolio, ticker, quantity, price_per_share):
        # Ensure proper decimal handling
        quantity = int(quantity)  # Cast quantity to integer
        price_per_share = Decimal(price_per_share)  # Ensure price_per_share is Decimal
        total_earnings = Decimal(quantity) * price_per_share

        # Retrieve the holding and validate availability
        holding = StockHolding.objects.filter(portfolio=portfolio, ticker=ticker).first()
        if not holding or holding.quantity < quantity:
            return Response({"error": "Not enough shares to sell"}, status=400)

        # Update portfolio balance and holding quantity
        portfolio.balance += total_earnings
        holding.quantity -= quantity
        if holding.quantity == 0:
            holding.delete()  # Delete holding if quantity reaches 0
        else:
            holding.save()  # Save updated holding if quantity > 0
        portfolio.save()  # Save the updated portfolio balance

        # Record the transaction
        transaction = Transaction.objects.create(
            portfolio=portfolio,
            ticker=ticker,
            transaction_type="SELL",
            quantity=quantity,
            price_per_share=price_per_share
        )

        return Response(TransactionSerializer(transaction).data)