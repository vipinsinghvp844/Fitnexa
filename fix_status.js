import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /export interface GymTrainerSummary \{\s*id: number;/g,
  'export interface GymTrainerSummary {\n  id: number;\n  status?: string | null;'
);
content = content.replace(
  /export interface GymTrainerDetails \{\s*id: number;/g,
  'export interface GymTrainerDetails {\n  id: number;\n  status?: string | null;'
);

fs.writeFileSync(filePath, content);
console.log('Added status to GymTrainer');
