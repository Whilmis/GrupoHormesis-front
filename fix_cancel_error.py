import re

with open("src/pages/portal/admin/AdminCalendars.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

old = """    } catch (error) {
      alert('Error cancelando reunión');
    }"""
new = """    } catch (error: any) {
      alert('Error cancelando reunión: ' + (error.message || 'Desconocido'));
    }"""

ts = ts.replace(old, new)

with open("src/pages/portal/admin/AdminCalendars.tsx", "w", encoding="utf-8") as f:
    f.write(ts)
print("Updated cancel error handling")
