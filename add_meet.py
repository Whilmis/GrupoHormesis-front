import re

filename = "src/pages/portal/public/PublicBooking.tsx"
with open(filename, "r", encoding="utf-8") as f:
    ts = f.read()

# 1. Update state for successModal to hold the link
ts = ts.replace("const [successModal, setSuccessModal] = useState(false);", "const [successModal, setSuccessModal] = useState<{isOpen: boolean, meetLink?: string}>({isOpen: false});")

# 2. Update handleBook to capture the response
old_fetch = """      await fetchPublic(`/calendars/public/${id}/book`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setBookingModal(null);
      setSuccessModal(true);"""
      
new_fetch = """      const response = await fetchPublic(`/calendars/public/${id}/book`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setBookingModal(null);
      setSuccessModal({isOpen: true, meetLink: response.meetLink || response.meeting?.meetLink || response.data?.meetLink});"""
ts = ts.replace(old_fetch, new_fetch)

# 3. Update the Success Modal UI
old_modal = """      {/* Modal Success */}
      {successModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: 'white', padding: '3rem 2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1.5rem auto' }} />
            <h2 style={{ color: '#0f172a', margin: '0 0 1rem 0' }}>¡Reunión Agendada con Éxito!</h2>
            <p style={{ color: '#475569', lineHeight: 1.5, marginBottom: '2rem' }}>
              Te hemos enviado la invitación y los detalles a <strong>{formData.guestEmail}</strong>. Ya puedes cerrar esta ventana.
            </p>
            <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 2rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Aceptar
            </button>
          </div>
        </div>
      )}"""
      
new_modal = """      {/* Modal Success */}
      {successModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: 'white', padding: '3rem 2rem', borderRadius: '16px', width: '90%', maxWidth: '450px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1.5rem auto' }} />
            <h2 style={{ color: '#0f172a', margin: '0 0 1rem 0' }}>¡Reunión Agendada con Éxito!</h2>
            <p style={{ color: '#475569', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Te hemos enviado la invitación al calendario de <strong>{formData.guestEmail}</strong>.
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
            
            <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 3rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
              Entendido
            </button>
          </div>
        </div>
      )}"""
ts = ts.replace(old_modal, new_modal)

with open(filename, "w", encoding="utf-8") as f:
    f.write(ts)

print("Updated PublicBooking to capture and show Meet Link")
