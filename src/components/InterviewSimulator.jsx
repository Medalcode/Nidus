import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Play, Send, User, Bot, AlertCircle, Award, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './InterviewSimulator.css';

export default function InterviewSimulator({ jobs }) {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [messages, setMessages] = useState([]); // { role: 'ai' | 'user', content: '', feedback?: '' }
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  // Filter only relevant jobs (Applied, Interview, Offer)
  const availableJobs = jobs.filter(j => ['applied', 'interview', 'offer'].includes(j.status));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startInterview = async () => {
    if (!selectedJobId) return;
    
    const job = jobs.find(j => j.id === selectedJobId);
    const apiKey = localStorage.getItem('openhire_groq_key');
    
    if (!apiKey) {
      setError('Configura tu API Key en la sección de Tablero > Configuración.');
      return;
    }

    setIsSessionActive(true);
    setMessages([]);
    setIsLoading(true);
    setError('');

    const prompt = `
      Eres un Entrevistador Experto para la empresa ${job.company}.
      Estás entrevistando a un candidato para el puesto de ${job.title}.
      
      Tu objetivo: Realizar una entrevista realista y desafiante.
      1. Empieza presentándote brevemente y haciendo la primera pregunta (puede ser sobre experiencia o técnica).
      2. SOLO haz UNA pregunta a la vez. No hagas listas.
      3. Mantén el tono profesional.
    `;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'system', content: prompt }],
          model: 'llama3-70b-8192',
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('Error al conectar con la IA');
      const data = await response.json();
      const aiMessage = data.choices[0].message.content;
      
      setMessages([{ role: 'ai', content: aiMessage }]);
    } catch (err) {
      setError(err.message);
      setIsSessionActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsg = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const apiKey = localStorage.getItem('openhire_groq_key');
    const job = jobs.find(j => j.id === selectedJobId);

    // Context reconstruction for memory
    const conversationHistory = messages.map(m => 
      `${m.role === 'user' ? 'Candidato' : 'Entrevistador'}: ${m.content}`
    ).join('\n');

    const prompt = `
      Actúa como el Entrevistador Técnico Senior de ${job.company}.
      
      Historial de la entrevista:
      ${conversationHistory}
      Candidato: ${inputValue}

      Tarea:
      1. ANALIZA la respuesta del candidato.
      2. Si la respuesta es pobre, dímelo, pero de forma constructiva antes de pasar a la siguiente preguna.
      3. Si es buena, reconoce el punto.
      4. Haz la SIGUIENTE pregunta (y solo una).
      5. La entrevista debe fluir naturalmente.
    `;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama3-70b-8192',
          temperature: 0.6
        })
      });

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);

    } catch (err) {
      setError('Error al obtener respuesta. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="interview-container">
      {!isSessionActive ? (
        <div className="interview-setup">
          <header className="setup-header">
            <h2><MessageSquare className="icon-purple" /> Simulador de Entrevistas</h2>
            <p>Practica con una IA que actúa como el reclutador de la empresa a la que aplicaste.</p>
          </header>

          <div className="setup-card">
            <label>Elige una postulación para practicar:</label>
            <select 
              value={selectedJobId} 
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="job-select"
            >
              <option value="">-- Selecciona un empleo --</option>
              {availableJobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title} en {job.company}
                </option>
              ))}
            </select>

            {availableJobs.length === 0 && (
              <div className="warning-box">
                <AlertCircle size={16} />
                <p>Necesitas tener empleos en estado "Aplicado" o "Entrevista" en tu tablero.</p>
              </div>
            )}

            <button 
              className="btn-primary start-btn" 
              onClick={startInterview}
              disabled={!selectedJobId || isLoading}
            >
              {isLoading ? 'Conectando...' : <><Play size={18} /> Comenzar Simulación</>}
            </button>
            {error && <p className="error-text">{error}</p>}
          </div>
        </div>
      ) : (
        <div className="interview-session">
          <div className="chat-header">
            <div className="job-info">
              <h3>Entrevista para {jobs.find(j => j.id === selectedJobId)?.company}</h3>
              <span className="live-badge">EN VIVO</span>
            </div>
            <button className="btn-secondary sm" onClick={() => setIsSessionActive(false)}>
              Terminar
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="avatar">
                  {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className="content">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai">
                <div className="avatar"><Bot size={20} /></div>
                <div className="content typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu respuesta..."
              disabled={isLoading}
              rows={3}
            />
            <button 
              className="send-btn" 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
