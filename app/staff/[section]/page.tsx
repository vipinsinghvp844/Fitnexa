import { PortalSectionPage } from '@/components/dashboard/portal-pages';

export default async function StaffSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return <PortalSectionPage portal="staff" section={section} />;
}
