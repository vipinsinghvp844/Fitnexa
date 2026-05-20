'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getPortalConfig, PortalKey } from '@/lib/dashboard';
import { Sidebar } from './sidebar';
import { TopNavbar } from './top-navbar';

export function DashboardShell({
  portal,
  children,
}: {
  portal: PortalKey;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const config = getPortalConfig(portal);

  return (
    <div className="min-h-screen bg-[color:var(--app-bg)] text-[color:var(--app-text)]">
      <Sidebar
        config={config}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
      />
      <div className="lg:pl-72">
        <TopNavbar config={config} onOpenSidebar={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
