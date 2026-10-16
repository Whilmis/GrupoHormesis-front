import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, Globe, Mail, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { articlesData, ArticleBlock } from '../../data/articles';
import '../soluciones/b2b.css';
import './article.css';

// Componente para renderizar bloques de contenido
const ContentBlock = ({ block, index }: { block: ArticleBlock, index: number }) => {
  switch (block.type) {
    case 'heading':
      return <h2 key={index} className="article-heading">{block.content}</h2>;
    
    case 'quote':
      return <blockquote key={index} className="article-blockquote">{block.content}</blockquote>;
    
    case 'image':
      return (
        <div key={index} className="article-inline-image-container">
          <img src={block.src} alt={block.alt} className="article-inline-image" />
          {block.alt && <p className="article-inline-image-caption">{block.alt}</p>}
        </div>
      );
    
    case 'list':
      return (
        <ul key={index} className="article-list">
          {block.items?.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
      
    case 'paragraph':
    default:
      return <p key={index} className="article-paragraph article-text">{block.content}</p>;
  }
};

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const article = slug ? articlesData[slug] : null;

  // Obtener artículos relacionados (todos menos el actual, max 2)
  const relatedArticles = Object.values(articlesData)
    .filter(a => a.slug !== slug)
    .slice(0, 2);

  // Scroll to top on load or slug change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Listener para la barra de progreso de lectura
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll) * 100);
    }
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!article) {
    return (
      <main className="b2b-page flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Artículo no encontrado</h1>
          <p className="mb-8">El artículo que buscas no existe o ha sido movido.</p>
          <Link to="/insights" className="btn-primary">Volver a Insights</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Barra de progreso de lectura (Fixed top) */}
      <div className="reading-progress-container">
        <div className="reading-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      <main className="article-read-page">
        {/* Hero Section (Magazine Style) */}
        <section className="article-hero animate-fade-in">
          <img 
            src={article.image} 
            alt={article.title} 
            className="article-hero-bg" 
          />
          <div className="article-hero-overlay"></div>
          
          <div className="article-header-container">
            <div className="article-header-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="badge glass-badge inline-block" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16,185,129,0.3)', color: '#10b981' }}>
                {article.category}
              </div>
              
              <h1>{article.title}</h1>
              
              <div className="article-meta-row">
                <div className="article-meta-item">
                  <User size={18} /> <span>{article.author.name}</span>
                </div>
                <div className="article-meta-item">
                  <Calendar size={18} /> <span>{article.date}</span>
                </div>
                <div className="article-meta-item">
                  <Clock size={18} /> <span>{article.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article Body */}
        <section className="article-body-section">
          <div className="article-body-container">
            
            {/* Sidebar (Desktop only) */}
            <aside className="article-share-sidebar animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="share-buttons">
                <span className="text-xs font-semibold text-slate-400 mb-2 tracking-wider">Compartir</span>
                <button className="share-btn" title="Compartir vía web"><Globe size={22} /></button>
                <button className="share-btn" title="Compartir por correo"><Mail size={22} /></button>
                <button className="share-btn" title="Copiar enlace"><LinkIcon size={22} /></button>
              </div>
            </aside>

            {/* Main Content */}
            <div className="article-body-content">
              <Link to="/insights" className="back-to-insights animate-fade-in">
                <ArrowLeft size={16} className="mr-2" /> Volver a insights
              </Link>
              
              <div className="article-lead animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                {article.subtitle}
              </div>
              
              <div className="article-blocks-container animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                {article.content.map((block, index) => (
                  <ContentBlock key={index} block={block} index={index} />
                ))}
              </div>

              {/* Author Bio (Premium Card) */}
              <div className="article-author-bio animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <img src={article.author.avatar} alt={article.author.name} className="author-avatar" />
                <div className="author-info">
                  <h4>{article.author.name}</h4>
                  <div className="author-role">{article.author.role}</div>
                  <p className="author-bio-text">{article.author.bio}</p>
                </div>
              </div>
            </div>
            
            {/* Empty div to balance grid */}
            <div className="hidden lg:block"></div>
          </div>
        </section>
      </main>

      {/* Related Articles Footer (Dark Mode) */}
      <section className="related-articles-section">
        <div className="container">
          <h3 className="mb-12 font-bold tracking-tight">Seguir leyendo</h3>
          
          <div className="related-articles-grid">
            {relatedArticles.map(related => (
              <div key={related.id} className="related-article-card">
                <div className="related-article-image-wrapper">
                  <img src={related.image} alt={related.title} className="related-article-image" />
                </div>
                <div className="related-article-content">
                  <span className="related-article-category">{related.category}</span>
                  <h4 className="related-article-title">{related.title}</h4>
                  <Link to={`/insights/${related.slug}`} className="related-article-link">
                    Leer Artículo <ArrowRight size={16} className="ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
