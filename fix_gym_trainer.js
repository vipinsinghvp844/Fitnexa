import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// I need to find GymTrainerSummary and replace the whole block until updated_at.
const regex = /export interface GymTrainerSummary \{[\s\S]*?updated_at: string \| null;\n\}/m;

const replacement = `export interface GymTrainerSummary {
  id: number;
  avatar?: string | null;
  phone?: string | null;
  specialization?: string | null;
  experience_years?: number | null;
  shift?: string | null;
  salary?: string | number | null;
  bio?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  linkedin_url?: string | null;
  certifications?: string | null;
  status?: string | null;
  user: {
    id: number | null;
    name: string | null;
    email: string | null;
  };
  created_at: string | null;
  updated_at: string | null;
}`;

content = content.replace(regex, replacement);

const regex2 = /export interface CreateGymTrainerPayload \{[\s\S]*?status\?: 'active' \| 'inactive' \| 'suspended';\n\}/m;
const replacement2 = `export interface CreateGymTrainerPayload {
  avatar?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  specialization?: string | null;
  experience_years?: number | null;
  certifications?: string | null;
  salary?: number | null;
  shift?: string | null;
  status?: 'active' | 'inactive' | 'suspended';
}`;

content = content.replace(regex2, replacement2);

fs.writeFileSync(filePath, content);
console.log('Fixed GymTrainerSummary via script');
