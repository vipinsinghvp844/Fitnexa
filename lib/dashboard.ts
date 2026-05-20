export type PortalKey = 'super-admin' | 'gym' | 'trainer' | 'staff';

export type AppRole =
  | 'Super Admin'
  | 'Gym Admin'
  | 'Trainer'
  | 'Manager'
  | 'Receptionist'
  | 'Accountant';

export type IconName =
  | 'dashboard'
  | 'gym'
  | 'plans'
  | 'subscriptions'
  | 'payments'
  | 'coupons'
  | 'reports'
  | 'settings'
  | 'members'
  | 'trainers'
  | 'staff'
  | 'attendance'
  | 'classes'
  | 'inventory'
  | 'payroll'
  | 'expenses'
  | 'menu'
  | 'logout'
  | 'moon'
  | 'sun'
  | 'shield'
  | 'spark'
  | 'arrow-right'
  | 'pause'
  | 'x'
  | 'play'
  | 'refresh'
  | 'status'
  | 'credit-card'
  | 'plus'
  | 'building'
  | 'bell'
  | 'alert-circle'
  | 'check-circle'
  | 'check'
  | 'users';

export interface DashboardMenuItem {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  description: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  delta: string;
  tone: 'accent' | 'success' | 'warning';
}

export interface DashboardSpotlight {
  id: string;
  title: string;
  description: string;
  metric: string;
}

export interface PortalConfig {
  key: PortalKey;
  label: string;
  shortLabel: string;
  description: string;
  allowedRoles: AppRole[];
  menu: DashboardMenuItem[];
  dashboard: {
    title: string;
    subtitle: string;
    stats: DashboardStat[];
    spotlights: DashboardSpotlight[];
  };
}

