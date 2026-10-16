import { ChevronDown, ChevronUp, Briefcase, Building, ChevronLeft, Plus, Users, Send, Mail, Phone, Globe, CheckSquare, MessageSquare, Sparkles, AlertTriangle, Eye, Image, ExternalLink, Layers, Copy, X, Clock, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../../api/client';
import '../portal.css';

const getScreenshotLabel = (type: string) => {
  switch (type) {
    case 'desktop_home':
      return { label: 'Hero escritorio', icon: '🖥️' };
    case 'desktop_footer':
      return { label: 'Pie de página (footer)', icon: '📑' };
    case 'mobile_home':
      return { label: 'Móvil (UX / responsive)', icon: '📱' };
    case 'services_page':
      return { label: 'Página de servicios', icon: '💼' };
    case 'contact_page':
      return { label: 'Página de contacto', icon: '✉️' };
    default:
      return { label: type || 'Captura', icon: '📸' };
  }
};

const parseLeadAudit = (lead: any) => {
  if (!lead) return { hasAudit: false, screenshots: [], technicalErrors: [], visualErrors: [], detailedAnalysis: '', rating: null, technicalAnalysis: null, aiAuditReport: null };

  let meta = lead.metadata;
  if (typeof meta === 'string') {
    try {
      meta = JSON.parse(meta);
    } catch (e) {
      meta = {};
    }
  }
  if (!meta && lead.payload) {
    meta = typeof lead.payload.metadata === 'string' ? JSON.parse(lead.payload.metadata) : lead.payload.metadata;
  }

  const technicalAnalysis = meta?.technicalAnalysis || lead.technicalAnalysis || lead.payload?.technicalAnalysis || null;
  const aiAuditReport = meta?.aiAuditReport || lead.aiAuditReport || lead.payload?.aiAuditReport || null;

  let screenshots: { type: string; url: string }[] = [];
  if (technicalAnalysis?.screenshots && Array.isArray(technicalAnalysis.screenshots)) {
    screenshots = technicalAnalysis.screenshots;
  } else if (technicalAnalysis?.screenshotUrl) {
    screenshots = [{ type: 'desktop_home', url: technicalAnalysis.screenshotUrl }];
  }

  const technicalErrors: string[] = Array.isArray(aiAuditReport?.technicalErrors) ? aiAuditReport.technicalErrors : [];
  const visualErrors: string[] = Array.isArray(aiAuditReport?.visualErrors) ? aiAuditReport.visualErrors : [];
  const detailedAnalysis: string = aiAuditReport?.detailedAnalysis || '';
  const rating = lead.rating || meta?.rating || lead.payload?.rating || null;

  const mockup = meta?.creativeAssets?.mockup || lead.payload?.metadata?.creativeAssets?.mockup || null;
  const hasAudit = screenshots.length > 0 || technicalErrors.length > 0 || visualErrors.length > 0 || Boolean(detailedAnalysis) || Boolean(technicalAnalysis) || Boolean(mockup);

  return {
    meta,
    technicalAnalysis,
    aiAuditReport,
    screenshots,
    technicalErrors,
    visualErrors,
    detailedAnalysis,
    rating,
    hasAudit,
    mockup
  };
};

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
  metadata?: any;
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
    metadata?: any; // To store coupon etc
}


