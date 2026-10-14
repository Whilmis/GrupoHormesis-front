const fs = require("fs");
let css = fs.readFileSync("src/pages/contacto/contacto.css", "utf8");

css = css.replace(/\.premium-form \{\s*display: flex;\s*flex-direction: column;\s*gap: 1\.5rem;/g, 
  ".premium-form {\n  display: flex;\n  flex-direction: column;\n  gap: 2.25rem;");
css = css.replace(/\.form-grid-2 \{\s*display: grid;\s*grid-template-columns: 1fr;\s*gap: 1\.5rem;/g, 
  ".form-grid-2 {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 2.25rem;");

// Make the form wrapper pad more and add a subtle glowing border
css = css.replace(/padding: 3rem;/g, "padding: 3.5rem;");
css = css.replace(/box-shadow:\s*0 40px 80px -20px rgba\(0,0,0,0\.1\),\s*inset 0 0 0 1px rgba\(255,255,255,1\);/g, 
  "box-shadow: \n    0 40px 80px -20px rgba(0,0,0,0.1),\n    0 0 40px rgba(16, 185, 129, 0.05),\n    inset 0 0 0 1px rgba(255,255,255,1);");

// Make labels pop more
css = css.replace(/\.form-group label \{\s*display: block;\s*font-size: 0\.75rem;\s*font-weight: 700;\s*color: var\(--on-surface, #1b1c19\);\s*margin-bottom: 0\.5rem;/g, 
  ".form-group label {\n  display: block;\n  font-size: 0.8rem;\n  font-weight: 700;\n  color: #334155;\n  margin-bottom: 0.75rem;");

// Increase input padding for premium feel
css = css.replace(/padding: 1rem 1\.25rem;/g, "padding: 1.125rem 1.25rem;");
css = css.replace(/border-radius: 12px;/g, "border-radius: 12px;");

// Add a focus ring offset to make it look Apple-like
css = css.replace(/box-shadow: 0 0 0 4px rgba\(16, 185, 129, 0\.15\), inset 0 2px 4px rgba\(0,0,0,0\.02\);/g, 
  "box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15), 0 4px 12px rgba(0,0,0,0.05);");

fs.writeFileSync("src/pages/contacto/contacto.css", css);
