with open("src/pages/portal/admin/AdminCalendars.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

# Add min and max to DnDCalendar
replacement = """              <DnDCalendar
                localizer={localizer}
                events={meetings}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                defaultView={Views.WEEK}
                min={new Date(0, 0, 0, 7, 0, 0)}
                max={new Date(0, 0, 0, 22, 0, 0)}
                selectable={true}"""

ts = ts.replace("""              <DnDCalendar
                localizer={localizer}
                events={meetings}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                defaultView={Views.WEEK}
                selectable={true}""", replacement)

with open("src/pages/portal/admin/AdminCalendars.tsx", "w", encoding="utf-8") as f:
    f.write(ts)
print("Updated BigCalendar with min and max times")
