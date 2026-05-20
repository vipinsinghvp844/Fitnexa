'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { DataTable } from '@/components/admin/data-table';
import { Field, SelectInput, TextInput } from '@/components/admin/fields';
import { LoadingState } from '@/components/admin/loading-state';
import { Pagination } from '@/components/admin/pagination';
import { AdminPageHeader, AdminPrimaryLink, AdminSecondaryButton } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { formatDate } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import { activateGym, deleteGym, getGyms, GymSummary, ListQuery, suspendGym } from '@/lib/super-admin';
import { PrimitiveQuery, useListQuery } from '@/hooks/use-list-query';

type SuperAdminGymsQuery = ListQuery & PrimitiveQuery;

export function SuperAdminGymsPage({ initialQuery }: { initialQuery: ListQuery }) {
  const { query, updateQuery } = useListQuery<SuperAdminGymsQuery>({
    page: Number(initialQuery.page || 1),
    per_page: Number(initialQuery.per_page || 10),
    search: initialQuery.search || '',
    status: initialQuery.status || '',
    country: initialQuery.country || '',
    plan_id: initialQuery.plan_id || '',
    sort_by: initialQuery.sort_by || 'created_at',
    sort_direction: initialQuery.sort_direction || 'desc',
  });
  const [response, setResponse] = useState<Awaited<ReturnType<typeof getGyms>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGym, setSelectedGym] = useState<GymSummary | null>(null);
  const [dialogMode, setDialogMode] = useState<'delete' | 'suspend' | 'activate' | null>(null);

  useEffect(() => {
    let mounted = true;
    // Defer state updates to avoid cascading renders warning from react-hooks ESLint rule.
    requestAnimationFrame(() => {
      if (mounted) {
        setLoading(true);
        setError(null);
      }
    });

    getGyms(query)
      .then((payload) => {
        if (mounted) setResponse(payload);
      })
      .catch((fetchError) => {
        if (mounted) setError(getErrorMessage(fetchError, 'Failed to load gyms'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [query]);

  const filters = response?.filters;

  const handleAction = async () => {
    if (!selectedGym || !dialogMode) return;

    if (dialogMode === 'delete') {
      await deleteGym(selectedGym.id);
    }

    if (dialogMode === 'suspend') {
      await suspendGym(selectedGym.id);
    }

    if (dialogMode === 'activate') {
      await activateGym(selectedGym.id);
    }

    setDialogMode(null);
    setSelectedGym(null);
    setLoading(true);
    const next = await getGyms(query);
    setResponse(next);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Super Admin"
        title="Gym management"
        description="Create gyms, manage owner accounts, track subscription coverage, and control activation state from one operational table."
        actions={<AdminPrimaryLink href="/super-admin/gyms/create">Create gym</AdminPrimaryLink>}
      />

      <section className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-5">
          <Field label="Search">
            <TextInput
              value={String(query.search ?? '')}
              onChange={(event) => updateQuery({ search: event.target.value, page: 1 })}
              placeholder="Search gym, owner, city, GST"
            />
          </Field>
          <Field label="Status">
            <SelectInput value={String(query.status ?? '')} onChange={(event) => updateQuery({ status: event.target.value, page: 1 })}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </SelectInput>
          </Field>
          <Field label="Country">
            <SelectInput value={String(query.country ?? '')} onChange={(event) => updateQuery({ country: event.target.value, page: 1 })}>
              <option value="">All countries</option>
              {filters?.countries?.map((country) => (
                <option key={`country-${country}`} value={country}>
                  {country}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Plan">
            <SelectInput value={String(query.plan_id ?? '')} onChange={(event) => updateQuery({ plan_id: event.target.value, page: 1 })}>
              <option value="">All plans</option>
              {filters?.plans?.map((plan) => (
                <option key={`gym-plan-${plan.id}`} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Sort by">
            <SelectInput
              value={`${query.sort_by}:${query.sort_direction}`}
              onChange={(event) => {
                const [sortBy, sortDirection] = event.target.value.split(':');
                updateQuery({
                  sort_by: sortBy,
                  sort_direction: sortDirection as 'asc' | 'desc',
                  page: 1,
                });
              }}
            >
              <option value="created_at:desc">Newest first</option>
              <option value="created_at:asc">Oldest first</option>
              <option value="name:asc">Name A-Z</option>
              <option value="name:desc">Name Z-A</option>
              <option value="members:desc">Most members</option>
              <option value="trainers:desc">Most trainers</option>
            </SelectInput>
          </Field>
        </div>
      </section>

      {loading ? <LoadingState label="Loading gyms..." /> : null}
      {error ? <LoadingState label={error} /> : null}

      {!loading && !error && response ? (
        <>
          <DataTable
            data={response.data}
            rowKey={(gym) => `gym-${gym.id}`}
            emptyTitle="No gyms found"
            emptyDescription="Adjust the filters or create a new gym to start managing tenant operations."
            mobileRender={(gym) => (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-[color:var(--app-text)]">{gym.name}</p>
                    <p className="mt-1 text-sm text-[color:var(--app-muted)]">{gym.owner.name || gym.owner.email || 'No owner'}</p>
                  </div>
                  <StatusBadge value={gym.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-[color:var(--app-muted)]">
                  <div>Members: {gym.counts.members}</div>
                  <div>Trainers: {gym.counts.trainers}</div>
                  <div>Plan: {gym.active_subscription?.plan_name ?? 'None'}</div>
                  <div>Created: {formatDate(gym.created_at)}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/super-admin/gyms/${gym.id}`} className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-white">
                    View
                  </Link>
                  <Link href={`/super-admin/gyms/${gym.id}/edit`} className="rounded-xl border border-[color:var(--app-border)] px-3 py-2 text-sm font-medium text-[color:var(--app-text)]">
                    Edit
                  </Link>
                </div>
              </div>
            )}
            columns={[
              {
                id: 'gym',
                header: 'Gym',
                render: (gym) => (
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-sky-500/10 text-sky-600 dark:text-sky-300">
                      <DashboardIcon name="gym" className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[color:var(--app-text)]">{gym.name}</p>
                      <p className="mt-1 text-xs text-[color:var(--app-muted)]">{gym.city || '—'}, {gym.country || '—'}</p>
                    </div>
                  </div>
                ),
              },
              {
                id: 'owner',
                header: 'Owner',
                render: (gym) => (
                  <div>
                    <p>{gym.owner.name || 'No owner'}</p>
                    <p className="mt-1 text-xs text-[color:var(--app-muted)]">{gym.owner.email || '—'}</p>
                  </div>
                ),
              },
              {
                id: 'plan',
                header: 'Plan',
                render: (gym) => (
                  <div>
                    <p>{gym.active_subscription?.plan_name ?? 'No plan'}</p>
                    <p className="mt-1 text-xs text-[color:var(--app-muted)]">
                      {gym.active_subscription?.end_date ? `Ends ${formatDate(gym.active_subscription.end_date)}` : 'Not assigned'}
                    </p>
                  </div>
                ),
              },
              {
                id: 'counts',
                header: 'Counts',
                render: (gym) => (
                  <div className="space-y-1 text-xs text-[color:var(--app-muted)]">
                    <p>Members: <span className="font-medium text-[color:var(--app-text)]">{gym.counts.members}</span></p>
                    <p>Trainers: <span className="font-medium text-[color:var(--app-text)]">{gym.counts.trainers}</span></p>
                  </div>
                ),
              },
              {
                id: 'status',
                header: 'Status',
                render: (gym) => <StatusBadge value={gym.status} />,
              },
              {
                id: 'created',
                header: 'Created',
                render: (gym) => <span className="text-sm text-[color:var(--app-muted)]">{formatDate(gym.created_at)}</span>,
              },
              {
                id: 'actions',
                header: 'Actions',
                render: (gym) => (
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/super-admin/gyms/${gym.id}`} className="text-sm font-medium text-sky-600 hover:text-sky-700">
                      View
                    </Link>
                    <Link href={`/super-admin/gyms/${gym.id}/edit`} className="text-sm font-medium text-[color:var(--app-text)] hover:text-sky-600">
                      Edit
                    </Link>
                    {gym.status === 'suspended' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGym(gym);
                          setDialogMode('activate');
                        }}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        Activate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGym(gym);
                          setDialogMode('suspend');
                        }}
                        className="text-sm font-medium text-amber-600 hover:text-amber-700"
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGym(gym);
                        setDialogMode('delete');
                      }}
                      className="text-sm font-medium text-rose-600 hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
          />

          <Pagination meta={response.meta} onPageChange={(page) => updateQuery({ page })} />
        </>
      ) : null}

      <ConfirmDialog
        open={!!selectedGym && !!dialogMode}
        title={
          dialogMode === 'delete'
            ? `Delete ${selectedGym?.name}?`
            : dialogMode === 'suspend'
              ? `Suspend ${selectedGym?.name}?`
              : `Activate ${selectedGym?.name}?`
        }
        description={
          dialogMode === 'delete'
            ? 'This will permanently remove the gym and its tenant-linked data.'
            : dialogMode === 'suspend'
              ? 'Members will remain in the system, but the gym will be marked as suspended.'
              : 'This will return the gym to active operating status.'
        }
        confirmLabel={dialogMode === 'delete' ? 'Delete gym' : dialogMode === 'suspend' ? 'Suspend gym' : 'Activate gym'}
        onClose={() => {
          setSelectedGym(null);
          setDialogMode(null);
        }}
        onConfirm={handleAction}
      />
    </div>
  );
}
