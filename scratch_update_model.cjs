const fs = require('fs');
const path = 'c:/Users/whilmis/Documents/GitHub/Hormesis-back/src/services/execution.engine.ts';

let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'models/gemini-2.5-flash:generateContent',
  'models/gemini-3.8-flash:generateContent'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated model to gemini-3.8-flash in execution.engine.ts');
