import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  es: {
    // Navigation
    home: 'Inicio',
    board: 'Tablero',
    analytics: 'Analíticas',
    optimizer: 'Optimizador',
    simulator: 'Simulador',

    // Home
    hero_title: 'Suite Open Source para tu Búsqueda de Empleo',
    hero_subtitle:
      'Reemplaza las costosas herramientas SaaS con alternativas gratuitas, privadas y potenciadas por IA.',
    get_started: 'Empezar',

    // Kanban Board
    kanban_title: 'Tablero de Postulaciones',
    jobs_tracked: 'Empleos Rastreados',
    new_job: 'Nuevo empleo',
    import_offers: 'Importar Ofertas',
    export_data: 'Exportar datos',
    import_data: 'Importar datos',
    settings: 'Configuración',

    // Job statuses
    wishlist: 'Por Aplicar',
    applied: 'Aplicado',
    interview: 'Entrevista',
    offer: 'Oferta',
    rejected: 'Rechazado',

    // CV Optimizer
    cv_optimizer: 'Optimizador de CV',
    cv_subtitle: 'Convierte tu CV en un imán de entrevistas usando IA.',
    upload_pdf: 'Sube tu CV en PDF',
    paste_text: 'O PEGA EL TEXTO',
    your_cv: 'Tu CV Actual',
    job_description: 'Descripción de la Oferta (Opcional)',
    analyze_cv: 'Analizar y Corregir',
    analyzing: 'Analizando...',
    waiting_analysis: 'Esperando análisis...',
    optimized_cv: 'CV Optimizado',
    copy: 'Copiar',
    score: 'PUNTOS',
    critical_feedback: 'Feedback Crítico',

    // Interview Simulator
    interview_simulator: 'Simulador de Entrevistas',
    simulator_subtitle: 'Practica entrevistas con un reclutador virtual.',
    select_job: 'Selecciona un empleo',
    start_interview: 'Iniciar Entrevista',

    // Analytics
    analytics_title: 'Analíticas',
    conversion_rate: 'Tasa de Conversión',
    hiring_funnel: 'Embudo de Contratación',
    activity_over_time: 'Actividad en el Tiempo',

    // Common
    cancel: 'Cancelar',
    add: 'Añadir',
    delete: 'Eliminar',
    save: 'Guardar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',

    // Messages
    no_jobs: 'No hay empleos aún. ¡Agrega uno para empezar!',
    import_success: 'Se importaron {count} empleos',
    export_success: 'Datos exportados exitosamente',
    copied: '¡Copiado al portapapeles!',
  },
  en: {
    // Navigation
    home: 'Home',
    board: 'Board',
    analytics: 'Analytics',
    optimizer: 'Optimizer',
    simulator: 'Simulator',

    // Home
    hero_title: 'Open Source Suite for Your Job Search',
    hero_subtitle: 'Replace expensive SaaS tools with free, private, AI-powered alternatives.',
    get_started: 'Get Started',

    // Kanban Board
    kanban_title: 'Job Applications Board',
    jobs_tracked: 'Jobs Tracked',
    new_job: 'New Job',
    import_offers: 'Import Offers',
    export_data: 'Export Data',
    import_data: 'Import Data',
    settings: 'Settings',

    // Job statuses
    wishlist: 'To Apply',
    applied: 'Applied',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',

    // CV Optimizer
    cv_optimizer: 'CV Optimizer',
    cv_subtitle: 'Turn your CV into an interview magnet using AI.',
    upload_pdf: 'Upload your CV in PDF',
    paste_text: 'OR PASTE TEXT',
    your_cv: 'Your Current CV',
    job_description: 'Job Description (Optional)',
    analyze_cv: 'Analyze & Fix',
    analyzing: 'Analyzing...',
    waiting_analysis: 'Waiting for analysis...',
    optimized_cv: 'Optimized CV',
    copy: 'Copy',
    score: 'SCORE',
    critical_feedback: 'Critical Feedback',

    // Interview Simulator
    interview_simulator: 'Interview Simulator',
    simulator_subtitle: 'Practice interviews with a virtual recruiter.',
    select_job: 'Select a job',
    start_interview: 'Start Interview',

    // Analytics
    analytics_title: 'Analytics',
    conversion_rate: 'Conversion Rate',
    hiring_funnel: 'Hiring Funnel',
    activity_over_time: 'Activity Over Time',

    // Common
    cancel: 'Cancel',
    add: 'Add',
    delete: 'Delete',
    save: 'Save',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',

    // Messages
    no_jobs: 'No jobs yet. Add one to get started!',
    import_success: 'Imported {count} jobs',
    export_success: 'Data exported successfully',
    copied: 'Copied to clipboard!',
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('nidius_language');
    return saved || 'es';
  });

  useEffect(() => {
    localStorage.setItem('nidius_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key, params = {}) => {
    let text = translations[language][key] || key;

    // Replace parameters like {count}
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });

    return text;
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'es' ? 'en' : 'es'));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
