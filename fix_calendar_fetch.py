with open("src/pages/portal/admin/AdminCalendars.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

old = """fetch(`http://localhost:3000/api/calendars/public/${activeCalendar?.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName,
          guestEmail,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          notes: 'Agendado manualmente por Admin'
        })
      }).then(() => {
        if(activeCalendar) fetchMeetings(activeCalendar.id);
      }).catch(()=> alert('Error agendando'));"""

new = """fetch(`http://localhost:3000/api/calendars/public/${activeCalendar?.id}/book`, {
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
      }).catch((e)=> alert('Error agendando: ' + e.message));"""

ts = ts.replace(old, new)

with open("src/pages/portal/admin/AdminCalendars.tsx", "w", encoding="utf-8") as f:
    f.write(ts)
print("Updated fetch error handling")
