import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Clock, User, Mail, CheckCircle, AlertCircle, X, Lock } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
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


const CustomTimeSlot = ({ value, children }: any) => {
  const child = React.Children.only(children);
  const timeStr = value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return React.cloneElement(child, {
    children: (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {child.props.children}
        <div className="hover-time-indicator">{timeStr}</div>
      </div>
    )
  });
};

export default function PublicBooking() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token');
  let urlGuestName = searchParams.get('guestName') || '';
  let urlGuestEmail = searchParams.get('guestEmail') || '';
  let urlLeadId = searchParams.get('leadId') || '';
  let isSecureToken = false;
  
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.guestName || decoded.name) urlGuestName = decoded.guestName || decoded.name;
      if (decoded.guestEmail || decoded.email) urlGuestEmail = decoded.guestEmail || decoded.email;
      if (decoded.leadId) urlLeadId = decoded.leadId;
      isSecureToken = true;
    } catch (e) {
      console.error("Token de seguridad inválido", e);
    }
  } else {
    // Si no hay token, intentamos usar los legacy estáticos por si acaso
    urlLeadId = searchParams.get('leadId') || urlLeadId;
  }
  
  const [calendar, setCalendar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<any>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const [meetings, setMeetings] = useState<any[]>([]); // Para bloquear horarios
  
  // Modal de Agendamiento
  const [bookingModal, setBookingModal] = useState<{isOpen: boolean, start: Date, end: Date} | null>(null);
  const [successModal, setSuccessModal] = useState<{isOpen: boolean, meetLink?: string}>({isOpen: false});
  
  const [formData, setFormData] = useState({ guestName: urlGuestName || '', guestEmail: urlGuestEmail || '', notes: '', leadId: urlLeadId || '' });
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
    setFormData({ guestName: formData.guestName || urlGuestName || '', guestEmail: formData.guestEmail || urlGuestEmail || '', notes: '', leadId: formData.leadId || urlLeadId || '' });
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
      if (formData.leadId) payload.leadId = formData.leadId;
      
      const response = await fetchPublic(`/calendars/public/${id}/book`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setBookingModal(null);
      setSuccessModal({isOpen: true, meetLink: response.meetLink || response.meeting?.meetLink || response.data?.meetLink});
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
    
    // ZONA HORARIA ROBUSTA
    const calendarTimeZone = calendar.timezone || 'Europe/Madrid';
    
    // Formateador de fechas para saber qué hora es en Madrid cuando en el browser es 'date'
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: calendarTimeZone,
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23'
    });
    
    const parts = formatter.formatToParts(date);
    const tday = (parts.find(p => p.type === 'weekday')?.value || '').toLowerCase();
    const thour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const tmin = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);

    const avail = calendar.availability[tday];
    let isAvailable = false;
    
    if (avail && typeof avail === 'object' && !Array.isArray(avail)) {
      if (avail.active) {
        const [startHour, startMin] = avail.start.split(':').map(Number);
        const [endHour, endMin] = avail.end.split(':').map(Number);
        const slotTime = thour * 60 + tmin;
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;
        if (slotTime >= startTime && slotTime < endTime) isAvailable = true;
      }
    } 
    else if (Array.isArray(avail) && avail.length > 0) {
       const [startStr, endStr] = avail[0].split('-');
       const [startHour, startMin] = startStr.split(':').map(Number);
       const [endHour, endMin] = endStr.split(':').map(Number);
       const slotTime = thour * 60 + tmin;
       const startTime = startHour * 60 + startMin;
       const endTime = endHour * 60 + endMin;
       if (slotTime >= startTime && slotTime < endTime) isAvailable = true;
    }

    const now = new Date();
    if (date < now) { 
      return { className: 'slot-past', style: { backgroundColor: '#e2e8f0', cursor: 'not-allowed', opacity: 0.6, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)' } }; 
    }
    if (!isAvailable) { return { className: 'slot-blocked', style: { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } }; }
    return { className: 'slot-available', style: { backgroundColor: '#ffffff', cursor: 'pointer' } };
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Cargando calendario...</div>;
  if (!calendar) return <div style={{ padding: '4rem', textAlign: 'center' }}>Calendario no encontrado</div>;

  // Dynamic min and max hours based on availability
  let minHour = 8;
  let maxHour = 18;
  if (calendar?.availability) {
    let earliest = 24;
    let latest = 0;
    Object.values(calendar.availability).forEach((avail: any) => {
      if (avail && typeof avail === 'object' && !Array.isArray(avail) && avail.active) {
        const startH = parseInt(avail.start.split(':')[0]);
        const endH = parseInt(avail.end.split(':')[0]);
        if (startH < earliest) earliest = startH;
        if (endH > latest) latest = endH;
      }
    });
    if (earliest < 24) minHour = Math.max(0, earliest - 1);
    if (latest > 0) maxHour = Math.min(23, latest + 1);
  }
  
  if (currentView === Views.MONTH) {
    minHour = 0;
    maxHour = 23;
  }

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
        /* Mejoras de Experiencia en 15 minutos */
        .rbc-time-slot { min-height: 25px; transition: background-color 0.2s; }
        /* Efecto hover sobre el slot vacío (solo para espacios no bloqueados) */
        .rbc-day-slot .slot-available:hover {
          background-color: #ecfdf5 !important;
          border: 1px solid #10b981;
          box-shadow: inset 0 0 0 1px #10b981;
          z-index: 10;
          position: relative;
        }

        /* Tooltip inyectado por React */
        .hover-time-indicator {
          display: none;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #10b981;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
          pointer-events: none;
          z-index: 20;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .slot-available:hover .hover-time-indicator {
          display: block;
        }

        /* Solución a la superposición de capas de react-big-calendar */
        .rbc-events-container {
          pointer-events: none; /* Deja pasar el ratón hacia las celdas de fondo */
        }
        .rbc-event {
          pointer-events: auto; /* Mantiene los eventos cliqueables (para reprogramar/cancelar) */
        }
      `}</style>
      
      <div style={{ minHeight: 'calc(100vh - 80px)', background: '#f8fafc', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header Info */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h4 style={{ color: '#10b981', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '2px', fontWeight: 700 }}>
              {calendar.user?.company || calendar.user?.name || 'Invitación'}
            </h4>
            <h1 style={{ margin: '0 0 1rem 0', fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{calendar.name}</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', color: '#475569', fontSize: '1rem', fontWeight: 500 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}><Clock size={18} color="#10b981" /> Duración: {calendar.duration} min</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>🌍 Zona horaria: {calendar.timezone}</span>
            </div>
            {calendar.description && <p style={{ color: '#64748b', margin: '1.5rem auto 0 auto', maxWidth: '600px', fontSize: '1.1rem', lineHeight: 1.6 }}>{calendar.description}</p>}
          </div>

          {/* Calendario Literal */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', height: '600px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', textAlign: 'center', fontWeight: 600 }}>Selecciona un horario disponible para agendar</h3>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
              Mostrando horarios en tu zona horaria local: <strong style={{ color: '#10b981' }}>{Intl.DateTimeFormat().resolvedOptions().timeZone}</strong>
            </div>
            <BigCalendar
              localizer={localizer}
              events={meetings}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              view={currentView}
                onView={setCurrentView}
                date={currentDate}
                onNavigate={setCurrentDate}
                views={['month', 'week', 'day', 'agenda']}
              step={15}
              timeslots={4}
              min={new Date(0, 0, 0, minHour, 0, 0)}
              max={new Date(0, 0, 0, maxHour, 59, 59)}
              selectable={true}
              slotPropGetter={slotPropGetter}
                components={{ timeSlotWrapper: CustomTimeSlot }}
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
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Confirmar cita</h2>
                <p style={{ margin: 0, color: '#10b981', fontWeight: 500 }}>
                  {bookingModal.start.toLocaleDateString()} | {bookingModal.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  (Hora local: {Intl.DateTimeFormat().resolvedOptions().timeZone})
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Nombre completo {isSecureToken && <Lock size={14} color="#10b981" />}</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input required type="text" value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', background: 'white', cursor: 'text', color: 'inherit' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Correo electrónico {isSecureToken && <Lock size={14} color="#10b981" />}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input required type="email" value={formData.guestEmail} onChange={e => setFormData({...formData, guestEmail: e.target.value})} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', background: 'white', cursor: 'text', color: 'inherit' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Notas adicionales (opcional)</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px' }} />
              </div>
              
              <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '1rem', background: '#10b981', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '1rem' }}>
                {isSubmitting ? 'Agendando...' : 'Confirmar reunión'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Success */}
      {successModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: 'white', padding: '3rem 2rem', borderRadius: '16px', width: '90%', maxWidth: '450px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1.5rem auto' }} />
            <h2 style={{ color: '#0f172a', margin: '0 0 1rem 0' }}>¡Reunión agendada con éxito!</h2>
            <p style={{ color: '#475569', lineHeight: 1.5, marginBottom: '0.5rem' }}>
              Te hemos enviado la invitación al calendario de <strong>{formData.guestEmail}</strong>.
            </p>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              La reunión se agendó en tu zona horaria local ({Intl.DateTimeFormat().resolvedOptions().timeZone}).
            </p>
            
            {successModal.meetLink && (
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Enlace de Google Meet</p>
                <a href={successModal.meetLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', color: '#10b981', fontWeight: 600, wordBreak: 'break-all', textDecoration: 'none', marginBottom: '1rem' }}>
                  {successModal.meetLink}
                </a>
                <div>
                  <button onClick={() => navigator.clipboard.writeText(successModal.meetLink || '')} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', color: '#475569' }}>
                    📋 Copiar enlace
                  </button>
                </div>
              </div>
            )}
            
            <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 3rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
