from fastapi import APIRouter
from app.api.v1.endpoints import upload, cvs

api_router = APIRouter()

# Include routers without prefix to maintain backward compatibility with Frontend
api_router.include_router(upload.router, tags=["upload"])
api_router.include_router(cvs.router, tags=["cvs"])
