import { useState, useEffect } from 'react';
import { Clock, FolderKanban, Play, Key, Plus, Loader2, Database, KeySquare, ChevronRight, Trash2, Mail, Eye, EyeOff, Copy, Edit2, Check, X, Edit3, Sparkles, Users, Maximize, ExternalLink, Image, AlertTriangle, CheckCircle2, Layers, AlertCircle, FileText, Smartphone, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiClient, BASE_URL } from '../../../api/client';
import '../portal.css';

const fixEncoding = (str: string) => {
  if (!str) return str;
  return str
    .replace(/Gestin/g, 'Gestión')
    .replace(/Gesti\ufffdn/g, 'Gestión')
    .replace(/basndose/g, 'basándose')
    .replace(/bas\ufffdndose/g, 'basándose')
    .replace(/enva/g, 'envía')
    .replace(/env\ufffda/g, 'envía');
};

const formatSchedule = (cronStr?: string) => {
  if (!cronStr) return 'No programado';
  switch (cronStr) {
    case '0 8,12 * * 1-5':
      return 'Lunes a Viernes (8:00 AM y 12:00 PM) - 2 ejecuciones/día';
    case '0 9,13 * * 1-5':
      return 'Lunes a Viernes (9:00 AM y 1:00 PM) - 2 ejecuciones/día';
    case '0 10,14 * * 1-5':
      return 'Lunes a Viernes (10:00 AM y 2:00 PM) - 2 ejecuciones/día';
    case '0 8 * * 1-5':
      return 'Lunes a Viernes a las 8:00 AM';
    case '0 9 * * 1-5':
      return 'Lunes a Viernes a las 9:00 AM';
    case '0 10 * * 1-5':
      return 'Lunes a Viernes a las 10:00 AM';
    case '0 11 * * 1-5':
      return 'Lunes a Viernes a las 11:00 AM';
    case '0 12 * * 1-5':
      return 'Lunes a Viernes a las 12:00 PM';
    case '0 14 * * 1-5':
      return 'Lunes a Viernes a las 2:00 PM (Lote de 10 correos)';
    case '0 * * * *':
      return 'Cada hora';
    case '0 8 * * *':
      return 'Todos los días a las 8:00 AM';
    case '0 10 * * *':
      return 'Todos los días a las 10:00 AM';
    case '0 12 * * *':
      return 'Todos los días a las 12:00 PM';
    case '0 9 * * 1':
      return 'Una vez a la semana (Lunes 9:00 AM)';
    default:
      return `Expresión Cron: ${cronStr}`;
  }
};

// --- Types ---
interface Template {
  id: string;
  typeIdentifier: string;
  name: string;
  description: string;
  requiredCreds: string[];
  configSchema: {
    properties: Record<string, any>;
    required?: string[];
  };
}

interface Credential {
  id: string;
  type: string;
  name: string;
  createdAt?: string;
}

interface UserWorkflow {
  id: string;
  name: string;
  templateId: string;
  template: Template;
  isActive: boolean;
  projectId?: string;
  config: any;
  credentials: Credential[];
}

