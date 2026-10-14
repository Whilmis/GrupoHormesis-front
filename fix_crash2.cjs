const fs = require("fs");
let tsx = fs.readFileSync("src/pages/portal/admin/AdminWorkflows.tsx", "utf8");

tsx = tsx.replace(
  /wf\.config\.generated_responses/g,
  "wf.config?.generated_responses"
);

fs.writeFileSync("src/pages/portal/admin/AdminWorkflows.tsx", tsx);
console.log("Fixed generated_responses");
