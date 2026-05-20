'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminPageHeader, AdminPrimaryLink } from '@/components/admin/page-header';
import { LoadingState } from '@/components/admin/loading-state';
import { StatusBadge } from '@/components/admin/status-badge';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDateTime } from '@/lib/format';
import {
  ActivitySummary,
  ChartPoint,
  DashboardData,
  getSuperAdminDashboard,
  GymSummary,
  PaymentSummary,
  SubscriptionSummary,
} from '@/lib/super-admin';

const planColors = ['#0ea5e9', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#14b8a6'];

function valueOrZero(value: number | null | undefined) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function changeLabel(value: number) {
  if (value === 0) {
    return '0.00%';
  }

  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = 'sky',
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  tone?: 'sky' | 'emerald' | 'amber' | 'rose' | 'slate';
}) {
  const tones = {
    sky: 'border-sky-200/70 bg-sky-50/70 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200',
    emerald: 'border-emerald-200/70 bg-emerald-50/70 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200',
    amber: 'border-amber-200/70 bg-amber-50/70 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200',
    rose: 'border-rose-200/70 bg-rose-50/70 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200',
    slate: 'border-slate-200/70 bg-slate-50/70 text-slate-700 dark:border-slate-400/20 dark:bg-slate-400/10 dark:text-slate-200',
  };

  return (
    <div className="rounded-[24px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-[0_16px_42px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[color:var(--app-muted)]">{label}</p>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--app-text)]">{value}</p>
        </div>
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-2xl border', tones[tone])}>{icon}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-[color:var(--app-muted)]">{hint}</p>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-[24px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm', className)}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[color:var(--app-text)]">{title}</h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ChartTooltip({ formatter }: { formatter?: (value: number) => string }) {
  return (
    <Tooltip
      cursor={{ fill: 'rgba(14,165,233,0.08)' }}
      contentStyle={{
        borderRadius: 14,
        border: '1px solid rgba(148,163,184,0.35)',
        boxShadow: '0 18px 44px rgba(15,23,42,0.14)',
      }}
      formatter={(value) => [formatter ? formatter(Number(value)) : Number(value).toLocaleString(), '']}
    />
  );
}

