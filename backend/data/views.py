from decimal import Decimal
from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from .serializers import *
from .models import *
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.db.models import F, Sum
from datetime import date, datetime, timedelta
from data.utils.news_utils import recommend_articles
from django.contrib.auth import get_user_model
from users.models import Notification
from chat.models import ChatRoom
CustomUser = get_user_model()  # Retrieve the custom user model



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
        
class CustomBudgetViewSet(viewsets.ModelViewSet):
    queryset = CustomBudget.objects.all()
    serializer_class = CustomBudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Fetch all budgets created by the user or where the user is a contributor.
        """
        return CustomBudget.objects.filter(
            models.Q(user=self.request.user) | models.Q(contributors=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        """
        Create a custom budget explicitly only when requested.
        """
        budget = serializer.save(user=self.request.user)
        ChatRoom.objects.create(budget=budget)
        

    @action(detail=True, methods=['post'], url_path='items')
    def add_item(self, request, pk=None):
        """
        Add an item to a specific budget.
        """
        print("add_item called with data:", request.data)  # DEBUG
        budget = self.get_object()

        serializer = BudgetItemSerializer(data=request.data)
        if serializer.is_valid():
            saved_item = serializer.save(budget=budget)  # Link the item to the budget
            return Response(BudgetItemSerializer(saved_item).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'], url_path='items/(?P<item_id>[^/.]+)')
    def delete_item(self, request, pk=None, item_id=None):
        """
        Delete an item from a specific budget.
        """
        try:
            budget = self.get_object()
            item = budget.items.get(id=item_id)
            item.delete()
            return Response({"message": "Item deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except BudgetItem.DoesNotExist:
            return Response({"error": "Item not found."}, status=status.HTTP_404_NOT_FOUND)


    @action(detail=True, methods=['post'], url_path='invite-friend')
    def invite_friend(self, request, pk=None):
        """
        Invite a friend to join a budget.
        """
        budget = self.get_object()
        friend_id = request.data.get('friend_id')

        if not friend_id:
            return Response({"error": "Friend ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            friend = CustomUser.objects.get(id=friend_id)
            # Create a notification with the budget reference
            Notification.objects.create(
                user=friend,
                sender=request.user,
                type="budget_invite",
                message=f"{request.user.username} has invited you to join the budget '{budget.name}'.",
                budget=budget  # Add the budget reference here
            )
            return Response({"message": "Invitation sent successfully."}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": "Friend not found."}, status=status.HTTP_404_NOT_FOUND)


# Savings Goal Viewset
class SavingsGoalViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SavingsGoalSerializer

    def get_queryset(self):
        user = self.request.user

        # Include savings goals where the user is a contributor
        return SavingsGoal.objects.filter(
            models.Q(user=user) | models.Q(contributors=user)
        ).distinct()
    
    def perform_create(self, serializer):
        savings_goal = serializer.save(user=self.request.user)
        ChatRoom.objects.create(savings_goal=savings_goal)
        
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        current_amount = request.data.get("current_amount", instance.current_amount)

        # Ensure current_amount doesn't exceed the target_amount
        if float(current_amount) > instance.target_amount:
            instance.current_amount = instance.target_amount
        else:
            instance.current_amount = current_amount

        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=["post"], url_path="upload-image")
    def upload_image(self, request, pk=None):
        savings_goal = self.get_object()
        image = request.FILES.get("image")

        if not image:
            return Response({"error": "No image provided."}, status=400)

        savings_goal.image = image
        savings_goal.save()
        return Response({"image_url": savings_goal.image.url})
        
    @action(detail=True, methods=['post'], url_path='invite-friend')
    def invite_friend(self, request, pk=None):
        savings_goal = self.get_object()
        friend_id = request.data.get('friend_id')

        if not friend_id:
            return Response({"error": "Friend ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            friend = CustomUser.objects.get(id=friend_id)
            # Create a notification with the budget reference
            Notification.objects.create(
                user=friend,
                sender=request.user,
                type="savings_invite",
                message=f"{request.user.username} has invited you to join the savings goal '{savings_goal.name}'.",
                savings_goal=savings_goal
            )
            return Response({"message": "Invitation sent successfully."}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": "Friend not found."}, status=status.HTTP_404_NOT_FOUND)

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
        

class IncomeTaxViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeTaxSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return IncomeTax.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PensionProjectionViewSet(viewsets.ModelViewSet):
    serializer_class = PensionProjectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PensionProjection.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
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

    def _get_stock_price(self, ticker):
        """
        Retrieve the latest stock price for the given ticker.
        """
        latest_stock = StockData.objects.filter(ticker=ticker).order_by('-date').first()
        if latest_stock:
            return latest_stock.close_price
        return 0  # Return 0 if no stock data is available

    def _calculate_portfolio_value(self, portfolio):
        """
        Calculate the current total value of the portfolio.
        """
        holdings = StockHolding.objects.filter(portfolio=portfolio)
        total_holdings_value = sum(
            holding.quantity * self._get_stock_price(holding.ticker) for holding in holdings
        )
        return portfolio.balance + total_holdings_value

    def get(self, request):
        user = request.user
        portfolio = Portfolio.objects.get(user=user)
        history = PortfolioHistory.objects.filter(user=user).order_by('timestamp')

        # Calculate current portfolio value
        current_value = self._calculate_portfolio_value(portfolio)

        # Add current portfolio value to the response if it's different from the latest entry
        if history.exists():
            latest_history = history.last()
            if latest_history.total_value != current_value:
                PortfolioHistory.objects.create(
                    user=user,
                    total_value=current_value,
                    cash_balance=portfolio.balance,
                    transaction_label="Portfolio Updated with Current Prices",
                    timestamp=datetime.now(),
                )

        # Dynamically create history data points (e.g., daily, weekly, monthly)
        start_date = history.first().timestamp.date() if history.exists() else datetime.now().date()
        end_date = datetime.now().date()
        date_range = self._generate_date_range(start_date, end_date)  # Ensure this returns a list

        # Fill gaps in the portfolio history
        filled_history = []
        for date in date_range:  # Iterate over the date range
            entry = history.filter(timestamp__date=date).first()
            if entry:
                filled_history.append(entry)
            else:
                filled_history.append(
                    PortfolioHistory(
                        user=user,
                        total_value=current_value,
                        cash_balance=portfolio.balance,
                        transaction_label=None,
                        timestamp=datetime.combine(date, datetime.min.time()),
                    )
                )

        # Serialize and return
        serializer = PortfolioHistorySerializer(filled_history, many=True)
        return Response(serializer.data)


    def _generate_date_range(self, start_date, end_date):
        """
        Generate a list of dates from start_date to end_date (inclusive).
        """
        delta = timedelta(days=1)
        current_date = start_date
        dates = []
        while current_date <= end_date:
            dates.append(current_date)
            current_date += delta
        return dates

    
# Financial Articles View
class RecommendedArticlesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Hardcoding user interests needs to be dynamic later
        user = request.user
        recommended_article_ids = recommend_articles(user)

        # Fetch articles matching the recommended IDs
        articles = FinancialArticle.objects.filter(id__in=recommended_article_ids)
        serializer = FinancialArticleSerializer(articles, many=True)
        return Response(serializer.data)
    
class UserInterestsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        interests = request.data.get('interests', [])
        if not isinstance(interests, list) or not interests:
            return Response({"error": "Interests must be a non-empty list."}, status='400')

        # Create or update user interests
        UserInterest.objects.update_or_create(
            user=user,
            defaults={'interests': interests}
        )
        return Response({"message": "Interests updated successfully"}, status='200')

    def get(self, request):
        user = request.user
        user_interests = UserInterest.objects.filter(user=user).first()
        if user_interests:
            return Response({"interests": user_interests.interests}, status='200')
        return Response({"interests": []}, status='200')