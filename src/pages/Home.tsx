import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Activity, Shield, Code2, Layers, Coffee, Zap, Bot, Users, Cloud, Smartphone, ChevronDown, Code, BarChart, Settings, BookOpen, Map, Globe, CheckCircle2, ArrowUpRight, Search, Bell, PieChart, Database } from 'lucide-react';
import { HormesisNetwork } from '../components/HormesisNetwork';
import "./page.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function Home() {
  const { t } = useTranslation();
  const [activeExpTab, setActiveExpTab] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <main className="main-content">
      {/* ==================== HERO SECTION ==================== */}
      <section 
        className="hero-section" 
        style={{ position: 'relative', overflow: 'hidden' }}
        onMouseMove={handleMouseMove}
      >
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            maskImage: 'radial-gradient(circle 300px at var(--mouse-x, -500px) var(--mouse-y, -500px), black 0%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle 300px at var(--mouse-x, -500px) var(--mouse-y, -500px), black 0%, transparent 100%)',
            transition: 'mask-position 0.1s ease-out, -webkit-mask-position 0.1s ease-out',
          }}
        >
          <HormesisNetwork />
        </div>
        <div className="glowing-orbs-container">
          <div className="glowing-orb orb-1"></div>
          <div className="glowing-orb orb-2"></div>
          <div className="glowing-orb orb-3"></div>
        </div>
        <div className="hero-container">
          
          {/* Kicker Pill */}
          <div className="kicker-pill animate-fade-in">
            <span className="live-dot"></span>
            <span className="kicker-text uppercase font-semibold">{t('hero.kicker_text')}</span>
            <span className="kicker-divider">|</span>
            <span className="kicker-link">
              {t('hero.kicker_link')} <ArrowUpRight size={14} />
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-title animate-fade-in" style={{ animationDelay: "100ms" }}>
            {t('hero.title_1')} <span className="underline-emerald">{t('hero.title_2')}</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle animate-fade-in" style={{ animationDelay: "200ms" }}>
            {t('hero.subtitle')}
          </p>

          {/* CTAs */}
          <div className="hero-cta animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Link href="#briefing" className="btn-primary btn-lg btn-shadow">
              <Zap size={18} />
              {t('hero.btn_primary')}
            </Link>
            <Link href="#telemetry-console" className="btn-secondary btn-lg">
              <BarChart size={18} />
              {t('hero.btn_secondary')}
            </Link>
          </div>

          {/* Metric Fast Rails */}
          <div className="metrics-fast-rails animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="metric-rail-card">
              <div className="metric-rail-title">{t('hero.metric1_title')}</div>
              <div className="metric-rail-value">{t('hero.metric1_value')}</div>
              <div className="metric-rail-desc">{t('hero.metric1_desc')}</div>
            </div>
            <div className="metric-rail-card">
              <div className="metric-rail-title">{t('hero.metric2_title')}</div>
              <div className="metric-rail-value">{t('hero.metric2_value')}</div>
              <div className="metric-rail-desc">{t('hero.metric2_desc')}</div>
            </div>
            <div className="metric-rail-card">
              <div className="metric-rail-title">{t('hero.metric3_title')}</div>
              <div className="metric-rail-value">{t('hero.metric3_value')}</div>
              <div className="metric-rail-desc">{t('hero.metric3_desc')}</div>
            </div>
            <div className="metric-rail-card">
              <div className="metric-rail-title">{t('hero.metric4_title')}</div>
              <div className="metric-rail-value">{t('hero.metric4_value')}</div>
              <div className="metric-rail-desc">{t('hero.metric4_desc')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ANIMATED UI SHOWCASE ==================== */}
      <section className="ui-showcase-section">
        <div className="container relative">
          <div className="showcase-perspective">
            
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              
              {/* Layer 1: CRM Desktop App */}
              <motion.div 
                className="showcase-layer layer-crm"
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
              <div className="crm-mock-browser glass-panel">
                <div className="mock-browser-header">
                  <div className="mock-dots"><span/><span/><span/></div>
                  <div className="mock-search"><Search size={12} /> <span className="search-text">{t('showcase.search')}</span></div>
                  <div className="mock-header-actions">
                    <Bell size={14} className="text-muted" />
                    <div className="mock-avatar-sm">GH</div>
                  </div>
                </div>
                <div className="crm-mock-body">
                  <div className="crm-sidebar">
                    <div className="crm-brand"><PieChart size={16} className="text-emerald" /> {t('showcase.crm_title')}</div>
                    <div className="crm-menu">
                      <div className="crm-menu-item active"><Activity size={12}/> {t('showcase.dashboard')}</div>
                      <div className="crm-menu-item"><Users size={12}/> {t('showcase.contacts')}</div>
                      <div className="crm-menu-item"><BarChart size={12}/> {t('showcase.sales')}</div>
                      <div className="crm-menu-item"><Cloud size={12}/> Integrations</div>
                    </div>
                  </div>
                  <div className="crm-content">
                    <div className="crm-metrics">
                      <div className="crm-metric-card">
                        <div className="crm-m-label">{t('showcase.revenue')} <span className="trend-up">+14%</span></div>
                        <div className="crm-m-val-container">
                          <span className="crm-m-val val-old">{t('showcase.rev_val')}</span>
                          <span className="crm-m-val val-new text-emerald">$162,500</span>
                        </div>
                        <div className="crm-fake-chart">
                          <div className="fake-bar" style={{height: "40%"}}></div>
                          <div className="fake-bar" style={{height: "60%"}}></div>
                          <div className="fake-bar" style={{height: "50%"}}></div>
                          <div className="fake-bar" style={{height: "80%"}}></div>
                          <div className="fake-bar" style={{height: "70%"}}></div>
                          <div className="fake-bar" style={{height: "90%"}}></div>
                          <div className="fake-bar spike-bar" style={{height: "10%"}}></div>
                        </div>
                      </div>
                      <div className="crm-metric-card">
                        <div className="crm-m-label">{t('showcase.active_deals')}</div>
                        <div className="crm-m-val">{t('showcase.deals_val')}</div>
                        <div className="crm-fake-lines">
                          <div className="fake-line w-full"></div>
                          <div className="fake-line w-3-4"></div>
                          <div className="fake-line w-1-2"></div>
                        </div>
                      </div>
                    </div>
                    <div className="crm-table">
                      <div className="crm-t-header">
                        <span>{t('showcase.col_name')}</span>
                        <span>{t('showcase.col_status')}</span>
                        <span>{t('showcase.col_value')}</span>
                        <span>Asignado</span>
                      </div>
                      <div className="crm-t-row crm-new-row">
                        <div className="flex-center-gap"><div className="crm-avatar bg-emerald"><Bot size={12}/></div> AI Auto-Retention</div>
                        <span className="crm-badge-green">Activo</span>
                        <span className="font-mono text-xs font-bold text-emerald">+$42,500</span>
                        <div className="crm-avatar-sm">AI</div>
                      </div>
                      <div className="crm-t-row">
                        <div className="flex-center-gap"><div className="crm-avatar" style={{background: '#3b82f6'}}>D</div> DataSync Enterprise</div>
                        <span className="crm-badge-green">Cerrado</span>
                        <span className="font-mono text-xs font-bold text-gray-700">$12,450</span>
                        <div className="crm-avatar-sm">WH</div>
                      </div>
                      <div className="crm-t-row">
                        <div className="flex-center-gap"><div className="crm-avatar" style={{background: '#f97316'}}>N</div> Nexus Cloud API</div>
                        <span className="crm-badge-orange">Negociación</span>
                        <span className="font-mono text-xs font-bold text-gray-700">$64,000</span>
                        <div className="crm-avatar-sm">GH</div>
                      </div>
                      <div className="crm-t-row">
                        <div className="flex-center-gap"><div className="crm-avatar" style={{background: '#8b5cf6'}}>F</div> Fintech Cloud Sub</div>
                        <span className="crm-badge-gray">Pendiente</span>
                        <span className="font-mono text-xs font-bold text-gray-700">$32,100</span>
                        <div className="crm-avatar-sm">WH</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Layer 2: Mobile App */}
            <motion.div 
              className="showcase-layer layer-mobile"
              initial={{ opacity: 0, y: 150 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mock-phone">
                <div className="phone-buttons"></div>
                <div className="phone-notch"></div>
                <div className="phone-notification">
                  <div className="notif-icon bg-emerald"><ArrowRight size={10} color="white" style={{transform:'rotate(-45deg)'}}/></div>
                  <div className="notif-content">
                    <div className="notif-title">Nuevo Ingreso IA</div>
                    <div className="notif-desc">+$42,500 de la campaña.</div>
                  </div>
                </div>
                <div className="phone-header">
                  <span className="font-bold tracking-tight">{t('showcase.mob_title')}</span>
                  <div className="phone-user-icon"></div>
                </div>
                <div className="phone-body">
                  <div className="phone-card gradient-card">
                    <div className="text-xs opacity-80 mb-1">{t('showcase.mob_today')}</div>
                    <div className="text-3xl font-bold tracking-tight mb-3 mob-val-container">
                      <span className="mob-val-old">{t('showcase.mob_val')}</span>
                      <span className="mob-val-new">$54,500</span>
                    </div>
                    <div className="phone-card-graph">
                      <svg viewBox="0 0 100 30" className="w-full">
                        <path d="M0 30 Q 20 20, 40 25 T 80 10 T 100 5 L 100 30 L 0 30 Z" fill="rgba(255,255,255,0.2)"/>
                        <path d="M0 30 Q 20 20, 40 25 T 80 10 T 100 5" fill="none" stroke="white" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="phone-list-title">Transacciones</div>
                  <div className="phone-list">
                    <div className="phone-list-item">
                      <ArrowUpRight size={14} className="text-emerald" /> 
                      <div style={{flex: 1}}>
                        <div>API Gateway</div>
                        <div style={{fontSize: '9px', color: '#9ca3af', fontWeight: 400}}>Suscripción Anual</div>
                      </div>
                      <div className="text-emerald font-mono">+$4,200</div>
                    </div>
                    <div className="phone-list-item">
                      <Database size={14} className="text-gray-400" /> 
                      <div style={{flex: 1}}>
                        <div>AWS Enterprise</div>
                        <div style={{fontSize: '9px', color: '#9ca3af', fontWeight: 400}}>Servicios Cloud</div>
                      </div>
                      <div className="font-mono text-gray-400">-$840</div>
                    </div>
                    <div className="phone-list-item">
                      <ArrowUpRight size={14} className="text-emerald" /> 
                      <div style={{flex: 1}}>
                        <div>DataSync Ent.</div>
                        <div style={{fontSize: '9px', color: '#9ca3af', fontWeight: 400}}>Factura #1042</div>
                      </div>
                      <div className="text-emerald font-mono">+$12,000</div>
                    </div>
                  </div>
                </div>
                <div className="phone-home-bar"></div>
              </div>
            </motion.div>

            {/* Layer 3: AI Widget */}
            <motion.div 
              className="showcase-layer layer-widget"
              initial={{ opacity: 0, x: -60, y: 60 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mock-ai-widget glass-panel-strong">
                <div className="ai-widget-header">
                  <div className="crm-avatar bg-emerald" style={{width: 24, height: 24}}><Bot size={14}/></div>
                  <div style={{flex: 1, fontWeight: 700, fontSize: '13px', color: '#09090b'}}>Predictive AI</div>
                  <span style={{fontSize: '9px', color: '#d97706', background: '#fffbeb', padding: '2px 6px', borderRadius: 4, fontWeight: 700}}>ALERTA</span>
                </div>
                <div className="ai-widget-text">
                  He detectado una anomalía en la tasa de retención del Q3. ¿Deseas que ejecute el protocolo de mitigación predictivo?
                </div>
                <div style={{display: 'flex', gap: '8px'}}>
                  <button className="ai-widget-btn" style={{background: '#f4f4f5', color: '#09090b', flex: 1, justifyContent: 'center'}}>Ignorar</button>
                  <button className="ai-widget-btn" style={{flex: 1, justifyContent: 'center'}}>Ejecutar <Zap size={10} style={{marginLeft: 4}}/></button>
                </div>
              </div>
            </motion.div>

            {/* Fake Mouse Cursor for Interactions */}
            <div className="fake-cursor">
              <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L8.5 28.5L12 17.5L22.5 13L1 1Z" fill="#1b1c19" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>

            </div>
          </div>
        </div>
      </section>

      {/* ==================== TRUST BANNER / LOGOS ==================== */}
      <div className="trust-banner animate-fade-in" style={{ animationDelay: "500ms" }}>
        <div className="trust-content container">
          <div className="trust-label">
            <span className="trust-icon">🔒</span>
            <span>{t('hero.trust_text')}</span>
          </div>
          <div className="trust-logos">
            <span>FINTEC_CONSORTIUM</span>
            <span>SOVEREIGN_VAULT</span>
            <span>APEX_TELEMETRY</span>
            <span>ORBITAL_CLOUD</span>
          </div>
        </div>
      </div>
      {/* ==================== RAMP-STYLE BENTO GRID ==================== */}
      <section className="bento-section" id="bento">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-tag">{t('bento.tag')}</div>
              <h2 className="section-title">{t('bento.title')}</h2>
            </div>
            <div className="status-indicator">
              <span className="live-dot"></span>
              <span>{t('bento.status')}</span>
            </div>
          </div>

          <div className="bento-grid">
            {/* Card 1: 8 Columns Main Interactive Ledger Showcase */}
            <div className="bento-card col-span-8 overflow-hidden relative">
              <div className="card-top-line">
                <div className="card-top-progress animate-pulse"></div>
              </div>
              <div className="card-header border-bottom">
                <div className="flex-center-gap">
                  <span className="badge-primary">{t('bento.mod1_badge')}</span>
                  <h3 className="card-title">{t('bento.mod1_title')}</h3>
                </div>
                <div className="flex-center-gap">
                  <span className="badge-outline">{t('bento.mod1_tag1')}</span>
                  <span className="badge-secondary">{t('bento.mod1_tag2')}</span>
                </div>
              </div>

              {/* Telemetry Graph Simulation */}
              <div className="telemetry-box">
                <div className="telemetry-header">
                  <div>
                    <span className="telemetry-label">{t('bento.mod1_metric_label')}</span>
                    <div className="telemetry-value">
                      {t('bento.mod1_metric_value')} <span className="telemetry-sub">{t('bento.mod1_metric_sub')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="telemetry-badge">
                      ✓ {t('bento.mod1_invariant')}
                    </span>
                    <div className="telemetry-desc mt-1">{t('bento.mod1_lag')}</div>
                  </div>
                </div>
                
                {/* Bar Chart Simulation */}
                <div className="chart-container">
                  {[40, 50, 30, 60, 70, 40, 55, 75, 50, 55, 65, 40, 30, 60, 100, 55, 50, 65, 40, 60, 30, 25, 55, 70].map((h, i) => (
                    <div key={i} className={`chart-bar ${h === 100 ? 'chart-bar-peak' : ''}`} style={{ height: `${h}%` }}></div>
                  ))}
                </div>

                <div className="telemetry-footer">
                  <span>{t('bento.mod1_footer_t1')}</span>
                  <span>{t('bento.mod1_footer_t2')}</span>
                  <span>{t('bento.mod1_footer_t3')}</span>
                </div>
              </div>

              {/* Ledger Rows */}
              <div className="ledger-rows">
                <div className="ledger-row">
                  <div className="flex-center-gap"><span className="dot-secondary"></span> <span className="font-semibold">{t('bento.mod1_ledger1_title')}</span></div>
                  <span className="text-muted hidden-mobile">{t('bento.mod1_ledger1_sub')}</span>
                  <span className="font-bold">{t('bento.mod1_ledger1_val')}</span>
                  <span className="text-emerald font-semibold">{t('bento.mod1_ledger1_stat')}</span>
                </div>
                <div className="ledger-row">
                  <div className="flex-center-gap"><span className="dot-secondary"></span> <span className="font-semibold">{t('bento.mod1_ledger2_title')}</span></div>
                  <span className="text-muted hidden-mobile">{t('bento.mod1_ledger2_sub')}</span>
                  <span className="font-bold">{t('bento.mod1_ledger2_val')}</span>
                  <span className="text-emerald font-semibold">{t('bento.mod1_ledger2_stat')}</span>
                </div>
              </div>

              <div className="card-footer border-top mt-4 pt-4">
                <span className="text-sm text-muted">{t('bento.mod1_desc')}</span>
                <button className="link-primary">{t('bento.mod1_link')} <ArrowRight size={14}/></button>
              </div>
            </div>

            {/* Card 2: 4 Columns Deterministic Verification */}
            <div className="bento-card col-span-4">
              <div className="flex-between pb-3 border-bottom mb-4">
                <span className="badge-gray">{t('bento.mod2_badge')}</span>
                <Bot className="text-muted" size={18} />
              </div>
              <h3 className="card-title mb-2">{t('bento.mod2_title')}</h3>
              <p className="text-sm text-muted mb-6">{t('bento.mod2_desc')}</p>
              
              <div className="checklist-group">
                <div className="checklist-item">
                  <Zap className="text-emerald shrink-0" size={16} />
                  <div>
                    <div className="font-semibold">{t('bento.mod2_l1_title')}</div>
                    <div className="text-xs text-muted">{t('bento.mod2_l1_desc')}</div>
                  </div>
                </div>
                <div className="checklist-item">
                  <Zap className="text-emerald shrink-0" size={16} />
                  <div>
                    <div className="font-semibold">{t('bento.mod2_l2_title')}</div>
                    <div className="text-xs text-muted">{t('bento.mod2_l2_desc')}</div>
                  </div>
                </div>
                <div className="checklist-item">
                  <Zap className="text-emerald shrink-0" size={16} />
                  <div>
                    <div className="font-semibold">{t('bento.mod2_l3_title')}</div>
                    <div className="text-xs text-muted">{t('bento.mod2_l3_desc')}</div>
                  </div>
                </div>
              </div>
              
              <div className="card-footer border-top mt-6 pt-4 text-xs font-mono text-muted uppercase">
                {t('bento.mod2_footer')}
              </div>
            </div>

            {/* Card 3: 4 Columns Principal Architecture Pods */}
            <div className="bento-card col-span-4">
              <div className="flex-between pb-3 border-bottom mb-4">
                <span className="badge-gray">{t('bento.mod3_badge')}</span>
                <Users className="text-muted" size={18} />
              </div>
              <h3 className="card-title mb-2">{t('bento.mod3_title')}</h3>
              <p className="text-sm text-muted mb-6">{t('bento.mod3_desc')}</p>
              
              <div className="stats-box">
                <div className="flex-between text-xs font-mono">
                  <span className="text-muted">{t('bento.mod3_ratio')}</span>
                  <span className="font-bold">{t('bento.mod3_ratio_val')}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill w-full"></div>
                </div>
                <div className="flex-between text-xs font-mono">
                  <span className="text-muted">{t('bento.mod3_managers')}</span>
                  <span className="font-bold">{t('bento.mod3_managers_val')}</span>
                </div>
                <div className="flex-between text-xs font-mono">
                  <span className="text-muted">{t('bento.mod3_sla')}</span>
                  <span className="font-bold text-emerald">{t('bento.mod3_sla_val')}</span>
                </div>
              </div>
              
              <div className="card-footer border-top mt-6 pt-4 text-xs font-mono uppercase font-bold">
                {t('bento.mod3_footer')}
              </div>
            </div>

            {/* Card 4: 8 Columns Enterprise Cloud Systematization */}
            <div className="bento-card col-span-8">
              <div className="flex-between pb-3 border-bottom mb-4">
                <span className="badge-gray">{t('bento.mod4_badge')}</span>
                <span className="text-xs font-mono text-emerald font-bold">{t('bento.mod4_tag')}</span>
              </div>
              <div className="grid-2col">
                <div>
                  <h3 className="card-title mb-2">{t('bento.mod4_title')}</h3>
                  <p className="text-sm text-muted mb-4">{t('bento.mod4_desc')}</p>
                  <ul className="bullet-list text-sm">
                    <li><span className="dot-secondary"></span> {t('bento.mod4_l1')}</li>
                    <li><span className="dot-secondary"></span> {t('bento.mod4_l2')}</li>
                    <li><span className="dot-secondary"></span> {t('bento.mod4_l3')}</li>
                  </ul>
                </div>
                <div className="ontology-box">
                  <div className="flex-between pb-2 border-bottom text-muted text-xs font-mono mb-2">
                    <span>{t('bento.mod4_col1')}</span>
                    <span>{t('bento.mod4_col2')}</span>
                  </div>
                  <div className="ontology-row">
                    <span>{t('bento.mod4_row1')}</span>
                    <span className="text-emerald font-semibold">{t('bento.mod4_row1_stat')}</span>
                  </div>
                  <div className="ontology-row">
                    <span>{t('bento.mod4_row2')}</span>
                    <span className="text-emerald font-semibold">{t('bento.mod4_row2_stat')}</span>
                  </div>
                  <div className="ontology-row">
                    <span>{t('bento.mod4_row3')}</span>
                    <span className="text-emerald font-semibold">{t('bento.mod4_row3_stat')}</span>
                  </div>
                </div>
              </div>
              <div className="card-footer border-top mt-6 pt-4">
                <span className="text-sm text-muted">{t('bento.mod4_footer')}</span>
                <Cloud className="text-muted" size={18} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== IMPACT SECTION ==================== */}
      <section className="impact-section" id="impact">
        <div className="container">
          <div className="impact-header text-center mb-10">
            <div className="section-tag mx-auto">{t('impact.tag')}</div>
            <h2 className="section-title mt-2">{t('impact.title')}</h2>
            <p className="text-muted mt-2 max-w-2xl mx-auto">{t('impact.desc')}</p>
          </div>
          <div className="impact-grid">
            <div className="impact-card">
              <div>
                <div className="impact-tag">{t('impact.m1_title')}</div>
                <div className="impact-value">{t('impact.m1_val')}</div>
              </div>
              <p className="impact-desc">{t('impact.m1_desc')}</p>
            </div>
            <div className="impact-card">
              <div>
                <div className="impact-tag">{t('impact.m2_title')}</div>
                <div className="impact-value">{t('impact.m2_val')}</div>
              </div>
              <p className="impact-desc">{t('impact.m2_desc')}</p>
            </div>
            <div className="impact-card">
              <div>
                <div className="impact-tag">{t('impact.m3_title')}</div>
                <div className="impact-value">{t('impact.m3_val')}</div>
              </div>
              <p className="impact-desc">{t('impact.m3_desc')}</p>
            </div>
            <div className="impact-card">
              <div>
                <div className="impact-tag">{t('impact.m4_title')}</div>
                <div className="impact-value">{t('impact.m4_val')}</div>
              </div>
              <p className="impact-desc">{t('impact.m4_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FRAMEWORK SECTION ==================== */}
      <section className="framework-section" id="framework">
        <div className="container">
          <div className="mb-12 max-w-3xl">
            <div className="section-tag">{t('framework.tag')}</div>
            <h2 className="section-title mt-2">{t('framework.title')}</h2>
            <p className="text-muted mt-2">{t('framework.desc')}</p>
          </div>
          <div className="framework-grid">
            <div className="framework-card hover-shimmer">
              <div className="framework-tag">{t('framework.p1_tag')}</div>
              <h3 className="framework-title">{t('framework.p1_title')}</h3>
              <p className="framework-desc">{t('framework.p1_desc')}</p>
              <div className="framework-deliv">{t('framework.p1_deliv')}</div>
            </div>
            <div className="framework-card hover-shimmer">
              <div className="framework-tag">{t('framework.p2_tag')}</div>
              <h3 className="framework-title">{t('framework.p2_title')}</h3>
              <p className="framework-desc">{t('framework.p2_desc')}</p>
              <div className="framework-deliv">{t('framework.p2_deliv')}</div>
            </div>
            <div className="framework-card hover-shimmer">
              <div className="framework-tag">{t('framework.p3_tag')}</div>
              <h3 className="framework-title">{t('framework.p3_title')}</h3>
              <p className="framework-desc">{t('framework.p3_desc')}</p>
              <div className="framework-deliv">{t('framework.p3_deliv')}</div>
            </div>
            <div className="framework-card hover-shimmer">
              <div className="framework-tag">{t('framework.p4_tag')}</div>
              <h3 className="framework-title">{t('framework.p4_title')}</h3>
              <p className="framework-desc">{t('framework.p4_desc')}</p>
              <div className="framework-deliv">{t('framework.p4_deliv')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== EXPERIENCE SECTION ==================== */}
      <section className="experience-section" id="experience">
        <div className="container">
          <div className="experience-header text-center mb-12">
            <div className="badge-primary mx-auto mb-4">{t('experience.tag')}</div>
            <h2 className="section-title mb-4">{t('experience.title')}</h2>
            <p className="text-muted max-w-2xl mx-auto">{t('experience.desc')}</p>
          </div>

          <div className="experience-box glass-panel">
            <div className="experience-grid">
              
              {/* TABS SIDEBAR */}
              <div className="experience-tabs">
                <button 
                  className={`exp-tab ${activeExpTab === 0 ? 'active' : ''}`}
                  onClick={() => setActiveExpTab(0)}
                >
                  <div className="exp-tab-content">
                    <span className="exp-tab-name">{t('experience.tab1_name')}</span>
                    <span className="exp-tab-desc">{t('experience.tab1_desc')}</span>
                  </div>
                  <ChevronDown className="exp-tab-arrow" size={16} />
                </button>
                
                <button 
                  className={`exp-tab ${activeExpTab === 1 ? 'active' : ''}`}
                  onClick={() => setActiveExpTab(1)}
                >
                  <div className="exp-tab-content">
                    <span className="exp-tab-name">{t('experience.tab2_name')}</span>
                    <span className="exp-tab-desc">{t('experience.tab2_desc')}</span>
                  </div>
                  <ChevronDown className="exp-tab-arrow" size={16} />
                </button>
                
                <button 
                  className={`exp-tab ${activeExpTab === 2 ? 'active' : ''}`}
                  onClick={() => setActiveExpTab(2)}
                >
                  <div className="exp-tab-content">
                    <span className="exp-tab-name">{t('experience.tab3_name')}</span>
                    <span className="exp-tab-desc">{t('experience.tab3_desc')}</span>
                  </div>
                  <ChevronDown className="exp-tab-arrow" size={16} />
                </button>
              </div>

              {/* DISPLAY AREA */}
              <div className="experience-display">
                <AnimatePresence mode="wait">
                  {activeExpTab === 0 && (
                    <motion.div 
                      key="tab0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="exp-content-wrapper"
                    >
                      <div className="exp-info">
                        <h3>{t('experience.tab1_title')}</h3>
                        <p>{t('experience.tab1_text')}</p>
                        
                        <ul className="exp-features">
                          <li><CheckCircle2 size={16} /> <span>{t('experience.tab1_f1')}</span></li>
                          <li><CheckCircle2 size={16} /> <span>{t('experience.tab1_f2')}</span></li>
                          <li><CheckCircle2 size={16} /> <span>{t('experience.tab1_f3')}</span></li>
                        </ul>

                        <div className="exp-tech-stack">
                          <span className="tech-badge">{t('experience.tab1_t1')}</span>
                          <span className="tech-badge">{t('experience.tab1_t2')}</span>
                          <span className="tech-badge">{t('experience.tab1_t3')}</span>
                        </div>

                        <div className="exp-stats">
                          <div className="exp-stat">
                            <span className="stat-val">{t('experience.tab1_s1v')}</span>
                            <span className="stat-label">{t('experience.tab1_s1')}</span>
                          </div>
                          <div className="exp-stat">
                            <span className="stat-val">{t('experience.tab1_s2v')}</span>
                            <span className="stat-label">{t('experience.tab1_s2')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="exp-visual exp-visual-bank">
                        {/* BANK MOCK ANIMATION */}
                        <div className="mock-window">
                          <div className="mock-header">
                            <span className="mock-dot"></span><span className="mock-dot"></span><span className="mock-dot"></span>
                          </div>
                          <div className="mock-body bank-body">
                            <div className="bank-chart">
                              <div className="bar b1"></div>
                              <div className="bar b2"></div>
                              <div className="bar b3"></div>
                              <div className="bar b4"></div>
                              <div className="bar b5"></div>
                            </div>
                            <div className="bank-list">
                              <div className="bank-item"></div>
                              <div className="bank-item"></div>
                              <div className="bank-item"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeExpTab === 1 && (
                    <motion.div 
                      key="tab1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="exp-content-wrapper"
                    >
                      <div className="exp-info">
                        <h3>{t('experience.tab2_title')}</h3>
                        <p>{t('experience.tab2_text')}</p>
                        
                        <ul className="exp-features">
                          <li><CheckCircle2 size={16} /> <span>{t('experience.tab2_f1')}</span></li>
                          <li><CheckCircle2 size={16} /> <span>{t('experience.tab2_f2')}</span></li>
                          <li><CheckCircle2 size={16} /> <span>{t('experience.tab2_f3')}</span></li>
                        </ul>

                        <div className="exp-tech-stack">
                          <span className="tech-badge">{t('experience.tab2_t1')}</span>
                          <span className="tech-badge">{t('experience.tab2_t2')}</span>
                          <span className="tech-badge">{t('experience.tab2_t3')}</span>
                        </div>

                        <div className="exp-stats">
                          <div className="exp-stat">
                            <span className="stat-val">{t('experience.tab2_s1v')}</span>
                            <span className="stat-label">{t('experience.tab2_s1')}</span>
                          </div>
                          <div className="exp-stat">
                            <span className="stat-val">{t('experience.tab2_s2v')}</span>
                            <span className="stat-label">{t('experience.tab2_s2')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="exp-visual exp-visual-logistics">
                        {/* LOGISTICS MOCK ANIMATION */}
                        <div className="mock-window">
                          <div className="mock-header">
                            <span className="mock-dot"></span><span className="mock-dot"></span><span className="mock-dot"></span>
                          </div>
                          <div className="mock-body log-body">
                            <div className="log-node-map">
                              <div className="log-node n1"></div>
                              <div className="log-line l1"></div>
                              <div className="log-node n2 pulse"></div>
                              <div className="log-line l2"></div>
                              <div className="log-node n3"></div>
                            </div>
                            <div className="log-metrics">
                              <div className="log-metric"></div>
                              <div className="log-metric"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeExpTab === 2 && (
                    <motion.div 
                      key="tab2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="exp-content-wrapper"
                    >
                      <div className="exp-info">
                        <h3>{t('experience.tab3_title')}</h3>
                        <p>{t('experience.tab3_text')}</p>
                        
                        <ul className="exp-features">
                          <li><CheckCircle2 size={16} /> <span>{t('experience.tab3_f1')}</span></li>
                          <li><CheckCircle2 size={16} /> <span>{t('experience.tab3_f2')}</span></li>
                          <li><CheckCircle2 size={16} /> <span>{t('experience.tab3_f3')}</span></li>
                        </ul>

                        <div className="exp-tech-stack">
                          <span className="tech-badge">{t('experience.tab3_t1')}</span>
                          <span className="tech-badge">{t('experience.tab3_t2')}</span>
                          <span className="tech-badge">{t('experience.tab3_t3')}</span>
                        </div>

                        <div className="exp-stats">
                          <div className="exp-stat">
                            <span className="stat-val">{t('experience.tab3_s1v')}</span>
                            <span className="stat-label">{t('experience.tab3_s1')}</span>
                          </div>
                          <div className="exp-stat">
                            <span className="stat-val">{t('experience.tab3_s2v')}</span>
                            <span className="stat-label">{t('experience.tab3_s2')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="exp-visual exp-visual-ops">
                        {/* OPERATIONS MOCK ANIMATION */}
                        <div className="mock-window">
                          <div className="mock-header">
                            <span className="mock-dot"></span><span className="mock-dot"></span><span className="mock-dot"></span>
                          </div>
                          <div className="mock-body ops-body">
                            <div className="ops-kanban">
                              <div className="kanban-col">
                                <div className="k-card c1"></div>
                                <div className="k-card c2"></div>
                              </div>
                              <div className="kanban-col">
                                <div className="k-card c3"></div>
                              </div>
                              <div className="kanban-col">
                                <div className="k-card c4"></div>
                                <div className="k-card c5"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="main-footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <div className="flex-center-gap mb-2">
              <img src="/logo.png" alt="Grupo Hormesis" style={{ height: '38px', objectFit: 'contain' }} />
              <span className="badge-gray" style={{ fontSize: '10px' }}>{t('footer.spec')}</span>
            </div>
            <p className="text-xs text-muted max-w-sm">{t('footer.copy')}</p>
          </div>
          <div className="footer-links">
            <a href="#">{t('footer.l1')}</a>
            <a href="#">{t('footer.l2')}</a>
            <a href="#" className="flex-center-gap"><span className="dot-secondary"></span>{t('footer.l3')}</a>
            <a href="#">{t('footer.l4')}</a>
            <a href="#">{t('footer.l5')}</a>
            <a href="#">{t('footer.l6')}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
