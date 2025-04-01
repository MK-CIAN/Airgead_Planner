from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from users.models import FriendRequest, Notification, Friendship

class UsersViewTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com",
            username="testuser",
            password="testpassword"
        )
        self.other_user = get_user_model().objects.create_user(
            email="otheruser@example.com",
            username="otheruser",
            password="otherpassword"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # URLs
        self.toggle_tooltips_url = reverse("toggle-tooltips")
        self.login_url = reverse("login-list")
        self.register_url = reverse("register-list")
        self.user_detail_url = reverse("user-detail")
        self.user_search_url = reverse("user-search") + "?q=otheruser"
        self.send_friend_request_url = reverse("send-friend-request")
        self.notification_list_url = reverse("notifications")

    def test_toggle_tooltips(self):
        """Toggle tooltips_enabled for user."""
        self.assertTrue(self.user.tooltips_enabled)
        response = self.client.post(self.toggle_tooltips_url)
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.user.tooltips_enabled)

    def test_login_success(self):
        """Ensure a user can log in with correct credentials."""
        data = {"email": "testuser@example.com", "password": "testpassword"}
        self.client.logout()
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.data)

    def test_login_failure(self):
        """Ensure login fails with invalid credentials."""
        data = {"email": "testuser@example.com", "password": "wrongpassword"}
        self.client.logout()
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, 400)

    def test_register_user(self):
        """Test user registration endpoint."""
        data = {
            "email": "new@example.com",
            "username": "newuser",
            "password": "newpassword"
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(get_user_model().objects.filter(email="new@example.com").exists())

    def test_user_detail(self):
        """Get authenticated user's details."""
        response = self.client.get(self.user_detail_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], self.user.email)

    def test_user_search(self):
        """Search for another user by username."""
        response = self.client.get(self.user_search_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["username"], "otheruser")

    def test_send_friend_request(self):
        """Send a friend request and create notification."""
        response = self.client.post(self.send_friend_request_url, {"receiver_id": self.other_user.id})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(FriendRequest.objects.filter(sender=self.user, receiver=self.other_user).exists())
        self.assertTrue(Notification.objects.filter(user=self.other_user).exists())

    def test_notification_list(self):
        """Check unread notifications for a user."""
        Notification.objects.create(
            user=self.user,
            sender=self.other_user,
            type="friend_request",
            message="Test message"
        )
        response = self.client.get(self.notification_list_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["message"], "Test message")
