import re

with open("src/pages/portal/admin/AdminWorkflows.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

# Let's add a preview tab or section
preview_injection = """
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
"""

ts = re.sub(
    r"<label style=\{\{ display: 'block', fontSize: '0\.75rem', color: '#64748b', marginBottom: '0\.25rem', fontWeight: 'bold' \}\}>Cuerpo del Correo \(HTML\)<\/label>\r?\n\s*<textarea \r?\n\s*value=\{newWfConfig\.generated_outreach_email\.body\} \r?\n\s*onChange=\{e => setNewWfConfig\(\{...newWfConfig, generated_outreach_email: \{...newWfConfig\.generated_outreach_email, body: e\.target\.value\}\}\)\} \r?\n\s*className=\"auth-input\" \r?\n\s*style=\{\{ minHeight: '300px', resize: 'vertical' \}\} \r?\n\s*\/>",
    preview_injection,
    ts
)

with open("src/pages/portal/admin/AdminWorkflows.tsx", "w", encoding="utf-8") as f:
    f.write(ts)

print("Preview section added")
