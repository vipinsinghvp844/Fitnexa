import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/cn';
import { getMenuItemBySection, getPortalConfig, getSectionFromHref, PortalKey } from '@/lib/dashboard';
import { DashboardCard } from './dashboard-card';
import { DashboardIcon } from './dashboard-icons';

function ChartPlaceholder({ tone = 'accent' }: { tone?: 'accent' | 'success' | 'warning' }) {
  const barClass =
    tone === 'success'
      ? 'from-emerald-400 to-emerald-200 dark:from-emerald-400 dark:to-emerald-700'
      : tone === 'warning'
        ? 'from-amber-400 to-amber-200 dark:from-amber-400 dark:to-amber-700'
        : 'from-sky-500 to-sky-200 dark:from-sky-400 dark:to-sky-700';

  return (
    <div className="grid h-64 grid-cols-12 items-end gap-3">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={`chart-bar-${index}`}
          className={cn('rounded-t-[18px] bg-gradient-to-t', barClass)}
          style={{ height: `${28 + ((index * 13) % 55)}%` }}
        />
      ))}
    </div>
  );
}

export function PortalDashboardPage({ portal }: { portal: PortalKey }) {
  const config = getPortalConfig(portal);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-[color:var(--app-border)] bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(255,255,255,0.98))] px-6 py-8 shadow-[0_24px_72px_rgba(15,23,42,0.12)] dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(8,15,28,0.98))] sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">{config.label}</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[color:var(--app-text)] sm:text-4xl">{config.dashboard.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--app-muted)]">{config.dashboard.subtitle}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
            {config.dashboard.spotlights.map((spotlight) => (
              <div key={spotlight.id} className="rounded-[24px] border border-white/50 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/40">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--app-muted)]">{spotlight.title}</p>
                <p className="mt-3 text-lg font-semibold text-[color:var(--app-text)]">{spotlight.metric}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--app-muted)]">{spotlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {config.dashboard.stats.map((stat) => (
          <DashboardCard
            key={stat.id}
            title={stat.label}
            value={stat.value}
            description={stat.delta}
            tone={stat.tone}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <DashboardCard
          title="Analytics Overview"
          description="Placeholder visualization area for trend charts, forecasting, and performance comparisons."
          meta="Chart Placeholder"
          className="min-h-[360px]"
        >
          <ChartPlaceholder />
        </DashboardCard>

        <DashboardCard
          title="Operational Snapshot"
          description="Placeholder cards for alerts, approvals, or next actions inside the dashboard shell."
          meta="Realtime Feed"
          className="min-h-[360px]"
        >
          <div className="space-y-3">
            {config.dashboard.spotlights.map((spotlight, index) => (
              <div key={`feed-${spotlight.id}`} className="rounded-[22px] border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--app-text)]">{spotlight.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--app-muted)]">{spotlight.description}</p>
                  </div>
                  <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-[color:var(--app-muted)] dark:bg-white/8">
                    {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <DashboardCard
          title="Conversion Funnel"
          description="Use this area later for acquisition, retention, or operational pipeline reporting."
          meta="Funnel"
        >
          <div className="space-y-3">
            {['Awareness', 'Qualified', 'Active', 'Retained'].map((step, index) => (
              <div key={`funnel-step-${step.toLowerCase()}`} className="flex items-center gap-3 rounded-[20px] border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-300">{index + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[color:var(--app-text)]">{step}</p>
                  <p className="text-xs text-[color:var(--app-muted)]">Placeholder conversion benchmark</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Capacity Pulse"
          description="Visual reserve for staffing, schedule, or class utilization insights."
          meta="Utilization"
        >
          <ChartPlaceholder tone="success" />
        </DashboardCard>

        <DashboardCard
          title="Alerts and Risks"
          description="A structured block for upcoming exceptions, policy notices, and threshold flags."
          meta="Status"
        >
          <div className="space-y-3">
            {['No blockers detected', 'One threshold nearing limit', 'Two automations pending review'].map((item) => (
              <div key={`risk-item-${item.toLowerCase().replaceAll(' ', '-')}`} className="rounded-[20px] border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] px-4 py-3 text-sm text-[color:var(--app-muted)]">
                {item}
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>
    </div>
  );
}

export function PortalSectionPage({
  portal,
  section,
}: {
  portal: PortalKey;
  section: string;
}) {
  const config = getPortalConfig(portal);
  const item = getMenuItemBySection(portal, section);

  if (!item || section === 'dashboard') {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[color:var(--app-border)] bg-[linear-gradient(160deg,rgba(15,23,42,0.04),rgba(14,165,233,0.08))] px-6 py-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:bg-[linear-gradient(160deg,rgba(15,23,42,0.92),rgba(14,165,233,0.14))] sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">
              <DashboardIcon name={item.icon} className="h-4 w-4" />
              {config.label}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[color:var(--app-text)]">{item.label}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--app-muted)]">{item.description}</p>
          </div>
          <Link
            href={`/${portal}/dashboard`}
            className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-3 text-sm font-medium text-[color:var(--app-text)] shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-600"
          >
            Back to Dashboard
            <DashboardIcon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <DashboardCard
          title="Module Readiness"
          value="Shell Ready"
          description="Navigation, protection, layout, and responsive states are now in place for this module."
          tone="accent"
        />
        <DashboardCard
          title="Next Build Step"
          value="Business Logic"
          description="Tables, forms, workflows, and real integrations can plug into this structure next."
          tone="success"
        />
        <DashboardCard
          title="Route Health"
          value={`/${portal}/${getSectionFromHref(item.href)}`}
          description="This route now resolves without 404 and uses the protected dashboard shell."
          tone="warning"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardCard
          title={`${item.label} Workspace Placeholder`}
          description="Use this space later for filters, tables, forms, charts, or kanban views tied to the selected module."
          meta="Module Surface"
          className="min-h-[340px]"
        >
          <ChartPlaceholder tone="warning" />
        </DashboardCard>

        <DashboardCard
          title="Implementation Blueprint"
          description="A clear checklist so each module can be layered on top of the shared shell without redesign."
          meta="Checklist"
          className="min-h-[340px]"
        >
          <div className="space-y-3">
            {[
              'Keep route protection and role access aligned with the shared portal config.',
              'Mount tables, forms, or analytics inside the existing content shell.',
              'Reuse the shared card, breadcrumb, and loading states for consistency.',
            ].map((line) => (
              <div key={`blueprint-${line.toLowerCase().replaceAll(' ', '-').replaceAll('.', '')}`} className="rounded-[20px] border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] px-4 py-3 text-sm leading-6 text-[color:var(--app-muted)]">
                {line}
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>
    </div>
  );
}
