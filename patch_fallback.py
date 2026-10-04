import re
import sys

file_path = 'C:/Users/whilmis/Documents/GitHub/Grupo Hormesis/src/pages/contacto/Contacto.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the current workflowId logic and fetch logic
pattern = r'const solucionParam = searchParams\.get\(\'solucion\'\);\s*const workflowId = searchParams\.get\(\'wid\'\) \|\| searchParams\.get\(\'workflowId\'\);.*?if \(!workflowId\) \{.*?return;\s*\}\s*const res = await fetch\(`http://localhost:3000/api/forms/\$\{workflowId\}/submit`, \{'

replacement = '''const solucionParam = searchParams.get('solucion');
  
  // 1. Configurar el ID de desarrollo (Fallback)
  let workflowId = searchParams.get('wid') || searchParams.get('workflowId');
  if (!workflowId && import.meta.env.DEV) {
    workflowId = 'eec6f7e7-7706-4b50-8cad-987b1a2fef61';
  }'''

content = re.sub(r'const solucionParam = searchParams\.get\(\'solucion\'\);\s*const workflowId = searchParams\.get\(\'wid\'\) \|\| searchParams\.get\(\'workflowId\'\);', replacement, content)

fetch_pattern = r'if \(!workflowId\) \{\s*alert\(\'Falta el ID del workflow en la URL \(\?wid=xyz\)\. Por favor, usa un enlace válido\.\'\);\s*return;\s*\}\s*const res = await fetch\(`http://localhost:3000/api/forms/\$\{workflowId\}/submit`, \{'

fetch_replacement = '''if (!workflowId) {
        alert('Falta el ID del workflow en la URL (?wid=xyz). Por favor, usa un enlace válido.');
        return;
      }

      // 2. Apuntar al Endpoint Correcto
      const res = await fetch(`http://localhost:3000/api/forms/${workflowId}/submit`, {'''

content = re.sub(fetch_pattern, fetch_replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch Fallback ID applied.")
