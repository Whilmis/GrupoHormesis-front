import { Briefcase, Building, ChevronLeft, Plus, Users, Send, Mail, Phone, Globe, CheckSquare, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../../api/client';
import '../portal.css';

interface Project {
  id: string;
  name: string;
  industry: string;
  description?: string;
  _count?: {
    workflows: number;
    leads: number;
  };
}

interface Activity {
  id: string;
  type: 'AUTO_EMAIL' | 'MANUAL_NOTE' | 'CALL' | 'MEETING';
  title: string;
  description?: string;
  createdAt: string;
}

interface Lead {
  id: string;
  projectId: string;
  businessName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  source: string;
  status: string; // NUEVO, CONTACTADO, EN_NEGOCIACION, CERRADO
  createdAt: string;
  // Temporary for backward compatibility during transition:
  payload?: any;
  referredBy?: any;
}

export default function AdminProyectos() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  
  // CRM Drawer State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadActivities, setLeadActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'INBOX' | 'COMPANIES' | 'ACTIVITIES'>('INBOX');
  
  // Actividades Globales
  const [globalActivities, setGlobalActivities] = useState<(Activity & { lead?: Lead })[]>([]);
  const [loadingGlobalActivities, setLoadingGlobalActivities] = useState(false);

  // Modal para crear proyecto
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', industry: '', description: '' });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/projects');
      setProjects(data);
    } catch (error: any) {
      if (error.status === 404) {
        console.log("El endpoint de proyectos aún no existe.");
      } else {
        console.error("Error fetching projects", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    try {
      await apiClient('/projects', {
        method: 'POST',
        data: newProject
      });
      setShowCreateModal(false);
      setNewProject({ name: '', industry: '', description: '' });
      fetchProjects();
    } catch (error: any) {
      if (error.status === 404) {
        alert("El backend para Proyectos aún no está listo.");
      } else {
        console.error(error);
      }
    }
  };

  const handleViewProject = async (project: Project) => {
    setViewingProject(project);
    setLoadingLeads(true);
    setLeads([]);
    setSelectedLead(null);
    try {
      const data = await apiClient(`/projects/${project.id}/leads`);
      setLeads(data);
    } catch (error: any) {
      if (error.status === 404) {
        console.log("El endpoint de leads unificados aún no existe.");
        // MOCK DATA PARA MOSTRAR LA UI MIENTRAS SE HACE EL BACKEND
        setLeads([
          {
            id: 'mock-1',
            projectId: project.id,
            businessName: 'Clínica Sonrisas Madrid',
            contactName: 'Dr. Alberto Ruiz',
            email: 'contacto@sonrisas.es',
            phone: '+34 600 111 222',
            website: 'https://sonrisas.es',
            source: '📝 Formulario',
            status: 'NUEVO',
            createdAt: new Date().toISOString(),
            referredBy: { name: 'Juan Agente' }
          },
          {
            id: 'mock-2',
            projectId: project.id,
            businessName: 'Dentistas Asociados S.L.',
            contactName: '',
            email: 'info@dentistasasociados.com',
            phone: 'No disponible',
            website: 'No disponible',
            source: '🤖 Scraping Maps',
            status: 'CONTACTADO',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      } else {
        console.error("Error fetching leads", error);
      }
    } finally {
      setLoadingLeads(false);
      // Fetch global activities for the third tab
      fetchGlobalActivities(project.id);
    }
  };

  const fetchGlobalActivities = async (projectId: string) => {
    setLoadingGlobalActivities(true);
    try {
      const data = await apiClient(`/projects/${projectId}/activities`);
      setGlobalActivities(data);
    } catch (error: any) {
      if (error.status === 404) {
        // MOCK DATA PARA ACTIVIDADES GLOBALES
        setGlobalActivities([
          { 
            id: 'mock-act-1', 
            type: 'AUTO_EMAIL', 
            title: 'Correo de Contacto (IA)', 
            description: '¡Hola! Hemos recibido tu solicitud. Nos gustaría tener una llamada para revisar tu caso.', 
            createdAt: new Date().toISOString(),
            lead: { businessName: 'Clínica Sonrisas Madrid' } as any
          },
          { 
            id: 'mock-act-2', 
            type: 'MANUAL_NOTE', 
            title: 'Llamada de seguimiento', 
            description: 'El cliente no respondió. Volver a intentar mañana.', 
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            lead: { businessName: 'Dentistas Asociados S.L.' } as any
          }
        ]);
      } else {
        console.error("Error fetching global activities", error);
      }
    } finally {
      setLoadingGlobalActivities(false);
    }
  };

  const handleSelectLead = async (lead: Lead) => {
    setSelectedLead(lead);
    setLoadingActivities(true);
    setLeadActivities([]);
    try {
      const data = await apiClient(`/leads/${lead.id}/activities`);
      setLeadActivities(data);
    } catch (error: any) {
      if (error.status === 404) {
        // Mock data if endpoint not ready
        setLeadActivities([
          { id: '1', type: 'AUTO_EMAIL', title: 'Correo de Contacto (IA)', description: '¡Hola! Hemos recibido tu solicitud. Nos gustaría tener una llamada para revisar tu caso.', createdAt: new Date().toISOString() }
        ]);
      } else {
        console.error("Error fetching activities", error);
      }
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedLead) return;
    try {
      const activityData = { type: 'MANUAL_NOTE', title: 'Nota Manual', description: newNote };
      try {
        await apiClient(`/leads/${selectedLead.id}/activities`, {
          method: 'POST',
          data: activityData
        });
      } catch (e: any) {
        if (e.status !== 404) throw e;
        // Mock success if endpoint missing
      }
      
      setLeadActivities([{
        id: Math.random().toString(),
        type: 'MANUAL_NOTE',
        title: 'Nota Manual',
        description: newNote,
        createdAt: new Date().toISOString()
      }, ...leadActivities]);
      setNewNote('');
    } catch (error) {
      console.error(error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'AUTO_EMAIL': return <Mail size={16} color="#3b82f6" />;
      case 'MANUAL_NOTE': return <MessageSquare size={16} color="#10b981" />;
      case 'CALL': return <Phone size={16} color="#f59e0b" />;
      case 'MEETING': return <Users size={16} color="#8b5cf6" />;
      default: return <CheckSquare size={16} color="#64748b" />;
    }
  };

  if (viewingProject) {
    return (
      <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <button 
          onClick={() => { setViewingProject(null); setSelectedLead(null); }}
          style={{ background: 'transparent', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', marginBottom: '1.5rem', color: '#475569', alignSelf: 'flex-start' }}
        >
          <ChevronLeft size={16} /> Volver a Empresas
        </button>

        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', marginBottom: '0.5rem' }}>
          <Building size={28} color="#3b82f6" />
          CRM Global: {viewingProject.name}
        </h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Sector: {viewingProject.industry} | Consolidado de Empresas Potenciales (Leads).
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('INBOX')}
            style={{ background: 'none', border: 'none', borderBottom: activeTab === 'INBOX' ? '2px solid #3b82f6' : '2px solid transparent', color: activeTab === 'INBOX' ? '#3b82f6' : '#64748b', fontWeight: 600, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem' }}
          >
            📥 Todo lo Recibido
          </button>
          <button 
            onClick={() => { setActiveTab('COMPANIES'); setSelectedLead(null); }}
            style={{ background: 'none', border: 'none', borderBottom: activeTab === 'COMPANIES' ? '2px solid #10b981' : '2px solid transparent', color: activeTab === 'COMPANIES' ? '#10b981' : '#64748b', fontWeight: 600, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem' }}
          >
            🏢 Directorio de Empresas
          </button>
          <button 
            onClick={() => { setActiveTab('ACTIVITIES'); setSelectedLead(null); }}
            style={{ background: 'none', border: 'none', borderBottom: activeTab === 'ACTIVITIES' ? '2px solid #f59e0b' : '2px solid transparent', color: activeTab === 'ACTIVITIES' ? '#f59e0b' : '#64748b', fontWeight: 600, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem' }}
          >
            ⚡ Actividades Recientes
          </button>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: '500px' }}>
          {/* Panel Izquierdo: Tabla de Leads */}
          {activeTab === 'INBOX' ? (
          <div style={{ flex: 1, transition: 'all 0.3s' }}>
            {loadingLeads ? (
              <p>Cargando empresas potenciales...</p>
            ) : leads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <Users size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ color: '#475569' }}>No hay prospectos capturados</h3>
                <p style={{ color: '#64748b' }}>Aún no se han procesado prospectos desde el backend.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Fecha y Origen</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Prospecto / Empresa</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Contacto</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Atributos y Referidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, i) => (
                      <tr 
                        key={i} 
                        onClick={() => handleSelectLead(lead)}
                        style={{ 
                          borderBottom: '1px solid #f1f5f9', 
                          cursor: 'pointer', 
                          background: selectedLead?.id === lead.id ? '#eff6ff' : 'white',
                          transition: 'background 0.2s'
                        }}
                      >
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 500, color: '#0f172a', marginBottom: '4px' }}>
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '-'}
                          </div>
                          <span style={{ 
                            background: lead.source?.includes('Formulario') ? '#dbeafe' : '#fce7f3', 
                            color: lead.source?.includes('Formulario') ? '#1e40af' : '#9d174d',
                            padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' 
                          }}>
                            {lead.source || 'Desconocido'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{lead.businessName || lead.contactName || 'Sin Nombre'}</div>
                          <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 500, marginTop: '4px', display: 'inline-block' }}>
                            Estado: {lead.status || 'NUEVO'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {lead.email && <div><a href={`mailto:${lead.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>📧 {lead.email}</a></div>}
                          {lead.phone && lead.phone !== 'No disponible' && (
                            <div style={{ marginTop: '4px' }}><a href={`tel:${lead.phone}`} style={{ color: '#10b981', textDecoration: 'none' }}>📞 {lead.phone}</a></div>
                          )}
                          {lead.website && lead.website !== 'No disponible' && (
                            <div style={{ marginTop: '4px' }}><a href={lead.website} target="_blank" rel="noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>🌐 Visitar Web</a></div>
                          )}
                          {!lead.email && !lead.phone && !lead.website && <span style={{ color: '#94a3b8' }}>-</span>}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {lead.referredBy && lead.referredBy.name ? (
                            <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              ✅ Vino referido por: {lead.referredBy.name}
                            </div>
                          ) : lead.referredBy?.userId ? (
                            <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              ✅ Vino referido por: Usuario ({lead.referredBy.userId})
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          ) : activeTab === 'COMPANIES' ? (
            selectedLead ? (
            <div style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '600px' }}>
              
              {/* Toolbar Superior */}
              <div style={{ padding: '1rem 1.5rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
                <button 
                  onClick={() => setSelectedLead(null)}
                  style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#475569', fontWeight: 500, fontSize: '0.9rem', padding: 0 }}
                >
                  <ChevronLeft size={18} /> Volver a Empresas Potenciales
                </button>
              </div>

              {/* Cabecera del Perfil (Full Width) */}
              <div style={{ padding: '2rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.5rem' }}>{selectedLead.businessName || selectedLead.contactName || 'Empresa Desconocida'}</h2>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem', marginTop: '1rem' }}>
                    {selectedLead.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                        <Mail size={16} color="#3b82f6" /> <a href={`mailto:${selectedLead.email}`} style={{ color: '#475569', textDecoration: 'none' }}>{selectedLead.email}</a>
                      </div>
                    )}
                    {selectedLead.phone && selectedLead.phone !== 'No disponible' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                        <Phone size={16} color="#10b981" /> <a href={`tel:${selectedLead.phone}`} style={{ color: '#475569', textDecoration: 'none' }}>{selectedLead.phone}</a>
                      </div>
                    )}
                    {selectedLead.website && selectedLead.website !== 'No disponible' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                        <Globe size={16} color="#6366f1" /> <a href={selectedLead.website} target="_blank" rel="noreferrer" style={{ color: '#475569', textDecoration: 'none' }}>{selectedLead.website}</a>
                      </div>
                    )}
                  </div>
                </div>
                <span style={{ display: 'inline-block', background: '#dbeafe', color: '#1e40af', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                  Estado Actual: {selectedLead.status || 'NUEVO'}
                </span>
              </div>

              {/* Muro de Actividades (Full Width) */}
              <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: '#f8fafc' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={20} color="#3b82f6" /> Panel de Actividades y Correos IA
                </h3>
                
                {loadingActivities ? (
                  <p style={{ color: '#64748b' }}>Cargando historial...</p>
                ) : leadActivities.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ color: '#94a3b8' }}>Aún no hay correos ni actividades registradas para esta empresa.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
                    {leadActivities.map(act => (
                      <div key={act.id} style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ marginTop: '0.5rem', padding: '0.6rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', height: 'fit-content', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          {getActivityIcon(act.type)}
                        </div>
                        <div style={{ background: 'white', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{act.title}</strong>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                              {new Date(act.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {act.description && (
                            <div style={{ fontSize: '0.95rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                              {act.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input para agregar notas */}
              <div style={{ padding: '1.5rem 2rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '1rem', maxWidth: '800px' }}>
                  <input 
                    type="text" 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Añadir una nota manual al expediente..."
                    style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                    onKeyDown={(e) => { if(e.key === 'Enter') handleAddNote() }}
                  />
                  <button 
                    onClick={handleAddNote}
                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                    disabled={!newNote.trim()}
                  >
                    <Send size={18} /> Guardar Nota
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem' }}>Directorio de Empresas Potenciales</h3>
              </div>
              
              {leads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <Building size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                  <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No hay empresas potenciales en seguimiento.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                  {leads.map(lead => (
                    <div 
                      key={lead.id} 
                      onClick={() => handleSelectLead(lead)}
                      style={{ 
                        padding: '1.5rem', 
                        background: 'white',
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px', 
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', paddingRight: '1rem' }}>{lead.businessName || lead.contactName || 'Sin Nombre'}</h4>
                        <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.3rem 0.8rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {lead.status}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem', flex: 1, marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Mail size={14} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.email || 'Sin correo'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Phone size={14} /> <span>{lead.phone || 'Sin teléfono'}</span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', color: '#3b82f6', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Abrir Panel de Actividades <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) ) : (
            <div style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                ⚡ Línea de Tiempo Global del Proyecto
              </h3>
              
              {loadingGlobalActivities ? (
                <p style={{ color: '#64748b' }}>Cargando actividades...</p>
              ) : globalActivities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <MessageSquare size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                  <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No hay actividades registradas en todo el proyecto.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                  {globalActivities.map(act => (
                    <div key={act.id} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                        <div style={{ padding: '0.6rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', zIndex: 2 }}>
                          {getActivityIcon(act.type)}
                        </div>
                        <div style={{ width: '2px', height: '100%', background: '#e2e8f0', minHeight: '40px' }}></div>
                      </div>
                      
                      <div style={{ background: 'white', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div>
                            <strong style={{ fontSize: '1.1rem', color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>{act.title}</strong>
                            <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Building size={14} /> Empresa: {act.lead?.businessName || act.lead?.contactName || 'Desconocida'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', padding: '0.3rem 0.8rem', borderRadius: '16px', fontWeight: 500 }}>
                            {new Date(act.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {act.description && (
                          <div style={{ fontSize: '0.95rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.6', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                            {act.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Briefcase size={24} color="#10b981" />
          {t('admin_projects.management', 'Gestión de Empresas (CRM Global)')}
        </h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}
        >
          <Plus size={18} /> Nueva Empresa
        </button>
      </div>
      
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Administra las empresas o marcas de tus clientes. Cada empresa consolida todos los leads generados por sus distintas automatizaciones y formularios.
      </p>

      {loading ? (
        <p>Cargando empresas...</p>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <Building size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>No hay empresas registradas</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Crea tu primera entidad para empezar a agrupar Workflows y Leads.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
          >
            Agregar Empresa
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {projects.map(project => (
            <div key={project.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.1rem' }}>{project.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#3b82f6', background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 500 }}>
                    {project.industry}
                  </span>
                </div>
                <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '8px' }}>
                  <Building size={20} color="#64748b" />
                </div>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', flex: 1, marginBottom: '1.5rem' }}>
                {project.description || 'Sin descripción.'}
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>{project._count?.workflows || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Workflows</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>{project._count?.leads || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Total Leads</div>
                </div>
              </div>

              <button 
                onClick={() => handleViewProject(project)}
                style={{ width: '100%', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
              >
                Abrir CRM de Empresa
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#0f172a' }}>Registrar Nueva Empresa</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Nombre de la Empresa</label>
              <input 
                type="text" 
                value={newProject.name}
                onChange={e => setNewProject({...newProject, name: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                placeholder="Ej. Grupo Hormesis"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Sector / Industria</label>
              <input 
                type="text" 
                value={newProject.industry}
                onChange={e => setNewProject({...newProject, industry: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                placeholder="Ej. Consultoría Tecnológica"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Descripción Corta</label>
              <textarea 
                value={newProject.description}
                onChange={e => setNewProject({...newProject, description: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '60px' }}
                placeholder="Agencia de transformación digital..."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateProject}
                disabled={!newProject.name}
                style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', opacity: !newProject.name ? 0.5 : 1 }}
              >
                Guardar Empresa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
