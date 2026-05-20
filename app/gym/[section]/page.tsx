import { PortalSectionPage } from '@/components/dashboard/portal-pages';

export default async function GymSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return <PortalSectionPage portal="gym" section={section} />;
}
