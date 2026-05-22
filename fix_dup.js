import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace duplicate properties in GymTrainerSummary
content = content.replace(
  /export interface GymTrainerSummary \{[\s\S]*?created_at/m,
  (match) => {
    // Keep the first occurrences of these, remove the later non-optional ones
    let newMatch = match.replace(/  specialization: string \| null;\n/g, '');
    newMatch = newMatch.replace(/  experience_years: number \| null;\n/g, '');
    newMatch = newMatch.replace(/  certifications: string \| null;\n/g, '');
    return newMatch;
  }
);

// We should also look at other things that might be duplicated.
// But let's just make sure there's only one specialization in GymTrainerSummary
let t = fs.readFileSync(filePath, 'utf8');

const ts = `
export interface GymTrainerSummary {
  id: number;
  salary?: string | number | null;
  phone?: string | null;
  specialization?: string | null;
  experience_years?: number | null;
  shift?: string | null;
  bio?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  linkedin_url?: string | null;
  certifications?: string | null;

  status?: string | null;
  avatar?: string | null;
  user: {
    id: number | null;
    name: string | null;
    email: string | null;
  };
  created_at: string | null;
  updated_at: string | null;
}
`;

t = t.replace(/export interface GymTrainerSummary \{[\s\S]*?updated_at: string \| null;\n\}/m, ts.trim());

fs.writeFileSync(filePath, t);
console.log('Fixed duplicate properties');
