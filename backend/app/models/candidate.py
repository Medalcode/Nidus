from sqlalchemy import Column, Integer, String, Float, JSON, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String, index=True)
    format = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    # Analysis Data
    keywords = Column(JSON)
    structure = Column(String)
    recommendations = Column(JSON)
    
    # Match Data
    match_score = Column(Float, default=0.0)
    missing_keywords = Column(JSON, default=[])
    
    # AI Extracted Data
    ai_data = Column(JSON, nullable=True)
    
    # Relationship
    user = relationship("User", backref="candidates")