const CollapsibleActivityBody = ({ act }: { act: Activity }) => {
  const [expanded, setExpanded] = useState(false);
  if (!act.description) return null;

  if (act.type === 'AUTO_EMAIL') {
    return (
      <div style={{ marginTop: '0.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <button 
          onClick={() => setExpanded(!expanded)} 
          style={{ width: '100%', padding: '0.75rem 1rem', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#475569', fontWeight: 500, fontSize: '0.9rem' }}
        >
          <span>{expanded ? 'Ocultar previsualización de correo' : 'Ver correo original (HTML)'}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expanded && (
          <div 
            style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', background: 'white', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }} 
            dangerouslySetInnerHTML={{ __html: act.description }} 
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ fontSize: '0.95rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.6', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9', marginTop: '0.5rem' }}>
      {act.description}
    </div>
  );
};

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

  // Lead Audit & Screenshots Modal states
  const [selectedAuditLead, setSelectedAuditLead] = useState<any | null>(null);
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState<number>(0);
  
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

  const renderAuditModal = () => {
    if (!selectedAuditLead) return null;
    const lead = selectedAuditLead;
    const audit = parseLeadAudit(lead);
    const screenshots = audit.screenshots;
    const currentShot = screenshots[activeScreenshotIdx] || screenshots[0];
    const currentLabel = currentShot ? getScreenshotLabel(currentShot.type) : { label: 'Captura', icon: '📸' };

    const handleCopyAuditProposal = () => {
      const techList = audit.technicalErrors.length > 0 
        ? audit.technicalErrors.map(e => `• ${e}`).join('\n')
        : '• Ningún error técnico crítico detectado';
      const visualList = audit.visualErrors.length > 0 
        ? audit.visualErrors.map(e => `• ${e}`).join('\n')
        : '• Diseño responsive sin incidencias graves';
      
      const pitch = `🔍 AUDITORÍA WEB & OPORTUNIDADES DE MEJORA PARA ${lead.businessName?.toUpperCase() || lead.contactName?.toUpperCase() || lead.name?.toUpperCase() || 'SU EMPRESA'}
Web auditada: ${lead.website || lead.url || 'N/A'}
Teléfono: ${lead.phone || 'N/A'}

⚠️ ERRORES TÉCNICOS Y SEO DETECTADOS:
${techList}

👁️ ERRORES VISUALES, DE DISEÑO Y UX:
${visualList}

✨ INFORME Y DIAGNÓSTICO DE LA IA:
${audit.detailedAnalysis || 'Análisis en proceso.'}

📸 Capturas y evidencias fotográficas analizadas: ${screenshots.length} capturas en escritorio y móvil.`;

      navigator.clipboard.writeText(pitch);
      alert('¡Propuesta de auditoría copiada al portapapeles! Lista para enviar por email o WhatsApp.');
    };

    return (
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(15, 23, 42, 0.75)', 
          backdropFilter: 'blur(6px)', 
          zIndex: 10000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '1.5rem'
        }}
        onClick={() => setSelectedAuditLead(null)}
      >
        <div 
          style={{ 
            background: 'white', 
            borderRadius: '16px', 
            width: '100%', 
            maxWidth: '1150px', 
            maxHeight: '92vh', 
            display: 'flex', 
            flexDirection: 'column', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ background: '#0f172a', color: 'white', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #1e293b' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  {lead.businessName || lead.contactName || lead.name || 'Auditoría de Lead'}
                </h2>
                {audit.rating && (
                  <span style={{ background: '#fef08a', color: '#854d0e', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                    ⭐ {audit.rating}
                  </span>
                )}
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={13} /> Auditado con Groq Vision
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#94a3b8' }}>
                {lead.website && lead.website !== 'No disponible' && (
                  <a href={lead.website} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ExternalLink size={14} /> {lead.website}
                  </a>
                )}
                {lead.phone && lead.phone !== 'No disponible' && (
                  <a href={`tel:${lead.phone}`} style={{ color: '#34d399', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    📞 {lead.phone}
                  </a>
                )}
                {lead.email && (
                  <a href={`mailto:${lead.email}`} style={{ color: '#cbd5e1', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={14} /> {lead.email}
                  </a>
                )}
                {lead.address && (
                  <span style={{ color: '#64748b' }}>📍 {lead.address}</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={handleCopyAuditProposal}
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.6rem 1.1rem', 
                  borderRadius: '8px', 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                <Copy size={15} /> Copiar propuesta
              </button>
              <button 
                onClick={() => setSelectedAuditLead(null)}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* KPI Quick Bar */}
          <div style={{ background: '#f8fafc', padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <Image size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Capturas HD</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{screenshots.length} guardadas</div>
              </div>
            </div>

            <div style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Errores técnicos</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626' }}>{audit.technicalErrors.length} detectados</div>
              </div>
            </div>

            <div style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                <Smartphone size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Errores visuales/UX</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ea580c' }}>{audit.visualErrors.length} detectados</div>
              </div>
            </div>

            <div style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Tiempo de carga</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>
                  {audit.technicalAnalysis?.loadTimeMs ? `${audit.technicalAnalysis.loadTimeMs}ms` : 'Rápido (<1s)'}
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Body (2 columns) */}
          <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: 'minmax(350px, 1.1fr) minmax(350px, 1.2fr)', gap: '2rem' }}>
            {/* Column 1: Gallery */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <Layers size={18} color="#2563eb" /> Galería de capturas ({screenshots.length})
                </h4>
                {currentShot && (
                  <a 
                    href={currentShot.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ExternalLink size={13} /> Abrir imagen HD original
                  </a>
                )}
              </div>

              {/* Tabs / Pills */}
              {screenshots.length > 0 ? (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {screenshots.map((s, idx) => {
                    const info = getScreenshotLabel(s.type);
                    const isSelected = activeScreenshotIdx === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveScreenshotIdx(idx)}
                        style={{
                          background: isSelected ? '#0f172a' : '#f1f5f9',
                          color: isSelected ? 'white' : '#475569',
                          border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 600 : 500,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{info.icon}</span> {info.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {/* Large Image Preview Container */}
              {currentShot ? (
                <div style={{ position: 'relative', background: '#090d16', borderRadius: '12px', border: '1px solid #cbd5e1', overflow: 'hidden', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={currentShot.url} 
                    alt={currentLabel.label} 
                    style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', display: 'block' }} 
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95), transparent)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600 }}>{currentLabel.icon} {currentLabel.label}</span>
                    <span style={{ color: '#94a3b8' }}>Captura {activeScreenshotIdx + 1} de {screenshots.length}</span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <p style={{ color: '#64748b', margin: 0 }}>No hay capturas disponibles para esta web.</p>
                </div>
              )}

              {/* Thumbnail Row */}
              {screenshots.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${screenshots.length}, 1fr)`, gap: '0.5rem' }}>
                  {screenshots.map((s, idx) => {
                    const isSelected = activeScreenshotIdx === idx;
                    return (
                      <div 
                        key={idx}
                        onClick={() => setActiveScreenshotIdx(idx)}
                        style={{ 
                          cursor: 'pointer', 
                          borderRadius: '6px', 
                          overflow: 'hidden', 
                          border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          opacity: isSelected ? 1 : 0.65,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <img src={s.url} alt={`Thumb ${idx}`} style={{ width: '100%', height: '48px', objectFit: 'cover', display: 'block' }} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Technical Metadata tags */}
              {audit.technicalAnalysis && (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569' }}>
                  {audit.technicalAnalysis.h1 && (
                        <div style={{ marginBottom: '0.4rem' }}>
                          <strong style={{ color: '#0f172a' }}>H1 detectado:</strong> {audit.technicalAnalysis.h1}
                        </div>
                      )}
                      {audit.technicalAnalysis.metaDescription && (
                        <div>
                          <strong style={{ color: '#0f172a' }}>Meta descripción:</strong> {audit.technicalAnalysis.metaDescription}
                        </div>
                      )}
                </div>
              )}
            </div>

            {/* Column 2: AI Audit Report */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Technical Errors */}
              <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#991b1b', fontWeight: 700, fontSize: '0.95rem' }}>
                  <AlertTriangle size={18} />
                  Errores técnicos y SEO ({audit.technicalErrors.length})
                </div>
                {audit.technicalErrors.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#7f1d1d', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    {audit.technicalErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0, color: '#15803d', fontSize: '0.85rem' }}>✅ No se han detectado errores técnicos graves.</p>
                )}
              </div>

              {/* Visual Errors */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#92400e', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Eye size={18} />
                  Errores visuales y de UX ({audit.visualErrors.length})
                </div>
                {audit.visualErrors.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#78350f', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    {audit.visualErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0, color: '#15803d', fontSize: '0.85rem' }}>✅ Diseño responsive y elementos visuales optimizados.</p>
                )}
              </div>

              {/* Detailed Analysis from Groq */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Sparkles size={18} color="#10b981" />
                  Diagnóstico global de la IA (estrategia de venta)
                </div>
                {audit.detailedAnalysis ? (
                  <div style={{ whiteSpace: 'pre-wrap', color: '#334155', fontSize: '0.88rem', lineHeight: 1.6, background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    {audit.detailedAnalysis}
                  </div>
                ) : (
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                    Sin informe detallado disponible.
                  </p>
                )}
              </div>

              {/* Google Stitch Mockup Preview */}
              {audit.mockup && (
                  <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '1.25rem', marginTop: '1rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6d28d9', fontWeight: 700, fontSize: '0.95rem' }}>
                        🎨 Maqueta diseñada con Google Stitch
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const newTab = window.open();
                            if (newTab) {
                              newTab.document.write(audit.mockup.previewHtml);
                              newTab.document.close();
                            }
                          }}
                          style={{
                            background: '#7c3aed',
                            color: 'white',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)'
                          }}
                        >
                          🖥️ Pantalla completa
                        </button>
                        <span style={{ background: '#ede9fe', color: '#5b21b6', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '12px' }}>
                          Estilo: {audit.mockup.designStyle || 'Vanguardia 2026'}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#4c1d95', margin: '0 0 0.75rem 0', fontWeight: 600 }}>
                      {audit.mockup.title || 'Propuesta de rediseño web'}
                    </p>
                    {audit.mockup.previewHtml && (
                      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                        {/* Browser Window Header */}
                        <div style={{ background: '#f1f5f9', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                          </div>
                          <div style={{ flex: 1, background: 'white', padding: '2px 10px', borderRadius: '4px', fontSize: '11px', color: '#64748b', border: '1px solid #e2e8f0', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            🔒 {lead.website || 'https://rediseño-oficial.com'}
                          </div>
                        </div>
                        <iframe 
                          srcDoc={audit.mockup.previewHtml} 
                          title="Mockup Preview" 
                          style={{ width: '100%', height: '480px', border: 'none', background: 'white', display: 'block' }} 
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          {/* Footer */}
          <div style={{ background: '#f1f5f9', padding: '1rem 2rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(lead, null, 2));
                alert('¡JSON completo copiado al portapapeles!');
              }}
              style={{ background: 'white', border: '1px solid #cbd5e1', color: '#475569', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}
            >
              📋 Copiar JSON de diagnóstico
            </button>
            <button
              onClick={() => setSelectedAuditLead(null)}
              style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (viewingProject) {
    return (
      <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <button 
          onClick={() => { setViewingProject(null); setSelectedLead(null); }}
          style={{ background: 'transparent', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', marginBottom: '1.5rem', color: '#475569', alignSelf: 'flex-start' }}
        >
          <ChevronLeft size={16} /> Volver a empresas
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
            📥 Todo lo recibido
          </button>
          <button 
            onClick={() => { setActiveTab('COMPANIES'); setSelectedLead(null); }}
            style={{ background: 'none', border: 'none', borderBottom: activeTab === 'COMPANIES' ? '2px solid #10b981' : '2px solid transparent', color: activeTab === 'COMPANIES' ? '#10b981' : '#64748b', fontWeight: 600, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem' }}
          >
            🏢 Directorio de empresas
          </button>
          <button 
            onClick={() => { setActiveTab('ACTIVITIES'); setSelectedLead(null); }}
            style={{ background: 'none', border: 'none', borderBottom: activeTab === 'ACTIVITIES' ? '2px solid #f59e0b' : '2px solid transparent', color: activeTab === 'ACTIVITIES' ? '#f59e0b' : '#64748b', fontWeight: 600, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem' }}
          >
            ⚡ Actividades recientes
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
                      <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Fecha y origen</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Prospecto / empresa</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Contacto</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Auditoría IA y capturas</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Atributos y referidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, i) => {
                      const audit = parseLeadAudit(lead);
                      return (
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
                        <td style={{ padding: '1rem', verticalAlign: 'top' }}>
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
                        <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem', marginBottom: '4px' }}>
                            {lead.businessName || lead.contactName || 'Sin nombre'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 500 }}>
                              Estado: {lead.status || 'NUEVO'}
                            </span>
                            {audit.rating && (
                              <span style={{ background: '#fef08a', color: '#854d0e', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 600 }}>
                                ⭐ {audit.rating}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                          {lead.email && <div style={{ marginBottom: '4px' }}><a href={`mailto:${lead.email}`} style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>📧 {lead.email}</a></div>}
                          {lead.phone && lead.phone !== 'No disponible' && (
                            <div style={{ marginBottom: '4px' }}><a href={`tel:${lead.phone}`} style={{ color: '#10b981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>📞 {lead.phone}</a></div>
                          )}
                          {lead.website && lead.website !== 'No disponible' && (
                            <div><a href={lead.website} target="_blank" rel="noreferrer" style={{ color: '#6366f1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>🌐 Visitar web</a></div>
                          )}
                          {!lead.email && !lead.phone && !lead.website && <span style={{ color: '#94a3b8' }}>-</span>}
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                          {audit.hasAudit ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', minWidth: '170px' }}>
                              {audit.screenshots.length > 0 && (
                                <div 
                                  onClick={(e) => { e.stopPropagation(); setSelectedAuditLead(lead); setActiveScreenshotIdx(0); }}
                                  style={{ position: 'relative', cursor: 'pointer', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
                                  title="Clic para ver las 5 capturas en alta resolución"
                                >
                                  <img 
                                    src={audit.screenshots[0].url} 
                                    alt="Screenshot Preview" 
                                    style={{ width: '100%', height: '65px', objectFit: 'cover', display: 'block' }} 
                                  />
                                  <span style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(15, 23, 42, 0.85)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                                    📸 {audit.screenshots.length} capturas
                                  </span>
                                </div>
                              )}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {audit.mockup && (
                                  <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                                    🎨 Maqueta Stitch
                                  </span>
                                )}
                                {audit.technicalErrors.length > 0 && (
                                  <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                                    ⚠️ {audit.technicalErrors.length} téc.
                                  </span>
                                )}
                                {audit.visualErrors.length > 0 && (
                                  <span style={{ background: '#ffedd5', color: '#9a3412', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                                    👁️ {audit.visualErrors.length} visual.
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedAuditLead(lead); setActiveScreenshotIdx(0); }}
                                style={{
                                  background: '#0f172a',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.4rem 0.6rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                              >
                                <Sparkles size={12} color="#10b981" /> Ver auditoría IA
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Sin auditoría web</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                          {lead.metadata?.coupon ? (
                            <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              🎟️ Cupón / Referido: {lead.metadata.coupon}
                            </div>
                          ) : lead.metadata?.referredByName || lead.metadata?.referredByUserId ? (
                            <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              🎟️ Vino referido por: {lead.metadata.referredByName || lead.metadata.referredByUserId}
                            </div>
                          ) : lead.referredBy && lead.referredBy.name ? (
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
                    );})}
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
                  <ChevronLeft size={18} /> {t('portal.back_to_potential_companies', 'Volver a empresas potenciales')}
                </button>
              </div>

              {/* Cabecera del Perfil (Full Width) */}
              <div style={{ padding: '2rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem' }}>{selectedLead.businessName || selectedLead.contactName || 'Empresa desconocida'}</h2>
                    {(() => {
                      const audit = parseLeadAudit(selectedLead);
                      if (!audit.rating) return null;
                      return (
                        <span style={{ background: '#fef08a', color: '#854d0e', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                          ⭐ {audit.rating}
                        </span>
                      );
                    })()}
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem', marginTop: '1rem', flexWrap: 'wrap' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', background: '#dbeafe', color: '#1e40af', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                    Estado actual: {selectedLead.status || 'NUEVO'}
                  </span>
                  {(() => {
                    const audit = parseLeadAudit(selectedLead);
                    if (!audit.hasAudit) return null;
                    return (
                      <button
                        onClick={() => { setSelectedAuditLead(selectedLead); setActiveScreenshotIdx(0); }}
                        style={{
                          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 0.9rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Sparkles size={14} color="#10b981" /> Ver auditoría web y capturas HD ({audit.screenshots.length})
                      </button>
                    );
                  })()}
                </div>
              </div>

              {/* Muro de Actividades y Auditoría (Full Width) */}
              <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: '#f8fafc' }}>
                {(() => {
                  const audit = parseLeadAudit(selectedLead);
                  if (!audit.hasAudit) return null;
                  return (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', maxWidth: '950px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                        <h4 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                          <Sparkles size={18} color="#10b981" /> Auditoría web con Groq Vision
                        </h4>
                        <button
                          onClick={() => { setSelectedAuditLead(selectedLead); setActiveScreenshotIdx(0); }}
                          style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Layers size={14} /> Abrir galería completa
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📸 Capturas HD</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{audit.screenshots.length} guardadas</div>
                        </div>
                        <div style={{ background: '#fff5f5', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                          <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>⚠️ Errores técnicos</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626' }}>{audit.technicalErrors.length} detectados</div>
                        </div>
                        <div style={{ background: '#fffbeb', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                          <div style={{ fontSize: '0.75rem', color: '#92400e' }}>👁️ Errores visuales/UX</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#d97706' }}>{audit.visualErrors.length} detectados</div>
                        </div>
                        <div style={{ background: '#ecfdf5', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                          <div style={{ fontSize: '0.75rem', color: '#065f46' }}>⚡ Carga de web</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#059669' }}>
                            {audit.technicalAnalysis?.loadTimeMs ? `${audit.technicalAnalysis.loadTimeMs}ms` : 'Rápida (<1s)'}
                          </div>
                        </div>
                      </div>

                      {audit.detailedAnalysis && (
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                          <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>Diagnóstico de oportunidad (IA):</strong>
                          {audit.detailedAnalysis}
                        </div>
                      )}
                    </div>
                  );
                })()}

                <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={20} color="#3b82f6" /> Panel de actividades y correos con IA
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
                            <strong style={{ fontSize: '1.05rem', color: '#0f172a', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
  <span>{act.title} {act.metadata?.workflowName && <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 400 }}>— via {act.metadata.workflowName}</span>}</span>
  {(act.metadata?.coupon || selectedLead?.metadata?.coupon || selectedLead?.metadata?.referredByName || selectedLead?.metadata?.referredByUserId) && (
    <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      🎟️ Ref: {act.metadata?.coupon || selectedLead?.metadata?.coupon || selectedLead?.metadata?.referredByName || selectedLead?.metadata?.referredByUserId}
    </span>
  )}
</strong>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                              {new Date(act.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <CollapsibleActivityBody act={act} />
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
                    <Send size={18} /> Guardar nota
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem' }}>Directorio de empresas potenciales</h3>
              </div>
              
              {leads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <Building size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                  <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No hay empresas potenciales en seguimiento.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                  {leads.map(lead => {
                    const audit = parseLeadAudit(lead);
                    return (
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
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', paddingRight: '0.5rem' }}>{lead.businessName || lead.contactName || 'Sin nombre'}</h4>
                          {audit.rating && (
                            <span style={{ background: '#fef08a', color: '#854d0e', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 600, display: 'inline-block', marginTop: '4px' }}>
                              ⭐ {audit.rating}
                            </span>
                          )}
                        </div>
                        <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.3rem 0.8rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {lead.status}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem', flex: 1, marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Mail size={14} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.email || 'Sin correo'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Phone size={14} /> <span>{lead.phone || 'Sin teléfono'}</span>
                        </div>
                        
                        {(lead.metadata?.coupon || lead.metadata?.referredByName || lead.metadata?.referredByUserId || lead.referredBy) && (
                          <div style={{ marginTop: '0.25rem', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, width: 'fit-content' }}>
                            🎟️ Ref: {lead.metadata?.coupon || lead.metadata?.referredByName || lead.metadata?.referredByUserId || lead.referredBy?.name || lead.referredBy?.userId || 'Sí'}
                          </div>
                        )}

                        {audit.hasAudit && (
                          <div style={{ marginTop: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                                📸 {audit.screenshots.length} capturas
                              </span>
                              {audit.technicalErrors.length > 0 && (
                                <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                                  ⚠️ {audit.technicalErrors.length} téc.
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedAuditLead(lead); setActiveScreenshotIdx(0); }}
                              style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Sparkles size={11} color="#10b981" /> Auditoría
                            </button>
                          </div>
                        )}
                      </div>

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', color: '#3b82f6', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Abrir expediente</span>
                        <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                      </div>
                    </div>
                  );})}
                </div>
              )}
            </div>
          ) ) : (
            <div style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                ⚡ Línea de tiempo global del proyecto
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
                            <strong style={{ fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
  <span>{act.title} {act.metadata?.workflowName && <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 400 }}>— via {act.metadata.workflowName}</span>}</span>
  {(act.metadata?.coupon || act.lead?.metadata?.coupon || act.lead?.metadata?.referredByName || act.lead?.metadata?.referredByUserId) && (
    <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      🎟️ Ref: {act.metadata?.coupon || act.lead?.metadata?.coupon || act.lead?.metadata?.referredByName || act.lead?.metadata?.referredByUserId}
    </span>
  )}
</strong>
                            <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Building size={14} /> Empresa: {act.lead?.businessName || act.lead?.contactName || 'Desconocida'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', padding: '0.3rem 0.8rem', borderRadius: '16px', fontWeight: 500 }}>
                            {new Date(act.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <CollapsibleActivityBody act={act} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {renderAuditModal()}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Briefcase size={24} color="#10b981" />
          {t('admin_projects.management', 'Gestión de empresas (CRM global)')}
        </h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}
        >
          <Plus size={18} /> Nueva empresa
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
            Agregar empresa
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
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Total leads</div>
                </div>
              </div>

              <button 
                onClick={() => handleViewProject(project)}
                style={{ width: '100%', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
              >
                Abrir CRM de empresa
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#0f172a' }}>Registrar Nueva empresa</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Nombre de la empresa</label>
              <input 
                type="text" 
                value={newProject.name}
                onChange={e => setNewProject({...newProject, name: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                placeholder="Ej. Grupo Hormesis"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Sector / industria</label>
              <input 
                type="text" 
                value={newProject.industry}
                onChange={e => setNewProject({...newProject, industry: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                placeholder="Ej. Consultoría Tecnológica"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Descripción corta</label>
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
                Guardar empresa
              </button>
            </div>
          </div>
        </div>
      )}
      {renderAuditModal()}
    </div>
  );
}
