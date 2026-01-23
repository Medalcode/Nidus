from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from app.api.v1.router import api_router
from app.core.database import engine, Base
from app.core.config import settings
import app.models # Register models

# Create tables
Base.metadata.create_all(bind=engine)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ats")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
# We include them at root to match original paths: /upload-cv, /cvs, etc.
app.include_router(api_router)

# Servir archivos estáticos del frontend
# Assuming main.py is in backend/app/, and frontend is in backend/../frontend
# __file__ is backend/app/main.py
# basedir is backend/app
# frontend is backend/app/../../frontend
basedir = os.path.dirname(__file__)
frontend_dist = os.path.join(basedir, '../../frontend/dist')

# Ensure directory exists to avoid errors if frontend not built
if os.path.exists(frontend_dist):
    app.mount("/static", StaticFiles(directory=frontend_dist), name="static")

    @app.get("/")
    async def serve_root():
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return JSONResponse(content={"detail": "Frontend not built"}, status_code=404)

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Si la ruta no es de API ni archivo estático, servir index.html
        # Check against API routes?
        # A simple heuristic: if it doesn't start with recognized api paths (defined in router)
        if full_path.startswith("upload-cv") or full_path.startswith("cvs") or full_path.startswith("export-pdf"):
             # This should have been caught by the router if method matches? 
             # But this catch-all might shadow them if defined before? 
             # No, specific routes take precedence usually.
             return JSONResponse(content={"detail": "Not Found"}, status_code=404)
        
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return JSONResponse(content={"detail": "Not Found"}, status_code=404)
else:
    logger.warning("Frontend dist directory not found. Serving only API.")

