'use client';

import { ReactNode } from 'react';
import { getPortalConfig, PortalKey } from '@/lib/dashboard';
import { AuthGuard } from './auth-guard';
import { DashboardShell } from './dashboard-shell';

export function RoleDashboardLayout({
  portal,
  children,
}: {
  portal: PortalKey;
  children: ReactNode;
}) {
  const config = getPortalConfig(portal);

  return (
    <AuthGuard allowedRoles={config.allowedRoles}>
      <DashboardShell portal={portal}>{children}</DashboardShell>
    </AuthGuard>
  );
}
