'use client';

import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--app-bg)] px-6 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-500/10 text-4xl text-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
        🚧
      </div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-[color:var(--app-text)] sm:text-5xl">
        Under Maintenance
      </h1>
      <p className="mx-auto mb-10 max-w-lg text-base text-[color:var(--app-muted)] sm:text-lg">
        The platform is currently undergoing scheduled maintenance. We'll be back online shortly. Thank you for your patience!
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') window.location.href = '/gym/dashboard';
          }}
          className="rounded-full bg-sky-500 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-400 hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        >
          Check Again
        </button>
        <Link
          href="/super-admin/dashboard"
          className="rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] px-8 py-3.5 text-sm font-semibold text-[color:var(--app-text)] transition hover:bg-black/5 dark:hover:bg-white/5"
        >
          Super Admin Login
        </Link>
      </div>
    </div>
  );
}
