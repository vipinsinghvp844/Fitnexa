'use client';
import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { LoadingState } from '@/components/admin/loading-state';
import { getErrorMessage } from '@/lib/errors';
import {
  getPayrollDashboard, getPayrolls, generatePayroll, updatePayroll,
  markPayrollPaid, deletePayroll, type PayrollRecord, type PayrollDashboard,
} from '@/lib/gym';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmt = (n: number) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const now = new Date();

export default function PayrollPage() {
  const [tab, setTab] = useState<'dashboard'|'list'>('dashboard');
  const [dashboard, setDashboard] = useState<PayrollDashboard | null>(null);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [filters, setFilters] = useState({ month: now.getMonth() + 1, year: now.getFullYear(), status: '' });
  const [showGenerate, setShowGenerate] = useState(false);
  const [editPayroll, setEditPayroll] = useState<PayrollRecord | null>(null);
  const [actionId, setActionId] = useState<number|null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [db, list] = await Promise.all([
        getPayrollDashboard(),
        getPayrolls({ month: filters.month, year: filters.year, status: filters.status || null } as any),
      ]);
      setDashboard((db as any).data);
      setPayrolls((list as any).data?.data || (list as any).data || []);
    } catch(e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { void load(); }, [load]);

  const handleMarkPaid = async (id: number) => {
    if (!confirm('Mark this payroll as paid? An expense entry will be auto-created.')) return;
    try { setActionId(id); await markPayrollPaid(id); await load(); }
    catch(e) { alert(getErrorMessage(e)); }
    finally { setActionId(null); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this pending payroll?')) return;
    try { setActionId(id); await deletePayroll(id); await load(); }
    catch(e) { alert(getErrorMessage(e)); }
    finally { setActionId(null); }
  };

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        eyebrow="HR & Finance"
        title="Payroll Management"
        description="Generate, review and disburse monthly staff salaries."
        actions={
          <button onClick={() => setShowGenerate(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:scale-[1.02] transition">
            <DashboardIcon name="payroll" className="h-4 w-4" /> Generate Payroll
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-1 w-fit">
        {(['dashboard','list'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-5 py-2 text-sm font-semibold capitalize transition ${tab===t ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow' : 'text-[color:var(--app-muted)] hover:text-[color:var(--app-text)]'}`}>{t}</button>
        ))}
      </div>

      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{error}</div>}
      {loading ? <LoadingState /> : (
        <>
          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && dashboard && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Total This Month', val: fmt(dashboard.total_this_month), color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
                  { label: 'Paid', val: fmt(dashboard.paid_this_month), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                  { label: 'Pending', val: fmt(dashboard.pending_this_month), color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' },
                  { label: 'Pending Employees', val: String(dashboard.pending_count), color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                ].map(kpi => (
                  <div key={kpi.label} className={`rounded-2xl border border-[color:var(--app-border)] ${kpi.bg} p-5 shadow-sm`}>
                    <p className="text-xs font-semibold uppercase text-[color:var(--app-muted)]">{kpi.label}</p>
                    <p className={`mt-2 text-2xl font-bold ${kpi.color}`}>{kpi.val}</p>
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] shadow-sm">
                <div className="px-6 py-4 border-b border-[color:var(--app-border)]">
                  <h3 className="font-bold text-[color:var(--app-text)]">Recent Payrolls</h3>
                </div>
                <PayrollTable payrolls={dashboard.recent_payrolls} actionId={actionId} onPay={handleMarkPaid} onDelete={handleDelete} onEdit={setEditPayroll} />
              </div>
            </div>
          )}

          {/* ── LIST ── */}
          {tab === 'list' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-4">
                <select value={filters.month} onChange={e => setFilters({...filters, month: Number(e.target.value)})} className="rounded-xl border border-[color:var(--app-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-violet-500">
                  {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
                <input type="number" value={filters.year} min={2020} max={2099} onChange={e => setFilters({...filters, year: Number(e.target.value)})} className="rounded-xl border border-[color:var(--app-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-violet-500 w-24" />
                <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="rounded-xl border border-[color:var(--app-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-violet-500">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] shadow-sm">
                {payrolls.length === 0
                  ? <div className="py-12 text-center text-[color:var(--app-muted)]">No payroll records found. Click &ldquo;Generate Payroll&rdquo; to get started.</div>
                  : <PayrollTable payrolls={payrolls} actionId={actionId} onPay={handleMarkPaid} onDelete={handleDelete} onEdit={setEditPayroll} />
                }
              </div>
            </div>
          )}
        </>
      )}

      {showGenerate && <GenerateModal onClose={() => setShowGenerate(false)} onSuccess={() => { setShowGenerate(false); void load(); }} />}
      {editPayroll && <EditPayrollModal payroll={editPayroll} onClose={() => setEditPayroll(null)} onSuccess={() => { setEditPayroll(null); void load(); }} />}
    </div>
  );
}

function PayrollTable({ payrolls, actionId, onPay, onDelete, onEdit }: {
  payrolls: PayrollRecord[];
  actionId: number | null;
  onPay: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (p: PayrollRecord) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50/50 dark:bg-slate-900/20 text-xs uppercase text-[color:var(--app-muted)] border-b border-[color:var(--app-border)]">
          <tr>
            {['Employee','Role','Period','Base Salary','Bonuses','Deductions','Net Salary','Status',''].map((h,i) => (
              <th key={i} className="px-5 py-3 font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[color:var(--app-border)]">
          {payrolls.map(p => {
            const fmt2 = (n: string|number) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
            const monthLabel = `${MONTHS[p.month - 1]} ${p.year}`;
            const isLoading = actionId === p.id;
            return (
              <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                <td className="px-5 py-3 font-medium text-[color:var(--app-text)]">{p.employee?.user?.name || `#${p.employee_id}`}</td>
                <td className="px-5 py-3 text-[color:var(--app-muted)] capitalize">{p.employee?.position || p.employee?.role || '-'}</td>
                <td className="px-5 py-3 text-[color:var(--app-muted)]">{monthLabel}</td>
                <td className="px-5 py-3">{fmt2(p.base_salary)}</td>
                <td className="px-5 py-3 text-emerald-600 dark:text-emerald-400">{fmt2(p.bonuses)}</td>
                <td className="px-5 py-3 text-rose-600 dark:text-rose-400">{fmt2(p.deductions)}</td>
                <td className="px-5 py-3 font-bold text-violet-600 dark:text-violet-400">{fmt2(p.net_salary)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {p.status === 'pending' && (
                      <>
                        <button disabled={isLoading} onClick={() => onEdit(p)} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition disabled:opacity-50">Edit</button>
                        <button disabled={isLoading} onClick={() => onPay(p.id)} className="rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50">
                          {isLoading ? '...' : 'Mark Paid'}
                        </button>
                        <button disabled={isLoading} onClick={() => onDelete(p.id)} className="rounded-lg bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-600 transition disabled:opacity-50">Del</button>
                      </>
                    )}
                    {p.status === 'paid' && p.paid_at && (
                      <span className="text-xs text-[color:var(--app-muted)]">{new Date(p.paid_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GenerateModal({ onClose, onSuccess }: { onClose: ()=>void; onSuccess: ()=>void }) {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string|null>(null);
  const [error, setError] = useState<string|null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await generatePayroll(month, year);
      setResult((res as any).message);
    } catch(err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-[color:var(--app-surface)] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[color:var(--app-border)] px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20">
          <h2 className="text-xl font-bold text-[color:var(--app-text)]">Generate Payroll</h2>
          <button onClick={onClose} className="rounded-full p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition"><DashboardIcon name="x" className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {error && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{error}</div>}
          {result && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{result}</div>}
          <p className="text-sm text-[color:var(--app-muted)]">This will auto-pull base salaries from all active employees and create payroll records for the selected month.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Month</label>
              <select value={month} onChange={e => setMonth(Number(e.target.value))} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-violet-500">
                {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Year</label>
              <input type="number" value={year} min={2020} max={2099} onChange={e => setYear(Number(e.target.value))} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-violet-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            {result ? (
              <button type="button" onClick={onSuccess} className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition">Done</button>
            ) : (
              <>
                <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition">Cancel</button>
                <button type="submit" disabled={loading} className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50 transition">
                  {loading ? 'Generating...' : 'Generate'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function EditPayrollModal({ payroll, onClose, onSuccess }: { payroll: PayrollRecord; onClose: ()=>void; onSuccess: ()=>void }) {
  const [bonuses, setBonuses] = useState(Number(payroll.bonuses));
  const [deductions, setDeductions] = useState(Number(payroll.deductions));
  const [notes, setNotes] = useState(payroll.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const net = Number(payroll.base_salary) + bonuses - deductions;
  const monthLabel = `${MONTHS[payroll.month - 1]} ${payroll.year}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try { await updatePayroll(payroll.id, { bonuses, deductions, notes }); onSuccess(); }
    catch(err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-[color:var(--app-surface)] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[color:var(--app-border)] px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20">
          <div>
            <h2 className="text-xl font-bold text-[color:var(--app-text)]">Adjust Payroll</h2>
            <p className="text-sm text-violet-600 dark:text-violet-400">{payroll.employee?.user?.name} — {monthLabel}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition"><DashboardIcon name="x" className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {error && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{error}</div>}
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/20 flex justify-between text-sm">
            <span className="text-[color:var(--app-muted)]">Base Salary</span>
            <span className="font-bold text-[color:var(--app-text)]">₹{Number(payroll.base_salary).toLocaleString('en-IN')}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Bonuses (₹)</label>
              <input type="number" min="0" step="0.01" value={bonuses} onChange={e => setBonuses(parseFloat(e.target.value)||0)} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Deductions (₹)</label>
              <input type="number" min="0" step="0.01" value={deductions} onChange={e => setDeductions(parseFloat(e.target.value)||0)} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-violet-500" />
            </div>
          </div>
          <div className="rounded-xl bg-violet-50 p-4 dark:bg-violet-500/10 flex justify-between">
            <span className="font-semibold text-[color:var(--app-text)]">Net Salary</span>
            <span className="text-xl font-black text-violet-600 dark:text-violet-400">₹{Math.max(0, net).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Notes</label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-violet-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition">Cancel</button>
            <button type="submit" disabled={loading} className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50 transition">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
