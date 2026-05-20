'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { DataTable } from '@/components/admin/data-table';
import { Field, SelectInput, TextInput } from '@/components/admin/fields';
import { LoadingState } from '@/components/admin/loading-state';
import { Pagination } from '@/components/admin/pagination';
import { AdminPageHeader, AdminPrimaryLink } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { getErrorMessage } from '@/lib/errors';
import { formatCurrency } from '@/lib/format';
import { activatePlan, deactivatePlan, deletePlan, getPlans, PlanSummary } from '@/lib/super-admin';
import { PrimitiveQuery, useListQuery } from '@/hooks/use-list-query';
import { ListQuery } from '@/lib/super-admin';

type PlanDialogMode = 'delete' | 'activate' | 'deactivate';
type SuperAdminPlansQuery = ListQuery & PrimitiveQuery;

export function SuperAdminPlansPage({ initialQuery }: { initialQuery: ListQuery }) {
  const { query, updateQuery } = useListQuery<SuperAdminPlansQuery>({
    page: Number(initialQuery.page || 1),
    per_page: Number(initialQuery.per_page || 10),
    search: initialQuery.search || '',
    status: initialQuery.status || '',
    sort_by: initialQuery.sort_by || 'created_at',
    sort_direction: initialQuery.sort_direction || 'desc',
    plan_id: initialQuery.plan_id,
    country: initialQuery.country,
    tenant_id: initialQuery.tenant_id,
    discount_type: initialQuery.discount_type,
  });

  const [response, setResponse] = useState<Awaited<ReturnType<typeof getPlans>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<PlanSummary | null>(null);
  const [dialogMode, setDialogMode] = useState<PlanDialogMode | null>(null);

  useEffect(() => {
    let mounted = true;

    requestAnimationFrame(() => {
      if (mounted) {
        setLoading(true);
        setError(null);
      }
    });

    getPlans(query)
      .then((payload) => {
        if (mounted) setResponse(payload);
      })
      .catch((fetchError) => {
        if (mounted) setError(getErrorMessage(fetchError, 'Failed to load plans'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [query]);

  const handleAction = async () => {
    if (!selectedPlan || !dialogMode) return;

    if (dialogMode === 'delete') {
      await deletePlan(selectedPlan.id);
    } else if (dialogMode === 'activate') {
      await activatePlan(selectedPlan.id);
    } else if (dialogMode === 'deactivate') {
      await deactivatePlan(selectedPlan.id);
    }

    setDialogMode(null);
    setSelectedPlan(null);

    setLoading(true);
    const next = await getPlans(query);
    setResponse(next);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Super Admin"
        title="Plans management"
        description="Create, activate/deactivate, and maintain your platform pricing plans."
        actions={<AdminPrimaryLink href="/super-admin/plans/create">Create plan</AdminPrimaryLink>}
      />

      <section className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-5">
          <Field label="Search">
            <TextInput
              value={String(query.search ?? '')}
              onChange={(event) => updateQuery({ search: event.target.value, page: 1 })}
              placeholder="Search plan by name/description"
            />
          </Field>

          <Field label="Status">
            <SelectInput value={String(query.status ?? '')} onChange={(event) => updateQuery({ status: event.target.value, page: 1 })}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
            </SelectInput>
          </Field>
        </div>
      </section>

      {loading ? <LoadingState label="Loading plans..." /> : null}
      {error ? <LoadingState label={error} /> : null}

      {!loading && !error && response ? (
        <DataTable
          data={response.data}
          rowKey={(plan) => `plan-${plan.id}`}
          emptyTitle="No plans found"
          emptyDescription="Create a plan to start defining pricing and entitlements."
          mobileRender={(plan) => (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[color:var(--app-text)]">{plan.name}</p>
                  <p className="mt-1 text-sm text-[color:var(--app-muted)]">
                    {formatCurrency(plan.base_price)}/{plan.billing_cycle}
                  </p>
                </div>
                <StatusBadge value={plan.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-[color:var(--app-muted)]">
                <div>Duration: {plan.duration_days} days</div>
                <div>Discount: {plan.discount_percentage ? `${plan.discount_percentage}%` : '—'}</div>
                <div>Max members: {plan.is_unlimited ? 'Unlimited' : (plan.max_members ?? '—')}</div>
                <div>Max trainers: {plan.is_unlimited ? 'Unlimited' : (plan.max_trainers ?? '—')}</div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={`/super-admin/plans/${plan.id}`} className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-white">
                  View
                </Link>
                <Link href={`/super-admin/plans/${plan.id}/edit`} className="rounded-xl border border-[color:var(--app-border)] px-3 py-2 text-sm font-medium text-[color:var(--app-text)]">
                  Edit
                </Link>
              </div>
            </div>
          )}
          columns={[
            {
              id: 'name',
              header: 'Plan',
              render: (plan) => (
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-sky-500/10 text-sky-600 dark:text-sky-300">
                    <DashboardIcon name="plans" className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[color:var(--app-text)]">{plan.name}</p>
                    <p className="mt-1 text-xs text-[color:var(--app-muted)]">
                      {formatCurrency(plan.base_price)}/{plan.billing_cycle}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              id: 'features',
              header: 'Entitlements',
              render: (plan) => (
                <div className="space-y-1">
                  <div className="text-xs text-[color:var(--app-muted)]">Members: {plan.max_members ?? '—'}</div>
                  <div className="text-xs text-[color:var(--app-muted)]">Trainers: {plan.max_trainers ?? '—'}</div>
                </div>
              ),
            },
            {
              id: 'discount',
              header: 'Discount',
              render: (plan) => <span className="text-sm text-[color:var(--app-muted)]">{plan.discount_percentage ? `${plan.discount_percentage}%` : '—'}</span>,
            },
            {
              id: 'status',
              header: 'Status',
              render: (plan) => <StatusBadge value={plan.status} />,
            },
            {
              id: 'actions',
              header: 'Actions',
              render: (plan) => (
                <div className="flex flex-wrap gap-2">
                  <Link href={`/super-admin/plans/${plan.id}`} className="text-sm font-medium text-sky-600 hover:text-sky-700">
                    View
                  </Link>

                  <Link href={`/super-admin/plans/${plan.id}/edit`} className="text-sm font-medium text-[color:var(--app-text)] hover:text-sky-600">
                    Edit
                  </Link>

                  {plan.status === 'inactive' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlan(plan);
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
                        setSelectedPlan(plan);
                        setDialogMode('deactivate');
                      }}
                      className="text-sm font-medium text-amber-600 hover:text-amber-700"
                    >
                      Deactivate
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan);
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

      ) : null}

      {response ? <Pagination meta={response.meta} onPageChange={(page) => updateQuery({ page })} /> : null}

      <ConfirmDialog
        open={!!selectedPlan && !!dialogMode}
        title={
          dialogMode === 'delete'
            ? `Delete ${selectedPlan?.name}?`
            : dialogMode === 'activate'
              ? `Activate ${selectedPlan?.name}?`
              : `Deactivate ${selectedPlan?.name}?`
        }
        description={
          dialogMode === 'delete'
            ? 'This permanently removes the plan.'
            : dialogMode === 'activate'
              ? 'This plan becomes active for new subscriptions.'
              : 'This plan becomes inactive for new subscriptions.'
        }
        confirmLabel={
          dialogMode === 'delete' ? 'Delete plan' : dialogMode === 'activate' ? 'Activate plan' : 'Deactivate plan'
        }
        onClose={() => {
          setSelectedPlan(null);
          setDialogMode(null);
        }}
        onConfirm={handleAction}
      />
    </div>
  );
}
