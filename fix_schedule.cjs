const fs = require("fs");
let tsx = fs.readFileSync("src/pages/portal/admin/AdminWorkflows.tsx", "utf8");

const replacement = `
                        {/* PROGRAMACION PARA AUTO OUTREACH */}
                        {wf.template.typeIdentifier === 'auto_outreach_google_maps' && wf.config?.schedule && (
                          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Clock size={20} color="#16a34a" />
                            <div>
                              <div style={{ fontSize: '0.7rem', color: '#166534', textTransform: 'uppercase', fontWeight: 'bold' }}>{t('portal.scheduled_execution', 'Próxima ejecución programada')}</div>
                              <div style={{ fontSize: '0.85rem', color: '#14532d', fontWeight: '600' }}>
                                  {wf.config.schedule === '0 8 * * 1-5' ? 'Lunes a Viernes a las 8:00 AM' : 
                                   wf.config.schedule === '0 10 * * 1-5' ? 'Lunes a Viernes a las 10:00 AM' :
                                   wf.config.schedule === '0 12 * * 1-5' ? 'Lunes a Viernes a las 12:00 PM' :
                                   wf.config.schedule === '0 9 * * 1-5' ? 'Lunes a Viernes a las 9:00 AM' :
                                   \`Expresión Cron: \${wf.config.schedule}\`}
                              </div>
                            </div>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
`;

tsx = tsx.replace(
  /<div style={{ display: 'flex', gap: '0\.5rem' }}>/,
  replacement
);

fs.writeFileSync("src/pages/portal/admin/AdminWorkflows.tsx", tsx);
