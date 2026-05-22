import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /export interface GymProfile \{\s*id: number;/g,
  'export interface GymProfile {\n  id: number;\n  header_data?: any;\n  footer_data?: any;'
);

fs.writeFileSync(filePath, content);
console.log('Added header_data and footer_data to GymProfile');
