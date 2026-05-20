import { RoleDashboardLayout } from '@/components/dashboard/role-dashboard-layout';

export default function GymLayout({ children }: { children: React.ReactNode }) {
  return <RoleDashboardLayout portal="gym">{children}</RoleDashboardLayout>;
}
