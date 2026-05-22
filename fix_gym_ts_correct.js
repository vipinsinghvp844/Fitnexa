import * as fs from 'fs';

const filePath = 'lib/gym.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace GymClassSummary
content = content.replace(
  /export interface GymClassSummary \{[\s\S]*?updated_at: string \| null;\n\}/m,
  `export interface GymClassSummary {
  id: number;
  image?: string | null;
  intensity?: string | null;
  name: string;
  description: string | null;
  category: string | null;
  max_participants: number | null;
  duration_minutes: number | null;
  trainer: {
    id: number | null;
    name: string | null;
    email: string | null;
  };
  created_at: string | null;
  updated_at: string | null;
}`
);

// Replace GymDashboardKPIs
content = content.replace(
  /export interface GymDashboardKPIs \{[\s\S]*?pending_payments: number;\n\}/m,
  `export interface GymDashboardKPIs {
  total_members: number;
  active_members: number;
  trainers_count: number;
  today_attendance: number;
  today_revenue: number;
  total_revenue: number;
  pending_payments: number;
}`
);

// Replace GymMemberSummary
content = content.replace(
  /export interface GymMemberSummary \{[\s\S]*?updated_at: string \| null;\n\}/m,
  `export interface GymMemberSummary {
  id: number;
  profile_picture?: string | null;
  user_id: number;
  user: {
    id: number | null;
    name: string | null;
    email: string | null;
  };
  name: string | null;
  email: string | null;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  dob?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  joining_date?: string | null;
  status?: 'active' | 'inactive' | 'suspended' | null;
  membership_plan_id?: number | null;
  membership_plan?: {
    id: number;
    name: string;
    price?: string | number;
    duration_days?: number;
  } | null;
  active_membership?: GymMemberMembershipSummary | null;
  membership_history?: GymMemberMembershipSummary[];
  assigned_trainer_id?: number | null;
  assigned_trainer?: {
    id: number;
    user: {
      id: number | null;
      name: string | null;
      email: string | null;
    };
    status?: string | null;
  } | null;
  created_at: string | null;
  updated_at: string | null;
}`
);

// Replace CreateGymMemberPayload
content = content.replace(
  /export interface CreateGymMemberPayload \{[\s\S]*?final_amount\?: number \| null;\n\}/m,
  `export interface CreateGymMemberPayload {
  name: string;
  profile_picture?: string | null;
  email: string;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  dob?: string | null;
  emergency_contact?: string | null;
  address?: string | null;
  joining_date?: string | null;
  membership_plan_id?: number | null;
  status?: 'active' | 'inactive' | 'suspended';
  assigned_trainer_id?: number | null;
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  final_amount?: number | null;
}`
);

// Replace GymTrainerSummary
content = content.replace(
  /export interface GymTrainerSummary \{[\s\S]*?updated_at: string \| null;\n\}/m,
  `export interface GymTrainerSummary {
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
}`
);

// Replace CreateGymTrainerPayload
content = content.replace(
  /export interface CreateGymTrainerPayload \{[\s\S]*?status\?: 'active' \| 'inactive' \| 'suspended';\n\}/m,
  `export interface CreateGymTrainerPayload {
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
}`
);

// Replace GymEmployeeSummary
content = content.replace(
  /export interface GymEmployeeSummary \{[\s\S]*?updated_at: string \| null;\n\}/m,
  `export interface GymEmployeeSummary {
  id: number;
  avatar?: string | null;
  phone?: string | null;
  specialization?: string | null;
  experience_years?: number | null;
  certifications?: string | null;
  bio?: string | null;
  user_id: number | null;
  user: {
    id: number | null;
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  branch_id: number | null;
  branch: {
    id: number | null;
    name: string | null;
    address: string | null;
    phone: string | null;
  } | null;
  position: string | null;
  hire_date: string | null;
  salary: number | null;
  shift: string | null;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated' | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}`
);

// Add Aliases
if (!content.includes('GymStaffSummary = GymEmployeeSummary')) {
  content += '\\nexport type GymStaffSummary = GymEmployeeSummary;\\nexport type GymStaffDetails = GymEmployeeDetails;\\n';
}
if (!content.includes('export function deleteGymClass')) {
  content += "\\nexport function deleteGymClass(id: number) { return request(`/api/gym/classes/${id}`, { method: 'DELETE' }); }\\n";
}
if (!content.includes('export function updateGymClass')) {
  content += "\\nexport function updateGymClass(id: number, payload: any) { return request(`/api/gym/classes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); }\\n";
}
if (!content.includes('export function getGymStaffMember')) {
  content += "\\nexport function getGymStaffMember(id: number) { return request(`/api/gym/staff/${id}`, { method: 'GET' }); }\\n";
}

// Add GymProfile fields
content = content.replace(
  /export interface GymProfile \{[\s\S]*?description: string \| null;\n\}/m,
  `export interface GymProfile {
  id: number;
  header_data?: any;
  footer_data?: any;
  user_id: number;
  name: string;
  description: string | null;
}`
);

fs.writeFileSync(filePath, content);
console.log('Fixed gym.ts neatly and correctly');
