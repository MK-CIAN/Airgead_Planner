from django.shortcuts import render
from rest_framework import viewsets, permissions
from .serializers import *
from .models import *
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from knox.models import AuthToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
User = get_user_model()

#Login Viewset
class LoginViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            password = serializer.validated_data.get('password')
            user = authenticate(request, email=email, password=password)
            # If valid user, create token
            if user:
                _, token = AuthToken.objects.create(user)

                # Return user details and token
                return Response({
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'username': user.username,
                    },
                    'token': token
                }, status=200)
            else:
                return Response({'error': 'Invalid credentials'}, status=401)
        else:
            return Response(serializer.errors, status=400)

#Register Viewset
class RegisterViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            # Save the new user
            user = serializer.save()
            # Return the created user details
            return Response({
                'id': user.id,
                'email': user.email,
                'username': user.username,
            }, status=201)
        else:
            # Return validation errors
            return Response(serializer.errors, status=400)
        

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # Get the authenticated user
        serializer = UserSerializer(user)
        return Response(serializer.data)


class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        user = request.user

        # Search for users by username or email, excluding the current user
        users = User.objects.filter(
            Q(username__icontains=query) | Q(email__icontains=query)
        ).exclude(id=user.id)

        results = []
        for u in users:
            # Determine the relationship status
            if Friendship.objects.filter(Q(user1=user, user2=u) | Q(user1=u, user2=user)).exists():
                status = "friends"
            elif FriendRequest.objects.filter(sender=user, receiver=u, status="pending").exists():
                status = "pending"
            else:
                status = "none"

            results.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "status": status,
            })

        return Response(results)
    
class SendFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sender = request.user
        receiver_id = request.data.get("receiver_id")
        
        try:
            receiver = User.objects.get(id=receiver_id)
            # Check if a friend request already exists
            if FriendRequest.objects.filter(sender=sender, receiver=receiver).exists():
                return Response({"message": "Friend request already sent."}, status=400)
            
            # Create a new friend request
            friend_request = FriendRequest.objects.create(sender=sender, receiver=receiver)

            # Create a notification for the receiver
            Notification.objects.create(
                user=receiver,
                sender=sender,
                type="friend_request",
                message=f"{sender.username} sent you a friend request."
            )

            return Response({"message": "Friend request sent."})
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)
        
class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user, is_read=False)
        data = [{
            "id": n.id,
            "type": n.type,
            "message": n.message,
            "sender": n.sender.username if n.sender else None,
        } for n in notifications]
        return Response(data)

class AcceptFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        notification_id = request.data.get("notification_id")
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user, type="friend_request")
            friend_request = FriendRequest.objects.get(sender=notification.sender, receiver=request.user, status="pending")
            friend_request.status = "accepted"
            friend_request.save()

            # Create a friendship
            Friendship.objects.create(user1=friend_request.sender, user2=friend_request.receiver)

            # Mark notification as read
            notification.is_read = True
            notification.save()

            return Response({"message": "Friend request accepted."})
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=404)
        except FriendRequest.DoesNotExist:
            return Response({"error": "Friend request not found."}, status=404)

class DenyFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        notification_id = request.data.get("notification_id")
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user, type="friend_request")
            friend_request = FriendRequest.objects.get(sender=notification.sender, receiver=request.user, status="pending")
            friend_request.status = "rejected"
            friend_request.save()

            # Mark notification as read
            notification.is_read = True
            notification.save()

            return Response({"message": "Friend request denied."})
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=404)
        except FriendRequest.DoesNotExist:
            return Response({"error": "Friend request not found."}, status=404)