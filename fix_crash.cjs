const fs = require("fs");
let tsx = fs.readFileSync("src/pages/portal/admin/AdminWorkflows.tsx", "utf8");

// Fix lead_collector block
tsx = tsx.replace(
  /wf\.config\.schedule === '0 \* \* \* \*'/g,
  "wf.config?.schedule === '0 * * * *'"
).replace(
  /wf\.config\.schedule === '0 8 \* \* \*'/g,
  "wf.config?.schedule === '0 8 * * *'"
).replace(
  /wf\.config\.schedule === '0 10 \* \* \*'/g,
  "wf.config?.schedule === '0 10 * * *'"
).replace(
  /wf\.config\.schedule === '0 12 \* \* \*'/g,
  "wf.config?.schedule === '0 12 * * *'"
).replace(
  /wf\.config\.schedule === '0 9 \* \* 1'/g,
  "wf.config?.schedule === '0 9 * * 1'"
).replace(
  /\$\{wf\.config\.schedule\}/g,
  "${wf.config?.schedule}"
);

// Fix auto_outreach block
tsx = tsx.replace(
  /\(wf\.config\.schedule \|\|/g,
  "(wf.config?.schedule ||"
);

fs.writeFileSync("src/pages/portal/admin/AdminWorkflows.tsx", tsx);
console.log("Fixed optional chaining!");
