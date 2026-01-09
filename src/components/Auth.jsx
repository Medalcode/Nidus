import { useState } from 'react';
import { User, Mail, Lock, LogIn, UserPlus, X } from 'lucide-react';
import api from '../utils/api';
import './Auth.css';

export default function Auth({ onAuthSuccess, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      
      if (mode === 'register') {
        if (!formData.fullName.trim()) {
          setError('Por favor ingresa tu nombre completo');
          setLoading(false);
          return;
        }
        
        result = await api.auth.register(
          formData.email,
          formData.password,
          formData.fullName
        );
      } else {
        result = await api.auth.login(
          formData.email,
          formData.password
        );
      }

      // Success
      if (onAuthSuccess) {
        onAuthSuccess(result.user);
      }
      
    } catch (err) {
      setError(err.message || 'Error al autenticar');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="auth-header">
          <div className="auth-icon">
            {mode === 'login' ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
          <h2>{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
          <p>
            {mode === 'login' 
              ? 'Accede a tu cuenta de Nidus Suite' 
              : 'Crea una cuenta para sincronizar tus datos'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label>
                <User size={18} />
                <span>Nombre Completo</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Juan Pérez"
                required={mode === 'register'}
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label>
              <Mail size={18} />
              <span>Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={18} />
              <span>Contraseña</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {mode === 'register' && (
              <small>Mínimo 6 caracteres</small>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Procesando...
              </>
            ) : (
              <>
                {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            {' '}
            <button onClick={toggleMode} className="toggle-mode">
              {mode === 'login' ? 'Crear una' : 'Iniciar sesión'}
            </button>
          </p>
        </div>

        <div className="auth-info">
          <p>
            🔒 Tus datos están seguros. Usamos encriptación bcrypt y tokens JWT.
          </p>
        </div>
      </div>
    </div>
  );
}
