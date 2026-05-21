'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { DataTable } from '@/components/admin/data-table';
import { Modal } from '@/components/admin/modal';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/admin/pagination';
import { LoadingState } from '@/components/admin/loading-state';
import { StatusBadge } from '@/components/admin/status-badge';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Field, SelectInput, TextInput } from '@/components/admin/fields';
import { ImageUpload } from '@/components/admin/image-upload';
import { useToast } from '@/components/admin/toast';
import {
  getGymTrainers,
  createGymTrainer,
  updateGymTrainer,
  deleteGymTrainer,
  type GymTrainerSummary,
} from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';

interface TrainersResponse {
  data: GymTrainerSummary[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
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

const BLANK_FORM = {
  full_name: '',
  email: '',
  phone: '',
  specialization: '',
  experience_years: '',
  certifications: '',
  bio: '',
  avatar: '',
  salary: '',
  shift: '',
  status: 'active' as 'active' | 'inactive' | 'suspended',
};

export default function GymTrainersPage() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [query, setQuery] = useState({ q: '', status: '', page: 1 });
  const debouncedQ = useDebouncedValue(query.q, 400);

  const [response, setResponse] = useState<TrainersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });

  const loadTrainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = (await getGymTrainers({
        page: query.page,
        per_page: 15,
        ...(query.status ? { status: query.status } : {}),
        ...(debouncedQ ? { q: debouncedQ } : {}),
      })) as TrainersResponse;
      setResponse(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, query.page, query.status]);

  useEffect(() => {
    const id = window.setTimeout(() => void loadTrainers(), 0);
    return () => window.clearTimeout(id);
  }, [loadTrainers]);

  function openEdit(row: GymTrainerSummary, view = false) {
    setForm({
      full_name: row.user?.name || '',
      email: row.user?.email || '',
      phone: row.phone || '',
      specialization: row.specialization || '',
      experience_years: row.experience_years?.toString() || '',
      certifications: row.certifications || '',
      bio: row.bio || '',
      avatar: row.avatar || '',
      salary: row.salary?.toString() || '',
      shift: row.shift || '',
      status: (row.status as 'active' | 'inactive' | 'suspended') || 'active',
    });
    setEditId(row.id);
    setViewMode(view);
    setFormOpen(true);
  }

  const columns = useMemo(
    () => [
      {
        id: 'user.name',
        header: 'Trainer',
        className: 'min-w-[260px]',
        render: (row: GymTrainerSummary) => (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden bg-slate-900/5 text-sm font-semibold text-slate-900 shrink-0">
              {row.avatar
                ? <img src={row.avatar} alt="" className="w-full h-full object-cover" />
                : getInitials(row.user?.name)}
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
        render: (row: GymTrainerSummary) => <div className="text-sm">{row.specialization || 'N/A'}</div>,
      },
      {
        id: 'experience_years',
        header: 'Experience',
        className: 'w-[120px]',
        render: (row: GymTrainerSummary) => (
          <div className="text-sm">{row.experience_years ? `${row.experience_years} yrs` : 'N/A'}</div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        className: 'w-[120px]',
        render: (row: GymTrainerSummary) => <StatusBadge value={row.status || 'inactive'} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'w-[220px] text-right',
        render: (row: GymTrainerSummary) => (
          <div className="flex justify-end gap-2">
            <Link
              href={`/gym/trainers/${row.id}`}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View
            </Link>
            <button
              onClick={() => openEdit(row, false)}
              className="rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
            >
              Edit
            </button>
            <button
              onClick={() => setDeleteId(row.id)}
              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        specialization: form.specialization || null,
        experience_years: form.experience_years ? parseInt(form.experience_years, 10) : null,
        certifications: form.certifications || null,
        bio: form.bio || null,
        avatar: form.avatar || null,
        salary: form.salary ? parseFloat(form.salary) : null,
        shift: form.shift || null,
        status: form.status,
      };

      if (editId) {
        await updateGymTrainer(editId, payload);
        toastSuccess('Trainer Updated', 'Trainer details have been updated successfully.');
      } else {
        await createGymTrainer(payload);
        toastSuccess('Trainer Added', 'New trainer has been created successfully.');
      }

      setFormOpen(false);
      setEditId(null);
      setForm({ ...BLANK_FORM });
      await loadTrainers();
    } catch (err) {
      setError(getErrorMessage(err));
      toastError('Action Failed', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await deleteGymTrainer(deleteId);
      toastSuccess('Trainer Deleted', 'The trainer has been removed.');
      setDeleteId(null);
      await loadTrainers();
    } catch (err) {
      setError(getErrorMessage(err));
      toastError('Delete Failed', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !response) return <LoadingState />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Trainers"
        description="Manage gym trainers. Trainers added here also appear on the public website."
        actions={
          <button
            type="button"
            onClick={() => {
              setViewMode(false);
              setEditId(null);
              setForm({ ...BLANK_FORM });
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Search">
            <TextInput
              placeholder="Search by name or email..."
              value={query.q}
              onChange={(e) => setQuery({ ...query, q: e.target.value, page: 1 })}
              className="bg-slate-900 text-white border-slate-700 placeholder:text-slate-500"
            />
          </Field>
          <Field label="Status">
            <SelectInput
              value={query.status}
              onChange={(e) => setQuery({ ...query, status: e.target.value, page: 1 })}
              className="bg-slate-900 text-white border-slate-700"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </SelectInput>
          </Field>
        </div>
      </div>

      {response && (
        <div className="space-y-6">
          <DataTable<GymTrainerSummary>
            columns={columns}
            data={response.data}
            rowKey={(item) => item.id.toString()}
            emptyTitle="No trainers found"
            emptyDescription="Add trainers via the 'Add Trainer' button or from the Website Builder."
            mobileRender={(row) => (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden bg-slate-900/5 text-sm font-semibold text-slate-900 shrink-0">
                    {row.avatar
                      ? <img src={row.avatar} alt="" className="w-full h-full object-cover" />
                      : getInitials(row.user?.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-900">{row.user?.name || 'N/A'}</div>
                    <div className="truncate text-sm text-[color:var(--app-muted)]">
                      {row.specialization || 'N/A'} {row.experience_years ? `• ${row.experience_years} yrs` : ''}
                    </div>
                  </div>
                </div>
                <div><StatusBadge value={row.status || 'inactive'} /></div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    href={`/gym/trainers/${row.id}`}
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 text-center"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => openEdit(row, false)}
                    className="flex-1 rounded-xl border border-sky-200 bg-sky-50 py-2.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                  >Edit</button>
                  <button
                    onClick={() => setDeleteId(row.id)}
                    className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                  >Delete</button>
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
        onClose={() => { setFormOpen(false); setEditId(null); setViewMode(false); }}
        title={viewMode ? 'View Trainer' : editId ? 'Edit Trainer' : 'Add Trainer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-6">
            <ImageUpload
              value={form.avatar}
              onChange={(url) => setForm({ ...form, avatar: url })}
              label="Profile Picture"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name *">
              <TextInput
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="e.g. John Doe"
                required
                disabled={viewMode}
              />
            </Field>
            <Field label="Email *">
              <TextInput
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="trainer@gym.com"
                required
                disabled={viewMode}
              />
            </Field>
            <Field label="Phone">
              <TextInput
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
                disabled={viewMode}
              />
            </Field>
            <Field label="Specialization">
              <TextInput
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                placeholder="e.g. Yoga, Weightlifting"
                disabled={viewMode}
              />
            </Field>
            <Field label="Experience (Years)">
              <TextInput
                type="number"
                value={form.experience_years}
                onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                placeholder="e.g. 5"
                disabled={viewMode}
              />
            </Field>
            <Field label="Certifications">
              <TextInput
                value={form.certifications}
                onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                placeholder="e.g. ACE, NASM"
                disabled={viewMode}
              />
            </Field>
            <Field label="Shift / Timing">
              <TextInput
                value={form.shift}
                onChange={(e) => setForm({ ...form, shift: e.target.value })}
                placeholder="e.g. 9 AM - 6 PM"
                disabled={viewMode}
              />
            </Field>
            <Field label="Salary (monthly)">
              <TextInput
                type="number"
                step="0.01"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="Monthly salary"
                disabled={viewMode}
              />
            </Field>
            <Field label="Bio">
              <TextInput
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Short biography"
                disabled={viewMode}
              />
            </Field>
            <Field label="Status">
              <SelectInput
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                required
                disabled={viewMode}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </SelectInput>
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => { setFormOpen(false); setEditId(null); setViewMode(false); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {viewMode ? 'Close' : 'Cancel'}
            </button>
            {!viewMode && (
              <button
                type="submit"
                disabled={submitting || !form.full_name.trim() || !form.email.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editId ? 'Update Trainer' : 'Add Trainer'}
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Trainer"
        description="Are you sure you want to delete this trainer? They will be removed from all sessions and the public website."
        confirmLabel="Delete"
      />
    </div>
  );
}
