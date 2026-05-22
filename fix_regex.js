import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Use regex to catch any spacing

// GymMemberSummary
content = content.replace(
  /export interface GymMemberSummary \{\s*id: number;/g,
  'export interface GymMemberSummary {\n  id: number;\n  profile_picture?: string | null;'
);

// GymMemberDetails
content = content.replace(
  /export interface GymMemberDetails \{\s*id: number;/g,
  'export interface GymMemberDetails {\n  id: number;\n  profile_picture?: string | null;'
);

// GymClassSummary
content = content.replace(
  /export interface GymClassSummary \{\s*id: number;/g,
  'export interface GymClassSummary {\n  id: number;\n  image?: string | null;\n  intensity?: string | null;'
);

// GymClassDetails
content = content.replace(
  /export interface GymClassDetails \{\s*id: number;/g,
  'export interface GymClassDetails {\n  id: number;\n  image?: string | null;\n  intensity?: string | null;'
);

// GymDashboardKPIs
content = content.replace(
  /today_attendance: number;\s*today_revenue: number;/g,
  'today_attendance: number;\n  total_revenue: number;\n  today_revenue: number;'
);

fs.writeFileSync(filePath, content);
console.log('Fixed gym.ts types using regex');
