import React, { useState } from "react";
import { saveAs } from "file-saver";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import i18n from "./i18n";

import Layout from "./components/Layout";
import Dropzone from "./components/Dropzone";
import AnalysisPanel from "./components/AnalysisPanel";
import SettingsModal from "./components/SettingsModal";
import Dashboard from "./components/Dashboard";

const LANGUAGES = { es: "Español", en: "English" };

function App() {
  const [cv, setCV] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [lang, setLang] = useState("es");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  // Navigation State
  const [view, setView] = useState('home'); // 'home' | 'dashboard'
  
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
      
      const res = await fetch("/upload-cv", { 
        method: "POST", 
        body: formData,
        headers: headers
      });
      if (!res.ok) throw new Error("Error al analizar el CV");
      const data = await res.json();
      setAnalysis(data);
      setSuccess("¡Análisis completado!");
    } catch (e) {
      setError("No se pudo analizar el CV. Intenta de nuevo.");
    } finally {
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

  return (
    <Layout 
      lang={lang} 
      setLang={setLang} 
      languages={LANGUAGES}
      onOpenSettings={() => setShowSettings(true)}
      currentView={view}
      onNavigate={setView}
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

export default App;
