import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

const staffAliases = `
export type GymStaffSummary = GymEmployeeSummary;
export type GymStaffDetails = GymEmployeeDetails;
`;
if (!content.includes('GymStaffSummary = GymEmployeeSummary')) {
  content += staffAliases;
  fs.writeFileSync(filePath, content);
  console.log('Added GymStaff aliases to gym.ts');
}

// Ensure GymEmployeeSummary has avatar
const file2 = 'lib/gym.ts';
let content2 = fs.readFileSync(file2, 'utf8');
content2 = content2.replace(
  /export interface GymEmployeeSummary \{\s*id: number;/g,
  'export interface GymEmployeeSummary {\n  id: number;\n  avatar?: string | null;'
);
content2 = content2.replace(
  /export interface GymEmployeeDetails \{\s*id: number;/g,
  'export interface GymEmployeeDetails {\n  id: number;\n  avatar?: string | null;'
);
fs.writeFileSync(file2, content2);
console.log('Added avatar to GymEmployee');
