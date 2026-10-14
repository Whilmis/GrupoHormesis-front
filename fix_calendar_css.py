import re

with open("src/pages/portal/admin/AdminCalendars.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

# Create modern calendar styles
styles = """
      {/* Estilos modernos inyectados para el calendario */}
      <style>{`
        /* Toolbar */
        .rbc-toolbar {
          margin-bottom: 1.5rem;
        }
        .rbc-toolbar button {
          border: 1px solid #e2e8f0;
          color: #475569;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-weight: 500;
          transition: all 0.2s;
          background: white;
        }
        .rbc-toolbar button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        .rbc-toolbar button.rbc-active {
          background: #10b981;
          color: white;
          border-color: #10b981;
          box-shadow: none;
        }
        .rbc-toolbar button:focus {
          outline: none;
        }
        .rbc-toolbar-label {
          font-weight: 600;
          color: #0f172a;
          font-size: 1.1rem;
        }
        
        /* Headers y Celdas */
        .rbc-header {
          padding: 0.75rem 0;
          font-weight: 600;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
          text-transform: capitalize;
        }
        .rbc-time-header.rbc-overflowing {
          border-right: none;
        }
        .rbc-time-header-content {
          border-left: 1px solid #e2e8f0;
        }
        .rbc-time-view {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          background: white;
        }
        .rbc-timeslot-group {
          border-bottom: 1px solid #e2e8f0;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px dashed #f1f5f9;
        }
        .rbc-time-gutter .rbc-timeslot-group {
          border-bottom: none;
        }
        .rbc-label {
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 500;
          padding: 0 0.5rem;
        }
        
        /* Eventos */
        .rbc-event {
          background-color: #10b981;
          border: none;
          border-radius: 6px;
          padding: 4px 8px;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .rbc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
        }
        .rbc-event-label {
          font-size: 0.75rem;
          font-weight: 600;
          opacity: 0.9;
          margin-bottom: 2px;
        }
        .rbc-event-content {
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        /* Hoy */
        .rbc-day-bg.rbc-today {
          background-color: rgba(16, 185, 129, 0.03);
        }
        
        /* Sombras suaves para scroll */
        .rbc-time-content {
          border-top: 1px solid #e2e8f0;
        }
      `}</style>
"""

# Inject before the first div of return (which is the root container of AdminCalendars layout)
ts = ts.replace("  return (\n    <div style={{ display: 'flex'", "  return (\n    <>\n" + styles + "    <div style={{ display: 'flex'")
# Replace the closing div with fragments
ts = ts.replace("    </div>\n  );\n}", "    </div>\n    </>\n  );\n}")

with open("src/pages/portal/admin/AdminCalendars.tsx", "w", encoding="utf-8") as f:
    f.write(ts)
print("Injected CSS")
