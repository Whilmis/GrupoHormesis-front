import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Calendar, Monitor, Smartphone, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { BASE_URL } from '../../../api/client';

export default function PublicProposal() {
  const { leadId } = useParams<{ leadId: string }>();
  const [searchParams] = useSearchParams();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [leadInfo, setLeadInfo] = useState<{
    businessName?: string;
    website?: string;
    calendarId?: string | null;
  }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (!leadId) return;

    const loadProposal = async () => {
      try {
        setLoading(true);
        // 1. Obtener resumen y calendarId asociado
        const summaryRes = await fetch(`${BASE_URL}/leads/public/${leadId}/summary`).catch(() => null);
        if (summaryRes && summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setLeadInfo(summaryData);
        }

        // 2. Obtener el HTML de la maqueta
        const qParams = new URLSearchParams();
        qParams.set('embed', '1');
        if (searchParams.get('internal') === '1') qParams.set('internal', '1');
        const nameParam = searchParams.get('name');
        const webParam = searchParams.get('web');
        if (nameParam) qParams.set('name', nameParam);
        if (webParam) qParams.set('web', webParam);
        const qs = `?${qParams.toString()}`;

        const res = await fetch(`${BASE_URL}/leads/public/${leadId}/mockup${qs}`);
        const html = await res.text();
        setHtmlContent(html);
      } catch (err) {
        console.error('Error cargando la propuesta:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProposal();
  }, [leadId, searchParams]);

  const calendarId = searchParams.get('cal') || leadInfo.calendarId;
  const bookingUrl = calendarId
    ? `/book/${calendarId}?ref=${leadId}`
    : `/contacto`;

  const businessTitle = leadInfo.businessName || searchParams.get('name') || 'Tu Empresa';

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0b0f19',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <Loader2 size={40} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Cargando propuesta de diseño interactiva...</p>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0f172a',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Barra superior interactiva de Grupo Hormesis */}
      <div style={{
        height: '58px',
        background: 'rgba(15, 23, 42, 0.98)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        zIndex: 100,
        flexShrink: 0,
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}>
            <Sparkles size={13} /> Propuesta Conceptual
          </span>
          <span style={{
            color: '#f8fafc',
            fontWeight: 700,
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {businessTitle}
          </span>
        </div>

        {/* Selector Escritorio / Móvil */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#1e293b',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <button
            onClick={() => setViewMode('desktop')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: viewMode === 'desktop' ? '#10b981' : 'transparent',
              color: viewMode === 'desktop' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s'
            }}
          >
            <Monitor size={14} /> <span className="hide-xs">Escritorio</span>
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: viewMode === 'mobile' ? '#10b981' : 'transparent',
              color: viewMode === 'mobile' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s'
            }}
          >
            <Smartphone size={14} /> <span className="hide-xs">Móvil</span>
          </button>
        </div>

        {/* Botón CTA directo para Agendar Reunión */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <a
            href={bookingUrl}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              background: '#10b981',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              whiteSpace: 'nowrap'
            }}
          >
            <Calendar size={15} /> Agendar Reunión (15 min)
          </a>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Web oficial de Grupo Hormesis"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: '#94a3b8',
              fontSize: '0.8rem',
              textDecoration: 'none',
              padding: '6px 8px'
            }}
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Lienzo de la Maqueta */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: ' stretch',
        background: viewMode === 'mobile' ? '#090d16' : '#ffffff',
        padding: viewMode === 'mobile' ? '20px 0' : 0,
        overflow: 'hidden'
      }}>
        <iframe
          title={`Propuesta de diseño para ${businessTitle}`}
          srcDoc={htmlContent}
          style={{
            width: viewMode === 'mobile' ? '390px' : '100%',
            height: '100%',
            border: viewMode === 'mobile' ? '8px solid #1e293b' : 'none',
            borderRadius: viewMode === 'mobile' ? '32px' : '0',
            background: '#ffffff',
            boxShadow: viewMode === 'mobile' ? '0 25px 50px -12px rgba(0,0,0,0.7)' : 'none',
            transition: 'width 0.25s ease'
          }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hide-xs { display: none; }
        }
      `}</style>
    </div>
  );
}
