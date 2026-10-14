const fs = require('fs');
let code = fs.readFileSync('src/pages/portal/admin/AdminWorkflows.tsx', 'utf8');

const thTarget = "<th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0' }}>Dirección</th>";
const thReplace = thTarget + "\n                                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0' }}>Email</th>";
code = code.replace(thTarget, thReplace);

const tdTarget = "<td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{lead.address || '-'}</td>";
const tdReplace = tdTarget + "\n                                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>\n                                        {lead.email && lead.email !== 'No disponible' && lead.email !== 'Error de conexión' ? (\n                                          <a href={mailto:\} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>?? {lead.email}</a>\n                                        ) : (\n                                          <span style={{ color: '#94a3b8' }}>-</span>\n                                        )}\n                                      </td>";
code = code.replace(tdTarget, tdReplace);

fs.writeFileSync('src/pages/portal/admin/AdminWorkflows.tsx', code);
