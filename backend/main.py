<<<<<<< Updated upstream
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
=======
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional, List
>>>>>>> Stashed changes
import requests
from datetime import datetime, timedelta
import os
import uvicorn
from dotenv import load_dotenv

<<<<<<< Updated upstream
app = FastAPI()
=======
from .database import engine, Base, get_db
from .models import User, UserProfile, Job, ApplicationLog, CVData, CVProfile, JobMatch
from .agent import NidusAgent
from .auth import create_access_token, get_current_user, get_current_user_optional

# Import new routers
from .routes_cv import router as cv_router
from .routes_matching import router as matching_router

# Load environment variables
load_dotenv()

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nidus API", version="2.0")
>>>>>>> Stashed changes

# Enable CORS for local troubleshooting if needed, though strictly not needed if serving from same origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< Updated upstream
@app.get("/api/scrape")
async def scrape_jobs(term: str = "react"):
=======
# Include new routers
app.include_router(cv_router)
app.include_router(matching_router)

# ==================== PYDANTIC SCHEMAS ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str = "User"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    raw_cv_text: Optional[str] = None

class JobCreate(BaseModel):
    id: Optional[str] = None
    title: str
    company: str
    link: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    tags: Optional[List[str]] = None
    status: str = "wishlist"
    source: str = "manual"

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    link: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None

class AgentRequest(BaseModel):
    job_url: str

class AIAnalyzeRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = None

class AIChatRequest(BaseModel):
    messages: List[dict]
    job_context: Optional[dict] = None

# ==================== AUTH ENDPOINTS ====================

@app.post("/api/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    new_user = User(
        email=user_data.email,
        hashed_password=User.hash_password(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create profile
    profile = UserProfile(
        user_id=new_user.id,
        full_name=user_data.full_name
    )
    db.add(profile)
    db.commit()
    
    # Generate token
    access_token = create_access_token(data={"sub": new_user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": user_data.full_name
        }
    }

@app.post("/api/auth/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not user.verify_password(credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    
    # Generate token
    access_token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": profile.full_name if profile else "User"
        }
    }

@app.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": profile.full_name if profile else "User",
        "bio": profile.bio if profile else None,
        "created_at": current_user.created_at
    }

# ==================== PROFILE ENDPOINTS ====================

@app.get("/api/profile")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {
        "full_name": profile.full_name,
        "bio": profile.bio,
        "raw_cv_text": profile.raw_cv_text,
        "optimized_cv_text": profile.optimized_cv_text,
        "skills": profile.skills,
        "experience": profile.experience
    }

@app.put("/api/profile")
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
    
    if profile_data.full_name is not None:
        profile.full_name = profile_data.full_name
    if profile_data.bio is not None:
        profile.bio = profile_data.bio
    if profile_data.raw_cv_text is not None:
        profile.raw_cv_text = profile_data.raw_cv_text
    
    db.commit()
    db.refresh(profile)
    
    return {"status": "success", "profile": profile.full_name}

# ==================== JOBS CRUD ENDPOINTS ====================

@app.get("/api/jobs")
def get_jobs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    jobs = db.query(Job).filter(Job.user_id == current_user.id).order_by(Job.created_at.desc()).all()
    
    return [{
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "link": job.link,
        "description": job.description,
        "date": job.date,
        "tags": job.tags,
        "status": job.status,
        "source": job.source,
        "created_at": job.created_at.isoformat() if job.created_at else None
    } for job in jobs]

@app.post("/api/jobs", status_code=status.HTTP_201_CREATED)
def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Generate ID if not provided
    if not job_data.id:
        import uuid
        job_id = str(uuid.uuid4())
    else:
        job_id = job_data.id
        # Check if job already exists for this user
        existing = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Job with this ID already exists")
    
    # Set date if not provided
    if not job_data.date:
        job_data.date = datetime.now().strftime("%Y-%m-%d")
    
    new_job = Job(
        id=job_id,
        user_id=current_user.id,
        title=job_data.title,
        company=job_data.company,
        link=job_data.link,
        description=job_data.description,
        date=job_data.date,
        tags=job_data.tags,
        status=job_data.status,
        source=job_data.source
    )
    
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    
    return {
        "id": new_job.id,
        "title": new_job.title,
        "company": new_job.company,
        "link": new_job.link,
        "status": new_job.status,
        "created_at": new_job.created_at.isoformat()
    }

