import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Building2, 
  User, 
  Loader2, 
  ExternalLink, 
  Tag, 
  Share2, 
  CheckCircle2, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../../../api/client';

interface FormSubmission {
  id: string;
  workflowId: string;
  name?: string;
  email?: string;
  payload: any;
  referredByUserId?: string;
  referredBy?: {
    id: string;
    name: string;
    email: string;
  };
  workflow?: {
    id: string;
    name: string;
    project?: {
      id: string;
      name: string;
    };
  };
  createdAt: string;
}

export default function ColaboradorForms() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/forms');
      setSubmissions(data || []);
    } catch (err: any) {
      console.error('Error cargando respuestas de formularios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (s.name || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const payloadStr = JSON.stringify(s.payload || {}).toLowerCase();
    const wfName = (s.workflow?.name || '').toLowerCase();
    return name.includes(q) || email.includes(q) || payloadStr.includes(q) || wfName.includes(q);
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={26} color="#6366f1" />
            Formularios y respuestas entrantes
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Revisa las respuestas enviadas por empresas a través de los formularios de contacto y respuestas al correo automatizado.
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          style={{ background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.55rem 1.1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Buscador */}
      <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Search size={18} color="#64748b" />
        <input
          type="text"
          placeholder="Buscar por nombre, email, empresa o contenido del mensaje..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0f172a' }}
        />
      </div>

      {/* Lista de Envíos */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 className="spinner" size={32} color="#6366f1" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ color: '#64748b' }}>Cargando formularios recibidos...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div style={{ background: 'white', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <FileText size={40} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ fontWeight: 600, color: '#334155', fontSize: '1.05rem', margin: '0 0 0.5rem 0' }}>No hay formularios registrados</p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Las respuestas que envíen los clientes en tus sitios web o correos aparecerán aquí automáticamente.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredSubmissions.map(sub => {
            const payload = sub.payload || {};
            const company = payload.businessName || payload.company || payload.empresa;
            const phone = payload.phone || payload.telefono || payload.movil;
            const message = payload.message || payload.mensaje || payload.comments || payload.description;

            return (
              <div
                key={sub.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 700, padding: '3px 9px', borderRadius: '20px' }}>
                      {sub.workflow?.name || 'Formulario Web'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {new Date(sub.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
                    {sub.name || 'Remitente sin nombre'}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
                    {company && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={14} color="#64748b" />
                        <strong>{company}</strong>
                      </div>
                    )}
                    {sub.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="#64748b" />
                        <a href={`mailto:${sub.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{sub.email}</a>
                      </div>
                    )}
                    {phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="#64748b" />
                        <a href={`tel:${phone}`} style={{ color: '#475569', textDecoration: 'none' }}>{phone}</a>
                      </div>
                    )}
                  </div>

                  {/* Mensaje extracto */}
                  {message && (
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155', fontStyle: 'italic', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                      "{typeof message === 'string' ? message : JSON.stringify(message)}"
                    </div>
                  )}

                  {/* Referido por */}
                  {sub.referredBy && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '4px', width: 'fit-content' }}>
                      <Share2 size={12} /> Referido por: <strong>{sub.referredBy.name}</strong>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                  <button
                    onClick={() => setSelectedSubmission(sub)}
                    style={{
                      flex: 1,
                      background: '#0f172a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.55rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Ver todo el envío
                  </button>

                  {phone && (
                    <a
                      href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#25d366',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.55rem 0.85rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Contactar por WhatsApp"
                    >
                      <MessageSquare size={14} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE DETALLE COMPLETO DEL FORMULARIO */}
      {selectedSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a', fontWeight: 800 }}>
                  Detalle del envío
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {new Date(selectedSubmission.createdAt).toLocaleString('es-ES')}
                </span>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem' }}>Datos principales:</strong>
                <p style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}><strong>Nombre:</strong> {selectedSubmission.name || 'N/A'}</p>
                <p style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}><strong>Email:</strong> {selectedSubmission.email || 'N/A'}</p>
                {selectedSubmission.workflow && (
                  <p style={{ margin: 0, color: '#0f172a' }}><strong>Workflow de origen:</strong> {selectedSubmission.workflow.name}</p>
                )}
              </div>

              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  Campos y respuestas completas (payload JSON):
                </strong>
                <pre style={{
                  background: '#0f172a',
                  color: '#e2e8f0',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  overflowX: 'auto',
                  lineHeight: 1.5
                }}>
                  {JSON.stringify(selectedSubmission.payload, null, 2)}
                </pre>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
