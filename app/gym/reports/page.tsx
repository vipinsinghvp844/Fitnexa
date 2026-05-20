'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LoadingState } from '@/components/admin/loading-state';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import {
  getGymReportAttendance,
  getGymReportMemberships,
  getGymReportOverview,
  getGymReportRevenue,
  getGymReportTrainers,
  type GymReportAttendance,
  type GymReportMemberships,
  type GymReportOverview,
  type GymReportRevenue,
  type GymReportTrainers,
} from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

function MetricTile({ label, value, trend, detail }: { label: string; value: string | number; trend?: number; detail?: string }) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--app-muted)]">{label}</div>
      <div className="mt-2 flex items-baseline gap-3">
        <div className="text-3xl font-semibold tracking-tight text-[color:var(--app-text)]">{value}</div>
        {trend !== undefined && (
          <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-emerald-500' : isNegative ? 'text-rose-500' : 'text-slate-500'}`}>
            {isPositive ? '↑' : isNegative ? '↓' : '→'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      {detail && <div className="mt-1 text-sm text-[color:var(--app-muted)]">{detail}</div>}
    </div>
  );
}

function SmartInsights({ insights }: { insights: string[] }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-800 dark:bg-sky-950/40">
      <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
        <DashboardIcon name="spark" className="h-5 w-5" />
        <h3 className="font-semibold">Smart Insights</h3>
      </div>
      <ul className="mt-3 space-y-2">
        {insights.map((insight, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-sky-800 dark:text-sky-200">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
            {insight}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function GymReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'memberships' | 'attendance' | 'trainers'>('overview');
  const [dateRange, setDateRange] = useState({ start_date: '', end_date: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<GymReportOverview | null>(null);
  const [revenue, setRevenue] = useState<GymReportRevenue | null>(null);
  const [memberships, setMemberships] = useState<GymReportMemberships | null>(null);
  const [attendance, setAttendance] = useState<GymReportAttendance | null>(null);
  const [trainers, setTrainers] = useState<GymReportTrainers | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = {
        start_date: dateRange.start_date || null,
        end_date: dateRange.end_date || null,
      };

      if (activeTab === 'overview') {
        const res = (await getGymReportOverview(query)) as { data: GymReportOverview };
        setOverview(res.data);
      } else if (activeTab === 'revenue') {
        const res = (await getGymReportRevenue(query)) as { data: GymReportRevenue };
        setRevenue(res.data);
      } else if (activeTab === 'memberships') {
        const res = (await getGymReportMemberships(query)) as { data: GymReportMemberships };
        setMemberships(res.data);
      } else if (activeTab === 'attendance') {
        const res = (await getGymReportAttendance(query)) as { data: GymReportAttendance };
        setAttendance(res.data);
      } else if (activeTab === 'trainers') {
        const res = (await getGymReportTrainers(query)) as { data: GymReportTrainers };
        setTrainers(res.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateRange]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'memberships', label: 'Memberships' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'trainers', label: 'Trainers' },
  ] as const;

  function formatCurrency(val: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Analytics"
        title="Business Reports"
        description="Actionable insights, revenue tracking, and performance metrics."
        actions={
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              className="rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
            />
            <span className="text-[color:var(--app-muted)]">to</span>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              className="rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
            />
            <button
              onClick={() => void loadData()}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Apply
            </button>
          </div>
        }
      />

      <div className="flex gap-2 overflow-x-auto border-b border-[color:var(--app-border)] pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-[color:var(--app-muted)] hover:border-slate-300 hover:text-[color:var(--app-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading && !error ? (
        <LoadingState />
      ) : (
        <div className="space-y-6">
          {activeTab === 'overview' && overview && (
            <>
              <SmartInsights insights={overview.insights} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricTile label="Total Revenue" value={formatCurrency(overview.kpis.total_revenue)} trend={overview.kpis.revenue_growth} />
                <MetricTile label="Active Members" value={overview.kpis.active_members} />
                <MetricTile label="New Members" value={overview.kpis.new_members} detail="Acquired in period" />
                <MetricTile label="Total Visits" value={overview.kpis.total_attendance} detail="Check-ins in period" />
              </div>
            </>
          )}

          {activeTab === 'revenue' && revenue && (
            <>
              <SmartInsights insights={revenue.insights} />
              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
                  <h3 className="mb-6 text-lg font-semibold text-[color:var(--app-text)]">Revenue Trend</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenue.trend}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                        <XAxis dataKey="label" stroke="currentColor" className="text-xs opacity-50" tickLine={false} axisLine={false} />
                        <YAxis stroke="currentColor" className="text-xs opacity-50" tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)', borderRadius: '12px' }}
                          formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Revenue']}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
                  <h3 className="mb-6 text-lg font-semibold text-[color:var(--app-text)]">Payment Methods</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={revenue.methods} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                          {revenue.methods.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)', borderRadius: '12px' }}
                          formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Revenue']}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'memberships' && memberships && (
            <>
              <SmartInsights insights={memberships.insights} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricTile label="Active Memberships" value={memberships.kpis.active} />
                <MetricTile label="Churn Rate" value={`${memberships.kpis.churn_rate}%`} detail={`${memberships.kpis.expired_in_period} expired`} />
                <MetricTile label="Expiring Soon" value={memberships.kpis.expiring_next_7_days} detail="Next 7 days" />
              </div>

              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
                  <h3 className="mb-6 text-lg font-semibold text-[color:var(--app-text)]">Membership Growth</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={memberships.growth_trend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                        <XAxis dataKey="label" stroke="currentColor" className="text-xs opacity-50" tickLine={false} axisLine={false} />
                        <YAxis stroke="currentColor" className="text-xs opacity-50" tickLine={false} axisLine={false} />
                        <Tooltip
                          cursor={{ fill: 'currentColor', opacity: 0.05 }}
                          contentStyle={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)', borderRadius: '12px' }}
                        />
                        <Bar dataKey="members" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
                  <h3 className="mb-6 text-lg font-semibold text-[color:var(--app-text)]">Status Breakdown</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={memberships.status_breakdown} cx="50%" cy="50%" innerRadius={0} outerRadius={90} dataKey="value" label>
                          {memberships.status_breakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)', borderRadius: '12px' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'attendance' && attendance && (
            <>
              <SmartInsights insights={attendance.insights} />
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
                  <h3 className="mb-6 text-lg font-semibold text-[color:var(--app-text)]">Daily Attendance Trend</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={attendance.trend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                        <XAxis dataKey="label" stroke="currentColor" className="text-xs opacity-50" tickLine={false} axisLine={false} />
                        <YAxis stroke="currentColor" className="text-xs opacity-50" tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)', borderRadius: '12px' }} />
                        <Line type="monotone" dataKey="visits" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
                  <h3 className="mb-6 text-lg font-semibold text-[color:var(--app-text)]">Peak Hours</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendance.peak_hours}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                        <XAxis dataKey="label" stroke="currentColor" className="text-xs opacity-50" tickLine={false} axisLine={false} />
                        <YAxis stroke="currentColor" className="text-xs opacity-50" tickLine={false} axisLine={false} />
                        <Tooltip
                          cursor={{ fill: 'currentColor', opacity: 0.05 }}
                          contentStyle={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)', borderRadius: '12px' }}
                        />
                        <Bar dataKey="visits" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'trainers' && trainers && (
            <>
              <SmartInsights insights={trainers.insights} />
              <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
                  <h3 className="mb-6 text-lg font-semibold text-[color:var(--app-text)]">Member Distribution</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={trainers.distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                          {trainers.distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)', borderRadius: '12px' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
                  <h3 className="mb-6 text-lg font-semibold text-[color:var(--app-text)]">Trainer Details</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[color:var(--app-text)]">
                      <thead className="border-b border-[color:var(--app-border)] text-xs uppercase text-[color:var(--app-muted)]">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Trainer Name</th>
                          <th className="px-4 py-3 font-semibold">Specialization</th>
                          <th className="px-4 py-3 font-semibold text-right">Assigned Members</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[color:var(--app-border)]">
                        {trainers.details.length ? (
                          trainers.details.map((trainer) => (
                            <tr key={trainer.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-900/50">
                              <td className="px-4 py-3 font-medium">{trainer.name}</td>
                              <td className="px-4 py-3 text-[color:var(--app-muted)]">{trainer.specialization ?? '-'}</td>
                              <td className="px-4 py-3 text-right font-semibold">{trainer.assigned_members}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-[color:var(--app-muted)]">No trainers found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
