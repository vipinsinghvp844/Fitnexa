import { GymForm } from '@/components/super-admin/gym-form';

export default async function SuperAdminGymEditRoute({
  params,
}: {
  params: Promise<{ gymId: string }>;
}) {
  const resolvedParams = await params;
  return <GymForm mode="edit" gymId={resolvedParams.gymId} />;
}
