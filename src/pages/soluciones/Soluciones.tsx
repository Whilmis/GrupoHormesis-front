import { Workflow, Code, BarChart, BrainCircuit, ArrowRight, LayoutDashboard, ChevronRight } from "lucide-react";
import "./b2b.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "../../components/SEO";

export default function SolucionesB2B() {
  const { t } = useTranslation();

  return (
    <main className="b2b-page">
      <SEO 
        title="Soluciones de Automatización & Software B2B | Grupo Hormesis"
        description="Descubre nuestras soluciones de automatización de ventas, integraciones API avanzadas y desarrollo de software empresarial a medida."
        canonical="/soluciones"
        ogImage="https://grupohormesis.com/private_app_store_mockup.jpg"
      />
      {/* Background Orbs */}
      <div className="b2b-bg-orbs">
        <div className="s-orb s-orb-1"></div>
        <div className="s-orb s-orb-2"></div>
      </div>

      <section className="b2b-header pb-12">
        <div className="container relative z-10 text-center">
          <div className="badge animate-fade-in glass-badge mx-auto mb-6 inline-flex items-center">
            <LayoutDashboard size={16} className="mr-2 text-emerald" />
            {t('soluciones_hub.hero_badge')}
          </div>
          
          <h1 className="b2b-title animate-fade-in" style={{ animationDelay: "100ms" }}>
            {t('soluciones_hub.hero_title_1')}<br /> 
            <span className="text-emerald">{t('soluciones_hub.hero_title_2')}</span>
          </h1>
          
          <p className="b2b-subtitle animate-fade-in mx-auto mb-16" style={{ animationDelay: "200ms", maxWidth: "800px" }}>
            {t('soluciones_hub.hero_subtitle')}
          </p>

          <div className="ia-hero-visual animate-fade-in-up mx-auto" style={{ animationDelay: "300ms", maxWidth: "1000px", borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border-subtle, rgba(0,0,0,0.08))", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}>
            <img 
              src="/private_app_store_mockup.jpg" 
              alt="Plataforma de Soluciones de Software y Automatización B2B de Grupo Hormesis" 
              loading="lazy" 
              decoding="async"
              style={{ width: "100%", display: "block" }} 
            />
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section className="directory-section b2b-py-20" style={{ backgroundColor: "var(--bg-secondary, #f8fafc)" }}>
        <div className="container relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="b2b-section-title mb-4">{t('soluciones_hub.directory_title')}</h2>
            <p className="b2b-section-subtitle mx-auto max-w-2xl">{t('soluciones_hub.directory_desc')}</p>
          </div>

          <div className="hub-directory-grid">
            
            {/* Card 1: Workflows */}
            <Link to="/soluciones/workflows" className="hub-directory-card premium-glass animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <div className="hub-card-icon"><Workflow size={28} /></div>
              <div className="hub-card-content">
                <h3>{t('soluciones_hub.card1_title')}</h3>
                <p>{t('soluciones_hub.card1_desc')}</p>
              </div>
              <div className="hub-card-arrow"><ChevronRight size={24} /></div>
            </Link>

            {/* Card 2: Desarrollo */}
            <Link to="/soluciones/desarrollo" className="hub-directory-card premium-glass animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <div className="hub-card-icon"><Code size={28} /></div>
              <div className="hub-card-content">
                <h3>{t('soluciones_hub.card2_title')}</h3>
                <p>{t('soluciones_hub.card2_desc')}</p>
              </div>
              <div className="hub-card-arrow"><ChevronRight size={24} /></div>
            </Link>

            {/* Card 3: Ecosistema */}
            <Link to="/soluciones/ecosistema" className="hub-directory-card premium-glass animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <div className="hub-card-icon"><BarChart size={28} /></div>
              <div className="hub-card-content">
                <h3>{t('soluciones_hub.card3_title')}</h3>
                <p>{t('soluciones_hub.card3_desc')}</p>
              </div>
              <div className="hub-card-arrow"><ChevronRight size={24} /></div>
            </Link>

            {/* Card 4: IA */}
            <Link to="/soluciones/ia" className="hub-directory-card premium-glass animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <div className="hub-card-icon"><BrainCircuit size={28} /></div>
              <div className="hub-card-content">
                <h3>{t('soluciones_hub.card4_title')}</h3>
                <p>{t('soluciones_hub.card4_desc')}</p>
              </div>
              <div className="hub-card-arrow"><ChevronRight size={24} /></div>
            </Link>

          </div>
        </div>
      </section>

      {/* Dark Mode CTA Footer */}
      <section className="cta-dark-section">
        <div className="container">
          <div className="cta-dark-box">
            <div className="cta-dark-content">
              <h2>No compres software genérico.<br/><span className="text-emerald">Constrúyelo.</span></h2>
              <p>Agenda una llamada técnica y descubre cómo el ecosistema Hormesis puede digitalizar tu operación en semanas, no en meses.</p>
            </div>
            <div className="cta-dark-action">
              <Link to="/contacto" className="btn-primary btn-lg">
                Iniciar Proyecto <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
