import re

with open("src/pages/portal/public/PublicBooking.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

# Replace the layout
old_layout = """      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          
          {/* Header Info */}
          <div style={{ background: '#0f172a', color: 'white', padding: '2rem', textAlign: 'center' }}>
            <h4 style={{ color: '#10b981', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
              {calendar.user?.company || calendar.user?.name || 'Invitación'}
            </h4>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', fontWeight: 600 }}>{calendar.name}</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} color="#10b981" /> Duración: {calendar.duration} min</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🌍 Zona Horaria: {calendar.timezone}</span>
            </div>
            {calendar.description && <p style={{ color: '#94a3b8', margin: '1rem auto 0 auto', maxWidth: '600px' }}>{calendar.description}</p>}
          </div>

          {/* Calendario Literal */}
          <div style={{ padding: '2rem', height: '600px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', textAlign: 'center' }}>Haz click en un espacio blanco para agendar</h3>"""

new_layout = """      <div style={{ minHeight: 'calc(100vh - 80px)', background: '#f8fafc', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header Info */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h4 style={{ color: '#10b981', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '2px', fontWeight: 700 }}>
              {calendar.user?.company || calendar.user?.name || 'Invitación'}
            </h4>
            <h1 style={{ margin: '0 0 1rem 0', fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{calendar.name}</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', color: '#475569', fontSize: '1rem', fontWeight: 500 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}><Clock size={18} color="#10b981" /> Duración: {calendar.duration} min</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>🌍 Zona Horaria: {calendar.timezone}</span>
            </div>
            {calendar.description && <p style={{ color: '#64748b', margin: '1.5rem auto 0 auto', maxWidth: '600px', fontSize: '1.1rem', lineHeight: 1.6 }}>{calendar.description}</p>}
          </div>

          {/* Calendario Literal */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', height: '700px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', textAlign: 'center', fontWeight: 600 }}>Selecciona un horario disponible para agendar</h3>"""

ts = ts.replace(old_layout, new_layout)

with open("src/pages/portal/public/PublicBooking.tsx", "w", encoding="utf-8") as f:
    f.write(ts)
print("Updated PublicBooking.tsx design")
