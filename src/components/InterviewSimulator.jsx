import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Play, Send, User, Bot, AlertCircle, Award, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../utils/api';
import './InterviewSimulator.css';

export default function InterviewSimulator({ jobs }) {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [messages, setMessages] = useState([]); // { role: 'ai' | 'user', content: '', feedback?: '' }
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const bottomRef = useRef(null);

  // Filter only relevant jobs (Applied, Interview, Offer)
  const availableJobs = jobs.filter(j => ['applied', 'interview', 'offer'].includes(j.status));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startInterview = async () => {
    if (!selectedJobId) return;
    
    const job = jobs.find(j => j.id === selectedJobId);

    setIsSessionActive(true);
    setMessages([]);
    setConversationHistory([]);
    setIsLoading(true);
    setError('');

    const systemPrompt = `Eres un Entrevistador Experto para la empresa ${job.company}.
Estás entrevistando a un candidato para el puesto de ${job.title}.

Tu objetivo: Realizar una entrevista realista y desafiante.
1. Empieza presentándote brevemente y haciendo la primera pregunta (puede ser sobre experiencia o técnica).
2. SOLO haz UNA pregunta a la vez. No hagas listas.
3. Mantén el tono profesional.`;

    try {
<<<<<<< Updated upstream
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'system', content: prompt }],
          model: 'llama3-70b-8192',
          temperature: 0.7
        })
=======
      const response = await api.ai.chat({
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.7
>>>>>>> Stashed changes
      });
      
      const aiMessage = response.message;
      const newHistory = [
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: aiMessage }
      ];
      
      setMessages([{ role: 'ai', content: aiMessage }]);
      setConversationHistory(newHistory);
    } catch (err) {
      setError(err.message || 'Error al conectar con la IA');
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
    const job = jobs.find(j => j.id === selectedJobId);

    // Context reconstruction for memory
    // Build conversation history for context
    const newHistory = [
      ...conversationHistory,
      { role: 'user', content: inputValue }
    ];

    try {
<<<<<<< Updated upstream
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama3-70b-8192',
          temperature: 0.6
        })
=======
      const response = await api.ai.chat({
        messages: newHistory,
        temperature: 0.6
>>>>>>> Stashed changes
      });

      const aiResponse = response.message;
      
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
      setConversationHistory([...newHistory, { role: 'assistant', content: aiResponse }]);

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
