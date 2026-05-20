import { PortalSectionPage } from '@/components/dashboard/portal-pages';

export default async function TrainerSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return <PortalSectionPage portal="trainer" section={section} />;
}
