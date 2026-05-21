import { request } from './api';

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface GymDashboardMetrics {
  active_members: number;
  active_trainers: number;
  scheduled_classes: number;
}

export interface GymClassSummary {
  image?: string | null;
  intensity?: string | null;
  id: number;
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
}

export interface GymMemberSummary {
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
}

export interface GymMemberMembershipSummary {
  id: number;
  plan_id: number;
  plan: GymMembershipPlanSummary | null;
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'expired' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  final_amount: string | number;
  created_at?: string | null;
}

export interface GymTrainerSummary {
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
}

export type GymAttendanceStatus = 'present' | 'missed';
export type GymAttendanceSource = 'manual' | 'qr' | 'biometric';

export interface GymAttendanceRecord {
  id: number;
  member_id: number;
  member: {
    id: number | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    status: string | null;
  } | null;
  trainer_id: number | null;
  trainer: {
    id: number;
    name: string | null;
    email: string | null;
    specialization: string | null;
  } | null;
  check_in_time: string | null;
  check_out_time: string | null;
  date: string | null;
  status: GymAttendanceStatus;
  source: GymAttendanceSource;
  notes: string | null;
  duration_minutes: number | null;
  is_inside: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface GymAttendanceTodaySummary {
  date: string;
  as_of: string;
  total_check_ins: number;
  active_members_today: number;
  currently_inside: number;
  avg_visit_duration_minutes: number | null;
  source_mix: Record<GymAttendanceSource, number>;
}

export type GymPaymentMethod = 'cash' | 'online' | 'UPI' | 'card';
export type GymPaymentStatus = 'paid' | 'pending' | 'failed';
export type GymInvoiceStatus = 'paid' | 'unpaid' | 'overdue';

export interface GymBillingPayment {
  id: number;
  member_id: number;
  member: {
    id: number | null;
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  membership_id: number | null;
  membership: {
    id: number;
    plan: {
      id: number | null;
      name: string | null;
    };
    start_date: string | null;
    end_date: string | null;
    payment_status: string | null;
  } | null;
  invoice: {
    id: number | null;
    invoice_number: string | null;
    status: string | null;
    due_date: string | null;
  } | null;
  amount: string | number;
  discount: string | number;
  final_amount: string | number;
  payment_method: GymPaymentMethod;
  payment_status: GymPaymentStatus;
  transaction_id: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string | null;
}

export interface GymBillingInvoice {
  id: number;
  invoice_number: string | null;
  member_id: number;
  member: {
    id: number | null;
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  membership_id: number | null;
  membership: {
    id: number;
    plan: {
      id: number | null;
      name: string | null;
    };
    start_date: string | null;
    end_date: string | null;
    payment_status: string | null;
  } | null;
  total_amount: string | number;
  discount: string | number;
  final_amount: string | number;
  status: GymInvoiceStatus;
  due_date: string | null;
  payments_count?: number;
  created_at: string | null;
}

export interface GymBillingDashboard {
  total_revenue: number;
  today_revenue: number;
  pending_payments: number;
  monthly_revenue: number;
  unpaid_invoices: number;
  overdue_amount: number;
  recent_payments: GymBillingPayment[];
}

export interface GymMembershipPlanSummary {
  id: number;
  name: string;
  price: string | number;
  duration_days: number;
  features: unknown;
  created_at: string | null;
  updated_at: string | null;
}


export interface GymEmployeeSummary {
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
}

export interface GymDashboardKPIs {
  total_revenue: number;
  total_members: number;
  active_members: number;
  trainers_count: number;
  today_attendance: number;
  today_revenue: number;
  pending_payments: number;
}

export interface GymDashboardAttendanceSnapshot {
  check_ins_today: number;
  currently_in_gym: number;
  absent_members: number;
}

export interface GymDashboardExpiryAlert {
  id: number;
  member_name: string;
  plan_name: string;
  end_date: string;
  days_remaining: number;
}

export interface GymDashboardRecentActivity {
  id: string | number;
  type: 'checkin' | 'payment' | 'new_member' | string;
  title: string;
  time: string;
}

export interface GymDashboardChartData {
  label: string;
  amount?: number;
  visits?: number;
}

export interface GymDashboardTopTrainer {
  id: number;
  name: string;
  specialization: string;
  assigned_members: number;
}

export interface GymDashboardResponse {
  kpis: GymDashboardKPIs;
  attendance_snapshot: GymDashboardAttendanceSnapshot;
  expiry_alerts: GymDashboardExpiryAlert[];
  recent_activity: GymDashboardRecentActivity[];
  revenue_trend: GymDashboardChartData[];
  attendance_trend: GymDashboardChartData[];
  top_trainers: GymDashboardTopTrainer[];
}

export type GymNotificationCategory = 'renewal' | 'payment' | 'alert' | 'system';
export type GymNotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type GymNotificationChannel = 'in_app' | 'email' | 'sms' | 'whatsapp';

export interface GymNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  category: GymNotificationCategory;
  channel: GymNotificationChannel;
  priority: GymNotificationPriority;
  read: boolean;
  data: {
    member_id?: number;
    member_name?: string;
    membership_id?: number;
    plan_name?: string;
    invoice_id?: number;
    invoice_number?: string;
    amount?: number;
    final_amount?: number;
    end_date?: string;
    due_date?: string;
    days_remaining?: number;
    status?: string;
  } | null;
  notifiable_type: string | null;
  notifiable_id: number | null;
  expires_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  time_ago: string | null;
}

export interface GymNotificationCounts {
  expiring_soon: number;
  pending_payments: number;
  overdue_payments: number;
  unread_notifications: number;
}

export function getGymDashboard() {
  return request('/api/gym/dashboard', { method: 'GET' });
}

export function getGymNotifications(query?: Record<string, string | number | boolean | null>) {
  return request('/api/gym/notifications', { method: 'GET' }, query);
}

export function getGymNotificationCounts() {
  return request('/api/gym/notifications/counts', { method: 'GET' });
}

export function generateGymNotifications() {
  return request('/api/gym/notifications/generate', { method: 'POST' });
}

export function markGymNotificationRead(notificationId: number) {
  return request(`/api/gym/notifications/${notificationId}/read`, { method: 'PUT' });
}

export function markAllGymNotificationsRead() {
  return request('/api/gym/notifications/read-all', { method: 'PUT' });
}

// --- Reports ---

export interface GymReportOverview {
  kpis: {
    total_revenue: number;
    revenue_growth: number;
    active_members: number;
    new_members: number;
    total_attendance: number;
  };
  insights: string[];
}

export interface GymReportRevenue {
  trend: Array<{ label: string; amount: number }>;
  methods: Array<{ name: string; value: number }>;
  insights: string[];
}

export interface GymReportMemberships {
  kpis: {
    active: number;
    expired_in_period: number;
    churn_rate: number;
    expiring_next_7_days: number;
  };
  growth_trend: Array<{ label: string; members: number }>;
  status_breakdown: Array<{ name: string; value: number }>;
  insights: string[];
}

export interface GymReportAttendance {
  trend: Array<{ label: string; visits: number }>;
  peak_hours: Array<{ label: string; visits: number }>;
  insights: string[];
}

export interface GymReportTrainers {
  distribution: Array<{ name: string; value: number }>;
  details: Array<{ id: number; name: string; specialization: string | null; assigned_members: number }>;
  insights: string[];
}

export function getGymReportOverview(query?: Record<string, string | null>) {
  return request('/api/gym/reports/overview', { method: 'GET' }, query);
}

export function getGymReportRevenue(query?: Record<string, string | null>) {
  return request('/api/gym/reports/revenue', { method: 'GET' }, query);
}

export function getGymReportMemberships(query?: Record<string, string | null>) {
  return request('/api/gym/reports/memberships', { method: 'GET' }, query);
}

export function getGymReportAttendance(query?: Record<string, string | null>) {
  return request('/api/gym/reports/attendance', { method: 'GET' }, query);
}

export function getGymReportTrainers(query?: Record<string, string | null>) {
  return request('/api/gym/reports/trainers', { method: 'GET' }, query);
}

// --- End Reports ---

export function getGymMembers(query?: Record<string, string | number | boolean | null>) {
  return request('/api/gym/members', { method: 'GET' }, query);
}

export function getGymMember(memberId: number) {
  return request(`/api/gym/members/${memberId}`, { method: 'GET' });
}

export function getGymTrainers(query?: Record<string, string | number | boolean | null>) {
  return request('/api/gym/trainers', { method: 'GET' }, query);
}

export function getGymAttendance(query?: Record<string, string | number | boolean | null>) {
  return request('/api/gym/attendance', { method: 'GET' }, query);
}

export function getGymAttendanceToday(query?: Record<string, string | number | boolean | null>) {
  return request('/api/gym/attendance/today', { method: 'GET' }, query);
}

export function checkInGymMember(payload: {
  member_id: number;
  trainer_id?: number | null;
  source?: GymAttendanceSource;
  notes?: string | null;
}) {
  return request('/api/gym/attendance/check-in', { method: 'POST', body: JSON.stringify(payload) });
}

export function checkOutGymAttendance(attendanceId: number, payload?: { notes?: string | null }) {
  return request(`/api/gym/attendance/${attendanceId}/check-out`, {
    method: 'POST',
    body: JSON.stringify(payload ?? {}),
  });
}

export function getGymBillingDashboard() {
  return request('/api/gym/billing/dashboard', { method: 'GET' });
}

export function getGymBillingPayments(query?: Record<string, string | number | boolean | null>) {
  return request('/api/gym/billing/payments', { method: 'GET' }, query);
}

export function getGymBillingInvoices(query?: Record<string, string | number | boolean | null>) {
  return request('/api/gym/billing/invoices', { method: 'GET' }, query);
}

export interface CreateGymBillingPaymentPayload {
  member_id: number;
  membership_id?: number | null;
  amount: number;
  discount?: number;
  payment_method: GymPaymentMethod;
  payment_status: GymPaymentStatus;
  transaction_id?: string | null;
  paid_at?: string | null;
  notes?: string | null;
}

export function createGymBillingPayment(payload: CreateGymBillingPaymentPayload) {
  return request('/api/gym/billing/payments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getGymClasses(query?: Record<string, string | number | boolean | null>) {
  return request('/api/gym/classes', { method: 'GET' }, query);
}

export function getGymMembershipPlans(query?: Record<string, string | number | boolean | null>) {
  return request('/api/gym/membership-plans', { method: 'GET' }, query);
}

export function createGymMembershipPlan(payload: { name: string; price: number; duration_days: number; features?: string[] }) {
  return request('/api/gym/membership-plans', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateGymMembershipPlan(id: number, payload: Partial<{ name: string; price: number; duration_days: number; features?: string[] }>) {
  return request(`/api/gym/membership-plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteGymMembershipPlan(id: number) {
  return request(`/api/gym/membership-plans/${id}`, {
    method: 'DELETE',
  });
}

export interface CreateGymMemberPayload {
  name: string;
  email: string;
  phone?: string | null;
  profile_picture?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  dob?: string | null; // date (YYYY-MM-DD)
  emergency_contact?: string | null;
  address?: string | null;
  joining_date?: string | null; // date (YYYY-MM-DD)
  membership_plan_id?: number | null;
  status?: 'active' | 'inactive' | 'suspended';
  assigned_trainer_id?: number | null;
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  final_amount?: number | null;
}

export function createGymMember(payload: CreateGymMemberPayload) {
  return request('/api/gym/members', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateGymMember(memberId: number, payload: Partial<CreateGymMemberPayload>) {
  return request(`/api/gym/members/${memberId}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deleteGymMember(memberId: number) {
  return request(`/api/gym/members/${memberId}`, { method: 'DELETE' });
}

export interface CreateGymTrainerPayload {
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
}

export function createGymTrainer(payload: CreateGymTrainerPayload) {
  return request('/api/gym/trainers', { method: 'POST', body: JSON.stringify(payload) });
}

export function deleteGymTrainer(trainerId: number) {
  return request(`/api/gym/trainers/${trainerId}`, { method: 'DELETE' });
}

export function assignGymMembersToTrainer(trainerId: number, member_ids: number[], assigned_date?: string) {
  return request(`/api/gym/trainers/${trainerId}/assign-members`, {
    method: 'POST',
    body: JSON.stringify({
      member_ids,
      assigned_date: assigned_date ?? null,
    }),
  });
}

export function getGymStaff(query?: Record<string, string | number | boolean | null>) {
  return request('/api/gym/staff', { method: 'GET' }, query);
}

export interface CreateGymStaffPayload {
  name: string;
  email: string;
  phone?: string | null;
  position: string;
  salary?: number | null;
  shift?: string | null;
  hire_date: string; // date (YYYY-MM-DD)
  branch_id: number;
  role: 'manager' | 'trainer' | 'receptionist' | 'accountant';
  specialization?: string | null;
  experience_years?: number | null;
  certifications?: string | null;
  bio?: string | null;
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
}

export function createGymStaff(payload: CreateGymStaffPayload) {
  return request('/api/gym/staff', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateGymStaff(staffId: number, payload: Partial<CreateGymStaffPayload>) {
  return request(`/api/gym/staff/${staffId}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deleteGymStaff(staffId: number) {
  return request(`/api/gym/staff/${staffId}`, { method: 'DELETE' });
}

// --- Classes & Scheduling ---

export interface GymClassSchedule {
  id?: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string | null;
}

export interface GymClassBooking {
  id: number;
  member_id: number;
  schedule_id: number;
  booking_date: string;
  status: 'booked' | 'attended' | 'cancelled';
  member?: {
    id: number;
    user?: { name: string; email: string };
  };
}

export interface GymClassDetails {
  image?: string | null;
  intensity?: string | null;
  id: number;
  name: string;
  description?: string;
  category?: string;
  capacity?: number;
  duration?: number;
  status: 'active' | 'inactive';
  trainer_id?: number;
  trainer?: {
    id: number;
    user?: { name: string };
  };
  schedules?: GymClassSchedule[];
  bookings?: GymClassBooking[];
  bookings_count?: number;
}



export function getGymClassDetails(id: number) {
  return request(`/api/gym/classes/${id}`, { method: 'GET' });
}

export function createGymClass(payload: Record<string, unknown>) {
  return request('/api/gym/classes', { method: 'POST', body: JSON.stringify(payload) });
}

export function bookGymClass(classId: number, payload: { schedule_id: number; member_id: number; booking_date: string }) {
  return request(`/api/gym/classes/${classId}/book`, { method: 'POST', body: JSON.stringify(payload) });
}

export function updateGymClassBookingStatus(bookingId: number, status: 'attended' | 'cancelled') {
  return request(`/api/gym/classes/bookings/${bookingId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
}

// ─── Expenses & Categories ───────────────────────────────────────────────────

export type ExpensePaymentMethod = 'cash' | 'bank' | 'UPI';

export interface ExpenseCategory {
  id: number;
  name: string;
  description: string | null;
  expenses_count?: number;
  created_at: string | null;
}

export interface Expense {
  id: number;
  expense_category_id: number;
  category: ExpenseCategory | null;
  amount: string | number;
  expense_date: string;
  payment_method: ExpensePaymentMethod;
  description: string | null;
  recorded_by: number | null;
  created_at: string | null;
}

export interface ExpenseDashboard {
  today_expenses: number;
  month_expenses: number;
  total_expenses_all: number;
  month_revenue: number;
  profit: number;
  category_breakdown: Array<{ category: string; total: number }>;
  method_breakdown: Array<{ method: string; total: number }>;
  trend: Array<{ label: string; total: number }>;
  recent_expenses: Expense[];
}

export interface CreateExpensePayload {
  expense_category_id: number;
  amount: number;
  expense_date: string;
  payment_method: ExpensePaymentMethod;
  description?: string | null;
}

export interface CreateExpenseCategoryPayload {
  name: string;
  description?: string | null;
}

// Categories
export function getExpenseCategories() {
  return request('/api/gym/expenses/categories', { method: 'GET' });
}

export function createExpenseCategory(payload: CreateExpenseCategoryPayload) {
  return request('/api/gym/expenses/categories', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateExpenseCategory(id: number, payload: Partial<CreateExpenseCategoryPayload>) {
  return request(`/api/gym/expenses/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deleteExpenseCategory(id: number) {
  return request(`/api/gym/expenses/categories/${id}`, { method: 'DELETE' });
}

export function seedDefaultExpenseCategories() {
  return request('/api/gym/expenses/categories/seed-defaults', { method: 'POST' });
}

// Expenses
export function getExpenses(query?: Record<string, string | number | boolean | null>) {
  return request('/api/gym/expenses', { method: 'GET' }, query);
}

export function createExpense(payload: CreateExpensePayload) {
  return request('/api/gym/expenses', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateExpense(id: number, payload: Partial<CreateExpensePayload>) {
  return request(`/api/gym/expenses/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deleteExpense(id: number) {
  return request(`/api/gym/expenses/${id}`, { method: 'DELETE' });
}

export function getExpenseDashboard() {
  return request('/api/gym/expenses/dashboard', { method: 'GET' });
}

// ─── Payroll ─────────────────────────────────────────────────────────────────

export interface PayrollRecord {
  id: number;
  employee_id: number;
  employee?: {
    id: number;
    salary: number | null;
    position: string | null;
    role: string | null;
    status: string | null;
    user?: { name: string; email: string };
    branch?: { name: string };
  };
  month: number;
  year: number;
  base_salary: string | number;
  bonuses: string | number;
  deductions: string | number;
  gross_salary: string | number;
  net_salary: string | number;
  status: 'pending' | 'paid';
  paid_at: string | null;
  notes: string | null;
  expense_id: number | null;
}

export interface PayrollDashboard {
  total_this_month: number;
  paid_this_month: number;
  pending_this_month: number;
  pending_count: number;
  paid_count: number;
  recent_payrolls: PayrollRecord[];
}

export function getPayrollDashboard() {
  return request('/api/gym/payroll/dashboard', { method: 'GET' });
}

export function getPayrolls(query?: Record<string, string | number | boolean | null>) {
  return request('/api/gym/payroll', { method: 'GET' }, query);
}

export function generatePayroll(month: number, year: number) {
  return request('/api/gym/payroll/generate', { method: 'POST', body: JSON.stringify({ month, year }) });
}

export function updatePayroll(id: number, payload: { bonuses?: number; deductions?: number; notes?: string }) {
  return request(`/api/gym/payroll/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function markPayrollPaid(id: number) {
  return request(`/api/gym/payroll/${id}/mark-paid`, { method: 'POST' });
}

export function deletePayroll(id: number) {
  return request(`/api/gym/payroll/${id}`, { method: 'DELETE' });
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface GymProfile {
  id: number;
  header_data?: any;
  footer_data?: any;
  name: string;
  slug?: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip: string | null;
  description: string | null;
  logo_url: string | null;
  website_enabled?: boolean;
  website_template?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  custom_domain?: string | null;
  custom_domain_verified?: boolean;
  opening_hours?: Record<string, string> | null;
  social_links?: Record<string, string> | null;
  banner_image?: string | null;
  trainers_data?: Array<{ name: string; specialization: string; avatar: string }> | null;
  pricing_plans?: Array<{ name: string; price: string; features: string[] }> | null;
  gallery_images?: Array<string | { url: string; category: string; caption: string }> | null;
  services?: string[] | null;
  classes_data?: Array<{ name: string; description: string; duration: string; intensity: string; image: string; trainer: string }> | null;
  blogs_data?: Array<{ title: string; excerpt: string; date: string; year: string; image: string }> | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface GymUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  roles?: Array<{ id: number; name: string }>;
}

export function getGymProfile() {
  return request('/api/gym/settings/profile', { method: 'GET' });
}

export function updateGymProfile(payload: Partial<GymProfile>) {
  return request('/api/gym/settings/profile', { method: 'PUT', body: JSON.stringify(payload) });
}

export async function uploadGymLogo(file: File) {
  const formData = new FormData();
  formData.append('logo', file);
  return request('/api/gym/settings/profile/logo', {
    method: 'POST',
    body: formData,
  });
}

export function getGymKVSettings() {
  return request('/api/gym/settings/kv', { method: 'GET' });
}

export function updateGymKVSettings(settings: object) {
  return request('/api/gym/settings/kv', { method: 'PUT', body: JSON.stringify({ settings }) });
}

export function getGymUsers() {
  return request('/api/gym/settings/users', { method: 'GET' });
}

export function createGymUser(payload: Record<string, unknown>) {
  return request('/api/gym/settings/users', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateGymUser(id: number, payload: Record<string, unknown>) {
  return request(`/api/gym/settings/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function toggleGymUserStatus(id: number) {
  return request(`/api/gym/settings/users/${id}/toggle-status`, { method: 'PATCH' });
}

export function getGymRoles() {
  return request('/api/gym/settings/roles', { method: 'GET' });
}

// ── Payment Gateway Settings ──────────────────────────────────────────────────

export type GymPaymentProvider = 'stripe' | 'razorpay' | 'offline';
export type GymPaymentMode = 'test' | 'live';

export interface GymPaymentSettings {
  payment_provider: GymPaymentProvider;
  payment_mode: GymPaymentMode;
  stripe_public_key: string;
  /** Returns '••••••••' if a real key is stored; empty string if not configured. */
  stripe_secret_key: string;
  razorpay_key: string;
  /** Returns '••••••••' if a real key is stored; empty string if not configured. */
  razorpay_secret: string;
  /** Returns '••••••••' if a real key is stored; empty string if not configured. */
  webhook_secret: string;
  /** Computed by server: true when the active provider has its keys configured. */
  payments_enabled: boolean;
}

export function getGymPaymentSettings() {
  return request('/api/gym/settings/payment', { method: 'GET' });
}

export function updateGymPaymentSettings(payload: Partial<GymPaymentSettings>) {
  return request('/api/gym/settings/payment', { method: 'PUT', body: JSON.stringify(payload) });
}

// ----------------------------------------------------------------------
// Platform Subscriptions (SaaS Billing)
// ----------------------------------------------------------------------

export interface PlatformPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  final_price: number;
  duration: number;
  max_members: number | null;
  max_trainers: number | null;
  max_branches: number | null;
  features: string[] | null;
}

export interface PlatformSubscription {
  id: number;
  plan: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  grace_period_ends_at: string | null;
  is_active: boolean;
}

export interface PlatformCouponPreview {
  coupon: {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    max_discount: number | null;
    usage_limit: number | null;
    used_count: number;
    valid_until: string | null;
  } | null;
  price: number;
  plan_discount: number;
  coupon_discount: number;
  discount_amount: number;
  final_amount: number;
}

export async function getPlatformPlans() {
  return request('/api/gym/platform/plans', { method: 'GET' });
}

export async function getCurrentPlatformSubscription() {
  return request('/api/gym/platform/subscription', { method: 'GET' });
}

export async function validatePlatformCoupon(plan_id: number, coupon_code: string) {
  const response = await request('/api/gym/platform/coupon/validate', {
    method: 'POST',
    body: JSON.stringify({ plan_id, coupon_code }),
  });
  return response.data as PlatformCouponPreview;
}

export async function subscribeToPlatformPlan(plan_id: number, payment_provider: 'stripe' | 'razorpay', coupon_code?: string | null) {
  return request('/api/gym/platform/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      plan_id,
      payment_provider,
      coupon_code: coupon_code || undefined,
      success_url: `${window.location.origin}/gym/subscription/success`,
      cancel_url: `${window.location.origin}/gym/subscription`,
    }),
  });
}

export async function confirmStripePlatformSubscription(session_id: string) {
  return request('/api/gym/platform/stripe/confirm', {
    method: 'POST',
    body: JSON.stringify({ session_id }),
  });
}

export async function confirmRazorpayPlatformSubscription(payload: {
  payment_id: string;
  order_id: string;
  signature: string;
}) {
  return request('/api/gym/platform/razorpay/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Additional Exports ──────────────────────────────────────────────────────

export async function deleteGymClass(id: string | number) {
  return await request(`/api/gym/classes/${id}`, { method: 'DELETE' });
}

export async function getGymStaffMember(id: string | number) {
  return await request(`/api/gym/staff/${id}`);
}

export async function getGymTrainer(id: string | number) {
  return await request(`/api/gym/trainers/${id}`);
}

export async function updateGymTrainer(id: string | number, data: Partial<CreateGymTrainerPayload>) {
  return await request(`/api/gym/trainers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export interface GymEmployeeDetails extends GymEmployeeSummary {}

export type GymStaffSummary = GymEmployeeSummary;
export type GymStaffDetails = GymEmployeeDetails;

export function updateGymClass(id: number, payload: any) { return request(`/api/gym/classes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); }
