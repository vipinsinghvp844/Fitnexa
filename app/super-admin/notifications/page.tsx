'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingState } from '@/components/admin/loading-state';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/admin/pagination';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import {
  getSuperAdminNotificationCounts,
  getSuperAdminNotifications,
  markAllSuperAdminNotificationsRead,
  markSuperAdminNotificationRead,
  type PaginatedResponse,
} from '@/lib/super-admin';
import type { GymNotification } from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';

type NotificationQuery = {
  read: string;
  page: number;
};

const readOptions = [
  { value: '', label: 'All Status' },
  { value: 'false', label: 'Unread' },
  { value: 'true', label: 'Read' },
];

function NotificationCard({
  notification,
  onMarkRead,
  isMarking,
}: {
  notification: GymNotification;
  onMarkRead: (id: number) => void;
  isMarking: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-l-4 border-l-sky-500 border-[color:var(--app-border)] p-5 shadow-sm transition hover:shadow-md bg-sky-50/50 dark:bg-sky-950/20 ${
        notification.read ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-[color:var(--app-text)] shadow-sm dark:bg-white/10">
          <DashboardIcon name="bell" className="h-5 w-5 text-sky-500" />
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
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-[color:var(--app-muted)]">
              <span className="capitalize">{notification.category || 'Platform Event'}</span>
              <span>·</span>
              <span>{notification.created_at ? new Date(notification.created_at).toLocaleString() : '-'}</span>
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

export default function SuperAdminNotificationsPage() {
  const [query, setQuery] = useState<NotificationQuery>({
    read: '',
    page: 1,
  });

  const [notifications, setNotifications] = useState<PaginatedResponse<GymNotification> | null>(null);
  const [counts, setCounts] = useState<{ unread_notifications: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [notifResponse, countsResponse] = await Promise.all([
        getSuperAdminNotifications({
          unread_only: query.read === 'false' ? true : null,
          page: query.page,
        }),
        getSuperAdminNotificationCounts(),
      ]);

      setNotifications(notifResponse as PaginatedResponse<GymNotification>);
      setCounts((countsResponse as { data: { unread_notifications: number } }).data);
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

  async function handleMarkRead(notificationId: number) {
    setMarkingId(notificationId);
    try {
      await markSuperAdminNotificationRead(notificationId);
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
      await markAllSuperAdminNotificationsRead();
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
        eyebrow="Platform Alerts"
        title="Notifications"
        description="Stay updated on new gym registrations, successful payments, and critical platform events."
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className={`flex items-center gap-4 rounded-2xl border p-5 shadow-sm border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300`}>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/60 dark:bg-black/20">
            <DashboardIcon name="status" className="h-6 w-6" />
          </span>
          <div>
            <div className="text-3xl font-semibold tracking-tight">{counts?.unread_notifications ?? 0}</div>
            <div className="mt-1 text-sm font-medium opacity-80">Unread Notifications</div>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
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
        </div>
      </section>

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
              You are all caught up! Platform alerts and registration events will appear here.
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
