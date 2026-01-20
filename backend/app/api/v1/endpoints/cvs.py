from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.candidate import Candidate
from app.services.pdf_generator import generate_pdf_report
# Reusing the schema but might need a new one including ID
from app.schemas.cv import CVAnalysisResponse

router = APIRouter()

# TODO: Create a CandidateResponse schema with ID and Date
@router.get("/cvs")
def list_cvs(db: Session = Depends(get_db)):
    candidates = db.query(Candidate).order_by(Candidate.upload_date.desc()).all()
    # Map to expected format (legacy or new)
    # The frontend expects a list of objects with "filename" and "analysis" keys? 
    # Or we can just return the candidate objects directly if we update frontend.
    # For now, let's adapt to what Frontend expects: list of objects.
    # Actually, the original code returned: [{"filename": "...", "analysis": {...}}]
    
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
            "id": c.id, # Added ID for frontend use
            "filename": c.filename, 
            "analysis": analysis,
            "upload_date": c.upload_date
        })
    return results

@router.get("/export-pdf/{candidate_id}")
def export_pdf(candidate_id: int, db: Session = Depends(get_db)):
    # Assuming candidate_id is the database Primary Key
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    
    if not candidate:
        raise HTTPException(status_code=404, detail="CV not found")
        
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
