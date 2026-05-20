import { RoleDashboardLayout } from '@/components/dashboard/role-dashboard-layout';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <RoleDashboardLayout portal="staff">{children}</RoleDashboardLayout>;
}
