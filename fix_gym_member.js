import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Find GymMemberSummary and add profile_picture
content = content.replace(
  'export interface GymMemberSummary {\n  id: number;',
  'export interface GymMemberSummary {\n  id: number;\n  profile_picture?: string | null;'
);

fs.writeFileSync(filePath, content);
console.log('Fixed GymMemberSummary in gym.ts');
