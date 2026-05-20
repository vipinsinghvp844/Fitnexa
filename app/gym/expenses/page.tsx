'use client';
import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { LoadingState } from '@/components/admin/loading-state';
import { getErrorMessage } from '@/lib/errors';
import {
  getExpenseDashboard, getExpenses, getExpenseCategories,
  createExpense, deleteExpense, createExpenseCategory, deleteExpenseCategory, seedDefaultExpenseCategories,
  type Expense, type ExpenseCategory, type ExpenseDashboard, type CreateExpensePayload
} from '@/lib/gym';

function fmt(n: number) { return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }

export default function ExpensesPage() {
  const [tab, setTab] = useState<'dashboard'|'list'|'categories'>('dashboard');
  const [dashboard, setDashboard] = useState<ExpenseDashboard | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showCatCreate, setShowCatCreate] = useState(false);
  const [filters, setFilters] = useState({ start_date: '', end_date: '', category_id: '' });

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [db, exp, cats] = await Promise.all([
        getExpenseDashboard(), getExpenses(filters as any), getExpenseCategories()
      ]);
      setDashboard((db as any).data);
      setExpenses((exp as any).data?.data || (exp as any).data || []);
      setCategories((cats as any).data || []);
    } catch(e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { void loadAll(); }, [loadAll]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this expense?')) return;
    try { await deleteExpense(id); await loadAll(); } catch(e) { alert(getErrorMessage(e)); }
  };

  const handleSeedDefaults = async () => {
    try { await seedDefaultExpenseCategories(); await loadAll(); } catch(e) { alert(getErrorMessage(e)); }
  };

  const profitColor = dashboard && dashboard.profit >= 0 ? 'text-emerald-500' : 'text-rose-500';

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        eyebrow="Finance"
        title="Expense Management"
        description="Track outgoing money and monitor profit margins."
        actions={
          <div className="flex items-center gap-3">
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition">
              <DashboardIcon name="plus" className="h-4 w-4" /> Add Expense
            </button>
          </div>
        }
      />

      {/* Tab bar */}
      <div className="flex gap-1 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-1 w-fit">
        {(['dashboard','list','categories'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-5 py-2 text-sm font-semibold capitalize transition ${tab===t ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow' : 'text-[color:var(--app-muted)] hover:text-[color:var(--app-text)]'}`}>{t}</button>
        ))}
      </div>

      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{error}</div>}
      {loading ? <LoadingState /> : (
        <>
          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && dashboard && (
            <div className="space-y-6">
              {/* KPI row */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: "Today's Expenses", val: fmt(dashboard.today_expenses), color: 'text-orange-500' },
                  { label: 'Month Expenses', val: fmt(dashboard.month_expenses), color: 'text-rose-500' },
                  { label: 'Month Revenue', val: fmt(dashboard.month_revenue), color: 'text-sky-500' },
                  { label: 'Net Profit', val: fmt(dashboard.profit), color: profitColor },
                  { label: 'All-time Expenses', val: fmt(dashboard.total_expenses_all), color: 'text-slate-500' },
                ].map(kpi => (
                  <div key={kpi.label} className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-[color:var(--app-muted)]">{kpi.label}</p>
                    <p className={`mt-2 text-2xl font-bold ${kpi.color}`}>{kpi.val}</p>
                  </div>
                ))}
              </div>

              {/* Profit callout */}
              <div className={`rounded-2xl border p-5 ${dashboard.profit >= 0 ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' : 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20'}`}>
                <p className="text-sm font-semibold text-[color:var(--app-muted)]">This Month Profit / Loss</p>
                <p className={`mt-1 text-4xl font-black ${profitColor}`}>{fmt(dashboard.profit)}</p>
                <p className="mt-1 text-sm text-[color:var(--app-muted)]">Revenue {fmt(dashboard.month_revenue)} &minus; Expenses {fmt(dashboard.month_expenses)}</p>
              </div>

              {/* Category breakdown */}
              <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
                <h3 className="mb-4 font-bold text-[color:var(--app-text)]">Category Breakdown (This Month)</h3>
                {dashboard.category_breakdown.length === 0 ? (
                  <p className="text-sm text-[color:var(--app-muted)]">No expenses this month.</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.category_breakdown.map(c => {
                      const pct = dashboard.month_expenses > 0 ? (c.total / dashboard.month_expenses) * 100 : 0;
                      return (
                        <div key={c.category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-[color:var(--app-text)]">{c.category}</span>
                            <span className="text-[color:var(--app-muted)]">{fmt(c.total)} ({pct.toFixed(1)}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                            <div className="h-2 rounded-full bg-gradient-to-r from-rose-400 to-orange-400" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent expenses */}
              <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[color:var(--app-border)]"><h3 className="font-bold text-[color:var(--app-text)]">Recent Expenses</h3></div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 dark:bg-slate-900/20 text-xs uppercase text-[color:var(--app-muted)]">
                    <tr>{['Category','Amount','Date','Method','Note'].map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--app-border)]">
                    {dashboard.recent_expenses.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                        <td className="px-5 py-3 font-medium text-[color:var(--app-text)]">{e.category?.name || '-'}</td>
                        <td className="px-5 py-3 font-bold text-rose-600 dark:text-rose-400">{fmt(Number(e.amount))}</td>
                        <td className="px-5 py-3 text-[color:var(--app-muted)]">{e.expense_date}</td>
                        <td className="px-5 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-800">{e.payment_method}</span></td>
                        <td className="px-5 py-3 text-[color:var(--app-muted)] max-w-xs truncate">{e.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── EXPENSE LIST ── */}
          {tab === 'list' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-3 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-4">
                <input type="date" value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value})} className="rounded-xl border border-[color:var(--app-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-sky-500" placeholder="Start date" />
                <input type="date" value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value})} className="rounded-xl border border-[color:var(--app-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-sky-500" placeholder="End date" />
                <select value={filters.category_id} onChange={e => setFilters({...filters, category_id: e.target.value})} className="rounded-xl border border-[color:var(--app-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-sky-500">
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button onClick={() => setFilters({ start_date:'', end_date:'', category_id:'' })} className="rounded-xl border border-[color:var(--app-border)] px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition">Reset</button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 dark:bg-slate-900/20 text-xs uppercase text-[color:var(--app-muted)] border-b border-[color:var(--app-border)]">
                    <tr>{['Category','Amount','Date','Method','Description',''].map((h,i) => <th key={i} className="px-5 py-3 font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--app-border)]">
                    {expenses.length === 0 && (
                      <tr><td colSpan={6} className="px-5 py-8 text-center text-[color:var(--app-muted)]">No expenses found.</td></tr>
                    )}
                    {expenses.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                        <td className="px-5 py-3 font-medium text-[color:var(--app-text)]">{e.category?.name || '-'}</td>
                        <td className="px-5 py-3 font-bold text-rose-600 dark:text-rose-400">{fmt(Number(e.amount))}</td>
                        <td className="px-5 py-3 text-[color:var(--app-muted)]">{e.expense_date}</td>
                        <td className="px-5 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-800">{e.payment_method}</span></td>
                        <td className="px-5 py-3 text-[color:var(--app-muted)] max-w-xs truncate">{e.description || '-'}</td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => handleDelete(e.id)} className="text-xs font-semibold text-rose-500 hover:text-rose-700">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CATEGORIES ── */}
          {tab === 'categories' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <button onClick={() => setShowCatCreate(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition">
                  <DashboardIcon name="plus" className="h-4 w-4" /> New Category
                </button>
                <button onClick={handleSeedDefaults} className="rounded-xl border border-[color:var(--app-border)] px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition">Seed Defaults</button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map(c => (
                  <div key={c.id} className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[color:var(--app-text)]">{c.name}</h4>
                      <span className="text-xs font-medium text-[color:var(--app-muted)] bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-0.5">{c.expenses_count || 0} expenses</span>
                    </div>
                    {c.description && <p className="text-sm text-[color:var(--app-muted)]">{c.description}</p>}
                  </div>
                ))}
                {categories.length === 0 && <div className="col-span-full py-8 text-center text-[color:var(--app-muted)]">No categories yet. Click &ldquo;Seed Defaults&rdquo; to add standard ones.</div>}
              </div>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <CreateExpenseModal
          categories={categories}
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); void loadAll(); }}
        />
      )}
      {showCatCreate && (
        <CreateCategoryModal
          onClose={() => setShowCatCreate(false)}
          onSuccess={() => { setShowCatCreate(false); void loadAll(); }}
        />
      )}
    </div>
  );
}

