import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Ensure GymEmployeeSummary has specializations
content = content.replace(
  /export interface GymEmployeeSummary \{\s*id: number;/g,
  'export interface GymEmployeeSummary {\n  id: number;\n  specialization?: string | null;\n  experience_years?: number | null;\n  certifications?: string | null;'
);
content = content.replace(
  /export interface GymEmployeeDetails \{\s*id: number;/g,
  'export interface GymEmployeeDetails {\n  id: number;\n  specialization?: string | null;\n  experience_years?: number | null;\n  certifications?: string | null;'
);

fs.writeFileSync(filePath, content);
console.log('Added specializations to GymEmployee');
