import { RoleDashboardLayout } from '@/components/dashboard/role-dashboard-layout';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleDashboardLayout portal="super-admin">{children}</RoleDashboardLayout>;
}
