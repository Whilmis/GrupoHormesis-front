filename = "src/pages/portal/admin/AdminCalendars.tsx"
with open(filename, "r", encoding="utf-8") as f:
    ts = f.read()

calc_logic = """  // Dynamic min and max hours based on availability
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

  return (
    <>"""

ts = ts.replace("  return (\n    <>", calc_logic)

old_cal = """              min={new Date(0, 0, 0, 6, 0, 0)}
              max={new Date(0, 0, 0, 23, 59, 59)}"""
              
new_cal = """              min={new Date(0, 0, 0, minHour, 0, 0)}
              max={new Date(0, 0, 0, maxHour, 59, 59)}"""
ts = ts.replace(old_cal, new_cal)

with open(filename, "w", encoding="utf-8") as f:
    f.write(ts)

print("Updated AdminCalendars")
