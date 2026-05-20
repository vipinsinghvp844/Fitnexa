'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { formatSegmentLabel, getMenuItemBySection, getPortalConfig, isPortalKey } from '@/lib/dashboard';

export function Breadcrumbs({ portal }: { portal: string }) {
  const pathname = usePathname();

  if (!isPortalKey(portal)) return null;

  const config = getPortalConfig(portal);
  const segments = pathname.split('/').filter(Boolean);
  const section = segments[1];
  const currentItem = section ? getMenuItemBySection(portal, section) : null;

  const crumbs = [
    { id: `${portal}-home-crumb`, label: config.label, href: `/${portal}/dashboard` },
    section
      ? {
          id: currentItem?.id ?? `${portal}-${section}-crumb`,
          label: currentItem?.label ?? formatSegmentLabel(section),
          href: pathname,
        }
      : null,
  ].filter(Boolean) as Array<{ id: string; label: string; href: string }>;

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 flex-1 md:block">
      <ol className="flex min-w-0 items-center gap-2 text-sm text-[color:var(--app-muted)]">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={crumb.id} className="flex min-w-0 items-center gap-2">
              {index > 0 ? <span className="text-[color:var(--app-border-strong)]">/</span> : null}
              <Link
                href={crumb.href}
                className={cn(
                  'truncate transition hover:text-[color:var(--app-text)]',
                  isLast && 'font-semibold text-[color:var(--app-text)]'
                )}
              >
                {crumb.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
