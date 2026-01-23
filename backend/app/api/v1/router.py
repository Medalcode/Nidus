from fastapi import APIRouter
from app.api.v1.endpoints import upload, cvs, auth, tasks

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(upload.router, tags=["Upload"])
api_router.include_router(cvs.router, tags=["CVs"])
api_router.include_router(tasks.router, tags=["Tasks"])
