import { useState, useEffect } from 'react';
import './ApprovalQueue.css';

function ApprovalQueue({ onStats }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minScore, setMinScore] = useState(70);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, [minScore]);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/matches/queue?min_score=${minScore}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar matches');
      }

      const data = await response.json();
      setMatches(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (matchId, decision) => {
    setProcessing(matchId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/matches/${matchId}/decide`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ decision }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar decisión');
      }

      // Remove from queue
      setMatches(matches.filter(m => m.id !== matchId));

      // Fetch updated stats
      if (onStats) {
        fetchStats();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/matches/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const stats = await response.json();
        if (onStats) onStats(stats);
      }
    } catch (err) {
      // Ignore stats errors
    }
  };

  const getScoreColor = score => {
    if (score >= 85) return 'score-excellent';
    if (score >= 75) return 'score-great';
    if (score >= 65) return 'score-good';
    return 'score-fair';
  };

  const getScoreLabel = score => {
    if (score >= 85) return '🔥 Excelente';
    if (score >= 75) return '✨ Muy Bueno';
    if (score >= 65) return '👍 Bueno';
    return '⭐ Aceptable';
  };

  if (loading) {
    return (
      <div className="approval-queue-container">
        <div className="loading">
          <div className="progress-spinner"></div>
          <p>Cargando matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="approval-queue-container">
        <div className="error-message">
          ⚠️ {error}
          <button onClick={fetchMatches}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="approval-queue-container">
      <div className="queue-header">
        <div>
          <h2>✅ Cola de Aprobación</h2>
          <p>Revisa y aprueba los mejores matches encontrados</p>
        </div>
        <div className="queue-stats">
          <span className="stat-badge">{matches.length} matches</span>
        </div>
      </div>

      <div className="queue-filters">
        <label>
          Puntaje mínimo:
          <select value={minScore} onChange={e => setMinScore(Number(e.target.value))}>
            <option value={60}>60+</option>
            <option value={70}>70+</option>
            <option value={80}>80+</option>
            <option value={90}>90+</option>
          </select>
        </label>
        <button className="refresh-button" onClick={fetchMatches}>
          🔄 Actualizar
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No hay matches pendientes</h3>
          <p>Ajusta el filtro o espera a que se analicen más trabajos</p>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map(match => (
            <div key={match.id} className="match-card">
              {match.match_score >= 85 && <div className="recommended-badge">⭐ Recomendado</div>}

              <div className="match-header">
                <div className="job-info">
                  <h3>{match.job.title}</h3>
                  <p className="company">{match.job.company}</p>
                  <p className="location">{match.job.location}</p>
                </div>
                <div className={`match-score ${getScoreColor(match.match_score)}`}>
                  <div className="score-value">{Math.round(match.match_score)}</div>
                  <div className="score-label">{getScoreLabel(match.match_score)}</div>
                </div>
              </div>

              <div className="profile-used">
                <span className="profile-badge">
                  {match.cv_profile.profile_type === 'frontend' && '🎨'}
                  {match.cv_profile.profile_type === 'backend' && '⚙️'}
                  {match.cv_profile.profile_type === 'fullstack' && '🔧'}
                  {match.cv_profile.profile_name}
                </span>
              </div>

              {match.skill_match_details && (
                <div className="skills-match">
                  <div className="skills-section">
                    <h4>✅ Skills que coinciden</h4>
                    <div className="skill-tags">
                      {match.skill_match_details.matched?.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="skill-tag matched">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {match.skill_match_details.missing?.length > 0 && (
                    <div className="skills-section">
                      <h4>⚠️ Skills faltantes</h4>
                      <div className="skill-tags">
                        {match.skill_match_details.missing.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="skill-tag missing">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="match-reasoning">
                <h4>💡 Análisis IA</h4>
                <p>{match.match_reasoning}</p>
              </div>

              <div className="match-actions">
                <button
                  className="action-approve"
                  onClick={() => handleDecision(match.id, 'approved')}
                  disabled={processing === match.id}
                >
                  {processing === match.id ? 'Procesando...' : '✓ Aprobar'}
                </button>
                <button
                  className="action-reject"
                  onClick={() => handleDecision(match.id, 'rejected')}
                  disabled={processing === match.id}
                >
                  ✗ Rechazar
                </button>
                <button className="action-details" onClick={() => setSelectedMatch(match)}>
                  👁️ Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMatch && (
        <div className="modal-overlay" onClick={() => setSelectedMatch(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles del Match</h3>
              <button className="modal-close" onClick={() => setSelectedMatch(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="job-details">
                <h2>{selectedMatch.job.title}</h2>
                <p className="company">{selectedMatch.job.company}</p>
                <p className="location">{selectedMatch.job.location}</p>

                <div className="score-breakdown">
                  <h4>Puntaje de Match</h4>
                  <div className="score-bar-container">
                    <div
                      className={`score-bar ${getScoreColor(selectedMatch.match_score)}`}
                      style={{ width: `${selectedMatch.match_score}%` }}
                    >
                      {Math.round(selectedMatch.match_score)}%
                    </div>
                  </div>
                </div>

                {selectedMatch.job.description && (
                  <div className="job-description">
                    <h4>Descripción</h4>
                    <p>{selectedMatch.job.description}</p>
                  </div>
                )}

                {selectedMatch.job.required_skills?.length > 0 && (
                  <div className="required-skills">
                    <h4>Skills Requeridos</h4>
                    <div className="skill-tags">
                      {selectedMatch.job.required_skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-details">
                <h4>Perfil Utilizado</h4>
                <div className="profile-card-mini">
                  <h5>{selectedMatch.cv_profile.profile_name}</h5>
                  <p>{selectedMatch.cv_profile.summary}</p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="action-approve"
                onClick={() => {
                  handleDecision(selectedMatch.id, 'approved');
                  setSelectedMatch(null);
                }}
              >
                ✓ Aprobar
              </button>
              <button
                className="action-reject"
                onClick={() => {
                  handleDecision(selectedMatch.id, 'rejected');
                  setSelectedMatch(null);
                }}
              >
                ✗ Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovalQueue;
