'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { LoadingState } from '@/components/admin/loading-state';
import { formatCurrency } from '@/lib/format';
import {
  getRevenueReport, getGymGrowthReport, getSubscriptionReport,
  getCouponReport, getPaymentReport, getGrowthReport,
  type RevenueReportData, type GymReportData, type SubscriptionReportData,
  type CouponReportData, type PaymentReportData, type GrowthReportData,
  type ReportFilters,
} from '@/lib/super-admin';
import {
  KpiCard, Panel, MiniStat, RevenueAreaChart, GrowthBarChart,
  DonutChart, TabNav, FilterBar, num, pct, PLAN_COLORS,
} from './report-charts';

const TABS = [
  { key: 'revenue', label: '💰 Revenue' },
  { key: 'gyms', label: '🏋️ Gyms' },
  { key: 'subscriptions', label: '📋 Subscriptions' },
  { key: 'coupons', label: '🎟️ Coupons' },
  { key: 'payments', label: '💳 Payments' },
  { key: 'growth', label: '📈 Growth' },
];

// ── Revenue Tab ────────────────────────────────
function RevenueTab({ data }: { data: RevenueReportData }) {
  const s = data.summary;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Revenue" value={formatCurrency(s.total_revenue)} hint="Platform subscription payments" tone="emerald" />
        <KpiCard label="Net Revenue" value={formatCurrency(s.net_revenue)} hint="After discounts applied" tone="sky" />
        <KpiCard label="Avg Transaction" value={formatCurrency(s.avg_transaction)} hint={`${s.transaction_count} total transactions`} tone="violet" />
        <KpiCard label="Coupon Impact" value={formatCurrency(s.coupon_discount)} hint={`${s.coupon_usage_count} subscriptions with coupons`} tone="amber" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="Monthly Revenue Trend">
          <RevenueAreaChart points={data.monthly_series} />
        </Panel>
        <Panel title="Plan-wise Revenue">
          {data.plan_wise.length > 0 ? (
            <DonutChart data={data.plan_wise} />
          ) : (
            <p className="py-10 text-center text-sm text-[color:var(--app-muted)]">No plan revenue data yet</p>
          )}
        </Panel>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="Total Discount" value={formatCurrency(s.total_discount)} />
        <MiniStat label="Failed Payments" value={s.failed_count} sub="Requiring recovery" />
        <MiniStat label="Transaction Count" value={s.transaction_count.toLocaleString()} />
      </div>
    </div>
  );
}

// ── Gym Tab ────────────────────────────────────
function GymTab({ data }: { data: GymReportData }) {
  const s = data.summary;
  const statusData = Object.entries(data.status_breakdown).map(([label, value]) => ({ label, value: num(value) }));
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Gyms" value={String(s.total_gyms)} hint="All tenant businesses" tone="sky" />
        <KpiCard label="Active Gyms" value={String(s.active_gyms)} hint="Currently operating" tone="emerald" />
        <KpiCard label="Inactive / Suspended" value={String(s.inactive_gyms)} hint="Access limited" tone="rose" />
        <KpiCard label="Churn Rate" value={`${s.churn_rate.toFixed(2)}%`} hint="Last month cancellations" tone="amber" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="New Gyms Per Month">
          <GrowthBarChart points={data.gym_series} color="#0ea5e9" />
        </Panel>
        <Panel title="Active vs Inactive">
          {statusData.length > 0 ? (
            <DonutChart data={statusData} />
          ) : (
            <p className="py-10 text-center text-sm text-[color:var(--app-muted)]">No status data yet</p>
          )}
        </Panel>
      </div>
      <Panel title="Churn Rate Trend (6 Months)">
        <GrowthBarChart points={data.churn_series} height={200} color="#ef4444" formatter={(v) => `${v.toFixed(2)}%`} />
      </Panel>
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="New This Month" value={s.new_gyms_this_month} />
        <MiniStat label="Trial Gyms" value={s.trial_gyms} />
        <MiniStat label="Report Generated" value={s.report_generated_at?.split(' ')[0] || '—'} />
      </div>
    </div>
  );
}

