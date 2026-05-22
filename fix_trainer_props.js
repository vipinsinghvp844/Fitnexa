import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

const trainerProps = `
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
`;

content = content.replace(
  /export interface GymTrainerSummary \{\s*id: number;/g,
  'export interface GymTrainerSummary {\n  id: number;' + trainerProps
);
content = content.replace(
  /export interface GymTrainerDetails \{\s*id: number;/g,
  'export interface GymTrainerDetails {\n  id: number;' + trainerProps
);

fs.writeFileSync(filePath, content);
console.log('Added missing props to GymTrainer');
