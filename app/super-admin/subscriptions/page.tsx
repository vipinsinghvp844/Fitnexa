'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, DataTableColumn } from '@/components/admin/data-table';
import { StatusBadge } from '@/components/admin/status-badge';
import { getSubscriptions, type SubscriptionSummary, type PaginationMeta } from '@/lib/super-admin';
import { getErrorMessage } from '@/lib/errors';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { SubscriptionActionsModal } from './_components/subscription-actions-modal';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionSummary[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<SubscriptionSummary | null>(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await getSubscriptions();
      setSubscriptions(res.data);
      setMeta(res.meta);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleManage = (sub: SubscriptionSummary) => {
    setSelectedSub(sub);
    setIsActionModalOpen(true);
  };

  const columns: DataTableColumn<SubscriptionSummary>[] = [
    {
      header: 'Gym',
      id: 'tenant',
      render: (item: SubscriptionSummary) => (
        <div>
          <div className="font-bold text-[color:var(--app-text)]">{item.tenant?.name || 'Deleted Gym'}</div>
          <div className="text-xs text-[color:var(--app-muted)]">{item.tenant?.owner_email || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Plan',
      id: 'plan',
      render: (item: SubscriptionSummary) => (
        <div>
          <div className="font-medium text-[color:var(--app-text)]">{item.plan?.name || 'Unknown Plan'}</div>
          <div className="text-xs text-[color:var(--app-muted)] capitalize">{item.plan?.billing_cycle || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Billing',
      id: 'final_amount',
      render: (item: SubscriptionSummary) => (
        <div>
          <div className="font-semibold text-[color:var(--app-text)]">${item.final_amount}</div>
          <div className="text-xs text-[color:var(--app-muted)]">Next: {item.next_billing_date || '-'}</div>
        </div>
      ),
    },
    {
      header: 'Validity',
      id: 'end_date',
      render: (item: SubscriptionSummary) => (
        <div className="text-sm">
          <div><span className="text-[color:var(--app-muted)]">Start:</span> {item.start_date}</div>
          <div><span className="text-[color:var(--app-muted)]">End:</span> {item.end_date || 'Forever'}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      id: 'status',
      render: (item: SubscriptionSummary) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge value={String(item.status)} />
          {item.is_expired && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Expired</span>}
        </div>
      ),
    },
    {
      header: 'Actions',
      id: 'actions',
      render: (item: SubscriptionSummary) => (
        <button
          onClick={() => handleManage(item)}
          className="flex items-center gap-2 rounded-lg border border-[color:var(--app-border)] px-3 py-1.5 text-sm font-medium hover:bg-[color:var(--app-surface-hover)] transition-colors"
        >
          <DashboardIcon name="settings" className="h-4 w-4" />
          Manage
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        <p className="text-sm font-medium text-[color:var(--app-muted)]">Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tenant Subscriptions"
        description="Monitor and manage SaaS billing plans for all gym tenants."
      />

      {error && (
        <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={subscriptions}
        rowKey={(item) => String(item.id)}
        emptyTitle="No subscriptions found"
        emptyDescription="There are currently no active or past subscriptions to display."
      />

      <SubscriptionActionsModal
        open={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        subscription={selectedSub}
        onSuccess={fetchSubscriptions}
      />
    </div>
  );
}
