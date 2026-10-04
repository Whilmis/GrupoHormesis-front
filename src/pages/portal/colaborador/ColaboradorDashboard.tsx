import { useAuth } from '../../../context/AuthContext';
import { CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ColaboradorDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>{t('colab_dashboard.welcome', { name: user?.name, defaultValue: `Bienvenido a tu área de trabajo, ${user?.name}` })}</h2>
      
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">{t('colab_dashboard.pending_tasks', 'Tareas Pendientes')}</span>
            <ListTodo className="stat-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }} />
          </div>
          <span className="stat-value">8</span>
          <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 500 }}>{t('colab_dashboard.high_priority', '2 con prioridad alta')}</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">{t('colab_dashboard.hours', 'Horas Registradas')}</span>
            <Clock className="stat-icon" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }} />
          </div>
          <span className="stat-value">32.5h</span>
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{t('colab_dashboard.this_week', 'Esta semana')}</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">{t('colab_dashboard.completed_workflows', 'Workflows Completados')}</span>
            <CheckCircle2 className="stat-icon" />
          </div>
          <span className="stat-value">12</span>
          <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 500 }}>{t('colab_dashboard.good_job', '¡Buen trabajo!')}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginBottom: '1rem', color: '#0f172a' }}>{t('colab_dashboard.my_tasks', 'Mis Tareas Asignadas')}</h3>
          <p style={{ color: '#64748b' }}>{t('colab_dashboard.interactive_list', 'Lista interactiva de tareas pendientes.')}</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginBottom: '1rem', color: '#0f172a' }}>{t('colab_dashboard.internal_announcements', 'Anuncios Internos')}</h3>
          <p style={{ color: '#64748b' }}>{t('colab_dashboard.team_comms', 'Comunicados del equipo.')}</p>
        </div>
      </div>
    </div>
  );
}
