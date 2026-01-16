#!/bin/bash
# Lanzar backend FastAPI y servir frontend estático
exec uvicorn backend.main:app --host 0.0.0.0 --port 8080
