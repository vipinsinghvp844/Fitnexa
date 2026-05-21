import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'export interface GymDashboardKPIs {',
  'export interface GymDashboardKPIs {\n  total_revenue: number;'
);

fs.writeFileSync(filePath, content);
console.log('Fixed GymDashboardKPIs in gym.ts');
