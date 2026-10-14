import re

with open("src/pages/portal/admin/AdminCalendars.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

# Update step to 15
ts = ts.replace("defaultView={Views.WEEK}", "defaultView={Views.WEEK}\n                step={15}\n                timeslots={4}")

with open("src/pages/portal/admin/AdminCalendars.tsx", "w", encoding="utf-8") as f:
    f.write(ts)
print("Updated step to 15")
