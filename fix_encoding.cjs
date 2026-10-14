const fs = require("fs");
let tsx = fs.readFileSync("src/pages/contacto/Contacto.tsx", "utf8");

// Reemplazos de codificación
tsx = tsx.replace(/SoluciA3n/g, "Solución");
tsx = tsx.replace(/TAccnico/g, "Técnico");
tsx = tsx.replace(/CuAcntanos/g, "Cuéntanos");
tsx = tsx.replace(/desafA-o/g, "desafío");
tsx = tsx.replace(/DesafA-o/g, "Desafío");
tsx = tsx.replace(/compaAA-a/g, "compañía");
tsx = tsx.replace(/TelAcfono/g, "Teléfono");
tsx = tsx.replace(/IntegraciA3n/g, "Integración");
tsx = tsx.replace(/ModernizaciA3n/g, "Modernización");
tsx = tsx.replace(/SistematizaciA3n/g, "Sistematización");
tsx = tsx.replace(/situaciA3n/g, "situación");
tsx = tsx.replace(/tecnolA3gicos/g, "tecnológicos");
tsx = tsx.replace(/cA3digo/g, "código");
tsx = tsx.replace(/ATienes/g, "¿Tienes");
tsx = tsx.replace(/rApidas/g, "rápidas");
tsx = tsx.replace(/AC/g, "¿C");

fs.writeFileSync("src/pages/contacto/Contacto.tsx", tsx);
