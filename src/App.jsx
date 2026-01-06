import { useState, useEffect } from 'react'
import { FileText, Bot, Layout, Home, ExternalLink, Terminal, ArrowRight, BarChart3, ScanFace, MessageSquare } from 'lucide-react'
import JobBoard from './components/JobBoard'
import Analytics from './components/Analytics'
import CVOptimizer from './components/CVOptimizer'
import InterviewSimulator from './components/InterviewSimulator'
import './App.css'
import './components/JobBoard.css'
import './components/Analytics.css'
import './components/CVOptimizer.css'
import './components/InterviewSimulator.css'

function App() {
  const [currentView, setCurrentView] = useState('home')
  
  // Load jobs here to pass to Analytics and Simulator
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('openhire_jobs');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Listen for storage updates to keep Analytics in sync if JobBoard updates jobs
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('openhire_jobs');
      if (saved) setJobs(JSON.parse(saved));
    };
    
    // Custom event listener for local updates within same window
    window.addEventListener('jobs-updated', handleStorageChange);
    return () => window.removeEventListener('jobs-updated', handleStorageChange);
  }, []);

  const tools = [
    {
      id: 'kanban',
      title: 'Tablero Kanban',
      icon: <Layout size={24} />,
      tag: 'Gestión de Postulaciones',
      description: 'Gestiona tus postulaciones en un tablero visual. Rastrea el estado de cada empleo.',
      action: () => setCurrentView('board'),
      actionLabel: 'Abrir Tablero',
      primary: true
    },
    {
      id: 'optimizer',
      title: 'Analizador de CV con IA',
      icon: <ScanFace size={24} />,
      tag: 'Optimización de Currículum',
      description: 'Analiza y reescribe tu CV con IA para pasar los filtros de los reclutadores y destacar.',
      action: () => setCurrentView('optimizer'),
      actionLabel: 'Optimizar ahora',
      primary: true
    },
    {
      id: 'simulator',
      title: 'Simulador de Entrevistas',
      icon: <MessageSquare size={24} />,
      tag: 'Roleplay con IA',
      description: 'Practica entrevistas técnicas y de comportamiento con un reclutador virtual.',
      action: () => setCurrentView('simulator'),
      actionLabel: 'Practicar Entrevista',
    },
    {
      id: 'analytics',
      title: 'Analíticas',
      icon: <BarChart3 size={24} />,
      tag: 'Métricas de Rendimiento',
      description: 'Visualiza tu tasa de éxito y el estado de tu embudo de contratación.',
      action: () => setCurrentView('analytics'),
      actionLabel: 'Ver Estadísticas',
    },
    {
      id: 'cv-tools',
      title: 'CV Open Source',
      icon: <FileText size={24} />,
      tag: 'Creación de CV',
      description: 'Olvida los editores de pago. Usa herramientas libres y minimalistas.',
      links: [
        { label: 'Reactive Resume', url: 'https://rxresu.me/', highlight: true },
        { label: 'JSON Resume', url: 'https://jsonresume.org/' }
      ]
    },
    {
      id: 'ai-tools',
      title: 'Asistente IA Gratuito',
      icon: <Bot size={24} />,
      tag: 'Cartas y Coaching',
      description: 'Accede a modelos potentes como Llama 3 para redactar cartas y prepararte.',
      links: [
        { label: 'Hugging Face Chat', url: 'https://huggingface.co/chat/', highlight: true },
        { label: 'Groq Cloud', url: 'https://groq.com/' }
      ]
    },
    {
      id: 'automation',
      title: 'Automatización de Empleo',
      icon: <Terminal size={24} />,
      tag: 'Módulo Futuro',
      description: 'Automatiza tu búsqueda. Próximamente: Scrapers y Auto-Appliers.',
      links: [
        { label: 'Próximamente', url: '#', disabled: true }
      ]
    }
  ]

  const renderView = () => {
    switch(currentView) {
      case 'home':
        return (
          <>
            <header className="hero">
              <div className="tag" style={{ marginBottom: '1rem' }}>Nidius Suite</div>
              <h1>Consigue Trabajo.<br/>Sin Pagar de Más.</h1>
              <p>
                Reemplaza los SaaS de pago por herramientas Open Source. 
                Optimiza tu perfil, usa IA avanzada y automatiza tu búsqueda.
              </p>
            </header>

            <div className="tools-grid">
              {tools.map((tool) => (
                <div key={tool.id} className="tool-card">
                  <div className="icon-wrapper">
                    {tool.icon}
                  </div>
                  <h3>{tool.title}</h3>
                  <span className="tag">{tool.tag}</span>
                  <p>{tool.description}</p>
                  <div className="links-container" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                    {tool.action ? (
                       <button 
                          onClick={tool.action}
                          className="btn-primary"
                        >
                          {tool.actionLabel} <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                        </button>
                    ) : (
                      tool.links.map((link, idx) => (
                        <a 
                          key={idx} 
                          href={link.url} 
                          target={link.url === '#' ? '_self' : '_blank'} 
                          rel="noreferrer"
                          className={link.highlight ? 'btn-primary' : 'btn-secondary'}
                          style={link.disabled ? { opacity: 0.5, pointerEvents: 'none', background: 'rgba(255,255,255,0.05)' } : {}}
                        >
                          {link.label} {link.url !== '#' && <ExternalLink size={14} style={{ marginLeft: '4px' }} />}
                        </a>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            <footer className="footer-quote">
              <p>"Si no puedes pagar automatizadores de CV o búsqueda, hazlo tú mismo con herramientas libres."</p>
            </footer>
          </>
        );
      case 'board':
        return <JobBoard />;
      case 'analytics':
        return <Analytics jobs={jobs} />;
      case 'optimizer':
        return <CVOptimizer />;
      case 'simulator':
        return <InterviewSimulator jobs={jobs} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <nav className="main-nav" style={{ 
        display: 'flex', 
        gap: '2rem', 
        justifyContent: 'center', 
        padding: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        marginBottom: '2rem'
      }}>
        <button 
          className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentView('home')}
          style={{ 
            background: 'none', 
            border: 'none',
            cursor: 'pointer',
            color: currentView === 'home' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: currentView === 'home' ? 600 : 400
          }}
        >
          <Home size={18} /> Inicio
        </button>
        <button 
          className={`nav-item ${currentView === 'board' ? 'active' : ''}`}
          onClick={() => setCurrentView('board')}
          style={{ 
            background: 'none', 
            border: 'none',
            cursor: 'pointer',
            color: currentView === 'board' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: currentView === 'board' ? 600 : 400
          }}
        >
          <Layout size={18} /> Tablero
        </button>
        <button 
          className={`nav-item ${currentView === 'optimizer' ? 'active' : ''}`}
          onClick={() => setCurrentView('optimizer')}
          style={{ 
            background: 'none', 
            border: 'none',
            cursor: 'pointer',
            color: currentView === 'optimizer' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: currentView === 'optimizer' ? 600 : 400
          }}
        >
          <ScanFace size={18} /> CV IA
        </button>
        <button 
          className={`nav-item ${currentView === 'simulator' ? 'active' : ''}`}
          onClick={() => setCurrentView('simulator')}
          style={{ 
            background: 'none', 
            border: 'none',
            cursor: 'pointer',
            color: currentView === 'simulator' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: currentView === 'simulator' ? 600 : 400
          }}
        >
          <MessageSquare size={18} /> Entrevista
        </button>
        <button 
          className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`}
          onClick={() => setCurrentView('analytics')}
          style={{ 
            background: 'none', 
            border: 'none',
            cursor: 'pointer',
            color: currentView === 'analytics' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: currentView === 'analytics' ? 600 : 400
          }}
        >
          <BarChart3 size={18} /> Analytics
        </button>
      </nav>

      {renderView()}
    </div>
  )
}

export default App
