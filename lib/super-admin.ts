import { request } from './api';

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface PaginatedResponse<T, F = unknown> {
  data: T[];
  meta: PaginationMeta;
  filters?: F;
}

export interface GymSummary {
  id: number;
  name: string;
  slug: string;
  email: string;
  logo_url: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  gst_number: string | null;
  status: 'active' | 'inactive' | 'suspended';
  owner: {
    id: number | null;
    name: string | null;
    email: string | null;
  };
  counts: {
    members: number;
    trainers: number;
    branches: number;
    subscriptions: number;
  };
  platform_revenue?: number;
  active_subscription: {
    id: number;
    plan_id?: number | null;
    plan_name: string | null;
    billing_cycle: string | null;
    status: string;
    start_date: string | null;
    end_date: string | null;
    final_amount: string | number;
  } | null;
  subscriptions?: SubscriptionSummary[];
  recent_invoices?: Array<{
    id: number;
    amount: string | number;
    status: string;
    due_date: string | null;
    payments_count: number;
  }>;
  created_at: string | null;
  updated_at: string | null;
}

export interface PlanSummary {
  id: number;
  name: string;
  slug?: string;
  description: string | null;

  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  duration_days: number;
  duration_months: number;

  base_price: number;
  discount_percentage: number;
  final_price: number;

  max_members: number | null;
  max_trainers: number | null;
  max_branches: number | null;

  max_staff: number | null;
  max_classes: number | null;
  max_inventory_items: number | null;

  is_unlimited: boolean;

  features: string[];

  addons?: string[];

  status: 'active' | 'inactive';
  subscriptions_count: number;

  created_at: string | null;
  updated_at: string | null;
}

