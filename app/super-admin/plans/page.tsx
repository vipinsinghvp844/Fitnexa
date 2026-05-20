'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, DataTableColumn } from '@/components/admin/data-table';
import { StatusBadge } from '@/components/admin/status-badge';
import { getPlans, type PlanSummary, type PaginationMeta, activatePlan, deactivatePlan, deletePlan } from '@/lib/super-admin';
import { getErrorMessage } from '@/lib/errors';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { PlanModal } from './_components/plan-modal';

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanSummary | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await getPlans();
      setPlans(res.data);
      setMeta(res.meta);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreate = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: PlanSummary) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (plan: PlanSummary) => {
    const isActivating = plan.status === 'inactive';
    setConfirmDialog({
      isOpen: true,
      title: isActivating ? 'Activate Plan' : 'Deactivate Plan',
      message: `Are you sure you want to ${isActivating ? 'activate' : 'deactivate'} ${plan.name}? ${!isActivating ? 'This will prevent new gyms from subscribing to it.' : ''}`,
      action: async () => {
        try {
          if (isActivating) {
            await activatePlan(plan.id);
          } else {
            await deactivatePlan(plan.id);
          }
          await fetchPlans();
        } catch (err) {
          setError(getErrorMessage(err));
        }
      },
    });
  };

  const handleDelete = (plan: PlanSummary) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Plan',
      message: `Are you sure you want to permanently delete ${plan.name}? This action cannot be undone.`,
      action: async () => {
        try {
          await deletePlan(plan.id);
          await fetchPlans();
        } catch (err) {
          setError(getErrorMessage(err));
        }
      },
    });
  };

  const columns: DataTableColumn<PlanSummary>[] = [
    {
      header: 'Plan Name',
      id: 'name',
      render: (item: PlanSummary) => (
        <div>
          <div className="font-medium text-[color:var(--app-text)]">{item.name}</div>
          <div className="text-xs text-[color:var(--app-muted)] line-clamp-1">{item.description}</div>
        </div>
      ),
    },
    {
      header: 'Pricing',
      id: 'final_price',
      render: (item: PlanSummary) => (
        <div>
          <div className="font-semibold">${item.final_price} <span className="text-xs text-[color:var(--app-muted)] font-normal">/{item.billing_cycle}</span></div>
          {item.discount_percentage > 0 && (
            <div className="text-xs text-emerald-600 dark:text-emerald-400">-{item.discount_percentage}% off</div>
          )}
        </div>
      ),
    },
    {
      header: 'Limits',
      id: 'max_members',
      render: (item: PlanSummary) => (
        <div className="text-sm">
          <div>Members: {item.max_members || 'Unlimited'}</div>
          <div className="text-[color:var(--app-muted)]">Trainers: {item.max_trainers || 'Unlimited'}</div>
        </div>
      ),
    },
    {
      header: 'Subscribers',
      id: 'subscriptions_count',
      render: (item: PlanSummary) => (
        <div className="font-medium">{item.subscriptions_count}</div>
      ),
    },
    {
      header: 'Status',
      id: 'status',
      render: (item: PlanSummary) => <StatusBadge value={String(item.status)} />,
    },
    {
      header: 'Actions',
      id: 'actions',
      render: (item: PlanSummary) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 transition-colors"
            title="Edit Plan"
          >
            <DashboardIcon name="settings" className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(item)}
            className={`p-1.5 rounded-lg transition-colors ${
              item.status === 'active'
                ? 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10'
                : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10'
            }`}
            title={item.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            <DashboardIcon name={item.status === 'active' ? 'pause' : 'play'} className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
            title="Delete Plan"
          >
            <DashboardIcon name="x" className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        <p className="text-sm font-medium text-[color:var(--app-muted)]">Loading platform plans...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Platform Plans"
        description="Manage SaaS pricing tiers, features, and limits for gyms."
        actions={
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(14,165,233,0.28)] transition hover:-translate-y-0.5 hover:bg-sky-600"
          >
            Create Plan
          </button>
        }
      />

      {error && (
        <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={plans}
        rowKey={(item) => String(item.id)}
        emptyTitle="No platform plans found"
        emptyDescription="Create your first pricing plan to allow gyms to subscribe."
      />

      <ConfirmDialog
        open={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.message}
        onConfirm={async () => {
          await confirmDialog.action();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      <PlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        onSuccess={fetchPlans}
      />
    </div>
  );
}
