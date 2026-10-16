import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Mail } from 'lucide-react';
import SEO from '../../components/SEO';
import '../soluciones/b2b.css';
import './insights.css';

export default function InsightsPage() {
  const { t } = useTranslation();

  return (
    <main className="b2b-page">
      <SEO 
        title="Insights y tendencias tecnológicas | Grupo Hormesis"
        description="Artículos, análisis y guías estratégicas sobre inteligencia artificial aplicada, optimización operativa y arquitectura de software para empresas."
        canonical="/insights"
        ogImage="https://grupohormesis.com/insights_hero_mockup.jpg"
      />
      {/* Featured Hero Article */}
      <section className="hero-article-section container b2b-py-20 relative z-10">
        <div className="hero-article-card animate-fade-in">
          <img 
            src="/insights_hero_mockup.jpg" 
            alt="Inteligencia Artificial y Arquitectura de Software Estratégica" 
            className="hero-article-bg" 
            loading="lazy"
            decoding="async"
          />
          <div className="hero-article-overlay"></div>
          
          <div className="hero-article-content">
            <div className="badge glass-badge mb-6 inline-flex items-center" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
              {t('insights.hero_badge')}
            </div>
            
            <div className="article-meta">
              <span className="category-tag">{t('insights.hero_category')}</span>
              <span className="read-time"><Clock size={16} /> {t('insights.hero_read_time')}</span>
            </div>
            
            <h1>{t('insights.hero_title')}</h1>
            <p>{t('insights.hero_subtitle')}</p>
            
            <Link to="/insights/el-estado-de-la-ia" className="btn-primary inline-flex items-center">
              {t('insights.hero_btn')} <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Articles Grid */}
      <section className="latest-articles-section b2b-py-20">
        <div className="container relative z-10">
          <h2 className="b2b-section-title mb-12" style={{ textAlign: 'left' }}>
            {t('insights.latest_title')}
          </h2>

          <div className="articles-grid">
            {/* Article 1 */}
            <div className="article-card animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <img 
                src="/insights_article1_mockup.jpg" 
                alt="Toma de Decisiones Estratégicas Basadas en Datos y Analítica Avanzada" 
                className="article-image" 
                loading="lazy" 
                decoding="async" 
              />
              <div className="article-card-content">
                <div className="article-meta">
                  <span className="category-tag" style={{ background: 'transparent', padding: 0, border: 'none' }}>{t('insights.article1_category')}</span>
                  <span className="read-time" style={{ color: '#64748b' }}><Clock size={14} /> {t('insights.article1_read_time')}</span>
                </div>
                <h3>{t('insights.article1_title')}</h3>
                <p>{t('insights.article1_desc')}</p>
                <Link to="/insights/toma-de-decisiones-datos" className="read-more-link">
                  {t('insights.read_more')} <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>

            {/* Article 2 */}
            <div className="article-card animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <img 
                src="/insights_article2_mockup.jpg" 
                alt="Arquitectura Cloud Moderna y Modernización de Sistemas Monolíticos" 
                className="article-image" 
                loading="lazy" 
                decoding="async" 
              />
              <div className="article-card-content">
                <div className="article-meta">
                  <span className="category-tag" style={{ background: 'transparent', padding: 0, border: 'none' }}>{t('insights.article2_category')}</span>
                  <span className="read-time" style={{ color: '#64748b' }}><Clock size={14} /> {t('insights.article2_read_time')}</span>
                </div>
                <h3>{t('insights.article2_title')}</h3>
                <p>{t('insights.article2_desc')}</p>
                <Link to="/insights/el-fin-de-los-monolitos" className="read-more-link">
                  {t('insights.read_more')} <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>

            {/* Article 3 */}
            <div className="article-card animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <img 
                src="/ai_mockup.jpg" 
                alt="Ciberseguridad e Inteligencia Artificial Autónoma en Entornos Empresariales" 
                className="article-image" 
                loading="lazy" 
                decoding="async" 
              />
              <div className="article-card-content">
                <div className="article-meta">
                  <span className="category-tag" style={{ background: 'transparent', padding: 0, border: 'none' }}>{t('insights.article3_category')}</span>
                  <span className="read-time" style={{ color: '#64748b' }}><Clock size={14} /> {t('insights.article3_read_time')}</span>
                </div>
                <h3>{t('insights.article3_title')}</h3>
                <p>{t('insights.article3_desc')}</p>
                <Link to="/insights/seguridad-ia-autonoma" className="read-more-link">
                  {t('insights.read_more')} <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscribe */}
      <section className="newsletter-section b2b-py-20">
        <div className="container relative z-10">
          <div className="newsletter-box animate-fade-in-up">
            <Mail size={48} className="text-emerald mx-auto mb-6" />
            <h2 className="b2b-section-title" style={{ color: 'white' }}>
              {t('insights.newsletter_title')}
            </h2>
            <p className="b2b-section-subtitle text-slate-300 mx-auto" style={{ maxWidth: '500px' }}>
              {t('insights.newsletter_desc')}
            </p>
            
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder={t('insights.newsletter_placeholder')} 
                className="newsletter-input" 
                required 
              />
              <button type="submit" className="btn-primary">
                {t('insights.newsletter_btn')}
              </button>
            </form>
          </div>
        </div>
      </section>

    </main>
  );
}
