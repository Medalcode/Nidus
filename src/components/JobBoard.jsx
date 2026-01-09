import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowRight, ArrowLeft, Building2, Calendar, Download, RefreshCw, Wand2, Settings, UploadCloud } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import CoverLetterGenerator from './CoverLetterGenerator';
import api from '../utils/api';
import '../App.css';
import './JobBoard.css';

const COLUMNS = [
  { id: 'wishlist', title: 'Por Aplicar', color: '#a78bfa' },
  { id: 'applied', title: 'Aplicado', color: '#38bdf8' },
  { id: 'interview', title: 'Entrevista', color: '#fbbf24' },
  { id: 'offer', title: 'Oferta', color: '#4ade80' },
  { id: 'rejected', title: 'Rechazado', color: '#f87171' }
];

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedJobForLetter, setSelectedJobForLetter] = useState(null);
  const [newJob, setNewJob] = useState({ title: '', company: '', link: '' });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Load jobs on mount - try backend first, fallback to localStorage
  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        if (api.isAuthenticated()) {
          const backendJobs = await api.jobs.getAll();
          setJobs(backendJobs);
          // Sync to localStorage as backup
          localStorage.setItem('openhire_jobs', JSON.stringify(backendJobs));
        } else {
          // Load from localStorage if not authenticated
          const saved = localStorage.getItem('openhire_jobs');
          if (saved) {
            setJobs(JSON.parse(saved));
          }
        }
      } catch (error) {
        console.error('Error loading jobs:', error);
        // Fallback to localStorage on error
        const saved = localStorage.getItem('openhire_jobs');
        if (saved) {
          setJobs(JSON.parse(saved));
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadJobs();
  }, []);

  // Sync jobs to backend and localStorage on change
  useEffect(() => {
    const syncJobs = async () => {
      // Always save to localStorage
      localStorage.setItem('openhire_jobs', JSON.stringify(jobs));
      window.dispatchEvent(new Event('jobs-updated'));
      
      // Sync to backend if authenticated (debounced)
      if (api.isAuthenticated() && jobs.length > 0) {
        // Simple debounce - only sync if not currently syncing
        if (!syncing) {
          setSyncing(true);
          try {
            // Backend sync would happen here in a real implementation
            // For now, we rely on individual CRUD operations
            console.log('Jobs synced to backend');
          } catch (error) {
            console.error('Error syncing jobs:', error);
          } finally {
            setTimeout(() => setSyncing(false), 1000);
          }
        }
      }
    };
    
    if (jobs.length > 0 || jobs.length === 0) { // Trigger even on empty
      syncJobs();
    }
  }, [jobs]);

  const exportData = () => {
    try {
      const dataStr = JSON.stringify(jobs, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nidius-jobs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error al exportar datos.');
    }
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedJobs = JSON.parse(e.target.result);
        if (Array.isArray(importedJobs)) {
          setJobs(importedJobs);
          alert(`¡Se importaron ${importedJobs.length} empleos!`);
        } else {
          alert('Formato de archivo inválido.');
        }
      } catch (error) {
        console.error('Error parsing imported data:', error);
        alert('Error al leer el archivo. Asegúrate de que sea un JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  const fetchScrapedJobs = async () => {
    setLoading(true);
    try {
<<<<<<< Updated upstream
      const response = await fetch(`/api/scrape?term=react`, {
        signal: AbortSignal.timeout(15000)
      }); 
      if (!response.ok) throw new Error('Error al conectar con el servidor de scraping.');
      
      const scrapedData = await response.json();
=======
      const scrapedData = await api.scraper.scrapeJobs('react');
>>>>>>> Stashed changes
      const existingLinks = new Set(jobs.map(j => j.link));
      const newJobs = scrapedData.filter(job => !existingLinks.has(job.link));
      
      if (newJobs.length === 0) {
        alert('No hay ofertas nuevas para importar.');
      } else {
        const jobsToAdd = [];
        
        // Add to backend if authenticated
        if (api.isAuthenticated()) {
          for (const job of newJobs) {
            try {
              const created = await api.jobs.create({
                title: job.title,
                company: job.company,
                link: job.link,
                location: job.location,
                date: job.date,
                status: 'wishlist'
              });
              jobsToAdd.push(created);
            } catch (error) {
              console.error('Error creating job:', error);
              // Fallback to local if backend fails
              jobsToAdd.push({
                ...job,
                id: crypto.randomUUID(),
                status: 'wishlist'
              });
            }
          }
        } else {
          // Local-only mode
          jobsToAdd.push(...newJobs.map(job => ({
            ...job,
            id: crypto.randomUUID(),
            status: 'wishlist'
          })));
        }
        
        setJobs(prev => [...prev, ...jobsToAdd]);
        alert(`¡Se importaron ${jobsToAdd.length} nuevas ofertas!`);
      }
    } catch (error) {
      console.error('Error importing jobs:', error);
      if (error.name === 'TimeoutError') {
        alert('El servidor tardó demasiado en responder. Intenta de nuevo.');
      } else {
        alert('Error al importar. Asegúrate de que el servidor esté ejecutándose.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, jobId) => {
    e.dataTransfer.setData('jobId', jobId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    
    // Update locally
    const updatedJobs = jobs.map(job => 
      job.id === parseInt(jobId) || job.id === jobId ? { ...job, status } : job
    );
    setJobs(updatedJobs);
    
    // Update in backend if authenticated
    if (api.isAuthenticated()) {
      const job = updatedJobs.find(j => j.id === parseInt(jobId) || j.id === jobId);
      if (job) {
        try {
          await api.jobs.update(job.id, { status });
        } catch (error) {
          console.error('Error updating job status:', error);
        }
      }
    }
  };

  const addJob = async (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company) return;
    
    const jobData = {
      ...newJob,
      date: new Date().toISOString().split('T')[0],
      status: 'wishlist'
    };
    
    // Add to backend if authenticated
    if (api.isAuthenticated()) {
      try {
        const created = await api.jobs.create(jobData);
        setJobs([...jobs, created]);
      } catch (error) {
        console.error('Error creating job:', error);
        // Fallback to local
        setJobs([...jobs, { 
          id: crypto.randomUUID(),
          ...jobData
        }]);
      }
    } else {
      // Local-only mode
      setJobs([...jobs, { 
        id: crypto.randomUUID(),
        ...jobData
      }]);
    }
    
    setNewJob({ title: '', company: '', link: '' });
    setIsAdding(false);
  };

  const moveJob = async (jobId, direction) => {
    const job = jobs.find(j => j.id === jobId);
    const currentIndex = COLUMNS.findIndex(c => c.id === job.status);
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      const newStatus = COLUMNS[newIndex].id;
      
      // Update locally
      setJobs(jobs.map(j => 
        j.id === jobId ? { ...j, status: newStatus } : j
      ));
      
      // Update in backend if authenticated
      if (api.isAuthenticated()) {
        try {
          await api.jobs.update(jobId, { status: newStatus });
        } catch (error) {
          console.error('Error updating job:', error);
        }
      }
    }
  };

  const updateJobStatus = async (id, newStatus) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status: newStatus } : job));
    
    // Update in backend if authenticated
    if (api.isAuthenticated()) {
      try {
        await api.jobs.update(id, { status: newStatus });
      } catch (error) {
        console.error('Error updating job status:', error);
      }
    }
  };

