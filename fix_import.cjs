const fs = require("fs");
let tsx = fs.readFileSync("src/pages/portal/admin/AdminWorkflows.tsx", "utf8");

tsx = tsx.replace(
  /import \{ FolderKanban, /,
  "import { Clock, FolderKanban, "
);

fs.writeFileSync("src/pages/portal/admin/AdminWorkflows.tsx", tsx);
console.log("Added Clock import");