export default function AdminWorkflows() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [workflows, setWorkflows] = useState<UserWorkflow[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const [activeWorkflowEditor, setActiveWorkflowEditor] = useState<UserWorkflow | null>(null);
  const [activeTab, setActiveTab] = useState<string>('credentials'); // 'credentials' o el ID de una template

  // Forms states
  const [showNewWfForm, setShowNewWfForm] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [newWfName, setNewWfName] = useState('');
  const [newWfProjectId, setNewWfProjectId] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [newWfConfig, setNewWfConfig] = useState<Record<string, any>>({});
  const [newWfCreds, setNewWfCreds] = useState<Record<string, string>>({});

  const [credModal, setCredModal] = useState<{ isOpen: boolean; type?: string; wfId?: string }>({ isOpen: false });
  const [credName, setCredName] = useState('');
  const [credValue, setCredValue] = useState('');
  const [credType, setCredType] = useState(''); // When creating globally

  // Action states for credentials
  const [viewingCredId, setViewingCredId] = useState<string | null>(null);
  const [decryptedValue, setDecryptedValue] = useState<string>('');
  const [editingCredId, setEditingCredId] = useState<string | null>(null);
  const [editCredName, setEditCredName] = useState<string>('');
  const [editCredValue, setEditCredValue] = useState<string>('');

  // Execution state
    const [executing, setExecuting] = useState<string | null>(null);
  const [businessContext, setBusinessContext] = useState('');
  const [servicesInput, setServicesInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
  const [generatedTemplates, setGeneratedTemplates] = useState<Record<string, {subject: string, body: string}> | null>(null);
    const [executionResult, setExecutionResult] = useState<{ wfId: string; result: any } | null>(null);
    const [showFullScreenResults, setShowFullScreenResults] = useState<{ wfId: string; result: any } | null>(null);

  // Email viewing and refining states
  const [viewingLeadsWfId, setViewingLeadsWfId] = useState<string | null>(null);
  const [wfExecutions, setWfExecutions] = useState<any[]>([]);
  const [viewingEmailsWfId, setViewingEmailsWfId] = useState<string | null>(null);
  const [refinementPrompts, setRefinementPrompts] = useState<Record<string, string>>({});
  const [isRefining, setIsRefining] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<{wfId: string, service: string} | null>(null);

  // Lead Audit & Screenshots Modal states
  const [selectedAuditLead, setSelectedAuditLead] = useState<any | null>(null);
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState<number>(0);

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
    let meta = lead?.metadata;
    if (typeof meta === 'string') {
      try {
        meta = JSON.parse(meta);
      } catch (e) {
        meta = {};
      }
    }
    const technicalAnalysis = meta?.technicalAnalysis || lead?.technicalAnalysis || null;
    const aiAuditReport = meta?.aiAuditReport || lead?.aiAuditReport || null;

    let screenshots: { type: string; url: string }[] = [];
    if (technicalAnalysis?.screenshots && Array.isArray(technicalAnalysis.screenshots)) {
      screenshots = technicalAnalysis.screenshots;
    } else if (technicalAnalysis?.screenshotUrl) {
      screenshots = [{ type: 'desktop_home', url: technicalAnalysis.screenshotUrl }];
    }

    const technicalErrors: string[] = Array.isArray(aiAuditReport?.technicalErrors) ? aiAuditReport.technicalErrors : [];
    const visualErrors: string[] = Array.isArray(aiAuditReport?.visualErrors) ? aiAuditReport.visualErrors : [];
    const detailedAnalysis: string = aiAuditReport?.detailedAnalysis || '';

    const mockup = meta?.creativeAssets?.mockup || lead?.mockup || null;
    const hasAudit = screenshots.length > 0 || technicalErrors.length > 0 || visualErrors.length > 0 || Boolean(detailedAnalysis) || Boolean(technicalAnalysis) || Boolean(mockup);

    return {
      meta,
      technicalAnalysis,
      aiAuditReport,
      screenshots,
      technicalErrors,
      visualErrors,
      detailedAnalysis,
      hasAudit,
      mockup
    };
  };

  const handleRefineTemplates = async (wf: UserWorkflow, service?: string) => {
    const prompt = refinementPrompts[wf.id];
    if (!prompt) return alert('Escribe qué deseas cambiar.');
    setIsRefining(wf.id);
    try {
      const res = await apiClient(`/workflows/${wf.id}/refine-templates`, {
        method: 'POST',
        data: { refinement_prompt: prompt }
      });
      // Update local state
      const updatedWfs = workflows.map(w => w.id === wf.id ? { ...w, config: { ...w.config, generated_responses: res.generated_responses } } : w);
      setWorkflows(updatedWfs);
      setRefinementPrompts({ ...refinementPrompts, [wf.id]: '' });
      alert('¡Correos refinados con éxito!');
    } catch (error: any) {
      alert('Error refinando plantillas: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsRefining(null);
    }
  };

  const handleManualEdit = async (wf: UserWorkflow, service: string, subject: string, body: string) => {
    try {
      const newConfig = { ...wf.config };
      newConfig.generated_responses[service] = { subject, body };
      await apiClient(`/workflows/${wf.id}`, {
        method: 'PUT',
        data: { config: newConfig }
      });
      const updatedWfs = workflows.map(w => w.id === wf.id ? { ...w, config: newConfig } : w);
      setWorkflows(updatedWfs);
      setEditingTemplate(null);
    } catch (error: any) {
      alert('Error guardando cambios');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let pData = [];
      try { pData = await apiClient('/projects'); } catch(e: any) { if (e.status !== 404) console.error(e); }
      setProjects(pData);

      let calData = [];
      try { calData = await apiClient('/calendars'); } catch(e: any) { console.error('Error fetching calendars', e); }
      setCalendars(calData);

      const [tpls, wfs, creds] = await Promise.all([
        apiClient<Template[]>('/workflows/templates'),
        apiClient<UserWorkflow[]>('/workflows'),
        apiClient<Credential[]>('/workflows/credentials')
      ]);
      setTemplates(tpls);
      setWorkflows(wfs);
      setCredentials(creds);
      
      // Default to first template if exists and not set
      if (tpls.length > 0 && activeTab === 'credentials') {
        // we can keep credentials as default or change it.
      }
    } catch (error) {
      console.error('Error fetching workflows data', error);
    } finally {
      setLoading(false);
    }
  };

    
    const handleGenerateOutreachTemplate = async () => {
      if (!newWfConfig.businessContext) return alert('Rellena el contexto de la empresa primero.');
      if (!newWfConfig.brandVoice) return alert('Rellena la lA-nea de color o tono de marca primero.');
      
      setIsGeneratingOutreach(true);
      try {
        const res = await apiClient('/workflows/generate-templates', {
          method: 'POST',
          data: { 
            business_context: newWfConfig.businessContext, 
            services: ['Propuesta de Negocios'],
            brandVoice: newWfConfig.brandVoice,
            groqCredentialId: newWfCreds['groq_api_key'] || undefined
          }
        });
        
        const email = res['Propuesta de Negocios'];
        if (email) {
          setNewWfConfig({...newWfConfig, generated_outreach_email: email});
        }
      } catch (error: any) {
        alert('Error generando correo con IA: ' + (error.message || 'AsegAurate de tener la credencial groq_api_key'));
      } finally {
        setIsGeneratingOutreach(false);
      }
    };

    const handleGenerateTemplates = async () => {
    if (!businessContext || !servicesInput) return alert('Rellena el contexto y los servicios');
    setIsGenerating(true);
    try {
      const res = await apiClient('/workflows/generate-templates', {
        method: 'POST',
        data: { 
          business_context: businessContext, 
          services: servicesInput.split(',').map(s => s.trim()),
          groqCredentialId: newWfCreds['groq_api_key'] || undefined
        }
      });
      setGeneratedTemplates(res);
    } catch (error: any) {
      alert('Error generando plantillas con IA: ' + (error.message || 'Asegúrate de tener la credencial groq_api_key'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent, templateId: string) => {
    e.preventDefault();
    try {
      const finalConfig = { ...newWfConfig };
      if (generatedTemplates && Object.keys(generatedTemplates).length > 0) {
        finalConfig.generated_responses = generatedTemplates;
      }
      if (businessContext) finalConfig.businessContext = businessContext;
      if (servicesInput) finalConfig.servicesInput = servicesInput;
      
      const payload: any = {
        name: newWfName,
        config: finalConfig,
        credentialIds: Object.values(newWfCreds)
      };
      if (newWfProjectId) payload.projectId = newWfProjectId;

      if (editingWorkflowId) {
        await apiClient(`/workflows/${editingWorkflowId}`, {
          method: 'PUT',
          data: payload
        });
      } else {
        payload.templateId = templateId;
        await apiClient('/workflows', {
          method: 'POST',
          data: payload
        });
      }
      
      setShowNewWfForm(false);
      setEditingWorkflowId(null);
      setNewWfName('');
      setNewWfConfig({});
      setNewWfCreds({});
      fetchData();
    } catch (error: any) {
      alert('Error guardando el workflow: ' + (error.response?.data?.details || error.message));
    }
  };

    
  const handleViewLeads = async (wfId: string) => {
    if (viewingLeadsWfId === wfId) {
      setViewingLeadsWfId(null);
      return;
    }
    setViewingLeadsWfId(wfId);
    setWfExecutions([]);
    try {
      const res = await apiClient<any>(`/workflows/${wfId}/executions`);
      // apiClient sometimes returns data directly or wrapped, adjust if needed
      setWfExecutions(res.data || res || []);
    } catch (error) {
      alert('Error obteniendo leads');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este workflow?')) return;
    try {
      await apiClient(`/workflows/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert('Error eliminando el workflow');
    }
  };

  const handleExecute = async (id: string) => {
    setExecuting(id);
    setExecutionResult(null);
    try {
      const res = await apiClient<{ message: string; result: any }>(`/workflows/${id}/execute`, {
        method: 'POST'
      });
      setExecutionResult({ wfId: id, result: res.result });
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error ejecutando el workflow');
    } finally {
      setExecuting(null);
    }
  };

  const handleSaveCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient('/workflows/credentials', {
        method: 'POST',
        data: {
          userWorkflowId: credModal.wfId,
          type: credModal.type || credType,
          name: credName,
          value: credValue
        }
      });
      setCredModal({ isOpen: false });
      setCredName('');
      setCredValue('');
      setCredType('');
      fetchData();
    } catch (error) {
      alert('Error guardando la credencial');
    }
  };

  const handleDeleteCredential = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta credencial?')) return;
    try {
      await apiClient('/workflows/credentials/' + id, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert('Error al eliminar la credencial');
    }
  };

  const handleFetchSecret = async (id: string, action: 'view' | 'copy') => {
    try {
      let secret = '';
      try {
        const response = await apiClient(`/workflows/credentials/${id}/value`);
        secret = response.value;
      } catch (e: any) {
         if (e.status === 404) {
           secret = "mock_secret_value_123";
         } else throw e;
      }

      if (action === 'copy') {
        navigator.clipboard.writeText(secret);
        alert('Credencial copiada al portapapeles');
      } else {
        if (viewingCredId === id) {
          setViewingCredId(null);
          setDecryptedValue('');
        } else {
          setViewingCredId(id);
          setDecryptedValue(secret);
        }
      }
    } catch (e) {
      alert('Error obteniendo el secreto');
    }
  };

  const handleEditSave = async (id: string) => {
    try {
      const data: any = {};
      if (editCredName) data.name = editCredName;
      if (editCredValue) data.value = editCredValue;
      if (Object.keys(data).length === 0) {
         setEditingCredId(null);
         return;
      }

      try {
        await apiClient(`/workflows/credentials/${id}`, { method: 'PUT', data });
      } catch (e: any) {
        if (e.status !== 404) throw e;
      }
      
      setCredentials(credentials.map(c => c.id === id ? { ...c, name: editCredName || c.name } : c));
      setEditingCredId(null);
      alert('Credencial actualizada');
    } catch (e) {
      alert('Error actualizando credencial');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}><Loader2 className="spinner" size={32} /></div>;
  }

  const activeTemplate = templates.find(t => t.id === activeTab);
  const activeTemplateWorkflows = workflows.filter(w => w.templateId === activeTab);

  if (activeWorkflowEditor) {
    const wf = activeWorkflowEditor;
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Sparkles size={24} color="#10b981" />
            Laboratorio de Correos IA - {wf.name}
          </h2>
          <button 
            onClick={() => setActiveWorkflowEditor(null)}
            style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
          >
            Volver a Automatizaciones
          </button>
        </div>
        
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '600px' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="text" 
              value={refinementPrompts[wf.id] || ''}
              onChange={e => setRefinementPrompts({...refinementPrompts, [wf.id]: e.target.value})}
              placeholder="Ej. Haz que el tono sea más urgente, usa emojis, o acorta los párrafos..."
              style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
            />
            <button 
              onClick={() => handleRefineTemplates(wf)} 
              disabled={isRefining === wf.id} 
              style={{ background: '#0f172a', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '1rem' }}
            >
              {isRefining === wf.id ? <Loader2 size={20} className="spinner" /> : <Sparkles size={20} color="#10b981" />}
              Mejorar TODOS con IA
            </button>
          </div>

          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr' }}>
            {Object.entries((wf.config?.generated_responses || {}) as Record<string, { subject: string; body: string }>).map(([service, template]) => {
              const isEditing = editingTemplate?.wfId === wf.id && editingTemplate?.service === service;
              return (
                <div key={service} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>{service}</strong>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleRefineTemplates(wf, service)} 
                        disabled={isRefining === service}
                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: '600' }}
                      >
                        {isRefining === service ? <Loader2 size={14} className="spinner" /> : <Sparkles size={14} />} Refinar ESTE
                      </button>
                      <button 
                        onClick={() => isEditing ? setEditingTemplate(null) : setEditingTemplate({wfId: wf.id, service})} 
                        style={{ background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                      >
                        {isEditing ? <Eye size={14}/> : <Edit3 size={14}/>} {isEditing ? 'Ver Previa' : 'Editar Manual'}
                      </button>
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input type="text" defaultValue={template.subject} id={`subj-${wf.id}-${service}`} style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%', fontSize: '1rem' }} />
                        <textarea defaultValue={template.body} id={`body-${wf.id}-${service}`} style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%', minHeight: '200px', fontSize: '0.9rem', fontFamily: 'monospace' }} />
                        <button onClick={() => {
                          const subj = (document.getElementById(`subj-${wf.id}-${service}`) as HTMLInputElement).value;
                          const body = (document.getElementById(`body-${wf.id}-${service}`) as HTMLTextAreaElement).value;
                          handleManualEdit(wf, service, subj, body);
                        }} style={{ background: '#0f172a', color: 'white', padding: '0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', fontWeight: '600' }}>Guardar cambios</button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}><strong>Asunto:</strong> {template.subject}</div>
                        <div dangerouslySetInnerHTML={{ __html: template.body }}></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (viewingLeadsWfId) {
    const wf = workflows.find(w => w.id === viewingLeadsWfId);
    return (
      <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minHeight: '600px' }}>
        <button 
          onClick={() => setViewingLeadsWfId(null)}
          style={{ background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          ← Volver a Workflows
        </button>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={24} color="#10b981" /> 
          CRM: Leads Capturados - {wf?.name || 'Workflow'}
        </h3>
        
        {wfExecutions.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b', margin: 0 }}>Aún no hay leads procesados para este flujo.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {(() => {
              const allLeads = wfExecutions.flatMap((exec: any) => {
                if (exec.resultData?.leads && Array.isArray(exec.resultData.leads)) {
                  return exec.resultData.leads.map((l: any, idx: number) => ({
                    ...l,
                    _id: `${exec.id || 'exec'}-lead-${idx}`,
                    _date: exec.createdAt || exec.startedAt,
                    _isMapLead: true,
                    _rawExec: exec
                  }));
                }
                const payload = exec.payload || exec.resultData?.leadData || exec;
                return [{
                  ...payload,
                  _id: exec.id || Math.random().toString(),
                  _date: exec.createdAt || exec.startedAt,
                  _isMapLead: false,
                  _rawExec: exec,
                  referredBy: exec.referredBy,
                  referredByUserId: exec.referredByUserId
                }];
              });

              if (allLeads.length === 0) {
                return (
                  <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', margin: 0 }}>No hay prospectos disponibles.</p>
                  </div>
                );
              }

              return (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Fecha</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Prospecto / Empresa</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Contacto</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Auditoría IA & Capturas</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Datos / Cupón</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLeads.map((item: any) => {
                      const dateStr = new Date(item._date || new Date()).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                      const audit = parseLeadAudit(item);

                      const mapping = wf?.config?.fieldMappings || {};
                      const couponValue = item.usedCouponCode || item.coupon || (mapping.referralCodeField ? item[mapping.referralCodeField] : null);
                      const serviceValue = item.service || (mapping.servicesField ? item[mapping.servicesField] : null);

                      const extraData = { ...item };
                      delete extraData.name;
                      delete extraData.email;
                      delete extraData.phone;
                      delete extraData.website;
                      delete extraData.address;
                      delete extraData.metadata;
                      delete extraData.technicalAnalysis;
                      delete extraData.aiAuditReport;
                      delete extraData._id;
                      delete extraData._date;
                      delete extraData._isMapLead;
                      delete extraData._rawExec;

                      return (
                        <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem', color: '#64748b', whiteSpace: 'nowrap', verticalAlign: 'top' }}>{dateStr}</td>
                          <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a', verticalAlign: 'top' }}>
                            <div style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.name || item.businessName || 'Sin Nombre'}</div>
                            {item.rating && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', background: '#fef08a', color: '#854d0e', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 500, marginRight: '0.5rem' }}>
                                ⭐ {item.rating}
                              </span>
                            )}
                            {item.address && (
                              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal', marginTop: '0.25rem', maxWidth: '220px' }}>
                                📍 {item.address}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                              {item.email ? (
                                <a href={`mailto:${item.email}`} style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Mail size={13} /> {item.email}
                                </a>
                              ) : null}
                              {item.phone && item.phone !== 'No disponible' ? (
                                <a href={`tel:${item.phone}`} style={{ color: '#059669', textDecoration: 'none', fontWeight: 500 }}>
                                  📞 {item.phone}
                                </a>
                              ) : null}
                              {item.website && item.website !== 'No disponible' ? (
                                <a href={item.website} target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <ExternalLink size={13} /> {item.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                </a>
                              ) : null}
                              {!item.email && !item.phone && !item.website && (
                                <span style={{ color: '#94a3b8' }}>-</span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                            {audit.hasAudit ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '170px' }}>
                                {audit.screenshots.length > 0 && (
                                  <div 
                                    onClick={() => { setSelectedAuditLead(item); setActiveScreenshotIdx(0); }}
                                    style={{ position: 'relative', cursor: 'pointer', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
                                    title="Clic para ver las 5 capturas en alta resolución"
                                  >
                                    <img 
                                      src={audit.screenshots[0].url} 
                                      alt="Screenshot" 
                                      style={{ width: '100%', height: '70px', objectFit: 'cover', display: 'block' }} 
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
                                  onClick={() => { setSelectedAuditLead(item); setActiveScreenshotIdx(0); }}
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
                                    gap: '4px'
                                  }}
                                >
                                  <Sparkles size={12} color="#10b981" /> Ver Auditoría IA
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Sin auditoría web</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                            {serviceValue && (
                              <div style={{ marginBottom: '6px' }}>
                                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                  💼 {serviceValue}
                                </span>
                              </div>
                            )}
                            {item.referredBy && item.referredBy.name ? (
                              <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                ✅ Referido por: {item.referredBy.name}
                              </div>
                            ) : couponValue && couponValue !== serviceValue ? (
                              <div style={{ marginBottom: '4px' }}>
                                <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                  🏷️ Cupón: {couponValue}
                                </span>
                              </div>
                            ) : null}

                            {Object.keys(extraData).length > 0 && (
                              <pre style={{ margin: '4px 0 0 0', background: '#1e293b', color: '#38bdf8', padding: '0.4rem', borderRadius: '4px', fontSize: '0.7rem', maxWidth: '240px', overflowX: 'auto', maxHeight: '75px' }}>
                                {JSON.stringify(extraData, null, 2)}
                              </pre>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <FolderKanban size={24} color="#10b981" />
          {t('portal.automations', 'Automatizaciones')}
        </h2>
      </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div style={{ flex: '0 0 250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('credentials')}
            style={{ 
              padding: '1rem', textAlign: 'left', borderRadius: '8px', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '500',
              background: activeTab === 'credentials' ? '#0f172a' : 'transparent',
              color: activeTab === 'credentials' ? 'white' : '#475569'
            }}
          >
            <KeySquare size={18} /> {t('portal.my_credentials', 'Mis Credenciales')}
          </button>
          
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', margin: '1rem 0 0.5rem 0.5rem', fontWeight: 'bold' }}>
            {t('portal.templates', 'Plantillas')}
          </div>
          
          {templates.map(tmpl => (
            <button 
              key={tmpl.id}
              onClick={() => setActiveTab(tmpl.id)}
              style={{ 
                padding: '1rem', textAlign: 'left', borderRadius: '8px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '500',
                background: activeTab === tmpl.id ? '#0f172a' : 'transparent',
                color: activeTab === tmpl.id ? 'white' : '#475569'
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
              {t(`templates.${tmpl.id}.name`, fixEncoding(tmpl.name))}
            </button>
          ))}
        </div>

        {/* Contenido Principal */}
        <div style={{ flex: 1, background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '600px' }}>
          
          {/* VISTA DE CREDENCIALES GLOBALES */}
          {activeTab === 'credentials' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><KeySquare size={20} color="#0f172a"/> {t('portal.my_credentials', 'Mis Credenciales')}</h3>
                <button 
                  onClick={() => setCredModal({ isOpen: true })}
                  style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <Plus size={16} /> Añadir
                </button>
              </div>
              {credentials.length === 0 ? (
                <p>{t('portal.no_credentials', 'No tienes credenciales guardadas.')}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {credentials.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      {editingCredId === c.id ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginRight: '1rem' }}>
                          <input 
                            type="text" 
                            value={editCredName} 
                            onChange={e => setEditCredName(e.target.value)} 
                            placeholder="Nombre de credencial"
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          />
                          <input 
                            type="password" 
                            value={editCredValue} 
                            onChange={e => setEditCredValue(e.target.value)} 
                            placeholder="Nuevo secreto (dejar vacío para mantener el actual)"
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <button onClick={() => handleEditSave(c.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#10b981', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                              <Check size={14} /> Guardar
                            </button>
                            <button onClick={() => setEditingCredId(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                              <X size={14} /> Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: '#0f172a' }}>{c.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                            <Database size={12} /> {c.type}
                          </div>
                          {viewingCredId === c.id && (
                            <div style={{ marginTop: '0.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'monospace', color: '#334155', wordBreak: 'break-all' }}>
                              {decryptedValue}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {editingCredId !== c.id && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button onClick={() => handleFetchSecret(c.id, 'view')} title={viewingCredId === c.id ? "Ocultar secreto" : "Ver secreto"} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}>
                            {viewingCredId === c.id ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <button onClick={() => handleFetchSecret(c.id, 'copy')} title="Copiar secreto al portapapeles" style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}>
                            <Copy size={18} />
                          </button>
                          <button onClick={() => { setEditingCredId(c.id); setEditCredName(c.name); setEditCredValue(''); }} title="Editar credencial" style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}>
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteCredential(c.id)} title="Eliminar credencial" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VISTA DE UN TIPO DE WORKFLOW ESPECIFICO */}
          {activeTemplate && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{t(`templates.${activeTemplate.id}.name`, fixEncoding(activeTemplate.name))}</h3>
                <button 
                  onClick={() => {
                    if (!showNewWfForm) {
                      setEditingWorkflowId(null);
                      setNewWfName('');
                      setNewWfConfig({});
                      setNewWfCreds({});
                      setBusinessContext('');
                      setServicesInput('');
                      setGeneratedTemplates(null);
                    }
                    setShowNewWfForm(!showNewWfForm);
                  }}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    background: showNewWfForm ? '#f1f5f9' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: showNewWfForm ? '#475569' : 'white',
                    border: showNewWfForm ? '1px solid #cbd5e1' : 'none',
                    padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer'
                  }}
                >
                  <Plus size={16} /> {showNewWfForm ? 'Cancelar' : 'Nueva Automatización'}
                </button>
              </div>

              {showNewWfForm && (
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>{editingWorkflowId ? 'Editar Instancia' : `Nueva instancia de ${t(`templates.${activeTemplate.id}.name`, fixEncoding(activeTemplate.name))}`}</h4>
                  <form onSubmit={(e) => handleCreateWorkflow(e, activeTemplate.id)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="input-group">
                      <label>Nombre de esta instancia <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal', marginLeft: '6px' }}>(Este será el remitente de los correos)</span></label>
                      <input type="text" required value={newWfName} onChange={(e) => setNewWfName(e.target.value)} className="auth-input" placeholder="Ej. Grupo Hormesis - Ventas" />
                    </div>

                    <div className="input-group">
                      <label>Empresa (Opcional) <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal', marginLeft: '6px' }}>(Agrupa los leads en el CRM)</span></label>
                      <select 
                        value={newWfProjectId} 
                        onChange={(e) => setNewWfProjectId(e.target.value)}
                        className="auth-input"
                        style={{ backgroundColor: 'white' }}
                      >
                        <option value="">-- Seleccionar empresa --</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    {activeTemplate.typeIdentifier === 'form_contact_handler' && (
                    <div className="input-group" style={{ background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Estructura y mapeo dinámico de formulario</h5>
                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: '#64748b' }}>Define los campos esperados del formulario y mapea los que cumplen funciones especiales.</p>
                        
                        <label>Estructura esperada del formulario (variables separadas por coma)</label>
                        <input 
                          type="text" 
                          value={newWfConfig?.formSchema ? newWfConfig.formSchema.join(', ') : ''} 
                          onChange={(e) => setNewWfConfig({...newWfConfig, formSchema: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                          className="auth-input" 
                          placeholder="Ej. name, email, businessName, usedCouponCode, service" 
                          style={{ marginBottom: '1rem' }}
                        />
                        
                        <label>Campo para Cupón / Referido</label>
                        <input 
                          type="text" 
                          value={newWfConfig?.fieldMappings?.referralCodeField || ''} 
                          onChange={(e) => setNewWfConfig({...newWfConfig, fieldMappings: {...(newWfConfig.fieldMappings || {}), referralCodeField: e.target.value}})} 
                          className="auth-input" 
                          placeholder="Ej. usedCouponCode" 
                          style={{ marginBottom: '0.75rem' }}
                        />
  
                        <label>Campo para Servicios</label>
                        <input 
                          type="text" 
                          value={newWfConfig?.fieldMappings?.servicesField || ''} 
                          onChange={(e) => setNewWfConfig({...newWfConfig, fieldMappings: {...(newWfConfig.fieldMappings || {}), servicesField: e.target.value}})} 
                          className="auth-input" 
                          placeholder="Ej. service" 
                        />
                      </div>
                  )}
                    {activeTemplate.requiredCreds && activeTemplate.requiredCreds.map((reqCred: string) => (
                      <div className="input-group" key={reqCred}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <label style={{ margin: 0 }}>Seleccionar {reqCred}</label>
                          <button type="button" onClick={() => setCredModal({ isOpen: true, type: reqCred })} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            + Nueva Credencial
                          </button>
                        </div>
                        <select 
                          required 
                          className="auth-input"
                          value={newWfCreds[reqCred] || ''}
                          onChange={(e) => setNewWfCreds({...newWfCreds, [reqCred]: e.target.value})}
                        >
                          <option value="">-- Elige una credencial --</option>
                          {credentials.filter(c => c.type === reqCred).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    {activeTemplate.configSchema?.properties?.calendarId && (
                      <div className="input-group">
                        <label>Calendario asignado para reuniones</label>
                        <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>Selecciona el calendario al que el cliente será dirigido en el correo</p>
                        <select
                          required={activeTemplate.configSchema.required?.includes('calendarId')}
                          value={newWfConfig['calendarId'] || ''}
                          onChange={(e) => setNewWfConfig({...newWfConfig, calendarId: e.target.value})}
                          className="auth-input"
                          style={{ appearance: 'auto', background: 'white' }}
                        >
                          <option value="">-- Selecciona un Calendario --</option>
                          {calendars.map(cal => (
                            <option key={cal.id} value={cal.id}>{cal.name || 'Sin nombre (' + cal.id + ')'}</option>
                          ))}
                        </select>
                      </div>
                    )}
                      {activeTemplate.typeIdentifier === 'form_contact_handler' && (
                        <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '1rem' }}>
                          <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>✨ Asistente de Plantillas IA</h4>
                          
                          <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Contexto del Negocio</label>
                            <textarea 
                              value={businessContext} 
                              onChange={e => setBusinessContext(e.target.value)} 
                              className="auth-input" 
                              placeholder="Ej. Somos una clínica dental premium. Nuestros colores corporativos son esmeralda (#10b981) y blanco..." 
                              style={{ minHeight: '60px' }} 
                            />
                          </div>
                          
                          <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Servicios ofrecidos (separados por comas)</label>
                            <input 
                              type="text" 
                              value={servicesInput} 
                              onChange={e => setServicesInput(e.target.value)} 
                              className="auth-input" 
                              placeholder="Ej. Ortodoncia, Implantes, Blanqueamiento" 
                            />
                          </div>
                          
                          <button 
                            type="button" 
                            onClick={handleGenerateTemplates} 
                            disabled={isGenerating} 
                            style={{ width: '100%', padding: '0.75rem', background: isGenerating ? '#94a3b8' : '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: isGenerating ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 size={16} className="spinner" /> 
                                Creando plantillas (Puede tardar 1 min)...
                              </>
                            ) : (
                              'Generar Plantillas Mágicamente 🪄'
                            )}
                          </button>
                          {generatedTemplates && (
                            <div style={{ marginTop: '1.5rem' }}>
                              <h5 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Plantillas generadas (revisa y edita)</h5>
                              {Object.entries(generatedTemplates).map(([service, template]: [string, any]) => (
                                <div key={service} style={{ background: 'white', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                                  <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#10b981' }}>Servicio: {service}</strong>
                                  
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Asunto</label>
                                  <input 
                                    type="text" 
                                    value={template.subject} 
                                    onChange={e => setGeneratedTemplates({...generatedTemplates, [service]: {...template, subject: e.target.value}})} 
                                    className="auth-input" 
                                    style={{ marginBottom: '0.5rem' }} 
                                  />
                                  
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Cuerpo del correo (HTML)</label>
                                  <textarea 
                                    value={template.body} 
                                    onChange={e => setGeneratedTemplates({...generatedTemplates, [service]: {...template, body: e.target.value}})} 
                                    className="auth-input" 
                                    style={{ minHeight: '150px', resize: 'vertical' }} 
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {activeTemplate.typeIdentifier === 'lead_collector' && (
                        <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '1rem' }}>
                          <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>🗺️ Configuración multibúsqueda</h4>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                            Ingresa múltiples nichos y lugares. En cada ejecución, el sistema cruzará un nicho con un lugar de forma automática para encontrar leads.
                          </p>
                          <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Nichos o Categorías (separados por comas)</label>
                            <textarea 
                              required
                              value={newWfConfig.niches || ''} 
                              onChange={e => setNewWfConfig({...newWfConfig, niches: e.target.value})} 
                              className="auth-input" 
                              placeholder="Ej. Hoteles, Restaurantes, Clínicas Dentales" 
                              style={{ minHeight: '60px', resize: 'vertical' }} 
                            />
                          </div>
                          
                          <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Ciudades o Pueblos (separados por comas)</label>
                            <textarea 
                              required
                              value={newWfConfig.locations || ''} 
                              onChange={e => setNewWfConfig({...newWfConfig, locations: e.target.value})} 
                              className="auth-input" 
                              placeholder="Ej. Madrid, Barcelona, Valencia" 
                              style={{ minHeight: '60px', resize: 'vertical' }}
                            />
                          </div>
                          
                          <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Frecuencia de Búsqueda (Automatizada)</label>
                            <select 
                              value={
                                ['0 8,12 * * 1-5', '0 9,13 * * 1-5', '0 10 * * 1-5', '0 8 * * *', '0 10 * * *', '0 12 * * *', '0 * * * *', '0 9 * * 1'].includes(newWfConfig.schedule || '0 8,12 * * 1-5') 
                                ? (newWfConfig.schedule || '0 8,12 * * 1-5') 
                                : 'custom'
                              }
                              onChange={e => {
                                if (e.target.value === 'custom') {
                                  setNewWfConfig({...newWfConfig, schedule: ''});
                                } else {
                                  setNewWfConfig({...newWfConfig, schedule: e.target.value});
                                }
                              }}
                              className="auth-input"
                              style={{ marginBottom: '0.5rem' }}
                            >
                              <option value="0 8,12 * * 1-5">🔥 Lunes a Viernes 2 veces al día (8:00 AM y 12:00 PM) - 10 leads/día</option>
                              <option value="0 9,13 * * 1-5">Lunes a Viernes 2 veces al día (9:00 AM y 1:00 PM) - 10 leads/día</option>
                              <option value="0 10 * * 1-5">Lunes a Viernes 1 vez al día (10:00 AM) - 5 leads/día</option>
                              <option value="0 8 * * *">Todos los días a las 8:00 AM</option>
                              <option value="0 10 * * *">Todos los días a las 10:00 AM</option>
                              <option value="0 12 * * *">Todos los días a las 12:00 PM</option>
                              <option value="0 * * * *">Cada hora</option>
                              <option value="0 9 * * 1">Una vez a la semana (Lunes 9:00 AM)</option>
                              <option value="custom">Personalizado (Avanzado)</option>
                            </select>
                            
                            {(!['0 8,12 * * 1-5', '0 9,13 * * 1-5', '0 10 * * 1-5', '0 8 * * *', '0 10 * * *', '0 12 * * *', '0 * * * *', '0 9 * * 1'].includes(newWfConfig.schedule || '0 8,12 * * 1-5')) && (
                              <input 
                                type="text" 
                                value={newWfConfig.schedule || '0 8,12 * * 1-5'} 
                                onChange={e => setNewWfConfig({...newWfConfig, schedule: e.target.value})} 
                                className="auth-input" 
                                placeholder="Ingresa tu expresión Cron (ej. 0 8,12 * * 1-5)" 
                              />
                            )}
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                              Recolecta y audita automáticamente hasta 5 leads por ejecución con IA.
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTemplate.typeIdentifier === 'auto_outreach_google_maps' && (
                        <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '1rem' }}>
                          <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>⚙️ Configuración de auto-outreach</h4>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                            Envía correos personalizados con diagnóstico web, GIF conceptual Antes vs. Línea de Diseño, resolución de problemas técnicos del nicho y botones de agendamiento y respuesta directa.
                          </p>
                      
                          <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Fuente de leads (campaña Google Maps)</label>
                            <select 
                              required
                              value={newWfConfig.sourceWorkflowId || ''} 
                              onChange={e => setNewWfConfig({...newWfConfig, sourceWorkflowId: e.target.value})} 
                              className="auth-input" 
                            >
                              <option value="">Selecciona una campaña...</option>
                              {workflows.filter(w => w.template?.typeIdentifier === 'lead_collector').map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                              ))}
                            </select>
                          </div>
                      
                          <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Contexto de tu Empresa para Groq AI</label>
                            <textarea 
                              required
                              value={newWfConfig.businessContext || ''} 
                              onChange={e => setNewWfConfig({...newWfConfig, businessContext: e.target.value})} 
                              className="auth-input" 
                              placeholder="Ej. Somos una agencia B2B que ayuda a empresas con transformación digital." 
                              style={{ minHeight: '60px', resize: 'vertical' }} 
                            />
                          </div>
                      
                          <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Línea de Color / Tono de la Marca</label>
                            <input 
                              required
                              type="text"
                              value={newWfConfig.brandVoice || ''} 
                              onChange={e => setNewWfConfig({...newWfConfig, brandVoice: e.target.value})} 
                              className="auth-input" 
                              placeholder="Ej. Tono formal, amigable, persuasivo, colores serios." 
                            />
                          </div>
                      
                          <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Límite de envío diario</label>
                            <input 
                              required
                              type="number"
                              min="1"
                              max="500"
                              value={newWfConfig.maxEmailsPerDay || 50} 
                              onChange={e => setNewWfConfig({...newWfConfig, maxEmailsPerDay: parseInt(e.target.value, 10)})} 
                              className="auth-input" 
                            />
                          </div>
                      
                          <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Horario de Envío (Cron)</label>
                            <select 
                              value={
                                ['0 10,14 * * 1-5', '0 14 * * 1-5', '0 8 * * 1-5', '0 10 * * 1-5', '0 12 * * 1-5', '0 9 * * 1-5'].includes(newWfConfig.schedule || '0 10,14 * * 1-5') 
                                ? (newWfConfig.schedule || '0 10,14 * * 1-5') 
                                : 'custom'
                              }
                              onChange={e => {
                                if (e.target.value === 'custom') {
                                  setNewWfConfig({...newWfConfig, schedule: ''});
                                } else {
                                  setNewWfConfig({...newWfConfig, schedule: e.target.value});
                                }
                              }}
                              className="auth-input"
                              style={{ marginBottom: '0.5rem' }}
                            >
                              <option value="0 10,14 * * 1-5">🔥 Lunes a Viernes 2 veces al día (10:00 AM y 2:00 PM) - 5 correos c/u</option>
                              <option value="0 14 * * 1-5">Lunes a Viernes 1 vez al día (2:00 PM) - Lote completo de 10 correos</option>
                              <option value="0 8 * * 1-5">Lunes a Viernes a las 8:00 AM</option>
                              <option value="0 9 * * 1-5">Lunes a Viernes a las 9:00 AM</option>
                              <option value="0 10 * * 1-5">Lunes a Viernes a las 10:00 AM</option>
                              <option value="0 12 * * 1-5">Lunes a Viernes a las 12:00 PM</option>
                              <option value="custom">Personalizado (Avanzado)</option>
                            </select>
                            
                            {(!['0 10,14 * * 1-5', '0 14 * * 1-5', '0 8 * * 1-5', '0 10 * * 1-5', '0 12 * * 1-5', '0 9 * * 1-5'].includes(newWfConfig.schedule || '0 10,14 * * 1-5')) && (
                              <input 
                                type="text" 
                                value={newWfConfig.schedule || '0 10,14 * * 1-5'} 
                                onChange={e => setNewWfConfig({...newWfConfig, schedule: e.target.value})} 
                                className="auth-input" 
                                placeholder="Ingresa tu expresión Cron (ej. 0 10,14 * * 1-5)" 
                              />
                            )}
                          </div>

                          <div style={{ marginTop: '1rem', borderTop: '1px solid #cbd5e1', paddingTop: '1rem' }}>
                            <button 
                              type="button"
                              onClick={handleGenerateOutreachTemplate}
                              disabled={isGeneratingOutreach}
                              style={{ width: '100%', padding: '0.75rem', background: isGeneratingOutreach ? '#94a3b8' : '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: isGeneratingOutreach ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: '500', marginBottom: '1rem' }}
                            >
                              {isGeneratingOutreach ? <Loader2 size={16} className="spinner" /> : <Sparkles size={16} />}
                              {isGeneratingOutreach ? 'Generando Plantilla...' : 'Generar Correo Inicial con IA'}
                            </button>

                            {newWfConfig.generated_outreach_email && (
                              <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 'bold' }}>Asunto generado</label>
                                <input 
                                  type="text" 
                                  value={newWfConfig.generated_outreach_email.subject} 
                                  onChange={e => setNewWfConfig({...newWfConfig, generated_outreach_email: {...newWfConfig.generated_outreach_email, subject: e.target.value}})} 
                                  className="auth-input" 
                                  style={{ marginBottom: '1rem' }} 
                                />
                                
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 'bold' }}>Cuerpo del Correo (HTML)</label>
                                  <textarea 
                                    value={newWfConfig.generated_outreach_email.body} 
                                    onChange={e => setNewWfConfig({...newWfConfig, generated_outreach_email: {...newWfConfig.generated_outreach_email, body: e.target.value}})} 
                                    className="auth-input" 
                                    style={{ minHeight: '300px', resize: 'vertical', marginBottom: '1rem' }} 
                                  />
                                  
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 'bold' }}>Previsualización</label>
                                  <div 
                                    style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '1rem', background: '#f8fafc', maxHeight: '500px', overflowY: 'auto' }}
                                    dangerouslySetInnerHTML={{ __html: newWfConfig.generated_outreach_email.body }}
                                  />

                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTemplate.typeIdentifier === 'google_stitch_designer' && (
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '1rem' }}>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🎨 Configuración de Google Stitch
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                            Conecta tu campaña de Google Maps para que la API de Google Stitch genere maquetas visuales modernas basadas en los hallazgos de auditoría.
                          </p>

                          <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Campaña fuente (recolector de leads)</label>
                            <select 
                              required
                              value={newWfConfig.sourceWorkflowId || ''} 
                              onChange={e => setNewWfConfig({...newWfConfig, sourceWorkflowId: e.target.value})} 
                              className="auth-input" 
                            >
                              <option value="">Selecciona una campaña de Google Maps...</option>
                              {workflows.filter(w => w.template?.typeIdentifier === 'lead_collector').map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Estilo visual de maquetación</label>
                            <select 
                              value={newWfConfig.designStyle || 'modern_clean'} 
                              onChange={e => setNewWfConfig({...newWfConfig, designStyle: e.target.value})} 
                              className="auth-input" 
                            >
                              <option value="modern_clean">✨ Moderno y limpio (recomendado - conversión alta)</option>
                              <option value="minimalist">🌿 Minimalista y elegante (servicios premium)</option>
                              <option value="bold_vibrant">🔥 Bold y llamativo (gran impacto visual)</option>
                              <option value="corporate">🏢 Corporativo y Tecnológico</option>
                            </select>
                          </div>

                          <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Límite de Maquetas por Ejecución</label>
                            <input 
                              type="number"
                              min="1"
                              max="50"
                              value={newWfConfig.batchLimit || 5} 
                              onChange={e => setNewWfConfig({...newWfConfig, batchLimit: parseInt(e.target.value, 10)})} 
                              className="auth-input" 
                            />
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                              Cantidad máxima de leads a diseñar por cada vez que se ejecute el workflow.
                            </p>
                          </div>

                          <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Frecuencia de Maquetación (Automatizada)</label>
                            <select 
                              value={
                                ['0 9,13 * * 1-5', '0 10,14 * * 1-5', '0 11 * * 1-5', '0 9 * * 1-5', '0 * * * *'].includes(newWfConfig.schedule || '0 9,13 * * 1-5') 
                                ? (newWfConfig.schedule || '0 9,13 * * 1-5') 
                                : 'custom'
                              }
                              onChange={e => {
                                if (e.target.value === 'custom') {
                                  setNewWfConfig({...newWfConfig, schedule: ''});
                                } else {
                                  setNewWfConfig({...newWfConfig, schedule: e.target.value});
                                }
                              }}
                              className="auth-input"
                              style={{ marginBottom: '0.5rem' }}
                            >
                              <option value="0 9,13 * * 1-5">✨ Lunes a Viernes 2 veces al día (9:00 AM y 1:00 PM) - Recomendado</option>
                              <option value="0 10,14 * * 1-5">Lunes a Viernes 2 veces al día (10:00 AM y 2:00 PM)</option>
                              <option value="0 11 * * 1-5">Lunes a Viernes 1 vez al día (11:00 AM)</option>
                              <option value="0 9 * * 1-5">Lunes a Viernes 1 vez al día (9:00 AM)</option>
                              <option value="0 * * * *">Cada hora</option>
                              <option value="custom">Personalizado (Avanzado)</option>
                            </select>
                            
                            {(!['0 9,13 * * 1-5', '0 10,14 * * 1-5', '0 11 * * 1-5', '0 9 * * 1-5', '0 * * * *'].includes(newWfConfig.schedule || '0 9,13 * * 1-5')) && (
                              <input 
                                type="text" 
                                value={newWfConfig.schedule || '0 9,13 * * 1-5'} 
                                onChange={e => setNewWfConfig({...newWfConfig, schedule: e.target.value})} 
                                className="auth-input" 
                                placeholder="Ingresa tu expresión Cron (ej. 0 9,13 * * 1-5)" 
                              />
                            )}
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                              Sincronizado 1 hora después de Maps para encontrar leads frescos listos para maquetar.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Mostrar campos dinamicos basados en configSchema */}
                      {activeTemplate.configSchema && activeTemplate.configSchema.properties && !['auto_outreach_google_maps', 'google_stitch_designer'].includes(activeTemplate.typeIdentifier) && Object.entries(activeTemplate.configSchema.properties).filter(([key]) => key !== 'calendarId').map(([key, prop]: [string, any]) => (
                      <div className="input-group" key={key}>
                        <label>{prop.title ? fixEncoding(prop.title) : key}</label>
                        {prop.description && <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>{fixEncoding(prop.description).replace('ser', 'será').replace('ser\ufffd', 'será')}</p>}
                        {prop.format === 'textarea' ? (
                          <textarea 
                            required 
                            value={newWfConfig[key] || ''} 
                            onChange={(e) => setNewWfConfig({...newWfConfig, [key]: e.target.value})} 
                            className="auth-input" 
                            style={{ minHeight: '100px', resize: 'vertical' }}
                            placeholder={prop.description}
                          />
                        ) : prop.format === 'calendar' ? (
                          <select
                            required
                            value={newWfConfig[key] || ''}
                            onChange={(e) => setNewWfConfig({...newWfConfig, [key]: e.target.value})}
                            className="auth-input"
                            style={{ appearance: 'auto', background: 'white' }}
                          >
                            <option value="">-- Selecciona un Calendario --</option>
                            {calendars.map(cal => (
                              <option key={cal.id} value={cal.id}>{cal.name || 'Sin nombre (' + cal.id + ')'}</option>
                            ))}
                          </select>
                        ) : (
                          <input 
                            type="text" 
                            required 
                            value={newWfConfig[key] || ''} 
                            onChange={(e) => setNewWfConfig({...newWfConfig, [key]: e.target.value})} 
                            className="auth-input" 
                          />
                        )}
                      </div>
                    ))}

                    <button type="submit" className="submit-button" style={{ alignSelf: 'flex-start' }}>{t('portal.save_instance', 'Guardar instancia')}</button>
                  </form>
                </div>
              )}

              {/* Lista de Instancias de este Template */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {activeTemplateWorkflows.length === 0 ? (
                  <p style={{ color: '#94a3b8', gridColumn: '1 / -1' }}>{t('portal.no_automations', 'No tienes automatizaciones de este tipo.')}</p>
                ) : (
                  activeTemplateWorkflows.map(wf => (
                    <div key={wf.id} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1rem' }}>{wf.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.7rem', background: wf.isActive ? '#dcfce7' : '#fee2e2', color: wf.isActive ? '#166534' : '#991b1b', padding: '2px 6px', borderRadius: '12px' }}>
                            {wf.isActive ? t('portal.active', 'Activo') : t('portal.inactive', 'Inactivo')}
                          </span>
                          <button 
                            onClick={() => {
                              setEditingWorkflowId(wf.id);
                              setNewWfName(wf.name);
                              setNewWfProjectId(wf.projectId || '');
                              setNewWfConfig(wf.config || {});
                              setBusinessContext(wf.config?.businessContext || '');
                              setServicesInput(wf.config?.servicesInput || '');
                              setGeneratedTemplates(wf.config?.generated_responses || null);
                              const creds: Record<string, string> = {};
                              wf.credentials?.forEach(c => creds[c.type] = c.id);
                              setNewWfCreds(creds);
                              setShowNewWfForm(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0 }}
                            title="Editar Workflow"
                          >
                            <Edit3 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Credenciales */}
                      <div style={{ marginBottom: '1rem' }}>
                        {wf.template.requiredCreds.map(reqCred => {
                          const hasCred = wf.credentials.find(c => c.type === reqCred) || credentials.find(c => c.type === reqCred);
                          return (
                            <div key={reqCred} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '0.25rem 0' }}>
                              <span style={{ color: hasCred ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Key size={12} /> {reqCred}
                              </span>
                              {!hasCred && (
                                <button onClick={() => setCredModal({ isOpen: true, wfId: wf.id, type: reqCred })} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.75rem' }}>
                                  {t('portal.add', 'Añadir')}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      
                        {/* PROGRAMACION DE EJECUCIONES (LEAD COLLECTOR, STITCH DESIGNER, AUTO OUTREACH) */}
                        {['lead_collector', 'google_stitch_designer', 'auto_outreach_google_maps'].includes(wf.template.typeIdentifier) && (wf.config?.schedule || wf.template.typeIdentifier === 'auto_outreach_google_maps') && (
                          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Clock size={20} color="#16a34a" />
                            <div>
                              <div style={{ fontSize: '0.7rem', color: '#166534', textTransform: 'uppercase', fontWeight: 'bold' }}>{t('portal.scheduled_execution', 'Próxima ejecución programada')}</div>
                              <div style={{ fontSize: '0.85rem', color: '#14532d', fontWeight: '600' }}>
                                {formatSchedule(
                                  wf.config?.schedule || 
                                  (wf.template.typeIdentifier === 'auto_outreach_google_maps' ? '0 10,14 * * 1-5' : 
                                   wf.template.typeIdentifier === 'google_stitch_designer' ? '0 9,13 * * 1-5' : '0 8,12 * * 1-5')
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* URL Webhook para form_contact_handler */}

                      {wf.template.typeIdentifier === 'form_contact_handler' && (
                        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#0f172a', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 'bold' }}>{t('portal.webhook_url', 'URL del Webhook (POST)')}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input 
                              type="text" 
                              readOnly 
                              value={`${BASE_URL}/workflows/webhook/${wf.id}`} 
                              style={{ flex: 1, background: 'transparent', border: 'none', color: '#10b981', fontSize: '0.75rem', outline: 'none' }} 
                            />
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(`${BASE_URL}/workflows/webhook/${wf.id}`);
                                alert('¡URL copiada al portapapeles!');
                              }}
                              style={{ background: '#1e293b', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
                            >
                              {t('portal.copy', 'Copiar')}
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* VER Y MEJORAR CORREOS */}
                      {wf.template.typeIdentifier === 'form_contact_handler' && wf.config?.generated_responses && (
                        <div style={{ marginBottom: '1rem' }}>
                          <button 
                            onClick={() => setActiveWorkflowEditor(wf)}
                            style={{ width: '100%', background: viewingEmailsWfId === wf.id ? '#e2e8f0' : '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '500' }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} /> Ver y mejorar correos generados</span>
                            <ChevronRight size={16} style={{ transform: viewingEmailsWfId === wf.id ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                          </button>
                          
                          {viewingEmailsWfId === wf.id && (
                            <div style={{ marginTop: '0.5rem', background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <input 
                                  type="text" 
                                  value={refinementPrompts[wf.id] || ''}
                                  onChange={e => setRefinementPrompts({...refinementPrompts, [wf.id]: e.target.value})}
                                  placeholder="Ej. Hazlos más cortos y cordiales..."
                                  style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                                <button onClick={() => handleRefineTemplates(wf)} disabled={isRefining === wf.id} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  {isRefining === wf.id ? <Loader2 size={16} className="spinner" /> : <Sparkles size={16} />}
                                  Mejorar con IA
                                </button>
                              </div>
                              
                              {Object.entries(wf.config?.generated_responses).map(([service, template]: [string, any]) => {
                                const isEditing = editingTemplate?.wfId === wf.id && editingTemplate?.service === service;
                                return (
                                  <div key={service} style={{ marginBottom: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                                    <div style={{ background: '#f8fafc', padding: '0.5rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>{service}</strong>
                                      <button onClick={() => isEditing ? setEditingTemplate(null) : setEditingTemplate({wfId: wf.id, service})} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                                        {isEditing ? <Eye size={14}/> : <Edit3 size={14}/>} {isEditing ? 'Ver Previa' : 'Editar Manual'}
                                      </button>
                                    </div>
                                    <div style={{ padding: '1rem' }}>
                                      {isEditing ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                          <input type="text" defaultValue={template.subject} id={`subj-${wf.id}-${service}`} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%' }} />
                                          <textarea defaultValue={template.body} id={`body-${wf.id}-${service}`} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%', minHeight: '150px' }} />
                                          <button onClick={() => {
                                            const subj = (document.getElementById(`subj-${wf.id}-${service}`) as HTMLInputElement).value;
                                            const body = (document.getElementById(`body-${wf.id}-${service}`) as HTMLTextAreaElement).value;
                                            handleManualEdit(wf, service, subj, body);
                                          }} style={{ background: '#0f172a', color: 'white', padding: '0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Guardar cambios</button>
                                        </div>
                                      ) : (
                                        <div>
                                          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}><strong>Asunto:</strong> {template.subject}</div>
                                          <div style={{ border: '1px dashed #cbd5e1', padding: '1rem', borderRadius: '4px', background: '#fcfcfc' }} dangerouslySetInnerHTML={{ __html: template.body }}></div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                          
                        {/* CRM BUTTON */}
                        {(wf.template.typeIdentifier === 'form_contact_handler' || wf.template.typeIdentifier === 'lead_collector') && (
                          <button 
                            onClick={() => handleViewLeads(wf.id)}
                            style={{ 
                              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                              background: viewingLeadsWfId === wf.id ? '#1e293b' : '#0f172a', 
                              border: '1px solid #1e293b', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', flex: 1 
                            }}
                          >
                            <Users size={16} /> Ver Prospectos / Leads (CRM)
                          </button>
                        )}
                        
                        {/* EXECUTE & DELETE */}
<button 
                            onClick={() => handleExecute(wf.id)} disabled={executing === wf.id}
                            style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                          >
                            {executing === wf.id ? <Loader2 size={16} className="spinner" /> : <Play size={16} />}
                            {executing === wf.id ? t('portal.executing', 'Ejecutando...') : t('portal.execute', 'Ejecutar')}
                          </button>
                          <button 
                            onClick={() => handleDelete(wf.id)}
                            title="Eliminar Workflow"
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fee2e2', border: '1px solid #f87171', color: '#ef4444', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                      
                      {/* Resultado */}
                      {executionResult?.wfId === wf.id && (
                        <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                          <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Database size={18} color="#10b981" /> 
                                {executionResult.result.leads ? `Cosecha Exitosa: ${executionResult.result.total_found || executionResult.result.leads.length} Leads Encontrados` : 'Resultado de Ejecución'}
                              </div>
                              {executionResult.result.leads && (
                                <button
                                  onClick={() => setShowFullScreenResults(executionResult)}
                                  style={{ background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}
                                >
                                  <Maximize size={16} /> Ver en Pantalla Completa
                                </button>
                              )}
                            </div>
                          </h4>
                          
                          {executionResult.result.leads ? (
                            <div style={{ overflowX: 'auto' }}>
                              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                                Término buscado: <strong>{executionResult.result.searchQuery || 'Búsqueda por defecto'}</strong>
                              </p>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                  <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0' }}>Empresa</th>
                                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0' }}>Dirección</th>
                                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0' }}>Teléfono</th>
                                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0' }}>Sitio web</th>
                                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0' }}>Rating</th>
                                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0' }}>Análisis web</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {executionResult.result.leads.map((lead: any, i: number) => {
                                    console.log("Lead item:", lead);
                                    let analysis = lead.metadata?.technicalAnalysis || lead.technicalAnalysis;
                                    
                                    // Sometimes metadata comes as string from backend
                                    if (!analysis && typeof lead.metadata === 'string') {
                                      try {
                                        const parsedMeta = JSON.parse(lead.metadata);
                                        analysis = parsedMeta.technicalAnalysis;
                                      } catch(e) {}
                                    }
                                    
                                    return (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#0f172a' }}>{lead.name}</td>
                                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{lead.address || '-'}</td>
                                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>
                                        {lead.phone && lead.phone !== 'No disponible' ? (
                                          <a href={`tel:${lead.phone}`} style={{ color: '#10b981', textDecoration: 'none', fontWeight: 500 }}>📞 {lead.phone}</a>
                                        ) : (
                                          <span style={{ color: '#94a3b8' }}>{lead.phone || '-'}</span>
                                        )}
                                      </td>
                                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>
                                        {lead.website && lead.website !== 'No disponible' ? (
                                          <a href={lead.website} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>🌐 Visitar web</a>
                                        ) : (
                                          <span style={{ color: '#94a3b8' }}>{lead.website || '-'}</span>
                                        )}
                                      </td>
                                      <td style={{ padding: '0.75rem 1rem' }}>
                                        <span style={{ background: '#fef08a', color: '#854d0e', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem' }}>
                                          ⭐ {lead.rating || 'N/A'}
                                        </span>
                                      </td>
                                      <td style={{ padding: '0.75rem 1rem' }}>
                                        {(() => {
                                          const audit = parseLeadAudit(lead);
                                          if (!audit.hasAudit) {
                                            return <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Sin análisis web</span>;
                                          }
                                          return (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '170px' }}>
                                              {audit.screenshots.length > 0 && (
                                                <div 
                                                  onClick={() => { setSelectedAuditLead(lead); setActiveScreenshotIdx(0); }}
                                                  style={{ position: 'relative', cursor: 'pointer', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
                                                  title="Clic para ver las 5 capturas en alta resolución"
                                                >
                                                  <img 
                                                    src={audit.screenshots[0].url} 
                                                    alt="Preview" 
                                                    style={{ width: '100%', height: '65px', objectFit: 'cover', display: 'block' }} 
                                                  />
                                                  <span style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(15, 23, 42, 0.85)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                                                    📸 {audit.screenshots.length} capturas
                                                  </span>
                                                </div>
                                              )}
                                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
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
                                                onClick={() => { setSelectedAuditLead(lead); setActiveScreenshotIdx(0); }}
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
                                                  gap: '4px'
                                                }}
                                              >
                                                <Sparkles size={12} color="#10b981" /> Ver Auditoría IA
                                              </button>
                                            </div>
                                          );
                                        })()}
                                      </td>
                                    </tr>
                                  )})}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div style={{ background: '#0f172a', color: '#10b981', padding: '1rem', borderRadius: '6px', fontSize: '0.75rem', overflowX: 'auto' }}>
                              <pre style={{ margin: 0 }}>{JSON.stringify(executionResult.result, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal de Credencial */}
      {credModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>{credModal.type ? `${t('portal.add', 'Añadir')}: ${credModal.type}` : t('portal.new_credential', 'Nueva credencial')}</h3>
            <form onSubmit={handleSaveCredential}>
              {!credModal.type && (
                <div className="input-group" style={{ marginBottom: '1rem' }}>
                  <label>{t('portal.service_type', 'Tipo de servicio')}</label>
                  <input type="text" required value={credType} onChange={e => setCredType(e.target.value)} className="auth-input" placeholder="Ej. stripe_api, google_maps..." />
                </div>
              )}
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label>{t('portal.id_name', 'Nombre identificativo')}</label>
                <input type="text" required value={credName} onChange={e => setCredName(e.target.value)} className="auth-input" placeholder="Ej. Mi API Key Principal" />
              </div>
              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label>{t('portal.secret_value', 'Valor (Secreto)')}</label>
                <input type="password" required value={credValue} onChange={e => setCredValue(e.target.value)} className="auth-input" placeholder="Pega el secreto aquí..." />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="submit-button" style={{ background: '#e2e8f0', color: '#475569' }} onClick={() => setCredModal({ isOpen: false })}>{t('portal.cancel', 'Cancelar')}</button>
                <button type="submit" className="submit-button">{t('portal.save_secure', 'Guardar seguro')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Resultados Full Screen */}
      {showFullScreenResults && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#f8fafc', zIndex: 9999, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
            <div>
              <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={24} color="#10b981" />
                Cosecha de Leads - Vista Completa
              </h2>
              <p style={{ margin: '0.5rem 0 0 0', color: '#64748b' }}>
                Término buscado: <strong>{showFullScreenResults.result.searchQuery || 'Búsqueda por defecto'}</strong> ({showFullScreenResults.result.total_found || showFullScreenResults.result.leads?.length} leads encontrados)
              </p>
            </div>
            <button
              onClick={() => setShowFullScreenResults(null)}
              style={{ background: '#ef4444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
            >
              <X size={20} /> Cerrar Vista
            </button>
          </div>
          
          <div style={{ padding: '2rem', flex: 1 }}>
            {showFullScreenResults.result.leads ? (
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Empresa</th>
                      <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Dirección</th>
                      <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Contacto</th>
                      <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Análisis web</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showFullScreenResults.result.leads.map((lead: any, i: number) => {
                      let analysis = lead.metadata?.technicalAnalysis || lead.technicalAnalysis;
                      if (!analysis && typeof lead.metadata === 'string') {
                        try {
                          const parsedMeta = JSON.parse(lead.metadata);
                          analysis = parsedMeta.technicalAnalysis;
                        } catch(e) {}
                      }
                      
                      return (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '1.2rem 1rem', fontWeight: 600, color: '#0f172a', verticalAlign: 'top' }}>
                          <div style={{ marginBottom: '0.5rem' }}>{lead.name}</div>
                          <span style={{ background: '#fef08a', color: '#854d0e', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'normal' }}>
                            ⭐ {lead.rating || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '1.2rem 1rem', color: '#64748b', verticalAlign: 'top', maxWidth: '250px' }}>{lead.address || '-'}</td>
                        <td style={{ padding: '1.2rem 1rem', color: '#64748b', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {lead.phone && lead.phone !== 'No disponible' ? (
                              <a href={`tel:${lead.phone}`} style={{ color: '#10b981', textDecoration: 'none', fontWeight: 500 }}>📞 {lead.phone}</a>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>{lead.phone || '-'}</span>
                            )}
                            {lead.website && lead.website !== 'No disponible' ? (
                              <a href={lead.website} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>🌐 Visitar web</a>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>{lead.website || '-'}</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '1.2rem 1rem', verticalAlign: 'top' }}>
                          {(() => {
                            const audit = parseLeadAudit(lead);
                            if (!audit.hasAudit) {
                              return <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sin análisis</span>;
                            }
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '220px' }}>
                                {audit.screenshots.length > 0 && (
                                  <div 
                                    onClick={() => { setSelectedAuditLead(lead); setActiveScreenshotIdx(0); }}
                                    style={{ position: 'relative', cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
                                    title="Clic para ver las 5 capturas en alta resolución"
                                  >
                                    <img 
                                      src={audit.screenshots[0].url} 
                                      alt="Web Preview" 
                                      style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} 
                                    />
                                    <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(15, 23, 42, 0.85)', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                                      📸 {audit.screenshots.length} capturas
                                    </div>
                                  </div>
                                )}

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {audit.technicalErrors.length > 0 && (
                                    <span style={{ background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                                      ⚠️ {audit.technicalErrors.length} errores técnicos
                                    </span>
                                  )}
                                  {audit.visualErrors.length > 0 && (
                                    <span style={{ background: '#ffedd5', color: '#9a3412', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                                      👁️ {audit.visualErrors.length} errores visuales
                                    </span>
                                  )}
                                </div>

                                <button
                                  onClick={() => { setSelectedAuditLead(lead); setActiveScreenshotIdx(0); }}
                                  style={{
                                    background: '#0f172a',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 0.8rem',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                  }}
                                >
                                  <Sparkles size={14} color="#10b981" /> Ver Auditoría IA Completa
                                </button>
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal de Auditoría Completa de Lead con IA & Galería de capturas */}
      {selectedAuditLead && (() => {
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
          
          const pitch = `🔍 AUDITORÍA WEB & OPORTUNIDADES DE MEJORA PARA ${lead.name?.toUpperCase() || 'SU EMPRESA'}
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
                      {lead.name || 'Auditoría de Lead'}
                    </h2>
                    {lead.rating && (
                      <span style={{ background: '#fef08a', color: '#854d0e', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                        ⭐ {lead.rating}
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
                      Errores Visuales y de UX ({audit.visualErrors.length})
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
                      Diagnóstico Global de la IA (Estrategia de Venta)
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
                    <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6d28d9', fontWeight: 700, fontSize: '0.95rem' }}>
                          🎨 Maqueta Diseñada con Google Stitch
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
                            🖥️ Pantalla Completa
                          </button>
                          <span style={{ background: '#ede9fe', color: '#5b21b6', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '12px' }}>
                            Estilo: {audit.mockup.designStyle || 'Vanguardia 2026'}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#4c1d95', margin: '0 0 0.75rem 0', fontWeight: 600 }}>
                        {audit.mockup.title || 'Propuesta de Rediseño Web'}
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
                  📋 Copiar JSON de Diagnóstico
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
      })()}

      {/* Spinner CSS */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

