<<<<<<< Updated upstream
  const deleteJob = (id) => {
=======
  const deleteJob = async (id) => {
>>>>>>> Stashed changes
    if (window.confirm('¿Estás seguro de que quieres eliminar este empleo?')) {
      setJobs(jobs.filter(job => job.id !== id));
      
      // Delete from backend if authenticated
      if (api.isAuthenticated()) {
        try {
          await api.jobs.delete(id);
        } catch (error) {
          console.error('Error deleting job:', error);
        }
      }
    }
  };

  const openAiModal = (job) => {
    setSelectedJobForLetter(job);
  };

  return (
    <div className="board-container">
      <header className="board-header"> {/* Changed div to header */}
        <div className="header-left"> {/* New div */}
          <h2>Tablero de Postulaciones</h2>
          <span className="job-count">{jobs.length} Empleos Rastreados</span> {/* New text */}
        </div>
        <div className="header-actions">
           <button 
            className="btn-icon"
            onClick={() => setShowSettings(true)}
            title="Configuración"
            aria-label="Abrir configuración"
          >
            <Settings size={20} />
          </button>
          <button 
            className="btn-icon" 
            onClick={exportData}
            title="Exportar datos"
            aria-label="Exportar datos a JSON"
          >
            <Download size={20} />
          </button>
          <label className="btn-icon" title="Importar datos" style={{ cursor: 'pointer' }}>
            <input 
              type="file" 
              accept=".json" 
              onChange={importData} 
              style={{ display: 'none' }} 
              aria-label="Importar datos desde JSON"
            />
            <UploadCloud size={20} />
          </label>
          <button 
            className="btn-secondary" 
            onClick={fetchScrapedJobs}
            disabled={loading}
            aria-label="Importar ofertas desde API"
          >
            {loading ? <RefreshCw className="spin" size={18} /> : <RefreshCw size={18} />} Scraper
          </button>
          <button 
            className="btn-primary" 
            onClick={() => setIsAdding(!isAdding)}
            aria-label="Añadir nuevo empleo"
          >
            <Plus size={18} /> Nuevo empleo
          </button>
        </div>
      </header>

      {isAdding && (
        <form onSubmit={addJob} className="add-job-form">
          <input
            autoFocus
            type="text"
            placeholder="Título del puesto (ej. Frontend Dev)" // Updated placeholder
            value={newJob.title}
            onChange={e => setNewJob({...newJob, title: e.target.value})}
          />
          <input
            type="text"
            placeholder="Empresa"
            value={newJob.company}
            onChange={e => setNewJob({...newJob, company: e.target.value})}
          />
          <input
            type="url"
            placeholder="Enlace a la oferta (opcional)" // Updated placeholder
            value={newJob.link}
            onChange={e => setNewJob({...newJob, link: e.target.value})}
          />
          <div className="form-actions">
            <button type="submit" className="btn-primary">Añadir</button> {/* Updated text */}
            <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="kanban-board">
        {COLUMNS.map(col => (
          <div 
            key={col.id} 
            className="kanban-column"
            onDragOver={handleDragOver} // Added drag and drop handlers
            onDrop={(e) => handleDrop(e, col.id)} // Added drag and drop handlers
          >
            <div className="column-header" style={{ borderTopColor: col.color }}> {/* New div and style */}
              <h3>{col.title}</h3>
              <span className="count">{jobs.filter(j => j.status === col.id).length}</span>
            </div>
            
            <div className="column-content"> {/* New div */}
              {jobs.filter(j => j.status === col.id).map(job => (
                <div 
                  key={job.id} 
                  className="job-card"
                  draggable // Made cards draggable
                  onDragStart={(e) => handleDragStart(e, job.id)} // Added drag and drop handlers
                >
                  <div className="card-header">
                    <h4>{job.title}</h4>
                    <button className="delete-btn" onClick={() => deleteJob(job.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="company-name">{job.company}</div> {/* New div */}
                  <div className="job-date">Añadido: {job.date}</div> {/* New div and text */}
                  
                  <div className="card-custom-actions" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}> {/* Updated style */}
                    {job.link && (
                      <a href={job.link} target="_blank" rel="noopener noreferrer" className="job-link-btn" title="Ver oferta original"> {/* Updated title */}
                        <ExternalLink size={12} /> Link {/* Added ExternalLink icon and text */}
                      </a>
                    )}
                    <button 
                      className="ai-btn"
                      onClick={() => openAiModal(job)} // Changed to new openAiModal function
                      title="Generar Carta con IA"
                    >
                      <Wand2 size={12} /> IA
                    </button>
                  </div>

                  <div className="card-actions">
                    <button 
                      disabled={col.id === 'wishlist'}
                      onClick={() => moveJob(job.id, -1)}
                      className="nav-btn"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button 
                      disabled={col.id === 'rejected'}
                      onClick={() => moveJob(job.id, 1)}
                      className="nav-btn"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ProfileSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {selectedJobForLetter && (
        <CoverLetterGenerator 
          job={selectedJobForLetter} 
          isOpen={!!selectedJobForLetter} 
          onClose={() => setSelectedJobForLetter(null)} 
        />
      )}
    </div>
  );
}
