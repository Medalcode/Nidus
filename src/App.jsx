<<<<<<< Updated upstream
import { useState, useEffect } from 'react';
import {
  FileText,
  Bot,
  Layout,
  Home,
  ExternalLink,
  Terminal,
  ArrowRight,
  BarChart3,
  ScanFace,
  MessageSquare,
} from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import JobBoard from './components/JobBoard';
import Analytics from './components/Analytics';
import CVOptimizer from './components/CVOptimizer';
import InterviewSimulator from './components/InterviewSimulator';
import ThemeToggle from './components/ThemeToggle';
import './App.css';
import './components/JobBoard.css';
import './components/Analytics.css';
import './components/CVOptimizer.css';
import './components/InterviewSimulator.css';

function AppContent() {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState('home');

  // Load jobs here to pass to Analytics and Simulator
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('openhire_jobs');
    return saved ? JSON.parse(saved) : [];
  });

=======
import { useState, useEffect } from 'react'
import { FileText, Bot, Layout, Home, ExternalLink, Terminal, ArrowRight, BarChart3, ScanFace, MessageSquare, HelpCircle, X, LogOut, User } from 'lucide-react'
import JobBoard from './components/JobBoard'
import Analytics from './components/Analytics'
import CVOptimizer from './components/CVOptimizer'
import InterviewSimulator from './components/InterviewSimulator'
import JobAutomation from './components/JobAutomation'
import Auth from './components/Auth'
import api from './utils/api'
import './App.css'
import './components/JobBoard.css'
import './components/Analytics.css'
import './components/CVOptimizer.css'
import './components/InterviewSimulator.css'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [showGuide, setShowGuide] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  
  // Load jobs here to pass to Analytics and Simulator
  const [jobs, setJobs] = useState([]);
  
  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (api.isAuthenticated()) {
        try {
          const userData = await api.auth.getMe()
          setUser(userData)
          // Load jobs from backend
          const jobsData = await api.jobs.getAll()
          setJobs(jobsData)
        } catch (error) {
          console.error('Auth check failed:', error)
          // Fallback to localStorage
          const cachedJobs = localStorage.getItem('openhire_jobs')
          if (cachedJobs) {
            setJobs(JSON.parse(cachedJobs))
          }
        }
      } else {
        // Load from localStorage if not authenticated
        const cachedJobs = localStorage.getItem('openhire_jobs')
        if (cachedJobs) {
          setJobs(JSON.parse(cachedJobs))
        }
      }
      setIsLoadingAuth(false)
    }
    
    checkAuth()
    
    // Listen for auth events
    const handleAuthExpired = () => {
      setUser(null)
      setShowAuth(true)
    }
    
    const handleAuthLogout = () => {
      setUser(null)
      setJobs([])
      setCurrentView('home')
    }
    
    window.addEventListener('auth-expired', handleAuthExpired)
    window.addEventListener('auth-logout', handleAuthLogout)
    
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired)
      window.removeEventListener('auth-logout', handleAuthLogout)
    }
  }, [])
  
>>>>>>> Stashed changes
  // Listen for storage updates to keep Analytics in sync if JobBoard updates jobs
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('openhire_jobs');
      if (saved) setJobs(JSON.parse(saved));
    };
<<<<<<< Updated upstream

=======
    
    const handleJobsUpdated = async () => {
      // Reload from backend if authenticated
      if (api.isAuthenticated()) {
        try {
          const jobsData = await api.jobs.getAll()
          setJobs(jobsData)
        } catch (error) {
          console.error('Error reloading jobs:', error)
          handleStorageChange()
        }
      } else {
        handleStorageChange()
      }
    };
    
