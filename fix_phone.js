import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Ensure GymEmployeeSummary has phone
content = content.replace(
  /export interface GymEmployeeSummary \{\s*id: number;/g,
  'export interface GymEmployeeSummary {\n  id: number;\n  phone?: string | null;'
);
content = content.replace(
  /export interface GymEmployeeDetails \{\s*id: number;/g,
  'export interface GymEmployeeDetails {\n  id: number;\n  phone?: string | null;'
);

fs.writeFileSync(filePath, content);
console.log('Added phone to GymEmployee');
