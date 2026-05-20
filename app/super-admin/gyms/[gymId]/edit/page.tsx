import { GymForm } from '@/components/super-admin/gym-form';

export default async function SuperAdminGymEditRoute({
  params,
}: {
  params: { gymId: string };
}) {
  return <GymForm mode="edit" gymId={params.gymId} />;
}
