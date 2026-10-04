import re
import sys

file_path = 'C:/Users/whilmis/Documents/GitHub/Grupo Hormesis/src/pages/portal/admin/AdminWorkflows.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add a check at the top of the return
# The return statement is around line 316
pattern = r'(return \(\n\s*<div>\n\s*<div style=\{\{ display: \'flex\', justifyContent: \'space-between\')'

replacement = '''if (viewingLeadsWfId) {
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
                  const couponKey = mapping.referralCodeField;
                  const couponValue = couponKey ? payload[couponKey] : (payload.usedCouponCode || payload.coupon);
                  
                  const extraData = { ...payload };
                  delete extraData.name;
                  delete extraData.email;
                  delete extraData.businessName;
                  if (couponKey) delete extraData[couponKey];

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
                        {couponValue ? (
                          <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            🏷️ {couponValue}
                          </span>
                        ) : <span style={{ color: '#94a3b8' }}>-</span>}
                        {exec.referredByUserId && (
                          <div style={{ marginTop: '4px', fontSize: '0.7rem', color: '#10b981' }}>✅ Referido asignado</div>
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

  \\1'''
content = re.sub(pattern, replacement, content)

# Remove the inline CRM view
crm_inline_pattern = r'\{/\* CRM TABLE UI \*/\}.*?\{/\* Resultado \*/\}'
content = re.sub(crm_inline_pattern, '{/* Resultado */}', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done applying full screen leads CRM')
