const fs = require("fs");
let tsx = fs.readFileSync("src/pages/contacto/Contacto.tsx", "utf8");

// We need to target the style object of the input specifically.
tsx = tsx.replace(
  /width: '100%'/g,
  "width: 'auto', minWidth: 0"
);

fs.writeFileSync("src/pages/contacto/Contacto.tsx", tsx);
