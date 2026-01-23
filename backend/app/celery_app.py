from celery import Celery
from app.core.config import settings

# Default redis url if not in settings
REDIS_URL = settings.REDIS_URL or "redis://localhost:6379/0"

celery_app = Celery("nidus", broker=REDIS_URL, backend=REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

celery_app.autodiscover_tasks(["app.tasks"])
