from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.urls import reverse
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from data.models import CustomBudget, SavingsGoal, StockLeague

# Create your models here.
# Custom User Manager
class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The Username field must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)
    
# Custom User model
class CustomUser(AbstractUser):
    email = models.EmailField(max_length=200, unique=True)
    username = models.CharField(max_length=100, unique=True)
    date_of_birth = models.DateField(null=True, blank=True)
    tooltips_enabled = models.BooleanField(default=True)

    objects = CustomUserManager()

    REQUIRED_FIELDS = ['username']  # Require username for superuser creation
    USERNAME_FIELD = 'email'       # Login with email

    def __str__(self):
        return self.username
    

# Signal to send email when password reset token is created
@receiver(reset_password_token_created)
def password_reset_token_created(reset_password_token, *args, **kwargs):
    sitelink = "http://localhost:5173/"
    token = '{}'.format(reset_password_token.key)
    full_link = str(sitelink) + str("password-reset/") + str(token)

    print(token)
    print(full_link)

    context = {
        'full_link': full_link,
        'email_address': reset_password_token.user.email,
    }

    html_message = render_to_string("backend/email.html", context=context)
    plain_message = strip_tags(html_message)

    msg = EmailMultiAlternatives(
        subject="Password Reset for Airgead Planner",
        body=plain_message,
        from_email="sender@example.com",
        to=[reset_password_token.user.email],
    )

    msg.attach_alternative(html_message, "text/html")
    msg.send()
    
# Friend Request Model
class FriendRequest(models.Model):
    sender = models.ForeignKey(CustomUser, related_name='sent_requests', on_delete=models.CASCADE)
    receiver = models.ForeignKey(CustomUser, related_name='received_requests', on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')],
        default='pending'
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} ({self.status})"
    
# Friendship Model
class Friendship(models.Model):
    user1 = models.ForeignKey(CustomUser, related_name='friends', on_delete=models.CASCADE)
    user2 = models.ForeignKey(CustomUser, related_name='+', on_delete=models.CASCADE)  # Avoid reverse relation
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Friendship: {self.user1.username} - {self.user2.username}"
    
class Notification(models.Model):
    user = models.ForeignKey(CustomUser, related_name="notifications", on_delete=models.CASCADE)
    sender = models.ForeignKey(CustomUser, related_name="sent_notifications", on_delete=models.CASCADE, null=True, blank=True)
    type = models.CharField(max_length=20, choices=[
        ("friend_request", "Friend Request"),
        ("budget_invite", "Budget Invite"),
        ("savings_invite", "Savings Invite"),
        ("stock_league_invite", "Stock League Invite"),
    ])
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    budget = models.ForeignKey(CustomBudget, on_delete=models.CASCADE, null=True, blank=True)
    savings_goal = models.ForeignKey(SavingsGoal, on_delete=models.CASCADE, null=True, blank=True)
    stock_league = models.ForeignKey(StockLeague, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.type}"

