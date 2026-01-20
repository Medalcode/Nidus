import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db

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

def test_list_cvs_empty(setup_db):
    response = client.get("/cvs")
    assert response.status_code == 200
    assert response.json() == []

def test_upload_cv_txt(setup_db):
    # Simulate a TXT file upload
    file_content = b"Candidate Name: John Doe\nSkills: Python, React, SQL"
    files = {"file": ("test_cv.txt", file_content, "text/plain")}
    
    response = client.post("/upload-cv", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test_cv.txt"
    assert "Python" in data["keywords"]
    assert "match_score" in data

def test_list_cvs_after_upload(setup_db):
    # Should have 1 CV from previous test (if sequential) 
    # dependent tests are bad practice, but for simple script valid enough
    # Actually pytest runs independent unless session scoped. 
    # Let's re-upload to be safe or rely on module scope of DB fixture?
    # Used module scope for setup_db, so data persists for this module.
    
    response = client.get("/cvs")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["filename"] == "test_cv.txt"
