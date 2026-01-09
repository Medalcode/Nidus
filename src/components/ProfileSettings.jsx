import { useState, useEffect } from 'react';
import { Save, FileText, User } from 'lucide-react';
import api from '../utils/api';

export default function ProfileSettings({ isOpen, onClose }) {
<<<<<<< Updated upstream
  const [apiKey, setApiKey] = useState('');
=======
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
>>>>>>> Stashed changes
  const [bio, setBio] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
<<<<<<< Updated upstream
    const storedKey = localStorage.getItem('openhire_groq_key');
    const storedBio = localStorage.getItem('openhire_user_bio');
    if (storedKey) setApiKey(storedKey);
    if (storedBio) setBio(storedBio);
  }, []);

  const handleSave = () => {
    localStorage.setItem('openhire_groq_key', apiKey);
    localStorage.setItem('openhire_user_bio', bio);
=======
    const loadProfile = async () => {
      // Try to load from backend if authenticated
      if (api.isAuthenticated()) {
        try {
          const profile = await api.profile.get();
          setFullName(profile.full_name || '');
          setEmail(profile.email || '');
          setBio(profile.bio || '');
        } catch (error) {
          console.error('Error loading profile:', error);
          // Fallback to localStorage
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
    };
    
    const loadFromLocalStorage = () => {
      const storedBio = localStorage.getItem('openhire_user_bio');
      const storedName = localStorage.getItem('openhire_user_name');
      const storedEmail = localStorage.getItem('openhire_user_email');
      
      if (storedBio) setBio(storedBio);
      if (storedName) setFullName(storedName);
      if (storedEmail) setEmail(storedEmail);
    };
    
    loadProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    
    // Save to localStorage as backup
    localStorage.setItem('openhire_user_bio', bio);
    localStorage.setItem('openhire_user_name', fullName);
    localStorage.setItem('openhire_user_email', email);
    
    // Sync to backend if authenticated
    if (api.isAuthenticated()) {
      try {
        await api.profile.update({
          full_name: fullName,
          email: email,
          bio: bio,
          raw_cv_text: bio // Simplification for now
        });
      } catch (e) {
        console.error("Error syncing to backend:", e);
        setError('Error al sincronizar con el servidor');
      }
    }

>>>>>>> Stashed changes
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content profile-modal">
        <div className="modal-header">
          <h2><User size={24} /> Configura tu Perfil</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {error && (
          <div style={{ padding: '1rem', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '8px', marginBottom: '1rem', color: '#f87171' }}>
            {error}
          </div>
        )}
        
        <div className="settings-section">
<<<<<<< Updated upstream
          <h3><Key size={18} /> Groq API Key (Gratis)</h3>
          <p className="helper-text">
            Obtén tu key gratis en <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">console.groq.com</a>. 
            Se guarda localmente en tu navegador.
          </p>
          <input 
            type="password" 
            placeholder="gsk_..." 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="input-dark"
          />
=======
          <h3><User size={18} /> Datos Personales (Para el Bot)</h3>
          <p className="helper-text">Necesarios para que el agente rellene formularios por ti.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Nombre Completo" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-dark"
            />
            <input 
              type="email" 
              placeholder="Email Profesional" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-dark"
            />
          </div>
>>>>>>> Stashed changes
        </div>

        <div className="settings-section">
          <h3><FileText size={18} /> Tu Perfil Profesional</h3>
          <p className="helper-text">
<<<<<<< Updated upstream
            Pega aquí un resumen de tu CV o experiencia. La IA usará esto para personalizar tus cartas.
=======
            Pega aquí un resumen de tu CV o experiencia. Esto se usará para el analizador de CV, simulador de entrevistas y generador de cartas.
>>>>>>> Stashed changes
          </p>
          <textarea 
            placeholder="Soy un Desarrollador Frontend con 3 años de experiencia en React. Me especializo en..." 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="textarea-dark"
            rows={6}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {saved ? '¡Guardado!' : loading ? 'Guardando...' : <><Save size={18} /> Guardar Configuración</>}
          </button>
        </div>
      </div>
    </div>
  );
}
