const fs = require("fs");
let css = fs.readFileSync("src/pages/contacto/contacto.css", "utf8");

css = css.replace(/width: 100% !important;\s*width: 100%;/g, "width: 100%;");

fs.writeFileSync("src/pages/contacto/contacto.css", css);
