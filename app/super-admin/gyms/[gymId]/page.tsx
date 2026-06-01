import { GymDetailsPage } from '@/components/super-admin/gym-details-page';

export default async function SuperAdminGymDetailsRoute({
  params,
  searchParams,
}: {
  params: Promise<{ gymId: string }>;
  searchParams: Promise<{ tempPassword?: string; updated?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <GymDetailsPage
      gymId={resolvedParams.gymId}
      tempPassword={resolvedSearchParams.tempPassword}
      updated={resolvedSearchParams.updated}
    />
  );
}
