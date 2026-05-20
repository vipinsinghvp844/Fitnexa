'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { getDefaultDashboardPath } from '@/lib/dashboard';
import { useAppSelector } from '@/store/hooks';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const homeParam = searchParams.get('home');
  const { user, status } = useAppSelector((state) => state.auth);
  const homeHref = homeParam || getDefaultDashboardPath(user?.roles);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-[32px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-8 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur dark:shadow-[0_30px_90px_rgba(2,6,23,0.42)] sm:p-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-[24px] bg-rose-500 text-white shadow-[0_18px_40px_rgba(244,63,94,0.28)]">
          <DashboardIcon name="shield" className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-rose-600 dark:text-rose-300">Unauthorized</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--app-text)]">You do not have access to this workspace.</h1>
        <p className="mt-4 text-base leading-7 text-[color:var(--app-muted)]">
          {from ? `The route ${from} is protected for a different role.` : 'This area is protected for another role or permission set.'}
        </p>
        <div className="mt-8 grid gap-4 rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-5">
          <div>
            <p className="text-sm font-semibold text-[color:var(--app-text)]">Current session</p>
            <p className="mt-2 text-sm text-[color:var(--app-muted)]">
              {status === 'authenticated' && user
                ? `${user.name} · ${user.roles.join(', ')}`
                : 'You are not signed in right now.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {status === 'authenticated' && user ? (
              <Link
                href={homeHref}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-sky-600"
              >
                Go to my dashboard
                <DashboardIcon name="arrow-right" className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-sky-600"
              >
                Login
                <DashboardIcon name="arrow-right" className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-600"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[color:var(--app-bg)]" />}>
      <UnauthorizedContent />
    </Suspense>
  );
}
