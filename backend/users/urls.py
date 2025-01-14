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
    path('search', UserSearchView.as_view(), name='user-search'),
    path('friend-request', SendFriendRequestView.as_view(), name='send-friend-request'),
    path("notifications", NotificationListView.as_view(), name="notifications"),
    path("notifications/accept", AcceptNotificationView.as_view(), name="accept-notification"),
    path("notifications/deny", DenyNotificationView.as_view(), name="deny-notification"),
    path('friends/', FriendsListView.as_view(), name='friends-list'),
]