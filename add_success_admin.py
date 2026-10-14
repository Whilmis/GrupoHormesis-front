filename = "src/pages/portal/admin/AdminCalendars.tsx"
with open(filename, "r", encoding="utf-8") as f:
    ts = f.read()

# Add successModal state
ts = ts.replace("const [promptModal, setPromptModal] = useState<{isOpen: boolean, start: Date, end: Date} | null>(null);", 
"const [promptModal, setPromptModal] = useState<{isOpen: boolean, start: Date, end: Date} | null>(null);\n  const [successModal, setSuccessModal] = useState<{isOpen: boolean, meetLink?: string}>({isOpen: false});")

# Update handleManualBooking
old_booking = """        if(!res.ok) {
          const data = await res.json().catch(()=>({}));
          throw new Error(data.error || 'Error desconocido al agendar');
        }
        
        if(activeCalendar) fetchMeetings(activeCalendar.id);
        setPromptModal(null);"""
        
new_booking = """        const data = await res.json().catch(()=>({}));
        if(!res.ok) {
          throw new Error(data.error || 'Error desconocido al agendar');
        }
        
        if(activeCalendar) fetchMeetings(activeCalendar.id);
        setPromptModal(null);
        setSuccessModal({isOpen: true, meetLink: data.meetLink});"""
ts = ts.replace(old_booking, new_booking)

# Add Success Modal JSX
modal_jsx = """      {/* Modal Success para Admin */}
      {successModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: 'white', padding: '3rem 2rem', borderRadius: '16px', width: '90%', maxWidth: '450px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1.5rem'}}>
               <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h2 style={{ color: '#0f172a', margin: '0 0 1rem 0' }}>¡Reunión Agendada con Éxito!</h2>
            <p style={{ color: '#475569', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              La reunión manual se ha guardado correctamente en tu calendario.
            </p>
            
            {successModal.meetLink && (
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>ENLACE DE GOOGLE MEET</p>
                <a href={successModal.meetLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', color: '#10b981', fontWeight: 600, wordBreak: 'break-all', textDecoration: 'none', marginBottom: '1rem' }}>
                  {successModal.meetLink}
                </a>
                <div>
                  <button onClick={() => navigator.clipboard.writeText(successModal.meetLink || '')} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', color: '#475569' }}>
                    📋 Copiar Enlace
                  </button>
                </div>
              </div>
            )}
            
            <button onClick={() => setSuccessModal({isOpen: false})} style={{ padding: '0.75rem 3rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
              Entendido
            </button>
          </div>
        </div>
      )}"""

# insert right before closing </div></>
ts = ts.replace("      </div>\n      </>\n    );\n  }", modal_jsx + "\n      </div>\n      </>\n    );\n  }")

with open(filename, "w", encoding="utf-8") as f:
    f.write(ts)

print("Updated AdminCalendars to show SuccessModal")
