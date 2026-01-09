import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app
from backend.database import Base, get_db
from backend.models import User, UserProfile

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)

@pytest.fixture(scope="function", autouse=True)
def setup_database():
    """Create tables before each test and drop after"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# ==================== AUTH TESTS ====================

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register_user():
    """Test user registration"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["full_name"] == "Test User"

def test_register_duplicate_email():
    """Test registration with duplicate email"""
    # Register first user
    client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "User One"
        }
    )
    
    # Try to register again with same email
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "different123",
            "full_name": "User Two"
        }
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()

def test_login_success():
    """Test successful login"""
    # Register user
    client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User"
        }
    )
    
    # Login
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpass123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"

def test_login_wrong_password():
    """Test login with wrong password"""
    # Register user
    client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "correctpass",
            "full_name": "Test User"
        }
    )
    
    # Try to login with wrong password
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpass"
        }
    )
    assert response.status_code == 401

def test_get_me_authenticated():
    """Test getting current user info"""
    # Register and get token
    reg_response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpass",
            "full_name": "Test User"
        }
    )
    token = reg_response.json()["access_token"]
    
    # Get user info
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"

def test_get_me_no_token():
    """Test accessing protected endpoint without token"""
    response = client.get("/api/auth/me")
    assert response.status_code == 403  # Forbidden (no credentials)

# ==================== JOBS TESTS ====================

def test_create_job():
    """Test creating a job"""
    # Register and get token
    reg_response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "pass", "full_name": "User"}
    )
    token = reg_response.json()["access_token"]
    
    # Create job
    response = client.post(
        "/api/jobs",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Software Engineer",
            "company": "TechCorp",
            "link": "https://example.com/job",
            "status": "wishlist"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Software Engineer"
    assert data["company"] == "TechCorp"
    assert "id" in data

def test_get_jobs():
    """Test getting all jobs for user"""
    # Register and get token
    reg_response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "pass", "full_name": "User"}
    )
    token = reg_response.json()["access_token"]
    
    # Create two jobs
    client.post(
        "/api/jobs",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Job 1", "company": "Company A"}
    )
    client.post(
        "/api/jobs",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Job 2", "company": "Company B"}
    )
    
    # Get all jobs
    response = client.get(
        "/api/jobs",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) == 2
    assert jobs[0]["title"] in ["Job 1", "Job 2"]

def test_update_job():
    """Test updating a job"""
    # Register and get token
    reg_response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "pass", "full_name": "User"}
    )
    token = reg_response.json()["access_token"]
    
    # Create job
    create_response = client.post(
        "/api/jobs",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Job 1", "company": "Company A", "status": "wishlist"}
    )
    job_id = create_response.json()["id"]
    
    # Update job
    response = client.put(
        f"/api/jobs/{job_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "applied"}
    )
    assert response.status_code == 200
    
    # Verify update
    get_response = client.get(
        "/api/jobs",
        headers={"Authorization": f"Bearer {token}"}
    )
    jobs = get_response.json()
    assert jobs[0]["status"] == "applied"

def test_delete_job():
    """Test deleting a job"""
    # Register and get token
    reg_response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "pass", "full_name": "User"}
    )
    token = reg_response.json()["access_token"]
    
    # Create job
    create_response = client.post(
        "/api/jobs",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "Job 1", "company": "Company A"}
    )
    job_id = create_response.json()["id"]
    
    # Delete job
    response = client.delete(
        f"/api/jobs/{job_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    
    # Verify deletion
    get_response = client.get(
        "/api/jobs",
        headers={"Authorization": f"Bearer {token}"}
    )
    jobs = get_response.json()
    assert len(jobs) == 0

# ==================== PROFILE TESTS ====================

def test_get_profile():
    """Test getting user profile"""
    # Register and get token
    reg_response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "pass", "full_name": "Test User"}
    )
    token = reg_response.json()["access_token"]
    
    # Get profile
    response = client.get(
        "/api/profile",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Test User"

def test_update_profile():
    """Test updating user profile"""
    # Register and get token
    reg_response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "pass", "full_name": "Old Name"}
    )
    token = reg_response.json()["access_token"]
    
    # Update profile
    response = client.put(
        "/api/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "full_name": "New Name",
            "bio": "Software engineer with 5 years experience",
            "raw_cv_text": "My CV content here"
        }
    )
    assert response.status_code == 200
    
    # Verify update
    get_response = client.get(
        "/api/profile",
        headers={"Authorization": f"Bearer {token}"}
    )
    data = get_response.json()
    assert data["full_name"] == "New Name"
    assert data["bio"] == "Software engineer with 5 years experience"
    assert data["raw_cv_text"] == "My CV content here"

# ==================== SCRAPER TESTS ====================

def test_scrape_endpoint_no_auth():
    """Test scraper endpoint without authentication (should work)"""
    # Scraper should be publicly accessible
    response = client.get("/api/scrape?term=python")
    # May fail if RemoteOK is down, but endpoint should respond
    assert response.status_code in [200, 500]  # 500 if RemoteOK fails

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
