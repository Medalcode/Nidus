import React from 'react';
import { FaFeatherAlt, FaCog } from 'react-icons/fa';

export default function Layout({ children, lang, setLang, languages, onOpenSettings, currentView, onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 cursor-pointer" onClick={() => onNavigate('home')}>
             <FaFeatherAlt className="text-2xl" />
             <h1 className="text-xl font-bold tracking-tight">ATS Visual</h1>
          </div>
          
          <nav className="flex gap-4">
            <button 
                onClick={() => onNavigate('home')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'home' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
            >
                Subir CV
            </button>
            <button 
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
            >
                Candidatos
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button 
                onClick={onOpenSettings}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
                title="Configuración"
            >
                <FaCog className="text-lg" />
            </button>
            <select 
              value={lang} 
              onChange={e => setLang(e.target.value)}
              className="bg-slate-100 border-none text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-slate-200 transition-colors"
            >
              {Object.entries(languages).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Nidus ATS. Built with React & FastAPI.</p>
        </div>
      </footer>
    </div>
  );
}
