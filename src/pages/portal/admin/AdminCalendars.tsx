import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient, BASE_URL } from '../../../api/client';
import { Calendar as CalendarIcon, Clock, Link, Trash2, Plus, X, Settings as SettingsIcon, AlertCircle, Mail, User } from 'lucide-react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import TimezoneSelect, { allTimezones } from 'react-timezone-select';

// Expandir etiquetas para facilitar búsqueda por país
const customTimezones = {
  ...allTimezones,
  'America/Santo_Domingo': 'Santo Domingo (República Dominicana)',
  'Europe/Madrid': 'Madrid (España)',
  'America/Bogota': 'Bogotá (Colombia)',
  'America/Mexico_City': 'Ciudad de México (México)',
  'America/Caracas': 'Caracas (Venezuela)',
  'America/Lima': 'Lima (Perú)',
  'America/Santiago': 'Santiago (Chile)',
  'America/Argentina/Buenos_Aires': 'Buenos Aires (Argentina)'
};

const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const DnDCalendar = withDragAndDrop(BigCalendar);

interface Calendar {
  id: string;
  name: string;
  description: string | null;
  timezone: string;
  availability: any;
  duration: number;
  bufferTime?: number;
}

const DAYS = [
  { id: 'monday', label: 'Lunes' },
  { id: 'tuesday', label: 'Martes' },
  { id: 'wednesday', label: 'Miércoles' },
  { id: 'thursday', label: 'Jueves' },
  { id: 'friday', label: 'Viernes' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' }
];


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

export default function AdminCalendars() {
  const { t } = useTranslation();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<any>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState<Calendar | null>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);

  // Estados para Modales Custom
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);
  const [promptModal, setPromptModal] = useState<{isOpen: boolean, start: Date, end: Date} | null>(null);
  const [successModal, setSuccessModal] = useState<{isOpen: boolean, meetLink?: string}>({isOpen: false});
  const [promptData, setPromptData] = useState({ name: '', email: '' });


  // Formulario Avanzado
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    duration: 15,
    bufferTime: 5,
    availability: {
      monday: { active: true, start: "09:00", end: "17:00" },
      tuesday: { active: true, start: "09:00", end: "17:00" },
      wednesday: { active: true, start: "09:00", end: "17:00" },
      thursday: { active: true, start: "09:00", end: "17:00" },
      friday: { active: true, start: "09:00", end: "17:00" },
      saturday: { active: false, start: "09:00", end: "13:00" },
      sunday: { active: false, start: "09:00", end: "13:00" }
    }
  });

  useEffect(() => {
    fetchCalendars();
  }, []);

  useEffect(() => {
    if (calendars.length > 0 && !activeCalendar) {
      openCalendarView(calendars[0]);
    }
  }, [calendars]);

  const fetchCalendars = async () => {
    try {
      const data = await apiClient('/calendars');
      setCalendars(data);
    } catch (error) {
      console.error('Error fetching calendars', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async (calendarId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/calendars/public/${calendarId}/meetings`);
      const data = await res.json();
      const formatted = data.map((m: any) => ({
        id: m.id,
        title: `${m.guestName} (${m.guestEmail})`,
        start: new Date(m.startTime),
        end: new Date(m.endTime),
        desc: m.notes,
        raw: m
      }));
      setMeetings(formatted);
    } catch (error) {
      console.error('Error fetching meetings', error);
    }
  };

  const openCalendarView = (cal: Calendar) => {
    setActiveCalendar(cal);
    fetchMeetings(cal.id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient('/calendars', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      fetchCalendars();
    } catch (error) {
      alert('Error guardando calendario');
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
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
  };

  const handleDeleteMeeting = (meetingId: string) => {
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
  };

  const copyLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/book/${id}`;
    navigator.clipboard.writeText(url);
    alert('Enlace copiado al portapapeles: ' + url);
  };

  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    if (start < new Date()) {
      alert("No puedes agendar en el pasado.");
      return;
    }
    setPromptData({ name: '', email: '' });
    setPromptModal({ isOpen: true, start, end });
  };

  const handleManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptModal || !promptData.name || !promptData.email) return;
    
    try {
      const res = await fetch(`${BASE_URL}/calendars/public/${activeCalendar?.id}/book`, {
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
      
      const data = await res.json().catch(()=>({}));
      
      if(!res.ok) {
        throw new Error(data.error || 'Error desconocido al agendar');
      }
      
      if(activeCalendar) fetchMeetings(activeCalendar.id);
      setPromptModal(null);
      setSuccessModal({isOpen: true, meetLink: data.meetLink || data.meeting?.meetLink});
    } catch (e: any) {
      alert('Error agendando: ' + e.message);
    }
  };

  const handleEventDrop = useCallback(async ({ event, start, end }: any) => {
    // Al soltar el evento en otro horario, enviamos al backend (necesitaremos PUT /api/meetings/:id)
    try {
      await apiClient(`/meetings/${event.id}`, {
        method: 'PUT',
        body: JSON.stringify({ startTime: start.toISOString(), endTime: end.toISOString() })
      });
      if(activeCalendar) fetchMeetings(activeCalendar.id);
    } catch (e) {
      alert('No se pudo reprogramar la reunión.');
    }
  }, [activeCalendar]);


  const slotPropGetter = (date: Date) => {
    if (!activeCalendar || !activeCalendar.availability) return {};
    
    // Determine day of week string
    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayStr = daysMap[date.getDay()];
    const avail = activeCalendar.availability[dayStr];
    
    let isAvailable = false;
    
    // Soporte para nuevo formato de objeto: { active: true, start: "09:00", end: "17:00" }
    if (avail && typeof avail === 'object' && !Array.isArray(avail)) {
      if (avail.active) {
        const [startHour, startMin] = avail.start.split(':').map(Number);
        const [endHour, endMin] = avail.end.split(':').map(Number);
        const slotHour = date.getHours();
        const slotMin = date.getMinutes();
        const slotTime = slotHour * 60 + slotMin;
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;
        
        if (slotTime >= startTime && slotTime < endTime) {
          isAvailable = true;
        }
      }
    } 
    // Soporte para formato antiguo array: ["09:00-17:00"]
    else if (Array.isArray(avail) && avail.length > 0) {
       const [startStr, endStr] = avail[0].split('-');
       const [startHour, startMin] = startStr.split(':').map(Number);
       const [endHour, endMin] = endStr.split(':').map(Number);
       const slotHour = date.getHours();
       const slotMin = date.getMinutes();
       const slotTime = slotHour * 60 + slotMin;
       const startTime = startHour * 60 + startMin;
       const endTime = endHour * 60 + endMin;
       if (slotTime >= startTime && slotTime < endTime) {
         isAvailable = true;
       }
    }

    const now = new Date();
    if (date < now) { 
      return { className: 'slot-past', style: { backgroundColor: '#e2e8f0', cursor: 'not-allowed', opacity: 0.6, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)' } }; 
    }

    if (!isAvailable) { return { className: 'slot-blocked', style: { backgroundColor: '#f1f5f9', // Color grisáceo para no disponible
          cursor: 'not-allowed'
        } }; }
    
    return { className: 'slot-available', style: { backgroundColor: '#ffffff', // Blanco para disponible
        cursor: 'pointer'
      } };
  };

  // Dynamic min and max hours based on availability
  let minHour = 8;
  let maxHour = 18;
  if (activeCalendar?.availability) {
    let earliest = 24;
    let latest = 0;
    Object.values(activeCalendar.availability).forEach((avail: any) => {
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

      {/* Estilos modernos inyectados para el calendario */}
      <style>{`
        /* Toolbar */
        .rbc-toolbar {
          margin-bottom: 1.5rem;
        }
        .rbc-toolbar button {
          border: 1px solid #e2e8f0;
          color: #475569;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-weight: 500;
          transition: all 0.2s;
          background: white;
        }
        .rbc-toolbar button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        .rbc-toolbar button.rbc-active {
          background: #10b981;
          color: white;
          border-color: #10b981;
          box-shadow: none;
        }
        .rbc-toolbar button:focus {
          outline: none;
        }
        .rbc-toolbar-label {
          font-weight: 600;
          color: #0f172a;
          font-size: 1.1rem;
        }
        
        /* Headers y Celdas */
        .rbc-header {
          padding: 0.75rem 0;
          font-weight: 600;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
          text-transform: capitalize;
        }
        .rbc-time-header.rbc-overflowing {
          border-right: none;
        }
        .rbc-time-header-content {
          border-left: 1px solid #e2e8f0;
        }
        .rbc-time-view {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          background: white;
        }
        .rbc-timeslot-group {
          border-bottom: 1px solid #e2e8f0;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px dashed #f1f5f9;
        }
        .rbc-time-gutter .rbc-timeslot-group {
          border-bottom: none;
        }
        .rbc-label {
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 500;
          padding: 0 0.5rem;
        }
        
        /* Eventos */
        .rbc-event {
          background-color: #10b981;
          border: none;
          border-radius: 6px;
          padding: 4px 8px;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .rbc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
        }
        .rbc-event-label {
          font-size: 0.75rem;
          font-weight: 600;
          opacity: 0.9;
          margin-bottom: 2px;
        }
        .rbc-event-content {
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        /* Hoy */
        .rbc-day-bg.rbc-today {
          background-color: rgba(16, 185, 129, 0.03);
        }
        
        /* Sombras suaves para scroll */
        .rbc-time-content {
          border-top: 1px solid #e2e8f0;
        }
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
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
      {/* Sidebar de Calendarios */}
      <div style={{ width: '320px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: '#0f172a' }}>
            <CalendarIcon size={20} color="#10b981" /> Mis calendarios
          </h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ width: '100%', background: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
          >
            <Plus size={18} /> Nuevo calendario
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
                    <Link size={14} /> Copiar enlace público
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Calendar Area */}
      <div style={{ flex: 1, background: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {activeCalendar ? (
          <>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ margin: 0, color: '#0f172a' }}>{activeCalendar.name}</h1>
                <p style={{ margin: 0, color: '#64748b' }}>Arrastra sobre un horario para agendar o mueve una reunión para reprogramarla.</p>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <DnDCalendar
                localizer={localizer}
                events={meetings}
                startAccessor={(event: any) => event.start}
                endAccessor={(event: any) => event.end}
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
                onSelectEvent={(event) => setSelectedMeeting(event)}
                onEventDrop={handleEventDrop}
                resizable={false}
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

      {/* Modal Creador de Calendarios (Avanzado) */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Configurar calendario</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>Nombre público</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>Zona horaria / país</label>
                  <TimezoneSelect
                    timezones={customTimezones}
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
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>Descripción</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>Duración (minutos)</label>
                  <input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>Buffer (minutos de descanso)</label>
                  <input type="number" value={formData.bufferTime} onChange={e => setFormData({...formData, bufferTime: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '1rem', marginBottom: '1rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Disponibilidad semanal</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {DAYS.map(day => (
                    <div key={day.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <label style={{ width: '100px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={(formData.availability as any)[day.id].active}
                          onChange={(e) => setFormData({...formData, availability: {...formData.availability, [day.id]: {...(formData.availability as any)[day.id], active: e.target.checked}}})}
                        />
                        {day.label}
                      </label>
                      
                      {(formData.availability as any)[day.id].active ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="time" 
                            value={(formData.availability as any)[day.id].start}
                            onChange={(e) => setFormData({...formData, availability: {...formData.availability, [day.id]: {...(formData.availability as any)[day.id], start: e.target.value}}})}
                            style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                          <span>a</span>
                          <input 
                            type="time" 
                            value={(formData.availability as any)[day.id].end}
                            onChange={(e) => setFormData({...formData, availability: {...formData.availability, [day.id]: {...(formData.availability as any)[day.id], end: e.target.value}}})}
                            style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No disponible</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <button type="submit" style={{ background: '#10b981', color: 'white', padding: '1rem', borderRadius: '6px', border: 'none', marginTop: '1rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                Guardar configuración
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalles de Reunión */}
      {selectedMeeting && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Detalles de la reunión</h2>
              <button onClick={() => setSelectedMeeting(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
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
              
              {selectedMeeting.raw?.meetLink && (
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
            </div>

            <button 
              onClick={() => handleDeleteMeeting(selectedMeeting.id)}
              style={{ width: '100%', background: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fca5a5', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancelar reunión
            </button>
          </div>
        </div>
      )}

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
                Sí, confirmar
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
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Agendar reunión manual</h2>
                <p style={{ margin: 0, color: '#10b981', fontWeight: 500, fontSize: '0.9rem' }}>
                  {promptModal.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {promptModal.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <button onClick={() => setPromptModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleManualBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Nombre del invitado</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input required type="text" value={promptData.name} onChange={e => setPromptData({...promptData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} placeholder="Ej. Juan Pérez" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Correo electrónico</label>
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
                  Agendar cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
