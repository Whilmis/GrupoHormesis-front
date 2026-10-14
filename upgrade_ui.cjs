const fs = require("fs");
let css = fs.readFileSync("src/pages/contacto/contacto.css", "utf8");

// Update standard inputs
css = css.replace(/\.form-group input,\s*\.form-group select,\s*\.form-group textarea \{[\s\S]*?\}/g, 
  `.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.05);
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #1e293b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.02), 0 2px 8px -2px rgba(0,0,0,0.02);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}`);

css = css.replace(/\.form-group input:focus,\s*\.form-group select:focus,\s*\.form-group textarea:focus \{[\s\S]*?\}/g, 
  `.form-group input:focus, 
.form-group select:focus, 
.form-group textarea:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.95);
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1), 0 8px 24px -4px rgba(16, 185, 129, 0.12);
  transform: translateY(-2px);
}`);

// Space out the grid a bit more
css = css.replace(/gap: 2\.25rem;/g, "gap: 2.75rem;");

fs.writeFileSync("src/pages/contacto/contacto.css", css);

// Now update Contacto.tsx phone wrapper style to match exactly
let tsx = fs.readFileSync("src/pages/contacto/Contacto.tsx", "utf8");
tsx = tsx.replace(/background: 'rgba\(255, 255, 255, 0\.8\)',\s*border: '1px solid rgba\(199, 198, 203, 0\.4\)',\s*borderRadius: '12px',\s*position: 'relative',\s*transition: 'all 0\.2s ease'/g,
  `background: 'rgba(255, 255, 255, 0.5)', 
      border: '1px solid rgba(0, 0, 0, 0.05)', 
      borderRadius: '16px',
      position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.02), 0 2px 8px -2px rgba(0,0,0,0.02)',
      backdropFilter: 'blur(12px)'`);

// update phone inner button padding
tsx = tsx.replace(/padding: '1\.125rem 1rem'/g, "padding: '1.25rem 1.5rem'");
tsx = tsx.replace(/padding: '1rem'/g, "padding: '1.25rem 1.5rem'");

fs.writeFileSync("src/pages/contacto/Contacto.tsx", tsx);