const portalConfigs: Record<PortalKey, PortalConfig> = {
  'super-admin': {
    key: 'super-admin',
    label: 'Super Admin',
    shortLabel: 'Platform',
    description: 'Cross-tenant visibility, revenue control, and subscription health.',
    allowedRoles: ['Super Admin'],
    menu: [
      { id: 'super-admin-dashboard', label: 'Dashboard', href: '/super-admin/dashboard', icon: 'dashboard', description: 'Platform-level KPIs and tenant health snapshots.' },
      { id: 'super-admin-gyms', label: 'Gyms', href: '/super-admin/gyms', icon: 'gym', description: 'Workspace shell for gym accounts, growth, and activation.' },
      { id: 'super-admin-plans', label: 'Plans', href: '/super-admin/plans', icon: 'plans', description: 'Pricing architecture, packaging, and entitlement placeholders.' },
      { id: 'super-admin-subscriptions', label: 'Subscriptions', href: '/super-admin/subscriptions', icon: 'subscriptions', description: 'Renewal flow, churn tracking, and billing lifecycle placeholders.' },
      { id: 'super-admin-payments', label: 'Payments', href: '/super-admin/payments', icon: 'payments', description: 'Payment volume, settlements, and failed charge monitoring shell.' },
      { id: 'super-admin-coupons', label: 'Coupons', href: '/super-admin/coupons', icon: 'coupons', description: 'Promotional campaign workspace and redemption analytics shell.' },
      { id: 'super-admin-reports', label: 'Reports', href: '/super-admin/reports', icon: 'reports', description: 'Executive reporting surfaces and export-ready analytics layout.' },
      { id: 'super-admin-settings', label: 'Settings', href: '/super-admin/settings', icon: 'settings', description: 'Platform controls, defaults, and environment settings shell.' },
      { id: 'super-admin-support', label: 'Support Tickets', href: '/super-admin/support', icon: 'alert-circle', description: 'Manage and resolve tickets submitted by gym admins.' },
      { id: 'super-admin-cms', label: 'CMS Website', href: '/super-admin/cms', icon: 'spark', description: 'Edit public landing page content, SEO, and choose your design template.' },
    ],
    dashboard: {
      title: 'Platform Command Center',
      subtitle: 'Track tenant growth, billing momentum, and operational risk from one structured workspace.',
      stats: [
        { id: 'super-admin-active-gyms', label: 'Active Gyms', value: '128', delta: '+12 this month', tone: 'accent' },
        { id: 'super-admin-mrr', label: 'Monthly Recurring Revenue', value: '$84.2K', delta: '+8.4% vs last month', tone: 'success' },
        { id: 'super-admin-renewal-success', label: 'Renewal Success Rate', value: '96.4%', delta: 'Stable across 30 days', tone: 'success' },
        { id: 'super-admin-failed-payments', label: 'Failed Payments', value: '14', delta: '-3 from last week', tone: 'warning' },
      ],
      spotlights: [
        { id: 'super-admin-tenant-expansion', title: 'Tenant Expansion', description: 'Regional onboarding pipeline and activation quality placeholder.', metric: '24 launch-ready gyms' },
        { id: 'super-admin-billing-operations', title: 'Billing Operations', description: 'Payment retries and collections workflow placeholder.', metric: '91% recovered within 48h' },
        { id: 'super-admin-executive-forecasting', title: 'Executive Forecasting', description: 'Growth pacing and capacity planning analytics placeholder.', metric: 'Q3 target at 78%' },
      ],
    },
  },
  gym: {
    key: 'gym',
    label: 'Gym Admin',
    shortLabel: 'Gym',
    description: 'Run daily operations, member growth, and staff execution with one hub.',
    allowedRoles: ['Gym Admin'],
    menu: [
      { id: 'gym-dashboard', label: 'Dashboard', href: '/gym/dashboard', icon: 'dashboard', description: 'Daily operations snapshot and member activity analytics.' },
      { id: 'gym-members', label: 'Members', href: '/gym/members', icon: 'members', description: 'Member lifecycle workspace and engagement placeholder.' },
      { id: 'gym-trainers', label: 'Trainers', href: '/gym/trainers', icon: 'trainers', description: 'Trainer capacity, utilization, and scheduling placeholder.' },
      { id: 'gym-staff', label: 'Staff', href: '/gym/staff', icon: 'staff', description: 'Front-desk and internal operations management shell.' },
      { id: 'gym-attendance', label: 'Attendance', href: '/gym/attendance', icon: 'attendance', description: 'Daily visit patterns and check-in monitoring shell.' },
      { id: 'gym-billing', label: 'Billing', href: '/gym/billing', icon: 'payments', description: 'Member payments, invoices, and gym revenue tracking.' },
      { id: 'gym-membership-plans', label: 'Membership Plans', href: '/gym/membership-plans', icon: 'plans', description: 'Manage custom pricing catalog, plans and public rates.' },
      { id: 'gym-notifications', label: 'Notifications', href: '/gym/notifications', icon: 'bell', description: 'Renewal alerts, payment reminders, and system notifications.' },
      { id: 'gym-classes', label: 'Classes', href: '/gym/classes', icon: 'classes', description: 'Class planning, enrollment, and timetable placeholder.' },
      { id: 'gym-inventory', label: 'Inventory', href: '/gym/inventory', icon: 'inventory', description: 'Product stock, purchase cycles, and retail workflow shell.' },
      { id: 'gym-payroll', label: 'Payroll', href: '/gym/payroll', icon: 'payroll', description: 'Salary cycles, payouts, and staffing cost placeholders.' },
      { id: 'gym-expenses', label: 'Expenses', href: '/gym/expenses', icon: 'expenses', description: 'Expense categories and monthly burn visibility shell.' },
      { id: 'gym-reports', label: 'Reports', href: '/gym/reports', icon: 'reports', description: 'Performance reporting layout for the gym workspace.' },
      { id: 'gym-website', label: 'Website Builder', href: '/gym/website', icon: 'spark', description: 'Edit and brand your public website, choose premium templates, and configure SEO.' },
      { id: 'gym-settings', label: 'Settings', href: '/gym/settings', icon: 'settings', description: 'Gym-level defaults, operating preferences, and policies shell.' },
      { id: 'gym-support', label: 'Help & Support', href: '/gym/support', icon: 'alert-circle', description: 'Raise support tickets and communicate with platform support.' },
    ],
    dashboard: {
      title: 'Gym Operations Hub',
      subtitle: 'Stay on top of members, staffing, attendance, and day-to-day performance signals.',
      stats: [
        { id: 'gym-active-members', label: 'Active Members', value: '1,284', delta: '+42 net this month', tone: 'accent' },
        { id: 'gym-checkins-today', label: "Today's Check-ins", value: '312', delta: 'Busy morning trend', tone: 'success' },
        { id: 'gym-classes-scheduled', label: 'Classes Scheduled', value: '18', delta: '4 at full capacity', tone: 'accent' },
        { id: 'gym-monthly-revenue', label: 'Monthly Revenue', value: '$46.7K', delta: '+6.1% vs target', tone: 'success' },
      ],
      spotlights: [
        { id: 'gym-retention-watchlist', title: 'Retention Watchlist', description: 'At-risk member segment and recovery workflow placeholder.', metric: '27 members flagged' },
        { id: 'gym-shift-readiness', title: 'Shift Readiness', description: 'Trainer and staff availability planning placeholder.', metric: '94% staffed today' },
        { id: 'gym-revenue-mix', title: 'Revenue Mix', description: 'Membership, classes, and retail contribution placeholder.', metric: '22% ancillary revenue' },
      ],
    },
  },
  trainer: {
    key: 'trainer',
    label: 'Trainer',
    shortLabel: 'Coach',
    description: 'Focus on assigned members, class delivery, and attendance execution.',
    allowedRoles: ['Trainer'],
    menu: [
      { id: 'trainer-dashboard', label: 'Dashboard', href: '/trainer/dashboard', icon: 'dashboard', description: 'Coaching KPIs and session readiness overview.' },
      { id: 'trainer-my-members', label: 'My Members', href: '/trainer/my-members', icon: 'members', description: 'Assigned member roster and progress workspace shell.' },
      { id: 'trainer-my-classes', label: 'My Classes', href: '/trainer/my-classes', icon: 'classes', description: 'Class delivery schedule and participation placeholder.' },
      { id: 'trainer-attendance', label: 'Attendance', href: '/trainer/attendance', icon: 'attendance', description: 'Session attendance tracking and follow-up shell.' },
    ],
    dashboard: {
      title: 'Trainer Performance Desk',
      subtitle: 'Review your member load, class commitments, and attendance insights in one clean workspace.',
      stats: [
        { id: 'trainer-assigned-members', label: 'Assigned Members', value: '84', delta: '12 high-priority plans', tone: 'accent' },
        { id: 'trainer-sessions-today', label: 'Sessions Today', value: '9', delta: '3 upcoming this afternoon', tone: 'success' },
        { id: 'trainer-attendance-rate', label: 'Attendance Rate', value: '89%', delta: '+4% this week', tone: 'success' },
        { id: 'trainer-class-fill-rate', label: 'Class Fill Rate', value: '76%', delta: 'Two waitlists active', tone: 'warning' },
      ],
      spotlights: [
        { id: 'trainer-coaching-followups', title: 'Coaching Follow-ups', description: 'Member check-ins and accountability workflow placeholder.', metric: '16 follow-ups pending' },
        { id: 'trainer-class-engagement', title: 'Class Engagement', description: 'Participation trends and peak hours placeholder.', metric: 'Evening batch strongest' },
        { id: 'trainer-plan-adherence', title: 'Plan Adherence', description: 'Routine completion and consistency insights placeholder.', metric: '71% avg adherence' },
      ],
    },
  },
  staff: {
    key: 'staff',
    label: 'Staff',
    shortLabel: 'Ops',
    description: 'Support member-facing operations with quick access to attendance and front-desk workflows.',
    allowedRoles: ['Manager', 'Receptionist', 'Accountant'],
    menu: [
      { id: 'staff-dashboard', label: 'Dashboard', href: '/staff/dashboard', icon: 'dashboard', description: 'Front-desk health and daily operational visibility.' },
      { id: 'staff-members', label: 'Members', href: '/staff/members', icon: 'members', description: 'Member support workflow and status placeholder.' },
      { id: 'staff-attendance', label: 'Attendance', href: '/staff/attendance', icon: 'attendance', description: 'Check-in desk operations and attendance shell.' },
    ],
    dashboard: {
      title: 'Staff Operations Desk',
      subtitle: 'Manage member-facing workflows with a focused workspace for attendance and service coverage.',
      stats: [
        { id: 'staff-walkins-today', label: 'Walk-ins Today', value: '148', delta: 'Peak at 7:30 AM', tone: 'accent' },
        { id: 'staff-member-queries-resolved', label: 'Member Queries Resolved', value: '39', delta: 'Average 7m turnaround', tone: 'success' },
        { id: 'staff-pending-followups', label: 'Pending Follow-ups', value: '11', delta: 'Mostly billing and renewals', tone: 'warning' },
        { id: 'staff-desk-coverage', label: 'Desk Coverage', value: '100%', delta: 'All shifts assigned', tone: 'success' },
      ],
      spotlights: [
        { id: 'staff-checkin-flow', title: 'Check-in Flow', description: 'Queue handling and desk efficiency placeholder.', metric: '2.8 min avg wait' },
        { id: 'staff-member-support', title: 'Member Support', description: 'Support resolution and escalation workflow placeholder.', metric: '92% same-day close' },
        { id: 'staff-operational-notes', title: 'Operational Notes', description: 'Front-desk coordination and handoff placeholder.', metric: '5 open notes' },
      ],
    },
  },
};

