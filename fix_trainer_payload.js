import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /export interface CreateGymTrainerPayload \{\s*user_id\?: number;/g,
  'export interface CreateGymTrainerPayload {\n  user_id?: number;\n  avatar?: string | null;'
);
content = content.replace(
  /export interface UpdateGymTrainerPayload \{\s*user_id\?: number;/g,
  'export interface UpdateGymTrainerPayload {\n  user_id?: number;\n  avatar?: string | null;'
);

fs.writeFileSync(filePath, content);
console.log('Added avatar to Trainer Payloads');
