import { SuperAdminGymsPage } from '@/components/super-admin/gyms-page';
import { ListQuery } from '@/lib/super-admin';

export default async function SuperAdminGymsRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;

  const toSingle = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  const initialQuery: ListQuery = {
    page: toSingle(resolvedSearchParams.page) ? Number(toSingle(resolvedSearchParams.page)) : undefined,
    per_page: toSingle(resolvedSearchParams.per_page) ? Number(toSingle(resolvedSearchParams.per_page)) : undefined,
    search: toSingle(resolvedSearchParams.search) ?? undefined,
    status: toSingle(resolvedSearchParams.status) ?? undefined,
    country: toSingle(resolvedSearchParams.country) ?? undefined,
    plan_id: toSingle(resolvedSearchParams.plan_id) ?? undefined,
    sort_by: toSingle(resolvedSearchParams.sort_by) ?? undefined,
    sort_direction: (toSingle(resolvedSearchParams.sort_direction) as 'asc' | 'desc' | undefined) ?? undefined,
  };

  return <SuperAdminGymsPage initialQuery={initialQuery} />;
}
