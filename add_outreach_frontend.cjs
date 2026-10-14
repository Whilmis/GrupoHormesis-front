const fs = require("fs");
let tsx = fs.readFileSync("src/pages/portal/admin/AdminWorkflows.tsx", "utf8");

const replacement = `                          </div>
                        )}
                        
                        {activeTemplate.typeIdentifier === 'auto_outreach_google_maps' && (
                          <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '1rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>🤖 Configuración de Auto Outreach</h4>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                              Envía correos personalizados automáticamente a los leads obtenidos de Google Maps utilizando Groq AI.
                            </p>
                        
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                              <label>Fuente de Leads (Campaña Google Maps)</label>
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
                              <label>Límite de Envío Diario</label>
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
                                  ['0 8 * * 1-5', '0 10 * * 1-5', '0 12 * * 1-5', '0 9 * * 1-5'].includes(newWfConfig.schedule || '0 8 * * 1-5') 
                                  ? (newWfConfig.schedule || '0 8 * * 1-5') 
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
                                <option value="0 8 * * 1-5">Lunes a Viernes a las 8:00 AM</option>
                                <option value="0 10 * * 1-5">Lunes a Viernes a las 10:00 AM</option>
                                <option value="0 12 * * 1-5">Lunes a Viernes a las 12:00 PM</option>
                                <option value="0 9 * * 1-5">Lunes a Viernes a las 9:00 AM</option>
                                <option value="custom">Personalizado (Avanzado)</option>
                              </select>
                              
                              {(!['0 8 * * 1-5', '0 10 * * 1-5', '0 12 * * 1-5', '0 9 * * 1-5'].includes(newWfConfig.schedule || '0 8 * * 1-5')) && (
                                <input 
                                  type="text" 
                                  value={newWfConfig.schedule || '0 8 * * 1-5'} 
                                  onChange={e => setNewWfConfig({...newWfConfig, schedule: e.target.value})} 
                                  className="auth-input" 
                                  placeholder="Ingresa tu expresión Cron (ej. 0 8 * * 1-5)" 
                                />
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Mostrar campos dinamicos basados en configSchema */}`;

tsx = tsx.replace(/                          <\/div>\r?\n                        \)\}\r?\n\s+\{\/\* Mostrar campos dinamicos basados en configSchema \*\/\}/, replacement);

fs.writeFileSync("src/pages/portal/admin/AdminWorkflows.tsx", tsx);
