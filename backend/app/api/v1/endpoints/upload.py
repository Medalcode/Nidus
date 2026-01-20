from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Form, Header, Depends
from fastapi.responses import JSONResponse
import logging
from sqlalchemy.orm import Session
from app.services.file_handler import extract_text_from_file
from app.services.cv_analyzer import analyze_cv_text
from app.services.matching_service import calculate_match_score, get_missing_keywords
from app.core.database import get_db
from app.models.candidate import Candidate
from app.schemas.cv import CVAnalysisResponse
from typing import Optional

router = APIRouter()
logger = logging.getLogger("ats.api.upload")

@router.post("/upload-cv", response_model=CVAnalysisResponse)
async def upload_cv(
    file: UploadFile = File(...), 
    job_description: Optional[str] = Form(None),
    x_groq_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db),
    request: Request = None
):
    MAX_SIZE = 2 * 1024 * 1024  # 2MB
    ALLOWED_EXTS = {"pdf", "docx", "txt"}

    filename = file.filename
    ext = filename.lower().split('.')[-1]
    client_ip = request.client.host if request else "?"
    logger.info(f"Subida de archivo: {filename} ({ext}) desde {client_ip}")

    if ext not in ALLOWED_EXTS:
        logger.warning(f"Extensión no permitida: {filename}")
        return JSONResponse(content={"error": "Extensión no permitida."}, status_code=400)

    # Note: Checking size by reading everything into memory is not ideal for large files, 
    # but okay for 2MB limit. In a service extracting text, we might read it anyway.
    # We can check Content-Length header but it can be spoofed.
    # Here we rely on file_handler or read it here.
    # To avoid reading twice, we can read here or pass the uploadfile. 
    # `file.file` is a SpooledTemporaryFile.
    
    # We'll rely on the service to read, but we should handle the size check first if possible 
    # or handle it during read. Since we need to read for text extraction anyway:
    
    # Let's read it to check size first as in original code
    content = await file.read()
    if len(content) > MAX_SIZE:
        logger.warning(f"Archivo demasiado grande: {filename}")
        return JSONResponse(content={"error": "Archivo demasiado grande (máx 2MB)."}, status_code=400)
    
    # Reset cursor for service
    await file.seek(0)
    
    try:
        text = await extract_text_from_file(file)
    except Exception as e:
        return JSONResponse(content={"error": f"Error al procesar archivo: {str(e)}"}, status_code=500)

    analysis_result = analyze_cv_text(text, filename, ext, api_key=x_groq_api_key)
    
    # Calculate match if JD is provided
    if job_description:
        score = calculate_match_score(text, job_description)
        missing = get_missing_keywords(text, job_description)
        analysis_result["match_score"] = score
        analysis_result["missing_keywords"] = missing
        
        # Add recommendation about missing keywords
        if missing:
            analysis_result["recommendations"].append(f"Faltan palabras clave importantes: {', '.join(missing[:3])}")
    else:
        analysis_result["match_score"] = 0.0
        analysis_result["missing_keywords"] = []
    
    # Save to DB
    new_candidate = Candidate(
        filename=filename,
        format=ext.upper(),
        keywords=analysis_result["keywords"],
        structure=analysis_result["structure"],
        recommendations=analysis_result["recommendations"],
        match_score=analysis_result["match_score"],
        missing_keywords=analysis_result["missing_keywords"],
        ai_data=analysis_result["ai_extracted"]
    )
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)
    
    return analysis_result
