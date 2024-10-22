from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('supermarketsales', SuperMarketSalesViewset, basename='supermarketsales')
router.register('branchdata', BranchDataViewset, basename='branchdata')
router.register('budget', MonthlyBudgetViewSet, basename='budget')
urlpatterns = router.urls