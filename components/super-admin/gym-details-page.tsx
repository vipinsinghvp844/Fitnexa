'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { LoadingState } from '@/components/admin/loading-state';
import { AdminPageHeader, AdminPrimaryLink } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { StatCard } from '@/components/admin/stat-card';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import { activateGym, deleteGym, getGym, GymSummary, suspendGym } from '@/lib/super-admin';

export function GymDetailsPage({
  gymId,
  tempPassword,
  updated,
}: {
  gymId: string;
  tempPassword?: string;
  updated?: string;
}) {
  const router = useRouter();
  const [gym, setGym] = useState<GymSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<'delete' | 'suspend' | 'activate' | null>(null);

  useEffect(() => {
    let mounted = true;

    getGym(gymId)
      .then((response) => {
        if (mounted) setGym(response);
      })
      .catch((fetchError) => {
        if (mounted) setError(getErrorMessage(fetchError, 'Failed to load gym details'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [gymId]);

  const handleDialogConfirm = async () => {
    if (!gym || !dialogMode) return;

    if (dialogMode === 'delete') {
      await deleteGym(gym.id);
      router.push('/super-admin/gyms');
      return;
    }

    const nextGym = dialogMode === 'suspend' ? await suspendGym(gym.id) : await activateGym(gym.id);
    setGym(nextGym.data);
    setDialogMode(null);
  };

  if (loading) {
    return <LoadingState label="Loading gym details..." />;
  }

  if (error || !gym) {
    return <LoadingState label={error || 'Gym not found'} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Gym Details"
        title={gym.name}
        description="Review owner information, operational footprint, active subscription, and recent billing records for this gym."
        actions={
          <>
            <AdminPrimaryLink href={`/super-admin/gyms/${gym.id}/edit`}>Edit gym</AdminPrimaryLink>
            <Link href="/super-admin/gyms" className="inline-flex items-center rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)] transition hover:border-sky-300 hover:text-sky-600">
              Back to gyms
            </Link>
          </>
        }
      />

      {tempPassword ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          Owner account created successfully. Temporary password: <span className="font-semibold">{tempPassword}</span>
        </div>
      ) : null}

      {updated ? (
        <div className="rounded-[24px] border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
          Gym details updated successfully.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Members" value={String(gym.counts.members)} hint="Total registered members" icon={<DashboardIcon name="members" className="h-5 w-5" />} />
        <StatCard label="Trainers" value={String(gym.counts.trainers)} hint="Assigned trainers" icon={<DashboardIcon name="trainers" className="h-5 w-5" />} />
        <StatCard label="Branches" value={String(gym.counts.branches)} hint="Branch footprint" icon={<DashboardIcon name="gym" className="h-5 w-5" />} />
        <StatCard label="Subscriptions" value={String(gym.counts.subscriptions)} hint="Subscription records linked" icon={<DashboardIcon name="subscriptions" className="h-5 w-5" />} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <div className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[color:var(--app-text)]">Gym profile</h2>
              <p className="mt-2 text-sm text-[color:var(--app-muted)]">Commercial identity and owner-level details.</p>
            </div>
            <StatusBadge value={gym.status} />
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Owner</p>
              <p className="mt-2 text-base font-semibold text-[color:var(--app-text)]">{gym.owner.name || 'No owner'}</p>
              <p className="mt-1 text-sm text-[color:var(--app-muted)]">{gym.owner.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Phone</p>
              <p className="mt-2 text-base text-[color:var(--app-text)]">{gym.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Location</p>
              <p className="mt-2 text-base text-[color:var(--app-text)]">
                {[gym.city, gym.state, gym.country].filter(Boolean).join(', ') || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">GST number</p>
              <p className="mt-2 text-base text-[color:var(--app-text)]">{gym.gst_number || '—'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Address</p>
              <p className="mt-2 text-base text-[color:var(--app-text)]">{gym.address || '—'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[color:var(--app-text)]">Active subscription</h2>
            <div className="mt-5 space-y-3 text-sm text-[color:var(--app-muted)]">
              <p><span className="font-semibold text-[color:var(--app-text)]">Plan:</span> {gym.active_subscription?.plan_name ?? 'No active plan'}</p>
              <p><span className="font-semibold text-[color:var(--app-text)]">Cycle:</span> {gym.active_subscription?.billing_cycle ?? '—'}</p>
              <p><span className="font-semibold text-[color:var(--app-text)]">Ends:</span> {formatDate(gym.active_subscription?.end_date)}</p>
              <p><span className="font-semibold text-[color:var(--app-text)]">Charge:</span> {formatCurrency(gym.active_subscription?.final_amount)}</p>
            </div>
            <div className="mt-5">
              <Link href="/super-admin/subscriptions" className="text-sm font-medium text-sky-600 hover:text-sky-700">
                Manage subscriptions
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[color:var(--app-text)]">Actions</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {gym.status === 'suspended' ? (
                <button
                  type="button"
                  onClick={() => setDialogMode('activate')}
                  className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-600"
                >
                  Activate gym
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setDialogMode('suspend')}
                  className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-amber-600"
                >
                  Suspend gym
                </button>
              )}
              <button
                type="button"
                onClick={() => setDialogMode('delete')}
                className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-600"
              >
                Delete gym
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[color:var(--app-text)]">Recent invoices</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(gym.recent_invoices ?? []).map((invoice) => (
            <div key={`invoice-${invoice.id}`} className="rounded-[22px] border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-4">
              <p className="text-sm font-semibold text-[color:var(--app-text)]">{formatCurrency(invoice.amount)}</p>
              <p className="mt-2 text-sm text-[color:var(--app-muted)]">Status: {invoice.status}</p>
              <p className="mt-1 text-sm text-[color:var(--app-muted)]">Due: {formatDate(invoice.due_date)}</p>
              <p className="mt-1 text-sm text-[color:var(--app-muted)]">Payments: {invoice.payments_count}</p>
            </div>
          ))}
          {!gym.recent_invoices?.length ? (
            <div className="rounded-[22px] border border-dashed border-[color:var(--app-border)] px-4 py-8 text-sm text-[color:var(--app-muted)]">
              No invoices have been generated for this gym yet.
            </div>
          ) : null}
        </div>
        <p className="mt-6 text-xs text-[color:var(--app-muted)]">Created at {formatDateTime(gym.created_at)} · Updated at {formatDateTime(gym.updated_at)}</p>
      </section>

      <ConfirmDialog
        open={!!dialogMode}
        title={
          dialogMode === 'delete'
            ? `Delete ${gym.name}?`
            : dialogMode === 'suspend'
              ? `Suspend ${gym.name}?`
              : `Activate ${gym.name}?`
        }
        description={
          dialogMode === 'delete'
            ? 'This permanently removes the gym and all tenant-linked records.'
            : dialogMode === 'suspend'
              ? 'This changes the gym status to suspended and keeps all data intact.'
              : 'This restores the gym to active status.'
        }
        confirmLabel={dialogMode === 'delete' ? 'Delete gym' : dialogMode === 'suspend' ? 'Suspend gym' : 'Activate gym'}
        onClose={() => setDialogMode(null)}
        onConfirm={handleDialogConfirm}
      />
    </div>
  );
}
