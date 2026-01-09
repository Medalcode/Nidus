"""
AI Job Matching endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from . import models
from .database import get_db
from .main import get_current_user
import os
from groq import Groq
from datetime import datetime

router = APIRouter(prefix="/api/matches", tags=["matches"])

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
    return Groq(api_key=api_key)

# Pydantic schemas
class JobMatchResponse(BaseModel):
    id: int
    job_id: str
    job_title: str
    company: str
    profile_name: str
    match_score: float
    match_reasoning: Optional[str]
    skill_match_details: Optional[dict]
    experience_fit: Optional[str]
    is_recommended: bool
    status: str
    created_at: str

class MatchDecisionRequest(BaseModel):
    decision: str  # "approve" or "reject"

# ============= AI Matching =============

@router.post("/analyze-job/{job_id}")
async def analyze_job_match(
    job_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculate AI match scores between a job and all user's CV profiles
    """
    # Get job
    job = db.query(models.Job).filter(
        models.Job.id == job_id,
        models.Job.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get user's CV profiles
    cv_data = db.query(models.CVData).filter(models.CVData.user_id == current_user.id).first()
    
    if not cv_data:
        raise HTTPException(status_code=400, detail="No CV data found. Please upload and extract your CV first.")
    
    profiles = db.query(models.CVProfile).filter(
        models.CVProfile.cv_data_id == cv_data.id,
        models.CVProfile.is_active == True
    ).all()
    
    if not profiles:
        raise HTTPException(status_code=400, detail="No active CV profiles found. Please generate profiles first.")
    
    # Delete existing matches for this job to recalculate
    db.query(models.JobMatch).filter(models.JobMatch.job_id == job_id).delete()
    db.commit()
    
    matches_created = []
    best_match = None
    best_score = 0
    
    for profile in profiles:
        # AI matching prompt
        matching_prompt = f"""
You are an expert recruiter. Analyze how well this candidate matches this job posting.

JOB POSTING:
Title: {job.title}
Company: {job.company}
Description: {job.description or 'No description available'}
Required Skills: {job.required_skills or []}
Required Experience: {job.required_experience or 'Not specified'}

CANDIDATE PROFILE:
Type: {profile.profile_type.upper()}
Profile: {profile.profile_name}
Summary: {profile.summary}
Skills: {profile.tailored_skills}
Relevant Experience: {[exp for exp in cv_data.experience if any(skill.lower() in str(exp).lower() for skill in profile.tailored_skills[:5])]}

Return a JSON object with:
{{
  "match_score": 75,  // 0-100, where 80+ is excellent match
  "match_reasoning": "Brief explanation of why this score",
  "skill_match_details": {{
    "matched": ["Skills from job that candidate has"],
    "missing": ["Important skills candidate lacks"],
    "bonus": ["Extra skills candidate has beyond requirements"]
  }},
  "experience_fit": "Perfect|Good|Stretch|Under-qualified",
  "recommendation_strength": "Strong|Moderate|Weak"
}}

Only return JSON, no markdown.
"""
        
        try:
            client = get_groq_client()
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": matching_prompt}],
                temperature=0.2,
                max_tokens=1000
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
            match_data = json.loads(result_text)
            
            # Create match record
            job_match = models.JobMatch(
                job_id=job_id,
                cv_profile_id=profile.id,
                match_score=match_data["match_score"],
                match_reasoning=match_data["match_reasoning"],
                skill_match_details=match_data["skill_match_details"],
                experience_fit=match_data["experience_fit"],
                recommendation_strength=match_data["recommendation_strength"],
                is_recommended=False,  # Will set best match later
                status="pending_review"
            )
            
            db.add(job_match)
            matches_created.append({
                "profile": profile.profile_name,
                "score": match_data["match_score"]
            })
            
            # Track best match
            if match_data["match_score"] > best_score:
                best_score = match_data["match_score"]
                best_match = job_match
            
        except Exception as e:
            print(f"Error matching profile {profile.profile_name}: {e}")
            continue
    
    # Mark best match as recommended
    if best_match:
        best_match.is_recommended = True
    
    # Update job status
    if best_score >= 70:
        job.status = "pending_review"
    else:
        job.status = "low_match"
    
    db.commit()
    
    return {
        "message": f"Analyzed {len(matches_created)} profiles",
        "best_match": {
            "profile": best_match.cv_profile.profile_name if best_match else None,
            "score": best_score
        },
        "all_matches": matches_created
    }

@router.get("/queue", response_model=List[JobMatchResponse])
async def get_approval_queue(
    min_score: int = 60,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all pending job matches awaiting user approval
    """
    # Get all user's jobs with pending matches
    cv_data = db.query(models.CVData).filter(models.CVData.user_id == current_user.id).first()
    
    if not cv_data:
        return []
    
    profile_ids = [p.id for p in cv_data.profiles]
    
    matches = db.query(models.JobMatch).join(models.Job).filter(
        models.JobMatch.status == "pending_review",
        models.JobMatch.match_score >= min_score,
        models.JobMatch.cv_profile_id.in_(profile_ids),
        models.Job.user_id == current_user.id
    ).order_by(models.JobMatch.match_score.desc()).all()
    
    return [
        JobMatchResponse(
            id=m.id,
            job_id=m.job_id,
            job_title=m.job.title,
            company=m.job.company,
            profile_name=m.cv_profile.profile_name,
            match_score=m.match_score,
            match_reasoning=m.match_reasoning,
            skill_match_details=m.skill_match_details,
            experience_fit=m.experience_fit,
            is_recommended=m.is_recommended,
            status=m.status,
            created_at=str(m.created_at)
        )
        for m in matches
    ]

@router.put("/{match_id}/decide")
async def decide_on_match(
    match_id: int,
    request: MatchDecisionRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    User approves or rejects a job match
    """
    # Get match and verify ownership
    match = db.query(models.JobMatch).join(models.Job).join(models.CVProfile).join(models.CVData).filter(
        models.JobMatch.id == match_id,
        models.CVData.user_id == current_user.id
    ).first()
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if request.decision == "approve":
        match.status = "user_approved"
        match.user_decision_at = datetime.utcnow()
        match.job.status = "approved"  # Update job status
        
        message = f"Approved! Job will be queued for automated application with {match.cv_profile.profile_name} profile."
    elif request.decision == "reject":
        match.status = "user_rejected"
        match.user_decision_at = datetime.utcnow()
        match.job.status = "rejected"
        
        message = "Match rejected. Job will not be applied to."
    else:
        raise HTTPException(status_code=400, detail="Decision must be 'approve' or 'reject'")
    
    db.commit()
    
    return {
        "message": message,
        "match_id": match_id,
        "new_status": match.status
    }

@router.get("/stats")
async def get_matching_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get overview stats for user's job matches
    """
    cv_data = db.query(models.CVData).filter(models.CVData.user_id == current_user.id).first()
    
    if not cv_data:
        return {
            "total_jobs": 0,
            "pending_review": 0,
            "approved": 0,
            "rejected": 0,
            "applied": 0,
            "avg_match_score": 0
        }
    
    profile_ids = [p.id for p in cv_data.profiles]
    
    # Count matches by status
    all_matches = db.query(models.JobMatch).filter(
        models.JobMatch.cv_profile_id.in_(profile_ids)
    ).all()
    
    pending = len([m for m in all_matches if m.status == "pending_review"])
    approved = len([m for m in all_matches if m.status == "user_approved"])
    rejected = len([m for m in all_matches if m.status == "user_rejected"])
    applied = len([m for m in all_matches if m.status == "applied"])
    
    avg_score = sum(m.match_score for m in all_matches) / len(all_matches) if all_matches else 0
    
    return {
        "total_jobs": len(all_matches),
        "pending_review": pending,
        "approved": approved,
        "rejected": rejected,
        "applied": applied,
        "avg_match_score": round(avg_score, 1)
    }
