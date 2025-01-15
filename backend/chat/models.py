from django.db import models
from dashboard import settings

class ChatRoom(models.Model):
    budget = models.OneToOneField(
        'data.CustomBudget',  # Explicit app reference
        on_delete=models.CASCADE,
        related_name='chat_room',
        null=True,
        blank=True
    )
    savings_goal = models.ForeignKey(
        'data.SavingsGoal',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='chat_rooms'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_room'
        constraints = [
            models.CheckConstraint(
                check=~models.Q(budget__isnull=True) | ~models.Q(savings_goal__isnull=True),
                name="check_budget_or_savings_goal"
            )
        ]
        
class ChatMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_message'
