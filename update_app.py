import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

imports = """import AdminWorkflows from './pages/portal/admin/AdminWorkflows';
import AdminCalendars from './pages/portal/admin/AdminCalendars';
import PublicBooking from './pages/portal/public/PublicBooking';
"""
ts = ts.replace("import AdminWorkflows from './pages/portal/admin/AdminWorkflows';", imports)

routes = """              <Route path="workflows" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminWorkflows />
                </ProtectedRoute>
              } />
              <Route path="calendars" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCalendars />
                </ProtectedRoute>
              } />"""
ts = ts.replace("""              <Route path="workflows" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminWorkflows />
                </ProtectedRoute>
              } />""", routes)

public_route = """        <Route path="/book/:id" element={<PublicBooking />} />
        <Route path="/portal" element={"""
ts = ts.replace("        <Route path=\"/portal\" element={", public_route)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(ts)

print("App.tsx updated")
