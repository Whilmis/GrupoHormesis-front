const fs = require('fs');
const path = 'c:/Users/whilmis/Documents/GitHub/Hormesis-back/src/services/execution.engine.ts';

let content = fs.readFileSync(path, 'utf8');

// Replace the Google Stitch call inside GoogleStitchWorkflow
const oldCall = `      // Intento de conexión con la API de Google Stitch
      try {
        context.log(\`Enviando prompt a Google Stitch API...\`);
        const stitchRes = await fetch('https://stitch.googleapis.com/v1/projects:generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${stitchApiKey}\`,
            'X-Goog-Api-Key': stitchApiKey
          },
          body: JSON.stringify({
            prompt: stitchPrompt,
            style: designStyle,
            context: {
              businessName: leadName,
              website: lead.website
            }
          })
        });

        if (stitchRes.ok) {
          const stitchData = await stitchRes.json();
          generatedHtml = stitchData.html || stitchData.screenCode || '';
          generatedCss = stitchData.css || '';
          stitchProjectId = stitchData.projectId || stitchData.id || '';
          context.log(\`✅ Respuesta de Google Stitch recibida exitosamente.\`);
        } else {
          context.log(\`Google Stitch API devolvió estado HTTP \${stitchRes.status}. Usando motor de renderizado resiliente...\`);
        }
      } catch (err: any) {
        context.log(\`Aviso conexión Stitch: \${err.message}. Activando motor de renderizado de diseño de alta fidelidad...\`);
      }`;

const newCall = `      // Generación con Google AI Studio (Gemini Flash UI Engine)
      try {
        context.log(\`🎨 Invocando motor de diseño de Google Gemini / Stitch para \${leadName}...\`);
        const geminiUrl = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${stitchApiKey}\`;
        
        const systemPrompt = \`Eres un Diseñador UI/UX Web Senior y Desarrollador Frontend de élite. Tu objetivo es diseñar una propuesta de rediseño web moderna, de altísima conversión y estética premium para la empresa "\${leadName}".
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
4. Devuelve ÚNICAMENTE el código HTML dentro de un bloque \\\`\\\`\\\`html ... \\\`\\\`\\\` sin saludos ni explicaciones.\`;

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
          
          // Extraer bloque HTML
          const htmlMatch = rawText.match(/\\\`\\\`\\\`html([\\s\\S]*?)\\\`\\\`\\\`/i);
          if (htmlMatch) {
            generatedHtml = htmlMatch[1].trim();
          } else if (rawText.includes('<div') || rawText.includes('<section')) {
            generatedHtml = rawText.trim();
          }
          
          if (generatedHtml) {
            context.log(\`✅ Maqueta generada con éxito por Google AI para \${leadName} (\${generatedHtml.length} caracteres de código).\`);
          }
        } else {
          const errData = await geminiRes.json();
          context.log(\`Google AI devolvió status \${geminiRes.status}: \${JSON.stringify(errData).substring(0, 150)}\`);
        }
      } catch (err: any) {
        context.log(\`Error en llamada a Google AI: \${err.message}\`);
      }`;

if (content.includes("https://stitch.googleapis.com/v1/projects:generate")) {
  content = content.replace(oldCall, newCall);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Updated GoogleStitchWorkflow to use real Google AI Studio Gemini API!");
} else {
  console.log("Could not find oldCall block in execution.engine.ts");
}
