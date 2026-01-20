from pydantic import BaseModel
from typing import List, Optional

class CVAnalysisResponse(BaseModel):
    filename: str
    keywords: List[str]
    format: str
    structure: str
    recommendations: List[str]
    match_score: float = 0.0
    missing_keywords: List[str] = []
    ai_extracted: Optional[dict] = None

class CVItem(BaseModel):
    filename: str
    analysis: CVAnalysisResponse