export interface SubscriptionSummary {
  id: number;
  tenant: {
    id: number | null;
    name: string | null;
    status: string | null;
    owner_name: string | null;
    owner_email: string | null;
  };
  plan: {
    id: number | null;
    name: string | null;
    billing_cycle: string | null;
    base_price: string | number | null;
  };
  coupon: {
    id: number;
    code: string;
    discount_type: string;
    discount_value: string | number;
  } | null;
  start_date: string | null;
  end_date: string | null;
  renewal_date: string | null;
  next_billing_date: string | null;
  grace_period_ends_at: string | null;
  status: 'active' | 'expired' | 'cancelled' | 'suspended' | 'paused' | 'trial';
  price: string | number;
  discount_amount: string | number;
  final_amount: string | number;
  payment_method: string;
  cancelled_at: string | null;
  paused_at: string | null;
  resumed_at: string | null;
  is_expired: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface CouponSummary {
  id: number;
  tenant: {
    id: number | null;
    name: string | null;
  } | null;
  tenant_id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  type?: 'percentage' | 'fixed';
  discount_value: string | number;
  value?: string | number;
  max_discount: string | number | null;
  valid_from: string | null;
  valid_to: string | null;
  valid_until?: string | null;
  usage_limit: number | null;
  used_count: number;
  status: 'active' | 'inactive';
  is_expired: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaymentSummary {
  id: number;
  amount: string | number;
  discount: string | number;
  final_amount: string | number;
  payment_method: string;
  transaction_id: string | null;
  status: string;
  payment_status: 'paid' | 'pending' | 'failed';
  paid_at: string | null;
  notes: string | null;
  source: string;
  gym: {
    id: number | null;
    name: string | null;
    status: string | null;
  };
  subscription: {
    id: number | null;
    plan_name: string | null;
    plan_type: string | null;
  };
  invoice: {
    id: number | null;
    invoice_number: string | null;
    status: string | null;
    due_date: string | null;
    amount: string | number | null;
    final_amount: string | number | null;
  };
  created_at: string | null;
  updated_at: string | null;
}

export interface ActivitySummary {
  id: number;
  action: string;
  description: string;
  model_type: string | null;
  model_id: number | null;
  tenant?: {
    id: number | null;
    name: string | null;
    status: string | null;
  };
  user?: {
    id: number | null;
    name: string | null;
    email: string | null;
  };
  created_at: string | null;
}

export interface DashboardData {
  metrics: {
    total_gyms: number;
    active_gyms: number;
    inactive_gyms: number;
    trial_gyms: number;
    expired_gyms: number;
    total_members: number;
    total_trainers: number;
    total_revenue: number;
    today_revenue: number;
    monthly_revenue: number;
    yearly_revenue: number;
    failed_payments: number;
    active_subscriptions: number;
    expired_subscriptions: number;
    trial_subscriptions: number;
    cancelled_subscriptions: number;
    suspended_subscriptions: number;
    paused_subscriptions: number;
    total_subscriptions: number;
    monthly_recurring_revenue: number;
    expiring_soon: number;
    renewals_this_month: number;
    new_gyms_this_month: number;
    revenue_growth_percentage: number;
    churn_rate: number;
  };
  charts: {
    gym_growth: ChartPoint[];
    revenue_growth: ChartPoint[];
    growth_rate: ChartPoint[];
    member_growth: ChartPoint[];
    plan_distribution: ChartPoint[];
  };
  alerts: {
    expiring_subscriptions: SubscriptionSummary[];
    failed_payments: PaymentSummary[];
    inactive_gyms: GymSummary[];
  };
  recent_activity: ActivitySummary[];
  latest_gyms: GymSummary[];
  top_gyms: {
    highest_paying: GymSummary[];
    most_active: GymSummary[];
  };
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ReportSectionData {
  summary: Record<string, number | string>;
  series?: ChartPoint[];
  breakdown?: Record<string, number>;
  expiring_soon?: SubscriptionSummary[];
  latest_gyms?: GymSummary[];
  revenue_growth?: ChartPoint[];
  gym_growth?: ChartPoint[];
  subscription_breakdown?: Record<string, number>;
}

export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  plan_id?: number | string;
  status?: string;
}

export interface RevenueReportData {
  summary: {
    total_revenue: number;
    total_discount: number;
    net_revenue: number;
    transaction_count: number;
    coupon_discount: number;
    coupon_usage_count: number;
    failed_count: number;
    avg_transaction: number;
  };
  monthly_series: ChartPoint[];
  plan_wise: Array<{ label: string; value: number }>;
}

export interface GymReportData {
  summary: {
    total_gyms: number;
    active_gyms: number;
    inactive_gyms: number;
    trial_gyms: number;
    new_gyms_this_month: number;
    churn_rate: number;
    report_generated_at: string;
  };
  gym_series: ChartPoint[];
  status_breakdown: Record<string, number>;
  churn_series: ChartPoint[];
  latest_gyms: GymSummary[];
}

export interface SubscriptionReportData {
  summary: {
    active: number;
    expired: number;
    trial: number;
    paused: number;
    cancelled: number;
    suspended: number;
    monthly_recurring_revenue: number;
    renewals_this_month: number;
    expiring_soon_count: number;
  };
  breakdown: Record<string, number>;
  plan_dist: Array<{ label: string; value: number }>;
  expiring_soon: SubscriptionSummary[];
  renewal_series: ChartPoint[];
  new_sub_series: ChartPoint[];
}

export interface CouponStat {
  code: string;
  discount_type: string;
  discount_value: number;
  usage_count: number;
  sub_count: number;
  total_discount: number;
  total_revenue: number;
}

export interface CouponReportData {
  summary: {
    total_coupons: number;
    active_coupons: number;
    total_usage: number;
    total_discount: number;
    best_coupon_code: string | null;
    best_coupon_uses: number;
  };
  coupon_stats: CouponStat[];
  discount_series: ChartPoint[];
}

export interface PaymentMethodStat {
  label: string;
  txn_count: number;
  total_amount: number;
}

export interface TxnPoint {
  label: string;
  txn_count: number;
  total_amount: number;
}

export interface PaymentReportData {
  summary: {
    success_count: number;
    failed_count: number;
    pending_count: number;
    total_amount: number;
    total_txns: number;
    success_rate: number;
  };
  method_breakdown: PaymentMethodStat[];
  txn_series: TxnPoint[];
}

export interface GrowthReportData {
  summary: {
    revenue_growth_mom: number;
    revenue_growth_mom_prev: number;
    gym_growth_mom: number;
    sub_growth_mom: number;
    gyms_this_month: number;
    gyms_last_month: number;
    revenue_this_month: number;
    revenue_last_month: number;
    mrr: number;
    churn_rate: number;
  };
  revenue_series: ChartPoint[];
  gym_series: ChartPoint[];
  growth_series: ChartPoint[];
}

export interface OverviewReportData {
  summary: {
    total_revenue: number;
    monthly_revenue: number;
    yearly_revenue: number;
    monthly_recurring_revenue: number;
    total_gyms: number;
    active_gyms: number;
    inactive_gyms: number;
    active_subscriptions: number;
    expired_subscriptions: number;
    trial_subscriptions: number;
    revenue_growth_percentage: number;
    churn_rate: number;
    expiring_soon: number;
    renewals_this_month: number;
    failed_payments: number;
  };
  revenue_growth: ChartPoint[];
  gym_growth: ChartPoint[];
  subscription_breakdown: Record<string, number>;
  plan_distribution: Array<{ label: string; value: number }>;
}

export interface PlatformSettings {
  name: string;
  logo: string;
  support_email: string;
  support_phone: string;
}

export interface PaymentSettings {
  stripe_enabled: boolean;
  razorpay_enabled: boolean;
  stripe_key: string;
  stripe_secret: string;
  stripe_webhook: string;
  razorpay_key: string;
  razorpay_secret: string;
  razorpay_webhook: string;
  test_mode: boolean;
}

export interface BillingSettings {
  currency: string;
  tax_rate: number;
  trial_days: number;
  grace_period_days: number;
  auto_suspend: boolean;
}

export interface CouponSettings {
  enable_coupons: boolean;
  max_discount_percentage: number;
  max_usage_per_coupon: number;
}

export interface TenantSettings {
  allow_signup: boolean;
  auto_approve: boolean;
  default_plan_id: number | null;
}

export interface SecuritySettings {
  session_timeout_minutes: number;
  max_login_attempts: number;
  lockout_minutes: number;
  require_strong_password: boolean;
}

export interface NotificationSettings {
  // Email
  email_enabled: boolean;
  email_provider: 'gmail' | 'sendgrid' | 'mailgun' | 'smtp';
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_from_address: string;
  smtp_from_name: string;
  smtp_encryption: 'tls' | 'ssl' | 'none';
  // Sendgrid
  sendgrid_api_key: string;
  // Mailgun
  mailgun_api_key: string;
  mailgun_domain: string;
  // SMS
  sms_enabled: boolean;
  // Webhook
  webhook_url: string;
  webhook_format: 'json' | 'form' | 'slack';
  webhook_secret: string;
}

export interface FeatureSettings {
  enable_classes: boolean;
  enable_trainers: boolean;
  enable_store: boolean;
  enable_diet_plans: boolean;
}

export interface SystemSettings {
  maintenance_mode: boolean;
  debug_mode: boolean;
}

export interface CmsFeature {
  title: string;
  description: string;
  icon: string;
}

export interface CmsTestimonial {
  name: string;
  role: string;
  content: string;
  avatar_url?: string;
}

export interface CmsFaq {
  question: string;
  answer: string;
}

export interface CmsNavLink {
  label: string;
  url: string;
}

export interface CmsSettings {
  active_template: string;
  
  // Header / Brand
  header_logo_type: 'text' | 'image';
  header_logo_text: string;
  header_logo_image: string;
  header_nav_links: CmsNavLink[];

  // Hero
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  hero_cta_text: string;
  hero_cta_url: string;

  // Trusted By
  trusted_by_text: string;
  trusted_by_logos: string[]; // comma separated names or urls

  // About
  about_title: string;
  about_text: string;
  
  // Features
  features_title: string;
  features_subtitle: string;
  features: CmsFeature[];

  // How it works
  how_it_works_title: string;
  how_it_works_subtitle: string;
  how_it_works: CmsFeature[]; // reusing CmsFeature for title, desc, icon

  // Testimonials
  testimonials_title: string;
  testimonials_subtitle: string;
  testimonials: CmsTestimonial[];

  // FAQs
  faqs_title: string;
  faqs: CmsFaq[];

  // Final CTA
  cta_title: string;
  cta_text: string;
  cta_button_text: string;
  cta_button_url: string;

  // SEO & Footer
  seo_title: string;
  seo_description: string;
  footer_text: string;
}

export interface AllPlatformSettings {
  platform: PlatformSettings;
  payment: PaymentSettings;
  billing: BillingSettings;
  coupons: CouponSettings;
  tenant: TenantSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  features: FeatureSettings;
  system: SystemSettings;
  cms: CmsSettings;
}

export interface NamedFilterOption {
  id: number;
  name: string;
}

export interface GymFilterPayload {
  plans: NamedFilterOption[];
  countries: string[];
}

export interface PlanFilterPayload {
  plan_types: string[];
  statuses: string[];
}

export interface SubscriptionFilterPayload {
  statuses: string[];
  plans: PlanSummary[];
  gyms: NamedFilterOption[];
}

export interface CouponFilterPayload {
  gyms: NamedFilterOption[];
  statuses: string[];
  discount_types: string[];
}

export interface PaymentFilterPayload {
  statuses: string[];
  payment_methods: string[];
  gyms: NamedFilterOption[];
}

export interface PaymentSummaryTotals {
  total_revenue: number;
  today_revenue: number;
  failed_payments: number;
  successful_payments: number;
}

export interface ListQuery {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  status?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  plan_id?: number | string;
  tenant_id?: number | string;
  country?: string;
  discount_type?: string;
}

function withMethodOverride(formData: FormData, method: 'PUT') {
  const payload = new FormData();

  formData.forEach((value, key) => {
    payload.append(key, value);
  });

  payload.append('_method', method);

  return payload;
}

export async function getSuperAdminDashboard() {
  const response = await request('/api/super-admin/dashboard', { method: 'GET' });
  return response.data as DashboardData;
}

export async function getGyms(query: ListQuery = {}) {
  return request('/api/super-admin/gyms', { method: 'GET' }, query as Record<string, string | number | boolean | null | undefined>) as Promise<
    PaginatedResponse<GymSummary, GymFilterPayload>
  >;
}

export async function getGym(id: number | string) {
  const response = await request(`/api/super-admin/gyms/${id}`, { method: 'GET' });
  return response.data as GymSummary;
}

export async function createGym(payload: FormData) {
  return request('/api/super-admin/gyms', {
    method: 'POST',
    body: payload,
  }) as Promise<{ message: string; data: GymSummary; meta: { temporary_password: string } }>;
}

export async function updateGym(id: number | string, payload: FormData) {
  return request(`/api/super-admin/gyms/${id}`, {
    method: 'POST',
    body: withMethodOverride(payload, 'PUT'),
  }) as Promise<{ message: string; data: GymSummary }>;
}

export async function deleteGym(id: number | string) {
  return request(`/api/super-admin/gyms/${id}`, { method: 'DELETE' }) as Promise<{ message: string }>;
}

export async function suspendGym(id: number | string) {
  return request(`/api/super-admin/gyms/${id}/suspend`, { method: 'POST' }) as Promise<{ message: string; data: GymSummary }>;
}

export async function activateGym(id: number | string) {
  return request(`/api/super-admin/gyms/${id}/activate`, { method: 'POST' }) as Promise<{ message: string; data: GymSummary }>;
}

export async function getPlans(query: ListQuery = {}) {
  return request(
    '/api/super-admin/plans',
    { method: 'GET' },
    query as Record<string, string | number | boolean | null | undefined>,
  ) as Promise<PaginatedResponse<PlanSummary, PlanFilterPayload>>;
}

export async function getPlan(id: number | string) {
  const response = await request(`/api/super-admin/plans/${id}`, { method: 'GET' });
  return response.data as PlanSummary;
}

export async function createPlan(payload: Record<string, unknown>) {
  return request('/api/super-admin/plans', {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as Promise<{ message: string; data: PlanSummary }>;
}

export async function updatePlan(id: number | string, payload: Record<string, unknown>) {
  return request(`/api/super-admin/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }) as Promise<{ message: string; data: PlanSummary }>;
}

export async function deletePlan(id: number | string) {
  return request(`/api/super-admin/plans/${id}`, { method: 'DELETE' }) as Promise<{ message: string }>;
}

export async function activatePlan(id: number | string) {
  return request(`/api/super-admin/plans/${id}/activate`, { method: 'POST' }) as Promise<{ message: string; data: PlanSummary }>;
}

export async function deactivatePlan(id: number | string) {
  return request(`/api/super-admin/plans/${id}/deactivate`, { method: 'POST' }) as Promise<{ message: string; data: PlanSummary }>;
}

export async function getSubscriptions(query: ListQuery = {}) {
  return request(
    '/api/super-admin/subscriptions',
    { method: 'GET' },
    query as Record<string, string | number | boolean | null | undefined>,
  ) as Promise<PaginatedResponse<SubscriptionSummary, SubscriptionFilterPayload>>;
}

export async function getSubscription(id: number | string) {
  const response = await request(`/api/super-admin/subscriptions/${id}`, { method: 'GET' });
  return response.data as SubscriptionSummary;
}

export async function assignSubscription(payload: Record<string, unknown>) {
  return request('/api/super-admin/subscriptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as Promise<{ message: string; data: SubscriptionSummary }>;
}

export async function renewSubscription(id: number | string, payload: Record<string, unknown>) {
  return request(`/api/super-admin/subscriptions/${id}/renew`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as Promise<{ message: string; data: SubscriptionSummary }>;
}

export async function cancelSubscription(id: number | string, payload: Record<string, unknown>) {
  return request(`/api/super-admin/subscriptions/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as Promise<{ message: string; data: SubscriptionSummary }>;
}

export async function changeSubscriptionPlan(id: number | string, payload: Record<string, unknown>) {
  return request(`/api/super-admin/subscriptions/${id}/change-plan`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as Promise<{ message: string; data: SubscriptionSummary }>;
}

export async function pauseSubscription(id: number | string) {
  return request(`/api/super-admin/subscriptions/${id}/pause`, {
    method: 'POST',
  }) as Promise<{ message: string; data: SubscriptionSummary }>;
}

export async function resumeSubscription(id: number | string) {
  return request(`/api/super-admin/subscriptions/${id}/resume`, {
    method: 'POST',
  }) as Promise<{ message: string; data: SubscriptionSummary }>;
}

export function getSuperAdminNotifications(query?: Record<string, string | number | boolean | null>) {
  return request('/api/super-admin/notifications', { method: 'GET' }, query);
}

export function getSuperAdminNotificationCounts() {
  return request('/api/super-admin/notifications/counts', { method: 'GET' });
}

export function markSuperAdminNotificationRead(notificationId: number) {
  return request(`/api/super-admin/notifications/${notificationId}/read`, { method: 'PUT' });
}

export function markAllSuperAdminNotificationsRead() {
  return request('/api/super-admin/notifications/mark-all-read', { method: 'PUT' });
}

export async function suspendSubscription(id: number | string) {
  return request(`/api/super-admin/subscriptions/${id}/suspend`, {
    method: 'POST',
  }) as Promise<{ message: string; data: SubscriptionSummary }>;
}

export async function getCoupons(query: ListQuery = {}) {
  return request(
    '/api/super-admin/coupons',
    { method: 'GET' },
    query as Record<string, string | number | boolean | null | undefined>,
  ) as Promise<PaginatedResponse<CouponSummary, CouponFilterPayload>>;
}

export async function createCoupon(payload: Record<string, unknown>) {
  return request('/api/super-admin/coupons', {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as Promise<{ message: string; data: CouponSummary }>;
}

export async function updateCoupon(id: number | string, payload: Record<string, unknown>) {
  return request(`/api/super-admin/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }) as Promise<{ message: string; data: CouponSummary }>;
}

export async function deleteCoupon(id: number | string) {
  return request(`/api/super-admin/coupons/${id}`, { method: 'DELETE' }) as Promise<{ message: string }>;
}

export async function activateCoupon(id: number | string) {
  return request(`/api/super-admin/coupons/${id}/activate`, { method: 'POST' }) as Promise<{ message: string; data: CouponSummary }>;
}

export async function deactivateCoupon(id: number | string) {
  return request(`/api/super-admin/coupons/${id}/deactivate`, { method: 'POST' }) as Promise<{ message: string; data: CouponSummary }>;
}

export async function getPayments(query: ListQuery = {}) {
  return request(
    '/api/super-admin/payments',
    { method: 'GET' },
    query as Record<string, string | number | boolean | null | undefined>,
  ) as Promise<PaginatedResponse<PaymentSummary, PaymentFilterPayload> & { summary: PaymentSummaryTotals }>;
}

export async function getPayment(id: number | string) {
  const response = await request(`/api/super-admin/payments/${id}`, { method: 'GET' });
  return response.data as PaymentSummary;
}

export async function getReportsOverview(filters: ReportFilters = {}) {
  const response = await request(
    '/api/super-admin/reports/overview',
    { method: 'GET' },
    filters as Record<string, string | number | boolean | null | undefined>,
  );
  return response.data as OverviewReportData;
}

export async function getRevenueReport(filters: ReportFilters = {}) {
  const response = await request(
    '/api/super-admin/reports/revenue',
    { method: 'GET' },
    filters as Record<string, string | number | boolean | null | undefined>,
  );
  return response.data as RevenueReportData;
}

export async function getGymGrowthReport(filters: ReportFilters = {}) {
  const response = await request(
    '/api/super-admin/reports/gym-growth',
    { method: 'GET' },
    filters as Record<string, string | number | boolean | null | undefined>,
  );
  return response.data as GymReportData;
}

export async function getSubscriptionReport(filters: ReportFilters = {}) {
  const response = await request(
    '/api/super-admin/reports/subscriptions',
    { method: 'GET' },
    filters as Record<string, string | number | boolean | null | undefined>,
  );
  return response.data as SubscriptionReportData;
}

export async function getCouponReport(filters: ReportFilters = {}) {
  const response = await request(
    '/api/super-admin/reports/coupons',
    { method: 'GET' },
    filters as Record<string, string | number | boolean | null | undefined>,
  );
  return response.data as CouponReportData;
}

export async function getPaymentReport(filters: ReportFilters = {}) {
  const response = await request(
    '/api/super-admin/reports/payments',
    { method: 'GET' },
    filters as Record<string, string | number | boolean | null | undefined>,
  );
  return response.data as PaymentReportData;
}

export async function getGrowthReport(filters: ReportFilters = {}) {
  const response = await request(
    '/api/super-admin/reports/growth',
    { method: 'GET' },
    filters as Record<string, string | number | boolean | null | undefined>,
  );
  return response.data as GrowthReportData;
}

export async function getSettings() {
  const response = await request('/api/super-admin/settings', { method: 'GET' });
  return response.data as AllPlatformSettings;
}

export async function updateSettings(group: string, payload: Record<string, unknown>) {
  const response = await request(`/api/super-admin/settings/${group}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return response.data as Record<string, unknown>;
}
