
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Code, Zap, BarChart, Settings, Users, BookOpen, Map, ArrowRight, Globe, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Navigation.css';

const MEGA_MENUS = {
  soluciones: {
    title: "Soluciones y tecnologías",
    items: [
      {
        icon: <Zap size={20} />,
        title: "Sistematización y workflows",
        desc: "Automatiza procesos repetitivos",
        href: "/soluciones/workflows"
      },
      {
        icon: <Code size={20} />,
        title: "Desarrollo a medida",
        desc: "Apps exclusivas para tu negocio",
        href: "/soluciones/desarrollo"
      },
      {
        icon: <BarChart size={20} />,
        title: "Ecosistema B2B (CRM/ERP)",
        desc: "Control total de tu empresa",
        href: "/soluciones/ecosistema"
      },
      {
        icon: <Settings size={20} />,
        title: "Integración con IA",
        desc: "Inteligencia artificial aplicada",
        href: "/soluciones/ia"
      }
    ]
  },
  nosotros: {
    title: "Sobre Hormesis",
    items: [
      {
        icon: <Users size={20} />,
        title: "Cultura y visión",
        desc: "Lo que nos mueve",
        href: "/nosotros#cultura"
      },
      {
        icon: <Map size={20} />,
        title: "Presencia corporativa",
        desc: "Dónde estamos",
        href: "/nosotros#presencia"
      }
    ]
  },
  insights: {
    title: "Insights",
    items: [
      {
        icon: <BookOpen size={20} />,
        title: "Blog técnico",
        desc: "Últimas tendencias",
        href: "/insights"
      }
    ]
  }
};

export function Navigation() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const isArticlePage = location.pathname.startsWith('/insights/');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className={`main-nav ${(scrolled || isArticlePage) ? 'nav-scrolled glass-panel' : ''}`} onMouseLeave={handleMouseLeave}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src="/logo.png" alt="Grupo Hormesis" style={{ height: '45px', objectFit: 'contain' }} />
        </Link>
        
        <div className="nav-links">
          {Object.entries(MEGA_MENUS).map(([key, menu]) => (
            <div 
              key={key}
              className="nav-item"
              onMouseEnter={() => handleMouseEnter(key)}
            >
              <button className={`nav-link ${activeMenu === key ? 'active' : ''}`}>
                {t(`nav.${key}`)}
                <ChevronDown size={16} className={`chevron ${activeMenu === key ? 'rotated' : ''}`} />
              </button>
              
              <AnimatePresence>
                {activeMenu === key && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="mega-menu"
                  >
                    <div className="mega-menu-grid">
                      {menu.items.map((item, i) => (
                        <Link to={item.href} key={i} className="mega-menu-item">
                          <div className="mega-menu-icon">{item.icon}</div>
                          <div className="mega-menu-text">
                            <span className="mega-menu-title">{item.title}</span>
                            <span className="mega-menu-desc">{item.desc}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mega-menu-footer">
                      <Link to={`/${key}`} className="mega-menu-all">
                        Ver todo sobre {t(`nav.${key}`)} <ArrowRight size={16} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="nav-actions">
          <button onClick={toggleLanguage} className="nav-lang-btn" aria-label="Cambiar idioma">
            <Globe size={20} />
            <span style={{textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600}}>{i18n.language.split('-')[0]}</span>
          </button>
          <Link to="/login" className="nav-login-btn" aria-label="Iniciar sesión">
            <LogIn size={18} />
          </Link>
          <Link to="/contacto" className="btn-primary">
            {t('nav.agendar')}
          </Link>
        </div>
      </div>
    </nav>
  );
}
