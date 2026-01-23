#!/bin/bash
# Lanzar backend FastAPI y servir frontend estático
exec uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8080}
