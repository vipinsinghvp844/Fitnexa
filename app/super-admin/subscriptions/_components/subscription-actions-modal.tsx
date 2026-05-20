'use client';

import { useState } from 'react';
import { Modal } from '@/components/admin/modal';
import { StatusBadge } from '@/components/admin/status-badge';
import { renewSubscription, cancelSubscription, pauseSubscription, resumeSubscription, type SubscriptionSummary } from '@/lib/super-admin';
import { getErrorMessage } from '@/lib/errors';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';

interface Props {
  open: boolean;
  onClose: () => void;
  subscription: SubscriptionSummary | null;
  onSuccess: () => void;
}

export function SubscriptionActionsModal({ open, onClose, subscription, onSuccess }: Props) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!subscription) return null;

  const handleAction = async (actionStr: string, apiCall: () => Promise<any>) => {
    setLoadingAction(actionStr);
    setError(null);
    try {
      await apiCall();
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Manage Tenant Subscription">
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-[color:var(--app-text)]">{subscription.tenant?.name || 'Deleted Gym'}</h3>
              <p className="text-sm text-[color:var(--app-muted)] mt-1">Plan: {subscription.plan?.name || 'Unknown'}</p>
            </div>
            <StatusBadge value={subscription.status} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[color:var(--app-border)] pt-4 text-sm">
            <div>
              <span className="block text-[color:var(--app-muted)]">Current Final Price</span>
              <span className="font-semibold text-[color:var(--app-text)]">${subscription.final_amount}</span>
            </div>
            <div>
              <span className="block text-[color:var(--app-muted)]">Valid Until</span>
              <span className="font-semibold text-[color:var(--app-text)]">{subscription.end_date || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[color:var(--app-muted)]">Payment Method</span>
              <span className="font-semibold text-[color:var(--app-text)] capitalize">{subscription.payment_method}</span>
            </div>
            <div>
              <span className="block text-[color:var(--app-muted)]">Coupon Used</span>
              <span className="font-semibold text-[color:var(--app-text)]">{subscription.coupon ? subscription.coupon.code : 'None'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-[color:var(--app-text)]">Manual Actions</h4>
          <p className="text-xs text-[color:var(--app-muted)]">
            Perform administrative overrides on this subscription.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              disabled={!!loadingAction}
              onClick={() => handleAction('renew', () => renewSubscription(subscription.id, { payment_method: 'manual' }))}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
            >
              <DashboardIcon name="refresh" className="h-4 w-4" />
              {loadingAction === 'renew' ? 'Processing...' : 'Force Renew'}
            </button>

            {subscription.status === 'active' || subscription.status === 'trial' ? (
              <button
                disabled={!!loadingAction}
                onClick={() => handleAction('pause', () => pauseSubscription(subscription.id))}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
              >
                <DashboardIcon name="pause" className="h-4 w-4" />
                {loadingAction === 'pause' ? 'Processing...' : 'Pause Billing'}
              </button>
            ) : subscription.status === 'paused' ? (
              <button
                disabled={!!loadingAction}
                onClick={() => handleAction('resume', () => resumeSubscription(subscription.id))}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
              >
                <DashboardIcon name="play" className="h-4 w-4" />
                {loadingAction === 'resume' ? 'Processing...' : 'Resume Billing'}
              </button>
            ) : null}

            <button
              disabled={!!loadingAction}
              onClick={() => handleAction('cancel', () => cancelSubscription(subscription.id, { reason: 'Cancelled by Super Admin' }))}
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
            >
              <DashboardIcon name="x" className="h-4 w-4" />
              {loadingAction === 'cancel' ? 'Processing...' : 'Cancel Subscription'}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[color:var(--app-text)] hover:bg-[color:var(--app-surface-hover)]"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
