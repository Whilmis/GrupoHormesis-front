import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Video, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../api/client';

export default function ColaboradorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingMeetings: 0,
    confirmedMeetings: 0,
    todayMeetings: [] as any[],
    totalLeads: 0,
    totalForms: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiClient('/meetings/colaborador/stats');
        setStats(data || {
          pendingMeetings: 0,
          confirmedMeetings: 0,
          todayMeetings: [],
          totalLeads: 0,
          totalForms: 0
        });
      } catch (err) {
        console.error('Error cargando estadísticas del colaborador:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Saludo y bienvenida */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
          ¡Hola, {user?.name || 'Colaborador'}! 👋
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          Este es tu centro de operaciones. Aquí puedes responder invitaciones de reunión, preparar tus llamadas con diagnósticos y dar seguimiento a las empresas.
        </p>
      </div>

      {/* Banner de alerta si hay reuniones pendientes */}
      {stats.pendingMeetings > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fefce8, #fef08a)',
          border: '1.5px solid #facc15',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 14px rgba(234, 179, 8, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#ca8a04', color: 'white', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={22} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.2rem 0', color: '#854d0e', fontSize: '1.05rem', fontWeight: 800 }}>
                Tienes {stats.pendingMeetings} invitación{stats.pendingMeetings > 1 ? 'es' : ''} de reunión pendiente{stats.pendingMeetings > 1 ? 's' : ''}
              </h4>
              <p style={{ margin: 0, color: '#a16207', fontSize: '0.85rem' }}>
                Un cliente agendó una llamada. Confirma tu asistencia para asegurar el espacio y sincronizar Google Meet.
              </p>
            </div>
          </div>
          <Link
            to="/portal/colaborador/reuniones"
            style={{
              background: '#854d0e',
              color: 'white',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Revisar Invitaciones <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* Métricas Principales */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        {/* Reuniones Pendientes */}
        <Link to="/portal/colaborador/reuniones" style={{ textDecoration: 'none' }}>
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}>
            <div className="stat-header">
              <span className="stat-title">Invitaciones por Confirmar</span>
              <Calendar className="stat-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }} />
            </div>
            <span className="stat-value">{loading ? '...' : stats.pendingMeetings}</span>
            <span style={{ color: stats.pendingMeetings > 0 ? '#f59e0b' : '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
              {stats.pendingMeetings > 0 ? 'Requieren tu respuesta' : 'Todo al día'}
            </span>
          </div>
        </Link>

        {/* Reuniones Confirmadas */}
        <Link to="/portal/colaborador/reuniones" style={{ textDecoration: 'none' }}>
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}>
            <div className="stat-header">
              <span className="stat-title">Reuniones Confirmadas</span>
              <CheckCircle2 className="stat-icon" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }} />
            </div>
            <span className="stat-value">{loading ? '...' : stats.confirmedMeetings}</span>
            <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>Listas para atender</span>
          </div>
        </Link>

        {/* Empresas Prospectadas */}
        <Link to="/portal/colaborador/leads" style={{ textDecoration: 'none' }}>
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}>
            <div className="stat-header">
              <span className="stat-title">Empresas en CRM</span>
              <Building2 className="stat-icon" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }} />
            </div>
            <span className="stat-value">{loading ? '...' : stats.totalLeads}</span>
            <span style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600 }}>Diagnósticos y maquetas</span>
          </div>
        </Link>

        {/* Formularios Recibidos */}
        <Link to="/portal/colaborador/forms" style={{ textDecoration: 'none' }}>
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}>
            <div className="stat-header">
              <span className="stat-title">Formularios Entrantes</span>
              <FileText className="stat-icon" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }} />
            </div>
            <span className="stat-value">{loading ? '...' : stats.totalForms}</span>
            <span style={{ color: '#8b5cf6', fontSize: '0.85rem', fontWeight: 600 }}>Respuestas de clientes</span>
          </div>
        </Link>
      </div>

      {/* Grid Inferior: Sesiones de Hoy y Accesos Rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
        {/* Sesiones de Hoy */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
                Reuniones de Hoy ({stats.todayMeetings.length})
              </h3>
            </div>
            <Link to="/portal/colaborador/reuniones" style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
              Ver todas →
            </Link>
          </div>

          {stats.todayMeetings.length === 0 ? (
            <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '10px', textAlign: 'center', color: '#64748b' }}>
              <Calendar size={32} color="#cbd5e1" style={{ margin: '0 auto 0.75rem auto' }} />
              <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>No tienes reuniones programadas para el día de hoy.</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Aprovecha para revisar los prospectos o diagnósticos pendientes.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.todayMeetings.map((m: any) => (
                <div
                  key={m.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.9rem 1.1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.95rem' }}>{m.guestName}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(m.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {new Date(m.endTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • {m.lead?.businessName || 'Empresa'}
                    </span>
                  </div>

                  {m.meetLink ? (
                    <a
                      href={m.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#1a73e8',
                        color: 'white',
                        padding: '0.45rem 0.9rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Video size={14} /> Unirse a Meet
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sin enlace Meet</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guía Operativa & Accesos Rápidos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>
              Flujo de Trabajo Recomendado
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', color: '#475569' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 800, width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                <span><strong>Confirma tus llamadas:</strong> Revisa y acepta las invitaciones agendadas por los clientes.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 800, width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                <span><strong>Estudia el diagnóstico:</strong> Abre la auditoría técnica y la maqueta web antes de entrar a la llamada.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 800, width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
                <span><strong>Registra acuerdos:</strong> Añade notas internas y actualiza el estado a <em>Propuesta Enviada</em> o <em>Ganado</em>.</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '1.5rem', borderRadius: '12px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <Sparkles size={18} color="#38bdf8" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Herramienta de Cierre</h4>
            </div>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Recuerda que todas las maquetas generadas cuentan con enlaces directos para mostrarlas en pantalla completa durante la videollamada.
            </p>
            <Link
              to="/portal/colaborador/leads"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: '#38bdf8',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Explorar Empresas y Maquetas →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
