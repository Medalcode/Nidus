import requests
import json
import sys
import os
from datetime import datetime

def search_jobs(term):
    print(f"🔍 Buscando empleos remotos para: {term}...")
    
    # RemoteOK API
    url = f"https://remoteok.com/api?tag={term}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        # Filter out the legal disclaimer (first item usually)
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
                "status": "wishlist" # Default status for our Kanban
            })
            
        return formatted_jobs
        
    except Exception as e:
        print(f"❌ Error al buscar empleos: {e}")
        return []

def save_jobs(jobs):
    # Save to public folder so React can fetch it
    output_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'scraped_jobs.json')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(jobs, f, indent=2, ensure_ascii=False)
    
    print(f"✅ {len(jobs)} ofertas guardadas en {output_path}")

if __name__ == "__main__":
    term = sys.argv[1] if len(sys.argv) > 1 else "react"
    jobs = search_jobs(term)
    if jobs:
        save_jobs(jobs)
    else:
        print("No se encontraron ofertas.")
