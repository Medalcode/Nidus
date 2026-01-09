#!/bin/bash
# Test CV Automation Workflow
# Este script prueba el flujo completo desde upload hasta matching

set -e

BASE_URL="http://localhost:8000"
EMAIL="test_$(date +%s)@example.com"
PASSWORD="testpass123"
CV_FILE="test_cv_sample.txt"

echo "🚀 Testing Nidus CV Automation Workflow"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Check if server is running
echo -e "${BLUE}1. Checking if backend is running...${NC}"
if curl -s "$BASE_URL/docs" > /dev/null; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running. Start it with: ./start.sh${NC}"
    exit 1
fi
echo ""

# 2. Create sample CV if it doesn't exist
if [ ! -f "$CV_FILE" ]; then
    echo -e "${BLUE}2. Creating sample CV...${NC}"
    cat > $CV_FILE << 'EOF'
John Doe
Software Engineer
Email: john.doe@example.com
Phone: +1-555-0123
LinkedIn: linkedin.com/in/johndoe
GitHub: github.com/johndoe
Location: San Francisco, CA

SUMMARY
Passionate fullstack developer with 5+ years of experience building scalable web applications.
Expertise in React, TypeScript, Python, and cloud technologies.

SKILLS
Frontend: React, TypeScript, Redux, Next.js, Tailwind CSS, Jest, Cypress
Backend: Python, FastAPI, Node.js, Express, Django, PostgreSQL, MongoDB
DevOps: Docker, Kubernetes, AWS, CI/CD, GitHub Actions
Tools: Git, VS Code, Figma, Postman

EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2021 - Present
- Led development of microservices architecture serving 1M+ users
- Reduced API latency by 40% through optimization and caching strategies
- Mentored team of 5 junior developers
- Technologies: React, TypeScript, Python, FastAPI, PostgreSQL, Docker, AWS

Fullstack Developer | StartupXYZ | 2019 - 2021
- Built customer-facing dashboard with React and Node.js
- Implemented real-time features using WebSockets
- Improved test coverage from 30% to 85%
- Technologies: React, Node.js, MongoDB, Redis, Jest

EDUCATION

Bachelor of Science in Computer Science
Stanford University | 2019
GPA: 3.8/4.0

CERTIFICATIONS

AWS Certified Developer Associate | Amazon | 2022
Professional Scrum Master I | Scrum.org | 2021

PROJECTS

Job Automation Platform
- Built an AI-powered job application automation system
- Technologies: React, FastAPI, Playwright, Groq AI
- GitHub: github.com/johndoe/job-automation

E-commerce Platform
- Developed full-stack e-commerce site with payment integration
- Technologies: Next.js, Stripe, PostgreSQL, Vercel
EOF
    echo -e "${GREEN}✓ Sample CV created: $CV_FILE${NC}"
else
    echo -e "${BLUE}2. Using existing CV: $CV_FILE${NC}"
fi
echo ""

# 3. Register user
echo -e "${BLUE}3. Registering user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"full_name\": \"Test User\"}")

if echo "$REGISTER_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✓ User registered: $EMAIL${NC}"
else
    echo -e "${YELLOW}⚠ User might already exist or registration failed${NC}"
fi
echo ""

# 4. Login and get token
echo -e "${BLUE}4. Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Login failed. Response: $LOGIN_RESPONSE${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Logged in successfully${NC}"
echo ""

# 5. Upload CV
echo -e "${BLUE}5. Uploading CV...${NC}"
UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/cv/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$CV_FILE")

if echo "$UPLOAD_RESPONSE" | grep -q "CV uploaded successfully"; then
    echo -e "${GREEN}✓ CV uploaded${NC}"
    echo "$UPLOAD_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UPLOAD_RESPONSE"
else
    echo -e "${RED}✗ CV upload failed: $UPLOAD_RESPONSE${NC}"
    exit 1
fi
echo ""

# 6. Extract CV data with AI
echo -e "${BLUE}6. Extracting CV data with AI (this may take 10-15 seconds)...${NC}"
EXTRACT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/cv/extract" \
  -H "Authorization: Bearer $TOKEN")

if echo "$EXTRACT_RESPONSE" | grep -q "CV data extracted successfully"; then
    echo -e "${GREEN}✓ CV data extracted${NC}"
    echo "$EXTRACT_RESPONSE" | python3 -m json.tool 2>/dev/null | head -30
    echo "... (truncated)"
else
    echo -e "${RED}✗ CV extraction failed: $EXTRACT_RESPONSE${NC}"
    echo -e "${YELLOW}Note: Make sure GROQ_API_KEY is configured in .env${NC}"
    exit 1
fi
echo ""

