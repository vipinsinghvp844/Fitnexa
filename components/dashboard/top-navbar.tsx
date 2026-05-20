'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout as clearAuth } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout as apiLogout } from '@/lib/api';
import { PortalConfig } from '@/lib/dashboard';
import { getGymNotificationCounts, type GymNotificationCounts } from '@/lib/gym';
import { Breadcrumbs } from './breadcrumbs';
import { DashboardIcon } from './dashboard-icons';
import { ThemeToggle } from './theme-toggle';

function NotificationBell({ portal }: { portal: string }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (portal !== 'gym') return;

    let cancelled = false;

    (async () => {
      try {
        const response = (await getGymNotificationCounts()) as { data: GymNotificationCounts };
        if (!cancelled) setUnreadCount(response.data.unread_notifications);
      } catch {
        // Silently fail — this is a non-critical badge
      }
    })();

    // Refresh every 60 seconds
    const intervalId = window.setInterval(async () => {
      try {
        const response = (await getGymNotificationCounts()) as { data: GymNotificationCounts };
        if (!cancelled) setUnreadCount(response.data.unread_notifications);
      } catch {
        // Silently fail
      }
    }, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [portal]);

  if (portal !== 'gym') return null;

  return (
    <Link
      href="/gym/notifications"
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] text-[color:var(--app-text)] shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-600"
      aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
    >
      <DashboardIcon name="bell" className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-[0_2px_8px_rgba(244,63,94,0.4)]">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}

export function TopNavbar({
  config,
  onOpenSidebar,
}: {
  config: PortalConfig;
  onOpenSidebar: () => void;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, refreshToken } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      if (refreshToken) {
        await apiLogout({ refresh_token: refreshToken });
      }
    } catch {
      // Logout should still clear the local session if the backend call fails.
    } finally {
      dispatch(clearAuth());
      router.replace('/login');
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--app-border)] bg-[color:var(--app-topbar)]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] text-[color:var(--app-text)] shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-600 lg:hidden"
          aria-label="Open sidebar"
        >
          <DashboardIcon name="menu" className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <Breadcrumbs portal={config.key} />
          <div className="md:hidden">
            <p className="text-sm font-medium text-sky-600 dark:text-sky-300">{config.label}</p>
            <h2 className="truncate text-lg font-semibold text-[color:var(--app-text)]">{user?.name ?? 'Dashboard'}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <NotificationBell portal={config.key} />
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] text-[color:var(--app-text)] shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
            aria-label={isLoggingOut ? 'Signing out' : 'Logout'}
          >
            <DashboardIcon name="logout" className="h-5 w-5" />
          </button>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <NotificationBell portal={config.key} />
          <ThemeToggle />
          <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-2.5 shadow-sm">
            <p className="text-sm font-semibold text-[color:var(--app-text)]">{user?.name ?? 'Workspace User'}</p>
            <p className="text-xs text-[color:var(--app-muted)]">{user?.roles?.[0] ?? config.label}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 text-sm font-medium text-[color:var(--app-text)] shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <DashboardIcon name="logout" className="h-4 w-4" />
            {isLoggingOut ? 'Signing out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
}
