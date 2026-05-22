import * as fs from 'fs';

const filePath = 'app/gym/dashboard/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /value=\{formatCurrency\(data\.kpis\.total_revenue\)\}/g,
  'value={formatCurrency(data.kpis.total_revenue || 0)}'
);

fs.writeFileSync(filePath, content);
console.log('Fixed dashboard page');
