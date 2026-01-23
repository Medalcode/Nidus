from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Form, Header, Depends
from fastapi.responses import JSONResponse
import logging
from sqlalchemy.orm import Session
from app.services.file_handler import extract_text_from_file
from app.services.cv_analyzer import analyze_cv_text
from app.services.matching_service import calculate_match_score, get_missing_keywords
from app.core.database import get_db
from app.models.candidate import Candidate
from app.models.user import User
from app.schemas.cv import CVAnalysisResponse
from app.api.dependencies import get_current_user
from app.repositories.candidate import candidate_repo
from typing import Optional, Dict, Any

router = APIRouter()
logger = logging.getLogger("ats.api.upload")

from app.tasks.cv_processing import process_cv_task

@router.post("/upload-cv", response_model=Dict[str, Any])
async def upload_cv(
    file: UploadFile = File(...), 
    job_description: Optional[str] = Form(None),
    x_groq_api_key: Optional[str] = Header(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    MAX_SIZE = 2 * 1024 * 1024  # 2MB
    ALLOWED_EXTS = {"pdf", "docx", "txt"}

    filename = file.filename
    ext = filename.lower().split('.')[-1]
    
    if ext not in ALLOWED_EXTS:
        return JSONResponse(content={"error": "Extensión no permitida."}, status_code=400)

    content = await file.read()
    if len(content) > MAX_SIZE:
        return JSONResponse(content={"error": "Archivo demasiado grande (máx 2MB)."}, status_code=400)
    
    # Reset cursor for service
    await file.seek(0)
    
    try:
        # Extract text synchronously for now (or make this async too if needed)
        # But we need text to pass to Celery task
        text = await extract_text_from_file(file)
    except Exception as e:
        return JSONResponse(content={"error": f"Error al procesar archivo: {str(e)}"}, status_code=500)

    # Trigger async task
    task = process_cv_task.delay(
        cv_text=text,
        filename=filename,
        ext=ext,
        user_id=current_user.id,
        job_description=job_description,
        api_key=x_groq_api_key
    )
    
    return {
        "task_id": task.id,
        "status": "processing",
        "message": "CV file received and processing started."
    }
