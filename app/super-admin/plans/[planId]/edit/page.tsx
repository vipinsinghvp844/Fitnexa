import { PlanForm } from '@/components/super-admin/plan-form';

export default async function SuperAdminPlanEditRoute({
  params,
}: {
  params: { planId: string };
}) {
  return <PlanForm mode="edit" planId={params.planId} />;
}
