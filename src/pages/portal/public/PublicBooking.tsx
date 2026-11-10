import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Clock, User, Mail, CheckCircle, AlertCircle, X, Lock, Sparkles, Calendar as CalIcon } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { BASE_URL } from '../../../api/client';

const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Helper to fetch sin auth
const fetchPublic = async (url: string, options?: any) => {
  const res = await fetch(`${BASE_URL}${url}`, {
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

// Hash determinista para generar reuniones ocupadas consistentes por día y calendario
function deterministicHash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// Comprueba si una fecha/hora puntual cae dentro del horario de disponibilidad del calendario
function checkSlotAvailability(date: Date, calendar: any): boolean {
  if (!calendar || !calendar.availability) return false;
  const calendarTimeZone = calendar.timezone || 'Europe/Madrid';

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
  if (!avail) return false;

  const slotTime = thour * 60 + tmin;

  if (typeof avail === 'object' && !Array.isArray(avail)) {
    if (!avail.active) return false;
    const [startHour, startMin] = avail.start.split(':').map(Number);
    const [endHour, endMin] = avail.end.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    return slotTime >= startTime && slotTime < endTime;
  } else if (Array.isArray(avail) && avail.length > 0) {
    const [startStr, endStr] = avail[0].split('-');
    const [startHour, startMin] = startStr.split(':').map(Number);
    const [endHour, endMin] = endStr.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    return slotTime >= startTime && slotTime < endTime;
  }

  return false;
}

// Genera reuniones ficticias ("Ocupado") deterministas para que la agenda nunca se vea vacía
function generateFictionalBusyMeetings(calendar: any, realMeetings: any[]): any[] {
  if (!calendar || !calendar.availability) return [];

  const synthetic: any[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generar desde hace 7 días hasta 60 días en el futuro
  for (let offset = -7; offset <= 60; offset++) {
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() + offset);

    const yyyy = dayDate.getFullYear();
    const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
    const dd = String(dayDate.getDate()).padStart(2, '0');
    const dateKey = `${calendar.id || 'cal'}-${yyyy}-${mm}-${dd}`;

    // Recopilar todos los slots de 15 min disponibles en ese día
    const availableSlotsInDay: Date[] = [];
    for (let h = 7; h <= 20; h++) {
      for (const m of [0, 15, 30, 45]) {
        const slot = new Date(dayDate);
        slot.setHours(h, m, 0, 0);
        if (checkSlotAvailability(slot, calendar)) {
          availableSlotsInDay.push(slot);
        }
      }
    }

    if (availableSlotsInDay.length < 8) continue;

    // Seleccionar entre 3 y 5 bloques ocupados por día de forma determinista
    const daySeed = deterministicHash(dateKey);
    const numBlocks = 3 + (daySeed % 3); // 3, 4 o 5 bloques por día

    // Dividir el día en segmentos para distribuir las reuniones de forma natural (mañana, mediodía, tarde)
    const segmentSize = Math.floor(availableSlotsInDay.length / numBlocks);

    for (let b = 0; b < numBlocks; b++) {
      const subSeed = deterministicHash(`${dateKey}-block-${b}`);
      const segStart = b * segmentSize;
      const maxOffset = Math.max(1, segmentSize - 3);
      const chosenIdx = Math.min(
        availableSlotsInDay.length - 2,
        segStart + (subSeed % maxOffset)
      );

      const startSlot = availableSlotsInDay[chosenIdx];
      if (!startSlot) continue;

      // Duración de 30 o 45 minutos para que se vean como bloques sólidos y reales en la agenda
      const durationMinutes = (subSeed % 2 === 0) ? 30 : 45;
      const endSlot = new Date(startSlot.getTime() + durationMinutes * 60000);

      // Verificar que el final también cae en horario laboral
      const lastCheck = new Date(endSlot.getTime() - 15 * 60000);
      if (!checkSlotAvailability(lastCheck, calendar)) continue;

      // Evitar chocar con reuniones reales
      const overlapsReal = realMeetings.some(
        rm => startSlot < rm.end && endSlot > rm.start
      );
      // Evitar solaparse con otro bloque sintético
      const overlapsSynthetic = synthetic.some(
        sm => startSlot < sm.end && endSlot > sm.start
      );

      if (!overlapsReal && !overlapsSynthetic) {
        synthetic.push({
          id: `busy-${yyyy}${mm}${dd}-${b}`,
          title: 'Ocupado',
          start: startSlot,
          end: endSlot,
          isSynthetic: true
        });
      }
    }
  }

  return synthetic;
}

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
  const refLeadId = searchParams.get('ref') || searchParams.get('leadId') || '';
  let urlGuestName = searchParams.get('guestName') || '';
  let urlGuestEmail = searchParams.get('guestEmail') || '';
  let urlLeadId = refLeadId;
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
  }
  
  const [calendar, setCalendar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<any>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? Views.DAY : Views.WEEK
  );
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const [realMeetings, setRealMeetings] = useState<any[]>([]);
  
  // Modal de Agendamiento
  const [bookingModal, setBookingModal] = useState<{isOpen: boolean, start: Date, end: Date} | null>(null);
  const [successModal, setSuccessModal] = useState<{isOpen: boolean, meetLink?: string}>({isOpen: false});
  
  const [formData, setFormData] = useState({
    guestName: urlGuestName || '',
    guestEmail: urlGuestEmail || '',
    notes: '',
    leadId: urlLeadId || ''
  });
  const [serverError, setServerError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del Lead si viene con ?ref=:leadId (URL limpia sin JWT largo)
  useEffect(() => {
    if (urlLeadId && (!urlGuestName || !urlGuestEmail)) {
      fetchPublic(`/leads/public/${urlLeadId}/summary`)
        .then(leadData => {
          if (leadData) {
            setFormData(prev => ({
              ...prev,
              guestName: prev.guestName || leadData.businessName || leadData.contactName || '',
              guestEmail: prev.guestEmail || leadData.email || '',
              leadId: urlLeadId
            }));
          }
        })
        .catch(() => {});
    }
  }, [urlLeadId, urlGuestName, urlGuestEmail]);

  useEffect(() => {
    fetchPublic(`/calendars/public/${id}`)
      .then(data => {
        setCalendar(data);
        return fetchPublic(`/calendars/public/${id}/meetings`);
      })
      .then(data => {
        const formatted = (data || []).map((m: any) => ({
          id: m.id,
          title: "Ocupado",
          start: new Date(m.startTime),
          end: new Date(m.endTime),
          isSynthetic: false
        }));
        setRealMeetings(formatted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Combinar reuniones reales con bloques ocupados deterministas
  const allMeetings = useMemo(() => {
    if (!calendar) return realMeetings;
    const fictional = generateFictionalBusyMeetings(calendar, realMeetings);
    return [...realMeetings, ...fictional];
  }, [calendar, realMeetings]);

  const isRangeOccupied = (start: Date, end: Date) => {
    return allMeetings.some(m => start < m.end && end > m.start);
  };

  // Calcular horarios rápidos disponibles para el día seleccionado
  const quickSlotsForSelectedDay = useMemo(() => {
    if (!calendar) return [];
    const durationMin = calendar.duration || 15;
    const slots: Date[] = [];
    const now = new Date();
    const baseDay = new Date(currentDate);
    baseDay.setHours(0, 0, 0, 0);

    // Si el día seleccionado es hoy o pasado y ya no quedan huecos, buscar el próximo día hábil
    for (let h = 8; h <= 20; h++) {
      for (const m of [0, 30]) {
        const slotStart = new Date(baseDay);
        slotStart.setHours(h, m, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + durationMin * 60000);
        if (slotStart <= now) continue;
        if (checkSlotAvailability(slotStart, calendar) && !isRangeOccupied(slotStart, slotEnd)) {
          slots.push(slotStart);
        }
      }
    }
    return slots.slice(0, 8);
  }, [calendar, currentDate, allMeetings]);

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    const now = new Date();
    if (start < now) {
      return;
    }

    if (!checkSlotAvailability(start, calendar)) {
      return;
    }

    const durationMin = calendar?.duration || 15;
    const calculatedEnd = new Date(start.getTime() + durationMin * 60000);

    if (isRangeOccupied(start, calculatedEnd)) {
      return;
    }

    setServerError('');
    setFormData(prev => ({
      guestName: prev.guestName || urlGuestName || '',
      guestEmail: prev.guestEmail || urlGuestEmail || '',
      notes: prev.notes || '',
      leadId: prev.leadId || urlLeadId || ''
    }));
    setBookingModal({ isOpen: true, start, end: calculatedEnd });
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
        endTime: bookingModal.end.toISOString(),
        guestTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      if (formData.leadId) payload.leadId = formData.leadId;
      
      const response = await fetchPublic(`/calendars/public/${id}/book`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setBookingModal(null);
      setSuccessModal({
        isOpen: true,
        meetLink: response.meetLink || response.meeting?.meetLink || response.data?.meetLink
      });
    } catch (error: any) {
      if (error.status === 409) {
        setServerError('Este espacio acaba de ser reservado. Por favor, selecciona otro horario.');
      } else {
        setServerError(error.message || 'Hubo un error agendando tu cita.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const slotPropGetter = (date: Date) => {
    if (!calendar || !calendar.availability) return {};
    
    const isAvailable = checkSlotAvailability(date, calendar);
    const slotEnd = new Date(date.getTime() + 15 * 60000);
    const isBusy = isRangeOccupied(date, slotEnd);

    const now = new Date();
    if (date < now) { 
      return {
        className: 'slot-past',
        style: {
          backgroundColor: '#e2e8f0',
          cursor: 'not-allowed',
          opacity: 0.6,
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)'
        }
      }; 
    }
    if (!isAvailable || isBusy) {
      return {
        className: 'slot-blocked',
        style: { backgroundColor: '#f1f5f9', cursor: 'not-allowed' }
      };
    }
    return {
      className: 'slot-available',
      style: { backgroundColor: '#ffffff', cursor: 'pointer' }
    };
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#475569' }}>Cargando agenda disponible...</div>;
  if (!calendar) return <div style={{ padding: '4rem', textAlign: 'center', color: '#475569' }}>Calendario no encontrado</div>;

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
        .rbc-toolbar { flex-wrap: wrap; gap: 0.5rem; }
        .rbc-toolbar button { border: 1px solid #e2e8f0; color: #475569; border-radius: 8px; padding: 0.5rem 1rem; font-weight: 500; background: white; cursor: pointer; }
        .rbc-toolbar button:hover { background: #f8fafc; }
        .rbc-toolbar button.rbc-active { background: #10b981; color: white; border-color: #10b981; }
        .rbc-header { padding: 0.75rem 0; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; text-transform: capitalize; }
        .rbc-time-view { border: 1px solid #e2e8f0; border-radius: 12px; background: white; overflow: hidden; }
        .rbc-event { background-color: #64748b !important; border: 1px solid #475569 !important; border-radius: 6px; pointer-events: none; opacity: 0.9; font-size: 0.78rem; font-weight: 600; }
        .rbc-today { background-color: rgba(16, 185, 129, 0.04); }
        .rbc-time-slot { min-height: 25px; transition: background-color 0.2s; }
        .rbc-day-slot .slot-available:hover {
          background-color: #ecfdf5 !important;
          border: 1px solid #10b981;
          box-shadow: inset 0 0 0 1px #10b981;
          z-index: 10;
          position: relative;
        }
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
          font-size: 0.78rem;
          font-weight: bold;
          pointer-events: none;
          z-index: 20;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .slot-available:hover .hover-time-indicator {
          display: block;
        }
        .rbc-events-container {
          pointer-events: none;
        }
        .quick-slot-btn {
          padding: 0.5rem 0.9rem;
          border-radius: 9999px;
          border: 1px solid #10b981;
          background: #ecfdf5;
          color: #065f46;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.15s;
        }
        .quick-slot-btn:hover {
          background: #10b981;
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }
      `}</style>
      
      <div style={{ minHeight: 'calc(100vh - 80px)', background: '#f8fafc', padding: '2.5rem 1.25rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header Info */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              padding: '5px 14px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '0.75rem'
            }}>
              <Sparkles size={14} /> {calendar.user?.company || calendar.user?.name || 'Grupo Hormesis'} · Agenda en Tiempo Real
            </div>
            <h1 style={{ margin: '0 0 0.75rem 0', fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {calendar.name}
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem', color: '#475569', fontSize: '0.95rem', fontWeight: 500 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.45rem 1rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <Clock size={16} color="#10b981" /> Duración: {calendar.duration} min
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.45rem 1rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                🌍 Zona horaria: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </span>
            </div>
            {calendar.description && (
              <p style={{ color: '#64748b', margin: '1rem auto 0 auto', maxWidth: '620px', fontSize: '1rem', lineHeight: 1.5 }}>
                {calendar.description}
              </p>
            )}
          </div>

          {/* Selección rápida en 1 clic (Ideal para móvil y escritorio) */}
          {quickSlotsForSelectedDay.length > 0 && (
            <div style={{
              background: 'white',
              padding: '1.25rem 1.5rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.25rem',
              boxShadow: '0 4px 15px -5px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalIcon size={16} color="#10b981" /> Horarios libres sugeridos para el {currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}:
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Haz clic en un botón o directamente en los espacios blancos del calendario
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {quickSlotsForSelectedDay.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="quick-slot-btn"
                    onClick={() => handleSelectSlot({ start: slot, end: new Date(slot.getTime() + (calendar.duration || 15) * 60000) })}
                  >
                    {slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Calendario Completo */}
          <div style={{ background: 'white', padding: '1.75rem', borderRadius: '20px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', height: '640px', display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', textAlign: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
              Selecciona un espacio libre (en blanco) para agendar tu sesión
            </h3>
            <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
              Los bloques grises (<strong style={{ color: '#475569' }}>Ocupado</strong>) ya están reservados por otros clientes.
            </div>
            <BigCalendar
              localizer={localizer}
              events={allMeetings}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              view={currentView}
              onView={setCurrentView}
              date={currentDate}
              onNavigate={setCurrentDate}
              views={['month', 'week', 'day']}
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

      {/* Modal Formulario Público */}
      {bookingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '2.25rem', borderRadius: '16px', width: '92%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>Confirmar reunión</h2>
                <p style={{ margin: 0, color: '#10b981', fontWeight: 700, fontSize: '0.95rem' }}>
                  {bookingModal.start.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} · {bookingModal.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {bookingModal.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
                <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                  Zona horaria: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </p>
              </div>
              <button onClick={() => setBookingModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </div>
            
            {serverError && (
              <div style={{ background: '#fee2e2', color: '#ef4444', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                <AlertCircle size={18} /> {serverError}
              </div>
            )}

            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', marginBottom: '0.4rem', fontWeight: 600, color: '#475569' }}>
                  Nombre o Empresa {(isSecureToken || Boolean(urlLeadId)) && <Lock size={13} color="#10b981" />}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input required type="text" placeholder="Tu nombre o empresa" value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: 'white', color: '#0f172a' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', marginBottom: '0.4rem', fontWeight: 600, color: '#475569' }}>
                  Correo electrónico para enviar el enlace de Google Meet {(isSecureToken || Boolean(urlLeadId)) && <Lock size={13} color="#10b981" />}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input required type="email" placeholder="tu@empresa.com" value={formData.guestEmail} onChange={e => setFormData({...formData, guestEmail: e.target.value})} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: 'white', color: '#0f172a' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', marginBottom: '0.4rem', fontWeight: 600, color: '#475569' }}>
                  ¿Qué te gustaría priorizar en la llamada? (opcional)
                </label>
                <textarea placeholder="Ej. Revisar la propuesta web, automatización de reservas..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '72px', fontSize: '0.9rem' }} />
              </div>
              
              <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '0.95rem', background: '#10b981', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '1rem', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}>
                {isSubmitting ? 'Generando sala de Google Meet...' : 'Confirmar reunión de 15 min'}
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
              Te hemos enviado la invitación de calendario a <strong>{formData.guestEmail}</strong>.
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
