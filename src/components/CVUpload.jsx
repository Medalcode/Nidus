import { useState, useEffect } from 'react';
import './CVUpload.css';

function CVUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [cvData, setCvData] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = e => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = file => {
    // Validate file type
    const validTypes = ['text/plain', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.txt')) {
      setError('Por favor sube un archivo PDF o TXT');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es muy grande. Máximo 5MB.');
      return;
    }

    setFile(file);
    setError(null);
  };

  const uploadCV = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/cv/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al subir CV');
      }

      const data = await response.json();

      // Auto-extract after upload
      await extractCV();
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  };

  const extractCV = async () => {
    setExtracting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/cv/extract', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al extraer datos del CV');
      }

      const result = await response.json();
      setCvData(result.data);

      setUploading(false);
      setExtracting(false);

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(result.data);
      }
    } catch (err) {
      setError(err.message);
      setUploading(false);
      setExtracting(false);
    }
  };

  return (
    <div className="cv-upload-container">
      {!cvData ? (
        <>
          <div className="cv-upload-header">
            <h2>📄 Sube tu CV</h2>
            <p>Comenzaremos extrayendo tus datos con IA</p>
          </div>

          <form
            className={`cv-upload-form ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onSubmit={e => e.preventDefault()}
          >
            <div className="upload-zone">
              {!file ? (
                <>
                  <div className="upload-icon">📎</div>
                  <p className="upload-text">Arrastra tu CV aquí o haz click para seleccionar</p>
                  <p className="upload-hint">Formatos soportados: PDF, TXT • Máximo 5MB</p>
                  <input
                    type="file"
                    id="cv-file"
                    accept=".pdf,.txt,text/plain,application/pdf"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="cv-file" className="upload-button">
                    Seleccionar Archivo
                  </label>
                </>
              ) : (
                <div className="file-selected">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button
                    className="file-remove"
                    onClick={() => setFile(null)}
                    disabled={uploading}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {error && <div className="upload-error">⚠️ {error}</div>}

            {file && !uploading && (
              <button className="upload-submit" onClick={uploadCV} disabled={!file}>
                Subir y Extraer Datos
              </button>
            )}

            {uploading && (
              <div className="upload-progress">
                <div className="progress-spinner"></div>
                <p className="progress-text">
                  {extracting ? 'Extrayendo datos con IA...' : 'Subiendo CV...'}
                </p>
                <p className="progress-hint">Esto puede tomar 10-15 segundos</p>
              </div>
            )}
          </form>
        </>
      ) : (
        <div className="cv-extracted">
          <div className="extracted-header">
            <div className="success-icon">✅</div>
            <h3>CV Extraído Exitosamente</h3>
          </div>

          <div className="extracted-data">
            <div className="data-section">
              <h4>📋 Información Personal</h4>
              {cvData.personal_info && (
                <div className="data-grid">
                  <div>
                    <strong>Nombre:</strong> {cvData.personal_info.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {cvData.personal_info.email}
                  </div>
                  <div>
                    <strong>Teléfono:</strong> {cvData.personal_info.phone}
                  </div>
                  <div>
                    <strong>Ubicación:</strong> {cvData.personal_info.location}
                  </div>
                </div>
              )}
            </div>

            <div className="data-section">
              <h4>🛠️ Skills ({cvData.skills?.length || 0})</h4>
              <div className="skills-list">
                {cvData.skills?.slice(0, 10).map((skill, idx) => (
                  <span key={idx} className="skill-tag">
                    {skill}
                  </span>
                ))}
                {cvData.skills?.length > 10 && (
                  <span className="skill-tag more">+{cvData.skills.length - 10} más</span>
                )}
              </div>
            </div>

            <div className="data-section">
              <h4>💼 Experiencia ({cvData.experience?.length || 0} empresas)</h4>
              {cvData.experience?.slice(0, 3).map((exp, idx) => (
                <div key={idx} className="experience-item">
                  <strong>{exp.company}</strong> - {exp.role}
                  <span className="duration">{exp.duration}</span>
                </div>
              ))}
            </div>

            <div className="data-section">
              <h4>🎓 Educación</h4>
              {cvData.education?.map((edu, idx) => (
                <div key={idx} className="education-item">
                  <strong>{edu.degree}</strong>
                  <div>
                    {edu.institution} ({edu.year})
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="extracted-actions">
            <button
              className="action-primary"
              onClick={() => {
                // Navigate to profile generation
                if (onUploadComplete) {
                  onUploadComplete(cvData);
                }
              }}
            >
              Generar Perfiles →
            </button>
            <button
              className="action-secondary"
              onClick={() => {
                setFile(null);
                setCvData(null);
              }}
            >
              Subir Nuevo CV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CVUpload;
