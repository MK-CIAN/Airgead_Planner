from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()
router.register('budget', MonthlyBudgetViewSet, basename='budget')
router.register('custom-budget', CustomBudgetViewSet, basename='custom-budget')
router.register('savings', SavingsGoalViewSet, basename='savings')
router.register('loans', LoanViewSet, basename='loans')
router.register('stocks', StockDataViewSet, basename='stocks')
router.register('portfolio', PortfolioViewSet, basename='portfolio')


urlpatterns = router.urls + [
    path('reccomended-articles/', RecommendedArticlesView.as_view(), name='reccomended-articles'),
    path('portfolio/history/', PortfolioHistoryView.as_view(), name='portfolio-history'),
    path('interests/', UserInterestsView.as_view(), name='user-interests')
]