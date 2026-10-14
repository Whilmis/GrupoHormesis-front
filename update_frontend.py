import re

with open("src/pages/portal/admin/AdminWorkflows.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

# Add isGeneratingOutreach state
ts = re.sub(
    r"const \[isGenerating, setIsGenerating\] = useState\(false\);",
    "const [isGenerating, setIsGenerating] = useState(false);\n  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);",
    ts
)

# Add handleGenerateOutreachTemplate
handle_generate = """
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
"""

ts = re.sub(
    r"const handleGenerateTemplates = async \(\) => \{",
    handle_generate + "\n    const handleGenerateTemplates = async () => {",
    ts
)

# Inject button and preview in auto_outreach_google_maps form
ui_injection = """
                            <div style={{ marginTop: '1rem', borderTop: '1px solid #cbd5e1', paddingTop: '1rem' }}>
                              <button 
                                type="button"
                                onClick={handleGenerateOutreachTemplate}
                                disabled={isGeneratingOutreach}
                                style={{ width: '100%', padding: '0.75rem', background: isGeneratingOutreach ? '#94a3b8' : '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: isGeneratingOutreach ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: '500', marginBottom: '1rem' }}
                              >
                                {isGeneratingOutreach ? <Loader2 size={16} className="spinner" /> : <Sparkles size={16} />}
                                {isGeneratingOutreach ? 'Generando Plantilla...' : 'Generar Correo con IA'}
                              </button>

                              {newWfConfig.generated_outreach_email && (
                                <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 'bold' }}>Asunto Generado</label>
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
                                    style={{ minHeight: '300px', resize: 'vertical' }} 
                                  />
                                </div>
                              )}
                            </div>
"""

ts = re.sub(
    r"(\{\(\!\['0 8 \* \* 1-5', '0 10 \* \* 1-5', '0 12 \* \* 1-5', '0 9 \* \* 1-5'\]\.includes\(newWfConfig\.schedule \|\| '0 8 \* \* 1-5'\)\) && \([\s\S]*?<\/div>\r?\n\s*\}<\/div>\r?\n\s*)(<\/div>\r?\n\s*\)\})",
    r"\1" + ui_injection + r"\2",
    ts
)

with open("src/pages/portal/admin/AdminWorkflows.tsx", "w", encoding="utf-8") as f:
    f.write(ts)

print("Frontend updated with Python")
