from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()
router.register('budget', MonthlyBudgetViewSet, basename='budget')
router.register('savings', SavingsGoalViewSet, basename='savings')
router.register('loans', LoanViewSet, basename='loans')
router.register('stocks', StockDataViewSet, basename='stocks')
router.register('portfolio', PortfolioViewSet, basename='portfolio') 

urlpatterns = router.urls