filename = "src/pages/portal/public/PublicBooking.tsx"
with open(filename, "r", encoding="utf-8") as f:
    ts = f.read()

old_getter = """  const slotPropGetter = (date: Date) => {
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

    const now = new Date();
    if (date < now) { 
      return { className: 'slot-past', style: { backgroundColor: '#e2e8f0', cursor: 'not-allowed', opacity: 0.6, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)' } }; 
    }
    if (!isAvailable) { return { className: 'slot-blocked', style: { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } }; }
    return { className: 'slot-available', style: { backgroundColor: '#ffffff', cursor: 'pointer' } };
  };"""

new_getter = """  const slotPropGetter = (date: Date) => {
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
  };"""

ts = ts.replace(old_getter, new_getter)
with open(filename, "w", encoding="utf-8") as f:
    f.write(ts)

print("Updated PublicBooking logic")
