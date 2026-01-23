# Multi-stage Dockerfile: build frontend, serve static, run backend

# 1. Build frontend
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 2. Backend + static serving
FROM python:3.12-slim AS backend
WORKDIR /app
COPY backend/ ./backend/
# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY --from=frontend-build /app/frontend/dist ./frontend/dist
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Instalar un servidor estático para frontend
RUN pip install --no-cache-dir fastapi uvicorn
RUN pip install --no-cache-dir aiofiles

# 3. Entrypoint: serve static + backend
COPY ./start.sh ./start.sh
RUN chmod +x ./start.sh
EXPOSE 8080
CMD ["./start.sh"]
