"""
Celery app initialization for async tasks.
"""

from celery import Celery
import os

# Initialize Celery
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("pms_tasks", broker=redis_url)

# Force registries compilation
import app.tasks.budget_tasks
import app.tasks.financial_tasks
