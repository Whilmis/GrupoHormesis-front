import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import './login.css';

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu correo electrónico...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No se encontró un token válido en el enlace.');
      return;
    }

    apiClient<{ message: string }>(`/auth/confirm-email?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'El enlace es inválido o ha expirado.');
      });
  }, [token]);

  return (
    <div className="login-page">
      <div className="login-form-container" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <motion.div 
          className="login-form-wrapper"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', padding: '3rem', maxWidth: '400px' }}
        >
          {status === 'loading' && (
            <div style={{ color: '#3b82f6', marginBottom: '1.5rem' }}>
              <Loader2 size={48} className="lucide-spin" style={{ animation: 'spin 2s linear infinite' }} />
            </div>
          )}
          
          {status === 'success' && (
            <div style={{ color: '#10b981', marginBottom: '1.5rem' }}>
              <CheckCircle size={48} />
            </div>
          )}

          {status === 'error' && (
            <div style={{ color: '#ef4444', marginBottom: '1.5rem' }}>
              <XCircle size={48} />
            </div>
          )}

          <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '1rem' }}>
            {status === 'loading' ? 'Verificando...' : status === 'success' ? '¡Correo verificado!' : 'Error de verificación'}
          </h2>
          
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            {message}
          </p>

          {status !== 'loading' && (
            <Link to="/login" className="login-submit" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none' }}>
              Ir a iniciar sesión
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
}
