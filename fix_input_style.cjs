const fs = require("fs");
let tsx = fs.readFileSync("src/pages/contacto/Contacto.tsx", "utf8");

// We need to target the style object of the input specifically.
tsx = tsx.replace(
  /padding: '1\.25rem 1\.5rem',\s*fontSize: '0\.95rem',\s*fontFamily: 'Inter, sans-serif',\s*color: '#1b1c19'/g,
  "padding: '1.25rem 1.5rem', fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#1b1c19', boxShadow: 'none', borderRadius: 0, backdropFilter: 'none', WebkitBackdropFilter: 'none', width: '100%'"
);

fs.writeFileSync("src/pages/contacto/Contacto.tsx", tsx);
