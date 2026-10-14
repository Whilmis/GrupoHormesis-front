filename = "src/pages/portal/admin/AdminCalendars.tsx"
with open(filename, "r", encoding="utf-8") as f:
    ts = f.read()

old_modal = """              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
                  <User size={18} color="#10b981" />
                  <strong>{selectedMeeting.raw.guestName}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
                  <Mail size={18} color="#10b981" />
                  <span>{selectedMeeting.raw.guestEmail}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
                  <Clock size={18} color="#10b981" />
                  <span>{selectedMeeting.start.toLocaleString()} - {selectedMeeting.end.toLocaleTimeString()}</span>
                </div>
                
                {selectedMeeting.desc && (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>
                    <strong>Notas:</strong><br/>
                    {selectedMeeting.desc}
                  </div>
                )}
              </div>"""

new_modal = """              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
                  <User size={18} color="#10b981" />
                  <strong>{selectedMeeting.raw.guestName}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
                  <Mail size={18} color="#10b981" />
                  <span>{selectedMeeting.raw.guestEmail}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
                  <Clock size={18} color="#10b981" />
                  <span>{selectedMeeting.start.toLocaleString()} - {selectedMeeting.end.toLocaleTimeString()}</span>
                </div>
                
                {selectedMeeting.raw.meetLink && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px'}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14v-4z"></path><rect x="3" y="6" width="12" height="12" rx="2" ry="2"></rect></svg>
                    </div>
                    <a href={selectedMeeting.raw.meetLink} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
                      Unirse a Google Meet
                    </a>
                  </div>
                )}
                
                {selectedMeeting.desc && (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>
                    <strong>Notas:</strong><br/>
                    {selectedMeeting.desc}
                  </div>
                )}
              </div>"""
              
ts = ts.replace(old_modal, new_modal)

with open(filename, "w", encoding="utf-8") as f:
    f.write(ts)

print("Updated AdminCalendars")
