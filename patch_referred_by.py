import re
import sys

file_path = 'C:/Users/whilmis/Documents/GitHub/Grupo Hormesis/src/pages/portal/admin/AdminWorkflows.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the referral logic in the Leads CRM view
pattern = r'\{exec\.referredByUserId && \(\s*<div style=\{\{ marginTop: \'4px\', fontSize: \'0\.7rem\', color: \'#10b981\' \}\}>✅ Referido asignado</div>\s*\)\}'

replacement = '''{exec.referredBy && exec.referredBy.name && (
                          <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                            ✨ Referido por: {exec.referredBy.name}
                          </div>
                        )}
                        {!exec.referredBy && exec.referredByUserId && (
                          <div style={{ marginTop: '4px', fontSize: '0.7rem', color: '#10b981' }}>✅ Referido asignado</div>
                        )}'''

content = re.sub(pattern, replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch referredBy applied.")
