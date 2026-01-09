import { useState } from 'react';
import { FileText, ArrowRight, CheckCircle, AlertTriangle, Sparkles, Loader2, Copy, UploadCloud, FileType } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import * as pdfjsLib from 'pdfjs-dist';
import api from '../utils/api';
import './CVOptimizer.css';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function CVOptimizer() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Por favor sube un archivo PDF válido.');
      return;
    }

    setFileName(file.name);
    setIsParsingPdf(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      setResumeText(fullText);
    } catch (err) {
      console.error('Error parsing PDF:', err);
      setError('No se pudo leer el PDF. Intenta copiar y pegar el texto.');
    } finally {
      setIsParsingPdf(false);
    }
  };

  const analyzeCV = async () => {
    if (!resumeText.trim()) {
      setError('Por favor, pega el contenido de tu CV.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setResult(null);

    try {
<<<<<<< Updated upstream
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'system', content: "Eres una API que solo responde en JSON." }, { role: 'user', content: prompt }],
          model: 'llama3-70b-8192',
          temperature: 0.2,
          response_format: { type: "json_object" }
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      setResult(content);
    } catch (err) {
      console.error(err);
      if (err.name === 'TimeoutError') {
        setError('La solicitud tardó demasiado. Intenta con un CV más corto.');
      } else if (err.message.includes('401')) {
        setError('API Key inválida. Verifica tu configuración.');
      } else if (err.message.includes('429')) {
        setError('Límite de solicitudes alcanzado. Espera unos minutos.');
      } else {
        setError(`Error al analizar: ${err.message}. Verifica tu API Key y conexión.`);
      }
=======
      const response = await api.ai.analyzeCV({
        cv_text: resumeText,
        job_description: jobDescription || undefined
      });
      
      setResult(response);
    } catch (err) {
      console.error('Analysis Error:', err);
      setError(`Error: ${err.message}. ${!api.isAuthenticated() ? 'Inicia sesión para usar el analizador de CV.' : 'Intenta de nuevo.'}`);
>>>>>>> Stashed changes
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="optimizer-container">
      <header className="optimizer-header">
        <h2><Sparkles className="icon-gold" /> Optimizador de CV</h2>
        <p>Convierte tu CV en un imán de entrevistas usando IA.</p>
      </header>

      <div className="optimizer-grid">
        <div className="input-section">
          <div className="upload-box">
             <input 
                type="file" 
                id="pdf-upload" 
                accept=".pdf" 
                onChange={handleFileUpload} 
                className="hidden-input"
                aria-label="Subir archivo PDF de CV"
             />
             <label htmlFor="pdf-upload" className="upload-label">
                {isParsingPdf ? (
                  <Loader2 className="spin" size={24} aria-hidden="true" />
                ) : (
                  <UploadCloud size={24} aria-hidden="true" />
                )}
                <span>
                  {isParsingPdf ? 'Leyendo PDF...' : fileName ? `Archivo: ${fileName}` : 'Sube tu CV en PDF'}
                </span>
             </label>
          </div>

          <div className="divider"><span>O PEGA EL TEXTO</span></div>

          <div className="form-group">
            <label htmlFor="resume-text">Tu CV Actual</label>
            <textarea 
              id="resume-text"
              placeholder="El texto de tu PDF aparecerá aquí automáticamente..." 
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              rows={10}
              aria-label="Texto del CV"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="job-description">Descripción de la Oferta (Opcional)</label>
            <textarea 
              id="job-description"
              placeholder="Pega la descripción del trabajo para adaptar el CV..." 
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={5}
              aria-label="Descripción de la oferta de trabajo"
            />
          </div>

          <button 
            className="btn-primary full-width" 
            onClick={analyzeCV}
            disabled={isAnalyzing}
            aria-label="Analizar y corregir CV"
          >
            {isAnalyzing ? <><Loader2 className="spin" aria-hidden="true" /> Analizando...</> : <><Sparkles size={18} aria-hidden="true" /> Analizar y Corregir</>}
          </button>
          
          {error && <div className="error-box" role="alert" aria-live="polite">{error}</div>}
        </div>

        <div className="result-section">
          {!result && !isAnalyzing && (
            <div className="placeholder-state">
              <FileText size={48} />
              <h3>Esperando análisis...</h3>
              <p>Pega tu CV a la izquierda para recibir feedback instantáneo y una versión reescrita de alto impacto.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="loading-state">
              <div className="scanner"></div>
              <p>Analizando palabras clave, impacto y estructura...</p>
            </div>
          )}

          {result && (
            <div className="analysis-result">
              <div className="score-card">
                <div className="score-circle" style={{
                  borderColor: result.score > 80 ? '#4ade80' : result.score > 50 ? '#fbbf24' : '#f87171'
                }}>
                  <span className="sc-val">{result.score}</span>
                  <span className="sc-label">PUNTOS</span>
                </div>
                <div className="score-summary">
                  <h4>Feedback Crítico</h4>
                  <ul>
                    {result.feedback.map((item, i) => (
                      <li key={i}><AlertTriangle size={14} color="#fbbf24" /> {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="optimized-preview">
                <div className="preview-header">
                  <h4><CheckCircle size={16} color="#4ade80" aria-hidden="true" /> CV Optimizado</h4>
                  <button 
                    className="btn-text"
                    onClick={() => {
                      navigator.clipboard.writeText(result.rewrittenCV);
                      alert('¡CV copiado al portapapeles!');
                    }}
                    aria-label="Copiar CV optimizado al portapapeles"
                  >
                    <Copy size={14} aria-hidden="true" /> Copiar
                  </button>
                </div>
                <div className="markdown-content" role="region" aria-label="Vista previa del CV optimizado">
                  <ReactMarkdown>{result.rewrittenCV}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
