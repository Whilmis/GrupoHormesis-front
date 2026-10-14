import re

with open("src/pages/portal/admin/AdminCalendars.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

# We will completely refactor this to be a split view where the calendar is ALWAYS visible.
replacement = """
  useEffect(() => {
    fetchCalendars();
  }, []);

  useEffect(() => {
    if (calendars.length > 0 && !activeCalendar) {
      openCalendarView(calendars[0]);
    }
  }, [calendars]);

  const fetchCalendars = async () => {
"""
ts = ts.replace("""  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {""", replacement)

render_logic = """  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
      {/* Sidebar de Calendarios */}
      <div style={{ width: '320px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: '#0f172a' }}>
            <CalendarIcon size={20} color="#10b981" /> Mis Calendarios
          </h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ width: '100%', background: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
          >
            <Plus size={18} /> Nuevo Calendario
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>Cargando...</p>
          ) : calendars.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No tienes calendarios creados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {calendars.map(cal => (
                <div 
                  key={cal.id} 
                  onClick={() => openCalendarView(cal)}
                  style={{ 
                    background: activeCalendar?.id === cal.id ? '#e2e8f0' : 'white', 
                    borderRadius: '8px', 
                    padding: '1rem', 
                    border: `1px solid ${activeCalendar?.id === cal.id ? '#cbd5e1' : '#e2e8f0'}`, 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>{cal.name}</h4>
                    <button 
                      onClick={(e) => handleDelete(cal.id, e)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                    <Clock size={14} /> {cal.duration} min
                  </div>
                  <button 
                    onClick={(e) => copyLink(cal.id, e)}
                    style={{ width: '100%', padding: '0.5rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 500 }}
                  >
                    <Link size={14} /> Copiar Link Público
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Calendar Area */}
      <div style={{ flex: 1, background: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeCalendar ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ margin: 0, color: '#0f172a' }}>{activeCalendar.name}</h1>
              <p style={{ margin: 0, color: '#64748b' }}>Arrastra sobre un horario vacío para agendar una cita manualmente.</p>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <BigCalendar
                localizer={localizer}
                events={meetings}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                defaultView={Views.WEEK}
                selectable={true}
                onSelectSlot={handleSelectSlot}
                messages={{
                  next: "Siguiente",
                  previous: "Anterior",
                  today: "Hoy",
                  month: "Mes",
                  week: "Semana",
                  day: "Día"
                }}
              />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            Selecciona o crea un calendario en el panel izquierdo.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Nuevo Calendario</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Nombre</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Descripción (pública)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Zona Horaria</label>
                  <input type="text" value={formData.timezone} onChange={e => setFormData({...formData, timezone: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Duración (minutos)</label>
                  <input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              
              <button type="submit" style={{ background: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '6px', border: 'none', marginTop: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                Crear Calendario
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}"""

ts = re.sub(r'  if \(activeCalendar\) \{.*?  return \(\s*<div style={{ padding: \'2rem\' }}>.*?\);\s*\}', render_logic, ts, flags=re.DOTALL)

with open("src/pages/portal/admin/AdminCalendars.tsx", "w", encoding="utf-8") as f:
    f.write(ts)
print("File rewritten")
