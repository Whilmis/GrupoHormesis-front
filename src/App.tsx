import { Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import Soluciones from './pages/soluciones/Soluciones';
import Workflows from './pages/soluciones/Workflows';
import Desarrollo from './pages/soluciones/Desarrollo';
import Ecosistema from './pages/soluciones/Ecosistema';
import Ia from './pages/soluciones/Ia';
import Nosotros from './pages/nosotros/Nosotros';
import Insights from './pages/insights/Insights';
import Article from './pages/insights/Article';
import Contacto from './pages/contacto/Contacto';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ConfirmEmail from './pages/auth/ConfirmEmail';
import { ProtectedRoute } from './components/ProtectedRoute';
import PortalLayout from './pages/portal/PortalLayout';
import PortalRedirect from './pages/portal/PortalRedirect';
import AdminDashboard from './pages/portal/admin/AdminDashboard';
import Usuarios from './pages/portal/admin/Usuarios';
import AdminProyectos from './pages/portal/admin/AdminProyectos';
import AdminSettings from './pages/portal/admin/AdminSettings';
import AdminWorkflows from './pages/portal/admin/AdminWorkflows';
import AdminCalendars from './pages/portal/admin/AdminCalendars';
import PublicBooking from './pages/portal/public/PublicBooking';

import ColaboradorDashboard from './pages/portal/colaborador/ColaboradorDashboard';
import ColaboradorReuniones from './pages/portal/colaborador/ColaboradorReuniones';
import ColaboradorLeads from './pages/portal/colaborador/ColaboradorLeads';
import ColaboradorForms from './pages/portal/colaborador/ColaboradorForms';
import ClienteDashboard from './pages/portal/cliente/ClienteDashboard';

// Routes where Navigation should be hidden
const HIDDEN_NAV_ROUTES = ['/login', '/registro'];

function App() {
  const location = useLocation();
  const hideNav = HIDDEN_NAV_ROUTES.includes(location.pathname) || location.pathname.startsWith('/portal');

  return (
    <>
      <ScrollToTop />
      {!hideNav && <Navigation />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/soluciones" element={<Soluciones />} />
        <Route path="/soluciones/workflows" element={<Workflows />} />
        <Route path="/soluciones/desarrollo" element={<Desarrollo />} />
        <Route path="/soluciones/ecosistema" element={<Ecosistema />} />
        <Route path="/soluciones/ia" element={<Ia />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/insights/:slug" element={<Article />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/confirmar-email" element={<ConfirmEmail />} />
        
        {/* Portal (Protected Routes) */}
        <Route path="/book/:id" element={<PublicBooking />} />
        <Route path="/portal" element={<ProtectedRoute />}>
          <Route element={<PortalLayout />}>
            <Route index element={<PortalRedirect />} />
            <Route path="admin">
              <Route index element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="usuarios" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Usuarios />
                </ProtectedRoute>
              } />
              <Route path="proyectos" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProyectos />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              } />
              <Route path="workflows" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminWorkflows />
                </ProtectedRoute>
              } />
              <Route path="calendars" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCalendars />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="colaborador" element={
              <ProtectedRoute allowedRoles={['colaborador']}>
                <ColaboradorDashboard />
              </ProtectedRoute>
            } />
            <Route path="colaborador/reuniones" element={
              <ProtectedRoute allowedRoles={['colaborador']}>
                <ColaboradorReuniones />
              </ProtectedRoute>
            } />
            <Route path="colaborador/leads" element={
              <ProtectedRoute allowedRoles={['colaborador']}>
                <ColaboradorLeads />
              </ProtectedRoute>
            } />
            <Route path="colaborador/forms" element={
              <ProtectedRoute allowedRoles={['colaborador']}>
                <ColaboradorForms />
              </ProtectedRoute>
            } />
            <Route path="cliente" element={
              <ProtectedRoute allowedRoles={['cliente']}>
                <ClienteDashboard />
              </ProtectedRoute>
            } />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;