const portalOrder: PortalKey[] = ['super-admin', 'gym', 'trainer', 'staff'];

export function isPortalKey(value: string): value is PortalKey {
  return value in portalConfigs;
}

export function getPortalConfig(portal: PortalKey): PortalConfig {
  return portalConfigs[portal];
}

export function getPortalFromRoles(roles: string[] | undefined | null): PortalKey | null {
  if (!roles?.length) return null;

  const normalizedRoles = roles.map((role) => role.toLowerCase());

  for (const portal of portalOrder) {
    const match = portalConfigs[portal].allowedRoles.some((role) => normalizedRoles.includes(role.toLowerCase()));
    if (match) return portal;
  }

  return null;
}

export function getDefaultDashboardPath(roles: string[] | undefined | null) {
  const portal = getPortalFromRoles(roles);
  return portal ? `/${portal}/dashboard` : '/login';
}

export function hasRequiredRole(userRoles: string[] | undefined | null, allowedRoles: AppRole[]) {
  if (!userRoles?.length) return false;

  const normalizedRoles = userRoles.map((role) => role.toLowerCase());

  return allowedRoles.some((role) => normalizedRoles.includes(role.toLowerCase()));
}

export function getSectionFromHref(href: string) {
  return href.split('/').filter(Boolean).pop() ?? '';
}

export function getMenuItemBySection(portal: PortalKey, section: string) {
  return portalConfigs[portal].menu.find((item) => getSectionFromHref(item.href) === section);
}

export function formatSegmentLabel(segment: string) {
  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
