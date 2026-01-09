import { useState } from 'react';
import { Terminal, Play, Loader2, AlertCircle } from 'lucide-react';
import './JobAutomation.css';

export default function JobAutomation() {
  const [url, setUrl] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', 'partial'

  const handleRunBot = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setLogs(['> Iniciando Agente NIDUS...', '> Conectando con servidor remoto...', '> Lanzando browser (Chromium)...']);
    setStatus(null);

    try {
      const response = await fetch('/api/agent/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_url: url })
      });

      if (!response.ok) {
        throw new Error('Error en el servidor del agente');
      }

      const data = await response.json();
      
      // Update logs with real data from backend
      setLogs(prev => [...prev, ...data.log, `> Proceso finalizado con estado: ${data.status}`]);
      setStatus(data.status);
      
    } catch (error) {
      setLogs(prev => [...prev, `> Error CRÍTICO: ${error.message}`]);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="automation-container">
      <header className="automation-header">
        <div className="icon-badge">
          <Terminal size={32} />
        </div>
        <h1>Nidus Auto-Apply Bot <span className="version">v1.0</span></h1>
        <p>Automatiza el llenado de formularios de empleo. Pega la URL y deja que el bot trabaje.</p>
      </header>

      <div className="automation-content">
        <div className="control-panel">
          <form onSubmit={handleRunBot} className="url-form">
            <input 
              type="url" 
              placeholder="Pega la URL de la oferta aquí (ej. https://greenhouse.io/...)" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              required
            />
            <button type="submit" className="btn-primary run-btn" disabled={loading}>
              {loading ? <Loader2 className="spin" size={20} /> : <Play size={20} />}
              {loading ? 'Ejecutando...' : 'Iniciar Bot'}
            </button>
          </form>

          <div className="tips-box">
             <AlertCircle size={16} />
             <span>
               <strong>Nota:</strong> El bot funciona mejor en formularios estándar (Greenhouse, Lever, Workday) y páginas sencillas. 
               Asegúrate de haber configurado tu Nombre y Email en los ajustes.
             </span>
          </div>
        </div>

        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span className="terminal-title">agent_logs.log</span>
          </div>
          <div className="terminal-body">
            {logs.length === 0 ? (
              <div className="terminal-placeholder">
                <span className="blink">_</span> Esperando comando...
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="log-line">
                  <span className="timestamp">[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))
            )}
            {loading && <div className="log-line"><span className="blink">_</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
