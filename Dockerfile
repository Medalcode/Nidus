# Build stage for React
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage for Python/FastAPI
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend

# Copy React build from previous stage
COPY --from=build /app/dist ./backend/dist

# Expose port
ENV PORT=8080
EXPOSE 8080

# Run FastAPI
CMD ["python", "backend/main.py"]
