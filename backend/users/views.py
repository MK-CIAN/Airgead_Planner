from django.shortcuts import render
from rest_framework import viewsets, permissions

from data.models import CustomBudget, Portfolio
from .serializers import *
from .models import *
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from knox.models import AuthToken
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
User = get_user_model()

class ToggleTooltipsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.tooltips_enabled = not user.tooltips_enabled  # Toggle the value
        user.save()
        return Response({"tooltips_enabled": user.tooltips_enabled}, status=status.HTTP_200_OK)

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
        data = []
        for n in notifications:
            notification_data = {
                "id": n.id,
                "type": n.type,
                "message": n.message,
                "sender": n.sender.username if n.sender else None,
            }
            if n.type == "budget_invite":
                notification_data["budget_id"] = n.budget.id if n.budget else None
            if n.type == "savings_invite":
                notification_data["savings_goal_id"] = n.savings_goal.id if n.savings_goal else None
            if n.type == "stock_league_invite":
                notification_data["stock_league_id"] = n.stock_league.id if n.stock_league else None
            data.append(notification_data)
        return Response(data)


class AcceptNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        notification_id = request.data.get("notification_id")
        try:
            # Retrieve the notification
            notification = Notification.objects.get(id=notification_id, user=request.user)

            if notification.type == "friend_request":
                # Process friend request
                friend_request = FriendRequest.objects.get(
                    sender=notification.sender, receiver=request.user, status="pending"
                )
                friend_request.status = "accepted"
                friend_request.save()

                # Create a friendship
                Friendship.objects.create(user1=friend_request.sender, user2=friend_request.receiver)

            elif notification.type == "budget_invite" and notification.budget:
                # Process budget invite
                budget = notification.budget
                budget.contributors.add(request.user)
                budget.save()
                
            elif notification.type == "savings_invite" and notification.savings_goal:
                # Process budget invite
                savings_goal = notification.savings_goal
                savings_goal.contributors.add(request.user)
                savings_goal.save()
                
            elif notification.type == "stock_league_invite" and notification.stock_league:
                # Process stock league invite
                stock_league = notification.stock_league
                stock_league.members.add(request.user)
                stock_league.save()
                
                portfolio, created = Portfolio.objects.get_or_create(
                    user=request.user,
                    league=stock_league,
                    portfolio_type=Portfolio.LEAGUE,
                    defaults={"balance": 10000.00, "totalbalance": 10000.00},  # Default starting balance
                )
                if created:
                    print(f"Portfolio created for user {request.user.username} in league {stock_league.name}")

            # Mark the notification as read
            notification.is_read = True
            notification.save()

            return Response({"message": "Notification accepted."}, status=200)

        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=404)
        except FriendRequest.DoesNotExist:
            return Response({"error": "Friend request not found."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
        
class DenyNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        notification_id = request.data.get("notification_id")
        budget_id = request.data.get("budget_id", None)  # For denying budget invites

        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            
            if notification.type == "friend_request":
                # Deny a friend request
                friend_request = FriendRequest.objects.get(
                    sender=notification.sender, receiver=request.user, status="pending"
                )
                friend_request.status = "rejected"
                friend_request.save()

            elif notification.type == "budget_invite" and budget_id:
                # Deny a budget invite (mark the notification as read)
                # No changes are made to the CustomBudget as the invite is simply ignored.

                pass  # Optional: Log or track that the budget invite was denied.

            # Mark the notification as read or processed
            notification.is_read = True
            notification.save()

            return Response({"message": "Notification denied."}, status=200)

        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=404)
        except FriendRequest.DoesNotExist:
            return Response({"error": "Friend request not found."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
        
class PendingInvitesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        entity_id = request.query_params.get("entity_id")
        entity_type = request.query_params.get("entity_type")

        if not entity_id or not entity_type:
            return Response({"error": "Entity ID and type are required."}, status=400)

        # Mapping entity_type to the stored notification type
        entity_type_mapping = {
            "budget": "budget_invite",
            "savingsGoal": "savings_invite",
            "stockLeague": "stock_league_invite",
        }

        notification_type = entity_type_mapping.get(entity_type)

        if not notification_type:
            return Response({"error": "Invalid entity type provided."}, status=400)

        # Fetch only pending invites related to this entity
        pending_invites = Notification.objects.filter(
            sender=request.user,
            type=notification_type,
            is_read=False,
        ).values("user_id")

        return Response([{"friend_id": invite["user_id"]} for invite in pending_invites])

        
class FriendsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Retrieve all friends for the authenticated user
        friendships = Friendship.objects.filter(Q(user1=user) | Q(user2=user))

        friends = []
        for friendship in friendships:
            friend = friendship.user2 if friendship.user1 == user else friendship.user1
            friends.append({
                "id": friend.id,
                "username": friend.username,
                "email": friend.email,
            })

        return Response(friends)