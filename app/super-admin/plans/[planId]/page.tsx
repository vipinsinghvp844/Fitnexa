import { PlanDetailsPage } from '@/components/super-admin/plan-details-page';

export default async function SuperAdminPlanDetailsRoute({
  params,
}: {
  params: { planId: string };
}) {
  return <PlanDetailsPage planId={params.planId} />;
}
