import re
import sys

file_path = 'C:/Users/whilmis/Documents/GitHub/Grupo Hormesis/src/pages/portal/admin/AdminWorkflows.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update handleCreateWorkflow to save businessContext and servicesInput
pattern_save = r'(const finalConfig = \{ \.\.\.newWfConfig \};\n\s*if \(generatedTemplates && Object\.keys\(generatedTemplates\)\.length > 0\) \{\n\s*finalConfig\.generated_responses = generatedTemplates;\n\s*\})'
replacement_save = '''\\1
      if (businessContext) finalConfig.businessContext = businessContext;
      if (servicesInput) finalConfig.servicesInput = servicesInput;'''
content = re.sub(pattern_save, replacement_save, content)

# 2. Update Edit Button onClick to load businessContext, servicesInput and generatedTemplates
pattern_edit = r'setNewWfConfig\(wf\.config \|\| \{\}\);\n\s*const creds'
replacement_edit = '''setNewWfConfig(wf.config || {});
                              setBusinessContext(wf.config?.businessContext || '');
                              setServicesInput(wf.config?.servicesInput || '');
                              setGeneratedTemplates(wf.config?.generated_responses || null);
                              const creds'''
content = re.sub(pattern_edit, replacement_edit, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch 7 applied.")
