'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingState } from '@/components/admin/loading-state';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/admin/pagination';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import {
  generateGymNotifications,
  getGymNotificationCounts,
  getGymNotifications,
  markAllGymNotificationsRead,
  markGymNotificationRead,
  type GymNotification,
  type GymNotificationCounts,
  type PaginatedResponse,
} from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';

type NotificationQuery = {
  category: string;
  read: string;
  priority: string;
  page: number;
};

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'renewal', label: 'Renewal' },
  { value: 'payment', label: 'Payment' },
  { value: 'alert', label: 'Alert' },
  { value: 'system', label: 'System' },
];

const readOptions = [
  { value: '', label: 'All Status' },
  { value: 'false', label: 'Unread' },
  { value: 'true', label: 'Read' },
];

const priorityColors: Record<string, string> = {
  critical: 'border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/20',
  high: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
  medium: 'border-l-sky-500 bg-sky-50/50 dark:bg-sky-950/20',
  low: 'border-l-slate-300 bg-slate-50/50 dark:bg-slate-800/20',
};

const categoryIcons: Record<string, 'bell' | 'payments' | 'shield' | 'settings'> = {
  renewal: 'bell',
  payment: 'payments',
  alert: 'shield',
  system: 'settings',
};

const priorityLabels: Record<string, { text: string; className: string }> = {
  critical: { text: 'Critical', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  high: { text: 'High', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  medium: { text: 'Medium', className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  low: { text: 'Low', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
};

function AlertCountTile({
  label,
  count,
  tone,
  icon,
}: {
  label: string;
  count: number;
  tone: 'rose' | 'amber' | 'sky' | 'emerald';
  icon: 'bell' | 'payments' | 'shield' | 'status';
}) {
  const toneClass = {
    rose: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    sky: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  }[tone];

  return (
    <div className={`flex items-center gap-4 rounded-2xl border p-5 shadow-sm ${toneClass}`}>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/60 dark:bg-black/20">
        <DashboardIcon name={icon} className="h-6 w-6" />
      </span>
      <div>
        <div className="text-3xl font-semibold tracking-tight">{count}</div>
        <div className="mt-1 text-sm font-medium opacity-80">{label}</div>
      </div>
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
  isMarking,
}: {
  notification: GymNotification;
  onMarkRead: (id: number) => void;
  isMarking: boolean;
}) {
  const priorityStyle = priorityColors[notification.priority] ?? priorityColors.low;
  const priority = priorityLabels[notification.priority] ?? priorityLabels.low;
  const iconName = categoryIcons[notification.category] ?? 'bell';
  const data = notification.data;

  return (
    <div
      className={`relative rounded-2xl border border-l-4 border-[color:var(--app-border)] p-5 shadow-sm transition hover:shadow-md ${priorityStyle} ${
        notification.read ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-[color:var(--app-text)] shadow-sm dark:bg-white/10">
          <DashboardIcon name={iconName} className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-[color:var(--app-text)]">{notification.title}</h3>
                {!notification.read && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.5)]" />
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--app-muted)]">{notification.message}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${priority.className}`}>
                {priority.text}
              </span>
            </div>
          </div>

          {data && (
            <div className="mt-3 flex flex-wrap gap-2">
              {data.member_name && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/60 px-2.5 py-1 text-xs font-medium text-[color:var(--app-text)] dark:bg-white/10">
                  <DashboardIcon name="members" className="h-3.5 w-3.5" />
                  {data.member_name}
                </span>
              )}
              {data.plan_name && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/60 px-2.5 py-1 text-xs font-medium text-[color:var(--app-text)] dark:bg-white/10">
                  <DashboardIcon name="plans" className="h-3.5 w-3.5" />
                  {data.plan_name}
                </span>
              )}
              {data.invoice_number && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/60 px-2.5 py-1 text-xs font-medium text-[color:var(--app-text)] dark:bg-white/10">
                  <DashboardIcon name="credit-card" className="h-3.5 w-3.5" />
                  {data.invoice_number}
                </span>
              )}
              {data.amount !== undefined && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/60 px-2.5 py-1 text-xs font-medium text-[color:var(--app-text)] dark:bg-white/10">
                  ₹{Number(data.amount).toLocaleString('en-IN')}
                </span>
              )}
              {data.days_remaining !== undefined && data.days_remaining >= 0 && (
                <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                  data.days_remaining === 0
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                    : data.days_remaining <= 3
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
                }`}>
                  {data.days_remaining === 0 ? 'Expires Today' : `${data.days_remaining} day${data.days_remaining > 1 ? 's' : ''} left`}
                </span>
              )}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-[color:var(--app-muted)]">
              <span className="capitalize">{notification.category}</span>
              <span>·</span>
              <span>{notification.time_ago ?? '-'}</span>
            </div>

            {!notification.read && (
              <button
                type="button"
                onClick={() => onMarkRead(notification.id)}
                disabled={isMarking}
                className="rounded-xl border border-[color:var(--app-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--app-text)] shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900"
              >
                Mark Read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GymNotificationsPage() {
  const [query, setQuery] = useState<NotificationQuery>({
    category: '',
    read: '',
    priority: '',
    page: 1,
  });

  const [notifications, setNotifications] = useState<PaginatedResponse<GymNotification> | null>(null);
  const [counts, setCounts] = useState<GymNotificationCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [notifResponse, countsResponse] = await Promise.all([
        getGymNotifications({
          category: query.category || null,
          read: query.read || null,
          priority: query.priority || null,
          page: query.page,
          per_page: 15,
        }),
        getGymNotificationCounts(),
      ]);

      setNotifications(notifResponse as PaginatedResponse<GymNotification>);
      setCounts((countsResponse as { data: GymNotificationCounts }).data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadNotifications();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadNotifications]);

  function updateQuery(patch: Partial<NotificationQuery>) {
    setQuery((current) => ({
      ...current,
      ...patch,
      page: patch.page ?? 1,
    }));
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setNotice(null);
    try {
      const response = (await generateGymNotifications()) as {
        message: string;
        data: { generated: { expiring: number; payments: number; renewals: number }; counts: GymNotificationCounts };
      };
      const g = response.data.generated;
      const total = g.expiring + g.payments + g.renewals;
      setNotice(total > 0 ? `${total} new notification${total > 1 ? 's' : ''} generated.` : 'No new alerts detected. All up to date.');
      setCounts(response.data.counts);
      await loadNotifications();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  }

  async function handleMarkRead(notificationId: number) {
    setMarkingId(notificationId);
    try {
      await markGymNotificationRead(notificationId);
      setNotifications((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
        };
      });
      setCounts((prev) => (prev ? { ...prev, unread_notifications: Math.max(0, prev.unread_notifications - 1) } : prev));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setMarkingId(null);
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await markAllGymNotificationsRead();
      setNotifications((prev) => {
        if (!prev) return prev;
        return { ...prev, data: prev.data.map((n) => ({ ...n, read: true })) };
      });
      setCounts((prev) => (prev ? { ...prev, unread_notifications: 0 } : prev));
      setNotice('All notifications marked as read.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setMarkingAll(false);
    }
  }

  const hasUnread = useMemo(() => notifications?.data.some((n) => !n.read) ?? false, [notifications]);

  if (loading && !notifications) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Alerts"
        title="Notifications & Renewals"
        description="Auto-generated alerts for expiring memberships, pending payments, and renewal reminders."
        actions={
          <div className="flex items-center gap-3">
            {hasUnread && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {markingAll ? 'Marking...' : 'Mark All Read'}
              </button>
            )}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(14,165,233,0.24)] transition hover:-translate-y-0.5 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <DashboardIcon name="refresh" className="h-4 w-4" />
              {generating ? 'Scanning...' : 'Generate Alerts'}
            </button>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          {notice}
        </div>
      )}

      {/* Alert Count Tiles */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AlertCountTile label="Expiring Soon" count={counts?.expiring_soon ?? 0} tone="amber" icon="bell" />
        <AlertCountTile label="Pending Payments" count={counts?.pending_payments ?? 0} tone="rose" icon="payments" />
        <AlertCountTile label="Overdue Payments" count={counts?.overdue_payments ?? 0} tone="rose" icon="shield" />
        <AlertCountTile label="Unread Notifications" count={counts?.unread_notifications ?? 0} tone="sky" icon="status" />
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--app-muted)]">Category</label>
            <select
              value={query.category}
              onChange={(e) => updateQuery({ category: e.target.value })}
              className="w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-3 py-2.5 text-sm text-[color:var(--app-text)] outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--app-muted)]">Status</label>
            <select
              value={query.read}
              onChange={(e) => updateQuery({ read: e.target.value })}
              className="w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-3 py-2.5 text-sm text-[color:var(--app-text)] outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
            >
              {readOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--app-muted)]">Priority</label>
            <select
              value={query.priority}
              onChange={(e) => updateQuery({ priority: e.target.value })}
              className="w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-3 py-2.5 text-sm text-[color:var(--app-text)] outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notification List */}
      <section className="space-y-3">
        {notifications?.data.length ? (
          notifications.data.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
              isMarking={markingId === notification.id}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-8 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-500 dark:bg-sky-950/40">
              <DashboardIcon name="bell" className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-[color:var(--app-text)]">No Notifications</h3>
            <p className="mt-2 text-sm text-[color:var(--app-muted)]">
              All clear! Click &quot;Generate Alerts&quot; to scan for expiring memberships and pending payments.
            </p>
          </div>
        )}
      </section>

      {notifications?.meta && notifications.meta.last_page > 1 && (
        <Pagination meta={notifications.meta} onPageChange={(page) => updateQuery({ page })} />
      )}
    </div>
  );
}
