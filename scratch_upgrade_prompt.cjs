const fs = require('fs');
const path = 'c:/Users/whilmis/Documents/GitHub/Hormesis-back/src/services/execution.engine.ts';

let content = fs.readFileSync(path, 'utf8');

const targetOldPrompt = `        const systemPrompt = \`Eres un Diseñador UI/UX Web Senior y Desarrollador Frontend de élite. Tu objetivo es diseñar una propuesta de rediseño web moderna, de altísima conversión y estética premium para la empresa "\${leadName}".
Sector: \${(lead as any).notes || 'Negocio'}.
Ubicación: \${(lead as any).address || (meta as any).address || 'España'}.
Problemas detectados en su web actual: \${errorsSummary || 'Diseño obsoleto, baja conversión móvil, falta de botones de acción'}.
Estilo visual pedido: \${designStyle}.

INSTRUCCIONES DE DISEÑO:
1. Genera un bloque HTML completo y autónomo con estilos CSS en línea o etiqueta <style> incorporada.
2. Debe tener estética ultra-premium (modo oscuro o elegante contraste, tipografía moderna, badges sutiles, micro-gradientes).
3. Incluye:
   - Header con logo/nombre y botón de contacto rápido / WhatsApp.
   - Hero Section impactante con titular persuasivo enfocado en su nicho y botón de llamada a la acción (CTA).
   - Bloque de 3 tarjetas destacando cómo Grupo Hormesis resuelve los problemas técnicos de su web (Velocidad < 1s, 100% Adaptado a Móvil, Cierre de Ventas).
4. Devuelve ÚNICAMENTE el código HTML dentro de un bloque \\\`\\\`\\\`html ... \\\`\\\`\\\` sin saludos ni explicaciones.\`;`;

const newEnhancedPrompt = `        // 1. Obtener contexto enriquecido de la web de referencia
        const websiteUrl = lead.website || (techAnalysis as any).url || 'No disponible';
        const leadPhone = lead.phone || 'Teléfono no disponible';
        const leadAddress = (lead as any).address || (meta as any).address || 'España';
        const leadRating = lead.rating || meta?.rating || 4.8;

        const systemPrompt = \`Eres el Director de Arte UI/UX y Diseñador Web Principal de Grupo Hormesis. Tu misión es crear una propuesta de REDISEÑO WEB COMPLETA, VIBRANTE y de ALTA CONVERSIÓN para el cliente "\${leadName}".

DATOS CLAVE DEL CLIENTE Y WEB DE REFERENCIA:
- Nombre Comercial: "\${leadName}"
- Web Actual de Referencia: \${websiteUrl}
- Teléfono Oficial: \${leadPhone}
- Ubicación / Ciudad: \${leadAddress}
- Valoración en Google Maps: ⭐ \${leadRating} estrellas
- Diagnóstico de Auditoría (Fallos a corregir de su web actual):
  \${errorsSummary || 'Falta de llamadas a la acción, textos difíciles de leer en móvil y diseño anticuado.'}
- Análisis detallado: \${aiAudit.detailedAnalysis || 'Optimización urgente de conversión y experiencia móvil.'}

REGLAS CRÍTICAS DE COLOR Y ESTILO VISUAL (¡MUY IMPORTANTE!):
1. ¡NO HAGAS UNA PÁGINA EN NEGRO! NO uses modo oscuro ni fondo negro genérico.
2. RESPETA LA LÍNEA DE COLOR Y MARCA DEL NEGOCIO:
   - Utiliza fondos limpios, luminosos y profesionales (blanco puro #ffffff, marfil suave, grises sofisticados #f8fafc / #f1f5f9).
   - Define una paleta de marca inspirada en su identidad y sector (ej. si es educación/idiomas: azul marino institucional, blanco y acentos en rojo o dorado; si es salud/dental: azul cian/turquesa y blanco clínico; si es hostelería: tonos tierra y cálidos).
   - Aplica contrastes nítidos, sombras de profundidad suaves (box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06)), y bordes redondeados elegantes (border-radius: 12px a 20px).

ESTRUCTURA OBLIGATORIA DEL REDISEÑO (Página Rica y Completa):
1. Topbar Informativa: Dirección real (\${leadAddress}), horario comercial y acceso rápido a llamada (\${leadPhone}).
2. Barra de Navegación (Header):
   - Logo tipográfico estilizado con el nombre "\${leadName}".
   - Menú de navegación realista (Cursos / Servicios, Metodología, Opiniones, Contacto).
   - Botón CTA destacado ("Pedir Cita / Información").
3. Hero Section de Alto Impacto:
   - Badge superior: "⭐ \${leadRating} / 5 en Google Maps | Centro Verificado en \${leadAddress}".
   - Título y subtítulo con copywriting persuasivo específico para su sector.
   - 2 Botones de acción directa: Primario con color de marca y Secundario "WhatsApp / Contacto Inmediato".
   - 3 Indicadores de confianza: "Atención 100% personalizada", "Garantía de calidad", "Sin permanencias".
4. Sección "La Nueva Experiencia Digital":
   - Tarjetas comparativas explicando cómo este rediseño soluciona los problemas detectados en la auditoría (Carga ultra-rápida, adaptación perfecta a móvil, reserva en 2 toques).
5. Catálogo de Servicios / Especialidades:
   - 3 a 4 tarjetas completas con títulos reales según su actividad, iconos modernos y descripción de valor.
6. Sección de Reseñas / Prueba Social:
   - 2 testimonios realistas con 5 estrellas, nombres de clientes y mención a la excelente atención en \${leadAddress}.
7. Sección Final de Contacto / Reserva:
   - Bloque con llamada a la acción irresistible y formulario o botón grande de llamada a \${leadPhone}.
8. Footer Corporativo:
   - Datos de contacto, aviso legal y crédito sutil: "Propuesta de Rediseño de Alta Conversión creada por Grupo Hormesis".

FORMATO DE ENTREGA:
- Devuelve código HTML completo y autónomo con Google Fonts (Inter o Plus Jakarta Sans) y todo el CSS en un bloque <style> dentro del HTML.
- Responsive y listo para renderizar.
- Devuelve ÚNICAMENTE el código HTML dentro de un bloque \\\`\\\`\\\`html ... \\\`\\\`\\\` sin introducciones ni despedidas.\`;`;

if (content.includes("Eres un Diseñador UI/UX Web Senior y Desarrollador Frontend de élite")) {
  content = content.replace(targetOldPrompt, newEnhancedPrompt);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Successfully upgraded systemPrompt in execution.engine.ts!");
} else {
  console.log("Could not find targetOldPrompt block in execution.engine.ts");
}
