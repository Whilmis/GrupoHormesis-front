import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Search, 
  Globe, 
  Phone, 
  Mail, 
  Sparkles, 
  FileSearch, 
  ExternalLink, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  MessageSquarePlus, 
  Filter,
  Eye,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { apiClient, BASE_URL } from '../../../api/client';

interface Lead {
  id: string;
  businessName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  source: string;
  status: string;
  metadata?: any;
  project?: {
    id: string;
    name: string;
    industry?: string;
  };
  meetings?: any[];
  _count?: {
    activities: number;
  };
  createdAt: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  metadata?: any;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  NUEVO: { label: 'Nuevo', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  CONTACTADO: { label: 'Contactado', color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7' },
  'REUNIÓN AGENDADA': { label: 'Reunión agendada', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  'PROPUESTA ENVIADA': { label: 'Propuesta enviada', color: '#06b6d4', bg: '#ecfeff', border: '#a5f3fc' },
  GANADO: { label: 'Ganado (cliente)', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  PERDIDO: { label: 'Perdido', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' }
};

export default function ColaboradorLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  // Modal de detalles
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Modal de diagnóstico / maqueta
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      
      const res = await apiClient(`/leads?${params.toString()}`);
      setLeads(res || []);
    } catch (err: any) {
      console.error('Error cargando leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchLeads();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [selectedStatus, searchQuery]);

  const openLeadDrawer = async (lead: Lead) => {
    setSelectedLead(lead);
    try {
      setLoadingActivities(true);
      const res = await apiClient(`/leads/${lead.id}/activities`);
      setActivities(res || []);
    } catch (err) {
      console.error('Error cargando actividades:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedLead) return;
    try {
      setUpdatingStatus(true);
      const res = await apiClient(`/leads/${selectedLead.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setSelectedLead({ ...selectedLead, status: newStatus });
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, status: newStatus } : l));
      // Recargar actividades
      const acts = await apiClient(`/leads/${selectedLead.id}/activities`);
      setActivities(acts || []);
    } catch (err: any) {
      alert('Error actualizando estado: ' + (err.message || 'Error del servidor'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNote.trim()) return;
    try {
      setSavingNote(true);
      await apiClient(`/leads/${selectedLead.id}/activities`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'MANUAL_NOTE',
          title: 'Nota de Colaborador',
          description: newNote.trim()
        })
      });
      setNewNote('');
      const acts = await apiClient(`/leads/${selectedLead.id}/activities`);
      setActivities(acts || []);
    } catch (err: any) {
      alert('Error guardando la nota: ' + (err.message || 'Error del servidor'));
    } finally {
      setSavingNote(false);
    }
  };

  // Helper para metadata
  const getParsedMeta = (meta: any) => {
    if (!meta) return {};
    if (typeof meta === 'string') {
      try { return JSON.parse(meta); } catch { return {}; }
    }
    return meta;
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building2 size={26} color="#059669" />
            Empresas & Seguimiento de Leads
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Visualiza las empresas prospectadas por tus flujos, consulta sus diagnósticos con IA, revisa sus maquetas y gestiona su estado.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchLeads}
            style={{ background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.55rem 1.1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Buscador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem 0.85rem', flex: '1', minWidth: '260px' }}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Buscar por empresa, contacto, web, teléfono o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0f172a' }}
          />
        </div>

        {/* Filtros de Estado */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={14} /> Estado:
          </span>
          {['ALL', 'NUEVO', 'CONTACTADO', 'REUNIÓN AGENDADA', 'PROPUESTA ENVIADA', 'GANADO', 'PERDIDO'].map(st => {
            const isSelected = selectedStatus === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                style={{
                  background: isSelected ? '#0f172a' : '#f1f5f9',
                  color: isSelected ? 'white' : '#475569',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {st === 'ALL' ? 'Todos' : STATUS_CONFIG[st]?.label || st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista / Grid de Leads */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 className="spinner" size={32} color="#059669" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ color: '#64748b' }}>Cargando empresas...</p>
        </div>
      ) : leads.length === 0 ? (
        <div style={{ background: 'white', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <Building2 size={40} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ fontWeight: 600, color: '#334155', fontSize: '1.05rem', margin: '0 0 0.5rem 0' }}>No se encontraron empresas con los filtros actuales</p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Intenta cambiar la búsqueda o el filtro de estado.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem' }}>
          {leads.map(lead => {
            const meta = getParsedMeta(lead.metadata);
            const auditReport = meta.aiAuditReport;
            const hasAudit = auditReport && (auditReport.technicalErrors?.length > 0 || auditReport.detailedAnalysis);
            const hasMockup = !!(meta.generatedMockup || meta.creativeAssets?.mockup?.previewHtml);
            const stBadge = STATUS_CONFIG[lead.status] || { label: lead.status, color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' };

            return (
              <div
                key={lead.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Fila Superior: Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '0.5rem' }}>
                    <span style={{
                      background: stBadge.bg,
                      color: stBadge.color,
                      border: `1px solid ${stBadge.border}`,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '20px',
                      textTransform: 'uppercase'
                    }}>
                      {stBadge.label}
                    </span>

                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={12} /> {new Date(lead.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* Nombre de la Empresa */}
                  <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 700, lineHeight: 1.3 }}>
                    {lead.businessName || 'Empresa sin nombre'}
                  </h4>

                  {/* Contacto / Proyecto */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    {lead.contactName && (
                      <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, background: '#f8fafc', padding: '2px 8px', borderRadius: '4px' }}>
                        👤 {lead.contactName}
                      </span>
                    )}
                    {lead.project && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                        📁 {lead.project.name}
                      </span>
                    )}
                  </div>

                  {/* Datos de Contacto */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
                    {lead.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={14} color="#64748b" />
                        <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lead.website}
                        </a>
                      </div>
                    )}
                    {lead.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="#64748b" />
                        <a href={`tel:${lead.phone}`} style={{ color: '#475569', textDecoration: 'none' }}>
                          {lead.phone}
                        </a>
                      </div>
                    )}
                    {lead.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="#64748b" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Badges de Auditoría & Maqueta */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {hasAudit && (
                      <span style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: '6px', padding: '3px 8px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={12} /> Diagnóstico IA Listo
                      </span>
                    )}
                    {hasMockup && (
                      <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '6px', padding: '3px 8px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🎨 Maqueta Diseñada
                      </span>
                    )}
                  </div>
                </div>

                {/* Botones de Acción */}
                <div style={{ display: 'flex', gap: '0.6rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.9rem' }}>
                  <button
                    onClick={() => openLeadDrawer(lead)}
                    style={{
                      flex: 1,
                      background: '#0f172a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.6rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                  >
                    <Eye size={15} /> Ver Ficha & Notas
                  </button>

                  <a
                    href={`${BASE_URL}/leads/public/${lead.id}/mockup`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#f8fafc',
                      color: '#2563eb',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.6rem 0.85rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Ver propuesta web generada a pantalla completa"
                  >
                    <ExternalLink size={15} /> Maqueta
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL / DRAWER DE FICHA DETALLADA DEL LEAD */}
      {selectedLead && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            width: '100%',
            maxWidth: '680px',
            height: '100%',
            overflowY: 'auto',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '-8px 0 24px rgba(0,0,0,0.15)'
          }}>
            {/* Cabecera del Drawer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <span style={{
                  background: STATUS_CONFIG[selectedLead.status]?.bg || '#f1f5f9',
                  color: STATUS_CONFIG[selectedLead.status]?.color || '#475569',
                  border: `1px solid ${STATUS_CONFIG[selectedLead.status]?.border || '#cbd5e1'}`,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: '0.4rem'
                }}>
                  {STATUS_CONFIG[selectedLead.status]?.label || selectedLead.status}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>
                  {selectedLead.businessName || 'Empresa'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Selector Rápido para Cambiar Estado */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                Cambiar estado del lead:
              </label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {['NUEVO', 'CONTACTADO', 'REUNIÓN AGENDADA', 'PROPUESTA ENVIADA', 'GANADO', 'PERDIDO'].map(st => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(st)}
                    disabled={updatingStatus || selectedLead.status === st}
                    style={{
                      background: selectedLead.status === st ? STATUS_CONFIG[st].color : 'white',
                      color: selectedLead.status === st ? 'white' : '#334155',
                      border: `1px solid ${selectedLead.status === st ? STATUS_CONFIG[st].color : '#cbd5e1'}`,
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: selectedLead.status === st ? 'default' : 'pointer'
                    }}
                  >
                    {STATUS_CONFIG[st].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnóstico & Maqueta Previa */}
            {(() => {
              const meta = getParsedMeta(selectedLead.metadata);
              const audit = meta.aiAuditReport;
              const hasAudit = audit && (audit.technicalErrors?.length > 0 || audit.detailedAnalysis);

              return (
                <div style={{ background: '#f5f3ff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #ddd6fe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={18} color="#7c3aed" />
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#5b21b6', fontWeight: 700 }}>
                        Auditoría técnica y maqueta web
                      </h4>
                    </div>
                    <a
                      href={`${BASE_URL}/leads/public/${selectedLead.id}/mockup`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#7c3aed',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ExternalLink size={13} /> Abrir maqueta
                    </a>
                  </div>

                  {hasAudit ? (
                    <div>
                      {audit.detailedAnalysis && (
                        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#4c1d95', lineHeight: 1.4 }}>
                          {audit.detailedAnalysis}
                        </p>
                      )}
                      {audit.technicalErrors && audit.technicalErrors.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#5b21b6' }}>
                          <strong>Puntos de fricción detectados:</strong>
                          {audit.technicalErrors.slice(0, 3).map((err: any, i: number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span>⚠️</span> <span>{typeof err === 'string' ? err : err.title || err.description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#6d28d9' }}>
                      Esta empresa cuenta con maqueta conceptual generada y lista para ser presentada en la reunión.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Formulario para Añadir Nota Interna */}
            <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MessageSquarePlus size={16} color="#059669" /> Añadir nota interna de seguimiento:
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Escribe comentarios sobre la llamada, acuerdos o estado del cliente..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="submit"
                disabled={savingNote || !newNote.trim()}
                style={{
                  alignSelf: 'flex-end',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: savingNote || !newNote.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {savingNote ? <Loader2 size={14} className="spinner" /> : <CheckCircle2 size={14} />} Guardar nota
              </button>
            </form>

            {/* Historial de Actividades & Correos */}
            <div>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>
                Línea de tiempo y actividades ({activities.length})
              </h4>

              {loadingActivities ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <Loader2 className="spinner" size={24} color="#059669" style={{ margin: '0 auto' }} />
                </div>
              ) : activities.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                  Aún no hay actividades ni notas registradas para este prospecto.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activities.map(act => (
                    <div
                      key={act.id}
                      style={{
                        background: '#f8fafc',
                        borderLeft: `4px solid ${act.type === 'AUTO_EMAIL' ? '#3b82f6' : act.type === 'STATUS_CHANGE' ? '#8b5cf6' : '#10b981'}`,
                        padding: '0.85rem 1rem',
                        borderRadius: '0 8px 8px 0',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <strong style={{ color: '#0f172a' }}>{act.title}</strong>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                          {new Date(act.createdAt).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {act.description && (
                        <p style={{ margin: 0, color: '#475569', lineHeight: 1.4 }}>{act.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
