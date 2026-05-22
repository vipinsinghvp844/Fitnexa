import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Add profile_picture to CreateGymMemberPayload
content = content.replace(
  /export interface CreateGymMemberPayload \{\s*name: string;/g,
  'export interface CreateGymMemberPayload {\n  name: string;\n  profile_picture?: string | null;'
);

// Add profile_picture to UpdateGymMemberPayload
content = content.replace(
  /export interface UpdateGymMemberPayload \{\s*name\?: string;/g,
  'export interface UpdateGymMemberPayload {\n  name?: string;\n  profile_picture?: string | null;'
);

fs.writeFileSync(filePath, content);
console.log('Fixed Create/UpdateGymMemberPayload in gym.ts');
