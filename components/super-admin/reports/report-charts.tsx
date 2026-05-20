'use client';

import { ReactNode } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import type { ChartPoint } from '@/lib/super-admin';

export const PLAN_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#14b8a6', '#8b5cf6', '#ec4899'];
const STATUS_COLORS: Record<string, string> = {
  active: '#10b981', inactive: '#ef4444', suspended: '#f59e0b', trial: '#6366f1',
  expired: '#94a3b8', paused: '#f59e0b', cancelled: '#ef4444',
};

export function num(v: number | string | null | undefined) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function pct(v: number) {
  return `${v > 0 ? '+' : ''}${v.toFixed(2)}%`;
}

export function KpiCard({ label, value, hint, tone = 'sky', icon }: {
  label: string; value: string; hint: string; tone?: 'sky' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate'; icon?: ReactNode;
}) {
  const tones: Record<string, string> = {
    sky: 'border-sky-200/60 bg-gradient-to-br from-sky-50/80 to-sky-100/40 dark:from-sky-400/10 dark:to-sky-400/5',
    emerald: 'border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 dark:from-emerald-400/10 dark:to-emerald-400/5',
    amber: 'border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-amber-100/40 dark:from-amber-400/10 dark:to-amber-400/5',
    rose: 'border-rose-200/60 bg-gradient-to-br from-rose-50/80 to-rose-100/40 dark:from-rose-400/10 dark:to-rose-400/5',
    violet: 'border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-violet-100/40 dark:from-violet-400/10 dark:to-violet-400/5',
    slate: 'border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-slate-100/40 dark:from-slate-400/10 dark:to-slate-400/5',
  };
  return (
    <div className={cn('rounded-[20px] border p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all hover:shadow-[0_12px_40px_rgba(15,23,42,0.10)] hover:-translate-y-0.5', tones[tone])}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[color:var(--app-muted)]">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[color:var(--app-text)]">{value}</p>
      <p className="mt-2 text-xs text-[color:var(--app-muted)]">{hint}</p>
    </div>
  );
}

export function Panel({ title, action, children, className }: {
  title: string; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={cn('rounded-[22px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]', className)}>
      <div className="flex items-center justify-between gap-4 mb-5">
        <h3 className="text-base font-semibold text-[color:var(--app-text)]">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function MiniStat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl bg-[color:var(--app-surface-raised)] p-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--app-muted)]">{label}</p>
      <p className="mt-2 text-xl font-bold text-[color:var(--app-text)]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[color:var(--app-muted)]">{sub}</p>}
    </div>
  );
}

function ChartTooltipContent({ formatter }: { formatter?: (v: number) => string }) {
  return (
    <Tooltip
      cursor={{ fill: 'rgba(14,165,233,0.06)' }}
      contentStyle={{ borderRadius: 14, border: '1px solid rgba(148,163,184,0.3)', boxShadow: '0 12px 36px rgba(15,23,42,0.12)', fontSize: 13 }}
      formatter={(value) => [formatter ? formatter(Number(value)) : Number(value).toLocaleString(), '']}
    />
  );
}

export function RevenueAreaChart({ points, height = 280 }: { points: ChartPoint[]; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="rptRevGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => formatCurrency(v).replace('.00', '')} />
          <ChartTooltipContent formatter={formatCurrency} />
          <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#rptRevGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GrowthBarChart({ points, height = 240, color = '#10b981', formatter }: {
  points: ChartPoint[]; height?: number; color?: string; formatter?: (v: number) => string;
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
          <ChartTooltipContent formatter={formatter} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ data, height = 200 }: { data: Array<{ label: string; value: number }>; height?: number }) {
  const colors = data.map((d) => STATUS_COLORS[d.label] || PLAN_COLORS[data.indexOf(d) % PLAN_COLORS.length]);
  const total = data.reduce((s, d) => s + num(d.value), 0);
  return (
    <div className="grid gap-4 md:grid-cols-[180px_1fr] md:items-center">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={50} outerRadius={72} paddingAngle={3}>
              {data.map((d, i) => <Cell key={d.label} fill={colors[i]} />)}
            </Pie>
            <ChartTooltipContent />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {data.map((d, i) => {
          const share = total > 0 ? Math.round((num(d.value) / total) * 100) : 0;
          return (
            <div key={d.label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: colors[i] }} />
                <span className="truncate text-sm text-[color:var(--app-text)] capitalize">{d.label}</span>
              </div>
              <span className="text-sm text-[color:var(--app-muted)] tabular-nums">{num(d.value)} ({share}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TabNav({ tabs, active, onChange }: {
  tabs: Array<{ key: string; label: string }>; active: string; onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
            active === tab.key
              ? 'bg-sky-500 text-white shadow-[0_4px_16px_rgba(14,165,233,0.3)]'
              : 'text-[color:var(--app-muted)] hover:text-[color:var(--app-text)] hover:bg-[color:var(--app-surface)]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function FilterBar({ dateFrom, dateTo, onDateFromChange, onDateToChange, onApply, onReset }: {
  dateFrom: string; dateTo: string;
  onDateFromChange: (v: string) => void; onDateToChange: (v: string) => void;
  onApply: () => void; onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-4">
      <div>
        <label className="block text-xs font-medium text-[color:var(--app-muted)] mb-1.5">From</label>
        <input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)}
          className="rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] px-3 py-2 text-sm text-[color:var(--app-text)] outline-none focus:border-sky-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-[color:var(--app-muted)] mb-1.5">To</label>
        <input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)}
          className="rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] px-3 py-2 text-sm text-[color:var(--app-text)] outline-none focus:border-sky-400" />
      </div>
      <button onClick={onApply} className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-medium text-white shadow hover:bg-sky-600 transition">Apply</button>
      <button onClick={onReset} className="rounded-xl border border-[color:var(--app-border)] px-5 py-2 text-sm font-medium text-[color:var(--app-muted)] hover:text-[color:var(--app-text)] transition">Reset</button>
    </div>
  );
}
