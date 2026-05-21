import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// We know GymDashboardKPIs exists.
content = content.replace(
  'export interface GymDashboardKPIs {\n  total_members: number;\n  active_members: number;\n  trainers_count: number;\n  today_attendance: number;\n  today_revenue: number;',
  'export interface GymDashboardKPIs {\n  total_members: number;\n  active_members: number;\n  trainers_count: number;\n  today_attendance: number;\n  total_revenue: number;\n  today_revenue: number;'
);

fs.writeFileSync(filePath, content);
console.log('Fixed gym.ts (GymDashboardKPIs)');
