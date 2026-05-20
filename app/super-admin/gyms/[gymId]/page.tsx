import { GymDetailsPage } from '@/components/super-admin/gym-details-page';

export default async function SuperAdminGymDetailsRoute({
  params,
  searchParams,
}: {
  params: { gymId: string };
  searchParams: Promise<{ tempPassword?: string; updated?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <GymDetailsPage
      gymId={params.gymId}
      tempPassword={resolvedSearchParams.tempPassword}
      updated={resolvedSearchParams.updated}
    />
  );
}