@app.put("/api/jobs/{job_id}")
def update_job(
    job_id: str,
    job_data: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job_data.title is not None:
        job.title = job_data.title
    if job_data.company is not None:
        job.company = job_data.company
    if job_data.link is not None:
        job.link = job_data.link
    if job_data.description is not None:
        job.description = job_data.description
    if job_data.date is not None:
        job.date = job_data.date
    if job_data.tags is not None:
        job.tags = job_data.tags
    if job_data.status is not None:
        job.status = job_data.status
    
    db.commit()
    db.refresh(job)
    
    return {"status": "success", "job_id": job.id}

@app.delete("/api/jobs/{job_id}")
def delete_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(job)
    db.commit()
    
    return {"status": "success", "deleted_id": job_id}

# ==================== AGENT ENDPOINT ====================

@app.post("/api/agent/apply")
async def run_agent(
    request: AgentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not configured")
    
    agent = NidusAgent(profile)
    status_result, log = await agent.apply_to_job(request.job_url)
    
    # Log attempt
    db_log = ApplicationLog(
        user_id=current_user.id,
        job_id="manual_run",
        status=status_result,
        log="\n".join(log)
    )
    db.add(db_log)
    db.commit()
    
    return {"status": status_result, "log": log}

# ==================== SCRAPER ENDPOINT ====================

@app.get("/api/scrape")
async def scrape_jobs(
    term: str = "react",
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
>>>>>>> Stashed changes
    try:
        url = f"https://remoteok.com/api?tag={term}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Filter out legal disclaimer
        jobs = [job for job in data if isinstance(job, dict) and "legal" not in str(job.get("slug", ""))]
        
        formatted_jobs = []
<<<<<<< Updated upstream
        for job in jobs:
=======
        for job in jobs[:20]:  # Limit to 20 jobs
            job_id = str(job.get("id", ""))
            
>>>>>>> Stashed changes
            formatted_jobs.append({
                "id": job_id,
                "title": job.get("position", "Unknown Position"),
                "company": job.get("company", "Unknown Company"),
                "date": job.get("date", "").split("T")[0] if job.get("date") else datetime.now().strftime("%Y-%m-%d"),
                "link": job.get("url", ""),
                "tags": job.get("tags", []),
                "status": "wishlist",
                "source": "remoteok"
            })
        
        return formatted_jobs
        
    except Exception as e:
        print(f"Error scraping: {e}")
<<<<<<< Updated upstream
        raise HTTPException(status_code=500, detail=str(e)) from e
=======
        raise HTTPException(status_code=500, detail=f"Scraping error: {str(e)}")

# ==================== AI ENDPOINTS ====================

@app.post("/api/ai/analyze-cv")
async def analyze_cv(
    request: AIAnalyzeRequest,
    current_user: User = Depends(get_current_user)
):
    """Analyze CV using Groq API"""
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if not groq_api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY not configured on server"
        )
    
    try:
        prompt = f"""Eres un experto en optimización de CVs y sistemas ATS. Analiza el siguiente CV y proporciona feedback detallado.

CV:
{request.resume_text}

{f"Descripción del puesto objetivo: {request.job_description}" if request.job_description else ""}

Proporciona un análisis en formato JSON con:
1. score: Puntuación de 0-100
2. feedback: Array de mejoras críticas
3. optimizedChecklist: Array de cambios específicos realizados
4. rewrittenCV: Versión optimizada del CV en Markdown

Usa el método STAR/HAR para logros. Sé crítico pero constructivo."""

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
                "response_format": {"type": "json_object"}
            },
            timeout=60
        )
        
        response.raise_for_status()
        result = response.json()
        
        return result["choices"][0]["message"]["content"]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis error: {str(e)}")

@app.post("/api/ai/chat")
async def ai_chat(
    request: AIChatRequest,
    current_user: User = Depends(get_current_user)
):
    """General AI chat endpoint for interviews and cover letters"""
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if not groq_api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY not configured on server"
        )
    
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": request.messages,
                "temperature": 0.7
            },
            timeout=30
        )
        
        response.raise_for_status()
        result = response.json()
        
        return {"message": result["choices"][0]["message"]["content"]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")

# ==================== HEALTH CHECK ====================

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "version": "2.0"}

# ==================== STATIC FILES ====================
>>>>>>> Stashed changes

# Mount static files (React build)
static_dir = os.path.join(os.path.dirname(__file__), "dist")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
