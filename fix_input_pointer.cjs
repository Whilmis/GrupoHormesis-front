const fs = require("fs");
let tsx = fs.readFileSync("src/pages/contacto/Contacto.tsx", "utf8");

tsx = tsx.replace(
  /WebkitBackdropFilter: 'none',/,
  "WebkitBackdropFilter: 'none',\n          pointerEvents: 'auto',"
);

fs.writeFileSync("src/pages/contacto/Contacto.tsx", tsx);
