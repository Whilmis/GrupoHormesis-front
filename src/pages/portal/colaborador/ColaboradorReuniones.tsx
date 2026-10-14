import React, { useEffect, useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Video, 
  Building2, 
  Globe, 
  Phone, 
  Mail, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  FileSearch,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../../../api/client';

interface Meeting {
  id: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
  endTime: string;
  status: string;
  colaboradorStatus: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'DECLINED';
  notes?: string;
  meetLink?: string;
  calendar?: {
    name: string;
  };
  lead?: {
    id: string;
    businessName: string;
    website?: string;
    phone?: string;
    email?: string;
    metadata?: any;
  };
}

export default function ColaboradorReuniones() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedLeadAudit, setSelectedLeadAudit] = useState<{ name: string; audit: any; leadId: string } | null>(null);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/meetings/colaborador');
      setMeetings(data || []);
    } catch (err: any) {
      console.error('Error cargando reuniones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleConfirm = async (id: string) => {
    try {
      setActionLoading(id);
      await apiClient(`/meetings/${id}/confirm`, { method: 'PUT' });
      await fetchMeetings();
    } catch (err: any) {
      alert('Error confirmando la reunión: ' + (err.message || 'Error del servidor'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas declinar esta reunión? Se devolverá a la cola del equipo.')) {
      return;
    }
    try {
      setActionLoading(id);
      await apiClient(`/meetings/${id}/decline`, { method: 'PUT' });
      await fetchMeetings();
    } catch (err: any) {
      alert('Error al declinar la reunión: ' + (err.message || 'Error del servidor'));
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingMeetings = meetings.filter(m => m.colaboradorStatus === 'PENDING_CONFIRMATION');
  const confirmedMeetings = meetings.filter(m => m.colaboradorStatus === 'CONFIRMED');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CalendarIcon size={26} color="#2563eb" />
            Mis Reuniones & Sesiones Agendadas
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Revisa las sesiones reservadas por tus clientes, confirma tu asistencia y accede a la auditoría técnica previa a la llamada.
          </p>
        </div>
        <button
          onClick={fetchMeetings}
          style={{ background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.55rem 1.1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          🔄 Actualizar
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 className="spinner" size={32} color="#2563eb" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ color: '#64748b' }}>Cargando tus reuniones...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* SECCIÓN 1: INVITACIONES PENDIENTES DE CONFIRMACIÓN */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <AlertCircle size={20} color="#f59e0b" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Invitaciones Pendientes de Confirmar ({pendingMeetings.length})
              </h3>
            </div>

            {pendingMeetings.length === 0 ? (
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                🎉 No tienes invitaciones pendientes por responder. ¡Todo al día!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {pendingMeetings.map(m => {
                  const leadMeta = typeof m.lead?.metadata === 'string' ? JSON.parse(m.lead.metadata) : (m.lead?.metadata || {});
                  const auditReport = leadMeta.aiAuditReport;
                  const hasAudit = auditReport && (auditReport.technicalErrors?.length > 0 || auditReport.detailedAnalysis);

                  return (
                    <div 
                      key={m.id} 
                      style={{ 
                        background: 'white', 
                        borderRadius: '12px', 
                        border: '1.5px solid #fef08a', 
                        boxShadow: '0 4px 12px rgba(234, 179, 8, 0.08)', 
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1.2rem'
                      }}
                    >
                      <div>
                        {/* Cabecera Tarjeta */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <span style={{ background: '#fef9c3', color: '#854d0e', fontSize: '0.75rem', fontWeight: 700, padding: '3px 9px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Requiere tu Confirmación
                          </span>
                          <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} /> {formatDateTime(m.startTime)}
                          </span>
                        </div>

                        {/* Datos del Cliente y Empresa */}
                        <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
                          {m.guestName}
                        </h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: '#475569', marginTop: '0.6rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building2 size={15} color="#64748b" />
                            <strong>{m.lead?.businessName || 'Empresa Prospecto'}</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={15} color="#64748b" />
                            <span>{m.guestEmail}</span>
                          </div>
                          {m.lead?.website && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Globe size={15} color="#64748b" />
                              <a href={m.lead.website} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                                {m.lead.website}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Acceso rápido a auditoría previa */}
                        {hasAudit && (
                          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                            <button
                              onClick={() => setSelectedLeadAudit({ name: m.lead?.businessName || m.guestName, audit: auditReport, leadId: m.lead?.id || '' })}
                              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', width: '100%', justifyContent: 'center' }}
                            >
                              <FileSearch size={14} color="#6366f1" /> Ver Diagnóstico & Maqueta Previa
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Botones de Acción */}
                      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => handleConfirm(m.id)}
                          disabled={actionLoading === m.id}
                          style={{
                            flex: 1,
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.65rem 0.5rem',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: actionLoading === m.id ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                          }}
                        >
                          {actionLoading === m.id ? <Loader2 size={16} className="spinner" /> : <CheckCircle2 size={16} />}
                          Confirmar Asistencia
                        </button>
                        <button
                          onClick={() => handleDecline(m.id)}
                          disabled={actionLoading === m.id}
                          style={{
                            background: '#f8fafc',
                            color: '#ef4444',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '0.65rem 0.85rem',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: actionLoading === m.id ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="No puedo asistir / Reasignar a otro compañero"
                        >
                          <XCircle size={16} /> Reasignar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECCIÓN 2: REUNIONES CONFIRMADAS */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <CheckCircle2 size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Reuniones Confirmadas ({confirmedMeetings.length})
              </h3>
            </div>

            {confirmedMeetings.length === 0 ? (
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                Aún no tienes reuniones confirmadas. Cuando aceptes una invitación aparecerá aquí.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {confirmedMeetings.map(m => {
                  const leadMeta = typeof m.lead?.metadata === 'string' ? JSON.parse(m.lead.metadata) : (m.lead?.metadata || {});
                  const auditReport = leadMeta.aiAuditReport;
                  const hasAudit = auditReport && (auditReport.technicalErrors?.length > 0 || auditReport.detailedAnalysis);

                  return (
                    <div 
                      key={m.id} 
                      style={{ 
                        background: 'white', 
                        borderRadius: '12px', 
                        border: '1px solid #e2e8f0', 
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)', 
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                          <span style={{ background: '#ecfdf5', color: '#047857', fontSize: '0.75rem', fontWeight: 700, padding: '3px 9px', borderRadius: '20px' }}>
                            ✅ Confirmada por ti
                          </span>
                          <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.85rem' }}>
                            {formatDateTime(m.startTime)}
                          </span>
                        </div>

                        <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
                          {m.guestName}
                        </h4>
                        
                        <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
                          Empresa: <strong>{m.lead?.businessName || 'Cliente Particular'}</strong>
                        </div>

                        {/* Botón Google Meet */}
                        {m.meetLink ? (
                          <a
                            href={m.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              background: '#2563eb',
                              color: 'white',
                              textDecoration: 'none',
                              padding: '0.65rem 1rem',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              width: '100%',
                              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                              boxSizing: 'border-box'
                            }}
                          >
                            <Video size={16} /> Entrar a Google Meet
                          </a>
                        ) : (
                          <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '6px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                            (Enlace de Meet disponible para la sesión)
                          </div>
                        )}
                      </div>

                      {hasAudit && (
                        <button
                          onClick={() => setSelectedLeadAudit({ name: m.lead?.businessName || m.guestName, audit: auditReport, leadId: m.lead?.id || '' })}
                          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '6px', padding: '0.45rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}
                        >
                          <FileSearch size={14} color="#6366f1" /> Ver Diagnóstico & Maqueta Previa
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODAL: DIAGNÓSTICO Y MAQUETA DEL CLIENTE ANTES DE LA REUNIÓN */}
      {selectedLeadAudit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: 800 }}>
                  Diagnóstico Técnico: {selectedLeadAudit.name}
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                  Datos recopilados por la IA para preparar tu reunión de forma estratégica.
                </p>
              </div>
              <button 
                onClick={() => setSelectedLeadAudit(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Resumen Ejecutivo */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '1.25rem' }}>
              <strong style={{ color: '#1e3a8a', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Resumen del Análisis:</strong>
              <p style={{ margin: 0, color: '#334155', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {selectedLeadAudit.audit?.detailedAnalysis || 'Análisis estándar completado.'}
              </p>
            </div>

            {/* Errores Técnicos y Visuales */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#fff1f2', padding: '0.85rem', borderRadius: '8px', border: '1px solid #ffe4e6' }}>
                <strong style={{ color: '#be123c', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Fallos Técnicos Detectados:</strong>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#881337', lineHeight: 1.4 }}>
                  {(selectedLeadAudit.audit?.technicalErrors || ['Sin errores críticos']).map((e: string, i: number) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{e}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: '#fffbeb', padding: '0.85rem', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                <strong style={{ color: '#b45309', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Fricciones Visuales / UX:</strong>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#78350f', lineHeight: 1.4 }}>
                  {(selectedLeadAudit.audit?.visualErrors || ['Diseño estándar']).map((e: string, i: number) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{e}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Botón Ver Maqueta en Pantalla Completa */}
            {selectedLeadAudit.leadId && (
              <a
                href={`http://localhost:3000/api/leads/public/${selectedLeadAudit.leadId}/mockup`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#0f172a',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <Sparkles size={16} color="#10b981" /> Abrir Maqueta de Referencia en Pantalla Completa <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
