import { PortalSectionPage } from '@/components/dashboard/portal-pages';

export default async function SuperAdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return <PortalSectionPage portal="super-admin" section={section} />;
}
