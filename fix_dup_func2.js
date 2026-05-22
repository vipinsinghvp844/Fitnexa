import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// The script added these multiple times at the bottom
const t1 = "export function deleteGymClass(id: number) { return request(`/api/gym/classes/${id}`, { method: 'DELETE' }); }";
const t2 = "export function getGymStaffMember(id: number) { return request(`/api/gym/staff/${id}`, { method: 'GET' }); }";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'); // $& means the whole matched string
}

content = content.replace(new RegExp(escapeRegExp(t1) + "\\n?", "g"), "");
content = content.replace(new RegExp(escapeRegExp(t2) + "\\n?", "g"), "");

content += '\\n' + t1 + '\\n' + t2 + '\\n';

const t3 = "export function updateGymClass(id: number, payload: any) { return request(`/api/gym/classes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); }";
content = content.replace(new RegExp(escapeRegExp(t3) + "\\n?", "g"), "");
content += '\\n' + t3 + '\\n';

fs.writeFileSync(filePath, content);
console.log('Cleaned up duplicates');
