import re
import sys

file_path = 'C:/Users/whilmis/Documents/GitHub/Grupo Hormesis/src/pages/contacto/Contacto.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Read workflowId from URL
params_pattern = r'const solucionParam = searchParams\.get\(\'solucion\'\);'
params_replacement = '''const solucionParam = searchParams.get('solucion');
  const workflowId = searchParams.get('wid') || searchParams.get('workflowId');'''
content = re.sub(params_pattern, params_replacement, content)

# 2. Update fetch URL
fetch_pattern = r'const res = await fetch\(\'http://localhost:3000/api/forms/submit\', \{'
fetch_replacement = '''if (!workflowId) {
        alert('Falta el ID del workflow en la URL (?wid=xyz). Por favor, usa un enlace válido.');
        return;
      }

      const res = await fetch(`http://localhost:3000/api/forms/${workflowId}/submit`, {'''
content = re.sub(fetch_pattern, fetch_replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch Contacto applied.")