function RevenueChart({ points }: { points: ChartPoint[] }) {
  return (
    <div className="h-[310px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => formatCurrency(Number(value)).replace('.00', '')} />
          <ChartTooltip formatter={formatCurrency} />
          <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} fill="url(#revenueGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function GrowthChart({ points }: { points: ChartPoint[] }) {
  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <ChartTooltip formatter={(value) => `${value.toFixed(2)}%`} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function PlanDistribution({ points }: { points: ChartPoint[] }) {
  const total = points.reduce((sum, point) => sum + valueOrZero(point.value), 0);

  return (
    <div className="grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={points} dataKey="value" nameKey="label" innerRadius={54} outerRadius={78} paddingAngle={3}>
              {points.map((point, index) => (
                <Cell key={`plan-slice-${point.label}`} fill={planColors[index % planColors.length]} />
              ))}
            </Pie>
            <ChartTooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {points.map((point, index) => {
          const value = valueOrZero(point.value);
          const share = total > 0 ? Math.round((value / total) * 100) : 0;

          return (
            <div key={`plan-row-${point.label}`} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ background: planColors[index % planColors.length] }} />
                <span className="truncate text-sm font-medium text-[color:var(--app-text)]">{point.label}</span>
              </div>
              <span className="text-sm text-[color:var(--app-muted)]">{value} gyms - {share}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlertList({
  expiring,
  failed,
  inactive,
}: {
  expiring: SubscriptionSummary[];
  failed: PaymentSummary[];
  inactive: GymSummary[];
}) {
  const rows = [
    ...expiring.slice(0, 4).map((item) => ({
      id: `expiring-${item.id}`,
      tone: 'amber' as const,
      title: item.tenant.name || 'Gym subscription',
      detail: `Expires ${item.end_date || 'soon'} - ${item.plan.name || 'No plan'}`,
      href: `/super-admin/subscriptions/${item.id}`,
    })),
    ...failed.slice(0, 4).map((item) => ({
      id: `failed-${item.id}`,
      tone: 'rose' as const,
      title: item.gym.name || 'Platform payment',
      detail: `${formatCurrency(valueOrZero(Number(item.amount)))} failed - ${item.payment_method || 'manual'}`,
      href: '/super-admin/payments',
    })),
    ...inactive.slice(0, 4).map((item) => ({
      id: `inactive-${item.id}`,
      tone: 'slate' as const,
      title: item.name,
      detail: `${item.status} gym - ${item.counts.members} members`,
      href: `/super-admin/gyms/${item.id}`,
    })),
  ].slice(0, 8);

  if (!rows.length) {
    return <p className="rounded-2xl border border-dashed border-[color:var(--app-border)] px-4 py-8 text-center text-sm text-[color:var(--app-muted)]">No critical alerts right now.</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <Link key={row.id} href={row.href} className="flex items-center gap-3 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-3 transition hover:border-sky-300">
          <span className={cn('h-2.5 w-2.5 rounded-full', row.tone === 'amber' && 'bg-amber-500', row.tone === 'rose' && 'bg-rose-500', row.tone === 'slate' && 'bg-slate-400')} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-[color:var(--app-text)]">{row.title}</span>
            <span className="block truncate text-xs text-[color:var(--app-muted)]">{row.detail}</span>
          </span>
          <DashboardIcon name="arrow-right" className="h-4 w-4 text-[color:var(--app-muted)]" />
        </Link>
      ))}
    </div>
  );
}

function RecentActivityFeed({ activities }: { activities: ActivitySummary[] }) {
  if (!activities.length) {
    return <p className="rounded-2xl border border-dashed border-[color:var(--app-border)] px-4 py-8 text-center text-sm text-[color:var(--app-muted)]">No recent activity yet.</p>;
  }

  return (
    <div className="space-y-3">
      {activities.slice(0, 8).map((activity) => (
        <div key={`activity-${activity.id}`} className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[color:var(--app-text)]">{activity.description || activity.action}</p>
              <p className="mt-1 text-xs text-[color:var(--app-muted)]">
                {activity.user?.name || 'System'} - {activity.tenant?.name || activity.model_type || 'Platform'}
              </p>
            </div>
            <span className="shrink-0 text-xs text-[color:var(--app-muted)]">{formatDateTime(activity.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TopGyms({
  highestPaying,
  mostActive,
}: {
  highestPaying: GymSummary[];
  mostActive: GymSummary[];
}) {
  const activeIds = new Set(mostActive.map((gym) => gym.id));
  const rows = highestPaying.length ? highestPaying : mostActive;

  if (!rows.length) {
    return <p className="rounded-2xl border border-dashed border-[color:var(--app-border)] px-4 py-8 text-center text-sm text-[color:var(--app-muted)]">Top gyms will appear after revenue or activity data is available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.14em] text-[color:var(--app-muted)]">
          <tr>
            <th className="py-3 pr-4 font-semibold">Gym</th>
            <th className="px-4 py-3 font-semibold">Plan</th>
            <th className="px-4 py-3 font-semibold">Platform revenue</th>
            <th className="px-4 py-3 font-semibold">Members</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="py-3 pl-4 font-semibold"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[color:var(--app-border)]">
          {rows.map((gym) => (
            <tr key={`top-gym-${gym.id}`}>
              <td className="py-4 pr-4">
                <div>
                  <p className="font-semibold text-[color:var(--app-text)]">{gym.name}</p>
                  <p className="mt-1 text-xs text-[color:var(--app-muted)]">{activeIds.has(gym.id) ? 'Most active' : 'Highest paying'}</p>
                </div>
              </td>
              <td className="px-4 py-4 text-[color:var(--app-muted)]">{gym.active_subscription?.plan_name || 'No active plan'}</td>
              <td className="px-4 py-4 font-semibold text-[color:var(--app-text)]">{formatCurrency(valueOrZero(gym.platform_revenue))}</td>
              <td className="px-4 py-4 text-[color:var(--app-muted)]">{gym.counts.members}</td>
              <td className="px-4 py-4"><StatusBadge value={gym.status} /></td>
              <td className="py-4 pl-4">
                <Link href={`/super-admin/gyms/${gym.id}`} className="font-medium text-sky-600 hover:text-sky-700">View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SuperAdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getSuperAdminDashboard()
      .then((response) => {
        if (mounted) {
          setDashboard(response);
        }
      })
      .catch((fetchError) => {
        if (mounted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load dashboard');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const health = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return [
      { label: 'Plan distribution', value: dashboard.charts.plan_distribution.reduce((sum, point) => sum + valueOrZero(point.value), 0) },
      { label: 'Expiring soon', value: dashboard.metrics.expiring_soon },
      { label: 'Renewals this month', value: dashboard.metrics.renewals_this_month },
    ];
  }, [dashboard]);

  if (error) {
    return <LoadingState label={error} />;
  }

  if (!dashboard) {
    return <LoadingState label="Loading Super Admin dashboard..." />;
  }

  const { metrics, charts, alerts, top_gyms } = dashboard;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Business Control"
        title="Super Admin Dashboard"
        description="Live SaaS revenue, subscriptions, gym health, alerts, and growth performance from platform billing only."
        actions={
          <>
            <AdminPrimaryLink href="/super-admin/payments">Review payments</AdminPrimaryLink>
            <AdminPrimaryLink href="/super-admin/subscriptions">Manage subscriptions</AdminPrimaryLink>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Revenue" value={formatCurrency(metrics.total_revenue)} hint="Completed platform subscription payments" tone="emerald" icon={<DashboardIcon name="payments" />} />
        <KpiCard label="MRR" value={formatCurrency(metrics.monthly_recurring_revenue)} hint="Active and trial subscription run rate" tone="sky" icon={<DashboardIcon name="subscriptions" />} />
        <KpiCard label="Today Revenue" value={formatCurrency(metrics.today_revenue)} hint="Completed platform revenue today" tone="emerald" icon={<DashboardIcon name="reports" />} />
        <KpiCard label="Failed Payments" value={String(metrics.failed_payments)} hint="Platform payments requiring recovery" tone="rose" icon={<DashboardIcon name="alert-circle" />} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Gyms" value={String(metrics.total_gyms)} hint="All tenant businesses onboarded" icon={<DashboardIcon name="gym" />} />
        <KpiCard label="Active Gyms" value={String(metrics.active_gyms)} hint="Gyms currently operating" tone="emerald" icon={<DashboardIcon name="check-circle" />} />
        <KpiCard label="Trial Gyms" value={String(metrics.trial_gyms)} hint="Evaluation accounts in trial" tone="sky" icon={<DashboardIcon name="spark" />} />
        <KpiCard label="Expired Gyms" value={String(metrics.expired_gyms)} hint="Subscription access at risk" tone="amber" icon={<DashboardIcon name="alert-circle" />} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.55fr_0.95fr]">
        <Panel
          title="Revenue Overview"
          action={<span className="text-sm font-semibold text-emerald-600">{changeLabel(metrics.revenue_growth_percentage)} vs last month</span>}
        >
          <RevenueChart points={charts.revenue_growth} />
        </Panel>

        <Panel title="Growth Metrics">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[color:var(--app-surface-raised)] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--app-muted)]">New gyms</p>
              <p className="mt-3 text-2xl font-semibold text-[color:var(--app-text)]">{metrics.new_gyms_this_month}</p>
            </div>
            <div className="rounded-2xl bg-[color:var(--app-surface-raised)] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--app-muted)]">Revenue growth</p>
              <p className="mt-3 text-2xl font-semibold text-[color:var(--app-text)]">{changeLabel(metrics.revenue_growth_percentage)}</p>
            </div>
            <div className="rounded-2xl bg-[color:var(--app-surface-raised)] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--app-muted)]">Churn rate</p>
              <p className="mt-3 text-2xl font-semibold text-[color:var(--app-text)]">{metrics.churn_rate.toFixed(2)}%</p>
            </div>
          </div>
          <div className="mt-5">
            <GrowthChart points={charts.growth_rate} />
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Panel title="Subscription Insights" className="xl:col-span-2">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <PlanDistribution points={charts.plan_distribution} />
            <div className="grid gap-3">
              {health.map((item) => (
                <div key={`health-${item.label}`} className="flex items-center justify-between rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] px-4 py-3">
                  <span className="text-sm text-[color:var(--app-muted)]">{item.label}</span>
                  <span className="text-lg font-semibold text-[color:var(--app-text)]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Alerts Panel" action={<DashboardIcon name="bell" className="h-5 w-5 text-amber-500" />}>
          <AlertList expiring={alerts.expiring_subscriptions} failed={alerts.failed_payments} inactive={alerts.inactive_gyms} />
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel title="Top Gyms" action={<Link href="/super-admin/gyms" className="text-sm font-medium text-sky-600 hover:text-sky-700">View all</Link>}>
          <TopGyms highestPaying={top_gyms.highest_paying} mostActive={top_gyms.most_active} />
        </Panel>

        <Panel title="Recent Activity">
          <RecentActivityFeed activities={dashboard.recent_activity} />
        </Panel>
      </section>
    </div>
  );
}
