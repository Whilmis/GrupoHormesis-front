import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Settings, 
  LogOut, 
  FolderKanban,
  FileText,
  Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/SEO';
import './portal.css';

export default function PortalLayout() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  // Definir links del sidebar según el rol
  const getNavLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { name: t('portal.overview', 'Vista general'), path: '/portal/admin', icon: LayoutDashboard },
          { name: t('portal.users', 'Usuarios'), path: '/portal/admin/usuarios', icon: Users },
          { name: 'Calendarios', path: '/portal/admin/calendars', icon: Calendar },
          { name: t('portal.projects', 'Proyectos'), path: '/portal/admin/proyectos', icon: Briefcase },
          { name: 'Workflows', path: '/portal/admin/workflows', icon: FolderKanban },
          { name: t('portal.config', 'Configuración'), path: '/portal/admin/settings', icon: Settings },
        ];
      case 'colaborador':
        return [
          { name: t('portal.my_dashboard', 'Mi tablero'), path: '/portal/colaborador', icon: LayoutDashboard },
          { name: 'Mis reuniones', path: '/portal/colaborador/reuniones', icon: Calendar },
          { name: 'Empresas y leads', path: '/portal/colaborador/leads', icon: Briefcase },
          { name: 'Formularios', path: '/portal/colaborador/forms', icon: FileText },
        ];
      case 'cliente':
        return [
          { name: t('portal.summary', 'Resumen'), path: '/portal/cliente', icon: LayoutDashboard },
          { name: t('portal.my_projects', 'Mis proyectos'), path: '/portal/cliente/proyectos', icon: Briefcase },
          { name: t('portal.billing', 'Facturación'), path: '/portal/cliente/facturacion', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();
  const userInitials = user.name ? user.name.substring(0, 2).toUpperCase() : 'US';

  return (
    <div className="portal-container">
      <SEO title="Portal | Grupo Hormesis" noIndex={true} />
      {/* Sidebar */}
      <aside className="portal-sidebar">
        <div className="portal-logo-container">
          <img src="/logo.png" alt="Grupo Hormesis" className="portal-logo" />
          <span className="portal-logo-text">Portal</span>
        </div>
        
        <nav className="portal-nav">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink 
                key={link.path}
                to={link.path}
                end={link.path === `/portal/${user.role}`}
                className={({ isActive }) => `portal-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="portal-nav-icon" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid #e2e8f0' }}>
          <button onClick={handleLogout} className="portal-nav-item" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
            <LogOut className="portal-nav-icon" />
            {t('portal.logout', 'Cerrar sesión')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="portal-main">
        {/* Header */}
        <header className="portal-header">
          <h1 className="portal-header-title">
            {t('portal.panel_of', 'Panel de')} {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </h1>
          
          <div className="portal-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="language-switcher" style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => i18n.changeLanguage('es')}
                style={{ 
                  background: i18n.language === 'es' ? '#10b981' : 'transparent', 
                  color: i18n.language === 'es' ? 'white' : '#64748b',
                  border: '1px solid #e2e8f0',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}
              >
                ES
              </button>
              <button 
                onClick={() => i18n.changeLanguage('en')}
                style={{ 
                  background: i18n.language === 'en' ? '#10b981' : 'transparent', 
                  color: i18n.language === 'en' ? 'white' : '#64748b',
                  border: '1px solid #e2e8f0',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}
              >
                EN
              </button>
            </div>

            <div className="portal-user-profile">
              <div className="portal-user-avatar">
                {userInitials}
              </div>
              <div className="portal-user-info">
                <span className="portal-user-name">{user.name}</span>
                <span className="portal-user-role">{user.company || user.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Views */}
        <div className="portal-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
