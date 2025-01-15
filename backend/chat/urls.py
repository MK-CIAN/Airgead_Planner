from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ChatMessageViewSet

router = DefaultRouter()
router.register('messages', ChatMessageViewSet, basename='chat-messages')

urlpatterns = router.urls
