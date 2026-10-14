import re

for filename in ["src/pages/portal/admin/AdminCalendars.tsx", "src/pages/portal/public/PublicBooking.tsx"]:
    with open(filename, "r", encoding="utf-8") as f:
        ts = f.read()

    # Re-write CustomTimeSlot completely
    old_comp = r"const CustomTimeSlot = \(\{ value, children \}: any\) => \{[\s\S]*?\}\;"
    new_comp = """const CustomTimeSlot = ({ value, children }: any) => {
  const child = React.Children.only(children);
  const timeStr = value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return React.cloneElement(child, {
    children: (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {child.props.children}
        <div className="hover-time-indicator">{timeStr}</div>
      </div>
    )
  });
};"""
    ts = re.sub(old_comp, new_comp, ts)

    # Re-write the CSS
    css_old = r"\/\* Tooltip de tiempo en hover \*\/[\s\S]*?\}"
    css_new = """/* Tooltip inyectado por React */
        .hover-time-indicator {
          display: none;
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
        .slot-available:hover .hover-time-indicator {
          display: block;
        }"""
    ts = re.sub(css_old, css_new, ts)

    with open(filename, "w", encoding="utf-8") as f:
        f.write(ts)

print("Updated CustomTimeSlot to use React elements instead of CSS pseudo-elements")
