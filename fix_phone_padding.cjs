const fs = require("fs");
let content = fs.readFileSync("src/pages/contacto/Contacto.tsx", "utf8");

content = content.replace(/padding: '1rem',/g, "padding: '1.125rem 1rem',");

fs.writeFileSync("src/pages/contacto/Contacto.tsx", content);
