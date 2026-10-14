const fs = require("fs");
let tsx = fs.readFileSync("src/pages/contacto/Contacto.tsx", "utf8");

// replace padding: '1rem' on the input
tsx = tsx.replace(/padding: '1rem',\s*fontSize: '0\.95rem'/g, "padding: '1.25rem 1.5rem',\n          fontSize: '1rem'");

fs.writeFileSync("src/pages/contacto/Contacto.tsx", tsx);
