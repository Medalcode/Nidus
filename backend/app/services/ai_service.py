import os
import json
import logging
from typing import Dict, Any
from groq import Groq

logger = logging.getLogger("ats.ai")

class AIService:
    def __init__(self):
        self.api_key = os.environ.get("GROQ_API_KEY")
        self.client = None
        if self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
        else:
            logger.warning("GROQ_API_KEY not found. AI features will be disabled.")

    def extract_cv_data(self, text: str, api_key: str = None) -> Dict[str, Any]:
        """
        Uses Llama 3 via Groq to extract structured data from CV text.
        """
        # Determine which key to use
        current_key = api_key or self.api_key
        
        if not current_key:
            return None
            
        # If a specific key is passed, we shouldn't use the cached self.client (which might use env var)
        # unless it matches. For simplicity, let's create a client if key provided.
        client = self.client
        if api_key:
            try:
                client = Groq(api_key=api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Groq client with provided key: {e}")
                return None
        
        if not client:
             return None

        prompt = f"""
        You are an expert ATS parser. Extract the following information from the Resume text below and return it strictly as a valid JSON object.
        
        Fields to extract:
        - name: Candidate's full name (string)
        - email: Email address (string)
        - skills: List of technical skills (list of strings)
        - experience_years: Estimated total years of experience (number, 0 if unknown)
        - last_role: Most recent job title (string, or null)
        - summary: A brief professional summary generated from the text (string)
        
        Rules:
        - Do not include any markdown formatting like ```json ... ```. Just return the raw JSON string.
        - If a field is not found, use null or empty list/string as appropriate.
        
        Resume Text:
        {text[:15000]}  # Limit text to avoid token limits if extremely long
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama3-70b-8192",
                temperature=0.1, # Low temperature for consistent formatting
                response_format={"type": "json_object"}, # Enforce JSON mode
            )
            
            response_content = chat_completion.choices[0].message.content
            return json.loads(response_content)
            
        except Exception as e:
            logger.error(f"Error calling Groq API: {e}")
            return None

ai_service = AIService()