// ── Subscription Tab ───────────────────────────
function SubscriptionTab({ data }: { data: SubscriptionReportData }) {
  const s = data.summary;
  const breakdownData = Object.entries(data.breakdown).filter(([, v]) => num(v) > 0).map(([label, value]) => ({ label, value: num(value) }));
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Active" value={String(s.active)} hint="Running subscriptions" tone="emerald" />
        <KpiCard label="Trial" value={String(s.trial)} hint="Evaluation phase" tone="violet" />
        <KpiCard label="Expired" value={String(s.expired)} hint="Access ended" tone="rose" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="MRR" value={formatCurrency(s.monthly_recurring_revenue)} />
        <MiniStat label="Renewals This Month" value={s.renewals_this_month} />
        <MiniStat label="Expiring Soon" value={s.expiring_soon_count} sub="Next 14 days" />
        <MiniStat label="Cancelled" value={s.cancelled} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Status Breakdown">
          {breakdownData.length > 0 ? <DonutChart data={breakdownData} /> : <p className="py-10 text-center text-sm text-[color:var(--app-muted)]">No data</p>}
        </Panel>
        <Panel title="Plan Distribution">
          {data.plan_dist.length > 0 ? <DonutChart data={data.plan_dist} /> : <p className="py-10 text-center text-sm text-[color:var(--app-muted)]">No data</p>}
        </Panel>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="New Subscriptions Per Month">
          <GrowthBarChart points={data.new_sub_series} color="#6366f1" />
        </Panel>
        <Panel title="Renewals Per Month">
          <GrowthBarChart points={data.renewal_series} color="#10b981" />
        </Panel>
      </div>
      {data.expiring_soon.length > 0 && (
        <Panel title="Expiring Soon">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-[color:var(--app-muted)]">
                <tr><th className="py-2 pr-4">Gym</th><th className="px-4 py-2">Plan</th><th className="px-4 py-2">End Date</th><th className="py-2 pl-4">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--app-border)]">
                {data.expiring_soon.slice(0, 10).map((sub) => (
                  <tr key={sub.id}>
                    <td className="py-3 pr-4 font-medium text-[color:var(--app-text)]">{sub.tenant?.name || '—'}</td>
                    <td className="px-4 py-3 text-[color:var(--app-muted)]">{sub.plan?.name || '—'}</td>
                    <td className="px-4 py-3 text-[color:var(--app-muted)]">{sub.end_date || '—'}</td>
                    <td className="py-3 pl-4 capitalize text-amber-600">{sub.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}

// ── Coupon Tab ─────────────────────────────────
function CouponTab({ data }: { data: CouponReportData }) {
  const s = data.summary;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Coupons" value={String(s.total_coupons)} hint={`${s.active_coupons} currently active`} tone="violet" />
        <KpiCard label="Total Usage" value={String(s.total_usage)} hint="Subscriptions with coupons" tone="sky" />
        <KpiCard label="Revenue Impact" value={formatCurrency(s.total_discount)} hint="Total discount given" tone="amber" />
        <KpiCard label="Best Coupon" value={s.best_coupon_code || 'None'} hint={s.best_coupon_code ? `${s.best_coupon_uses} uses` : 'No usage yet'} tone="emerald" />
      </div>
      <Panel title="Discount Impact Over Time">
        <RevenueAreaChart points={data.discount_series} height={250} />
      </Panel>
      {data.coupon_stats.length > 0 && (
        <Panel title="Coupon Performance">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-[color:var(--app-muted)]">
                <tr>
                  <th className="py-2 pr-4">Code</th><th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Value</th><th className="px-4 py-2">Uses</th>
                  <th className="px-4 py-2">Discount Given</th><th className="py-2 pl-4">Revenue After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--app-border)]">
                {data.coupon_stats.map((c) => (
                  <tr key={c.code}>
                    <td className="py-3 pr-4 font-semibold text-[color:var(--app-text)]">{c.code}</td>
                    <td className="px-4 py-3 text-[color:var(--app-muted)] capitalize">{c.discount_type}</td>
                    <td className="px-4 py-3 text-[color:var(--app-muted)]">{c.discount_type === 'percentage' ? `${c.discount_value}%` : formatCurrency(c.discount_value)}</td>
                    <td className="px-4 py-3 text-[color:var(--app-text)] font-medium">{c.usage_count}</td>
                    <td className="px-4 py-3 text-rose-500 font-medium">{formatCurrency(c.total_discount)}</td>
                    <td className="py-3 pl-4 text-emerald-600 font-medium">{formatCurrency(c.total_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}

// ── Payment Tab ────────────────────────────────
function PaymentTab({ data }: { data: PaymentReportData }) {
  const s = data.summary;
  const statusData = [
    { label: 'Success', value: s.success_count },
    { label: 'Failed', value: s.failed_count },
    { label: 'Pending', value: s.pending_count },
  ].filter((d) => d.value > 0);
  const volumePoints = data.txn_series.map((p) => ({ label: p.label, value: p.total_amount }));
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Successful" value={String(s.success_count)} hint={formatCurrency(s.total_amount)} tone="emerald" />
        <KpiCard label="Failed" value={String(s.failed_count)} hint="Requiring recovery" tone="rose" />
        <KpiCard label="Success Rate" value={`${s.success_rate}%`} hint={`${s.total_txns} total transactions`} tone="sky" />
        <KpiCard label="Pending" value={String(s.pending_count)} hint="Awaiting confirmation" tone="amber" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Transaction Volume">
          <RevenueAreaChart points={volumePoints} height={260} />
        </Panel>
        <Panel title="Success vs Failed">
          {statusData.length > 0 ? <DonutChart data={statusData} /> : <p className="py-10 text-center text-sm text-[color:var(--app-muted)]">No data</p>}
        </Panel>
      </div>
      {data.method_breakdown.length > 0 && (
        <Panel title="Payment Method Breakdown">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.method_breakdown.map((m, i) => (
              <div key={m.label} className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: PLAN_COLORS[i % PLAN_COLORS.length] }} />
                  <span className="text-sm font-semibold text-[color:var(--app-text)] capitalize">{m.label}</span>
                </div>
                <p className="text-lg font-bold text-[color:var(--app-text)]">{m.txn_count} txns</p>
                <p className="text-xs text-[color:var(--app-muted)]">{formatCurrency(m.total_amount)} volume</p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

// ── Growth Tab ─────────────────────────────────
function GrowthTab({ data }: { data: GrowthReportData }) {
  const s = data.summary;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Revenue Growth" value={pct(s.revenue_growth_mom)} hint={`${formatCurrency(s.revenue_this_month)} this month vs ${formatCurrency(s.revenue_last_month)}`} tone={s.revenue_growth_mom >= 0 ? 'emerald' : 'rose'} />
        <KpiCard label="Gym Growth" value={pct(s.gym_growth_mom)} hint={`${s.gyms_this_month} new this month vs ${s.gyms_last_month} last month`} tone={s.gym_growth_mom >= 0 ? 'emerald' : 'rose'} />
        <KpiCard label="Subscription Growth" value={pct(s.sub_growth_mom)} hint="Month-over-month new subscriptions" tone={s.sub_growth_mom >= 0 ? 'emerald' : 'rose'} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="MRR" value={formatCurrency(s.mrr)} />
        <MiniStat label="Churn Rate" value={`${s.churn_rate.toFixed(2)}%`} sub="Last month" />
        <MiniStat label="Prev Month Revenue Growth" value={pct(s.revenue_growth_mom_prev)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Revenue Trend (12 Months)">
          <RevenueAreaChart points={data.revenue_series} height={260} />
        </Panel>
        <Panel title="Gym Growth Trend">
          <GrowthBarChart points={data.gym_series} color="#0ea5e9" height={260} />
        </Panel>
      </div>
      <Panel title="Revenue Growth Rate (MoM %)">
        <GrowthBarChart points={data.growth_series} color="#10b981" height={220} formatter={(v) => `${v.toFixed(2)}%`} />
      </Panel>
    </div>
  );
}

// ── Main Reports Page ──────────────────────────
export function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState('revenue');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [revenue, setRevenue] = useState<RevenueReportData | null>(null);
  const [gyms, setGyms] = useState<GymReportData | null>(null);
  const [subscriptions, setSubs] = useState<SubscriptionReportData | null>(null);
  const [coupons, setCoupons] = useState<CouponReportData | null>(null);
  const [payments, setPayments] = useState<PaymentReportData | null>(null);
  const [growth, setGrowth] = useState<GrowthReportData | null>(null);

  useEffect(() => {
    let active = true;
    requestAnimationFrame(() => {
      if (active) setMounted(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const loadTab = useCallback(async (key: string, filters: ReportFilters) => {
    setLoading(true);
    setError(null);
    try {
      switch (key) {
        case 'revenue': setRevenue(await getRevenueReport(filters)); break;
        case 'gyms': setGyms(await getGymGrowthReport(filters)); break;
        case 'subscriptions': setSubs(await getSubscriptionReport(filters)); break;
        case 'coupons': setCoupons(await getCouponReport(filters)); break;
        case 'payments': setPayments(await getPaymentReport(filters)); break;
        case 'growth': setGrowth(await getGrowthReport(filters)); break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadTab(tab, appliedFilters); }, [tab, appliedFilters, loadTab]);

  const handleApply = () => {
    const f: ReportFilters = {};
    if (dateFrom) f.date_from = dateFrom;
    if (dateTo) f.date_to = dateTo;
    setAppliedFilters(f);
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setAppliedFilters({});
  };

  const handleTabChange = (key: string) => {
    setTab(key);
    // Clear cached data for fresh fetch
    switch (key) {
      case 'revenue': setRevenue(null); break;
      case 'gyms': setGyms(null); break;
      case 'subscriptions': setSubs(null); break;
      case 'coupons': setCoupons(null); break;
      case 'payments': setPayments(null); break;
      case 'growth': setGrowth(null); break;
    }
  };

  if (!mounted) {
    return <LoadingState label="Initializing reports..." />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Analytics & Insights"
        title="SaaS Reports"
        description="Deep analytics across revenue, gyms, subscriptions, coupons, payments, and growth — platform billing only."
      />

      <TabNav tabs={TABS} active={tab} onChange={handleTabChange} />

      <FilterBar
        dateFrom={dateFrom} dateTo={dateTo}
        onDateFromChange={setDateFrom} onDateToChange={setDateTo}
        onApply={handleApply} onReset={handleReset}
      />

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingState label={`Loading ${(TABS.find((t) => t.key === tab)?.label ?? '').replace(/[^\w\s]/g, '').trim()} report...`} />
      ) : (
        <>
          {tab === 'revenue' && revenue && <RevenueTab data={revenue} />}
          {tab === 'gyms' && gyms && <GymTab data={gyms} />}
          {tab === 'subscriptions' && subscriptions && <SubscriptionTab data={subscriptions} />}
          {tab === 'coupons' && coupons && <CouponTab data={coupons} />}
          {tab === 'payments' && payments && <PaymentTab data={payments} />}
          {tab === 'growth' && growth && <GrowthTab data={growth} />}
        </>
      )}
    </div>
  );
}
