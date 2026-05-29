'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { DashboardMenuItem, PortalConfig } from '@/lib/dashboard';
import { getPublicPlatformConfig } from '@/lib/api';
import { DashboardIcon } from './dashboard-icons';

function SidebarLink({
  item,
  active,
  onNavigate,
}: {
  item: DashboardMenuItem;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition',
        active
          ? 'bg-sky-500 text-white shadow-[0_16px_32px_rgba(14,165,233,0.32)]'
          : 'text-[color:var(--app-muted)] hover:bg-black/5 hover:text-[color:var(--app-text)] dark:hover:bg-white/8'
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-2xl border transition',
          active
            ? 'border-white/20 bg-white/10'
            : 'border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] group-hover:border-sky-300 dark:group-hover:border-sky-500/40'
        )}
      >
        <DashboardIcon name={item.icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{item.label}</span>
        <span
          className={cn(
            'mt-0.5 block truncate text-xs',
            active ? 'text-white/70' : 'text-[color:var(--app-muted)]'
          )}
        >
          {item.description}
        </span>
      </span>
    </Link>
  );
}

export function Sidebar({
  config,
  mobileOpen,
  onClose,
  pathname,
}: {
  config: PortalConfig;
  mobileOpen: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [features, setFeatures] = useState<Record<string, boolean>>({
    enable_classes: true,
    enable_trainers: true,
    enable_store: true,
    enable_diet_plans: true,
  });

  useEffect(() => {
    // Always fetch public config to get logo + feature flags
    getPublicPlatformConfig()
      .then((res: any) => {
        if (res?.data?.system?.maintenance_mode && config.key !== 'super-admin' && typeof window !== 'undefined') {
           window.location.href = '/maintenance';
           return;
        }

        if (res?.data?.platform?.logo) {
          let gymLogo = null;
          if (config.key !== 'super-admin' && typeof window !== 'undefined') {
            try {
              const auth = JSON.parse(localStorage.getItem('auth') || '{}');
              gymLogo = auth?.user?.tenant?.logo_url;
            } catch (e) {}
          }
          setLogoUrl(gymLogo || res.data.platform.logo);
        }
        if (res?.data?.features) {
          setFeatures(res.data.features as Record<string, boolean>);
        }
      })
      .catch(() => {});
  }, [config.key]);

  // Map menu item IDs to feature flags (for gym portal)
  const FEATURE_FLAG_MAP: Record<string, string> = {
    'gym-classes':   'enable_classes',
    'gym-trainers':  'enable_trainers',
    'gym-inventory': 'enable_store',
  };

  const visibleMenu = config.menu.filter((item) => {
    const flag = FEATURE_FLAG_MAP[item.id];
    if (flag && config.key === 'gym') {
      return features[flag] !== false;
    }
    return true;
  });

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition lg:hidden',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[color:var(--app-border)] bg-[color:var(--app-sidebar)] px-4 pb-4 pt-5 shadow-[0_30px_90px_rgba(15,23,42,0.18)] transition duration-300 lg:translate-x-0 lg:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            {logoUrl ? (
              <img src={logoUrl} alt="Platform Logo" className="max-h-10 w-auto max-w-full object-contain object-left mb-2" />
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">
                  Full SaaS
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-[color:var(--app-text)]">
                  {config.shortLabel} Hub
                </h1>
                <p className="mt-2 text-sm leading-6 text-[color:var(--app-muted)]">{config.description}</p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--app-border)] text-[color:var(--app-muted)] transition hover:text-[color:var(--app-text)] lg:hidden"
            aria-label="Close sidebar"
          >
            <span className="text-lg">X</span>
          </button>
        </div>

        <nav className="mt-8 flex-1 space-y-2 overflow-y-auto pr-1">
          {visibleMenu.map((item) => (
            <SidebarLink key={item.id} item={item} active={pathname === item.href} onNavigate={onClose} />
          ))}
        </nav>

        {config.key === 'gym' && (
          <Link
            href="/gym/support"
            className="group block rounded-[24px] border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-4 transition hover:border-sky-500/40"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-[0_8px_16px_rgba(14,165,233,0.25)] group-hover:scale-105 transition duration-200">
                <span className="text-base font-bold">?</span>
              </span>
              <div>
                <p className="text-sm font-semibold text-[color:var(--app-text)]">Support Desk</p>
                <p className="mt-1 text-xs leading-relaxed text-[color:var(--app-muted)]">
                  Need help? Raise a support ticket directly with our team.
                </p>
                <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:underline">
                  Raise Ticket <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </span>
              </div>
            </div>
          </Link>
        )}

        {config.key === 'super-admin' && (
          <Link
            href="/super-admin/support"
            className="group block rounded-[24px] border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-4 transition hover:border-sky-500/40"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-[0_8px_16px_rgba(245,158,11,0.25)] group-hover:scale-105 transition duration-200">
                <span className="text-base font-bold">!</span>
              </span>
              <div>
                <p className="text-sm font-semibold text-[color:var(--app-text)]">Support Tickets</p>
                <p className="mt-1 text-xs leading-relaxed text-[color:var(--app-muted)]">
                  Manage and resolve tickets submitted by gym administrators.
                </p>
                <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:underline">
                  Open Inbox <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </span>
              </div>
            </div>
          </Link>
        )}
      </aside>
    </>
  );
}
