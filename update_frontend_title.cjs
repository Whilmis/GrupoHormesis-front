const fs = require("fs");
let tsx = fs.readFileSync("src/pages/portal/admin/AdminWorkflows.tsx", "utf8");

tsx = tsx.replace(
  /<h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>🤖 Configuración de Auto Outreach<\/h4>/,
  "<h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>🤖 Configuración de Envío de Correos Automático</h4>"
);

fs.writeFileSync("src/pages/portal/admin/AdminWorkflows.tsx", tsx);
