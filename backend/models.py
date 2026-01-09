from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import bcrypt

class User(Base):
    __tablename__ = "users_auth"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    jobs = relationship("Job", back_populates="user")
    cv_data = relationship("CVData", back_populates="user", uselist=False)
    
    def verify_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.hashed_password.encode('utf-8'))
    
    @staticmethod
    def hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_auth.id"), unique=True, nullable=False)
    full_name = Column(String, default="User")
    bio = Column(Text)
    raw_cv_text = Column(Text) # The raw text from PDF
    optimized_cv_text = Column(Text) # The AI optimized version
    skills = Column(JSON) # List of skills
    experience = Column(JSON) # Structured experience
    
    # Relationship
    user = relationship("User", back_populates="profile")
    
class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True) # ID from source (e.g. RemoteOK ID) or generated
    user_id = Column(Integer, ForeignKey("users_auth.id"), nullable=False, index=True)
    source = Column(String) # "remoteok", "linkedin", "manual", etc.
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    link = Column(String) # URL of the job posting (renamed from 'url' to match frontend)
    location = Column(String) # Job location
    description = Column(Text) # Full job description for AI matching
    required_skills = Column(JSON) # ["React", "Node.js", ...] extracted or manually added
    required_experience = Column(String) # "3-5 years", "Senior", etc.
    salary_range = Column(String) # Salary range if available
    remote_policy = Column(String) # "Remote", "Hybrid", "On-site"
    date = Column(String) # Date in YYYY-MM-DD format (frontend compatibility)
    tags = Column(JSON) # Tags from scrapers
    status = Column(String, default="scraped") # scraped, analyzing, pending_review, approved, applied, rejected, interview, offer
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="jobs")
    job_matches = relationship("JobMatch", back_populates="job", cascade="all, delete-orphan")

class CVData(Base):
    """
    Structured CV data extracted from uploaded PDF/text using AI
    This is the source of truth for all CV profiles
    """
    __tablename__ = "cv_data"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_auth.id"), unique=True, nullable=False)
    
    # Raw input
    raw_text = Column(Text, nullable=False)
    source_file_name = Column(String, nullable=True)
    
    # AI-extracted structured data
    personal_info = Column(JSON, nullable=True)  # {name, email, phone, linkedin, github, portfolio, location}
    skills = Column(JSON, nullable=True)  # ["React", "Python", "Docker", ...]
    experience = Column(JSON, nullable=True)  # [{company, role, duration, description, achievements}, ...]
    education = Column(JSON, nullable=True)  # [{degree, institution, year, gpa}, ...]
    languages = Column(JSON, nullable=True)  # [{language, proficiency}, ...]
    certifications = Column(JSON, nullable=True)  # [{name, issuer, year, credential_id}, ...]
    projects = Column(JSON, nullable=True)  # [{name, description, technologies, url}, ...]
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="cv_data")
    profiles = relationship("CVProfile", back_populates="cv_data", cascade="all, delete-orphan")

class CVProfile(Base):
    """
    AI-generated CV variations tailored for different job types
    Each profile emphasizes different skills/experience from the same CV
    """
    __tablename__ = "cv_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    cv_data_id = Column(Integer, ForeignKey("cv_data.id"), nullable=False)
    
    # Profile metadata
    profile_type = Column(String, nullable=False)  # "frontend", "backend", "fullstack", "devops", "custom"
    profile_name = Column(String, nullable=False)  # e.g., "Frontend Developer (React Specialist)"
    
    # AI-tailored content
    summary = Column(Text, nullable=True)  # Professional summary optimized for this profile
    tailored_skills = Column(JSON, nullable=True)  # Skills ordered by relevance for this profile
    highlighted_experience = Column(JSON, nullable=True)  # Experience entries with emphasized aspects
    match_keywords = Column(JSON, nullable=True)  # Keywords to match in job descriptions
    
    # Generated artifacts
    generated_cv_markdown = Column(Text, nullable=True)  # Markdown version of tailored CV
    generated_cv_path = Column(String, nullable=True)  # Path to PDF if generated
    
    # Settings
    is_active = Column(Boolean, default=True)  # Can be enabled/disabled
    auto_apply = Column(Boolean, default=False)  # Auto-apply for high-match jobs (>80)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    cv_data = relationship("CVData", back_populates="profiles")
    job_matches = relationship("JobMatch", back_populates="cv_profile", cascade="all, delete-orphan")

class JobMatch(Base):
    """
    AI-calculated match between a job posting and a CV profile
    This is the core of the automated application decision system
    """
    __tablename__ = "job_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    cv_profile_id = Column(Integer, ForeignKey("cv_profiles.id"), nullable=False)
    
    # AI analysis
    match_score = Column(Float, nullable=False)  # 0-100
    match_reasoning = Column(Text, nullable=True)  # AI explanation of why this score
    skill_match_details = Column(JSON, nullable=True)  # {matched: [], missing: [], bonus: []}
    experience_fit = Column(String, nullable=True)  # "Perfect", "Good", "Stretch", "Under-qualified"
    
    # Recommendation
    is_recommended = Column(Boolean, default=False)  # Is this the best profile for this job?
    recommendation_strength = Column(String, nullable=True)  # "Strong", "Moderate", "Weak"
    
    # Application workflow
    status = Column(String, default="pending_review")  # pending_review, user_approved, user_rejected, applied, failed
    user_decision_at = Column(DateTime(timezone=True), nullable=True)
    applied_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    job = relationship("Job", back_populates="job_matches")
    cv_profile = relationship("CVProfile", back_populates="job_matches")
    
class ApplicationLog(Base):
    __tablename__ = "application_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_auth.id"), nullable=False, index=True)
    job_id = Column(String)
    status = Column(String) # success, error, partial_success
    log = Column(Text) # Detailed log of the automation process
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
