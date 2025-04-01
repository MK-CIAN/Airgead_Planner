from decimal import Decimal
from typing import OrderedDict
from django.shortcuts import get_object_or_404, render
from rest_framework import viewsets, permissions, status
from .serializers import *
from .models import *
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.db.models import F, Sum
from django.db import transaction
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
    lookup_field = "pk"

    def get_queryset(self): 
        # Fetching budgets only belonging to the logged-in user
        month = self.request.query_params.get('month')
        queryset = MonthlyBudget.objects.filter(user=self.request.user)
        if month:
            queryset = queryset.filter(month__startswith=month)
        return queryset

    def perform_create(self, serializer):
        # Ensuring only one budget exists per user per month.
        month = serializer.validated_data.get('month')
        # Checking if a budget already exists for this user and month
        existing_budget = MonthlyBudget.objects.filter(user=self.request.user, month=month).first()

        if existing_budget:
            serializer.instance = existing_budget
            self.request._request.status_code = status.HTTP_200_OK
            return Response(MonthlyBudgetSerializer(existing_budget).data, status=status.HTTP_200_OK)
        
        # If no budget exists, create a new one
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='items')
    def add_item(self, request, pk=None):
        # Add an item to a specific monthly budget
        budget = get_object_or_404(MonthlyBudget, id=pk, user=request.user)

        print("Received data for new item:", request.data)

        serializer = MonthlyBudgetItemSerializer(data=request.data)
        if serializer.is_valid():
            saved_item = serializer.save(budget=budget)  # Linking item to budget
            print(f"Item successfully added to budget {pk}: {saved_item.id}")
            return Response(MonthlyBudgetItemSerializer(saved_item).data, status=status.HTTP_201_CREATED)

        print("Validation Errors:", serializer.errors)  # DEBUG LOG
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='items/(?P<item_id>[^/.]+)')
    def delete_item(self, request, pk=None, item_id=None):
        """
        Delete an item from a specific budget.
        """
        budget = get_object_or_404(MonthlyBudget, id=pk, user=request.user)

        try:
            item = budget.items.get(id=item_id)
            item.delete()
            return Response({"message": "Item deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except MonthlyBudgetItem.DoesNotExist:
            return Response({"error": "Item not found."}, status=status.HTTP_404_NOT_FOUND)
        
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
        
    def get_serializer_context(self):
        """Pass the request context to the serializer (Needed for `is_owner` field)"""
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

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
                
            existing_notification = Notification.objects.filter(
                user=friend,
                sender=request.user,
                type="budget_invite",
                budget=budget,
                is_read=False  # Only check for pending invites
            ).exists()

            if existing_notification:
                return Response({"error": "Invite already sent."}, status=status.HTTP_400_BAD_REQUEST)
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
        
    @action(detail=True, methods=['post'], url_path='leave-budget')
    def leave_budget(self, request, pk=None):
        """
        Allows a user to leave a custom budget, removing them from contributors.
        """
        budget = self.get_object()
        user = request.user

        # Prevent the owner from leaving
        if user == budget.user:
            return Response({"error": "Budget owners cannot leave their own budget. Delete it instead."}, status=403)

        try:
            budget.contributors.remove(user)
            return Response({"message": "Successfully left the budget."}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=True, methods=['delete'], url_path='delete-budget')
    def delete_budget(self, request, pk=None):
        """
        Allows the budget owner to delete the entire budget.
        """
        budget = self.get_object()
        user = request.user

        if user != budget.user:
            return Response({"error": "Only the budget owner can delete this budget."}, status=403)

        try:
            with transaction.atomic():
                # Delete all budget-related items
                budget.items.all().delete()
                
                # Remove all contributors and delete the budget
                budget.contributors.clear()
                budget.delete()

            return Response({"message": "Budget and all associated data deleted."}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

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
        
    @action(detail=True, methods=['GET'])
    def contributions(self, request, pk=None):
        """Fetch contribution history for a specific savings goal."""
        savings_goal = get_object_or_404(SavingsGoal, id=pk, user=request.user)
        contributions = SavingsContribution.objects.filter(savings_goal=savings_goal)
        serializer = SavingsContributionSerializer(contributions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['POST'])
    def add_contribution(self, request, pk=None):
        # Contribution towards a savings goal
        savings_goal = get_object_or_404(SavingsGoal, id=pk, user=request.user)
        try:
            contribution_amount = Decimal(request.data.get('amount', 0))

            # Creating a contribution entry
            contribution = SavingsContribution.objects.create(savings_goal=savings_goal, amount=contribution_amount)

            # Updating the savings goal current amount
            savings_goal.current_amount += contribution_amount
            if savings_goal.current_amount >= savings_goal.target_amount:
                savings_goal.current_amount = savings_goal.target_amount  # Making sure it doesn't exceed the goal
            savings_goal.save()

            return Response({
                "message": "Contribution added successfully",
                "new_savings_amount": savings_goal.current_amount,
                "target_amount": savings_goal.target_amount,
                "contribution": SavingsContributionSerializer(contribution).data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        savings_goal = serializer.save(user=self.request.user)
        ChatRoom.objects.create(savings_goal=savings_goal)
        
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        # Ensure "current_amount" is received properly and parsed as float
        current_amount = float(request.data.get("current_amount", instance.current_amount))

        # Compute the new amount while enforcing constraints
        new_amount = max(min(current_amount, instance.target_amount), 0)

        instance.current_amount = new_amount
        instance.save()
        return Response(SavingsGoalSerializer(instance).data, status=status.HTTP_200_OK)
    
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
            
            existing_notification = Notification.objects.filter(
                user=friend,
                sender=request.user,
                type="savings_invite",
                savings_goal=savings_goal,
                is_read=False  # Only check for pending invites
            ).exists()
            
            if existing_notification:
                return Response({"error": "Invite already sent."}, status=status.HTTP_400_BAD_REQUEST)
            
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
        
class ActiveLoanViewSet(viewsets.ModelViewSet):
    serializer_class = ActiveLoanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ActiveLoan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        loan = serializer.save(user=self.request.user)
        if loan.original_balance == 0:
            loan.original_balance = loan.balance  # Set original balance on creation
            loan.save()
        
    @action(detail=True, methods=['GET'])
    def payments(self, request, pk=None):
        #Fetching payment history for a specific active loan.
        loan = get_object_or_404(ActiveLoan, id=pk, user=request.user)
        payments = LoanPayment.objects.filter(loan=loan)
        serializer = LoanPaymentSerializer(payments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['POST'])
    def make_payment(self, request, pk=None):
        # Handling making a payment towards an active loan
        loan = get_object_or_404(ActiveLoan, id=pk, user=request.user)
        try:
            payment_amount = Decimal(request.data.get('amount', 0))
            if payment_amount <= 0:
                return Response({"error": "Payment amount must be greater than zero"}, status=status.HTTP_400_BAD_REQUEST)
            # Create a payment entry
            payment = LoanPayment.objects.create(loan=loan, amount=payment_amount)
            # Update the loan balance
            loan.update_remaining_balance(payment_amount)

            return Response({
                "message": "Payment applied successfully",
                "remaining_balance": loan.balance,
                "original_balance": loan.original_balance,
                "payment": LoanPaymentSerializer(payment).data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['delete'])
    def delete_loan(self, request, pk=None):
        loan = get_object_or_404(ActiveLoan, id=pk, user=request.user)
        
        # First, delete all associated payments
        LoanPayment.objects.filter(loan=loan).delete()

        # Then, delete the loan itself
        loan.delete()

        return Response({"message": "Loan and associated payments deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

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
    
class StockRealTimeDataViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        ticker = request.query_params.get('ticker')
        if not ticker:
            return Response({'error': 'Please provide a ticker'}, status=400)

        latest_data = StockRealTimeData.objects.filter(ticker=ticker).order_by('-timestamp').first()

        if not latest_data:
            return Response({'error': 'No real-time data available for this ticker'}, status=404)

        serializer = StockRealTimeDataSerializer(latest_data)
        return Response(serializer.data)

# Portfolio Viewset
class PortfolioViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def _get_stock_price(self, ticker):
        latest_stock = StockRealTimeData.objects.filter(ticker=ticker).order_by('-timestamp').first()
        return latest_stock.close_price if latest_stock else 0

    def list(self, request):
        portfolio_type = request.query_params.get('portfolio_type', 'personal')
        league_id = request.query_params.get('league_id')

        if portfolio_type == 'league' and league_id:
            portfolio, created = Portfolio.objects.get_or_create(
                user=request.user, league_id=league_id, portfolio_type=Portfolio.LEAGUE,
                defaults={"balance": 10000.00, "totalbalance": 10000.00},  # Default starting balance
            )
        else:
            portfolio, created = Portfolio.objects.get_or_create(
                user=request.user, portfolio_type=Portfolio.PERSONAL,
                defaults={"balance": 10000.00, "totalbalance": 10000.00},  # Default starting balance
            )

        if not portfolio:
            return Response({"error": "Portfolio not found"}, status=404)

        print("Updating Portfolio History...")
        self._update_portfolio_history(portfolio)
        holdings = StockHolding.objects.filter(portfolio=portfolio)

        response_data = {
            "portfolio_type": portfolio.portfolio_type,
            "league_id": portfolio.league_id if portfolio.league else None,
            "balance": str(portfolio.balance),
            "totalbalance": round(portfolio.totalbalance, 2),
            "holdings": [
                {
                    "ticker": h.ticker,
                    "quantity": h.quantity,
                    "current_price": self._get_stock_price(h.ticker),
                    "total_value": round(float(h.quantity) * float(self._get_stock_price(h.ticker)), 2),
                }
                for h in holdings
            ],
        }
        return Response(response_data)


    def create(self, request):
        portfolio_type = request.data.get("portfolio_type", "personal")
        league_id = request.data.get("league_id")

        if portfolio_type == 'league' and league_id:
            portfolio, created = Portfolio.objects.get_or_create(
                user=request.user, league_id=league_id, portfolio_type=Portfolio.LEAGUE
            )
        else:
            portfolio, created = Portfolio.objects.get_or_create(
                user=request.user, portfolio_type=Portfolio.PERSONAL
            )
        ticker = request.data.get("ticker")
        transaction_type = request.data.get("transaction_type")
        quantity = Decimal(request.data.get("quantity", "0"))
        price_per_share = Decimal(request.data.get("price_per_share", "0"))

        if not ticker or quantity <= 0 or price_per_share <= 0:
            return Response({"error": "Invalid transaction data"}, status=400)

        if transaction_type == "BUY":
            return self._buy_stock(portfolio, ticker, quantity, price_per_share)
        elif transaction_type == "SELL":
            return self._sell_stock(portfolio, ticker, quantity, price_per_share)
        else:
            return Response({"error": "Invalid transaction type"}, status=400)


    def update_total_balance(self, portfolio):
        holdings = StockHolding.objects.filter(portfolio=portfolio)
        total_holdings_value = sum(
            Decimal(holding.quantity) * Decimal(holding.get_latest_price()) for holding in holdings
        )
        
        portfolio.totalbalance = Decimal(str(portfolio.balance)) + total_holdings_value
        portfolio.save()

    
    def _buy_stock(self, portfolio, ticker, quantity, price_per_share):
        total_cost = Decimal(quantity) * Decimal(price_per_share)
        if portfolio.balance < total_cost:
            return Response({"error": "Insufficient balance"}, status=400)

        portfolio.balance -= Decimal(total_cost)
        portfolio.save()

        holding, created = StockHolding.objects.get_or_create(
            portfolio=portfolio, ticker=ticker, defaults={"quantity": Decimal(0)}
        )
        holding.quantity += Decimal(quantity)
        holding.save()

        transaction = Transaction.objects.create(
            portfolio=portfolio,
            ticker=ticker,
            transaction_type="BUY",
            quantity=Decimal(quantity),
            price_per_share=Decimal(price_per_share),
        )
        self._update_portfolio_history(portfolio, "BUY", ticker, quantity)
        return Response(TransactionSerializer(transaction).data)

    def _sell_stock(self, portfolio, ticker, quantity, price_per_share):
        quantity = Decimal(quantity)
        price_per_share = Decimal(price_per_share)
        total_earnings = quantity * price_per_share

        holding = StockHolding.objects.filter(portfolio=portfolio, ticker=ticker).first()
        if not holding or holding.quantity < quantity:
            return Response({"error": "Not enough shares to sell"}, status=400)

        portfolio.balance += total_earnings
        holding.quantity -= quantity

        if holding.quantity < Decimal('0.0001'):
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

        self._update_portfolio_history(portfolio, "SELL", ticker, quantity)

        return Response(TransactionSerializer(transaction).data)
        
    def _update_portfolio_history(self, portfolio, transaction_type=None, ticker=None, quantity=None):
        self.update_total_balance(portfolio)

        transaction_label = None
        if transaction_type and ticker and quantity:
            action = "Bought" if transaction_type == "BUY" else "Sold"
            transaction_label = f"{action} {quantity} {ticker} shares"

        today = now().date()

        # ✅ Find today's existing entry for the portfolio
        history_entry = PortfolioHistory.objects.filter(
            portfolio=portfolio, timestamp__date=today, league=portfolio.league
        ).order_by('-timestamp').first()

        if history_entry:
            history_entry.total_value = portfolio.totalbalance
            history_entry.cash_balance = portfolio.balance
            history_entry.transaction_label = transaction_label or history_entry.transaction_label
            history_entry.timestamp = now()
            history_entry.save()
        else:
            # ✅ Ensure no duplicates before creating a new entry
            if not PortfolioHistory.objects.filter(portfolio=portfolio, timestamp__date=today, league=portfolio.league).exists():
                PortfolioHistory.objects.create(
                    user=portfolio.user,
                    portfolio=portfolio,
                    league=portfolio.league,
                    total_value=portfolio.totalbalance,
                    cash_balance=portfolio.balance,
                    transaction_label=transaction_label or "Portfolio Updated with Current Prices",
                    timestamp=now(),
                )


class PortfolioHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get_stock_price(self, ticker):
        """
        Retrieve the latest stock price for the given ticker.
        """
        latest_stock = StockRealTimeData.objects.filter(ticker=ticker).order_by('-timestamp').first()
        return latest_stock.close_price if latest_stock else 0  # Return 0 if no stock data is available

    def _calculate_portfolio_value(self, user, portfolio_type, league_id=None):
        """
        Calculate the current total value of the portfolio.
        """
        if portfolio_type == "league" and league_id:
            holdings = StockHolding.objects.filter(portfolio__user=user, portfolio__league_id=league_id)
            portfolio = Portfolio.objects.filter(user=user, league_id=league_id, portfolio_type=Portfolio.LEAGUE).first()
        else:
            holdings = StockHolding.objects.filter(portfolio__user=user, portfolio__portfolio_type=Portfolio.PERSONAL)
            portfolio = Portfolio.objects.filter(user=user, portfolio_type=Portfolio.PERSONAL).first()

        if not portfolio:
            return None

        total_holdings_value = sum(
            holding.quantity * self._get_stock_price(holding.ticker) for holding in holdings
        )
        return portfolio.balance + total_holdings_value

    def get(self, request):
        user = request.user
        portfolio_type = request.query_params.get("portfolio_type", "personal")
        league_id = request.query_params.get("league_id", None)

        # Fetching the correct portfolio based on type
        if portfolio_type == "league" and league_id:
            portfolio = Portfolio.objects.filter(user=user, league_id=league_id, portfolio_type=Portfolio.LEAGUE).first()
        else:
            portfolio = Portfolio.objects.filter(user=user, portfolio_type=Portfolio.PERSONAL).first()

        if not portfolio:
            return Response({"error": "Portfolio not found"}, status=404)

        today = datetime.now().date()

        # Getting today's portfolio history entry for the correct portfolio
        today_entry = PortfolioHistory.objects.filter(portfolio=portfolio, timestamp__date=today).first()

        # Calculate=ing current portfolio value
        current_value = self._calculate_portfolio_value(user, portfolio_type, league_id)

        # Updating or create today's entry
        if today_entry:
            today_entry.total_value = current_value
            today_entry.cash_balance = portfolio.balance 
            today_entry.transaction_label = "Portfolio Updated with Current PricesTEST"
            today_entry.timestamp = datetime.now()
            today_entry.save()
        
        history = PortfolioHistory.objects.filter(portfolio=portfolio).order_by("-timestamp")

        latest_per_day = OrderedDict()
        for entry in history:
            entry_date = entry.timestamp.date()
            if entry_date not in latest_per_day:
                latest_per_day[entry_date] = entry

        # Serialize and return only the latest entry per day
        serializer = PortfolioHistorySerializer(list(latest_per_day.values()), many=True)
        return Response(serializer.data)

    def _generate_date_range(self, start_date, end_date):
        
        # Generating a list of dates from start_date to end_date (inclusive).
        delta = timedelta(days=1)
        current_date = start_date
        dates = []
        while current_date <= end_date:
            dates.append(current_date)
            current_date += delta
        return dates
    
class StockLeagueViewSet(viewsets.ModelViewSet):
    queryset = StockLeague.objects.all()
    serializer_class = StockLeagueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StockLeague.objects.filter(members=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={"request": request})
        members = instance.members.values_list('id', flat=True)  # Returns a list of user IDs
        
        data = serializer.data
        data["contributors"] = list(members)
        data["is_creator"] = request.user.id == instance.created_by.id
        return Response(data)


    def perform_create(self, serializer):
        league = serializer.save(created_by=self.request.user)
        league.members.add(self.request.user)

        Portfolio.objects.get_or_create(
            user=self.request.user, league=league, portfolio_type=Portfolio.LEAGUE,
            defaults={"balance": 10000.00, "totalbalance": 10000.00},  # Default starting balance
        )

        ChatRoom.objects.get_or_create(stock_league=league)
        return Response({"message": "League created successfully", "league_id": league.id}, status=201)

    
    @action(detail=True, methods=['post'], url_path='invite-friend')
    def invite_friend(self, request, pk=None):
        league = self.get_object()
        friend_id = request.data.get('friend_id')

        if not friend_id:
            return Response({"error": "Friend ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            friend = CustomUser.objects.get(id=friend_id)
            
            existing_notification = Notification.objects.filter(
                user=friend,
                sender=request.user,
                type="stock_league_invite",
                stock_league=league,
                is_read=False
            ).exists()
            
            if existing_notification:
                return Response({"error": "Invite already sent."}, status=status.HTTP_400_BAD_REQUEST)
            
            Notification.objects.create(
                user=friend,
                sender=request.user,
                type="stock_league_invite",
                message=f"{request.user.username} has invited you to join the stock league '{league.name}'.",
                stock_league=league
            )

            return Response({"message": "Invitation sent successfully."}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": "Friend not found."}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=True, methods=['post'], url_path='leave-league')
    def leave_league(self, request, pk=None):
        """ Allows a user to leave a stock league, deleting their portfolio & holdings. """
        league = self.get_object()
        user = request.user

        if user == league.created_by:
            return Response({"error": "Creators cannot leave their own league. Delete it instead."}, status=403)

        try:
            with transaction.atomic():
                # Deleting user's portfolio & related data
                Portfolio.objects.filter(user=user, league=league).delete()
                StockHolding.objects.filter(portfolio__user=user, portfolio__league=league).delete()
                Transaction.objects.filter(portfolio__user=user, portfolio__league=league).delete()
                PortfolioHistory.objects.filter(user=user, league=league).delete()
                
                # Removing user from league members
                league.members.remove(user)

            return Response({"message": "Successfully left the league."}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
    @action(detail=True, methods=['delete'], url_path='delete-league')
    def delete_league(self, request, pk=None):
        """ Allows the league creator to delete the entire league & all related data. """
        league = self.get_object()
        user = request.user

        if user != league.created_by:
            return Response({"error": "Only the league creator can delete the league."}, status=403)

        try:
            with transaction.atomic(): 
                # Delete all related data
                StockHolding.objects.filter(portfolio__league=league).delete()
                Transaction.objects.filter(portfolio__league=league).delete()
                PortfolioHistory.objects.filter(league=league).delete()
                Portfolio.objects.filter(league=league).delete()
                Notification.objects.filter(stock_league=league).delete()
                
                # Remove all members and delete the league
                league.members.clear()
                league.delete()

            return Response({"message": "League and all associated data deleted."}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
    @action(detail=True, methods=['get'], url_path='leaderboard')
    def leaderboard(self, request, pk=None):
        """ Retrieves league members sorted by total balance. """
        league = self.get_object()
        
        # ✅ Get all league members with their total balance
        leaderboard = (
            Portfolio.objects.filter(league=league)
            .values("user__username")
            .annotate(total_balance=Sum("totalbalance"))
            .order_by("-total_balance")  # ✅ Sort descending
        )

        return Response(leaderboard, status=200)

    
# Financial Articles View
class RecommendedArticlesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Hardcoding user interests needs to be dynamic later
        user = request.user
        recommended_article_ids = recommend_articles(user)

        # Fetch articles matching the recommended IDs
        articles = list(FinancialArticle.objects.filter(id__in=recommended_article_ids))
        articles.sort(key=lambda x: recommended_article_ids.index(x.id))
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
    
class FinancialSuggestionViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = FinancialSuggestion.objects.all()
    serializer_class = FinancialSuggestionSerializer

    NEEDS_KEYWORDS = ["rent", "bills", "utilities", "groceries", "insurance", "phone", "food", "transport", "petrol", "diesel", "gas"]
    WANTS_KEYWORDS = ["gym", "entertainment", "spotify", "netflix", "dining", "shopping", "vacation", "subscriptions", "movies", "clothes"]
    SAVINGS_DEBT_KEYWORDS = ["savings", "investment", "loan", "debt", "emergency fund"]
    
    # Function to get rid of old suggestions to improve effiecentcy
    def delete_redundant_suggestions(self, user, suggestion_category):
        FinancialSuggestion.objects.filter(user=user, status="NEW", user_feedback__isnull=True, suggestion_category=suggestion_category).delete()
    
    def generate_suggestions(self, user):
        self.delete_redundant_suggestions(user, suggestion_category="Suggestion")
        today = date.today()
        last_12_months = today - timedelta(days=365)

        current_month = datetime.now().strftime('%Y-%m-01')
        latest_budget = MonthlyBudget.objects.filter(user=user, month=current_month).first()
        
        if not latest_budget:
            latest_budget = MonthlyBudget.objects.filter(user=user).order_by("-month").first()
            
        if not latest_budget:
            print("No budget data")
            return  # No budget found, skip suggestions

        income_total = MonthlyBudgetItem.objects.filter(
            budget=latest_budget, transaction_type="income"
        ).aggregate(Sum("amount"))["amount__sum"] or Decimal("0")

        expense_total = MonthlyBudgetItem.objects.filter(
            budget=latest_budget, transaction_type="expense"
        ).aggregate(Sum("amount"))["amount__sum"] or Decimal("0")

        debt_total = MonthlyBudgetItem.objects.filter(
            budget=latest_budget, transaction_type="debt"
        ).aggregate(Sum("amount"))["amount__sum"] or Decimal("0")

        budget_surplus = income_total - (expense_total + debt_total)
        
        savings_type = SuggestionType.objects.get_or_create(category="SAVINGS")[0]
        loan_type = SuggestionType.objects.get_or_create(category="LOANS")[0]
        budget_type = SuggestionType.objects.get_or_create(category="BUDGET_ADJUSTMENT")[0]
        investment_type = SuggestionType.objects.get_or_create(category="INVESTMENT")[0]
        highspending_type = SuggestionType.objects.get_or_create(category="HIGH_SPENDING_ALERTS")[0]
        
        # Suggesting Savings Goals Contribution
        savings_goals = SavingsGoal.objects.filter(user=user, current_amount__lt=F('target_amount'))  # Exclude completed goals

        if savings_goals.exists() and budget_surplus > 100:
            for goal in savings_goals:
                amount_needed = goal.target_amount - goal.current_amount
                suggested_contribution = min(budget_surplus * Decimal(0.3), amount_needed)

                if suggested_contribution > 0:
                    FinancialSuggestion.objects.create(
                        user=user,
                        suggestion_text=(
                            f"Your savings goal '{goal.name}' needs €{amount_needed:.2f} to be completed. "
                            f"Consider allocating €{suggested_contribution:.2f} towards it this month."
                        ),
                        suggestion_category="Suggestion",
                        suggestion_type=savings_type,
                        savings_goal=goal
                    )
                    
        # Suggesting Extra Loan Payement
        loans = ActiveLoan.objects.filter(user=user)
        if loans.exists() and budget_surplus > 100:
            for loan in loans:
                min_payment = loan.balance * Decimal(0.1)  # Suggest 10% of remaining loan
                extra_payment = min(budget_surplus * Decimal(0.3), min_payment)
                new_balance = loan.balance - extra_payment

                if extra_payment > 0:
                    FinancialSuggestion.objects.create(
                        user=user,
                        suggestion_text=(
                            f"You still owe €{loan.balance:.2f} on your loan '{loan.name}'. "
                            f"With your surplus of €{budget_surplus:.2f}, consider an extra payment of €{extra_payment:.2f} "
                            f"to bring your balance down to €{new_balance:.2f} faster."
                        ),
                        suggestion_category="Suggestion",
                        suggestion_type=loan_type,
                        loan_id=loan
                    )
                    
        # Identifying High Spending Categories
        high_expense_category = (
            MonthlyBudgetItem.objects.filter(budget__user=user, transaction_type="expense", created_at__gte=last_12_months)
            .values("category")
            .annotate(total=Sum("amount"))
            .order_by("-total")
            .first()
        )
        
        if high_expense_category and high_expense_category["total"] > (expense_total * Decimal(0.3)):
            FinancialSuggestion.objects.create(
                user=user,
                suggestion_text=(
                    f"You've spent €{high_expense_category['total']:.2f} on '{high_expense_category['category']}' in the last year. "
                    "Consider adjusting your budget to better allocate funds."
                ),
                suggestion_category="Suggestion",
                suggestion_type=highspending_type
                
            )
            
        # Suggesting Investments
        portfolio = Portfolio.objects.filter(user=user).first()
        if portfolio and budget_surplus > 200:
            FinancialSuggestion.objects.create(
                user=user,
                suggestion_text=f"You have an excess of €{budget_surplus:.2f}. Consider investing part of it in your portfolio.",
                suggestion_category="Suggestion",
                suggestion_type=investment_type
            )
    
    def categorize_item(self, category_label):
        label = category_label.lower()
        if any(keyword in label for keyword in self.NEEDS_KEYWORDS):
            return "needs"
        elif any(keyword in label for keyword in self.WANTS_KEYWORDS):
            return "wants"
        elif any(keyword in label for keyword in self.SAVINGS_DEBT_KEYWORDS):
            return "savings_debt"
        else:
            return "uncategorized"
        
    @action(detail=False, methods=["GET"])
    def analyze_spending(self, request):
        user = request.user
        suggestions = FinancialSuggestion.objects.filter(
            user=user, 
            status="NEW", 
            suggestion_category="Analyzation"
        ).order_by("-created_at")

        # Fetching latest budget for numeric analysis
        current_month = datetime.now().strftime('%Y-%m-01')
        latest_budget = MonthlyBudget.objects.filter(user=user, month=current_month).first()
        
        if not latest_budget:
            latest_budget = MonthlyBudget.objects.filter(user=user).order_by("-month").first()
        
        if not latest_budget:
            return Response({"error": "No budget data found."}, status=400)

        items = MonthlyBudgetItem.objects.filter(budget=latest_budget)
        income_total = items.filter(transaction_type="income").aggregate(Sum("amount"))["amount__sum"] or Decimal("0")

        # Categorization and Summing Totals
        needs_total = sum(item.amount for item in items if self.categorize_item(item.category) == "needs")
        wants_total = sum(item.amount for item in items if self.categorize_item(item.category) == "wants")
        savings_debt_total = sum(item.amount for item in items if self.categorize_item(item.category) == "savings_debt")

        # Calculating Percentages
        needs_pct = (needs_total / income_total * 100) if income_total else 0
        wants_pct = (wants_total / income_total * 100) if income_total else 0
        savings_pct = (savings_debt_total / income_total * 100) if income_total else 0

        # Serialize suggestions
        serialized_suggestions = FinancialSuggestionSerializer(suggestions, many=True).data

        return Response({
            "needs_percentage": round(needs_pct, 1),
            "wants_percentage": round(wants_pct, 1),
            "savings_percentage": round(savings_pct, 1),
            "suggestions": serialized_suggestions
        })

    @action(detail=False, methods=["GET"])
    def get_suggestions(self, request):
        user = request.user
        suggestions = FinancialSuggestion.objects.filter(user=user, status="NEW", suggestion_category="Suggestion").select_related("suggestion_type").order_by("-created_at")
        serializer = FinancialSuggestionSerializer(suggestions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["GET"])
    def get_analyzation(self, request):
        user = request.user
        suggestions = FinancialSuggestion.objects.filter(user=user, status="NEW", suggestion_category="Analyzation").order_by("-created_at")
        serializer = FinancialSuggestionSerializer(suggestions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["GET"])
    def classify(self, request):
        """
        Classify the user without generating financial suggestions.
        """
        from data.utils.user_classification import classify_user
        user = request.user
        user_category = classify_user(user)
        return Response({"user_category": user_category if user_category else "No Classification"})

    
    @action(detail=False, methods=["GET"])
    def generate(self, request):
        """
        Generate new financial suggestions for the user (without classifying).
        """
        user = request.user
        self.generate_suggestions(user)
        return Response({"message": "New financial suggestions have been generated!"})

    
    @action(detail=True, methods=["POST"])
    def accept_suggestion(self, request, pk=None):
        suggestion = get_object_or_404(FinancialSuggestion, id=pk, user=request.user)  # Handle missing suggestion

        # Update suggestion status
        suggestion.status = "ACCEPTED"
        suggestion.user_feedback = True
        suggestion.save()

        # Increment the total accepted count in SuggestionType
        if suggestion.suggestion_type:
            suggestion_type = suggestion.suggestion_type
            suggestion_type.total_accepted = F('total_accepted') + 1  # Use F() expression for atomic updates
            suggestion_type.save(update_fields=['total_accepted'])  # Save only the updated field

        return Response({"message": "Suggestion accepted successfully."})

    @action(detail=True, methods=["POST"])
    def dismiss_suggestion(self, request, pk=None):
        suggestion = get_object_or_404(FinancialSuggestion, id=pk, user=request.user)  # Handle missing suggestion

        # Update suggestion status
        suggestion.status = "DISMISSED"
        suggestion.user_feedback = False
        suggestion.save()

        # Increment the total declined count in SuggestionType
        if suggestion.suggestion_type:
            suggestion_type = suggestion.suggestion_type
            suggestion_type.total_declined = F('total_declined') + 1  # Use F() expression for atomic updates
            suggestion_type.save(update_fields=['total_declined'])  # Save only the updated field

        return Response({"message": "Suggestion dismissed successfully."})
