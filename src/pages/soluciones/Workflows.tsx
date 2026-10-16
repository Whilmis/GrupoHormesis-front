import { ArrowRight, CheckCircle, Database, GitMerge, Layout, ShieldCheck, Workflow, Zap, Users, FileText, HeadphonesIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BentoCard } from "../../components/BentoCard";
import SEO from "../../components/SEO";
import "./b2b.css";
import "./workflows.css";

export default function Workflows() {
  const { t } = useTranslation();

  return (
    <main className="workflows-page b2b-page">
      <SEO 
        title="Sistematización y workflows automatizados | Grupo Hormesis"
        description="Conecta tus herramientas, automatiza el pipeline comercial y elimina la carga operativa manual con flujos de trabajo inteligentes."
        canonical="/soluciones/workflows"
        ogImage="https://grupohormesis.com/business_process_mockup.jpg"
      />
      {/* Background elements */}
      <div className="b2b-bg-orbs">
        <div className="s-orb s-orb-1 bg-emerald"></div>
        <div className="s-orb s-orb-2 bg-emerald-dark"></div>
      </div>

      {/* Hero Section */}
      <section className="wf-hero b2b-py-20">
        {/* Technical Grid Background */}
        <div className="tech-grid-bg"></div>
        
        {/* Floating UI Nodes */}
        <div className="wf-floating-nodes">
          <div className="wf-float-node node-a premium-glass">
            <Database size={16} className="text-emerald" /> <span>API Sync</span>
          </div>
          <div className="wf-float-node node-b premium-glass">
            <GitMerge size={16} className="text-emerald" /> <span>Logic Flow</span>
          </div>
          <div className="wf-float-node node-c premium-glass">
            <Zap size={16} className="text-amber" /> <span>Triggered</span>
          </div>
        </div>
        
        <div className="container relative z-10 text-center">
          <div className="badge animate-fade-in glass-badge mx-auto mb-6" style={{display: 'inline-flex'}}>
            <Workflow size={14} className="inline-icon mr-2" />
            {t('workflows.hero_badge')}
          </div>
          <h1 className="b2b-title animate-fade-in" style={{ animationDelay: "100ms" }}>
            {t('workflows.hero_title_1')}<br />
            <span className="text-emerald">{t('workflows.hero_title_2')}</span>
          </h1>
          <p className="b2b-subtitle mx-auto animate-fade-in" style={{ animationDelay: "200ms" }}>
            {t('workflows.hero_subtitle')}
          </p>
          
          <div className="mt-10 animate-fade-in flex flex-col items-center gap-4" style={{ animationDelay: "300ms" }}>
            <Link to="/contacto?solucion=workflows" className="btn-primary btn-lg btn-shadow">
              {t('workflows.btn_primary')} <ArrowRight size={18} />
            </Link>
            
            <div className="b2b-trust-badge">
              <span className="stars">★★★★★</span>
              <span className="trust-text">{t('workflows.trust_badge')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Compare Section */}
      <section className="b2b-compare b2b-py-20">
        <div className="container relative z-10">
          <div className="b2b-micro-title animate-fade-in-up">{t('workflows.compare_title')}</div>
          <h2 className="b2b-section-title animate-fade-in-up">{t('workflows.compare_subtitle')}</h2>
          <p className="b2b-section-subtitle b2b-mb-16 animate-fade-in-up">
            {t('workflows.compare_desc')}
          </p>

          <div className="compare-grid">
            {/* Bad Way */}
            <div className="compare-card bad-way premium-glass">
              <div className="compare-header">
                <h3>El camino tradicional</h3>
                <span>Trabajo manual</span>
              </div>
              <ul className="compare-list">
                <li><span className="cross">×</span> Aprobaciones perdidas en hilos de correo.</li>
                <li><span className="cross">×</span> Doble o triple entrada de datos (Copiar y pegar).</li>
                <li><span className="cross">×</span> Retrasos por dependencia de "cuellos de botella" humanos.</li>
                <li><span className="cross">×</span> Riesgo alto de incumplimiento normativo o errores fatales.</li>
              </ul>
            </div>

            {/* Good Way */}
            <div className="compare-card good-way premium-glass">
              <div className="compare-header">
                <h3 className="text-emerald">La arquitectura Hormesis</h3>
                <span className="text-emerald-light">Workflows automatizados</span>
              </div>
              <ul className="compare-list">
                <li><CheckCircle size={18} className="text-emerald inline-icon" /> Enrutamiento inteligente y aprobaciones a un clic.</li>
                <li><CheckCircle size={18} className="text-emerald inline-icon" /> Sincronización en tiempo real entre tus bases de datos.</li>
                <li><CheckCircle size={18} className="text-emerald inline-icon" /> Ejecución instantánea 24/7 sin fatiga.</li>
                <li><CheckCircle size={18} className="text-emerald inline-icon" /> Trazabilidad total y auditoría automática (Logs).</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Hub Visual Section (Dark) */}
      <section className="wf-integration-hub b2b-py-20">
        <div className="container text-center">
          <h2 className="b2b-section-title mb-6">{t('workflows.integration_title')}</h2>
          <p className="b2b-section-subtitle mx-auto mb-16">
            {t('workflows.integration_desc')}
          </p>
          
          <div className="wf-integration-visual" data-aos="fade-up">
            <img 
              src="/api_integration_mockup.jpg" 
              alt="Hub de Integración de APIs y Conectores de Grupo Hormesis" 
              loading="lazy" 
              decoding="async" 
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="wf-features b2b-py-20">
        <div className="container">
          <div className="b2b-mb-16">
            <h2 className="b2b-section-title">{t('workflows.capabilities_title')}</h2>
            <p className="b2b-section-subtitle">{t('workflows.capabilities_desc')}</p>
          </div>

          <div className="catalog-grid">
            <BentoCard 
              title="Aprobaciones multinivel" 
              description="Diseñamos flujos condicionales. Si un gasto supera los $10k, se envía automáticamente al CFO para su firma antes de continuar."
              icon={<ShieldCheck size={28} className="text-emerald" />}
              className="premium-bento"
            />
            <BentoCard 
              title="Disparadores (triggers) inteligentes" 
              description="Inicia procesos basados en eventos: un nuevo cliente en el CRM, un email con un adjunto específico o a una hora predeterminada."
              icon={<Zap size={28} className="text-emerald" />}
              className="premium-bento"
            />
            <BentoCard 
              title="Integraciones API nativas" 
              description="Conectamos el motor con tu ERP actual (SAP, Oracle), tu facturador o cualquier software legado que ya utilices."
              icon={<Workflow size={28} className="text-emerald" />}
              className="premium-bento"
            />
          </div>
        </div>
      </section>

      {/* Use Cases Section (Business Process Automation) */}
      <section className="wf-use-cases b2b-py-20">
        <div className="container">
          <div className="b2b-mb-16 text-center">
            <h2 className="b2b-section-title">{t('workflows.use_cases_title')}</h2>
            <p className="b2b-section-subtitle mx-auto">{t('workflows.use_cases_desc')}</p>
          </div>

          <div className="wf-use-cases-grid">
            <div className="wf-uc-visual" data-aos="fade-right">
              <img 
                src="/business_process_mockup.jpg" 
                alt="Automatización y Sistematización de Procesos de Negocio Grupo Hormesis" 
                loading="lazy" 
                decoding="async" 
              />
            </div>

            <div className="wf-uc-list" data-aos="fade-left">
              <div className="wf-uc-item">
                <div className="wf-uc-icon"><Users size={24} /></div>
                <div className="wf-uc-content">
                  <h4>{t('workflows.uc1_title')}</h4>
                  <p>{t('workflows.uc1_desc')}</p>
                </div>
              </div>

              <div className="wf-uc-item">
                <div className="wf-uc-icon"><FileText size={24} /></div>
                <div className="wf-uc-content">
                  <h4>{t('workflows.uc2_title')}</h4>
                  <p>{t('workflows.uc2_desc')}</p>
                </div>
              </div>

              <div className="wf-uc-item">
                <div className="wf-uc-icon"><HeadphonesIcon size={24} /></div>
                <div className="wf-uc-content">
                  <h4>{t('workflows.uc3_title')}</h4>
                  <p>{t('workflows.uc3_desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process: How it works */}
      <section className="wf-process b2b-py-20">
        <div className="container">
          <div className="b2b-mb-16">
            <h2 className="b2b-section-title">{t('workflows.process_title')}</h2>
            <p className="b2b-section-subtitle">{t('workflows.process_desc')}</p>
          </div>
          
          <div className="process-timeline">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content premium-glass">
                <h4>Auditoría de procesos</h4>
                <p>Mapeamos tus flujos de trabajo actuales e identificamos los cuellos de botella que están quemando el tiempo de tu equipo.</p>
              </div>
            </div>
            
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content premium-glass">
                <h4>Modelado lógico</h4>
                <p>Diseñamos las reglas de negocio, aprobaciones condicionales y conexiones API sin afectar tu base de datos de producción.</p>
              </div>
            </div>
            
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content premium-glass border-emerald">
                <h4 className="text-emerald">Despliegue 24/7</h4>
                <p>Tu nuevo motor de workflows entra en acción, ejecutando tareas silenciosamente, sin descanso y con registros de auditoría perfectos.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="cta-dark-section">
        <div className="container">
          <div className="cta-dark-box">
            <div className="cta-dark-content">
              <h2>{t('workflows.cta_title')}</h2>
              <p>{t('workflows.cta_desc')}</p>
            </div>
            <div className="cta-dark-action">
              <Link to="/contacto?solucion=workflows" className="btn-primary btn-lg">
                {t('workflows.btn_primary')} <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
