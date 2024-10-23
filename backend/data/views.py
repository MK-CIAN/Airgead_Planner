from django.shortcuts import render
from rest_framework import viewsets, permissions
from .serializers import *
from .models import *
from rest_framework.response import Response
from django.db.models import F, Sum

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


class MonthlyBudgetViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = MonthlyBudget.objects.all()
    serializer_class = MonthlyBudgetSerializer