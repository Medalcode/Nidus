
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os
from typing import List, Dict
import io
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ats")


app = FastAPI(title="ATS Visual API")

# Servir archivos estáticos del frontend
frontend_dist = os.path.join(os.path.dirname(__file__), '../frontend/dist')
app.mount("/static", StaticFiles(directory=frontend_dist), name="static")

# Fallback para SPA: servir index.html en la raíz y rutas no-API
@app.get("/")
async def serve_root():
    index_path = os.path.join(frontend_dist, "index.html")
    return FileResponse(index_path)

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Si la ruta no es de API ni archivo estático, servir index.html
    if full_path.startswith("api") or full_path.startswith("upload-cv") or full_path.startswith("cvs") or full_path.startswith("export-pdf"):
        return JSONResponse(content={"detail": "Not Found"}, status_code=404)
    index_path = os.path.join(frontend_dist, "index.html")
    return FileResponse(index_path)

# In-memory storage for CVs and analysis results
cvs: List[Dict] = []

@app.post("/upload-cv")
async def upload_cv(file: UploadFile = File(...), request: Request = None):
    import pdfplumber
    from docx import Document
    MAX_SIZE = 2 * 1024 * 1024  # 2MB
    ALLOWED_EXTS = {"pdf", "docx", "txt"}

    filename = file.filename
    ext = filename.lower().split('.')[-1]
    client_ip = request.client.host if request else "?"
    logger.info(f"Subida de archivo: {filename} ({ext}) desde {client_ip}")
    if ext not in ALLOWED_EXTS:
        logger.warning(f"Extensión no permitida: {filename}")
        return JSONResponse(content={"error": "Extensión no permitida."}, status_code=400)
    content = file.file.read()
    if len(content) > MAX_SIZE:
        logger.warning(f"Archivo demasiado grande: {filename}")
        return JSONResponse(content={"error": "Archivo demasiado grande (máx 2MB)."}, status_code=400)
    text = ""
    try:
        if ext == "pdf":
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                text = "\n".join(page.extract_text() or '' for page in pdf.pages)
        elif ext == "docx":
            doc = Document(io.BytesIO(content))
            text = "\n".join([p.text for p in doc.paragraphs])
        elif ext == "txt":
            text = content.decode(errors="ignore")
        else:
            text = "[Formato no soportado]"
    except Exception as e:
        logger.error(f"Error al extraer texto de {filename}: {e}")
        text = f"[Error al extraer texto: {e}]"

    # Análisis simple: buscar keywords y secciones
    keywords = []
    for kw in ["python", "react", "fastapi", "sql", "docker", "aws", "javascript", "html", "css"]:
        if kw in text.lower():
            keywords.append(kw.capitalize())
    structure = []
    for section in ["experiencia", "experience", "educación", "education", "skills", "habilidades", "summary", "resumen"]:
        if section in text.lower():
            structure.append(section.capitalize())
    analysis = {
        "filename": filename,
        "keywords": keywords or ["(Ninguna keyword detectada)"],
        "format": ext.upper(),
        "structure": f"Secciones detectadas: {', '.join(structure) if structure else '(Ninguna)'}",
        "recommendations": [
            "Agrega más keywords relevantes." if len(keywords) < 3 else "Buen uso de keywords.",
            "Incluye sección de experiencia." if not any(s in text.lower() for s in ["experiencia", "experience"]) else "",
            "Incluye un resumen profesional." if not any(s in text.lower() for s in ["summary", "resumen"]) else ""
        ]
    }
    # Limpiar recomendaciones vacías
    analysis["recommendations"] = [r for r in analysis["recommendations"] if r]
    cvs.append({"filename": filename, "analysis": analysis})
    return JSONResponse(content=analysis)

@app.get("/cvs")
def list_cvs():
    return cvs

@app.get("/export-pdf/{cv_id}")
def export_pdf(cv_id: int):
    # Placeholder: generate PDF from analysis
    from reportlab.pdfgen import canvas
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer)
    analysis = cvs[cv_id]["analysis"]
    c.drawString(100, 800, f"Análisis de CV: {analysis['filename']}")
    c.drawString(100, 780, f"Formato: {analysis['format']}")
    c.drawString(100, 760, f"Keywords: {', '.join(analysis['keywords'])}")
    c.drawString(100, 740, f"Estructura: {analysis['structure']}")
    c.drawString(100, 720, "Recomendaciones:")
    y = 700
    for rec in analysis['recommendations']:
        c.drawString(120, y, f"- {rec}")
        y -= 20
    c.save()
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=analysis_{cv_id}.pdf"})
