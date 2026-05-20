'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LoadingState } from '@/components/admin/loading-state';
import { AdminPageHeader, AdminPrimaryLink } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { StatCard } from '@/components/admin/stat-card';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import { getPlan, PlanSummary } from '@/lib/super-admin';

export function PlanDetailsPage({ planId }: { planId: string }) {
  const [plan, setPlan] = useState<PlanSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getPlan(planId)
      .then((response) => {
        if (mounted) setPlan(response);
      })
      .catch((fetchError) => {
        if (mounted) setError(getErrorMessage(fetchError, 'Failed to load plan details'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [planId]);

  if (loading) {
    return <LoadingState label="Loading plan details..." />;
  }

  if (error || !plan) {
    return <LoadingState label={error || 'Plan not found'} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Plan Details"
        title={plan.name}
        description="Review plan configuration, limits, and current status."
        actions={
          <>
            <AdminPrimaryLink href={`/super-admin/plans/${plan.id}/edit`}>Edit plan</AdminPrimaryLink>
            <Link
              href="/super-admin/plans"
              className="inline-flex items-center rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)] transition hover:border-sky-300 hover:text-sky-600"
            >
              Back to plans
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Billing cycle" value={plan.billing_cycle} hint="Monthly / Quarterly / Yearly" icon={<DashboardIcon name="plans" className="h-5 w-5" />} />
        <StatCard label="Base price" value={formatCurrency(plan.base_price)} hint="Base subscription price" accent="emerald" icon={<DashboardIcon name="payments" className="h-5 w-5" />} />
        <StatCard label="Duration" value={`${plan.duration_days} days`} hint="Billing duration" icon={<DashboardIcon name="subscriptions" className="h-5 w-5" />} />
        <StatCard label="Status" value={plan.status} hint="Active/inactive" icon={<DashboardIcon name="dashboard" className="h-5 w-5" />} />
      </section>

      <section className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--app-text)]">Configuration</h2>
            <p className="mt-2 text-sm text-[color:var(--app-muted)]">Limits and entitlement features configured for this plan.</p>
          </div>
          <StatusBadge value={plan.status} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Discount</p>
            <p className="mt-2 text-base font-semibold text-[color:var(--app-text)]">{plan.discount_percentage ? `${plan.discount_percentage}%` : '—'}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Plan type</p>
            <p className="mt-2 text-base font-semibold text-[color:var(--app-text)]">{plan.is_unlimited ? 'Unlimited' : 'Limited'}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Max members</p>
            <p className="mt-2 text-base font-semibold text-[color:var(--app-text)]">{plan.is_unlimited ? 'Unlimited' : (plan.max_members ?? '—')}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Max trainers</p>
            <p className="mt-2 text-base font-semibold text-[color:var(--app-text)]">{plan.is_unlimited ? 'Unlimited' : (plan.max_trainers ?? '—')}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Max branches</p>
            <p className="mt-2 text-base font-semibold text-[color:var(--app-text)]">{plan.is_unlimited ? 'Unlimited' : (plan.max_branches ?? '—')}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Max staff</p>
            <p className="mt-2 text-base font-semibold text-[color:var(--app-text)]">{plan.is_unlimited ? 'Unlimited' : (plan.max_staff ?? '—')}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Max classes</p>
            <p className="mt-2 text-base font-semibold text-[color:var(--app-text)]">{plan.is_unlimited ? 'Unlimited' : (plan.max_classes ?? '—')}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Max inventory items</p>
            <p className="mt-2 text-base font-semibold text-[color:var(--app-text)]">{plan.is_unlimited ? 'Unlimited' : (plan.max_inventory_items ?? '—')}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Features</p>
          {plan.features?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {plan.features.map((feature, idx) => (
                <span
                  key={`feature-${feature}-${idx}`}
                  className="rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] px-3 py-1 text-xs font-medium text-[color:var(--app-muted)]"
                >
                  {feature}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[color:var(--app-muted)]">No features defined.</p>
          )}
        </div>
      </section>

      <p className="text-xs text-[color:var(--app-muted)]">
        Created at {formatDateTime(plan.created_at)} · Updated at {formatDateTime(plan.updated_at)}
      </p>
    </div>
  );
}
