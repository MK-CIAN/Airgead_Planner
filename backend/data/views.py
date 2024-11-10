from django.shortcuts import render
from rest_framework import viewsets, permissions
from .serializers import *
from .models import *
from rest_framework.response import Response
from django.db.models import F, Sum
from datetime import datetime, timedelta

# Create your views here.
class SuperMarketSalesViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    queryset = Supermarketsales.objects.all()
    serializer_class = SupermarketsalesSerializer

    def list(self, request):
        queryset = Supermarketsales.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
class BranchDataViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        # Calculate total sales by branch: unit_price * quantity
        queryset = Supermarketsales.objects.values('branch')\
            .annotate(total_sales=Sum(F('unit_price') * F('quantity')))\
            .order_by('-total_sales')  # Order by total sales descending

        # Prepare data to be serialized
        serialized_data = []
        for branch in queryset:
            serialized_data.append({
                'id': branch['branch'],  # Use the branch as id
                'total_sales': branch['total_sales'],  # Total sales
                'label': branch['branch'],  # Label for the PieChart
            })

        # Serialize the aggregated data
        serializer = BranchDataSerializer(serialized_data, many=True)
        return Response(serializer.data)


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

class SavingsGoalViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SavingsGoalSerializer

    def get_queryset(self):
        queryset = SavingsGoal.objects.filter(user=self.request.user)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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