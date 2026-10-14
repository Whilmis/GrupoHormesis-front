const fs = require("fs");
let tsx = fs.readFileSync("src/pages/contacto/Contacto.tsx", "utf8");

// Reemplazos de codificación
tsx = tsx.replace(/A3n/g, "ón");
tsx = tsx.replace(/A-o/g, "ío");
tsx = tsx.replace(/A/g, "á");
tsx = tsx.replace(/AA-a/g, "ñía");
tsx = tsx.replace(/Accn/g, "écn");
tsx = tsx.replace(/Acnt/g, "ént");
tsx = tsx.replace(/A-a/g, "ía");
tsx = tsx.replace(/AT/g, "¿T");
tsx = tsx.replace(/AC/g, "¿C");

fs.writeFileSync("src/pages/contacto/Contacto.tsx", tsx);
