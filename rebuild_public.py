with open("src/pages/portal/public/PublicBooking.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

# I will replace the entire file to make it a BigCalendar implementation
new_content = """import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Clock, User, Mail, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Helper to fetch sin auth
const fetchPublic = async (url: string, options?: any) => {
  const res = await fetch(`http://localhost:3000/api${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error: any = new Error(data.error || 'Error de red');
    error.status = res.status;
    throw error;
  }
  return data;
};

export default function PublicBooking() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId'); 
  
  const [calendar, setCalendar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [meetings, setMeetings] = useState<any[]>([]); // Para bloquear horarios
  
  // Modal de Agendamiento
  const [bookingModal, setBookingModal] = useState<{isOpen: boolean, start: Date, end: Date} | null>(null);
  const [successModal, setSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({ guestName: '', guestEmail: '', notes: '' });
  const [serverError, setServerError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPublic(`/calendars/public/${id}`)
      .then(data => {
        setCalendar(data);
        return fetchPublic(`/calendars/public/${id}/meetings`);
      })
      .then(data => {
        // En vista pública, mapeamos las reuniones como "Ocupado" sin revelar datos
        const formatted = (data || []).map((m: any) => ({
          id: m.id,
          title: "Ocupado",
          start: new Date(m.startTime),
          end: new Date(m.endTime),
        }));
        setMeetings(formatted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    if (start < new Date()) {
      alert("No puedes agendar en el pasado.");
      return;
    }
    
    // Verificar que el slot no choca con "Ocupado" o que dura exactamente lo que pide el calendario (opcional)
    setServerError('');
    setFormData({ guestName: '', guestEmail: '', notes: '' });
    setBookingModal({ isOpen: true, start, end });
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModal) return;
    setServerError('');
    setIsSubmitting(true);
    
    try {
      const payload: any = {
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        notes: formData.notes,
        startTime: bookingModal.start.toISOString(),
        endTime: bookingModal.end.toISOString()
      };
      if (leadId) payload.leadId = leadId;
      
      await fetchPublic(`/calendars/public/${id}/book`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setBookingModal(null);
      setSuccessModal(true);
    } catch (error: any) {
      if (error.status === 409) {
        setServerError('Este espacio ya no está disponible.');
      } else {
        setServerError(error.message || 'Hubo un error agendando tu cita.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const slotPropGetter = (date: Date) => {
    if (!calendar || !calendar.availability) return {};
    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayStr = daysMap[date.getDay()];
    const avail = calendar.availability[dayStr];
    
    let isAvailable = false;
    
    if (avail && typeof avail === 'object' && !Array.isArray(avail)) {
      if (avail.active) {
        const [startHour, startMin] = avail.start.split(':').map(Number);
        const [endHour, endMin] = avail.end.split(':').map(Number);
        const slotTime = date.getHours() * 60 + date.getMinutes();
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;
        if (slotTime >= startTime && slotTime < endTime) isAvailable = true;
      }
    } 
    else if (Array.isArray(avail) && avail.length > 0) {
       const [startStr, endStr] = avail[0].split('-');
       const [startHour, startMin] = startStr.split(':').map(Number);
       const [endHour, endMin] = endStr.split(':').map(Number);
       const slotTime = date.getHours() * 60 + date.getMinutes();
       const startTime = startHour * 60 + startMin;
       const endTime = endHour * 60 + endMin;
       if (slotTime >= startTime && slotTime < endTime) isAvailable = true;
    }

    if (!isAvailable) {
      return { style: { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } };
    }
    return { style: { backgroundColor: '#ffffff', cursor: 'pointer' } };
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Cargando calendario...</div>;
  if (!calendar) return <div style={{ padding: '4rem', textAlign: 'center' }}>Calendario no encontrado</div>;

  return (
    <>
      <style>{`
        .rbc-toolbar button { border: 1px solid #e2e8f0; color: #475569; border-radius: 8px; padding: 0.5rem 1rem; font-weight: 500; background: white; }
        .rbc-toolbar button:hover { background: #f8fafc; }
        .rbc-toolbar button.rbc-active { background: #10b981; color: white; border-color: #10b981; }
        .rbc-header { padding: 0.75rem 0; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; text-transform: capitalize; }
        .rbc-time-view { border: 1px solid #e2e8f0; border-radius: 12px; background: white; overflow: hidden; }
        .rbc-event { background-color: #94a3b8 !important; border: none !important; border-radius: 6px; pointer-events: none; }
        .rbc-today { background-color: rgba(16, 185, 129, 0.03); }
      `}</style>
      
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
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
            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', textAlign: 'center' }}>Haz click en un espacio blanco para agendar</h3>
            <BigCalendar
              localizer={localizer}
              events={meetings}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              defaultView={Views.WEEK}
              step={15}
              timeslots={4}
              min={new Date(0, 0, 0, 6, 0, 0)}
              max={new Date(0, 0, 0, 23, 59, 59)}
              selectable={true}
              slotPropGetter={slotPropGetter}
              onSelectSlot={handleSelectSlot}
              messages={{ next: "Sig.", previous: "Ant.", today: "Hoy", month: "Mes", week: "Semana", day: "Día" }}
            />
          </div>
        </div>
      </div>

      {/* Modal Formulario Publico */}
      {bookingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Confirmar Cita</h2>
                <p style={{ margin: 0, color: '#10b981', fontWeight: 500 }}>
                  {bookingModal.start.toLocaleDateString()} | {bookingModal.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <button onClick={() => setBookingModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </div>
            
            {serverError && (
              <div style={{ background: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <AlertCircle size={18} /> {serverError}
              </div>
            )}

            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Nombre Completo</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input required type="text" value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} placeholder="Ej. Juan Pérez" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Correo Electrónico</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input required type="email" value={formData.guestEmail} onChange={e => setFormData({...formData, guestEmail: e.target.value})} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} placeholder="ejemplo@correo.com" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Notas Adicionales (Opcional)</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px' }} />
              </div>
              
              <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '1rem', background: '#10b981', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '1rem' }}>
                {isSubmitting ? 'Agendando...' : 'Confirmar Reunión'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Success */}
      {successModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: 'white', padding: '3rem 2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1.5rem auto' }} />
            <h2 style={{ color: '#0f172a', margin: '0 0 1rem 0' }}>¡Reunión Agendada!</h2>
            <p style={{ color: '#475569', lineHeight: 1.5, marginBottom: '2rem' }}>
              Te hemos enviado una invitación de calendario a <strong>{formData.guestEmail}</strong>.
            </p>
            <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 2rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Agendar otra cita
            </button>
          </div>
        </div>
      )}
    </>
  );
}
"""

with open("src/pages/portal/public/PublicBooking.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Updated PublicBooking.tsx")
