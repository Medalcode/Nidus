from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import requests
from datetime import datetime
import os
import uvicorn

app = FastAPI()

# Enable CORS for local troubleshooting if needed, though strictly not needed if serving from same origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/scrape")
async def scrape_jobs(term: str = "react"):
    try:
        url = f"https://remoteok.com/api?tag={term}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Filter (skip legal disclaimer)
        jobs = [job for job in data if "legal" not in job]
        
        formatted_jobs = []
        for job in jobs:
            formatted_jobs.append({
                "id": str(job.get("id")),
                "title": job.get("position"),
                "company": job.get("company"),
                "date": job.get("date").split("T")[0] if job.get("date") else datetime.now().strftime("%Y-%m-%d"),
                "link": job.get("url"),
                "tags": job.get("tags", []),
                "status": "wishlist"
            })
            
        return formatted_jobs
        
    except Exception as e:
        print(f"Error scraping: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e

# Mount static files (React build)
# We assume the build will be in 'dist' directory next to this file or parent
static_dir = os.path.join(os.path.dirname(__file__), "dist")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
