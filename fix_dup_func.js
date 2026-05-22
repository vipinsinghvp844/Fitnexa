import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// The script added these multiple times at the bottom
const t1 = "export function deleteGymClass(id: number) { return request(`/api/gym/classes/${id}`, { method: 'DELETE' }); }";
const t2 = "export function getGymStaffMember(id: number) { return request(`/api/gym/staff/${id}`, { method: 'GET' }); }";

// We'll split the content by newlines and keep only the FIRST occurrence of these functions if they exist,
// actually the best way is to keep the ones defined earlier and remove the ones at the end.
content = content.replace(new RegExp(t1.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&') + "\\n?", "g"), "");
content = content.replace(new RegExp(t2.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&') + "\\n?", "g"), "");

// Then add them EXACTLY once at the end.
content += \`\\n\${t1}\\n\${t2}\\n\`;

// Let's also check for updateGymClass duplicate
const t3 = "export function updateGymClass(id: number, payload: any) { return request(`/api/gym/classes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); }";
content = content.replace(new RegExp(t3.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&') + "\\n?", "g"), "");
content += \`\\n\${t3}\\n\`;

fs.writeFileSync(filePath, content);
console.log('Cleaned up duplicates');
