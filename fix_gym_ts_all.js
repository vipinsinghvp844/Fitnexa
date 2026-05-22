import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Dashboard KPIs
content = content.replace(
  /export interface GymDashboardKPIs \{/g,
  'export interface GymDashboardKPIs {\n  today_revenue?: number;\n  total_revenue?: number;'
);

// Class Summary
content = content.replace(
  /export interface GymClassSummary \{/g,
  'export interface GymClassSummary {\n  image?: string | null;\n  intensity?: string | null;'
);

// Member Summary
content = content.replace(
  /export interface GymMemberSummary \{/g,
  'export interface GymMemberSummary {\n  profile_picture?: string | null;'
);
content = content.replace(
  /export interface CreateGymMemberPayload \{/g,
  'export interface CreateGymMemberPayload {\n  profile_picture?: string | null;'
);

// Trainer Summary and Details
const extraTrainerProps = `
  avatar?: string | null;
  phone?: string | null;
  specialization?: string | null;
  experience_years?: number | null;
  shift?: string | null;
  salary?: string | number | null;
  bio?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  linkedin_url?: string | null;
  certifications?: string | null;
  status?: string | null;
`;

content = content.replace(
  /export interface GymTrainerSummary \{/g,
  'export interface GymTrainerSummary {' + extraTrainerProps
);
content = content.replace(
  /export interface GymTrainerDetails \{/g,
  'export interface GymTrainerDetails {' + extraTrainerProps
);

content = content.replace(
  /export interface CreateGymTrainerPayload \{/g,
  'export interface CreateGymTrainerPayload {\n  avatar?: string | null;'
);
content = content.replace(
  /export interface UpdateGymTrainerPayload \{/g,
  'export interface UpdateGymTrainerPayload {\n  avatar?: string | null;'
);

// Employee (Staff) Summary
const extraEmployeeProps = `
  avatar?: string | null;
  phone?: string | null;
  specialization?: string | null;
  experience_years?: number | null;
  certifications?: string | null;
  bio?: string | null;
`;

content = content.replace(
  /export interface GymEmployeeSummary \{/g,
  'export interface GymEmployeeSummary {' + extraEmployeeProps
);
content = content.replace(
  /export interface GymEmployeeDetails \{/g,
  'export interface GymEmployeeDetails {' + extraEmployeeProps
);

// Add aliases for Staff
if (!content.includes('export type GymStaffSummary')) {
  content += '\nexport type GymStaffSummary = GymEmployeeSummary;\nexport type GymStaffDetails = GymEmployeeDetails;\n';
}

// Add header_data to GymProfile
content = content.replace(
  /export interface GymProfile \{/g,
  'export interface GymProfile {\n  header_data?: any;\n  footer_data?: any;'
);

// Add exports that are missing
if (!content.includes('export function deleteGymClass')) {
  content += `\nexport function deleteGymClass(id: number) { return request(\`/api/gym/classes/\${id}\`, { method: 'DELETE' }); }\n`;
}
if (!content.includes('export function updateGymClass')) {
  content += `\nexport function updateGymClass(id: number, payload: any) { return request(\`/api/gym/classes/\${id}\`, { method: 'PUT', body: JSON.stringify(payload) }); }\n`;
}
if (!content.includes('export function getGymStaffMember')) {
  content += `\nexport function getGymStaffMember(id: number) { return request(\`/api/gym/staff/\${id}\`, { method: 'GET' }); }\n`;
}

fs.writeFileSync(filePath, content);
console.log('Fixed gym.ts neatly');
