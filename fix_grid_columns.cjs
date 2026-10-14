const fs = require("fs");
let css = fs.readFileSync("src/pages/contacto/contacto.css", "utf8");

css = css.replace(/grid-template-columns: 1fr 1fr;/g, "grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);");

fs.writeFileSync("src/pages/contacto/contacto.css", css);
