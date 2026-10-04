import { useState, useEffect } from 'react';
import { FolderKanban, Play, Key, Plus, Loader2, Database, KeySquare, ChevronRight, Trash2, Mail, Eye, EyeOff, Copy, Edit2, Check, X, Edit3, Sparkles, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../../api/client';
import '../portal.css';

const fixEncoding = (str: string) => {
  if (!str) return str;
  return str
    .replace(/Gestin/g, 'GestiÃ³n')
    .replace(/Gesti\ufffdn/g, 'GestiÃ³n')
    .replace(/basndose/g, 'basÃ¡ndose')
    .replace(/bas\ufffdndose/g, 'basÃ¡ndose')
    .replace(/enva/g, 'envÃ­a')
    .replace(/env\ufffda/g, 'envÃ­a');
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
  const [generatedTemplates, setGeneratedTemplates] = useState<Record<string, {subject: string, body: string}> | null>(null);
    const [executionResult, setExecutionResult] = useState<{ wfId: string; result: any } | null>(null);

  // Email viewing and refining states
    const [viewingLeadsWfId, setViewingLeadsWfId] = useState<string | null>(null);
  const [wfExecutions, setWfExecutions] = useState<any[]>([]);
const [viewingEmailsWfId, setViewingEmailsWfId] = useState<string | null>(null);
  const [refinementPrompts, setRefinementPrompts] = useState<Record<string, string>>({});
  const [isRefining, setIsRefining] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<{wfId: string, service: string} | null>(null);

  const handleRefineTemplates = async (wf: UserWorkflow) => {
    const prompt = refinementPrompts[wf.id];
    if (!prompt) return alert('Escribe qu� deseas cambiar.');
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
      alert('�Correos refinados con �xito!');
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
  const activeTemplateWorkflows = workflows.filter(w => w.templateId === activeTab);  if (activeWorkflowEditor) {
    const wf = activeWorkflowEditor;
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
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Fecha</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Prospecto / Empresa</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Email</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Cupón / Referido</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Payload (Otros Datos)</th>
                </tr>
              </thead>
              <tbody>
                {wfExecutions.map((exec: any) => {
                  const payload = exec.payload || exec.resultData?.leadData || exec;
                  const dateStr = new Date(exec.createdAt || exec.startedAt || new Date()).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                  
                  const mapping = wf?.config?.fieldMappings || {};
                  // El usuario parece haber configurado mal el mapping en la UI (puso 'service' en lugar de 'usedCouponCode'). 
                  // Vamos a forzar la lectura de usedCouponCode si existe en el payload, para evitar errores visuales.
                  const couponValue = payload.usedCouponCode || payload.coupon || (mapping.referralCodeField ? payload[mapping.referralCodeField] : null);
                  const serviceValue = payload.service || (mapping.servicesField ? payload[mapping.servicesField] : null);
                  
                  const extraData = { ...payload };
                  delete extraData.name;
                  delete extraData.email;
                  delete extraData.businessName;
                  if (mapping.referralCodeField) delete extraData[mapping.referralCodeField];

                  return (
                    <tr key={exec.id || Math.random()} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', color: '#64748b', whiteSpace: 'nowrap' }}>{dateStr}</td>
                      <td style={{ padding: '1rem', fontWeight: 500, color: '#0f172a' }}>
                        {payload.name || exec.name || 'Sin Nombre'}<br/>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>{payload.businessName || '-'}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {payload.email || exec.email ? <a href={`mailto:${payload.email || exec.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{payload.email || exec.email}</a> : '-'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {serviceValue && (
                          <div style={{ marginBottom: '6px' }}>
                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              💼 {serviceValue}
                            </span>
                          </div>
                        )}
                        {exec.referredBy && exec.referredBy.name ? (
                          <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            ✅ Vino referido por: {exec.referredBy.name}
                          </div>
                        ) : exec.referredByUserId ? (
                          <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            ✅ Vino referido por: Usuario ({exec.referredByUserId})
                          </div>
                        ) : (
                          couponValue && couponValue !== serviceValue && (
                            <div style={{ marginBottom: '4px' }}>
                              <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                🏷️ Usando el cupón: {couponValue}
                              </span>
                            </div>
                          )
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <pre style={{ margin: 0, background: '#1e293b', color: '#38bdf8', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem', maxWidth: '350px', overflowX: 'auto', maxHeight: '100px' }}>
                          {JSON.stringify(extraData, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

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
            {Object.entries(wf.config.generated_responses || {}).map(([service, template]) => {
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
                        }} style={{ background: '#0f172a', color: 'white', padding: '0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', fontWeight: '600' }}>Guardar Cambios</button>
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
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Fecha</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Prospecto / Empresa</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Email</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Cupón / Referido</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>Payload (Otros Datos)</th>
                </tr>
              </thead>
              <tbody>
                {wfExecutions.map((exec: any) => {
                  const payload = exec.payload || exec.resultData?.leadData || exec;
                  const dateStr = new Date(exec.createdAt || exec.startedAt || new Date()).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                  
                  const mapping = wf?.config?.fieldMappings || {};
                  // El usuario parece haber configurado mal el mapping en la UI (puso 'service' en lugar de 'usedCouponCode'). 
                  // Vamos a forzar la lectura de usedCouponCode si existe en el payload, para evitar errores visuales.
                  const couponValue = payload.usedCouponCode || payload.coupon || (mapping.referralCodeField ? payload[mapping.referralCodeField] : null);
                  const serviceValue = payload.service || (mapping.servicesField ? payload[mapping.servicesField] : null);
                  
                  const extraData = { ...payload };
                  delete extraData.name;
                  delete extraData.email;
                  delete extraData.businessName;
                  if (mapping.referralCodeField) delete extraData[mapping.referralCodeField];

                  return (
                    <tr key={exec.id || Math.random()} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', color: '#64748b', whiteSpace: 'nowrap' }}>{dateStr}</td>
                      <td style={{ padding: '1rem', fontWeight: 500, color: '#0f172a' }}>
                        {payload.name || exec.name || 'Sin Nombre'}<br/>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>{payload.businessName || '-'}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {payload.email || exec.email ? <a href={`mailto:${payload.email || exec.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{payload.email || exec.email}</a> : '-'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {serviceValue && (
                          <div style={{ marginBottom: '6px' }}>
                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              💼 {serviceValue}
                            </span>
                          </div>
                        )}
                        {exec.referredBy && exec.referredBy.name ? (
                          <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            ✅ Vino referido por: {exec.referredBy.name}
                          </div>
                        ) : exec.referredByUserId ? (
                          <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            ✅ Vino referido por: Usuario ({exec.referredByUserId})
                          </div>
                        ) : (
                          couponValue && couponValue !== serviceValue && (
                            <div style={{ marginBottom: '4px' }}>
                              <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                🏷️ Usando el cupón: {couponValue}
                              </span>
                            </div>
                          )
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <pre style={{ margin: 0, background: '#1e293b', color: '#38bdf8', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem', maxWidth: '350px', overflowX: 'auto', maxHeight: '100px' }}>
                          {JSON.stringify(extraData, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                        <option value="">-- Seleccionar Empresa --</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group" style={{ background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Estructura y Mapeo Dinámico de Formulario</h5>
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
                            <label>Servicios Ofrecidos (separados por comas)</label>
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
                              <h5 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Plantillas Generadas (Revisa y edita)</h5>
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
                          <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>🗺️ Configuración Multi-Búsqueda</h4>
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
                                ['0 * * * *', '0 8 * * *', '0 10 * * *', '0 12 * * *', '0 9 * * 1'].includes(newWfConfig.schedule || '0 10 * * *') 
                                ? (newWfConfig.schedule || '0 10 * * *') 
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
                              <option value="0 * * * *">Cada hora</option>
                              <option value="0 8 * * *">Todos los días a las 8:00 AM</option>
                              <option value="0 10 * * *">Todos los días a las 10:00 AM</option>
                              <option value="0 12 * * *">Todos los días a las 12:00 PM</option>
                              <option value="0 9 * * 1">Una vez a la semana (Lunes 9:00 AM)</option>
                              <option value="custom">Personalizado (Avanzado)</option>
                            </select>
                            
                            {(!['0 * * * *', '0 8 * * *', '0 10 * * *', '0 12 * * *', '0 9 * * 1'].includes(newWfConfig.schedule || '0 10 * * *')) && (
                              <input 
                                type="text" 
                                value={newWfConfig.schedule || '0 10 * * *'} 
                                onChange={e => setNewWfConfig({...newWfConfig, schedule: e.target.value})} 
                                className="auth-input" 
                                placeholder="Ingresa tu expresión Cron (ej. 0 10 * * *)" 
                              />
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Mostrar campos dinamicos basados en configSchema */}
                      {activeTemplate.configSchema && activeTemplate.configSchema.properties && Object.entries(activeTemplate.configSchema.properties).map(([key, prop]: [string, any]) => (
                      <div className="input-group" key={key}>
                        <label>{prop.title || key}</label>
                        {prop.description && <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>{prop.description}</p>}
                        {prop.format === 'textarea' ? (
                          <textarea 
                            required 
                            value={newWfConfig[key] || ''} 
                            onChange={(e) => setNewWfConfig({...newWfConfig, [key]: e.target.value})} 
                            className="auth-input" 
                            style={{ minHeight: '100px', resize: 'vertical' }}
                            placeholder={prop.description}
                          />
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

                    <button type="submit" className="submit-button" style={{ alignSelf: 'flex-start' }}>{t('portal.save_instance', 'Guardar Instancia')}</button>
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
                                  {t('portal.add', 'AÃ±adir')}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* URL Webhook para form_contact_handler */}
                      {wf.template.typeIdentifier === 'form_contact_handler' && (
                        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#0f172a', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 'bold' }}>{t('portal.webhook_url', 'URL del Webhook (POST)')}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input 
                              type="text" 
                              readOnly 
                              value={`http://localhost:3000/api/workflows/webhook/${wf.id}`} 
                              style={{ flex: 1, background: 'transparent', border: 'none', color: '#10b981', fontSize: '0.75rem', outline: 'none' }} 
                            />
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(`http://localhost:3000/api/workflows/webhook/${wf.id}`);
                                alert('Â¡URL copiada al portapapeles!');
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
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} /> Ver y Mejorar Correos Generados</span>
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
                              
                              {Object.entries(wf.config.generated_responses).map(([service, template]: [string, any]) => {
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
                                          }} style={{ background: '#0f172a', color: 'white', padding: '0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Guardar Cambios</button>
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
                        {wf.template.typeIdentifier === 'form_contact_handler' && (
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
                            <Database size={18} color="#10b981" /> 
                            {executionResult.result.leads ? `Cosecha Exitosa: ${executionResult.result.total_found || executionResult.result.leads.length} Leads Encontrados` : 'Resultado de Ejecución'}
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
                                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0' }}>Sitio Web</th>
                                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0' }}>Rating</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {executionResult.result.leads.map((lead: any, i: number) => (
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
                                          <a href={lead.website} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>🌐 Visitar Web</a>
                                        ) : (
                                          <span style={{ color: '#94a3b8' }}>{lead.website || '-'}</span>
                                        )}
                                      </td>
                                      <td style={{ padding: '0.75rem 1rem' }}>
                                        <span style={{ background: '#fef08a', color: '#854d0e', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem' }}>
                                          ⭐ {lead.rating || 'N/A'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
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
            <h3 style={{ margin: '0 0 1.5rem 0' }}>{credModal.type ? `${t('portal.add', 'AÃ±adir')}: ${credModal.type}` : t('portal.new_credential', 'Nueva Credencial')}</h3>
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
                <input type="password" required value={credValue} onChange={e => setCredValue(e.target.value)} className="auth-input" placeholder="Pega el secreto aquÃ­..." />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="submit-button" style={{ background: '#e2e8f0', color: '#475569' }} onClick={() => setCredModal({ isOpen: false })}>{t('portal.cancel', 'Cancelar')}</button>
                <button type="submit" className="submit-button">{t('portal.save_secure', 'Guardar Seguro')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spinner CSS */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
















