import logging
import asyncio
from typing import Dict, Any, Optional

from app.celery_app import celery_app
from app.services.cv_analyzer import analyze_cv_text
from app.services.matching_service import calculate_match_score, get_missing_keywords
from app.repositories.candidate import candidate_repo
from app.core.database import SessionLocal
from app.models.user import User

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def process_cv_task(self, cv_text: str, filename: str, ext: str, user_id: int, job_description: Optional[str] = None, api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Celery task to process CV text asynchronously.
    """
    logger.info(f"Processing CV task {self.request.id} for user {user_id}")
    
    try:
        # Run synchronous or blocking analysis here
        analysis_result = analyze_cv_text(cv_text, filename, ext, api_key=api_key)
        
        # Calculate match if JD is provided
        if job_description:
            score = calculate_match_score(cv_text, job_description)
            missing = get_missing_keywords(cv_text, job_description)
            analysis_result["match_score"] = score
            analysis_result["missing_keywords"] = missing
            
            if missing:
                analysis_result["recommendations"].append(f"Faltan palabras clave importantes: {', '.join(missing[:3])}")
        else:
            analysis_result["match_score"] = 0.0
            analysis_result["missing_keywords"] = []
            
        # Save to DB inside task
        db = SessionLocal()
        try:
            candidate_in = {
                "user_id": user_id,
                "filename": filename,
                "format": ext.upper(),
                "keywords": analysis_result["keywords"],
                "structure": analysis_result["structure"],
                "recommendations": analysis_result["recommendations"],
                "match_score": analysis_result["match_score"],
                "missing_keywords": analysis_result["missing_keywords"],
                "ai_data": analysis_result["ai_extracted"]
            }
            candidate = candidate_repo.create(db, obj_in=candidate_in)
            analysis_result["id"] = candidate.id
            analysis_result["status"] = "completed"
        finally:
            db.close()
            
        return analysis_result
        
    except Exception as e:
        logger.error(f"Error processing CV task: {e}")
        return {"status": "failed", "error": str(e)}
