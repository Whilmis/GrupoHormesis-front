const fs = require("fs");
let css = fs.readFileSync("src/pages/contacto/contacto.css", "utf8");

if (!css.includes(".form-group select option")) {
  css += `
.form-group select option {
  background-color: #ffffff;
  color: #1e293b;
}
`;
  fs.writeFileSync("src/pages/contacto/contacto.css", css);
}
