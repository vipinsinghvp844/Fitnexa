import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Just remove all export function deleteGymClass, getGymStaffMember, updateGymClass
// then append exactly once at EOF.
content = content.replace(/export function deleteGymClass[\s\S]*?\n/g, '');
content = content.replace(/export function getGymStaffMember[\s\S]*?\n/g, '');
content = content.replace(/export function updateGymClass[\s\S]*?\n/g, '');

content += "\nexport function deleteGymClass(id: number) { return request(`/api/gym/classes/${id}`, { method: 'DELETE' }); }";
content += "\nexport function getGymStaffMember(id: number) { return request(`/api/gym/staff/${id}`, { method: 'GET' }); }";
content += "\nexport function updateGymClass(id: number, payload: any) { return request(`/api/gym/classes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); }\n";

fs.writeFileSync(filePath, content);
console.log('Fixed for real');
