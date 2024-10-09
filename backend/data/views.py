from django.shortcuts import render
from rest_framework import viewsets, permissions
from .serializers import *
from .models import *
from rest_framework.response import Response

# Create your views here.
class SuperMarketSalesViewset(viewsets.ViewSet):
    permission_classes = [
        permissions.AllowAny
    ]

    queryset = Supermarketsales.objects.all()
    serializer_class = SupermarketsalesSerializer

    def list(self, request):
        queryset = Supermarketsales.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)