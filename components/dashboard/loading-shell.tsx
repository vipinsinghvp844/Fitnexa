export function DashboardLoadingShell({ title = 'Loading dashboard...' }: { title?: string }) {
  return (
    <div className="min-h-screen bg-[color:var(--app-bg)] text-[color:var(--app-text)]">
      <div className="hidden w-72 border-r border-[color:var(--app-border)] bg-[color:var(--app-sidebar)] lg:fixed lg:inset-y-0 lg:block" />
      <div className="lg:pl-72">
        <div className="sticky top-0 z-20 border-b border-[color:var(--app-border)] bg-[color:var(--app-topbar)]/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <div className="h-4 w-28 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
              <div className="mt-3 h-8 w-56 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
            </div>
            <div className="h-11 w-24 animate-pulse rounded-2xl bg-black/8 dark:bg-white/10" />
          </div>
        </div>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="mb-6 text-sm font-medium text-[color:var(--app-muted)]">{title}</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`loading-stat-${index}`} className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
                <div className="h-4 w-28 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
                <div className="mt-5 h-9 w-20 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
                <div className="mt-4 h-3 w-32 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
              <div className="h-4 w-40 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
              <div className="mt-6 grid h-72 grid-cols-12 items-end gap-3">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={`loading-chart-bar-${index}`}
                    className="animate-pulse rounded-t-2xl bg-black/8 dark:bg-white/10"
                    style={{ height: `${32 + (index % 5) * 12}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
              <div className="h-4 w-32 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
              <div className="mt-6 space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={`loading-feed-card-${index}`} className="rounded-2xl border border-[color:var(--app-border)] p-4">
                    <div className="h-4 w-36 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
                    <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
