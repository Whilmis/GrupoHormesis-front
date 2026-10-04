import { useState } from 'react';
import { ArrowRight, MapPin, Mail, Phone, Calendar, Clock, Building2, Zap, Send, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import './contacto.css';

export default function Contacto() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const solucionParam = searchParams.get('solucion');
  
  // 1. Configurar el ID de desarrollo (Fallback)
  let workflowId = searchParams.get('wid') || searchParams.get('workflowId');
  if (!workflowId && import.meta.env.DEV) {
    workflowId = 'eec6f7e7-7706-4b50-8cad-987b1a2fef61';
  }
  const [showCoupon, setShowCoupon] = useState(false);

  let defaultSolution = "Modernización de Arquitectura Cloud";
  if (solucionParam === 'workflows') {
    defaultSolution = "Sistematización & Workflows";
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      if (!workflowId) {
        alert('Falta el ID del workflow en la URL (?wid=xyz). Por favor, usa un enlace válido.');
        return;
      }

      // 2. Apuntar al Endpoint Correcto
      const res = await fetch(`http://localhost:3000/api/forms/${workflowId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        alert('Briefing Enviado Exitosamente.');
        form.reset();
      } else {
        alert('Error al procesar la solicitud.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red.');
    }
  };

  return (
    <main className="main-content page-contacto">
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
              <h1 className="contact-title">Iniciemos la <span className="text-emerald">Transformación</span></h1>
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
                    <h3>Soporte & Consultas</h3>
                    <p>Respuesta en menos de 2 horas</p>
                    <a href="mailto:hello@hormesis.group" className="method-link">hello@hormesis.group</a>
                  </div>
                </div>
              </div>

              {/* Global Locations */}
              <div className="locations-wrapper">
                <h4 className="locations-title"><Building2 size={16} /> Presencia Global</h4>
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
                  <h3>Enviar Briefing Técnico</h3>
                  <p>Cuéntanos sobre tu infraestructura o desafío de negocio.</p>
                </div>
                
                <form className="premium-form" onSubmit={handleSubmit}>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Nombre Completo</label>
                      <input type="text" name="name" placeholder="Ej. Dra. Elena Vance" required />
                    </div>
                    <div className="form-group">
                      <label>Email Corporativo</label>
                      <input type="email" name="email" placeholder="cto@enterprise.com" required />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Empresa</label>
                      <input type="text" name="businessName" placeholder="Nombre de tu compañía" required />
                    </div>
                    <div className="form-group">
                      <label>Rol / Cargo</label>
                      <input type="text" name="role" placeholder="Ej. Director IT, CEO" required />
                    </div>
                  </div>
                  
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Teléfono / WhatsApp (Opcional)</label>
                      <input type="tel" name="phone" placeholder="+34 600 000 000" />
                    </div>
                    <div className="form-group">
                      <label>Tipo de Solución Requerida</label>
                      <select name="service" defaultValue={defaultSolution}>
                        <option>Sistematización & Workflows</option>
                        <option>Desarrollo a Medida (Apps)</option>
                        <option>Ecosistema B2B (CRM/ERP)</option>
                        <option>Integración con IA</option>
                        <option>Modernización de Arquitectura Cloud</option>
                        <option>Otro Desafío Técnico</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Presupuesto Estimado (USD)</label>
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
                    <label>Contexto del Proyecto</label>
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
                      Enviar Dossier <Send size={16} />
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
            <h2 className="section-title">Preguntas Frecuentes</h2>
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
