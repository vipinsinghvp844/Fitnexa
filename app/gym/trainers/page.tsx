'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { DataTable } from '@/components/admin/data-table';
import { Modal } from '@/components/admin/modal';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/admin/pagination';
import { LoadingState } from '@/components/admin/loading-state';
import { StatusBadge } from '@/components/admin/status-badge';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Field, SelectInput, TextInput } from '@/components/admin/fields';
import { createGymStaff, deleteGymStaff, getGymStaff, updateGymStaff } from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';

// Re-using Staff types, extended for trainer-specific fields
type StaffStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';
type StaffRole = 'manager' | 'trainer' | 'receptionist' | 'accountant';

interface GymStaffResponse {
  data: StaffRow[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

interface StaffRow {
  id: number;
  user_id: number | null;
  user: {
    id: number | null;
    name: string | null;
    email: string | null;
  } | null;
  phone: string | null;
  branch_id: number | null;
  branch: {
    id: number | null;
    name: string | null;
    address: string | null;
    phone: string | null;
  } | null;
  position: string | null;
  hire_date: string | null;
  salary: number | null;
  shift: string | null;
  status: StaffStatus | null;
  role: string | null;
  // Trainer-specific fields
  specialization?: string | null;
  experience_years?: number | null;
  certifications?: string | null;
  bio?: string | null;
  assigned_members_count?: number | null; // Assuming this comes from the API
  created_at: string | null;
  updated_at: string | null;
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function getInitials(name?: string | null) {
  if (!name) return 'NA';
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function GymTrainersPage() {
  const [query, setQuery] = useState({
    q: '',
    status: '',
    page: 1,
  });

  const debouncedQ = useDebouncedValue(query.q, 400);

  const [response, setResponse] = useState<GymStaffResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'Trainer', // Default for trainers
    salary: '',
    shift: '',
    hire_date: '',
    branch_id: '',
    role: 'trainer' as StaffRole, // Fixed for trainers
    status: 'active' as StaffStatus,
    specialization: '',
    experience_years: '',
    certifications: '',
    bio: '',
  });

  const loadTrainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = (await getGymStaff({
        q: debouncedQ,
        status: query.status,
        role: 'trainer',
        page: query.page,
      })) as GymStaffResponse;
      setResponse(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, query.page, query.status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTrainers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadTrainers]);

  const columns = useMemo(
    () => [
      {
        id: 'user.name',
        header: 'Trainer',
        className: 'min-w-[260px]',
        render: (row: StaffRow) => (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/5 text-sm font-semibold text-slate-900">
              {getInitials(row.user?.name)}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-slate-900">{row.user?.name || 'N/A'}</div>
              <div className="truncate text-sm text-[color:var(--app-muted)]">{row.user?.email || 'No email'}</div>
            </div>
          </div>
        ),
      },
      {
        id: 'specialization',
        header: 'Specialization',
        render: (row: StaffRow) => <div className="text-sm">{row.specialization || 'N/A'}</div>,
      },
      {
        id: 'experience_years',
        header: 'Experience',
        className: 'w-[120px]',
        render: (row: StaffRow) => <div className="text-sm">{row.experience_years ? `${row.experience_years} yrs` : 'N/A'}</div>,
      },
      {
        id: 'shift',
        header: 'Shift',
        className: 'w-[120px]',
        render: (row: StaffRow) => (
          <div className="truncate text-sm text-slate-700">{row.shift || 'N/A'}</div>
        ),
      },
      {
        id: 'assigned_members_count',
        header: 'Members',
        className: 'w-[100px] text-center',
        render: (row: StaffRow) => <div className="text-sm font-medium">{row.assigned_members_count ?? 0}</div>,
      },
      {
        id: 'status',
        header: 'Status',
        className: 'w-[120px]',
        render: (row: StaffRow) => <StatusBadge value={row.status || 'inactive'} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'w-[220px] text-right',
        render: (row: StaffRow) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setForm({
                  name: row.user?.name || '',
                  email: row.user?.email || '',
                  phone: row.phone || '',
                  position: row.position || '',
                  salary: row.salary?.toString() || '',
                  shift: row.shift || '',
                  hire_date: row.hire_date || '',
                  branch_id: row.branch_id?.toString() || '',
                  role: (row.role as StaffRole) || 'trainer',
                  status: (row.status as StaffStatus) || 'active',
                  specialization: row.specialization || '',
                  experience_years: row.experience_years?.toString() || '',
                  certifications: row.certifications || '',
                  bio: row.bio || '',
                });
                setViewMode(true);
                setFormOpen(true);
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View
            </button>
            <button
              onClick={() => {
                setForm({
                  name: row.user?.name || '',
                  email: row.user?.email || '',
                  phone: row.phone || '',
                  position: row.position || '',
                  salary: row.salary?.toString() || '',
                  shift: row.shift || '',
                  hire_date: row.hire_date || '',
                  branch_id: row.branch_id?.toString() || '',
                  role: (row.role as StaffRole) || 'trainer',
                  status: (row.status as StaffStatus) || 'active',
                  specialization: row.specialization || '',
                  experience_years: row.experience_years?.toString() || '',
                  certifications: row.certifications || '',
                  bio: row.bio || '',
                });
                setEditId(row.id);
                setViewMode(false);
                setFormOpen(true);
              }}
              className="rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
            >
              Edit
            </button>
            <button
              onClick={() => setDeleteId(row.id)}
              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Deactivate
            </button>
          </div>
        ),
      },
    ],
    []
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        position: form.position,
        salary: form.salary ? parseFloat(form.salary) : null,
        shift: form.shift || null,
        hire_date: form.hire_date,
        branch_id: parseInt(form.branch_id, 10),
        role: 'trainer' as StaffRole, // Always 'trainer' for this page
        status: form.status,
        specialization: form.specialization || null,
        experience_years: form.experience_years ? parseInt(form.experience_years, 10) : null,
        certifications: form.certifications || null,
        bio: form.bio || null,
      };

