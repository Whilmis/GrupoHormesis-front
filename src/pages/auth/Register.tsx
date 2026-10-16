import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, UserPlus, User, Building2, Briefcase, Users, Share2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';
import SEO from '../../components/SEO';
import './login.css';
import './register.css';

type UserRole = 'cliente' | 'colaborador';

function getPasswordStrength(password: string): { level: number; label: string; className: string } {
  if (!password) return { level: 0, label: '', className: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Débil', className: 'weak' };
  if (score <= 2) return { level: 2, label: 'Media', className: 'medium' };
  if (score <= 3) return { level: 3, label: 'Buena', className: 'medium' };
  return { level: 4, label: 'Fuerte', className: 'strong' };
}

export default function Register() {
  const [searchParams] = useSearchParams();
  const isColaboradorRef = searchParams.get('role') === 'colaborador';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<UserRole>(isColaboradorRef ? 'colaborador' : 'cliente');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [joinWhatsapp, setJoinWhatsapp] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await register({ name, empresa: company, email, phone, joinWhatsapp, password, role });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error inesperado al intentar registrarte.');
      }
    }
  };

  if (success) {
    return (
      <div className="login-page">
        <div className="login-form-container" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <motion.div 
            className="login-form-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '3rem' }}
          >
            <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', marginBottom: '1.5rem' }}>
              <Mail size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '1rem' }}>¡Registro exitoso!</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              Hemos enviado un enlace de confirmación a <strong>{email}</strong>.
              Por favor, revisa tu bandeja de entrada (y la carpeta de spam) para activar tu cuenta.
            </p>
            <Link to="/login" className="login-submit" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none' }}>
              Ir a iniciar sesión
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <SEO title="Crear cuenta | Grupo Hormesis" noIndex={true} />
      {/* Left Branding Panel — reuses login branding layout */}
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
            Únete al <span className="text-emerald">Ecosistema</span>
          </h2>
          <p className="login-branding-subtitle">
            Crea tu cuenta para acceder a herramientas de gestión, seguimiento de proyectos y colaboración en tiempo real con nuestro equipo.
          </p>

          <div className="login-trust-badges">
            <div className="trust-badge-item">
              <span className="trust-badge-number">2 min</span>
              <span className="trust-badge-label">Registro</span>
            </div>
            <div className="trust-badge-item">
              <span className="trust-badge-number">Gratis</span>
              <span className="trust-badge-label">Sin tarjeta</span>
            </div>
            <div className="trust-badge-item">
              <span className="trust-badge-number">24/7</span>
              <span className="trust-badge-label">Soporte</span>
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
          className="login-card register-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="login-card-header">
            <h1>{isColaboradorRef ? 'Registro de colaborador' : 'Crear cuenta'}</h1>
            <p>{isColaboradorRef ? 'Únete a nuestro sistema de referidos y gana comisiones' : 'Completa tus datos para unirte al portal'}</p>
          </div>

          {isColaboradorRef && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
              border: '1.5px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              padding: '0.9rem 1.1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}>
              <div style={{ background: '#10b981', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Share2 size={18} />
              </div>
              <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.9rem', marginBottom: '2px' }}>
                  Sistema de referidos y afiliados
                </strong>
                Al registrarte obtendrás tu enlace y código único para referir clientes, dar seguimiento en el portal y monetizar con Grupo Hormesis.
              </div>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {/* Role Selector */}
            <div className="login-field">
              <label>Tipo de cuenta</label>
              <div className="role-selector">
                <div
                  className={`role-card ${role === 'cliente' ? 'selected' : ''}`}
                  onClick={() => setRole('cliente')}
                >
                  <input
                    type="radio"
                    name="role"
                    value="cliente"
                    checked={role === 'cliente'}
                    onChange={() => setRole('cliente')}
                  />
                  <div className="role-card-icon">
                    <Briefcase size={18} />
                  </div>
                  <span className="role-card-label">Cliente</span>
                  <span className="role-card-desc">Gestiona tus proyectos y métricas</span>
                </div>

                <div
                  className={`role-card ${role === 'colaborador' ? 'selected' : ''}`}
                  onClick={() => setRole('colaborador')}
                >
                  <input
                    type="radio"
                    name="role"
                    value="colaborador"
                    checked={role === 'colaborador'}
                    onChange={() => setRole('colaborador')}
                  />
                  <div className="role-card-icon">
                    <Users size={18} />
                  </div>
                  <span className="role-card-label">Colaborador</span>
                  <span className="role-card-desc">Accede a workflows y tareas</span>
                </div>
              </div>
            </div>

            {/* Name + Company row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="login-field">
                <label htmlFor="reg-name">Nombre completo</label>
                <div className="login-input-wrapper">
                  <User size={17} className="field-icon" />
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="Tu nombre"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div className="login-field">
                <label htmlFor="reg-company">Empresa</label>
                <div className="login-input-wrapper">
                  <Building2 size={17} className="field-icon" />
                  <input
                    id="reg-company"
                    type="text"
                    placeholder="Tu empresa"
                    required
                    autoComplete="organization"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Email + Phone row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="login-field">
                <label htmlFor="reg-email">Email corporativo</label>
                <div className="login-input-wrapper">
                  <Mail size={17} className="field-icon" />
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="tu@empresa.com"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="login-field">
                <label htmlFor="reg-phone">Teléfono <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 400 }}>(opcional)</span></label>
                <div className="login-input-wrapper">
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="reg-password">Contraseña</label>
              <div className="login-input-wrapper">
                <Lock size={17} className="field-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  autoComplete="new-password"
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
              {/* Strength bar */}
              {password && (
                <div>
                  <div className="password-strength">
                    {[1, 2, 3, 4].map((seg) => (
                      <div
                        key={seg}
                        className={`strength-segment ${seg <= strength.level ? `active ${strength.className}` : ''}`}
                      />
                    ))}
                  </div>
                  <span className={`strength-label ${strength.className}`}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="login-field">
              <label htmlFor="reg-confirm">Confirmar contraseña</label>
              <div className="login-input-wrapper">
                <Lock size={17} className="field-icon" />
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms and Whatsapp */}
            <div className="terms-check" style={{ marginBottom: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="whatsapp" 
                checked={joinWhatsapp}
                onChange={(e) => setJoinWhatsapp(e.target.checked)}
              />
              <label htmlFor="whatsapp">
                Quiero unirme a la comunidad de WhatsApp de Grupo Hormesis <span style={{ color: '#64748b', fontSize: '0.75rem' }}>(opcional)</span>
              </label>
            </div>
            <div className="terms-check">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                Acepto los <a href="#">términos de servicio</a> y la <a href="#">política de privacidad</a> de Grupo Hormesis.
              </label>
            </div>

            {/* Submit */}
            <button type="submit" className="login-submit" disabled={isLoading}>
              <UserPlus size={18} />
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </motion.div>

        <div className="login-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}
