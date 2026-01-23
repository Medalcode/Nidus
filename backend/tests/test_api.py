import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import time

from app.main import app
from app.core.database import Base, get_db
from app.core.config import settings

# Setup in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def auth_header(setup_db):
    from app.core.security import get_password_hash, create_access_token
    from app.models.user import User
    db = TestingSessionLocal()
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password=get_password_hash("password123"),
        full_name="Test User",
        is_active=True,
        is_verified=True,
        role="recruiter"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    db.close()
    return {"Authorization": f"Bearer {token}"}

def test_get_me(auth_header):
    response = client.get("/auth/me", headers=auth_header)
    if response.status_code != 200:
        print("/auth/me response:", response.status_code, response.text)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"

def test_list_cvs_empty(auth_header):
    response = client.get("/cvs", headers=auth_header)
    if response.status_code != 200:
        print("/cvs response:", response.status_code, response.text)
    assert response.status_code == 200
    try:
        data = response.json()
    except Exception:
        print("/cvs non-JSON response:", response.text)
        raise
    assert data == []

def test_upload_cv_txt_async(auth_header):
    file_content = b"Candidate Name: Async Candidate\nSkills: Celery, Redis, Testing"
    files = {"file": ("async_cv.txt", file_content, "text/plain")}
    
    response = client.post("/upload-cv", files=files, headers=auth_header)
    if response.status_code != 200:
        print("/upload-cv response:", response.status_code, response.text)
    assert response.status_code == 200
    data = response.json()
    assert "task_id" in data
    task_id = data["task_id"]
    response = client.get(f"/tasks/{task_id}", headers=auth_header)
    if response.status_code != 200:
        print(f"/tasks/{{task_id}} response:", response.status_code, response.text)
    assert response.status_code == 200
    assert response.json()["task_id"] == task_id

