'use client';
import { useState } from 'react';
import { getErrorMessage } from '@/lib/errors';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { toggleGymUserStatus, updateGymUser, createGymUser, type GymUser } from '@/lib/gym';

function RoleBadge({ name }: { name: string }) {
  return (
    <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
      {name}
    </span>
  );
}

function UserModal({ user, roles, onClose, onSuccess }: {
  user: GymUser | null; roles: any[]; onClose: () => void; onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '',
    password: '', password_confirmation: '',
    is_active: user ? user.is_active : true,
    roles: user?.roles?.map(r => r.name) ?? [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (name: string) => setForm(p => ({
    ...p,
    roles: p.roles.includes(name) ? p.roles.filter(r => r !== name) : [...p.roles, name],
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const payload: any = { ...form };
      if (!payload.password) { delete payload.password; delete payload.password_confirmation; }
      if (user) await updateGymUser(user.id, payload);
      else await createGymUser(payload);
      onSuccess();
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-[color:var(--app-surface)] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[color:var(--app-border)] px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20">
          <h2 className="text-lg font-bold text-[color:var(--app-text)]">{user ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onClose} className="rounded-full p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition">
            <DashboardIcon name="x" className="h-4 w-4" />
          </button>
        </div>
        <form id="u-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-[color:var(--app-text)]">Full Name *</label>
              <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[color:var(--app-text)]">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[color:var(--app-text)]">Phone</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[color:var(--app-text)]">Password {user && <span className="font-normal text-[color:var(--app-muted)]">(leave blank to keep)</span>}</label>
              <input type="password" minLength={8} required={!user} value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[color:var(--app-text)]">Confirm Password</label>
              <input type="password" minLength={8} required={!user || form.password.length > 0}
                value={form.password_confirmation} onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-[color:var(--app-text)]">Assign Roles</label>
            <div className="flex flex-wrap gap-2">
              {roles.map(r => (
                <label key={r.id} className={`cursor-pointer rounded-xl border px-4 py-2 text-xs font-semibold transition ${form.roles.includes(r.name) ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-300' : 'border-[color:var(--app-border)] text-[color:var(--app-muted)] hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <input type="checkbox" className="sr-only" checked={form.roles.includes(r.name)} onChange={() => toggle(r.name)} />
                  {r.name}
                </label>
              ))}
              {roles.length === 0 && <span className="text-xs text-[color:var(--app-muted)]">No roles defined.</span>}
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[color:var(--app-border)]">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-indigo-600" />
            <div>
              <div className="text-sm font-semibold text-[color:var(--app-text)]">Account Active</div>
              <div className="text-xs text-[color:var(--app-muted)]">If unchecked, user cannot log in</div>
            </div>
          </label>
        </form>
        <div className="border-t border-[color:var(--app-border)] bg-slate-50/50 dark:bg-slate-900/20 px-6 py-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition">Cancel</button>
          <button form="u-form" type="submit" disabled={loading} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition">
            {loading ? 'Saving...' : (user ? 'Save Changes' : 'Create User')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UsersTab({ users: initialUsers, roles, onRefresh }: {
  users: GymUser[]; roles: any[]; onRefresh: () => void;
}) {
  const [users, setUsers] = useState<GymUser[]>(initialUsers);
  const [modal, setModal] = useState<GymUser | 'new' | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const handleToggle = async (u: GymUser) => {
    setToggling(u.id);
    try {
      await toggleGymUserStatus(u.id);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !x.is_active } : x));
    } catch {/* ignore */}
    finally { setToggling(null); }
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex justify-between items-center bg-[color:var(--app-surface)] p-4 rounded-2xl border border-[color:var(--app-border)]">
        <div>
          <h3 className="font-bold text-[color:var(--app-text)]">Staff & Admin Access</h3>
          <p className="text-xs text-[color:var(--app-muted)] mt-0.5">{users.length} user{users.length !== 1 ? 's' : ''} in your gym</p>
        </div>
        <button onClick={() => setModal('new')} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition">
          <DashboardIcon name="plus" className="h-4 w-4" /> Add User
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/50 dark:bg-slate-900/20 text-xs uppercase text-[color:var(--app-muted)] border-b border-[color:var(--app-border)]">
            <tr>{['Name', 'Email', 'Role(s)', 'Status', 'Actions'].map((h, i) => <th key={i} className="px-5 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--app-border)]">
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[color:var(--app-muted)]">No users yet. Add the first user to get started.</td></tr>
            )}
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition">
                <td className="px-5 py-3 font-semibold text-[color:var(--app-text)]">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td className="px-5 py-3 text-[color:var(--app-muted)]">{u.email}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles?.length ? u.roles.map(r => <RoleBadge key={r.id} name={r.name} />) : <span className="text-xs text-[color:var(--app-muted)]">No roles</span>}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setModal(u)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition">Edit</button>
                    <button onClick={() => handleToggle(u)} disabled={toggling === u.id}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${u.is_active ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                      {toggling === u.id ? '...' : (u.is_active ? 'Deactivate' : 'Activate')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <UserModal
          user={modal === 'new' ? null : modal}
          roles={roles}
          onClose={() => setModal(null)}
          onSuccess={() => { setModal(null); onRefresh(); }}
        />
      )}
    </div>
  );
}
