import re

for filename in ["src/pages/portal/admin/AdminCalendars.tsx", "src/pages/portal/public/PublicBooking.tsx"]:
    with open(filename, "r", encoding="utf-8") as f:
        ts = f.read()

    # 1. Add CustomTimeSlot component definition at the top, after imports
    custom_comp = """
const CustomTimeSlot = ({ value, children }: any) => {
  // Clona el elemento hijo (.rbc-time-slot) y le añade un atributo data-time
  return React.cloneElement(React.Children.only(children), {
    'data-time': value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
};
"""
    # Insert it before export default function
    if "const CustomTimeSlot" not in ts:
        ts = ts.replace("export default function", custom_comp + "\nexport default function")

    # 2. Add the components prop to BigCalendar / DnDCalendar
    prop = "components={{ timeSlotWrapper: CustomTimeSlot }}"
    if "components={{" not in ts:
        ts = ts.replace("slotPropGetter={slotPropGetter}", "slotPropGetter={slotPropGetter}\n                " + prop)
    else:
        # if it already has components, we might need to be careful, but currently it only has messages and localizer
        pass
        
    # 3. Add CSS for the tooltip
    css_tooltip = """
        /* Tooltip de tiempo en hover */
        .rbc-day-slot .rbc-time-slot[data-time]:not([style*="not-allowed"]):hover::after {
          content: attr(data-time);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #10b981;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
          pointer-events: none;
          z-index: 20;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
"""
    if "content: attr(data-time);" not in ts:
        ts = ts.replace("      `}</style>", css_tooltip + "      `}</style>")
        
    # We need to make sure React is imported since we use React.cloneElement
    if "import React" not in ts:
        ts = ts.replace("import { useState", "import React, { useState")

    with open(filename, "w", encoding="utf-8") as f:
        f.write(ts)

print("Added time tooltip on hover")
