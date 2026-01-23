from fastapi import APIRouter
from app.celery_app import celery_app
from celery.result import AsyncResult

router = APIRouter()

@router.get("/tasks/{task_id}")
def get_task_status(task_id: str):
    """
    Get the status and result of a Celery task.
    """
    task_result = AsyncResult(task_id, app=celery_app)
    
    response = {
        "task_id": task_id,
        "status": task_result.status,
        "result": None
    }
    
    if task_result.successful():
        response["result"] = task_result.result
    elif task_result.failed():
        response["error"] = str(task_result.result)
        
    return response
