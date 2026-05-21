import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Find GymClassDetails and add image and intensity
content = content.replace(
  'export interface GymClassDetails {',
  'export interface GymClassDetails {\n  image?: string | null;\n  intensity?: string | null;'
);

// Find GymClassSummary and add image and intensity
content = content.replace(
  'export interface GymClassSummary {',
  'export interface GymClassSummary {\n  image?: string | null;\n  intensity?: string | null;'
);


fs.writeFileSync(filePath, content);
console.log('Fixed GymClassDetails in gym.ts');
