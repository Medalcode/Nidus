"""
CV Management and AI Matching endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from . import models
from .database import get_db
from .main import get_current_user
import os
from groq import Groq

router = APIRouter(prefix="/api/cv", tags=["cv"])

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
    return Groq(api_key=api_key)

# Pydantic schemas
class CVUploadResponse(BaseModel):
    id: int
    raw_text: str
    message: str

class CVDataResponse(BaseModel):
    id: int
    personal_info: Optional[dict]
    skills: Optional[List[str]]
    experience: Optional[List[dict]]
    education: Optional[List[dict]]
    languages: Optional[List[dict]]
    certifications: Optional[List[dict]]
    projects: Optional[List[dict]]
    created_at: str

class CVProfileResponse(BaseModel):
    id: int
    profile_type: str
    profile_name: str
    summary: Optional[str]
    tailored_skills: Optional[List[str]]
    is_active: bool
    auto_apply: bool

class GenerateProfilesRequest(BaseModel):
    profile_types: List[str] = ["frontend", "backend", "fullstack"]

# ============= CV Upload & Extraction =============

@router.post("/upload", response_model=CVUploadResponse)
async def upload_cv(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload CV file (PDF or TXT) and store raw text
    """
    # Read file content
    content = await file.read()
    
    # For now, handle text files. PDF parsing would use PyPDF2/pdfplumber
    if file.filename.endswith('.txt'):
        raw_text = content.decode('utf-8')
    elif file.filename.endswith('.pdf'):
        # TODO: Add PDF parsing with PyPDF2 or pdfplumber
        raise HTTPException(status_code=400, detail="PDF parsing not yet implemented. Please upload a .txt file with your CV content.")
    else:
        raise HTTPException(status_code=400, detail="Only .txt and .pdf files are supported")
    
    # Check if user already has CV data
    existing_cv = db.query(models.CVData).filter(models.CVData.user_id == current_user.id).first()
    
    if existing_cv:
        # Update existing
        existing_cv.raw_text = raw_text
        existing_cv.source_file_name = file.filename
        cv_data = existing_cv
    else:
        # Create new
        cv_data = models.CVData(
            user_id=current_user.id,
            raw_text=raw_text,
            source_file_name=file.filename
        )
        db.add(cv_data)
    
    db.commit()
    db.refresh(cv_data)
    
    return CVUploadResponse(
        id=cv_data.id,
        raw_text=raw_text[:500] + "..." if len(raw_text) > 500 else raw_text,
        message="CV uploaded successfully. Use /extract to parse it with AI."
    )

