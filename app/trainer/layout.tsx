import { RoleDashboardLayout } from '@/components/dashboard/role-dashboard-layout';

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return <RoleDashboardLayout portal="trainer">{children}</RoleDashboardLayout>;
}
