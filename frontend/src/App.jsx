import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaFilePdf, FaFileWord, FaFileAlt, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { saveAs } from "file-saver";
import i18n from "./i18n";

const LANGUAGES = { es: "Español", en: "English" };

function App() {
  const [cv, setCV] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [lang, setLang] = useState("es");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      const res = await fetch("/upload-cv", { method: "POST", body: formData });
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
    <div className="app">
      <header>
        <h1>ATS Visual</h1>
        <select value={lang} onChange={e => setLang(e.target.value)}>
          {Object.entries(LANGUAGES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </header>
      <section>
        <Dropzone onDrop={onDrop} />
        {loading && <div style={{color:'#0077ff',margin:'1rem 0'}}>Analizando... <span className="loader"></span></div>}
        {error && <div style={{color:'#d32f2f',margin:'1rem 0'}}><FaExclamationCircle /> {error}</div>}
        {success && <div style={{color:'#2e7d32',margin:'1rem 0'}}><FaCheckCircle /> {success}</div>}
        {analysis && <AnalysisPanel analysis={analysis} onExport={exportPDF} lang={lang} />}
      </section>
    </div>
  );
}

function Dropzone({ onDrop }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: [".pdf", ".docx", ".txt"] });
  return (
    <div {...getRootProps()} className={`dropzone${isDragActive ? " active" : ""}`}>
      <input {...getInputProps()} />
      <p>Arrastra tu CV aquí o haz click para subir (PDF, DOCX, TXT)</p>
    </div>
  );
}

function AnalysisPanel({ analysis, onExport, lang }) {
  return (
    <div className="analysis-panel">
      <h2>{i18n[lang].analysisTitle}</h2>
      <div className="card">
        <FaFilePdf /> <b>{analysis.filename}</b>
        <p>{i18n[lang].format}: {analysis.format}</p>
        <p>{i18n[lang].keywords}: {analysis.keywords.join(", ")}</p>
        <p>{i18n[lang].structure}: {analysis.structure}</p>
        <ul>
          {analysis.recommendations.map((rec, i) => (
            <li key={i}><FaCheckCircle /> {rec}</li>
          ))}
        </ul>
        <button onClick={onExport}>{i18n[lang].exportPDF}</button>
      </div>
    </div>
  );
}

export default App;