@router.post("/extract")
async def extract_cv_data(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Use AI to extract structured data from raw CV text
    """
    # Get user's CV data
    cv_data = db.query(models.CVData).filter(models.CVData.user_id == current_user.id).first()
    
    if not cv_data:
        raise HTTPException(status_code=404, detail="No CV uploaded. Please upload a CV first.")
    
    # AI extraction prompt
    extraction_prompt = f"""
You are a professional CV parser. Extract structured data from this CV:

{cv_data.raw_text}

Return a valid JSON object with the following structure:
{{
  "personal_info": {{
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username",
    "portfolio": "portfolio-url",
    "location": "City, Country"
  }},
  "skills": ["React", "Python", "Docker", "..."],
  "experience": [
    {{
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Jan 2020 - Present",
      "description": "Brief description",
      "achievements": ["Achievement 1", "Achievement 2"]
    }}
  ],
  "education": [
    {{
      "degree": "Bachelor of Science in Computer Science",
      "institution": "University Name",
      "year": "2020",
      "gpa": "3.8/4.0"
    }}
  ],
  "languages": [
    {{"language": "English", "proficiency": "Native"}},
    {{"language": "Spanish", "proficiency": "Professional"}}
  ],
  "certifications": [
    {{
      "name": "AWS Certified Developer",
      "issuer": "Amazon",
      "year": "2022",
      "credential_id": "ABC123"
    }}
  ],
  "projects": [
    {{
      "name": "Project Name",
      "description": "What it does",
      "technologies": ["React", "Node.js"],
      "url": "github.com/user/project"
    }}
  ]
}}

Only return the JSON, no markdown formatting or explanations.
"""
    
    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": extraction_prompt}],
            temperature=0.1,
            max_tokens=3000
        )
        
        result_text = response.choices[0].message.content.strip()
        
        # Clean potential markdown formatting
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        result_text = result_text.strip()
        
        import json
        extracted_data = json.loads(result_text)
        
        # Update CV data
        cv_data.personal_info = extracted_data.get("personal_info")
        cv_data.skills = extracted_data.get("skills")
        cv_data.experience = extracted_data.get("experience")
        cv_data.education = extracted_data.get("education")
        cv_data.languages = extracted_data.get("languages")
        cv_data.certifications = extracted_data.get("certifications")
        cv_data.projects = extracted_data.get("projects")
        
        db.commit()
        db.refresh(cv_data)
        
        return {
            "message": "CV data extracted successfully",
            "data": CVDataResponse(
                id=cv_data.id,
                personal_info=cv_data.personal_info,
                skills=cv_data.skills,
                experience=cv_data.experience,
                education=cv_data.education,
                languages=cv_data.languages,
                certifications=cv_data.certifications,
                projects=cv_data.projects,
                created_at=str(cv_data.created_at)
            )
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {str(e)}")

# ============= Profile Generation =============

@router.post("/generate-profiles")
async def generate_profiles(
    request: GenerateProfilesRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate tailored CV profiles based on extracted data
    """
    cv_data = db.query(models.CVData).filter(models.CVData.user_id == current_user.id).first()
    
    if not cv_data or not cv_data.skills:
        raise HTTPException(status_code=400, detail="Please extract CV data first using /extract endpoint")
    
    # Delete existing profiles for fresh generation
    db.query(models.CVProfile).filter(models.CVProfile.cv_data_id == cv_data.id).delete()
    db.commit()
    
    generated_profiles = []
    
    for profile_type in request.profile_types:
        # AI profile generation prompt
        profile_prompt = f"""
You are an expert career coach. Create a tailored CV profile for a {profile_type.upper()} developer position.

Original CV Data:
Skills: {cv_data.skills}
Experience: {cv_data.experience}
Education: {cv_data.education}
Projects: {cv_data.projects}

Generate a JSON with:
{{
  "profile_name": "Short title like 'Senior Frontend Developer (React/TypeScript)'",
  "summary": "2-3 sentence professional summary emphasizing {profile_type} skills",
  "tailored_skills": ["Top 10-15 skills most relevant for {profile_type}, ordered by importance"],
  "match_keywords": ["20-30 keywords that commonly appear in {profile_type} job descriptions"]
}}

Only return the JSON, no markdown.
"""
        
        try:
            client = get_groq_client()
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": profile_prompt}],
                temperature=0.3,
                max_tokens=1500
            )
            
            result_text = response.choices[0].message.content.strip()
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()
            
            import json
            profile_data = json.loads(result_text)
            
            # Create profile
            new_profile = models.CVProfile(
                cv_data_id=cv_data.id,
                profile_type=profile_type,
                profile_name=profile_data["profile_name"],
                summary=profile_data["summary"],
                tailored_skills=profile_data["tailored_skills"],
                match_keywords=profile_data["match_keywords"],
                is_active=True,
                auto_apply=False  # User can enable this later
            )
            
            db.add(new_profile)
            generated_profiles.append(profile_data["profile_name"])
            
        except Exception as e:
            print(f"Error generating {profile_type} profile: {e}")
            continue
    
    db.commit()
    
    return {
        "message": f"Generated {len(generated_profiles)} profiles",
        "profiles": generated_profiles
    }

@router.get("/profiles", response_model=List[CVProfileResponse])
async def get_profiles(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all CV profiles for current user
    """
    cv_data = db.query(models.CVData).filter(models.CVData.user_id == current_user.id).first()
    
    if not cv_data:
        return []
    
    profiles = db.query(models.CVProfile).filter(models.CVProfile.cv_data_id == cv_data.id).all()
    
    return [
        CVProfileResponse(
            id=p.id,
            profile_type=p.profile_type,
            profile_name=p.profile_name,
            summary=p.summary,
            tailored_skills=p.tailored_skills,
            is_active=p.is_active,
            auto_apply=p.auto_apply
        )
        for p in profiles
    ]

@router.get("/data", response_model=CVDataResponse)
async def get_cv_data(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get extracted CV data
    """
    cv_data = db.query(models.CVData).filter(models.CVData.user_id == current_user.id).first()
    
    if not cv_data:
        raise HTTPException(status_code=404, detail="No CV data found")
    
    return CVDataResponse(
        id=cv_data.id,
        personal_info=cv_data.personal_info,
        skills=cv_data.skills,
        experience=cv_data.experience,
        education=cv_data.education,
        languages=cv_data.languages,
        certifications=cv_data.certifications,
        projects=cv_data.projects,
        created_at=str(cv_data.created_at)
    )
