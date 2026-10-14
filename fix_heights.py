files = ["src/pages/portal/public/PublicBooking.tsx", "src/pages/portal/admin/AdminCalendars.tsx"]

for filename in files:
    with open(filename, "r", encoding="utf-8") as f:
        ts = f.read()

    ts = ts.replace(".rbc-time-slot {\n          min-height: 20px; /* Hace más altos los bloques de 15 min */\n          transition: background-color 0.2s;\n        }", ".rbc-time-slot { transition: background-color 0.2s; }")

    with open(filename, "w", encoding="utf-8") as f:
        f.write(ts)

print("Removed min-height entirely")
