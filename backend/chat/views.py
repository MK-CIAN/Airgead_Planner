from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import ChatMessage, ChatRoom
from .serializers import ChatMessageSerializer

class ChatMessageViewSet(ViewSet):
    permission_classes = [IsAuthenticated]

    # Fetch messages
    def list(self, request):
        budget_id = request.query_params.get('budget_id')
        savings_goal_id = request.query_params.get('savings_goal_id')

        if not budget_id and not savings_goal_id:
            return Response(
                {"error": "Either budget_id or savings_goal_id query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Determine the associated ChatRoom based on the provided ID
        try:
            if budget_id:
                chat_room = ChatRoom.objects.get(budget_id=budget_id)
            elif savings_goal_id:
                chat_room = ChatRoom.objects.get(savings_goal_id=savings_goal_id)
        except ChatRoom.DoesNotExist:
            return Response(
                {"error": "No ChatRoom found for the provided ID."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Fetch messages for the found ChatRoom
        messages = ChatMessage.objects.filter(room=chat_room).order_by('timestamp')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    # Send a new message
    def create(self, request):
        budget_id = request.data.get('budget_id')
        savings_goal_id = request.data.get('savings_goal_id')
        content = request.data.get('content')

        if not content or (not budget_id and not savings_goal_id):
            return Response(
                {"error": "Content and either budget_id or savings_goal_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Determine the associated ChatRoom based on the provided ID
        try:
            if budget_id:
                chat_room = ChatRoom.objects.get(budget_id=budget_id)
            elif savings_goal_id:
                chat_room = ChatRoom.objects.get(savings_goal_id=savings_goal_id)
        except ChatRoom.DoesNotExist:
            return Response(
                {"error": "No ChatRoom found for the provided ID."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Create and save the new message
        message = ChatMessage.objects.create(
            room=chat_room,
            sender=request.user,
            content=content
        )
        serializer = ChatMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
