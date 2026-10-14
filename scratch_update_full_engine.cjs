const fs = require('fs');
const path = 'c:/Users/whilmis/Documents/GitHub/Hormesis-back/src/services/execution.engine.ts';

let content = fs.readFileSync(path, 'utf8');

// Update GoogleStitchWorkflow inside execution.engine.ts
const startMarker = '    for (const lead of leadsToProcess) {';
const endMarker = '      const mockupData = {';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find markers in execution.engine.ts");
  process.exit(1);
}

const newLoopBody = `    for (const lead of leadsToProcess) {
      const leadName = lead.businessName || lead.contactName || 'Empresa';
      context.log(\`📐 Diseñando maqueta de alta gama para: "\${leadName}"...\`);

      const meta = (typeof lead.metadata === 'object' && lead.metadata) ? (lead.metadata as any) : {};
      const techAnalysis = meta.technicalAnalysis || {};
      const aiAudit = meta.aiAuditReport || {};

      const errorsSummary = [
        ...(aiAudit.technicalErrors || []),
        ...(aiAudit.visualErrors || [])
      ].slice(0, 5).join('; ');

      const websiteUrl = lead.website || (techAnalysis as any).url || 'No disponible';
      const leadPhone = lead.phone || 'Teléfono no disponible';
      const leadAddress = (lead as any).address || (meta as any).address || 'España';
      const leadRating = (lead as any).rating || meta?.rating || 4.8;
      const catImages = getCategoryImages(leadName, (lead as any).notes || '', websiteUrl);
      const clientScreenshot = techAnalysis.screenshots?.[0]?.url || null;

      let generatedHtml = '';
      let generatedCss = '';
      let stitchProjectId = '';

      // Generación con Google AI Studio (Gemini Flash UI Engine)
      try {
        context.log(\`🎨 Invocando motor de diseño de Google Gemini (Referentes Stripe/Linear/Apple) para \${leadName}...\`);
        const geminiUrl = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=\${stitchApiKey}\`;
        
        const systemPrompt = \`Eres un Diseñador Web y Director de Arte de Élite inspirado en referentes globales de clase mundial (Stripe, Linear, Apple y Vercel).
Tu misión es diseñar una propuesta de REDISEÑO WEB VISUALMENTE IMPACTANTE, MODERNA Y DE ALTA CONVERSIÓN para "\${leadName}".

DATOS DEL CLIENTE Y WEB ORIGINAL:
- Nombre: "\${leadName}"
- Web original de referencia: \${websiteUrl}
- Teléfono: \${leadPhone}
- Ubicación: \${leadAddress}
- Valoración Google Maps: ⭐ \${leadRating} / 5
- Errores de la web actual a resolver: \${errorsSummary || 'Falta de llamadas a la acción, baja legibilidad y diseño anticuado.'}

REGLAS DE DISEÑO, COLORES E IMÁGENES (ESTRICTO):
1. FONDO CLARO Y ELEGANTE: El fondo principal DEBE SER BLANCO PURO (#FFFFFF) o con suaves degradados (#F8FAFC a #FFFFFF). ¡ESTÁ PROHIBIDO EL MODO OSCURO O FONDO NEGRO!
2. LÍNEA DE COLOR DE SU MARCA: Toma la identidad cromática de su sector y web original (ej. azul marino institucional, verde corporativo, borgoña o azul cian) para botones principales, acentos y detalles.
3. INCLUYE IMÁGENES REALES OBLIGATORIAMENTE (usa etiquetas <img src="..." alt="...">):
   - Imagen Hero Principal en alta resolución: "\${catImages.hero}" (colócala en la columna derecha del Hero section con border-radius: 16px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.12); object-fit: cover; width: 100%; height: 380px;).
   - Imagen Tarjeta Servicio 1: "\${catImages.service1}"
   - Imagen Tarjeta Servicio 2: "\${catImages.service2}"
   - Imagen Tarjeta Servicio 3: "\${catImages.service3}"
   - Avatar Testimonio 1: "\${catImages.avatar1}"
   - Avatar Testimonio 2: "\${catImages.avatar2}"
   \${clientScreenshot ? \`- Captura actual de su web para bloque 'Antes vs Después': "\${clientScreenshot}"\` : ''}

ESTRUCTURA DE ALTO NIVEL (Diseño Rico y Completo):
1. Barra superior: Anuncio sutil con badge de verificación y teléfono directo.
2. Header Navbar con efecto Glassmorphism: Logo estilizado con "\${leadName}", menú navegable y botón CTA de color de marca ("Pedir Cita / Contacto").
3. Hero Section (Grilla de 2 columnas estilo Stripe):
   - Columna Izquierda: Badge de Google Maps (⭐ \${leadRating} estrellas), gran titular persuasivo enfocado en su negocio, beneficios clave en viñetas elegantes, botón principal y botón de WhatsApp.
   - Columna Derecha: La fotografía Hero principal ("\${catImages.hero}") con una tarjeta flotante de métricas superpuesta (ej. "+10 Años de Experiencia | 99% Clientes Satisfechos").
4. Sección "La Solución Digital": 3 tarjetas con iconos y bordes elegantes explicando cómo este diseño resuelve la lentitud y falta de contactos de su web anterior.
5. Catálogo de Servicios con Fotografía: 3 tarjetas con las imágenes de servicio ("\${catImages.service1}", etc.), títulos y descripciones atractivas.
6. Prueba Social & Opiniones: 2 tarjetas de reseñas con fotos de perfil ("\${catImages.avatar1}", "\${catImages.avatar2}"), estrellas y comentarios reales en \${leadAddress}.
7. Sección CTA Final con Teléfono y Formulario de Contacto rápido.
8. Footer corporativo completo con datos de la empresa y mención sutil a Grupo Hormesis.

FORMATO:
- Código HTML5 autónomo y responsive con Google Fonts (Plus Jakarta Sans o Inter) y CSS en etiqueta <style>.
- Devuelve ÚNICAMENTE el código dentro de un bloque \\\`\\\`\\\`html ... \\\`\\\`\\\` sin textos introductorios.\`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: systemPrompt }]
            }]
          })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          const htmlMatch = rawText.match(/\\\`\\\`\\\`html([\\s\\S]*?)\\\`\\\`\\\`/i);
          if (htmlMatch) {
            generatedHtml = htmlMatch[1].trim();
          } else if (rawText.includes('<div') || rawText.includes('<section') || rawText.includes('<!DOCTYPE')) {
            generatedHtml = rawText.trim();
          }
          
          if (generatedHtml) {
            context.log(\`✅ Maqueta de alta fidelidad generada por Google AI para \${leadName} (\${generatedHtml.length} caracteres de código).\`);
          }
        } else {
          const errData = await geminiRes.json();
          context.log(\`Aviso Google AI status \${geminiRes.status}: \${JSON.stringify(errData).substring(0, 150)}\`);
        }
      } catch (err: any) {
        context.log(\`Error en llamada a Google AI: \${err.message}\`);
      }

      // Si falló la API por timeout/503, fallback de calidad mundial (Luminoso, con fotos y marca, ¡NUNCA NEGRO!)
      if (!generatedHtml) {
        generatedHtml = \`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${leadName} | Propuesta de Rediseño Oficial</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1e3a8a;
      --primary-accent: #2563eb;
      --bg: #ffffff;
      --bg-surface: #f8fafc;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --shadow: 0 10px 25px -5px rgba(0,0,0,0.06);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: var(--bg); color: var(--text-main); line-height: 1.6; }
    .container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
    .topbar { background: #f1f5f9; padding: 8px 0; font-size: 0.8rem; color: var(--text-muted); border-bottom: 1px solid var(--border); }
    .nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.9); position: sticky; top: 0; backdrop-filter: blur(10px); z-index: 50; }
    .logo { font-size: 1.35rem; font-weight: 800; color: var(--primary); letter-spacing: -0.02em; }
    .btn-cta { background: var(--primary-accent); color: white; padding: 10px 22px; border-radius: 9999px; font-weight: 600; font-size: 0.9rem; text-decoration: none; box-shadow: 0 4px 14px rgba(37,99,235,0.3); transition: all 0.2s; }
    .hero { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; padding: 60px 0; }
    .hero-badge { display: inline-flex; align-items: center; gap: 6px; background: #eff6ff; color: #1d4ed8; padding: 6px 14px; border-radius: 9999px; font-size: 0.82rem; font-weight: 600; margin-bottom: 18px; border: 1px solid #bfdbfe; }
    .hero-title { font-size: 2.7rem; font-weight: 800; line-height: 1.15; color: #0f172a; margin-bottom: 18px; }
    .hero-title span { color: var(--primary-accent); }
    .hero-desc { font-size: 1.1rem; color: var(--text-muted); margin-bottom: 28px; line-height: 1.6; }
    .hero-buttons { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 32px; }
    .btn-secondary { background: #f8fafc; color: #334155; padding: 12px 24px; border-radius: 9999px; font-weight: 600; border: 1px solid #cbd5e1; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
    .hero-image-wrap { position: relative; }
    .hero-img { width: 100%; height: 380px; object-fit: cover; border-radius: 20px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.12); border: 1px solid #e2e8f0; }
    .floating-card { position: absolute; bottom: -20px; left: -20px; background: white; padding: 14px 20px; border-radius: 14px; box-shadow: 0 15px 30px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin: 40px 0; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: var(--shadow); transition: transform 0.2s; }
    .card-img { width: 100%; height: 160px; object-fit: cover; }
    .card-body { padding: 20px; }
    .card-title { font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .card-desc { font-size: 0.9rem; color: var(--text-muted); }
    .reviews { background: #f8fafc; padding: 60px 0; margin-top: 60px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
    .review-card { background: white; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 12px; }
    .review-user { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .footer { padding: 40px 0; text-align: center; font-size: 0.85rem; color: var(--text-muted); border-top: 1px solid #e2e8f0; }
    @media(max-width: 768px) {
      .hero { grid-template-columns: 1fr; }
      .hero-title { font-size: 2rem; }
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="container" style="display: flex; justify-content: space-between;">
      <span>📍 \${leadAddress}</span>
      <span>📞 <a href="tel:\${leadPhone}" style="color: inherit; font-weight: 600;">\${leadPhone}</a> | Horario comercial habitual</span>
    </div>
  </div>
  <header class="nav container">
    <div class="logo">\${leadName}</div>
    <a href="tel:\${leadPhone}" class="btn-cta">Contactar Ahora</a>
  </header>
  <main class="container">
    <section class="hero">
      <div>
        <div class="hero-badge">⭐ \${leadRating} / 5 en Google Maps | Verificado</div>
        <h1 class="hero-title">Atención de excelencia y confianza para clientes de <span>\${leadName}</span></h1>
        <p class="hero-desc">Soluciones integrales en \${leadAddress} con atención ágil, reserva instantánea y la máxima transparencia en cada trámite.</p>
        <div class="hero-buttons">
          <a href="tel:\${leadPhone}" class="btn-cta" style="padding: 14px 28px; font-size: 1rem;">📞 Llamar al \${leadPhone}</a>
          <a href="https://wa.me/?text=Hola%20\${encodeURIComponent(leadName)}" class="btn-secondary">💬 WhatsApp Directo</a>
        </div>
      </div>
      <div class="hero-image-wrap">
        <img src="\${catImages.hero}" alt="\${leadName}" class="hero-img">
        <div class="floating-card">
          <span style="font-size: 1.6rem;">⚡</span>
          <div>
            <div style="font-weight: 700; color: #0f172a; font-size: 0.9rem;">Carga en menos de 1 segundo</div>
            <div style="font-size: 0.75rem; color: #16a34a; font-weight: 600;">100% Adaptado a Móvil</div>
          </div>
        </div>
      </div>
    </section>
    <section>
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="font-size: 1.8rem; font-weight: 800; color: #0f172a;">Servicios Especializados</h2>
        <p style="color: var(--text-muted);">Calidad garantizada y atención personalizada para cada cliente</p>
      </div>
      <div class="grid-3">
        <div class="card">
          <img src="\${catImages.service1}" class="card-img" alt="Servicio 1">
          <div class="card-body">
            <h3 class="card-title">Gestión Profesional</h3>
            <p class="card-desc">Tramitación rápida y segura con seguimiento en tiempo real de cada expediente.</p>
          </div>
        </div>
        <div class="card">
          <img src="\${catImages.service2}" class="card-img" alt="Servicio 2">
          <div class="card-body">
            <h3 class="card-title">Asesoría a Medida</h3>
            <p class="card-desc">Respuestas claras y adaptadas a tus necesidades concretas sin tecnicismos.</p>
          </div>
        </div>
        <div class="card">
          <img src="\${catImages.service3}" class="card-img" alt="Servicio 3">
          <div class="card-body">
            <h3 class="card-title">Atención Inmediata</h3>
            <p class="card-desc">Canal directo por teléfono o WhatsApp para resolver cualquier consulta en el día.</p>
          </div>
        </div>
      </div>
    </section>
  </main>
  <section class="reviews">
    <div class="container">
      <div style="text-align: center; margin-bottom: 32px;">
        <h2 style="font-size: 1.8rem; font-weight: 800; color: #0f172a;">Opiniones Verificadas en Google Maps</h2>
      </div>
      <div class="grid-3">
        <div class="review-card">
          <div style="color: #f59e0b; font-size: 1.1rem;">⭐⭐⭐⭐⭐</div>
          <p style="font-size: 0.9rem; color: #334155;">"Excelente atención y rapidez. Me resolvieron todas las dudas con total profesionalidad."</p>
          <div class="review-user">
            <img src="\${catImages.avatar1}" class="avatar" alt="Cliente">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">María González</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Cliente verificada en Google</div>
            </div>
          </div>
        </div>
        <div class="review-card">
          <div style="color: #f59e0b; font-size: 1.1rem;">⭐⭐⭐⭐⭐</div>
          <p style="font-size: 0.9rem; color: #334155;">"Trato impecable y gran rapidez en las gestiones. Muy recomendables en \${leadAddress}."</p>
          <div class="review-user">
            <img src="\${catImages.avatar2}" class="avatar" alt="Cliente">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">Carlos Domínguez</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Cliente verificado en Google</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <footer class="footer container">
    <p>© \${new Date().getFullYear()} \${leadName} · \${leadAddress} · Tel: \${leadPhone}</p>
    <p style="margin-top: 6px; font-size: 0.75rem; color: #94a3b8;">Propuesta de Rediseño Web de Alta Conversión desarrollada por Grupo Hormesis</p>
  </footer>
</body>
</html>
        \`.trim();
      }
`;

content = content.substring(0, startIndex) + newLoopBody + content.substring(endIndex);
fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated execution.engine.ts with images, stripe inspiration and bright fallback!');
