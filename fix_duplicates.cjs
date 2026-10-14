const fs = require("fs");
let tsx = fs.readFileSync("src/pages/portal/admin/AdminWorkflows.tsx", "utf8");

const target = `{activeTemplate.configSchema && activeTemplate.configSchema.properties && Object.entries(activeTemplate.configSchema.properties).map(([key, prop]: [string, any]) => (`
const replacement = `{activeTemplate.configSchema && activeTemplate.configSchema.properties && !['auto_outreach_google_maps'].includes(activeTemplate.typeIdentifier) && Object.entries(activeTemplate.configSchema.properties).map(([key, prop]: [string, any]) => (`

if (tsx.includes(target)) {
  tsx = tsx.replace(target, replacement);
  fs.writeFileSync("src/pages/portal/admin/AdminWorkflows.tsx", tsx);
  console.log("Reemplazado con éxito");
} else {
  console.log("No se encontró el texto");
}
