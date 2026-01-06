import { useState } from 'react';
import { Copy, Check, X, Wand2, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './Modal.css';

export default function CoverLetterGenerator({ job, isOpen, onClose }) {
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateLetter = async () => {
    const apiKey = localStorage.getItem('openhire_groq_key');
    const userBio = localStorage.getItem('openhire_user_bio');

    if (!apiKey) {
      setError('Por favor, configura tu API Key de Groq en Ajustes primero.');
      return;
    }

    if (!userBio) {
      setError('Por favor, añade tu perfil profesional en Ajustes para generar mejores cartas.');
      return;
    }

    setLoading(true);
    setError('');
    
    const prompt = `
      Eres un experto coach de carrera y redactor profesional.
      Escribe una carta de presentación convincente y personalizada para el siguiente puesto:
      
      Puesto: ${job.title}
      Empresa: ${job.company}
      
      Utilizando mi siguiente perfil/experiencia:
      ${userBio}
      
      Instrucciones:
      - Tono profesional pero entusiasta.
      - Destaca por qué encajo bien en el rol basado en mi bio.
      - Sé conciso (máximo 300 palabras).
      - Incluye placeholders [Como esto] si falta información específica.
      - La salida debe ser SOLO el cuerpo de la carta en formato Markdown, sin saludos extra del bot.
    `;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama3-70b-8192',
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('Error al conectar con Groq API');
      
      const data = await response.json();
      setGeneratedLetter(data.choices[0]?.message?.content || 'No se pudo generar la carta.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content letter-modal">
        <div className="modal-header">
          <h2><Wand2 size={24} /> Carta de Presentación - {job.company}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {!generatedLetter && !loading && !error && (
          <div className="intro-state" style={{  textAlign: 'center', padding: '2rem' }}>
             <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
               Genera una carta personalizada usando Llama 3 en base a tu perfil y esta oferta.
             </p>
             <button className="btn-primary" onClick={generateLetter}>
               <Wand2 size={18} /> Generar Carta Ahora
             </button>
          </div>
        )}

        {loading && (
          <div className="loading-spinner">
            <Loader2 className="spin" size={48} />
            <p>Redactando tu carta ganadora...</p>
          </div>
        )}

        {error && (
          <div className="error-message" style={{ color: '#f87171', padding: '1rem', background: 'rgba(248,113,113,0.1)', borderRadius: '8px' }}>
            {error}
            <button className="btn-secondary" onClick={() => setError('')} style={{ marginTop: '1rem', display: 'block' }}>Reintentar</button>
          </div>
        )}

        {generatedLetter && (
          <div className="letter-result">
            <div className="letter-text" style={{ 
              background: 'rgba(255,255,255,0.05)', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              whiteSpace: 'pre-wrap',
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <ReactMarkdown>{generatedLetter}</ReactMarkdown>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setGeneratedLetter('')}>Descartar</button>
              <button className="btn-primary" onClick={copyToClipboard}>
                {copied ? <Check size={18} /> : <Copy size={18} />} 
                {copied ? '¡Copiado!' : 'Copiar al Portapapeles'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
