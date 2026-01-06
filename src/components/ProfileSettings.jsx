import { useState, useEffect } from 'react';
import { Save, Key, FileText, User } from 'lucide-react';

export default function ProfileSettings({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [bio, setBio] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('openhire_groq_key');
    const storedBio = localStorage.getItem('openhire_user_bio');
    if (storedKey) setApiKey(storedKey);
    if (storedBio) setBio(storedBio);
  }, []);

  const handleSave = () => {
    localStorage.setItem('openhire_groq_key', apiKey);
    localStorage.setItem('openhire_user_bio', bio);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content profile-modal">
        <div className="modal-header">
          <h2><User size={24} /> Configura tu Asistente IA</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="settings-section">
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
        </div>

        <div className="settings-section">
          <h3><FileText size={18} /> Tu Perfil Profesional</h3>
          <p className="helper-text">
            Pega aquí un resumen de tu CV o experiencia. La IA usará esto para personalizar tus cartas.
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
          <button className="btn-primary" onClick={handleSave}>
            {saved ? '¡Guardado!' : <><Save size={18} /> Guardar Configuración</>}
          </button>
        </div>
      </div>
    </div>
  );
}
