from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()
router.register('budget', MonthlyBudgetViewSet, basename='budget')
router.register('custom-budget', CustomBudgetViewSet, basename='custom-budget')
router.register('savings', SavingsGoalViewSet, basename='savings')
router.register('loans', LoanViewSet, basename='loans')
router.register('income-tax', IncomeTaxViewSet, basename='income')
router.register('pension-planner', PensionProjectionViewSet, basename='pension-planner')
router.register('stocks', StockDataViewSet, basename='stocks')
router.register('stock-realtime', StockRealTimeDataViewSet, basename='stocks-realtime')
router.register('leagues', StockLeagueViewSet, basename='leagues')
router.register('portfolio', PortfolioViewSet, basename='portfolio')
router.register('active-loan', ActiveLoanViewSet, basename='active-loan')



urlpatterns = router.urls + [
    path('reccomended-articles/', RecommendedArticlesView.as_view(), name='reccomended-articles'),
    path('portfolio/history/', PortfolioHistoryView.as_view(), name='portfolio-history'),
    path('interests/', UserInterestsView.as_view(), name='user-interests'),
    path('financial-suggestions/get-suggestions', FinancialSuggestionViewSet.as_view({'get': 'get_suggestions'}), name="financial-suggestions"),
    path('financial-suggestions/get-analyzation', FinancialSuggestionViewSet.as_view({'get': 'get_analyzation'}), name="financial-analyzation"),
    path("financial-suggestions/generate/", FinancialSuggestionViewSet.as_view({'get': 'generate'}), name="generate-suggestions"),
    path('financial-suggestions/<int:pk>/accept/', FinancialSuggestionViewSet.as_view({'post': 'accept_suggestion'}), name="accept-suggestion"),
    path('financial-suggestions/<int:pk>/dismiss/', FinancialSuggestionViewSet.as_view({'post': 'dismiss_suggestion'}), name="dismiss-suggestion"),
    path('financial-suggestions/analyze/', FinancialSuggestionViewSet.as_view({'get': 'analyze_spending'}), name="analyze-spending"),
    path('data/budget/<int:pk>/items/', MonthlyBudgetViewSet.as_view({'post': 'add_item'}), name="monthly-budget-add-item"),
    path('data/budget/<int:pk>/items/<int:item_id>/', MonthlyBudgetViewSet.as_view({'delete': 'delete_item'}), name="monthly-budget-delete-item"),
]

