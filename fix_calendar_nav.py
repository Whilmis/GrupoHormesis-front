files = ["src/pages/portal/public/PublicBooking.tsx", "src/pages/portal/admin/AdminCalendars.tsx"]

for filename in files:
    with open(filename, "r", encoding="utf-8") as f:
        ts = f.read()

    # Add state variables
    if "const [currentView, setCurrentView]" not in ts:
        ts = ts.replace("  const [loading, setLoading] = useState(true);", "  const [loading, setLoading] = useState(true);\n  const [currentView, setCurrentView] = useState<any>(Views.WEEK);\n  const [currentDate, setCurrentDate] = useState<Date>(new Date());")

    # Change minHour/maxHour calculation condition for Month view
    old_min_max = """    if (earliest < 24) minHour = Math.max(0, earliest - 1);
    if (latest > 0) maxHour = Math.min(23, latest + 1);
  }"""
    
    new_min_max = """    if (earliest < 24) minHour = Math.max(0, earliest - 1);
    if (latest > 0) maxHour = Math.min(23, latest + 1);
  }
  
  if (currentView === Views.MONTH) {
    minHour = 0;
    maxHour = 23;
  }"""
    ts = ts.replace(old_min_max, new_min_max)

    # Change BigCalendar props
    old_cal = "defaultView={Views.WEEK}"
    new_cal = "view={currentView}\n                onView={setCurrentView}\n                date={currentDate}\n                onNavigate={setCurrentDate}\n                views={['month', 'week', 'day', 'agenda']}"
    if "onView={setCurrentView}" not in ts:
        ts = ts.replace(old_cal, new_cal)

    with open(filename, "w", encoding="utf-8") as f:
        f.write(ts)

print("Updated state and calendar props")
