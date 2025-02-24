from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from data.models import SavingsGoal
from django.urls import reverse
from io import BytesIO
from PIL import Image

class SavingsGoalViewSetTest(TestCase):
    def setUp(self):
        """
        Set up test users, API client, and a savings goal.
        """
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com",
            username="testuser",
            password="testpassword"
        )
        self.friend = get_user_model().objects.create_user(
            email="friend@example.com",
            username="frienduser",
            password="friendpassword"
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.savings_goal = SavingsGoal.objects.create(
            user=self.user,
            name="New Car Fund",
            target_amount=10000.00,
            current_amount=500.00,
            monthly_contribution=200.00
        )

        self.savings_goal_list_url = reverse("savings-list")
        self.savings_goal_detail_url = reverse("savings-detail", args=[self.savings_goal.id])

    def test_get_savings_goals(self):
        """Ensure the API returns savings goals for the authenticated user."""
        response = self.client.get(self.savings_goal_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.savings_goal.id)

    def test_create_savings_goal(self):
        """Ensure a user can create a new savings goal."""
        data = {
            "name": "Vacation Fund",
            "target_amount": 5000.00,
            "monthly_contribution": 250.00
        }
        response = self.client.post(self.savings_goal_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SavingsGoal.objects.count(), 2)

    def test_partial_update_savings_goal(self):
        """Ensure a user can update the current amount of a savings goal."""
        update_url = reverse("savings-detail", args=[self.savings_goal.id])
        data = {"current_amount": 1000.00}
        response = self.client.patch(update_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.savings_goal.refresh_from_db()
        self.assertEqual(self.savings_goal.current_amount, 1000.00)

    def test_current_amount_does_not_exceed_target(self):
        """Ensure the current amount cannot exceed the target amount."""
        update_url = reverse("savings-detail", args=[self.savings_goal.id])
        data = {"current_amount": 12000.00}  # Greater than target_amount
        response = self.client.patch(update_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.savings_goal.refresh_from_db()
        self.assertEqual(self.savings_goal.current_amount, 10000.00)  # Should be capped at target_amount

    def test_upload_image_to_savings_goal(self):
        """Ensure a user can upload an image to a savings goal."""
        upload_url = reverse("savings-upload-image", kwargs={"pk": self.savings_goal.id})

        # Generate a sample image
        image = BytesIO()
        img = Image.new("RGB", (100, 100), color="red")
        img.save(image, format="PNG")
        image.seek(0)

        data = {"image": image}
        response = self.client.post(upload_url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.savings_goal.refresh_from_db()
        self.assertIsNotNone(self.savings_goal.image)

    def test_invite_friend_to_savings_goal(self):
        """Ensure a user can invite a friend to a savings goal."""
        invite_url = reverse("savings-invite-friend", kwargs={"pk": self.savings_goal.id})
        data = {"friend_id": self.friend.id}
        response = self.client.post(invite_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
