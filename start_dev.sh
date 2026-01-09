#!/bin/bash

# Nidus Development Server Starter
# CV-Driven Automation System
# This script starts both the backend (FastAPI) and frontend (Vite) servers

set -e

echo "🚀 Starting Nidus CV Automation System"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists and has required keys
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo -e "${YELLOW}Creating .env from template...${NC}"
    cat > .env << 'EOF'
# JWT Configuration
JWT_SECRET_KEY=change-this-secret-key-in-production-use-openssl-rand-hex-32
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=43200

# Groq AI API Key (get yours at https://console.groq.com)
GROQ_API_KEY=your_groq_api_key_here

# Database (SQLite for development)
DATABASE_URL=sqlite:///./nidus.db
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env and add your GROQ_API_KEY${NC}"
    echo ""
fi

# Validate GROQ_API_KEY
if grep -q "your_groq_api_key_here" .env 2>/dev/null; then
    echo -e "${YELLOW}⚠️  WARNING: GROQ_API_KEY not configured${NC}"
    echo -e "${YELLOW}   CV extraction and profile generation will fail${NC}"
    echo -e "${YELLOW}   Get your free API key at: https://console.groq.com${NC}"
    echo ""
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${BLUE}📦 Virtual environment not found. Creating one...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${BLUE}📦 Activating virtual environment...${NC}"
source venv/bin/activate

# Install backend dependencies if needed
if [ ! -f "venv/.dependencies_installed" ]; then
    echo -e "${BLUE}📥 Installing backend dependencies...${NC}"
    pip install -r requirements.txt
    touch venv/.dependencies_installed
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
fi

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📥 Installing frontend dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Starting servers...${NC}"
echo ""

# Kill any existing processes on the ports
echo -e "${YELLOW}Checking for existing processes...${NC}"
pkill -f "uvicorn backend.main:app" 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Start backend in background
echo -e "${GREEN}▶️  Starting Backend (FastAPI) on port 8000...${NC}"
python -m uvicorn backend.main:app --reload --port 8000 > /tmp/nidus_backend.log 2>&1 &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    echo -e "${YELLOW}Check logs: tail -f /tmp/nidus_backend.log${NC}"
    exit 1
fi

# Start frontend in background
echo -e "${GREEN}▶️  Starting Frontend (Vite) on port 5173...${NC}"
npm run dev > /tmp/nidus_frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a bit for frontend to start
sleep 2

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
    echo -e "${YELLOW}Check logs: tail -f /tmp/nidus_frontend.log${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Nidus CV Automation System Running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📍 Backend API:${NC}  http://localhost:8000"
echo -e "${BLUE}📍 Frontend App:${NC} http://localhost:5173"
echo -e "${BLUE}📍 API Docs:${NC}     http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}📚 Quick Start Guide:${NC}"
echo "   1. Register: http://localhost:5173"
echo "   2. Upload your CV (PDF or TXT)"
echo "   3. AI will extract data and generate 3 profiles"
echo "   4. Review job matches in approval queue"
echo "   5. Approve jobs to auto-apply"
echo ""
echo -e "${YELLOW}🧪 Test the workflow:${NC}"
echo "   chmod +x scripts/test_cv_workflow.sh"
echo "   ./scripts/test_cv_workflow.sh"
echo ""
echo -e "${YELLOW}📖 Full documentation:${NC} README_CV_WORKFLOW.md"
echo ""
echo -e "${YELLOW}📋 Logs:${NC}"
echo "   Backend:  tail -f /tmp/nidus_backend.log"
echo "   Frontend: tail -f /tmp/nidus_frontend.log"
echo ""
echo -e "${RED}Press Ctrl+C to stop both servers${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Wait for both processes
wait
