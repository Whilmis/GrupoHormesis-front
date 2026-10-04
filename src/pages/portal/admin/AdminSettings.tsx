import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../portal.css';

export default function AdminSettings() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Settings size={24} color="#10b981" />
        {t('admin_settings.management', 'Configuración del Sistema')}
      </h2>
      <p style={{ color: '#64748b' }}>{t('admin_settings.desc', 'Simulación: Opciones globales del portal, notificaciones y preferencias de la empresa.')}</p>
      
      <div style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
        <p>{t('admin_settings.module', 'Módulo de configuración en desarrollo.')}</p>
      </div>
    </div>
  );
}
