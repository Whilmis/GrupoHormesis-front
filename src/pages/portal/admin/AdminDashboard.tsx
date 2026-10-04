import { useAuth } from '../../../context/AuthContext';
import { Users, TrendingUp, Activity, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>{t('admin_dashboard.hello', { name: user?.name, defaultValue: `¡Hola de nuevo, ${user?.name}! 👋` })}</h2>
      
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">{t('admin_dashboard.active_users', 'Usuarios Activos')}</span>
            <Users className="stat-icon" />
          </div>
          <span className="stat-value">1,248</span>
          <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 500 }}>{t('admin_dashboard.this_week', '+12% esta semana')}</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">{t('admin_dashboard.ongoing_projects', 'Proyectos en curso')}</span>
            <Briefcase className="stat-icon" />
          </div>
          <span className="stat-value">42</span>
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{t('admin_dashboard.pending_review', '3 pendientes de revisión')}</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">{t('admin_dashboard.revenue', 'Ingresos (MRR)')}</span>
            <TrendingUp className="stat-icon" />
          </div>
          <span className="stat-value">$45,200</span>
          <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 500 }}>{t('admin_dashboard.vs_last_month', '+5.2% vs mes anterior')}</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">{t('admin_dashboard.system_health', 'Salud del Sistema')}</span>
            <Activity className="stat-icon" />
          </div>
          <span className="stat-value">99.9%</span>
          <span style={{ color: '#10b981', fontSize: '0.85rem' }}>{t('admin_dashboard.all_operational', 'Todos los servicios operativos')}</span>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginBottom: '1rem', color: '#0f172a' }}>{t('admin_dashboard.recent_activity', 'Actividad Reciente')}</h3>
        <p style={{ color: '#64748b' }}>{t('admin_dashboard.activity_log', 'Aquí se mostrará el log de actividad general del sistema.')}</p>
      </div>
    </div>
  );
}
