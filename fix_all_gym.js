import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add total_revenue to GymDashboardKPIs
content = content.replace(
  'export interface GymDashboardKPIs {\n  total_members: number;\n  active_members: number;\n  trainers_count: number;\n  today_attendance: number;\n  today_revenue: number;',
  'export interface GymDashboardKPIs {\n  total_members: number;\n  active_members: number;\n  trainers_count: number;\n  today_attendance: number;\n  total_revenue: number;\n  today_revenue: number;'
);

// 2. Add profile_picture to GymMemberSummary
content = content.replace(
  'export interface GymMemberSummary {\n  id: number;',
  'export interface GymMemberSummary {\n  id: number;\n  profile_picture?: string | null;'
);

// 3. Add profile_picture to GymMemberDetails
content = content.replace(
  'export interface GymMemberDetails {\n  id: number;',
  'export interface GymMemberDetails {\n  id: number;\n  profile_picture?: string | null;'
);

// 4. Add image, intensity to GymClassSummary and GymClassDetails
content = content.replace(
  'export interface GymClassSummary {\n  id: number;',
  'export interface GymClassSummary {\n  id: number;\n  image?: string | null;\n  intensity?: string | null;'
);
content = content.replace(
  'export interface GymClassDetails {\n  id: number;',
  'export interface GymClassDetails {\n  id: number;\n  image?: string | null;\n  intensity?: string | null;'
);

// 5. Add Missing Exports at the end
const additionalExports = `
// RE-ADDED EXPORTS
export async function deleteGymClass(id: string | number) {
  return await fetchApi(\`/gym/classes/\${id}\`, { method: 'DELETE' });
}

export async function getGymStaffMember(id: string | number) {
  return await fetchApi(\`/gym/staff/\${id}\`);
}

export async function getGymTrainer(id: string | number) {
  return await fetchApi(\`/gym/trainers/\${id}\`);
}

export async function updateGymTrainer(id: string | number, data: any) {
  return await fetchApi(\`/gym/trainers/\${id}\`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
`;
if (!content.includes('deleteGymClass')) {
  content += additionalExports;
}

fs.writeFileSync(filePath, content);
console.log('Fixed ALL gym.ts types and exports');
