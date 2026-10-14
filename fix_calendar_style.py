import re

with open("src/pages/portal/admin/AdminCalendars.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

# 1. Update max date to 23:59 so the calendar goes to the end of the day.
ts = ts.replace("max={new Date(0, 0, 0, 22, 0, 0)}", "max={new Date(0, 0, 0, 23, 59, 59)}")
ts = ts.replace("min={new Date(0, 0, 0, 7, 0, 0)}", "min={new Date(0, 0, 0, 6, 0, 0)}")

# 2. Add slotPropGetter function before the return statement
slot_logic = """
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

    if (!isAvailable) {
      return {
        style: {
          backgroundColor: '#f1f5f9', // Color grisáceo para no disponible
          cursor: 'not-allowed'
        }
      };
    }
    
    return {
      style: {
        backgroundColor: '#ffffff', // Blanco para disponible
        cursor: 'pointer'
      }
    };
  };

  return (
"""
ts = ts.replace("  return (\n    <div style={{ display: 'flex'", slot_logic + "    <div style={{ display: 'flex'")

# 3. Add slotPropGetter to DnDCalendar
ts = ts.replace("selectable={true}", "selectable={true}\n                slotPropGetter={slotPropGetter}")

with open("src/pages/portal/admin/AdminCalendars.tsx", "w", encoding="utf-8") as f:
    f.write(ts)
print("Added slotPropGetter")
