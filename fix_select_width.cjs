const fs = require("fs");
let css = fs.readFileSync("src/pages/contacto/contacto.css", "utf8");

// Let's make absolutely sure select gets 100% width and box-sizing border-box
css = css.replace(/\.form-group input,\s*\.form-group select,\s*\.form-group textarea \{/g, 
  `.form-group input,
.form-group select,
.form-group textarea {
  box-sizing: border-box;
  width: 100% !important;`);

fs.writeFileSync("src/pages/contacto/contacto.css", css);
