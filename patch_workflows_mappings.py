import re
import sys

file_path = 'C:/Users/whilmis/Documents/GitHub/Grupo Hormesis/src/pages/portal/admin/AdminWorkflows.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Title
title_pattern = r'<h4 style=\{\{ margin: \'0 0 1rem 0\' \}\}>Nueva instancia de \{t\(`templates\.\$\{activeTemplate\.id\}\.name`, fixEncoding\(activeTemplate\.name\)\)\}</h4>'
replacement_title = '''<h4 style={{ margin: '0 0 1rem 0' }}>{editingWorkflowId ? 'Editar Instancia' : `Nueva instancia de ${t(`templates.${activeTemplate.id}.name`, fixEncoding(activeTemplate.name))}`}</h4>'''
content = re.sub(title_pattern, replacement_title, content)

# 2. Add Field Mappings UI right under newWfName
name_input_pattern = r'(<input type="text" required value=\{newWfName\}.*?/>\s*</div>)'

field_mappings_ui = '''\\1
                    <div className="input-group" style={{ background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Mapeo Dinámico de Formulario (Opcional)</h5>
                      <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: '#64748b' }}>Indica el nombre de la variable JSON (ej. "usedCouponCode") que tu formulario enviará para cada rol.</p>
                      
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
                    </div>'''

content = re.sub(name_input_pattern, field_mappings_ui, content, count=1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch 5 applied.")
