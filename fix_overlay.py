import re

for filename in ["src/pages/portal/admin/AdminCalendars.tsx", "src/pages/portal/public/PublicBooking.tsx"]:
    with open(filename, "r", encoding="utf-8") as f:
        ts = f.read()

    css_inject = """
        /* Solución a la superposición de capas de react-big-calendar */
        .rbc-events-container {
          pointer-events: none; /* Deja pasar el ratón hacia las celdas de fondo */
        }
        .rbc-event {
          pointer-events: auto; /* Mantiene los eventos cliqueables (para reprogramar/cancelar) */
        }
"""
    if "pointer-events: none; /* Deja pasar el ratón hacia las celdas de fondo */" not in ts:
        ts = ts.replace("      `}</style>", css_inject + "      `}</style>")

    with open(filename, "w", encoding="utf-8") as f:
        f.write(ts)

print("Fixed overlay pointer-events")
