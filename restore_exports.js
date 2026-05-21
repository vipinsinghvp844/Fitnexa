import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

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
  fs.writeFileSync(filePath, content);
  console.log('Restored missing exports');
} else {
  console.log('Exports already exist');
}
