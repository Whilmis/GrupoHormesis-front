import re

with open("src/pages/portal/admin/AdminCalendars.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

# Add the import
ts = ts.replace("import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';", "import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';\nimport TimezoneSelect from 'react-timezone-select';")

# Set the default timezone in the formData state to the user's local timezone
local_tz_guess = "Intl.DateTimeFormat().resolvedOptions().timeZone"
ts = ts.replace("timezone: 'UTC',", f"timezone: {local_tz_guess},")

# Replace the Timezone input field with TimezoneSelect
old_input = """<div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>Zona Horaria</label>
                  <input type="text" value={formData.timezone} onChange={e => setFormData({...formData, timezone: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>"""

new_input = """<div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>Zona Horaria / País</label>
                  <TimezoneSelect
                    value={formData.timezone}
                    onChange={(tz: any) => setFormData({...formData, timezone: tz.value})}
                    placeholder="Busca un país o ciudad..."
                    styles={{
                      control: (provided: any) => ({
                        ...provided,
                        padding: '0.15rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        boxShadow: 'none',
                        '&:hover': { borderColor: '#cbd5e1' }
                      }),
                      option: (provided: any, state: any) => ({
                        ...provided,
                        backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#f8fafc' : 'white',
                        color: state.isSelected ? 'white' : '#0f172a',
                        cursor: 'pointer'
                      })
                    }}
                  />
                </div>"""

ts = ts.replace(old_input, new_input)

with open("src/pages/portal/admin/AdminCalendars.tsx", "w", encoding="utf-8") as f:
    f.write(ts)
print("Updated to use TimezoneSelect")
