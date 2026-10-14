import re

for filename in ["src/pages/portal/admin/AdminCalendars.tsx", "src/pages/portal/public/PublicBooking.tsx"]:
    with open(filename, "r", encoding="utf-8") as f:
        ts = f.read()

    css_inject = """        /* Mejoras de Experiencia en 15 minutos */
        .rbc-time-slot {
          min-height: 35px; /* Hace más altos los bloques de 15 min */
          transition: background-color 0.2s;
        }
        /* Efecto hover sobre el slot vacío (solo para espacios no bloqueados) */
        .rbc-day-slot .rbc-time-slot:not([style*="not-allowed"]):hover {
          background-color: #ecfdf5 !important;
          border: 1px solid #10b981;
          box-shadow: inset 0 0 0 1px #10b981;
          z-index: 10;
          position: relative;
        }
"""
    # Find </style> and inject right before it
    if css_inject not in ts:
        ts = ts.replace("      `}</style>", css_inject + "      `}</style>")

    with open(filename, "w", encoding="utf-8") as f:
        f.write(ts)
print("Updated CSS for taller slots and hover effect")
