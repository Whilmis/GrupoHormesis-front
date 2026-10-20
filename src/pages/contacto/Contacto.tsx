import { useState } from 'react';
import { ArrowRight, MapPin, Mail, Phone, Calendar, Clock, Building2, Zap, Send, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import { BASE_URL } from '../../api/client';
import './contacto.css';

export default function Contacto() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const solucionParam = searchParams.get('solucion');
  
  // 1. Configurar el ID de desarrollo (Fallback)
  const DEFAULT_WORKFLOW_ID = '757c17df-73ea-4427-9ba0-88396360b457';
  const workflowId = searchParams.get('wid') || searchParams.get('workflowId') || DEFAULT_WORKFLOW_ID;
  const [showCoupon, setShowCoupon] = useState(false);

  let defaultSolution = "Modernización de arquitectura cloud";
  if (solucionParam === 'workflows') {
    defaultSolution = "Sistematización y workflows";
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      // 2. Apuntar al Endpoint del Backend en Railway
      const endpoint = workflowId
        ? `${BASE_URL}/forms/${workflowId}/submit`
        : `${BASE_URL}/forms/submit`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        alert('Briefing enviado con éxito.');
        form.reset();
      } else {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.message || 'Error al procesar la solicitud.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al enviar el formulario.');
    }
  };

  return (
    <main className="main-content page-contacto">
      <SEO 
        title="Agenda una sesión estratégica | Contacto Grupo Hormesis"
        description="Agenda una Discovery Call o envíanos un briefing técnico. Evaluamos tus cuellos de botella operativos y diseñamos tu plan de sistematización."
        canonical="/contacto"
      />
      {/* Background Orbs for Premium feel */}
      <div className="contacto-bg-orbs">
        <div className="c-orb c-orb-1"></div>
        <div className="c-orb c-orb-2"></div>
      </div>

      <section className="contact-hero">
        <div className="container relative">
          <div className="contact-grid">
            
            {/* Left Column: Info & Persuasion */}
            <div className="contact-info-col animate-fade-in-up">
              <div className="badge-primary mb-4" style={{display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
                <Zap size={12} className="text-emerald" /> 
                Briefing Center
              </div>
              <h1 className="contact-title">Iniciemos la <span className="text-emerald">transformación</span></h1>
              <p className="contact-subtitle">
                Agenda una llamada de diagnóstico técnico (Discovery Call) o envíanos un briefing detallado. Nuestro equipo de ingenieros analizará tu arquitectura antes de la primera reunión.
              </p>

              {/* Direct Contact Cards */}
              <div className="contact-methods">
                <div className="method-card">
                  <div className="method-icon"><Calendar size={20} className="text-emerald" /></div>
                  <div className="method-text">
                    <h3>Agendar Discovery Call</h3>
                    <p>Llamada técnica de 15 min</p>
                    <a href="#contact-form" onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                    }} className="method-link">Ver disponibilidad <ArrowRight size={14} /></a>
                  </div>
                </div>
                
                <div className="method-card">
                  <div className="method-icon"><Mail size={20} className="text-emerald" /></div>
                  <div className="method-text">
                    <h3>Soporte y consultas</h3>
                    <p>Respuesta en menos de 2 horas</p>
                    <a href="mailto:hello@hormesis.group" className="method-link">hello@hormesis.group</a>
                  </div>
                </div>
              </div>

              {/* Global Locations */}
              <div className="locations-wrapper">
                <h4 className="locations-title"><Building2 size={16} /> Presencia global</h4>
                <div className="locations-list">
                  <div className="location-item">
                    <MapPin size={14} className="text-muted" />
                    <span>Madrid, España</span>
                  </div>
                  <div className="location-item">
                    <MapPin size={14} className="text-muted" />
                    <span>Santo Domingo, RD</span>
                  </div>
                  <div className="location-item">
                    <MapPin size={14} className="text-muted" />
                    <span>Maryland, USA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Glassmorphism Form */}
            <div className="contact-form-col animate-fade-in-up" style={{animationDelay: '200ms'}}>
              <div id="contact-form" className="glass-form-wrapper">
                <div className="form-header">
                  <h3>Enviar briefing técnico</h3>
                  <p>Cuéntanos sobre tu infraestructura o desafío de negocio.</p>
                </div>
                
                <form className="premium-form" onSubmit={handleSubmit}>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Nombre completo</label>
                      <input type="text" name="name" placeholder="Ej. Dra. Elena Vance" required />
                    </div>
                    <div className="form-group">
                      <label>Email corporativo</label>
                      <input type="email" name="email" placeholder="cto@enterprise.com" required />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Empresa</label>
                      <input type="text" name="businessName" placeholder="Nombre de tu compañía" required />
                    </div>
                    <div className="form-group">
                      <label>Rol / cargo</label>
                      <input type="text" name="role" placeholder="Ej. Director IT, CEO" required />
                    </div>
                  </div>
                  
                  <div className="form-group" style={{ position: 'relative', zIndex: 10 }}>
                    <label>Teléfono / WhatsApp (opcional)</label>
                    <CustomPhoneInput />
                  </div>
                  
                  <div className="form-group">
                    <label>Tipo de solución requerida</label>
                    <select name="service" defaultValue={defaultSolution}>
                      <option>Sistematización y workflows</option>
                      <option>Desarrollo a medida (apps)</option>
                      <option>Ecosistema B2B (CRM/ERP)</option>
                      <option>Integración con IA</option>
                      <option>Modernización de arquitectura cloud</option>
                      <option>Otro desafío técnico</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Presupuesto estimado (USD)</label>
                    <div className="form-radio-group">
                      <label className="radio-label">
                        <input type="radio" name="scale" value="< $10k" defaultChecked />
                        <span>{'<'} $10k</span>
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="scale" value="$10k - $50k" />
                        <span>$10k - $50k</span>
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="scale" value="$50k+" />
                        <span>$50k+</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Contexto del proyecto</label>
                    <textarea name="context" rows={4} placeholder="Describe brevemente la situación actual, los cuellos de botella tecnológicos y lo que esperas lograr..."></textarea>
                  </div>
                  
                  {/* Discrete coupon toggle */}
                  <div className="coupon-toggle-wrapper">
                    <button
                      type="button"
                      className={`coupon-toggle ${showCoupon ? 'active' : ''}`}
                      onClick={() => setShowCoupon(!showCoupon)}
                    >
                      <Tag size={13} />
                      <span>¿Tienes un código promocional?</span>
                    </button>
                    <div className={`coupon-field ${showCoupon ? 'coupon-field--visible' : ''}`}>
                      <input
                        type="text"
                        name="usedCouponCode"
                        placeholder="Ej. HORMESIS20"
                        className="coupon-input"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="form-footer">
                    <span className="security-badge"><Clock size={12} className="inline-icon"/> Respuesta garantizada hoy</span>
                    <button type="submit" className="btn-primary btn-lg btn-shadow submit-btn">
                      Enviar dossier <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="faq-header text-center">
            <h2 className="section-title">Preguntas frecuentes</h2>
            <p className="text-muted">Respuestas rápidas para acelerar nuestro primer contacto.</p>
          </div>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h4>¿Cuánto tardan en responder un briefing?</h4>
              <p>Nuestro equipo de ingeniería revisa y responde a todas las solicitudes calificadas en menos de 24 horas laborables.</p>
            </div>
            <div className="faq-item">
              <h4>¿Firmamos un NDA antes de la llamada?</h4>
              <p>Absolutamente. Entendemos la sensibilidad de tu arquitectura e ideas. Podemos proveer nuestro NDA estándar o firmar el tuyo antes de compartir detalles.</p>
            </div>
            <div className="faq-item">
              <h4>¿Aceptan proyectos de todas las escalas?</h4>
              <p>Nos especializamos en arquitecturas complejas y automatización a medida para empresas medianas y grandes, generalmente comenzando en los $10k USD.</p>
            </div>
            <div className="faq-item">
              <h4>¿Cómo funciona la llamada de descubrimiento?</h4>
              <p>Es una sesión técnica de 15 a 30 minutos sin compromiso donde evaluamos la viabilidad técnica de tu desafío y determinamos si somos el partner adecuado.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}






