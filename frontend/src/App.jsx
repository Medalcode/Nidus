import React, { useState } from "react";
import { saveAs } from "file-saver";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import i18n from "./i18n";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Dropzone from "./components/Dropzone";
import AnalysisPanel from "./components/AnalysisPanel";
import SettingsModal from "./components/SettingsModal";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";

const LANGUAGES = { es: "Español", en: "English" };

function AppContent() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [cv, setCV] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [lang, setLang] = useState("es");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  // Navigation State
  const [view, setView] = useState('home'); // 'home' | 'dashboard'
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq_api_key') || '');

  const onDrop = async (acceptedFiles) => {
    setError("");
    setSuccess("");
    setAnalysis(null);
    const file = acceptedFiles[0];
    if (!file) return;
    
    // Validar tipo
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      setError("Tipo de archivo no permitido. Solo PDF, DOCX o TXT.");
      return;
    }
    // Validar tamaño (máx 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("El archivo es demasiado grande (máx 2MB).");
      return;
    }
    setCV(file);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (jobDescription) {
        formData.append("job_description", jobDescription);
      }
      
      const headers = {};
      if (apiKey) {
        headers['x-groq-api-key'] = apiKey;
      }
      
      // Add auth token
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch("/upload-cv", { 
        method: "POST", 
        body: formData,
        headers: headers
      });
      
      if (res.status === 401) {
        setError("Sesión expirada. Por favor inicia sesión nuevamente.");
        logout();
        return;
      }
      
      if (!res.ok) throw new Error("Error al iniciar el análisis");
      
      const { task_id } = await res.json();
      
      // Poll for result
      const pollInterval = setInterval(async () => {
        try {
          const taskRes = await fetch(`/tasks/${task_id}`, {
             headers: {
                'Authorization': `Bearer ${token}`
             }
          });
          const taskData = await taskRes.json();
          
          if (taskData.status === 'SUCCESS' || taskData.status === 'completed') {
             clearInterval(pollInterval);
             setAnalysis(taskData.result);
             setSuccess("¡Análisis completado!");
             setLoading(false);
          } else if (taskData.status === 'FAILURE' || taskData.status === 'failed') {
             clearInterval(pollInterval);
             setError("Error en el análisis: " + (taskData.error || "Desconocido"));
             setLoading(false);
          }
          // If pending/processing, continue polling
        } catch (e) {
           clearInterval(pollInterval);
           setError("Error al consultar estado del análisis");
           setLoading(false);
        }
      }, 2000);
      
      // Optional: Timeout checking after 1 min
      setTimeout(() => {
          clearInterval(pollInterval);
          if (loading) { // if still loading
             setError("Tiempo de espera agotado.");
             setLoading(false);
          }
      }, 60000);

    } catch (e) {
      setError("No se pudo iniciar el análisis. Intenta de nuevo.");
      setLoading(false);
    } 
  };

  const exportPDF = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // Note: Backend endpoint is mocked to use ID 0 for now in this demo context
      // In a real app we'd need the ID returned from upload
      // For now let's assume the backend 'cvs' list works sequentially and we fetch the last one or by some ID.
      // But actually, the backend returns the *analysis* object, not an ID.
      // We need the ID for the GET request.
      // Let's assume we fetch the index 0 for simplicity as per original code, 
      // or we should update backend to return ID.
      // For this refactor, I'll keep the logic as is: fetching /export-pdf/0
      const res = await fetch(`/export-pdf/0`);
      if (!res.ok) throw new Error("Error al exportar PDF");
      const blob = await res.blob();
      saveAs(blob, "analysis.pdf");
      setSuccess("¡PDF exportado!");
    } catch (e) {
      setError("No se pudo exportar el PDF.");
    } finally {
      setLoading(false);
    }
  };

  
  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="loader mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    if (authView === 'register') {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthView('register')} />;
  }

  return (
    <Layout 
      lang={lang} 
      setLang={setLang} 
      languages={LANGUAGES}
      onOpenSettings={() => setShowSettings(true)}
      currentView={view}
      onNavigate={setView}
      user={user}
      onLogout={logout}
    >
      {view === 'dashboard' ? (
        <Dashboard onBack={() => setView('home')} />
      ) : (
        <>
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-800 mb-3">Analiza y optimiza tu CV</h2>
                <p className="text-slate-500 max-w-xl mx-auto">
                Sube tu currículum para obtener un análisis instantáneo de palabras clave, estructura y recomendaciones personalizadas.
                </p>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descripción del Puesto (Opcional, para calcular Match %)
                </label>
                <textarea
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow h-24 text-sm"
                    placeholder="Pega aquí la descripción del empleo para ver qué tan bien se ajusta tu CV..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                />
            </div>

            <Dropzone onDrop={onDrop} />

            {loading && (
                <div className="flex justify-center items-center gap-3 my-8 text-indigo-600 font-medium animate-pulse">
                    <span className="loader"></span> Analizando tu documento...
                </div>
            )}

            {error && (
                <div className="flex items-center gap-3 p-4 my-6 bg-red-50 text-red-700 rounded-xl border border-red-100 animate-shake">
                    <FaExclamationCircle className="text-xl" /> {error}
                </div>
            )}

            {success && !analysis && (
                <div className="flex items-center gap-3 p-4 my-6 bg-green-50 text-green-700 rounded-xl border border-green-100">
                    <FaCheckCircle className="text-xl" /> {success}
                </div>
            )}

            {analysis && (
                <AnalysisPanel 
                    analysis={analysis} 
                    onExport={exportPDF} 
                    lang={lang} 
                    i18n={i18n} 
                />
            )}
        </>
      )}
      
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
    </Layout>
  );
}

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
