import re

with open("src/pages/portal/admin/AdminCalendars.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

# Add custom timezones
injection = """import TimezoneSelect, { allTimezones } from 'react-timezone-select';

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
};"""

ts = ts.replace("import TimezoneSelect from 'react-timezone-select';", injection)

# Update component to use customTimezones
ts = ts.replace("<TimezoneSelect", "<TimezoneSelect\n                    timezones={customTimezones}")

with open("src/pages/portal/admin/AdminCalendars.tsx", "w", encoding="utf-8") as f:
    f.write(ts)
print("Updated TimezoneSelect with custom countries")