function CreateExpenseModal({ categories, onClose, onSuccess }: { categories: ExpenseCategory[], onClose: ()=>void, onSuccess: ()=>void }) {
  const [form, setForm] = useState<CreateExpensePayload>({ expense_category_id: categories[0]?.id || 0, amount: 0, expense_date: new Date().toISOString().split('T')[0], payment_method: 'cash', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try { await createExpense(form); onSuccess(); }
    catch(err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-[color:var(--app-surface)] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[color:var(--app-border)] px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20">
          <h2 className="text-xl font-bold text-[color:var(--app-text)]">Record Expense</h2>
          <button onClick={onClose} className="rounded-full p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition"><DashboardIcon name="x" className="h-5 w-5" /></button>
        </div>
        <form id="expense-form" onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {error && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{error}</div>}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Category <span className="text-rose-500">*</span></label>
            <select required value={form.expense_category_id} onChange={e => setForm({...form, expense_category_id: Number(e.target.value)})} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-rose-500">
              <option value="">-- Select Category --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Amount (₹) <span className="text-rose-500">*</span></label>
              <input required type="number" min="0.01" step="0.01" value={form.amount || ''} onChange={e => setForm({...form, amount: parseFloat(e.target.value)})} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-rose-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Date <span className="text-rose-500">*</span></label>
              <input required type="date" value={form.expense_date} onChange={e => setForm({...form, expense_date: e.target.value})} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-rose-500" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Payment Method <span className="text-rose-500">*</span></label>
            <select required value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value as any})} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-rose-500">
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Description / Note</label>
            <textarea rows={2} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional note..." className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-rose-500" />
          </div>
        </form>
        <div className="border-t border-[color:var(--app-border)] bg-slate-50/50 px-6 py-4 flex justify-end gap-3 dark:bg-slate-900/20">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition">Cancel</button>
          <button form="expense-form" type="submit" disabled={loading} className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50 transition">
            {loading ? 'Saving...' : 'Save Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateCategoryModal({ onClose, onSuccess }: { onClose: ()=>void, onSuccess: ()=>void }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try { await createExpenseCategory(form); onSuccess(); }
    catch(err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-[color:var(--app-surface)] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[color:var(--app-border)] px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20">
          <h2 className="text-xl font-bold text-[color:var(--app-text)]">New Category</h2>
          <button onClick={onClose} className="rounded-full p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition"><DashboardIcon name="x" className="h-5 w-5" /></button>
        </div>
        <form id="cat-form" onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {error && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{error}</div>}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Name <span className="text-rose-500">*</span></label>
            <input required type="text" placeholder="e.g. Rent" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-rose-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Description</label>
            <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-rose-500" />
          </div>
        </form>
        <div className="border-t border-[color:var(--app-border)] bg-slate-50/50 px-6 py-4 flex justify-end gap-3 dark:bg-slate-900/20">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition">Cancel</button>
          <button form="cat-form" type="submit" disabled={loading} className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50 transition">
            {loading ? 'Saving...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