const CustomPhoneInput = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: '+34', flag: '🇪🇸', name: 'España' });
  
  const countries = [
    { code: '+34', flag: '🇪🇸', name: 'España' },
    { code: '+52', flag: '🇲🇽', name: 'México' },
    { code: '+57', flag: '🇨🇴', name: 'Colombia' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina' },
    { code: '+56', flag: '🇨🇱', name: 'Chile' },
    { code: '+51', flag: '🇵🇪', name: 'Perú' },
    { code: '+1', flag: '🇺🇸', name: 'Estados Unidos' }
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', width: '100%', position: 'relative' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginRight: '1rem', position: 'relative' }}
      >
        <span style={{ fontSize: '1.2rem' }}>{selectedCountry.flag}</span>
        <span style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 500 }}>{selectedCountry.code}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#94a3b8' }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
      
      {isOpen && (
        <div style={{ position: 'absolute', top: '110%', left: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', zIndex: 50, width: '200px', maxHeight: '200px', overflowY: 'auto' }}>
          {countries.map(c => (
            <div 
              key={c.code}
              onClick={() => { setSelectedCountry(c); setIsOpen(false); }}
              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1.2rem' }}>{c.flag}</span>
              <span style={{ fontSize: '0.9rem', color: '#1e293b', flex: 1 }}>{c.name}</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{c.code}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ width: '1px', height: '24px', background: '#e2e8f0', marginRight: '1rem' }}></div>
      <input 
        type="tel" 
        name="phone" 
        placeholder="600 000 000" 
        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem', color: '#1e293b', padding: '0.25rem 0' }} 
      />
    </div>
  );
};
