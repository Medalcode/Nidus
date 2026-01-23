from typing import List
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.candidate import Candidate

class CandidateRepository(BaseRepository[Candidate]):
    def get_by_user(self, db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Candidate]:
        return db.query(Candidate).filter(Candidate.user_id == user_id).order_by(Candidate.upload_date.desc()).offset(skip).limit(limit).all()

    def get_by_id_and_user(self, db: Session, id: int, user_id: int) -> Candidate:
        return db.query(Candidate).filter(Candidate.id == id, Candidate.user_id == user_id).first()

candidate_repo = CandidateRepository(Candidate)