      if (editId) {
        await updateGymStaff(editId, payload);
      } else {
        await createGymStaff(payload);
      }

      setFormOpen(false);
      setEditId(null);
      setForm({
        name: '',
        email: '',
        phone: '',
        position: 'Trainer',
        salary: '',
        shift: '',
        hire_date: '',
        branch_id: '',
        role: 'trainer',
        status: 'active',
        specialization: '',
        experience_years: '',
        certifications: '',
        bio: '',
      });
      await loadTrainers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await deleteGymStaff(deleteId);
      setDeleteId(null);
      await loadTrainers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !response) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Trainers"
        description="Manage gym trainers and their profiles."
        actions={
          <button
            type="button"
            onClick={() => {
              setViewMode(false);
              setEditId(null);
              setForm({
                name: '',
                email: '',
                phone: '',
                position: 'Trainer',
                salary: '',
                shift: '',
                hire_date: '',
                branch_id: '',
                role: 'trainer',
                status: 'active',
                specialization: '',
                experience_years: '',
                certifications: '',
                bio: '',
              });
              setFormOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(14,165,233,0.28)] transition hover:-translate-y-0.5 hover:bg-sky-600"
          >
            Add Trainer
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-sm text-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Search">
            <TextInput
              placeholder="Search by name or email..."
              value={query.q}
              onChange={(event) => setQuery({ ...query, q: event.target.value, page: 1 })}
              className="bg-slate-900 text-white border-slate-700 placeholder:text-slate-500"
            />
          </Field>
          <Field label="Status">
            <SelectInput
              value={query.status}
              onChange={(event) => setQuery({ ...query, status: event.target.value, page: 1 })}
              className="bg-slate-900 text-white border-slate-700"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </SelectInput>
          </Field>
          {/* Add more trainer-specific filters here if needed, e.g., specialization */}
        </div>
      </div>

      {response && (
        <div className="space-y-6">
          <DataTable<StaffRow>
            columns={columns}
            data={response.data}
            rowKey={(item) => item.id.toString()}
            emptyTitle="No trainers found"
            emptyDescription="Try adjusting your search or filters."
            mobileRender={(row) => (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/5 text-sm font-semibold text-slate-900">
                    {getInitials(row.user?.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-900">{row.user?.name || 'N/A'}</div>
                    <div className="truncate text-sm text-[color:var(--app-muted)]">
                      {row.specialization || 'N/A'} • {row.experience_years ? `${row.experience_years} yrs` : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="text-base" role="img" aria-label="Phone">📞</span> {row.phone || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="text-base" role="img" aria-label="Shift">🕒</span> {row.shift || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 font-medium text-slate-900">
                    <span className="text-base" role="img" aria-label="Members">👥</span> Assigned Members: {row.assigned_members_count ?? 0}
                  </div>
                </div>

                <div>
                  <StatusBadge value={row.status || 'inactive'} />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => {
                      setForm({
                        name: row.user?.name || '',
                        email: row.user?.email || '',
                        phone: row.phone || '',
                        position: row.position || '',
                        salary: row.salary?.toString() || '',
                        shift: row.shift || '',
                        hire_date: row.hire_date || '',
                        branch_id: row.branch_id?.toString() || '',
                        role: (row.role as StaffRole) || 'trainer',
                        status: (row.status as StaffStatus) || 'active',
                        specialization: row.specialization || '',
                        experience_years: row.experience_years?.toString() || '',
                        certifications: row.certifications || '',
                        bio: row.bio || '',
                      });
                      setViewMode(true);
                      setFormOpen(true);
                    }}
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      setForm({
                        name: row.user?.name || '',
                        email: row.user?.email || '',
                        phone: row.phone || '',
                        position: row.position || '',
                        salary: row.salary?.toString() || '',
                        shift: row.shift || '',
                        hire_date: row.hire_date || '',
                        branch_id: row.branch_id?.toString() || '',
                        role: (row.role as StaffRole) || 'trainer',
                        status: (row.status as StaffStatus) || 'active',
                        specialization: row.specialization || '',
                        experience_years: row.experience_years?.toString() || '',
                        certifications: row.certifications || '',
                        bio: row.bio || '',
                      });
                      setEditId(row.id);
                      setViewMode(false);
                      setFormOpen(true);
                    }}
                    className="flex-1 rounded-xl border border-sky-200 bg-sky-50 py-2.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(row.id)}
                    className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            )}
          />
          <Pagination
            meta={response.meta}
            onPageChange={(page) => setQuery({ ...query, page })}
          />
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditId(null);
          setViewMode(false);
        }}
        title={viewMode ? 'View Trainer' : editId ? 'Edit Trainer' : 'Add Trainer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name">
              <TextInput
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Full name"
                required
                disabled={viewMode}
              />
            </Field>
            <Field label="Email">
              <TextInput
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="email@example.com"
                required
                disabled={viewMode}
              />
            </Field>
            <Field label="Phone">
              <TextInput
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="Phone number"
                disabled={viewMode}
              />
            </Field>
            <Field label="Specialization">
              <TextInput
                value={form.specialization}
                onChange={(event) => setForm({ ...form, specialization: event.target.value })}
                placeholder="e.g., Weightlifting, Yoga"
                required
                disabled={viewMode}
              />
            </Field>
            <Field label="Experience (Years)">
              <TextInput
                type="number"
                value={form.experience_years}
                onChange={(event) => setForm({ ...form, experience_years: event.target.value })}
                placeholder="e.g., 5"
                required
                disabled={viewMode}
              />
            </Field>
            <Field label="Certifications">
              <TextInput
                value={form.certifications}
                onChange={(event) => setForm({ ...form, certifications: event.target.value })}
                placeholder="e.g., ACE, NASM"
                disabled={viewMode}
              />
            </Field>
            <Field label="Bio">
              <TextInput
                value={form.bio}
                onChange={(event) => setForm({ ...form, bio: event.target.value })}
                placeholder="Short biography"
                disabled={viewMode}
              />
            </Field>
            <Field label="Salary">
              <TextInput
                type="number"
                step="0.01"
                value={form.salary}
                onChange={(event) => setForm({ ...form, salary: event.target.value })}
                placeholder="Monthly salary"
                disabled={viewMode}
              />
            </Field>
            <Field label="Shift">
              <TextInput
                value={form.shift}
                onChange={(event) => setForm({ ...form, shift: event.target.value })}
                placeholder="e.g., 9 AM - 6 PM"
                disabled={viewMode}
              />
            </Field>
            <Field label="Hire Date">
              <TextInput
                type="date"
                value={form.hire_date}
                onChange={(event) => setForm({ ...form, hire_date: event.target.value })}
                required
                disabled={viewMode}
              />
            </Field>
            <Field label="Branch ID">
              <TextInput
                type="number"
                value={form.branch_id}
                onChange={(event) => setForm({ ...form, branch_id: event.target.value })}
                placeholder="Branch ID"
                required
                disabled={viewMode}
              />
            </Field>
            <Field label="Status">
              <SelectInput
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as StaffStatus })}
                required
                disabled={viewMode}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </SelectInput>
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditId(null);
                setViewMode(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {viewMode ? 'Close' : 'Cancel'}
            </button>
            {!viewMode ? (
              <button
                type="submit"
                disabled={submitting || !form.specialization || !form.experience_years}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            ) : null}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Deactivate Trainer"
        description="Are you sure you want to deactivate this trainer? This action cannot be undone."
        confirmLabel="Deactivate"
      />
    </div>
  );
}
