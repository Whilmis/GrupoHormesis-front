const fs = require("fs");
let tsx = fs.readFileSync("src/pages/portal/admin/AdminWorkflows.tsx", "utf8");

const replacement = `
                    {activeTemplate.typeIdentifier === 'form_contact_handler' && (
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
                    )}
`;

tsx = tsx.replace(
  /<div className="input-group" style={{ background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>\s*<h5 style={{ margin: '0 0 0\.5rem 0', color: '#0f172a' }}>Estructura y Mapeo DinAmico de Formulario<\/h5>\s*<p style={{ margin: '0 0 1rem 0', fontSize: '0\.75rem', color: '#64748b' }}>Define los campos esperados del formulario y mapea los que cumplen funciones especiales\.<\/p>[\s\S]*?placeholder="Ej\. service" \r?\n\s*\/>\r?\n\s*<\/div>/m,
  replacement
);

fs.writeFileSync("src/pages/portal/admin/AdminWorkflows.tsx", tsx);
