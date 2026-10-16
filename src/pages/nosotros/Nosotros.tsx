import React, { useEffect } from 'react';
import { Users, Lightbulb, ShieldCheck, Code, MapPin, Globe, Building2, Briefcase, ArrowRight, Search, LayoutTemplate, Terminal, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import SEO from '../../components/SEO';
import '../soluciones/b2b.css';
import './nosotros.css';

export default function NosotrosPage() {
  const { t } = useTranslation();
  const location = useLocation();

  // Scroll to anchor on load if hash exists
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <main className="b2b-page">
      <SEO 
        title="Sobre Grupo Hormesis | Nuestra visión y equipo de ingeniería"
        description="Conoce al equipo de ingenieros y estrategas detrás de Grupo Hormesis. Creamos sistemas y arquitecturas de software que escalan negocios de alto impacto."
        canonical="/nosotros"
        ogImage="https://grupohormesis.com/hormesis_team_mockup.jpg"
      />
      {/* Background Orbs */}
      <div className="b2b-bg-orbs">
        <div className="s-orb s-orb-1"></div>
        <div className="s-orb s-orb-2"></div>
      </div>

      {/* Hero Section */}
      <section className="b2b-header pb-12">
        <div className="container relative z-10 text-center">
          <div className="badge animate-fade-in glass-badge mx-auto mb-6 inline-flex items-center">
            <Building2 size={16} className="mr-2 text-emerald" />
            {t('nosotros.hero_badge')}
          </div>
          
          <h1 className="b2b-title animate-fade-in" style={{ animationDelay: "100ms" }}>
            {t('nosotros.hero_title_1')}<br /> 
            <span className="text-emerald">{t('nosotros.hero_title_2')}</span>
          </h1>
          
          <p className="b2b-subtitle animate-fade-in mx-auto mb-0" style={{ animationDelay: "200ms", maxWidth: "800px" }}>
            {t('nosotros.hero_subtitle')}
          </p>
        </div>
      </section>

      {/* Cultura y Visión */}
      <section id="cultura" className="cultura-section b2b-py-20">
        <div className="container relative z-10">
          <div className="cultura-grid">
            <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <h2 className="b2b-section-title mb-6" style={{ textAlign: 'left' }}>{t('nosotros.cultura_title')}</h2>
              <p className="b2b-section-subtitle mb-8" style={{ textAlign: 'left', marginLeft: 0 }}>
                {t('nosotros.cultura_desc')}
              </p>

              <div className="cultura-values">
                <div className="cultura-value-item">
                  <div className="value-icon"><Lightbulb size={24} /></div>
                  <div className="value-content">
                    <h4>{t('nosotros.cultura_value1_title')}</h4>
                    <p>{t('nosotros.cultura_value1_desc')}</p>
                  </div>
                </div>

                <div className="cultura-value-item">
                  <div className="value-icon"><ShieldCheck size={24} /></div>
                  <div className="value-content">
                    <h4>{t('nosotros.cultura_value2_title')}</h4>
                    <p>{t('nosotros.cultura_value2_desc')}</p>
                  </div>
                </div>

                <div className="cultura-value-item">
                  <div className="value-icon"><Code size={24} /></div>
                  <div className="value-content">
                    <h4>{t('nosotros.cultura_value3_title')}</h4>
                    <p>{t('nosotros.cultura_value3_desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="cultura-visual animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <img 
                src="/hormesis_culture_mockup.jpg" 
                alt="Cultura e Ingeniería de Alto Rendimiento en Grupo Hormesis" 
                className="rounded-2xl shadow-2xl border border-gray-100" 
                loading="lazy" 
                decoding="async" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* El Equipo / Liderazgo */}
      <section id="equipo" className="equipo-section b2b-py-20">
        <div className="container relative z-10">
          <div className="cultura-grid">
            <div className="equipo-visual animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <img 
                src="/hormesis_team_mockup.jpg" 
                alt="Equipo de Liderazgo y Consultoría de Software de Grupo Hormesis" 
                loading="lazy" 
                decoding="async" 
              />
            </div>

            <div className="equipo-content animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <h2 className="b2b-section-title mb-6" style={{ textAlign: 'left' }}>{t('nosotros.equipo_title')}</h2>
              <p className="b2b-section-subtitle mb-8" style={{ textAlign: 'left', marginLeft: 0 }}>
                {t('nosotros.equipo_desc')}
              </p>
              
              <div className="mt-4">
                <a href="#contacto" className="btn-primary inline-flex items-center">
                  {t('nosotros.equipo_btn')} <ArrowRight size={18} className="ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metodología */}
      <section id="metodologia" className="metodologia-section b2b-py-20">
        <div className="container relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="b2b-section-title mb-4">{t('nosotros.metodologia_title')}</h2>
            <p className="b2b-section-subtitle mx-auto max-w-2xl">
              {t('nosotros.metodologia_desc')}
            </p>
          </div>

          <div className="metodologia-grid">
            {/* Paso 1 */}
            <div className="metodologia-card animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <div className="metodologia-icon">
                <Search size={28} />
              </div>
              <h4>{t('nosotros.metodologia_paso1_title')}</h4>
              <p>{t('nosotros.metodologia_paso1_desc')}</p>
            </div>

            {/* Paso 2 */}
            <div className="metodologia-card animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <div className="metodologia-icon">
                <LayoutTemplate size={28} />
              </div>
              <h4>{t('nosotros.metodologia_paso2_title')}</h4>
              <p>{t('nosotros.metodologia_paso2_desc')}</p>
            </div>

            {/* Paso 3 */}
            <div className="metodologia-card animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <div className="metodologia-icon">
                <Terminal size={28} />
              </div>
              <h4>{t('nosotros.metodologia_paso3_title')}</h4>
              <p>{t('nosotros.metodologia_paso3_desc')}</p>
            </div>

            {/* Paso 4 */}
            <div className="metodologia-card animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <div className="metodologia-icon">
                <TrendingUp size={28} />
              </div>
              <h4>{t('nosotros.metodologia_paso4_title')}</h4>
              <p>{t('nosotros.metodologia_paso4_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Presencia Corporativa (Dark Section) */}
      <section id="presencia" className="presencia-section b2b-py-20">
        <div className="container relative z-10 text-center">
          <h2 className="b2b-section-title mb-6 text-white">{t('nosotros.presencia_title')}</h2>
          <p className="b2b-section-subtitle mx-auto mb-16 text-slate-300">
            {t('nosotros.presencia_desc')}
          </p>

          <div className="presencia-visual animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <img 
              src="/hormesis_global_presence.jpg" 
              alt="Presencia Global y Clientes Internacionales de Grupo Hormesis" 
              loading="lazy" 
              decoding="async" 
            />
          </div>

          <div className="presencia-stats-grid mt-16 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="stat-card premium-glass">
              <div className="stat-number text-emerald">50+</div>
              <div className="stat-label text-slate-300">{t('nosotros.presencia_stat1')}</div>
            </div>
            <div className="stat-card premium-glass">
              <div className="stat-number text-emerald">120+</div>
              <div className="stat-label text-slate-300">{t('nosotros.presencia_stat2')}</div>
            </div>
            <div className="stat-card premium-glass">
              <div className="stat-number text-emerald">15</div>
              <div className="stat-label text-slate-300">{t('nosotros.presencia_stat3')}</div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
