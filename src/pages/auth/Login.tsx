import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';
import SEO from '../../components/SEO';
import './login.css';

// Simple inline SVG icons for Google & Microsoft to avoid extra dependencies
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
    </svg>
  );
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      navigate('/portal'); // Redirige al root del portal, PortalRedirect se encarga del resto
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error inesperado al intentar iniciar sesión.');
      }
    }
  };

  return (
    <div className="login-page">
      <SEO title="Iniciar Sesión | Grupo Hormesis" noIndex={true} />
      {/* Left Branding Panel */}
      <div className="login-branding">
        <div className="login-orbs">
          <div className="l-orb l-orb-1"></div>
          <div className="l-orb l-orb-2"></div>
          <div className="l-orb l-orb-3"></div>
        </div>

        <motion.div
          className="login-branding-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <img src="/logo.png" alt="Grupo Hormesis" className="login-logo" />
          <h2 className="login-branding-title">
            Portal de Gestión <span className="text-emerald">Empresarial</span>
          </h2>
          <p className="login-branding-subtitle">
            Accede a tus proyectos, métricas en tiempo real, workflows automatizados y herramientas de gestión desde un solo lugar.
          </p>

          <div className="login-trust-badges">
            <div className="trust-badge-item">
              <span className="trust-badge-number">50+</span>
              <span className="trust-badge-label">Empresas</span>
            </div>
            <div className="trust-badge-item">
              <span className="trust-badge-number">99.9%</span>
              <span className="trust-badge-label">Uptime</span>
            </div>
            <div className="trust-badge-item">
              <span className="trust-badge-number">256-bit</span>
              <span className="trust-badge-label">Encriptación</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Form Panel */}
      <div className="login-form-panel">
        <Link to="/" className="login-back-link">
          <ArrowLeft size={15} />
          Volver al sitio
        </Link>

        {/* Mobile-only logo */}
        <div className="login-mobile-logo">
          <img src="/logo.png" alt="Grupo Hormesis" />
          <span>Grupo Hormesis</span>
        </div>

        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="login-card-header">
            <h1>Iniciar Sesión</h1>
            <p>Ingresa tus credenciales para acceder al portal</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email">Email Corporativo</label>
              <div className="login-input-wrapper">
                <Mail size={17} className="field-icon" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="tu@empresa.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="login-password">Contraseña</label>
              <div className="login-input-wrapper">
                <Lock size={17} className="field-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                Recordarme
              </label>
              <button type="button" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit */}
            <button type="submit" className="login-submit" disabled={isLoading}>
              <LogIn size={18} />
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>

            {/* Divider */}
            <div className="login-divider">
              <span>o continuar con</span>
            </div>

            {/* Social Buttons */}
            <div className="login-social-buttons">
              <button type="button" className="social-btn">
                <GoogleIcon />
                Google
              </button>
              <button type="button" className="social-btn">
                <MicrosoftIcon />
                Microsoft
              </button>
            </div>
          </form>
        </motion.div>

        <div className="login-footer">
          ¿No tienes cuenta?{' '}
          <Link to="/registro">Crear cuenta <ArrowRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /></Link>
        </div>
      </div>
    </div>
  );
}
