'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppRole, getDefaultDashboardPath, hasRequiredRole } from '@/lib/dashboard';
import { useHydrated } from '@/hooks/use-hydrated';
import { useAppSelector } from '@/store/hooks';
import { DashboardLoadingShell } from './loading-shell';

export function AuthGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: AppRole[];
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user } = useAppSelector((state) => state.auth);
  const hydrated = useHydrated();

  const isAuthenticated = status === 'authenticated' && !!user;
  const isAuthorized = hasRequiredRole(user?.roles, allowedRoles);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!isAuthorized) {
      const home = getDefaultDashboardPath(user?.roles);
      router.replace(`/unauthorized?from=${encodeURIComponent(pathname)}&home=${encodeURIComponent(home)}`);
    }
  }, [hydrated, isAuthenticated, isAuthorized, pathname, router, user?.roles]);

  if (!hydrated) {
    return <DashboardLoadingShell title="Preparing your workspace..." />;
  }

  if (!isAuthenticated) {
    return <DashboardLoadingShell title="Redirecting to login..." />;
  }

  if (!isAuthorized) {
    return <DashboardLoadingShell title="Checking access permissions..." />;
  }

  return <>{children}</>;
}
