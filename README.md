# Nidus ATS - AI-Powered Recruitment Tool 🚀

Nidus is a modern **Applicant Tracking System (ATS)** designed to streamline the recruitment process using Artificial Intelligence. It analyzes CVs, ranks candidates against job descriptions, and provides actionable insights.

![Status](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Backend-FastAPI-blue)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Tailwind-cyan)
![AI](https://img.shields.io/badge/AI-Llama%203%20%28Groq%29-purple)

## ✨ Key Features

- **📄 Smart CV Parsing**:
  - Automatically extracts candidate details (Name, Skills, Experience) using **Llama 3 AI** (via Groq).
  - Fallback to advanced Regex matching if AI is unavailable.
  - Supports PDF, DOCX, and TXT formats.

- **📊 Mathematical Ranking**:
  - Calculates a **Match Score** (%) between the CV and Job Description using **TF-IDF Vectorization** and **Cosine Similarity**.
  - Identifies **Missing Keywords** crucial for the specific vacancy.

- **🗂️ Candidate Dashboard**:
  - Centralized view of all processed applications.
  - Sort candidates by Match Score.
  - Download detailed PDF reports.
  - **Data Persistence**: All data is securely stored in a local SQLite database.

- **⚙️ Dynamic Configuration**:
  - Input your own API Keys directly from the UI settings.
  - Seamless toggle between AI and standard scanning modes.

## 🛠️ Tech Stack

### Backend

- **Framework**: FastAPI (Python 3.13)
- **Database**: SQLite + SQLAlchemy
- **AI/ML**: `scikit-learn` (Ranking), `groq` (LLM Integration)
- **Testing**: `pytest`

### Frontend

- **Framework**: React.js (Vite/Webpack)
- **Styling**: Tailwind CSS v4
- **Icons**: React Icons

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

### 2. Frontend Setup

```bash
cd frontend
npm install

# Run the development server
npm start
```

The application will open at `http://localhost:3000`.

## 🧪 Testing

We use **pytest** for backend integration testing.

```bash
cd backend
pytest tests/
```

## 📦 CI/CD

This repository includes a **GitHub Actions** workflow (`.github/workflows/ci.yml`) that automatically runs the test suite on every push and pull request to the `main` branch.

## 📝 License

This project is licensed under the MIT License.
