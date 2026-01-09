import { useState, useEffect } from 'react';
import './ProfileGenerator.css';

function ProfileGenerator({ cvData, onProfilesGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState(['frontend', 'backend', 'fullstack']);

  const profileOptions = [
    {
      value: 'frontend',
      label: 'Frontend Developer',
      icon: '🎨',
      description: 'React, Vue, Angular, UI/UX',
    },
    {
      value: 'backend',
      label: 'Backend Engineer',
      icon: '⚙️',
      description: 'Python, Node.js, APIs, Databases',
    },
    {
      value: 'fullstack',
      label: 'Fullstack Developer',
      icon: '🔧',
      description: 'Full stack MERN, Django, etc.',
    },
    {
      value: 'devops',
      label: 'DevOps Engineer',
      icon: '🚀',
      description: 'Docker, K8s, CI/CD, Cloud',
    },
  ];

  const toggleProfileType = type => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      if (selectedTypes.length < 3) {
        setSelectedTypes([...selectedTypes, type]);
      }
    }
  };

  const generateProfiles = async () => {
    if (selectedTypes.length === 0) {
      setError('Selecciona al menos un tipo de perfil');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/cv/generate-profiles', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_types: selectedTypes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al generar perfiles');
      }

      const result = await response.json();

      // Fetch generated profiles
      await fetchProfiles();
    } catch (err) {
      setError(err.message);
      setGenerating(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/cv/profiles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener perfiles');
      }

      const data = await response.json();
      setProfiles(data);
      setGenerating(false);

      if (onProfilesGenerated) {
        onProfilesGenerated(data);
      }
    } catch (err) {
      setError(err.message);
      setGenerating(false);
    }
  };

  useEffect(() => {
    // Check if profiles already exist
    fetchProfiles();
  }, []);

  if (profiles.length > 0) {
    return (
      <div className="profile-generator-container">
        <div className="profiles-header">
          <h2>✅ Perfiles Generados</h2>
          <p>Estos son tus perfiles optimizados para diferentes tipos de trabajo</p>
        </div>

        <div className="profiles-grid">
          {profiles.map(profile => (
            <div key={profile.id} className="profile-card">
              <div className="profile-header">
                <span className="profile-icon">
                  {profile.profile_type === 'frontend' && '🎨'}
                  {profile.profile_type === 'backend' && '⚙️'}
                  {profile.profile_type === 'fullstack' && '🔧'}
                  {profile.profile_type === 'devops' && '🚀'}
                </span>
                <h3>{profile.profile_name}</h3>
              </div>

              <div className="profile-summary">
                <p>{profile.summary}</p>
              </div>

              <div className="profile-skills">
                <h4>🛠️ Top Skills</h4>
                <div className="skills-list">
                  {profile.tailored_skills?.slice(0, 8).map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="profile-status">
                <label className="toggle-switch">
                  <input type="checkbox" checked={profile.is_active} readOnly />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">{profile.is_active ? 'Activo' : 'Inactivo'}</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="profiles-actions">
          <button
            className="action-primary"
            onClick={() => onProfilesGenerated && onProfilesGenerated(profiles)}
          >
            Continuar a Trabajos →
          </button>
          <button className="action-secondary" onClick={() => setProfiles([])}>
            Regenerar Perfiles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-generator-container">
      <div className="generator-header">
        <h2>🎯 Genera tus Perfiles</h2>
        <p>Selecciona hasta 3 tipos de perfiles que quieres generar</p>
      </div>

      {cvData && (
        <div className="cv-summary">
          <h3>📋 Datos de tu CV</h3>
          <div className="cv-stats">
            <div className="stat">
              <strong>{cvData.skills?.length || 0}</strong>
              <span>Skills</span>
            </div>
            <div className="stat">
              <strong>{cvData.experience?.length || 0}</strong>
              <span>Empresas</span>
            </div>
            <div className="stat">
              <strong>{cvData.education?.length || 0}</strong>
              <span>Títulos</span>
            </div>
          </div>
        </div>
      )}

      <div className="profile-types">
        {profileOptions.map(option => (
          <div
            key={option.value}
            className={`profile-type-card ${
              selectedTypes.includes(option.value) ? 'selected' : ''
            }`}
            onClick={() => toggleProfileType(option.value)}
          >
            <div className="type-icon">{option.icon}</div>
            <h3>{option.label}</h3>
            <p>{option.description}</p>
            {selectedTypes.includes(option.value) && <div className="selected-badge">✓</div>}
          </div>
        ))}
      </div>

      <div className="generator-info">
        <p>
          <strong>Seleccionados:</strong> {selectedTypes.length}/3
        </p>
        <p className="info-text">
          La IA generará perfiles optimizados enfatizando diferentes skills según el tipo
        </p>
      </div>

      {error && <div className="generator-error">⚠️ {error}</div>}

      {!generating ? (
        <button
          className="generate-button"
          onClick={generateProfiles}
          disabled={selectedTypes.length === 0}
        >
          Generar Perfiles con IA
        </button>
      ) : (
        <div className="generating">
          <div className="progress-spinner"></div>
          <p className="progress-text">Generando perfiles...</p>
          <p className="progress-hint">Esto puede tomar 20-30 segundos</p>
        </div>
      )}
    </div>
  );
}

export default ProfileGenerator;
