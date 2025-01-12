from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('register', RegisterViewset, basename='register')
router.register('login', LoginViewset, basename='login')

# Use path for APIView-based views
urlpatterns = router.urls + [
    path('user', UserDetailView.as_view(), name='user-detail'),
]