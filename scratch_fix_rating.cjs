const fs = require('fs');
const path = 'c:/Users/whilmis/Documents/GitHub/Hormesis-back/src/services/execution.engine.ts';

let content = fs.readFileSync(path, 'utf8');
content = content.replace('const leadRating = lead.rating ||', 'const leadRating = (lead as any).rating ||');
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed leadRating in execution.engine.ts');
