const fs = require("fs");
let tsx = fs.readFileSync("src/pages/contacto/Contacto.tsx", "utf8");

tsx = tsx.replace(/ATienes un cA3digo/g, "¿Tienes un código");
tsx = tsx.replace(/compaAA-a/g, "compañía");
tsx = tsx.replace(/rApidas/g, "rápidas");

fs.writeFileSync("src/pages/contacto/Contacto.tsx", tsx);
