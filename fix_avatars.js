import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Add avatar to GymTrainerSummary
content = content.replace(
  /export interface GymTrainerSummary \{\s*id: number;/g,
  'export interface GymTrainerSummary {\n  id: number;\n  avatar?: string | null;'
);

// Add avatar to GymTrainerDetails
content = content.replace(
  /export interface GymTrainerDetails \{\s*id: number;/g,
  'export interface GymTrainerDetails {\n  id: number;\n  avatar?: string | null;'
);

// Add avatar to GymStaffSummary
content = content.replace(
  /export interface GymStaffSummary \{\s*id: number;/g,
  'export interface GymStaffSummary {\n  id: number;\n  avatar?: string | null;'
);

// Add avatar to GymStaffDetails
content = content.replace(
  /export interface GymStaffDetails \{\s*id: number;/g,
  'export interface GymStaffDetails {\n  id: number;\n  avatar?: string | null;'
);

fs.writeFileSync(filePath, content);
console.log('Fixed Trainer/Staff avatars in gym.ts');
