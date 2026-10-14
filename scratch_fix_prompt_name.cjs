const fs = require('fs');
const path = 'c:/Users/whilmis/Documents/GitHub/Hormesis-back/src/services/execution.engine.ts';

let content = fs.readFileSync(path, 'utf8');
content = content.replace('promptUsed: stitchPrompt,', 'promptUsed: systemPrompt,');
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed stitchPrompt in execution.engine.ts');
