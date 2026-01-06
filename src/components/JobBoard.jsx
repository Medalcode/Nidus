import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowRight, ArrowLeft, Building2, Calendar, Download, RefreshCw, Wand2, Settings } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import CoverLetterGenerator from './CoverLetterGenerator';
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
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('openhire_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedJobForLetter, setSelectedJobForLetter] = useState(null);
  
  const [newJob, setNewJob] = useState({ title: '', company: '', link: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('openhire_jobs', JSON.stringify(jobs));
    window.dispatchEvent(new Event('jobs-updated'));
  }, [jobs]);

  const fetchScrapedJobs = async () => {
    setLoading(true);
    try {
      // Use relative path for API (works both local proxy and prod)
      const response = await fetch(`/api/scrape?term=react`); 
      if (!response.ok) throw new Error('Error al conectar con el servidor de scraping.');
      
      const scrapedData = await response.json();
      const existingLinks = new Set(jobs.map(j => j.link));
      const newJobs = scrapedData.filter(job => !existingLinks.has(job.link));
      
      if (newJobs.length === 0) {
        alert('No hay ofertas nuevas para importar.');
      } else {
        const jobsToAdd = newJobs.map(job => ({
          ...job,
          id: job.id || crypto.randomUUID(), 
          status: 'wishlist'
        }));
        
        setJobs(prev => [...prev, ...jobsToAdd]);
        alert(`¡Se importaron ${jobsToAdd.length} nuevas ofertas!`);
      }
    } catch (error) {
      console.error('Error importing jobs:', error);
      alert('Error al importar. Asegúrate de haber ejecutado el scraper.');
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

  const handleDrop = (e, status) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    setJobs(jobs.map(job => 
      job.id === parseInt(jobId) || job.id === jobId ? { ...job, status } : job
    ));
  };

  const addJob = (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company) return;
    
    setJobs([...jobs, { 
      id: Date.now().toString(), // Changed ID generation
      ...newJob, 
      date: new Date().toISOString().split('T')[0], // Changed date format
      status: 'wishlist' 
    }]);
    setNewJob({ title: '', company: '', link: '' });
    setIsAdding(false);
  };

  const moveJob = (jobId, direction) => {
    const job = jobs.find(j => j.id === jobId);
    const currentIndex = COLUMNS.findIndex(c => c.id === job.status);
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      updateJobStatus(jobId, COLUMNS[newIndex].id);
    }
  };

  const updateJobStatus = (id, newStatus) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status: newStatus } : job));
  };

  const deleteJob = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este empleo?')) { // Updated confirmation message
      setJobs(jobs.filter(job => job.id !== id));
    }
  };

  const openAiModal = (job) => { // New function for AI modal
    setSelectedJob(job);
    setShowAiModal(true);
  };

  return (
    <div className="board-container">
      <header className="board-header"> {/* Changed div to header */}
        <div className="header-left"> {/* New div */}
          <h2>Tablero de Postulaciones</h2>
          <span className="job-count">{jobs.length} Empleos Rastreados</span> {/* New text */}
        </div>
        <div className="header-actions"> {/* New div */}
           <button 
            className="btn-icon" // Changed class
            onClick={() => setShowSettings(true)}
            title="Configuración" // Updated title
          >
            <Settings size={20} /> {/* Changed icon size */}
          </button>
          <button 
            className="btn-secondary" 
            onClick={fetchScrapedJobs}
            disabled={loading}
          >
            {loading ? <RefreshCw className="spin" size={18} /> : <Download size={18} />} Importar Ofertas {/* Added text */}
          </button>
          <button className="btn-primary" onClick={() => setIsAdding(!isAdding)}>
            <Plus size={18} /> Nuevo empleo {/* Updated text */}
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
