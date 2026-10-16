import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
  schema?: Record<string, any> | Record<string, any>[];
}

const DEFAULT_TITLE = 'Grupo Hormesis | Sistematización empresarial e inteligencia artificial';
const DEFAULT_DESCRIPTION = 'Transformamos operaciones de negocio con arquitecturas de software a medida, automatización con IA y sistematización de procesos para maximizar tu rentabilidad.';
const DEFAULT_URL = 'https://grupohormesis.com';
const DEFAULT_IMAGE = 'https://grupohormesis.com/ai_workflow_mockup.jpg';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  noIndex = false,
  schema
}) => {
  useEffect(() => {
    // 1. Título
    const fullTitle = title 
      ? (title.includes('Grupo Hormesis') ? title : `${title} | Grupo Hormesis`)
      : DEFAULT_TITLE;
    document.title = fullTitle;

    // Helper para actualizar o crear meta tags
    const updateMetaTag = (attrName: string, attrVal: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Helper para actualizar o crear link tags
    const updateLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // 2. Meta Description
    updateMetaTag('name', 'description', description);

    // 3. Robots
    const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow';
    updateMetaTag('name', 'robots', robotsContent);

    // 4. Canonical
    const fullCanonical = canonical 
      ? (canonical.startsWith('http') ? canonical : `${DEFAULT_URL}${canonical}`)
      : window.location.href;
    updateLinkTag('canonical', fullCanonical);

    // 5. Open Graph
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', fullCanonical);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:site_name', 'Grupo Hormesis');

    // 6. Twitter
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', ogImage);
    updateMetaTag('name', 'twitter:card', 'summary_large_image');

    // 7. Structured Data (JSON-LD)
    let scriptTag: HTMLScriptElement | null = document.querySelector('#seo-json-ld');
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'seo-json-ld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Limpieza opcional al desmontar
      const ld = document.querySelector('#seo-json-ld');
      if (ld) ld.remove();
    };
  }, [title, description, canonical, ogImage, ogType, noIndex, schema]);

  return null;
};

export default SEO;