>>>>>>> Stashed changes
    // Custom event listener for local updates within same window
    window.addEventListener('jobs-updated', handleJobsUpdated);
    return () => window.removeEventListener('jobs-updated', handleJobsUpdated);
  }, []);
  
  const handleAuthSuccess = async (userData) => {
    setUser(userData)
    setShowAuth(false)
    
    // Load jobs after login
    try {
      const jobsData = await api.jobs.getAll()
      setJobs(jobsData)
      
      // Optionally migrate localStorage jobs to backend
      const cachedJobs = localStorage.getItem('openhire_jobs')
      if (cachedJobs) {
        const localJobs = JSON.parse(cachedJobs)
        // If user has local jobs but no backend jobs, offer migration
        if (localJobs.length > 0 && jobsData.length === 0) {
          // Could show a migration prompt here
          console.log('Found local jobs, consider migrating to backend')
        }
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    }
  }
  
  const handleLogout = () => {
    if (confirm('¿Seguro que quieres cerrar sesión?')) {
      api.auth.logout()
    }
  }

  const tools = [
    {
      id: 'kanban',
      title: 'Tablero Kanban',
      icon: <Layout size={24} />,
      tag: 'Gestión de Postulaciones',
      description:
        'Gestiona tus postulaciones en un tablero visual. Rastrea el estado de cada empleo.',
      action: () => setCurrentView('board'),
      actionLabel: 'Abrir Tablero',
      primary: true,
    },
    {
      id: 'optimizer',
      title: 'Analizador de CV con IA',
      icon: <ScanFace size={24} />,
      tag: 'Optimización de Currículum',
      description:
        'Analiza y reescribe tu CV con IA para pasar los filtros de los reclutadores y destacar.',
      action: () => setCurrentView('optimizer'),
      actionLabel: 'Optimizar ahora',
      primary: true,
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
        { label: 'JSON Resume', url: 'https://jsonresume.org/' },
      ],
    },
    {
      id: 'ai-tools',
      title: 'Asistente IA Gratuito',
      icon: <Bot size={24} />,
      tag: 'Cartas y Coaching',
      description: 'Accede a modelos potentes como Llama 3 para redactar cartas y prepararte.',
      links: [
        { label: 'Hugging Face Chat', url: 'https://huggingface.co/chat/', highlight: true },
        { label: 'Groq Cloud', url: 'https://groq.com/' },
      ],
    },
    {
      id: 'automation',
      title: 'Automatización de Empleo',
      icon: <Terminal size={24} />,
      tag: 'Módulo Futuro',
      description: 'Automatiza tu búsqueda. Próximamente: Scrapers y Auto-Appliers.',
      links: [{ label: 'Próximamente', url: '#', disabled: true }],
    },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <header className="hero">
<<<<<<< Updated upstream
              <div className="tag" style={{ marginBottom: '1rem' }}>
                Nidius Suite
              </div>
              <h1>{t('hero_title')}</h1>
              <p>{t('hero_subtitle')}</p>
=======
              <div className="tag" style={{ marginBottom: '1rem' }}>Nidus Suite</div>
              <h1>Consigue Trabajo.<br/>Sin Pagar de Más.</h1>
              <p>
                Reemplaza los SaaS de pago por herramientas Open Source. 
                Optimiza tu perfil, usa IA avanzada y automatiza tu búsqueda.
              </p>
>>>>>>> Stashed changes
            </header>

            <div className="tools-grid">
              {tools.map(tool => (
                <div key={tool.id} className="tool-card">
                  <div className="icon-wrapper">{tool.icon}</div>
                  <h3>{tool.title}</h3>
                  <span className="tag">{tool.tag}</span>
                  <p>{tool.description}</p>
                  <div
                    className="links-container"
                    style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}
                  >
                    {tool.action ? (
                      <button onClick={tool.action} className="btn-primary">
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
                          style={
                            link.disabled
                              ? {
                                  opacity: 0.5,
                                  pointerEvents: 'none',
                                  background: 'rgba(255,255,255,0.05)',
                                }
                              : {}
                          }
                        >
                          {link.label}{' '}
                          {link.url !== '#' && (
                            <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                          )}
                        </a>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            <footer className="footer-quote">
              <p>
                "Si no puedes pagar automatizadores de CV o búsqueda, hazlo tú mismo con
                herramientas libres."
              </p>
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

  if (isLoadingAuth) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
<<<<<<< Updated upstream
      <nav
        className="main-nav"
        style={{
          display: 'flex',
          gap: '2rem',
          justifyContent: 'center',
          padding: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          marginBottom: '2rem',
        }}
      >
        <button
=======
      <nav className="main-nav" style={{ 
        display: 'flex', 
        gap: '2rem', 
        justifyContent: 'center', 
        padding: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        marginBottom: '2rem',
        position: 'relative'
      }}>
        <button 
>>>>>>> Stashed changes
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
            fontWeight: currentView === 'home' ? 600 : 400,
          }}
        >
          <Home size={18} /> {t('home')}
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
            fontWeight: currentView === 'board' ? 600 : 400,
          }}
        >
          <Layout size={18} /> {t('board')}
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
            fontWeight: currentView === 'optimizer' ? 600 : 400,
          }}
        >
          <ScanFace size={18} /> {t('optimizer')}
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
            fontWeight: currentView === 'simulator' ? 600 : 400,
          }}
        >
          <MessageSquare size={18} /> {t('simulator')}
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
            fontWeight: currentView === 'analytics' ? 600 : 400,
          }}
        >
          <BarChart3 size={18} /> {t('analytics')}
        </button>
        
        {/* Auth button - positioned absolutely at the right */}
        <div style={{ position: 'absolute', right: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <User size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                {user.email}
              </span>
              <button 
                onClick={handleLogout}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <LogOut size={14} /> Salir
              </button>
            </>
          ) : (
            <button 
              onClick={() => setShowAuth(true)}
              className="btn-primary"
              style={{ 
                padding: '0.5rem 1rem',
                fontSize: '0.9rem'
              }}
            >
              <User size={14} style={{ marginRight: '0.25rem' }} /> Ingresar
            </button>
          )}
        </div>
      </nav>

      <ThemeToggle />

      {renderView()}
      
      {/* Auth Modal */}
      {showAuth && (
        <Auth 
          onClose={() => setShowAuth(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
