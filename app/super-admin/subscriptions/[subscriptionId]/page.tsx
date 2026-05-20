'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminPageHeader, AdminSecondaryButton } from '@/components/admin/page-header';
import { StatCard } from '@/components/admin/stat-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { getErrorMessage } from '@/lib/errors';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { cancelSubscription, getSubscription, pauseSubscription, renewSubscription, resumeSubscription, SubscriptionSummary, suspendSubscription } from '@/lib/super-admin';

interface SubscriptionDetailPageProps {
  params: {
    subscriptionId: string;
  };
}

export default function SubscriptionDetailPage({ params }: SubscriptionDetailPageProps) {
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayStatus = subscription?.status ?? 'unknown';
  const displayTenantName = subscription?.tenant?.name ?? 'Gym';
  const displayTenantOwnerName = subscription?.tenant?.owner_name ?? '—';
  const displayTenantOwnerEmail = subscription?.tenant?.owner_email ?? '—';
  const displayPlanName = subscription?.plan?.name ?? 'N/A';
  const displayPlanBillingCycle = subscription?.plan?.billing_cycle ?? 'N/A';
  const displayPlanBasePrice = subscription?.plan?.base_price ?? 0;
  const displayPaymentMethod = subscription?.payment_method ?? 'N/A';

  useEffect(() => {
    getSubscription(params.subscriptionId)
      .then((response) => {
        setSubscription(response);
      })
      .catch((fetchError) => {
        setError(getErrorMessage(fetchError, 'Failed to load subscription'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.subscriptionId]);

  const handleAction = async (action: 'pause' | 'resume' | 'suspend' | 'cancel' | 'renew') => {
    if (!subscription) return;

    try {
      let result: SubscriptionSummary;

      switch (action) {
        case 'pause':
          result = (await pauseSubscription(subscription.id)).data;
          break;
        case 'resume':
          result = (await resumeSubscription(subscription.id)).data;
          break;
        case 'suspend':
          result = (await suspendSubscription(subscription.id)).data;
          break;
        case 'cancel':
          result = (await cancelSubscription(subscription.id, {})).data;
          break;
        case 'renew':
          result = (await renewSubscription(subscription.id, {})).data;
          break;
      }

      setSubscription(result);
    } catch (actionError) {
      setError(getErrorMessage(actionError, 'Failed to perform action'));
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-[color:var(--app-muted)]">Loading subscription...</div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Subscription not found'}</p>
          <Link
            href="/super-admin/subscriptions"
            className="mt-4 inline-block rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
          >
            Back to Subscriptions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Super Admin"
        title={`Subscription #${subscription.id}`}
        description={`Manage subscription for ${displayTenantName}`}
        actions={
          <>
            <Link
              href="/super-admin/subscriptions"
              className="inline-flex items-center rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)] transition hover:border-sky-300 hover:text-sky-600"
            >
              Back
            </Link>

            {displayStatus === 'active' && (
              <>
                <button
                  onClick={() => handleAction('pause')}
                  className="inline-flex items-center rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
                >
                  <DashboardIcon name="pause" className="mr-2 h-4 w-4" />
                  Pause
                </button>
                <button
                  onClick={() => handleAction('cancel')}
                  className="inline-flex items-center rounded-2xl border border-red-300 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300"
                >
                  <DashboardIcon name="x" className="mr-2 h-4 w-4" />
                  Cancel
                </button>
              </>
            )}

            {displayStatus === 'paused' && (
              <button
                onClick={() => handleAction('resume')}
                className="inline-flex items-center rounded-2xl border border-green-300 bg-green-50 px-5 py-3 text-sm font-medium text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300"
              >
                <DashboardIcon name="play" className="mr-2 h-4 w-4" />
                Resume
              </button>
            )}

            {(displayStatus === 'expired' || displayStatus === 'cancelled') && (
              <button
                onClick={() => handleAction('renew')}
                className="inline-flex items-center rounded-2xl bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700"
              >
                <DashboardIcon name="refresh" className="mr-2 h-4 w-4" />
                Renew
              </button>
            )}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Status" value={displayStatus} hint="Current subscription status" icon={<DashboardIcon name="status" className="h-5 w-5" />} />
        <StatCard label="Plan" value={displayPlanName} hint="Assigned plan" icon={<DashboardIcon name="plans" className="h-5 w-5" />} />
        <StatCard label="Amount" value={formatCurrency(subscription.final_amount ?? 0)} hint="Final amount after discount" accent="emerald" icon={<DashboardIcon name="payments" className="h-5 w-5" />} />
        <StatCard label="Payment Method" value={displayPaymentMethod} hint="Payment method used" icon={<DashboardIcon name="credit-card" className="h-5 w-5" />} />
      </section>

      <section className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--app-text)]">Subscription Details</h2>
            <p className="mt-2 text-sm text-[color:var(--app-muted)]">Complete information about this subscription.</p>
          </div>
          <StatusBadge value={displayStatus} />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Gym Information</p>
              <div className="mt-3 space-y-2">
                <p><span className="font-semibold text-[color:var(--app-text)]">Name:</span> {displayTenantName}</p>
                <p><span className="font-semibold text-[color:var(--app-text)]">Owner:</span> {displayTenantOwnerName}</p>
                <p><span className="font-semibold text-[color:var(--app-text)]">Email:</span> {displayTenantOwnerEmail}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Plan Information</p>
              <div className="mt-3 space-y-2">
                <p><span className="font-semibold text-[color:var(--app-text)]">Plan:</span> {displayPlanName}</p>
                <p><span className="font-semibold text-[color:var(--app-text)]">Billing Cycle:</span> {displayPlanBillingCycle}</p>
                <p><span className="font-semibold text-[color:var(--app-text)]">Base Price:</span> {formatCurrency(displayPlanBasePrice)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Billing Information</p>
              <div className="mt-3 space-y-2">
                <p><span className="font-semibold text-[color:var(--app-text)]">Start Date:</span> {subscription.start_date ? formatDate(subscription.start_date) : 'N/A'}</p>
                <p><span className="font-semibold text-[color:var(--app-text)]">End Date:</span> {subscription.end_date ? formatDate(subscription.end_date) : 'N/A'}</p>
                <p><span className="font-semibold text-[color:var(--app-text)]">Next Billing:</span> {subscription.next_billing_date ? formatDate(subscription.next_billing_date) : 'N/A'}</p>
                <p><span className="font-semibold text-[color:var(--app-text)]">Renewal Date:</span> {subscription.renewal_date ? formatDate(subscription.renewal_date) : 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Pricing</p>
              <div className="mt-3 space-y-2">
                <p><span className="font-semibold text-[color:var(--app-text)]">Base Amount:</span> {formatCurrency(subscription.price ?? 0)}</p>
                {Number(subscription.discount_amount) > 0 && (
                  <p><span className="font-semibold text-green-600">Discount:</span> -{formatCurrency(subscription.discount_amount)}</p>
                )}
                <p><span className="font-semibold text-[color:var(--app-text)]">Final Amount:</span> {formatCurrency(subscription.final_amount ?? 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {subscription.coupon && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Applied Coupon</p>
            <div className="mt-3 rounded-lg border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-4">
              <p><span className="font-semibold text-[color:var(--app-text)]">Code:</span> {subscription.coupon.code}</p>
              <p><span className="font-semibold text-[color:var(--app-text)]">Type:</span> {subscription.coupon.discount_type}</p>
              <p><span className="font-semibold text-[color:var(--app-text)]">Value:</span> {subscription.coupon.discount_value}</p>
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">Lifecycle Events</p>
          <div className="mt-3 space-y-2 text-sm">
            {subscription.cancelled_at && (
              <p><span className="font-semibold text-red-600">Cancelled:</span> {formatDateTime(subscription.cancelled_at)}</p>
            )}
            {subscription.paused_at && (
              <p><span className="font-semibold text-amber-600">Paused:</span> {formatDateTime(subscription.paused_at)}</p>
            )}
            {subscription.resumed_at && (
              <p><span className="font-semibold text-green-600">Resumed:</span> {formatDateTime(subscription.resumed_at)}</p>
            )}
            {subscription.grace_period_ends_at && subscription.status === 'expired' && (
              <p><span className="font-semibold text-orange-600">Grace Period Ends:</span> {formatDateTime(subscription.grace_period_ends_at)}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}