import re
import sys

file_path = 'C:/Users/whilmis/Documents/GitHub/Grupo Hormesis/src/pages/portal/admin/AdminWorkflows.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacement_func = """  const handleCreateWorkflow = async (e: React.FormEvent, templateId: string) => {
    e.preventDefault();
    try {
      const finalConfig = { ...newWfConfig };
      if (generatedTemplates && Object.keys(generatedTemplates).length > 0) {
        finalConfig.generated_responses = generatedTemplates;
      }
      
      if (editingWorkflowId) {
        await apiClient(`/workflows/${editingWorkflowId}`, {
          method: 'PUT',
          data: {
            name: newWfName,
            config: finalConfig,
            credentialIds: Object.values(newWfCreds)
          }
        });
      } else {
        await apiClient('/workflows', {
          method: 'POST',
          data: {
            templateId,
            name: newWfName,
            config: finalConfig,
            credentialIds: Object.values(newWfCreds)
          }
        });
      }
      
      setShowNewWfForm(false);
      setEditingWorkflowId(null);
      setNewWfName('');
      setNewWfConfig({});
      setNewWfCreds({});
      fetchData();
    } catch (error: any) {
      alert('Error guardando el workflow: ' + (error.response?.data?.details || error.message));
    }
  };"""

pattern = re.compile(r'const handleCreateWorkflow = async \(e: React\.FormEvent, templateId: string\) => \{.*?catch \(.*?\}', re.DOTALL)
content = pattern.sub(replacement_func.strip(), content)


card_pattern = r'<span style=\{\{ fontSize: \'0\.7rem\', background: wf\.isActive \? \'#dcfce7\' : \'#fee2e2\', color: wf\.isActive \? \'#166534\' : \'#991b1b\', padding: \'2px 6px\', borderRadius: \'12px\' \}\}>\s*\{wf\.isActive \? t\(\'portal\.active\', \'Activo\'\) : t\(\'portal\.inactive\', \'Inactivo\'\)\}\s*</span>'

replacement_card = """<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.7rem', background: wf.isActive ? '#dcfce7' : '#fee2e2', color: wf.isActive ? '#166534' : '#991b1b', padding: '2px 6px', borderRadius: '12px' }}>
                            {wf.isActive ? t('portal.active', 'Activo') : t('portal.inactive', 'Inactivo')}
                          </span>
                          <button 
                            onClick={() => {
                              setEditingWorkflowId(wf.id);
                              setNewWfName(wf.name);
                              setNewWfConfig(wf.config || {});
                              const creds: Record<string, string> = {};
                              wf.credentials?.forEach(c => creds[c.type] = c.id);
                              setNewWfCreds(creds);
                              setShowNewWfForm(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0 }}
                            title="Editar Workflow"
                          >
                            <Edit3 size={16} />
                          </button>
                        </div>"""

content = re.sub(card_pattern, replacement_card, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied.")
