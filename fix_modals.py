import re

with open("src/pages/portal/admin/AdminCalendars.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

# 1. State for custom modals
modal_states = """  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);

  // Estados para Modales Custom
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);
  const [promptModal, setPromptModal] = useState<{isOpen: boolean, start: Date, end: Date} | null>(null);
  const [promptData, setPromptData] = useState({ name: '', email: '' });
"""
ts = ts.replace("  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);", modal_states)

# 2. Replace handleDelete
old_handle_delete = """  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Seguro que deseas eliminar este calendario?')) return;
    try {
      await apiClient(`/calendars/${id}`, { method: 'DELETE' });
      if(activeCalendar?.id === id) setActiveCalendar(null);
      fetchCalendars();
    } catch (error) {
      alert('Error eliminando calendario');
    }
  };"""

new_handle_delete = """  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Calendario',
      message: '¿Estás seguro de que deseas eliminar este calendario? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await apiClient(`/calendars/${id}`, { method: 'DELETE' });
          if(activeCalendar?.id === id) setActiveCalendar(null);
          fetchCalendars();
        } catch (error) {
          alert('Error eliminando calendario');
        }
        setConfirmModal(null);
      }
    });
  };"""
ts = ts.replace(old_handle_delete, new_handle_delete)

# 3. Replace handleDeleteMeeting
old_handle_delete_meeting = """  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm('¿Seguro que deseas cancelar esta reunión?')) return;
    try {
      await apiClient(`/meetings/${meetingId}`, { method: 'DELETE' });
      setSelectedMeeting(null);
      if(activeCalendar) fetchMeetings(activeCalendar.id);
    } catch (error: any) {
      alert('Error cancelando reunión: ' + (error.message || 'Desconocido'));
    }
  };"""

new_handle_delete_meeting = """  const handleDeleteMeeting = (meetingId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancelar Reunión',
      message: '¿Estás seguro de que deseas cancelar esta reunión? Se notificará al invitado.',
      onConfirm: async () => {
        try {
          await apiClient(`/meetings/${meetingId}`, { method: 'DELETE' });
          setSelectedMeeting(null);
          if(activeCalendar) fetchMeetings(activeCalendar.id);
        } catch (error: any) {
          alert('Error cancelando reunión: ' + (error.message || 'Desconocido'));
        }
        setConfirmModal(null);
      }
    });
  };"""
ts = ts.replace(old_handle_delete_meeting, new_handle_delete_meeting)

# 4. Replace handleSelectSlot
old_handle_select_slot = """  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    const guestName = prompt('Nombre del invitado (Reunión manual):');
    if (guestName) {
      const guestEmail = prompt('Correo del invitado:') || 'manual@example.com';
      fetch(`http://localhost:3000/api/calendars/public/${activeCalendar?.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName,
          guestEmail,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          notes: 'Agendado manualmente por Admin'
        })
      }).then(async (res) => {
        if(!res.ok) {
          const data = await res.json().catch(()=>({}));
          throw new Error(data.error || 'Error desconocido al agendar');
        }
        if(activeCalendar) fetchMeetings(activeCalendar.id);
      }).catch((e)=> alert('Error agendando: ' + e.message));
    }
  };"""

new_handle_select_slot = """  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    setPromptData({ name: '', email: '' });
    setPromptModal({ isOpen: true, start, end });
  };

  const handleManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptModal || !promptData.name || !promptData.email) return;
    
    try {
      const res = await fetch(`http://localhost:3000/api/calendars/public/${activeCalendar?.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: promptData.name,
          guestEmail: promptData.email,
          startTime: promptModal.start.toISOString(),
          endTime: promptModal.end.toISOString(),
          notes: 'Agendado manualmente por Admin'
        })
      });
      
      if(!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data.error || 'Error desconocido al agendar');
      }
      
      if(activeCalendar) fetchMeetings(activeCalendar.id);
      setPromptModal(null);
    } catch (e: any) {
      alert('Error agendando: ' + e.message);
    }
  };"""
ts = ts.replace(old_handle_select_slot, new_handle_select_slot)


# 5. Inject the Custom Modals UI at the end of the return
custom_modals = """
      {/* Modal Confirmación Custom */}
      {confirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: '#ef4444' }}>
              <AlertCircle size={28} />
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{confirmModal.title}</h2>
            </div>
            <p style={{ color: '#475569', lineHeight: 1.5, marginBottom: '2rem' }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmModal(null)} style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#475569', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={confirmModal.onConfirm} style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                Sí, Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Prompt Custom para Agendar */}
      {promptModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Agendar Reunión Manual</h2>
                <p style={{ margin: 0, color: '#10b981', fontWeight: 500, fontSize: '0.9rem' }}>
                  {promptModal.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {promptModal.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <button onClick={() => setPromptModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleManualBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Nombre del Invitado</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input required type="text" value={promptData.name} onChange={e => setPromptData({...promptData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} placeholder="Ej. Juan Pérez" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Correo Electrónico</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input required type="email" value={promptData.email} onChange={e => setPromptData({...promptData, email: e.target.value})} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} placeholder="ejemplo@correo.com" />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setPromptModal(null)} style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#475569', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}>
                  Agendar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}"""

ts = ts.replace("    </div>\n    </>\n  );\n}", custom_modals + "    </>\n  );\n}")

with open("src/pages/portal/admin/AdminCalendars.tsx", "w", encoding="utf-8") as f:
    f.write(ts)
print("Updated to custom modals")
