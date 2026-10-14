import { ArrowRight, Database, Globe, Network, Activity, PieChart, LayoutDashboard, Share2, Building2, Users, Briefcase, BarChart } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "../../components/SEO";
import "./b2b.css";
import "./ecosistema.css";

export default function Ecosistema() {
  const { t } = useTranslation();

  return (
    <main className="ecosistema-page b2b-page">
      <SEO 
        title="Ecosistema & Integraciones Empresariales | Grupo Hormesis"
        description="Unifica tus bases de datos, CRMs, ERPs y canales de comunicación en un solo ecosistema integrado y automatizado."
        canonical="/soluciones/ecosistema"
        ogImage="https://grupohormesis.com/b2b_mockup.jpg"
      />
      {/* Background elements */}
      <div className="b2b-bg-orbs">
        <div className="s-orb s-orb-1 bg-emerald"></div>
        <div className="s-orb s-orb-2 bg-emerald-dark"></div>
      </div>

      {/* Hero Section: Data Hub / Solar System */}
      <section className="eco-hero b2b-py-20">
        <div className="eco-grid-bg"></div>
        
        <div className="container relative z-10 text-center">
          <div className="badge animate-fade-in glass-badge mx-auto mb-6" style={{display: 'inline-flex'}}>
            <Network size={14} className="inline-icon mr-2" />
            {t('ecosistema.hero_badge')}
          </div>
          <h1 className="b2b-title animate-fade-in" style={{ animationDelay: "100ms" }}>
            {t('ecosistema.hero_title_1')}<br />
            <span className="text-emerald">{t('ecosistema.hero_title_2')}</span>
          </h1>
          <p className="b2b-subtitle mx-auto animate-fade-in" style={{ animationDelay: "200ms" }}>
            {t('ecosistema.hero_subtitle')}
          </p>
          
          <div className="mt-10 animate-fade-in flex flex-col items-center gap-4" style={{ animationDelay: "300ms" }}>
            <Link to="/contacto?solucion=ecosistema" className="btn-primary btn-lg btn-shadow">
              {t('ecosistema.btn_primary')} <ArrowRight size={18} />
            </Link>
            
            <div className="b2b-trust-badge" style={{marginTop: 0}}>
              <span className="stars">★★★★★</span>
              <span className="trust-text">{t('ecosistema.trust_badge')}</span>
            </div>
          </div>
        </div>

        {/* Visual: Orbiting Ecosystem */}
        <div className="eco-orbit-visual animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <div className="orbit-center">
            <Globe size={40} className="text-emerald" />
            <div className="center-pulse"></div>
          </div>
          
          <div className="orbit-ring ring-1">
            <div className="orbit-node n-1 premium-glass"><Database size={18} /></div>
            <div className="orbit-node n-2 premium-glass"><span className="font-bold">SAP</span></div>
          </div>
          <div className="orbit-ring ring-2">
            <div className="orbit-node n-3 premium-glass"><span className="font-bold">SFDC</span></div>
            <div className="orbit-node n-4 premium-glass"><Activity size={18} /></div>
            <div className="orbit-node n-5 premium-glass"><span className="font-bold">API</span></div>
          </div>
          
          {/* Data particles flying along the rings */}
          <div className="data-particle p-1"></div>
          <div className="data-particle p-2"></div>
          <div className="data-particle p-3"></div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="eco-showcase-section b2b-py-20">
        <div className="container">
          <div className="b2b-mb-16 text-center">
            <div className="b2b-micro-title text-emerald-light mb-4">{t('ecosistema.showcase_tag')}</div>
            <h2 className="b2b-section-title text-white">{t('ecosistema.showcase_title')}</h2>
            <p className="b2b-section-subtitle mx-auto text-center" style={{ maxWidth: '700px' }}>
              {t('ecosistema.showcase_desc')}
            </p>
          </div>

          <div className="showcase-grid">
            <div className="showcase-item">
              <img 
                src="/crm_mockup.jpg" 
                alt="Panel de Control y CRM Integrado Grupo Hormesis" 
                loading="lazy" 
                decoding="async" 
              />
            </div>
            <div className="showcase-item">
              <img 
                src="/b2b_mockup.jpg" 
                alt="Portal B2B de Gestión Empresarial Grupo Hormesis" 
                loading="lazy" 
                decoding="async" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bento Box Components */}
      <section className="eco-bento-section b2b-py-20">
        <div className="container">
          <div className="b2b-mb-16 text-center">
            <h2 className="b2b-section-title">{t('ecosistema.bento_title')}</h2>
            <p className="b2b-section-subtitle mx-auto text-center" style={{ maxWidth: '600px' }}>
              {t('ecosistema.bento_desc')}
            </p>
          </div>

          <div className="eco-bento-grid">
            <div className="eco-bento-card bento-wide">
              <div className="bento-icon-wrap"><Briefcase size={24} /></div>
              <h3>{t('ecosistema.c1_title')}</h3>
              <p>{t('ecosistema.c1_desc')}</p>
            </div>
            <div className="eco-bento-card bento-square">
              <div className="bento-icon-wrap"><Users size={24} /></div>
              <h3>{t('ecosistema.c2_title')}</h3>
              <p>{t('ecosistema.c2_desc')}</p>
            </div>
            <div className="eco-bento-card bento-square">
              <div className="bento-icon-wrap"><Building2 size={24} /></div>
              <h3>{t('ecosistema.c3_title')}</h3>
              <p>{t('ecosistema.c3_desc')}</p>
            </div>
            <div className="eco-bento-card bento-wide">
              <div className="bento-icon-wrap"><BarChart size={24} /></div>
              <h3>{t('ecosistema.c4_title')}</h3>
              <p>{t('ecosistema.c4_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sync & APIs (Sticky/Side-by-side) */}
      <section className="eco-sync b2b-py-20 border-t border-dark-subtle">
        <div className="container">
          <div className="sync-grid">
            <div className="sync-content">
              <div className="b2b-micro-title text-emerald-light">{t('ecosistema.sync_title')}</div>
              <h2 className="b2b-section-title">{t('ecosistema.sync_subtitle')}</h2>
              <p className="b2b-section-subtitle ml-0 b2b-mb-8">{t('ecosistema.sync_desc')}</p>
              
              <ul className="sync-list">
                <li>
                  <div className="s-icon"><Share2 size={20} className="text-emerald" /></div>
                  <div className="s-text">
                    <strong>Conectores Nativos</strong>
                    <span>Enlazamos con más de 100 plataformas líderes del mercado B2B de forma inmediata.</span>
                  </div>
                </li>
                <li>
                  <div className="s-icon"><Database size={20} className="text-emerald" /></div>
                  <div className="s-text">
                    <strong>ETL y Data Warehousing</strong>
                    <span>Extraemos, transformamos y cargamos tus datos en almacenes centralizados y limpios.</span>
                  </div>
                </li>
                <li>
                  <div className="s-icon"><LayoutDashboard size={20} className="text-emerald" /></div>
                  <div className="s-text">
                    <strong>Visualización PowerBI / Tableau</strong>
                    <span>Tus datos listos para ser consumidos por los tomadores de decisiones en tiempo real.</span>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="sync-visual">
               <div className="pipeline-container premium-glass">
                 {/* Visual abstraction of pipes connecting databases */}
                 <div className="pipe-row">
                   <div className="pipe-db"><Database size={24} className="text-slate" /></div>
                   <div className="pipe-line"><div className="pipe-flow"></div></div>
                   <div className="pipe-hub"><Globe size={32} className="text-emerald" /></div>
                 </div>
                 <div className="pipe-row">
                   <div className="pipe-db"><PieChart size={24} className="text-slate" /></div>
                   <div className="pipe-line"><div className="pipe-flow delay-1"></div></div>
                   <div className="pipe-hub empty"></div>
                 </div>
                 <div className="pipe-row">
                   <div className="pipe-db"><Activity size={24} className="text-slate" /></div>
                   <div className="pipe-line"><div className="pipe-flow delay-2"></div></div>
                   <div className="pipe-hub empty"></div>
                 </div>
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
              <h2>{t('ecosistema.cta_title')}</h2>
              <p>{t('ecosistema.cta_desc')}</p>
            </div>
            <div className="cta-dark-action">
              <Link to="/contacto?solucion=ecosistema" className="btn-primary btn-lg">
                {t('ecosistema.btn_primary')} <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
