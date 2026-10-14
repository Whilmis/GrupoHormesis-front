const fs = require("fs");
let content = fs.readFileSync("src/pages/portal/admin/AdminWorkflows.tsx", "utf8");
content = content.replace(/<a href=\{mailto:\} style=\{\{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 \}\}>.*<\/a>/g, "<a href={`mailto:${lead.email}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>📧 {lead.email}</a>");
fs.writeFileSync("src/pages/portal/admin/AdminWorkflows.tsx", content);
