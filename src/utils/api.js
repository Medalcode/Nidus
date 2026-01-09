/**
 * API Client for Nidus Backend
 * Handles all HTTP requests with automatic JWT token injection
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Storage keys
const TOKEN_KEY = 'nidus_auth_token';
const USER_KEY = 'nidus_user';

/**
 * Get stored auth token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Save auth token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Clear auth data
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Get stored user data
 */
export const getUser = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Save user data
 */
export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Generic fetch wrapper with auth handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      clearAuth();
      window.dispatchEvent(new Event('auth-expired'));
      throw new Error('Session expired. Please login again.');
    }
    
    // Handle other errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ==================== AUTH API ====================

export const authAPI = {
  /**
   * Register new user
   */
  register: async (email, password, fullName) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        full_name: fullName
      })
    });
    
    // Save token and user
    setToken(data.access_token);
    setUser(data.user);
    
    return data;
  },
  
  /**
   * Login existing user
   */
  login: async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    // Save token and user
    setToken(data.access_token);
    setUser(data.user);
    
    return data;
  },
  
  /**
   * Get current user info
   */
  getMe: async () => {
    const data = await apiFetch('/auth/me');
    setUser(data);
    return data;
  },
  
  /**
   * Logout (client-side only)
   */
  logout: () => {
    clearAuth();
    window.dispatchEvent(new Event('auth-logout'));
  }
};

// ==================== JOBS API ====================

export const jobsAPI = {
  /**
   * Get all jobs for current user
   */
  getAll: async () => {
    return await apiFetch('/jobs');
  },
  
  /**
   * Create new job
   */
  create: async (jobData) => {
    return await apiFetch('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  },
  
  /**
   * Update existing job
   */
  update: async (jobId, updates) => {
    return await apiFetch(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  
  /**
   * Delete job
   */
  delete: async (jobId) => {
    return await apiFetch(`/jobs/${jobId}`, {
      method: 'DELETE'
    });
  }
};

// ==================== PROFILE API ====================

export const profileAPI = {
  /**
   * Get user profile
   */
  get: async () => {
    return await apiFetch('/profile');
  },
  
  /**
   * Update user profile
   */
  update: async (profileData) => {
    return await apiFetch('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }
};

// ==================== AI API ====================

export const aiAPI = {
  /**
   * Analyze CV with AI
   */
  analyzeCV: async (resumeText, jobDescription = null) => {
    const response = await apiFetch('/ai/analyze-cv', {
      method: 'POST',
      body: JSON.stringify({
        resume_text: resumeText,
        job_description: jobDescription
      })
    });
    
    // Parse JSON string response
    return typeof response === 'string' ? JSON.parse(response) : response;
  },
  
  /**
   * Chat with AI (for interviews, cover letters, etc.)
   */
  chat: async (messages, jobContext = null) => {
    return await apiFetch('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages,
        job_context: jobContext
      })
    });
  }
};

// ==================== AGENT API ====================

export const agentAPI = {
  /**
   * Run automation bot on job URL
   */
  applyToJob: async (jobUrl) => {
    return await apiFetch('/agent/apply', {
      method: 'POST',
      body: JSON.stringify({ job_url: jobUrl })
    });
  }
};

// ==================== SCRAPER API ====================

export const scraperAPI = {
  /**
   * Scrape jobs from RemoteOK
   */
  scrape: async (term = 'react') => {
    // Scraper doesn't require auth
    return await apiFetch(`/scrape?term=${encodeURIComponent(term)}`);
  }
};

// ==================== HEALTH CHECK ====================

export const healthCheck = async () => {
  return await apiFetch('/health');
};

// ==================== EXPORT DEFAULT ====================

export default {
  auth: authAPI,
  jobs: jobsAPI,
  profile: profileAPI,
  ai: aiAPI,
  agent: agentAPI,
  scraper: scraperAPI,
  healthCheck,
  // Utilities
  isAuthenticated,
  getToken,
  getUser,
  clearAuth
};
