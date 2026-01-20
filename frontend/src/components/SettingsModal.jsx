import React, { useState, useEffect } from 'react';
import { FaKey, FaTimes, FaSave } from 'react-icons/fa';

export default function SettingsModal({ isOpen, onClose, apiKey, setApiKey }) {
  const [localKey, setLocalKey] = useState(apiKey || '');

  useEffect(() => {
    setLocalKey(apiKey || '');
  }, [apiKey]);

  const handleSave = () => {
    setApiKey(localKey);
    localStorage.setItem('groq_api_key', localKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FaKey className="text-indigo-500" /> Configuración de IA
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <FaTimes />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-500 mb-4">
            Ingresa tu API Key de Groq para habilitar la extracción inteligente de habilidades y experiencia con IA (Llama 3).
          </p>
          
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Groq API Key
          </label>
          <input
            type="password"
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
            placeholder="gsk_..."
          />
          <p className="text-xs text-slate-400 mt-2">
            Tu clave se guarda localmente en tu navegador.
          </p>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm hover:shadow"
          >
            <FaSave /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
