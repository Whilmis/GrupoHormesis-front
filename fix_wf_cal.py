filename = "src/pages/portal/admin/AdminWorkflows.tsx"
with open(filename, "r", encoding="utf-8") as f:
    ts = f.read()

# Add calendars state
if "const [calendars, setCalendars]" not in ts:
    ts = ts.replace("  const [projects, setProjects] = useState<any[]>([]);", "  const [projects, setProjects] = useState<any[]>([]);\n  const [calendars, setCalendars] = useState<any[]>([]);")

# Fetch calendars
old_fetch = """      const [tplRes, wfRes, credsRes, projRes] = await Promise.all([
        apiClient.get('/workflows/templates'),
        apiClient.get('/workflows/user'),
        apiClient.get('/credentials'),
        apiClient.get('/projects')
      ]);"""

new_fetch = """      const [tplRes, wfRes, credsRes, projRes, calRes] = await Promise.all([
        apiClient.get('/workflows/templates'),
        apiClient.get('/workflows/user'),
        apiClient.get('/credentials'),
        apiClient.get('/projects'),
        apiClient.get('/calendars').catch(() => ({ data: [] }))
      ]);"""
ts = ts.replace(old_fetch, new_fetch)

# Set calendars
if "setCalendars(calRes.data);" not in ts:
    ts = ts.replace("      setProjects(projRes.data);", "      setProjects(projRes.data);\n      setCalendars(calRes.data || []);")

# Render calendar dropdown in dynamic inputs
old_input = """                          {prop.format === 'textarea' ? (
                            <textarea 
                              required 
                              value={newWfConfig[key] || ''} 
                              onChange={(e) => setNewWfConfig({...newWfConfig, [key]: e.target.value})} 
                              className="auth-input" 
                              style={{ minHeight: '100px', resize: 'vertical' }}
                              placeholder={prop.description}
                            />
                          ) : (
                            <input 
                              type="text" 
                              required 
                              value={newWfConfig[key] || ''} 
                              onChange={(e) => setNewWfConfig({...newWfConfig, [key]: e.target.value})} 
                              className="auth-input" 
                              placeholder={prop.description}
                            />
                          )}"""

new_input = """                          {prop.format === 'textarea' ? (
                            <textarea 
                              required 
                              value={newWfConfig[key] || ''} 
                              onChange={(e) => setNewWfConfig({...newWfConfig, [key]: e.target.value})} 
                              className="auth-input" 
                              style={{ minHeight: '100px', resize: 'vertical' }}
                              placeholder={prop.description}
                            />
                          ) : prop.format === 'calendar' ? (
                            <select
                              required
                              value={newWfConfig[key] || ''}
                              onChange={(e) => setNewWfConfig({...newWfConfig, [key]: e.target.value})}
                              className="auth-input"
                              style={{ appearance: 'auto', background: 'white' }}
                            >
                              <option value="">-- Selecciona un Calendario --</option>
                              {calendars.map(cal => (
                                <option key={cal.id} value={cal.id}>{cal.name}</option>
                              ))}
                            </select>
                          ) : (
                            <input 
                              type="text" 
                              required 
                              value={newWfConfig[key] || ''} 
                              onChange={(e) => setNewWfConfig({...newWfConfig, [key]: e.target.value})} 
                              className="auth-input" 
                              placeholder={prop.description}
                            />
                          )}"""
ts = ts.replace(old_input, new_input)

with open(filename, "w", encoding="utf-8") as f:
    f.write(ts)

print("Updated AdminWorkflows.tsx to support calendar dropdown")
