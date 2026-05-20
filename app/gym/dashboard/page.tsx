'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LoadingState } from '@/components/admin/loading-state';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { getGymDashboard, type GymDashboardResponse } from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
}

function KpiCard({ title, value, icon, iconColor }: { title: string; value: string | number; icon: any; iconColor: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconColor}`}>
        <DashboardIcon name={icon} className="h-6 w-6" />
      </div>
      <div>
        <div className="text-sm font-medium text-[color:var(--app-muted)]">{title}</div>
        <div className="mt-0.5 text-2xl font-bold tracking-tight text-[color:var(--app-text)]">{value}</div>
      </div>
    </div>
  );
}

export default function GymDashboardPage() {
  const [data, setData] = useState<GymDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      try {
        const response = (await getGymDashboard()) as { data: GymDashboardResponse };
        if (mounted) setData(response.data);
      } catch (err) {
        if (mounted) setError(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void fetchDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingState />;
  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
        {error}
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Gym Operations"
        description="Real-time overview of your facility."
        actions={
          <div className="flex gap-2">
            <Link
              href="/gym/members/create"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
            >
              <DashboardIcon name="plus" className="h-4 w-4" />
              Add Member
            </Link>
            <Link
              href="/gym/billing"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <DashboardIcon name="credit-card" className="h-4 w-4" />
              Record Payment
            </Link>
          </div>
        }
      />

      {/* KPIs Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Total Members" value={data.kpis.total_members} icon="members" iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
        <KpiCard title="Active Members" value={data.kpis.active_members} icon="status" iconColor="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
        <KpiCard title="Total Trainers" value={data.kpis.trainers_count} icon="shield" iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
        <KpiCard title="Today's Attendance" value={data.kpis.today_attendance} icon="attendance" iconColor="bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400" />
        <KpiCard title="Today's Revenue" value={formatCurrency(data.kpis.today_revenue)} icon="credit-card" iconColor="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
        <KpiCard title="Pending Payments" value={data.kpis.pending_payments} icon="arrow-right" iconColor="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (Charts & Feed) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Revenue Chart */}
          <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
            <h3 className="mb-6 font-semibold text-[color:var(--app-text)]">Revenue (Last 7 Days)</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                <AreaChart data={data.revenue_trend}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="label" stroke="currentColor" className="text-xs opacity-50" tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" className="text-xs opacity-50" tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)', borderRadius: '12px' }} formatter={(val: any) => [formatCurrency(val), 'Revenue']} />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Chart */}
          <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
            <h3 className="mb-6 font-semibold text-[color:var(--app-text)]">Attendance (Last 7 Days)</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                <BarChart data={data.attendance_trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="label" stroke="currentColor" className="text-xs opacity-50" tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" className="text-xs opacity-50" tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'currentColor', opacity: 0.05 }} contentStyle={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)', borderRadius: '12px' }} />
                  <Bar dataKey="visits" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-[color:var(--app-text)]">Recent Activity</h3>
            <div className="divide-y divide-[color:var(--app-border)]">
              {data.recent_activity.length > 0 ? (
                data.recent_activity.map((activity) => (
                  <div key={activity.id} className="flex items-start justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        activity.type === 'checkin' ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' :
                        activity.type === 'payment' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        <DashboardIcon name={activity.type === 'checkin' ? 'attendance' : activity.type === 'payment' ? 'credit-card' : 'members'} className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-[color:var(--app-text)]">{activity.title}</p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-[color:var(--app-muted)]">{activity.time}</span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-[color:var(--app-muted)]">No recent activity.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Snapshots & Alerts) */}
        <div className="space-y-6">
          {/* Attendance Snapshot */}
          <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-[color:var(--app-text)]">Today's Snapshot</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-[color:var(--app-border)] pb-2">
                <span className="text-sm text-[color:var(--app-muted)]">Check-ins Today</span>
                <span className="font-semibold text-[color:var(--app-text)]">{data.attendance_snapshot.check_ins_today}</span>
              </div>
              <div className="flex justify-between border-b border-[color:var(--app-border)] pb-2">
                <span className="text-sm text-[color:var(--app-muted)]">Currently in Gym</span>
                <span className="font-semibold text-emerald-500">{data.attendance_snapshot.currently_in_gym}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-sm text-[color:var(--app-muted)]">Absent Members</span>
                <span className="font-semibold text-rose-500">{data.attendance_snapshot.absent_members}</span>
              </div>
              <Link href="/gym/attendance" className="mt-2 block w-full rounded-xl bg-slate-100 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                View Attendance Log
              </Link>
            </div>
          </div>

          {/* Expiry Alerts */}
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5 dark:border-rose-900/50 dark:bg-rose-950/20">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-rose-800 dark:text-rose-300">Expiring Soon</h3>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-200 text-xs font-bold text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                {data.expiry_alerts.length}
              </span>
            </div>
            <div className="space-y-3">
              {data.expiry_alerts.length > 0 ? (
                data.expiry_alerts.map((alert) => (
                  <div key={alert.id} className="rounded-xl border border-rose-200 bg-white p-3 shadow-sm dark:border-rose-800 dark:bg-slate-900">
                    <div className="flex justify-between">
                      <div className="font-medium text-[color:var(--app-text)]">{alert.member_name}</div>
                      <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        {alert.days_remaining === 0 ? 'Today' : `${alert.days_remaining} days`}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-[color:var(--app-muted)]">{alert.plan_name} • Ends {alert.end_date}</div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-[color:var(--app-muted)]">No upcoming expirations.</div>
              )}
            </div>
            {data.expiry_alerts.length > 0 && (
              <Link href="/gym/notifications" className="mt-4 block w-full text-center text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300">
                View All Renewals →
              </Link>
            )}
          </div>

          {/* Top Trainers */}
          <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-[color:var(--app-text)]">Top Trainers</h3>
            <div className="space-y-4">
              {data.top_trainers.length > 0 ? (
                data.top_trainers.map((trainer, idx) => (
                  <div key={trainer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[color:var(--app-text)]">{trainer.name}</div>
                        <div className="text-xs text-[color:var(--app-muted)]">{trainer.specialization}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-[color:var(--app-text)]">
                      {trainer.assigned_members} <span className="text-xs font-normal text-[color:var(--app-muted)]">mems</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-[color:var(--app-muted)]">No trainers found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
