import { ArrowRight, Code, Terminal, Server, Shield, Database, LayoutTemplate, Bug, Rocket, AppWindow, Smartphone, Cpu, Cloud } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "../../components/SEO";
import "./b2b.css";
import "./desarrollo.css";

export default function Desarrollo() {
  const { t } = useTranslation();

  return (
    <main className="desarrollo-page b2b-page">
      <SEO 
        title="Desarrollo de Software & Arquitectura Cloud a Medida | Grupo Hormesis"
        description="Ingeniería de software de alta gama, microservicios resilientes, arquitecturas modernas y aplicaciones escalables."
        canonical="/soluciones/desarrollo"
        ogImage="https://grupohormesis.com/api_integration_mockup.jpg"
      />
      {/* Asymmetric Hero Section */}
      <section className="dev-hero-async">
        <div className="dev-hero-bg-slate"></div>
        
        <div className="container relative z-10">
          <div className="dev-hero-grid">
            {/* Left: Copy & CTA */}
            <div className="dev-hero-content animate-fade-in-up">
              <div className="badge glass-badge mb-6" style={{display: 'inline-flex'}}>
                <Code size={14} className="inline-icon mr-2" />
                {t('desarrollo.hero_badge')}
              </div>
              <h1 className="b2b-title text-left">
                {t('desarrollo.hero_title_1')}<br />
                <span className="text-emerald">{t('desarrollo.hero_title_2')}</span>
              </h1>
              <p className="b2b-subtitle text-left ml-0 b2b-mb-8">
                {t('desarrollo.hero_subtitle')}
              </p>
              
              <div className="dev-hero-actions">
                <Link to="/contacto?solucion=desarrollo" className="btn-primary btn-lg btn-shadow">
                  {t('desarrollo.btn_primary')} <ArrowRight size={18} />
                </Link>
                <div className="b2b-trust-badge" style={{marginTop: 0}}>
                  <span className="stars">★★★★★</span>
                  <span className="trust-text">{t('desarrollo.trust_badge')}</span>
                </div>
              </div>
            </div>

            {/* Right: Code Editor Mockup */}
            <div className="dev-hero-visual animate-fade-in" style={{animationDelay: '300ms'}}>
              <div className="code-editor-mockup premium-glass">
                <div className="editor-header">
                  <div className="mac-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                  </div>
                  <div className="editor-title">core_architecture.ts</div>
                </div>
                <div className="editor-body">
                  <pre>
                    <code>
<span className="syntax-keyword">import</span> {'{'} <span className="syntax-entity">HormesisEngine</span> {'}'} <span className="syntax-keyword">from</span> <span className="syntax-string">'@core/system'</span>;
<br/><br/>
<span className="syntax-comment">// Initialize Enterprise Cluster</span><br/>
<span className="syntax-keyword">const</span> <span className="syntax-variable">app</span> = <span className="syntax-keyword">new</span> <span className="syntax-entity">HormesisEngine</span>({'{'}<br/>
{'  '}scalability: <span className="syntax-string">'auto'</span>,<br/>
{'  '}securityLevel: <span className="syntax-string">'military-grade'</span>,<br/>
{'  '}performance: <span className="syntax-string">'extreme'</span><br/>
{'}'});<br/><br/>
<span className="syntax-keyword">await</span> app.<span className="syntax-entity">deploy</span>(); <span className="syntax-comment">// Ready to dominate</span>
                    </code>
                  </pre>
                </div>
              </div>
              
              {/* Floating nodes around editor */}
              <div className="dev-float-node node-1 premium-glass">
                <Server size={14} className="text-emerald" /> <span>AWS Cluster</span>
              </div>
              <div className="dev-float-node node-2 premium-glass">
                <Database size={14} className="text-emerald" /> <span>PostgreSQL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Marquee */}
      <section className="dev-integrations b2b-py-12 border-y border-dark-subtle">
        <div className="b2b-micro-title text-emerald-light mb-8">{t('desarrollo.stack_title')}</div>
        <div className="marquee-container">
          <div className="marquee-content fast">
            {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Python', 'Redis', 'Next.js', 'GraphQL', 'Tailwind', 'Go'].map((tech, i) => (
              <div key={i} className="integration-tag premium-glass">
                {tech}
              </div>
            ))}
          </div>
          <div className="marquee-content fast" aria-hidden="true">
            {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Python', 'Redis', 'Next.js', 'GraphQL', 'Tailwind', 'Go'].map((tech, i) => (
              <div key={`dup-${i}`} className="integration-tag premium-glass">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zig-Zag Features */}
      <section className="dev-zigzag b2b-py-20">
        <div className="container">
          <div className="b2b-mb-16">
            <h2 className="b2b-section-title">{t('desarrollo.features_title')}</h2>
            <p className="b2b-section-subtitle">{t('desarrollo.features_desc')}</p>
          </div>

          <div className="zigzag-row">
            <div className="zz-content">
              <div className="zz-icon"><Rocket size={32} className="text-emerald" /></div>
              <h3>{t('desarrollo.feature1_title')}</h3>
              <p>{t('desarrollo.feature1_desc')}</p>
            </div>
            <div className="zz-visual">
              <div className="mock-chart premium-glass">
                <div className="mock-chart-bg"></div>
                <div className="chart-bar h-20"><div className="chart-value">10k</div></div>
                <div className="chart-bar h-40"><div className="chart-value">50k</div></div>
                <div className="chart-bar h-70 bg-emerald"><div className="chart-value">500k</div></div>
                <div className="chart-bar h-100 bg-emerald-glow"><div className="chart-value">1M+</div></div>
              </div>
            </div>
          </div>

          <div className="zigzag-row reverse">
            <div className="zz-content">
              <div className="zz-icon"><Shield size={32} className="text-emerald" /></div>
              <h3>{t('desarrollo.feature2_title')}</h3>
              <p>{t('desarrollo.feature2_desc')}</p>
            </div>
            <div className="zz-visual">
              <div className="mock-shield premium-glass flex items-center justify-center">
                 <div className="mock-shield-bg"></div>
                 
                 {/* Background logs to fill space */}
                 <div className="shield-logs">
                   <div className="s-log"><span>[SYS]</span> Intrusion detected... <span>BLOCKED</span></div>
                   <div className="s-log"><span>[AUTH]</span> 2FA Token validated</div>
                   <div className="s-log"><span>[NET]</span> DDoS mitigation active</div>
                   <div className="s-log"><span>[DB]</span> Payload encrypted (AES-256)</div>
                 </div>

                 <div className="shield-core">
                   <Shield size={70} className="text-emerald" />
                   <div className="shield-pulse"></div>
                 </div>
                 
                 <div className="shield-ring"></div>
                 <div className="shield-ring reverse"></div>
                 
                 <div className="shield-status">Secure Env</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core Expertise Section */}
      <section className="dev-expertise-section b2b-py-20">
        <div className="container">
          <div className="text-center b2b-mb-16">
            <div className="b2b-micro-title text-emerald-light mb-4">{t('desarrollo.expertise_tag')}</div>
            <h2 className="b2b-section-title text-white">{t('desarrollo.expertise_title')}</h2>
            <p className="b2b-section-subtitle mx-auto text-center" style={{ maxWidth: '600px' }}>
              {t('desarrollo.expertise_desc')}
            </p>
          </div>

          <div className="expertise-grid">
            <div className="expertise-card">
              <div className="expertise-icon-wrap">
                <AppWindow size={24} />
              </div>
              <h3>{t('desarrollo.exp1_title')}</h3>
              <p>{t('desarrollo.exp1_desc')}</p>
            </div>
            
            <div className="expertise-card">
              <div className="expertise-icon-wrap">
                <Smartphone size={24} />
              </div>
              <h3>{t('desarrollo.exp2_title')}</h3>
              <p>{t('desarrollo.exp2_desc')}</p>
            </div>

            <div className="expertise-card">
              <div className="expertise-icon-wrap">
                <Cpu size={24} />
              </div>
              <h3>{t('desarrollo.exp3_title')}</h3>
              <p>{t('desarrollo.exp3_desc')}</p>
            </div>

            <div className="expertise-card">
              <div className="expertise-icon-wrap">
                <Cloud size={24} />
              </div>
              <h3>{t('desarrollo.exp4_title')}</h3>
              <p>{t('desarrollo.exp4_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Agile Kanban Process */}
      <section className="dev-kanban-section b2b-py-20">
        <div className="container">
          <div className="b2b-micro-title text-emerald-light">{t('desarrollo.kanban_title')}</div>
          <h2 className="b2b-section-title b2b-mb-16 text-white">{t('desarrollo.kanban_subtitle')}</h2>
          
          <div className="kanban-board">
            <div className="kanban-column">
              <div className="kb-header border-b border-dark-subtle">
                <LayoutTemplate size={16} /> <span>1. Arquitectura</span>
              </div>
              <div className="kb-card">
                <p>Levantamiento de requisitos</p>
                <span className="kb-tag">UX/UI</span>
              </div>
              <div className="kb-card">
                <p>Diseño de Base de Datos</p>
                <span className="kb-tag">Backend</span>
              </div>
            </div>

            <div className="kanban-column">
              <div className="kb-header border-b text-emerald">
                <Terminal size={16} /> <span>2. Sprints de Dev</span>
              </div>
              <div className="kb-card active-card">
                <p>Desarrollo Iterativo</p>
                <div className="kb-progress">
                  <div className="progress-bar" style={{width: '60%'}}></div>
                </div>
              </div>
              <div className="kb-card">
                <p>Entregas funcionales semanales</p>
              </div>
            </div>

            <div className="kanban-column">
              <div className="kb-header border-b border-dark-subtle">
                <Bug size={16} /> <span>3. QA & Stress</span>
              </div>
              <div className="kb-card">
                <p>Auditoría de código y seguridad</p>
              </div>
              <div className="kb-card">
                <p>Simulación de tráfico masivo</p>
                <span className="kb-tag warning">Load Test</span>
              </div>
            </div>

            <div className="kanban-column">
              <div className="kb-header border-b text-emerald-light">
                <Rocket size={16} /> <span>4. Despliegue</span>
              </div>
              <div className="kb-card done">
                <p>Lanzamiento a Producción</p>
                <span className="kb-tag success">Deployed</span>
              </div>
              <div className="kb-card done">
                <p>Monitoreo 24/7 (Uptime)</p>
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
              <h2>{t('desarrollo.cta_title')}</h2>
              <p>{t('desarrollo.cta_desc')}</p>
            </div>
            <div className="cta-dark-action">
              <Link to="/contacto?solucion=desarrollo" className="btn-primary btn-lg">
                {t('desarrollo.btn_primary')} <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
