import { Bot, BrainCircuit, Code, Network, Database, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "../../components/SEO";
import "./b2b.css";
import "./ia.css";

export default function Ia() {
  const { t } = useTranslation();

  return (
    <div className="ia-page page-transition">
      <SEO 
        title="Inteligencia artificial aplicada para negocios | Grupo Hormesis"
        description="Soluciones de inteligencia artificial generativa, LLMs privados, agentes autónomos y análisis predictivo integrados en tus procesos empresariales."
        canonical="/soluciones/ia"
        ogImage="https://grupohormesis.com/ai_workflow_mockup.jpg"
      />
      
      {/* Hero Section */}
      <section className="ia-hero-section">
        <div className="container">
          <div className="ia-hero-grid">
            <div className="ia-hero-content">
              <div className="ia-badge animate-fade-in">
                <BrainCircuit size={18} />
                {t('ia.hero_badge')}
              </div>
              <h1 className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                {t('ia.hero_title_1')}<br/>
                <span className="ia-text-gradient">{t('ia.hero_title_2')}</span>
              </h1>
              <p className="b2b-hero-subtitle animate-fade-in" style={{ animationDelay: "200ms" }}>
                {t('ia.hero_subtitle')}
              </p>
              <div className="b2b-hero-actions animate-fade-in" style={{ animationDelay: "300ms" }}>
                <Link to="/contacto" className="btn-primary">
                  {t('ia.btn_primary')}
                </Link>
                <div className="b2b-trust-badge">
                  <ShieldCheck size={20} className="text-emerald" />
                  <span>{t('ia.trust_badge')}</span>
                </div>
              </div>
            </div>
            <div className="ia-hero-visual animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <div className="ia-hero-img-wrap">
                <img 
                  src="/ai_mockup.jpg" 
                  alt="Plataforma de Inteligencia Artificial para Empresas Grupo Hormesis" 
                  loading="lazy" 
                  decoding="async" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="ia-services-section">
        <div className="container">
          <div className="b2b-mb-16 text-center">
            <h2 className="b2b-section-title">{t('ia.services_title')}</h2>
            <p className="b2b-section-subtitle mx-auto">
              {t('ia.services_desc')}
            </p>
          </div>

          <div className="ia-services-grid">
            <div className="ia-card" data-aos="fade-up" data-aos-delay="0">
              <div className="ia-card-icon"><Network size={28} /></div>
              <h3>{t('ia.s1_title')}</h3>
              <p>{t('ia.s1_desc')}</p>
            </div>
            
            <div className="ia-card" data-aos="fade-up" data-aos-delay="100">
              <div className="ia-card-icon"><Code size={28} /></div>
              <h3>{t('ia.s2_title')}</h3>
              <p>{t('ia.s2_desc')}</p>
            </div>

            <div className="ia-card" data-aos="fade-up" data-aos-delay="200">
              <div className="ia-card-icon"><Bot size={28} /></div>
              <h3>{t('ia.s3_title')}</h3>
              <p>{t('ia.s3_desc')}</p>
            </div>

            <div className="ia-card" data-aos="fade-up" data-aos-delay="300">
              <div className="ia-card-icon"><Database size={28} /></div>
              <h3>{t('ia.s4_title')}</h3>
              <p>{t('ia.s4_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture / Orchestration Section */}
      <section className="ia-architecture-section">
        <div className="container">
          <div className="ia-arch-grid">
            <div className="ia-arch-content" data-aos="fade-right">
              <h2>{t('ia.architecture_title')}</h2>
              <p>{t('ia.architecture_desc')}</p>
              
              <div className="ia-benefit-list">
                <div className="ia-benefit-item">
                  <div className="ia-benefit-icon"><Zap size={20} /></div>
                  <div>
                    <h4>{t('ia.arch_b1_title')}</h4>
                    <p>{t('ia.arch_b1_desc')}</p>
                  </div>
                </div>
                
                <div className="ia-benefit-item">
                  <div className="ia-benefit-icon"><ArrowUpRight size={20} /></div>
                  <div>
                    <h4>{t('ia.arch_b2_title')}</h4>
                    <p>{t('ia.arch_b2_desc')}</p>
                  </div>
                </div>

                <div className="ia-benefit-item">
                  <div className="ia-benefit-icon"><ShieldCheck size={20} /></div>
                  <div>
                    <h4>{t('ia.arch_b3_title')}</h4>
                    <p>{t('ia.arch_b3_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="ia-arch-visual" data-aos="fade-left" data-aos-delay="100">
              <img 
                src="/ai_workflow_mockup.jpg" 
                alt="Flujo de Trabajo Orquestado con IA Grupo Hormesis" 
                loading="lazy" 
                decoding="async" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Process Timeline Section */}
      <section className="ia-process-section">
        <div className="container">
          <div className="text-center">
            <div className="b2b-micro-title text-emerald-light mb-4">{t('ia.process_subtitle')}</div>
            <h2 className="b2b-section-title">{t('ia.process_title')}</h2>
            <p className="b2b-section-subtitle mx-auto text-center" style={{ maxWidth: '600px' }}>
              {t('ia.process_desc')}
            </p>
          </div>

          <div className="ia-timeline">
            <div className="ia-step" data-aos="zoom-in" data-aos-delay="0">
              <div className="ia-step-number">1</div>
              <h4>Auditoría de datos</h4>
              <p>Evaluamos la viabilidad y preparamos tu ecosistema de información.</p>
            </div>
            <div className="ia-step" data-aos="zoom-in" data-aos-delay="150">
              <div className="ia-step-number">2</div>
              <h4>Entrenamiento y fine-tuning</h4>
              <p>Ajustamos modelos avanzados con tu contexto privado (RAG).</p>
            </div>
            <div className="ia-step" data-aos="zoom-in" data-aos-delay="300">
              <div className="ia-step-number">3</div>
              <h4>Despliegue y escalado</h4>
              <p>Implementación segura en producción monitorizando el rendimiento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="b2b-cta-section">
        <div className="container text-center">
          <h2 className="b2b-section-title mb-6">{t('ia.cta_title')}</h2>
          <p className="b2b-section-subtitle mx-auto mb-10">
            {t('ia.cta_desc')}
          </p>
          <Link to="/contacto" className="btn-primary btn-lg">
            Agenda una consultoría IA
          </Link>
        </div>
      </section>
    </div>
  );
}
