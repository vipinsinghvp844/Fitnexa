import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/\\n/g, '\n');

fs.writeFileSync(filePath, content);
console.log('Fixed literal newlines');
