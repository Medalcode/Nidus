from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.candidate import Candidate
from app.models.user import User
from app.services.pdf_generator import generate_pdf_report
from app.api.dependencies import get_current_user
from app.schemas.cv import CVAnalysisResponse

router = APIRouter()

from app.repositories.candidate import candidate_repo

from typing import Any
@router.get("/cvs", response_model=List[Any])
def list_cvs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Filter candidates by current user
    candidates = candidate_repo.get_by_user(db, user_id=current_user.id)
    
    results = []
    for c in candidates:
        analysis = {
            "filename": c.filename,
            "keywords": c.keywords,
            "format": c.format,
            "structure": c.structure,
            "recommendations": c.recommendations,
            "match_score": c.match_score,
            "missing_keywords": c.missing_keywords or [],
            "ai_extracted": c.ai_data
        }
        results.append({
            "id": c.id,
            "filename": c.filename,
            "analysis": analysis,
            "upload_date": c.upload_date
        })
    return results

@router.get("/export-pdf/{candidate_id}")
def export_pdf(
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get candidate and verify ownership
    candidate = candidate_repo.get_by_id_and_user(db, id=candidate_id, user_id=current_user.id)
    
    if not candidate:
        raise HTTPException(status_code=404, detail="CV not found or access denied")
        
    # Reconstruct analysis dict for the PDF generator
    analysis = {
        "filename": candidate.filename,
        "format": candidate.format,
        "keywords": candidate.keywords,
        "structure": candidate.structure,
        "recommendations": candidate.recommendations
    }
    
    pdf_buffer = generate_pdf_report(analysis)
    
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=analysis_{candidate_id}.pdf"}
    )
