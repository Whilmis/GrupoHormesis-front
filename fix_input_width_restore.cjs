const fs = require("fs");
let tsx = fs.readFileSync("src/pages/contacto/Contacto.tsx", "utf8");

// Restore wrapper width
tsx = tsx.replace(
  /backdropFilter: 'blur\(12px\)',\s*width: 'auto', minWidth: 0/g,
  "backdropFilter: 'blur(12px)',\n      width: '100%'"
);

// Restore button width
tsx = tsx.replace(
  /borderRadius: '6px',\s*width: 'auto', minWidth: 0,/g,
  "borderRadius: '6px',\n                  width: '100%',"
);

fs.writeFileSync("src/pages/contacto/Contacto.tsx", tsx);