# 7. Generate profiles
echo -e "${BLUE}7. Generating 3 CV profiles (this may take 20-30 seconds)...${NC}"
PROFILES_RESPONSE=$(curl -s -X POST "$BASE_URL/api/cv/generate-profiles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"profile_types": ["frontend", "backend", "fullstack"]}')

if echo "$PROFILES_RESPONSE" | grep -q "Generated"; then
    echo -e "${GREEN}✓ Profiles generated${NC}"
    echo "$PROFILES_RESPONSE" | python3 -m json.tool 2>/dev/null
else
    echo -e "${RED}✗ Profile generation failed: $PROFILES_RESPONSE${NC}"
    exit 1
fi
echo ""

# 8. Get profiles
echo -e "${BLUE}8. Retrieving generated profiles...${NC}"
GET_PROFILES=$(curl -s -X GET "$BASE_URL/api/cv/profiles" \
  -H "Authorization: Bearer $TOKEN")

echo -e "${GREEN}✓ Profiles retrieved${NC}"
echo "$GET_PROFILES" | python3 -m json.tool 2>/dev/null
echo ""

# 9. Scrape some jobs (if available)
echo -e "${BLUE}9. Scraping sample jobs...${NC}"
SCRAPE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/scraper/scrape" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source": "remoteok", "keyword": "react", "limit": 3}')

if echo "$SCRAPE_RESPONSE" | grep -q "scraped"; then
    echo -e "${GREEN}✓ Jobs scraped${NC}"
    echo "$SCRAPE_RESPONSE" | python3 -m json.tool 2>/dev/null
else
    echo -e "${YELLOW}⚠ Scraping might have failed: $SCRAPE_RESPONSE${NC}"
fi
echo ""

# 10. Get first job ID
echo -e "${BLUE}10. Getting scraped jobs...${NC}"
JOBS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/jobs/?limit=1" \
  -H "Authorization: Bearer $TOKEN")

JOB_ID=$(echo "$JOBS_RESPONSE" | python3 -c "import sys, json; jobs=json.load(sys.stdin); print(jobs[0]['id'] if jobs else '')" 2>/dev/null)

if [ -n "$JOB_ID" ]; then
    echo -e "${GREEN}✓ Found job: $JOB_ID${NC}"
    
    # 11. Analyze job match
    echo ""
    echo -e "${BLUE}11. Analyzing AI match for job (this may take 10-15 seconds)...${NC}"
    MATCH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/matches/analyze-job/$JOB_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$MATCH_RESPONSE" | grep -q "Analyzed"; then
        echo -e "${GREEN}✓ Match analysis complete${NC}"
        echo "$MATCH_RESPONSE" | python3 -m json.tool 2>/dev/null
    else
        echo -e "${RED}✗ Match analysis failed: $MATCH_RESPONSE${NC}"
    fi
    echo ""
    
    # 12. View approval queue
    echo -e "${BLUE}12. Viewing approval queue...${NC}"
    QUEUE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/matches/queue?min_score=60" \
      -H "Authorization: Bearer $TOKEN")
    
    echo -e "${GREEN}✓ Approval queue:${NC}"
    echo "$QUEUE_RESPONSE" | python3 -m json.tool 2>/dev/null
    echo ""
    
    # 13. Get match ID
    MATCH_ID=$(echo "$QUEUE_RESPONSE" | python3 -c "import sys, json; matches=json.load(sys.stdin); print(matches[0]['id'] if matches else '')" 2>/dev/null)
    
    if [ -n "$MATCH_ID" ]; then
        echo -e "${BLUE}13. Approving match #$MATCH_ID...${NC}"
        APPROVE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/matches/$MATCH_ID/decide" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d '{"decision": "approve"}')
        
        if echo "$APPROVE_RESPONSE" | grep -q "Approved"; then
            echo -e "${GREEN}✓ Match approved${NC}"
            echo "$APPROVE_RESPONSE" | python3 -m json.tool 2>/dev/null
        else
            echo -e "${RED}✗ Approval failed: $APPROVE_RESPONSE${NC}"
        fi
        echo ""
    fi
    
else
    echo -e "${YELLOW}⚠ No jobs found to analyze. Run scraper first.${NC}"
fi

# 14. Get stats
echo -e "${BLUE}14. Getting statistics...${NC}"
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/matches/stats" \
  -H "Authorization: Bearer $TOKEN")

echo -e "${GREEN}✓ Statistics:${NC}"
echo "$STATS_RESPONSE" | python3 -m json.tool 2>/dev/null
echo ""

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ CV Workflow Test Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "- Check the UI at http://localhost:5173"
echo "- View API docs at http://localhost:8000/docs"
echo "- Review matches in the approval queue"
echo "- Run bot to apply: curl -X POST $BASE_URL/api/agent/apply/$JOB_ID -H \"Authorization: Bearer $TOKEN\""
echo ""
echo -e "${BLUE}Test user credentials:${NC}"
echo "Email: $EMAIL"
echo "Password: $PASSWORD"
echo ""
