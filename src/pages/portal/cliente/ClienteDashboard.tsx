import { useAuth } from '../../../context/AuthContext';
import { Target, Zap, FileCheck, Copy, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { PromptEditorField } from '../../../components/PromptEditorField';

export default function ClienteDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [promptValue, setPromptValue] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if ((user as any)?.referralCode) {
      navigator.clipboard.writeText((user as any).referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>{t('cliente_dashboard.summary', { name: user?.company || user?.name })}</h2>
      
      {/* SECCIÓN DE REFERIDO */}
      {(user as any)?.referralCode && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.5rem', color: '#0f172a' }}>Tu código de referido</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Comparte este código con tus conocidos para que lo utilicen al enviar un formulario.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '400px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', flex: 1 }}>
              <code style={{ color: '#1e293b', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.05em' }}>
                {(user as any).referralCode}
              </code>
            </div>
            <button 
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                background: copied ? '#d1fae5' : '#4f46e5', color: copied ? '#059669' : 'white'
              }}
              title="Copiar al portapapeles"
            >
              {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
            </button>
          </div>
          {copied && (
            <p style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 500, marginTop: '0.5rem' }}>
              ¡Código copiado al portapapeles!
            </p>
          )}
        </div>
      )}
      
      {/* SECCIÓN AÑADIDA PARA PROBAR EL PROMPT EDITOR */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#0f172a' }}>Configurar autorespuesta con IA</h3>
        <PromptEditorField 
          label="Instrucciones para la IA (System Prompt)"
          description="Define cómo debe actuar la IA y redactar la respuesta a tus clientes."
          value={promptValue}
          onChange={setPromptValue}
          variables={[
            { tag: '{{name}}', description: 'Nombre del cliente' },
            { tag: '{{email}}', description: 'Correo del cliente' },
            { tag: '{{businessName}}', description: 'Empresa del cliente' },
            { tag: '{{message}}', description: 'Mensaje que dejó' }
          ]}
          templates={[
            {
              title: 'Agradecimiento formal',
              content: "Eres un asistente de ventas. Un cliente llamado {{name}} de {{businessName}} pregunta lo siguiente: '{{message}}'. Responde agradeciendo formalmente y ofreciendo una reunión."
            },
            {
              title: 'Respuesta corta',
              content: "Responde muy breve a {{name}} ({{email}}) diciendo que hemos recibido su mensaje: '{{message}}' y lo contactaremos pronto."
            }
          ]}
        />
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">{t('cliente_dashboard.status', 'Estado del proyecto')}</span>
            <Target className="stat-icon" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }} />
          </div>
          <span className="stat-value">{t('cliente_dashboard.in_dev', 'En desarrollo')}</span>
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{t('cliente_dashboard.phase', 'Fase 2 de 4')}</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">{t('cliente_dashboard.efficiency', 'Eficiencia ganada')}</span>
            <Zap className="stat-icon" />
          </div>
          <span className="stat-value">+35%</span>
          <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 500 }}>{t('cliente_dashboard.based_on', 'Basado en métricas iniciales')}</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">{t('cliente_dashboard.docs', 'Documentos entregados')}</span>
            <FileCheck className="stat-icon" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }} />
          </div>
          <span className="stat-value">4</span>
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{t('cliente_dashboard.last_delivery', 'Última entrega: Hace 2 días')}</span>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#0f172a' }}>{t('cliente_dashboard.next_milestones', 'Próximos hitos')}</h3>
        <ul style={{ color: '#64748b', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>{t('cliente_dashboard.m1', 'Revisión de prototipo funcional (Semana próxima)')}</li>
          <li>{t('cliente_dashboard.m2', 'Integración de base de datos de producción')}</li>
          <li>{t('cliente_dashboard.m3', 'Capacitación del equipo interno')}</li>
        </ul>
      </div>
    </div>
  );
}
