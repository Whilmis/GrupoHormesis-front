import re
import sys

file_path = 'C:/Users/whilmis/Documents/GitHub/Grupo Hormesis/src/pages/portal/admin/AdminWorkflows.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<h5 style=\{\{ margin: \'0 0 0\.5rem 0\', color: \'#0f172a\' \}\}>Mapeo Dinámico de Formulario \(Opcional\)</h5>\s*<p style=\{\{ margin: \'0 0 1rem 0\', fontSize: \'0\.75rem\', color: \'#64748b\' \}\}>Indica el nombre de la variable JSON \(ej\. "usedCouponCode"\) que tu formulario enviará para cada rol\.</p>'

replacement = '''<h5 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Estructura y Mapeo Dinámico de Formulario</h5>
                      <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: '#64748b' }}>Define los campos esperados del formulario y mapea los que cumplen funciones especiales.</p>
                      
                      <label>Estructura esperada del formulario (variables separadas por coma)</label>
                      <input 
                        type="text" 
                        value={newWfConfig?.formSchema ? newWfConfig.formSchema.join(', ') : ''} 
                        onChange={(e) => setNewWfConfig({...newWfConfig, formSchema: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                        className="auth-input" 
                        placeholder="Ej. name, email, businessName, usedCouponCode, service" 
                        style={{ marginBottom: '1rem' }}
                      />'''

content = re.sub(pattern, replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch 6 applied.")
