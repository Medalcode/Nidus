from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

logger = logging.getLogger("ats.matching")

def calculate_match_score(resume_text: str, job_description: str) -> float:
    """
    Calculates the cosine similarity between the resume text and job description.
    Returns a score between 0 and 100.
    """
    if not resume_text or not job_description:
        return 0.0
        
    try:
        # Create vectors
        text_list = [resume_text, job_description]
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(text_list)
        
        # Calculate Cosine Similarity
        # tfidf_matrix[0] is resume, tfidf_matrix[1] is JD
        match_percentage = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0] * 100
        
        return round(match_percentage, 2)
    except Exception as e:
        logger.error(f"Error formulating match score: {e}")
        return 0.0

def get_missing_keywords(resume_text: str, job_description: str, top_n: int = 5) -> list:
    """
    Identifies keywords present in the JD but missing or weak in the resume.
    Simple approach: extract top TF-IDF words from JD and check presence in resume.
    """
    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([job_description])
        feature_names = vectorizer.get_feature_names_out()
        
        # Get scores for the JD
        dense = tfidf_matrix.todense()
        episode = dense[0].tolist()[0]
        
        # Create a list of (word, score)
        phrase_scores = [pair for pair in zip(range(0, len(episode)), episode) if pair[1] > 0]
        sorted_phrase_scores = sorted(phrase_scores, key=lambda t: t[1] * -1)
        
        missing = []
        resume_lower = resume_text.lower()
        
        for phrase, score in sorted_phrase_scores:
            word = feature_names[phrase]
            if word not in resume_lower and len(word) > 2: # Ignore short words
                missing.append(word)
                if len(missing) >= top_n:
                    break
                    
        return missing
    except Exception as e:
        logger.error(f"Error extracting missing keywords: {e}")
        return []
