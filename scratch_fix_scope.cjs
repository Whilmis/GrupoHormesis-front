const fs = require('fs');
const path = 'c:/Users/whilmis/Documents/GitHub/Hormesis-back/src/services/execution.engine.ts';

let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'let stitchProjectId = \'\';',
  'let stitchProjectId = \'\';\n      let systemPrompt = \'\';'
);

content = content.replace(
  'const systemPrompt = `Eres un Diseñador Web',
  'systemPrompt = `Eres un Diseñador Web'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed systemPrompt scope in execution.engine.ts');
