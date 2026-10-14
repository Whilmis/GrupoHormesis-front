import re

for filename in ["src/pages/portal/admin/AdminCalendars.tsx", "src/pages/portal/public/PublicBooking.tsx"]:
    with open(filename, "r", encoding="utf-8") as f:
        ts = f.read()

    # Replace the returns in slotPropGetter
    old_return_not_avail = """    if (!isAvailable) {
      return {
        style: {
          backgroundColor: '#f1f5f9', // Color grisáceo para no disponible
          cursor: 'not-allowed'
        }
      };
    }"""
    
    new_return_not_avail = """    if (!isAvailable) {
      return {
        className: 'slot-blocked',
        style: {
          backgroundColor: '#f1f5f9',
          cursor: 'not-allowed'
        }
      };
    }"""
    
    old_return_avail = """    return {
      style: {
        backgroundColor: '#ffffff', // Blanco para disponible
        cursor: 'pointer'
      }
    };"""
    
    new_return_avail = """    return {
      className: 'slot-available',
      style: {
        backgroundColor: '#ffffff',
        cursor: 'pointer'
      }
    };"""
    
    # PublicBooking has a slightly different getter, let's just use regex or replace specifically
    
    # Let's write a generic python replacement for the returns
    ts = re.sub(r'if \(!isAvailable\) \{\s*return \{\s*style: \{\s*backgroundColor: \'#f1f5f9\',([^\}]*)\}\s*\};\s*\}', 
                r"if (!isAvailable) { return { className: 'slot-blocked', style: { backgroundColor: '#f1f5f9',\1} }; }", ts)
    
    ts = re.sub(r'return \{\s*style: \{\s*backgroundColor: \'#ffffff\',([^\}]*)\}\s*\};',
                r"return { className: 'slot-available', style: { backgroundColor: '#ffffff',\1} };", ts)
                

    # Now fix the CSS selector
    ts = ts.replace('.rbc-day-slot .rbc-time-slot[data-time]:not([style*="not-allowed"]):hover::after', '.rbc-day-slot .slot-available:hover::after')

    # Fix the hover effect class as well
    ts = ts.replace('.rbc-day-slot .rbc-time-slot:not([style*="not-allowed"]):hover', '.rbc-day-slot .slot-available:hover')

    with open(filename, "w", encoding="utf-8") as f:
        f.write(ts)

print("Updated slotPropGetter and CSS")
