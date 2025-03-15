import os
from celery import Celery

# Set default Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dashboard.settings")

app = Celery("dashboard", broker="redis://redis:6379/0")

# Load Celery settings from Django settings
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover Celery tasks inside Django apps
app.autodiscover_tasks(lambda: ['data.utils'])

import data.utils.tasks