import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /export interface CreateGymTrainerPayload \{/g,
  'export interface CreateGymTrainerPayload {\n  avatar?: string | null;'
);
content = content.replace(
  /export interface UpdateGymTrainerPayload \{/g,
  'export interface UpdateGymTrainerPayload {\n  avatar?: string | null;'
);

fs.writeFileSync(filePath, content);
console.log('Added avatar to Trainer Payloads again');
