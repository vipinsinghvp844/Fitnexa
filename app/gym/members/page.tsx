'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { DataTable } from '@/components/admin/data-table';
import { Field, SelectInput, TextInput, TextareaInput } from '@/components/admin/fields';
import { LoadingState } from '@/components/admin/loading-state';
import { Modal } from '@/components/admin/modal';
import { Pagination } from '@/components/admin/pagination';
import { StatusBadge } from '@/components/admin/status-badge';
import {
  createGymMember,
  deleteGymMember,
  getGymMembers,
  getGymMembershipPlans,
  getGymTrainers,
  updateGymMember,
  type CreateGymMemberPayload,
  type GymMemberSummary,
  type GymMembershipPlanSummary,
  type GymTrainerSummary,
  type PaginatedResponse,
} from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';

type Gender = 'male' | 'female' | 'other';
type MemberStatus = 'active' | 'inactive' | 'suspended';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

type MemberForm = {
  name: string;
  email: string;
  phone: string;
  gender: Gender | '';
  dob: string;
  address: string;
  emergency_contact: string;
  joining_date: string;
  membership_plan_id: string;
  assigned_trainer_id: string;
  status: MemberStatus;
  payment_status: PaymentStatus;
  final_amount: string;
};

const emptyForm = (): MemberForm => ({
  name: '',
  email: '',
  phone: '',
  gender: '',
  dob: '',
  address: '',
  emergency_contact: '',
  joining_date: new Date().toISOString().slice(0, 10),
  membership_plan_id: '',
  assigned_trainer_id: '',
  status: 'active',
  payment_status: 'paid',
  final_amount: '',
});

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debounced;
}

function initials(name?: string | null) {
  if (!name) return 'M';
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function formatCurrency(amount?: string | number | null) {
  if (amount === null || amount === undefined || amount === '') return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function memberToForm(member: GymMemberSummary): MemberForm {
  return {
    name: member.name ?? '',
    email: member.email ?? '',
    phone: member.phone ?? '',
    gender: member.gender ?? '',
    dob: member.dob ?? '',
    address: member.address ?? '',
    emergency_contact: member.emergency_contact ?? '',
    joining_date: member.joining_date ?? new Date().toISOString().slice(0, 10),
    membership_plan_id: member.membership_plan_id ? String(member.membership_plan_id) : '',
    assigned_trainer_id: member.assigned_trainer_id ? String(member.assigned_trainer_id) : '',
    status: member.status ?? 'active',
    payment_status: member.active_membership?.payment_status ?? 'paid',
    final_amount: member.active_membership?.final_amount ? String(member.active_membership.final_amount) : '',
  };
}

export default function GymMembersPage() {
  const [query, setQuery] = useState({
    q: '',
    status: '',
    gender: '',
    page: 1,
  });
  const debouncedQ = useDebouncedValue(query.q, 350);

  const [response, setResponse] = useState<PaginatedResponse<GymMemberSummary> | null>(null);
  const [plans, setPlans] = useState<GymMembershipPlanSummary[]>([]);
  const [trainers, setTrainers] = useState<GymTrainerSummary[]>([]);

  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<MemberForm>(() => emptyForm());
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const [planResponse, trainerResponse] = await Promise.all([
        getGymMembershipPlans({ page: 1 }),
        getGymTrainers({ page: 1 }),
      ]);

      setPlans((planResponse as PaginatedResponse<GymMembershipPlanSummary>).data ?? []);
      setTrainers((trainerResponse as PaginatedResponse<GymTrainerSummary>).data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const memberResponse = (await getGymMembers({
        q: debouncedQ,
        status: query.status || null,
        gender: query.gender || null,
        page: query.page,
      })) as PaginatedResponse<GymMemberSummary>;

      setResponse(memberResponse);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, query.gender, query.page, query.status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOptions();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadOptions]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMembers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadMembers]);

  const columns = useMemo(
    () => [
      {
        id: 'member',
        header: 'Member',
        className: 'min-w-[260px]',
        render: (member: GymMemberSummary) => (
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900/5 text-sm font-semibold text-slate-900">
              {initials(member.name)}
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-slate-900">{member.name}</div>
              <div className="truncate text-sm text-[color:var(--app-muted)]">{member.email}</div>
            </div>
          </div>
        ),
      },
      {
        id: 'phone',
        header: 'Phone',
        className: 'w-[150px]',
        render: (member: GymMemberSummary) => <span>{member.phone}</span>,
      },
      {
        id: 'plan',
        header: 'Membership',
        className: 'w-[210px]',
        render: (member: GymMemberSummary) => (
          <div>
            <div className="font-medium text-slate-900">{member.membership_plan?.name ?? 'No plan'}</div>
            <div className="text-xs text-[color:var(--app-muted)]">
              {member.active_membership ? `${member.active_membership.end_date ?? '-'} · ${formatCurrency(member.active_membership.final_amount)}` : '-'}
            </div>
          </div>
        ),
      },
      {
        id: 'trainer',
        header: 'Trainer',
        className: 'w-[180px]',
        render: (member: GymMemberSummary) => <span>{member.assigned_trainer?.user.name ?? '-'}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        className: 'w-[120px]',
        render: (member: GymMemberSummary) => <StatusBadge value={member.status ?? 'inactive'} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'w-[230px] text-right',
        render: (member: GymMemberSummary) => (
          <div className="flex justify-end gap-2">
            <Link
              href={`/gym/members/${member.id}`}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View
            </Link>
            <button
              type="button"
              onClick={() => {
                setEditId(member.id);
                setForm(memberToForm(member));
                setFormOpen(true);
              }}
              className="rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setDeleteId(member.id)}
              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  function payloadFromForm(): CreateGymMemberPayload {
    return {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      gender: form.gender || null,
      dob: form.dob || null,
      address: form.address || null,
      emergency_contact: form.emergency_contact || null,
      joining_date: form.joining_date,
      status: form.status,
      membership_plan_id: form.membership_plan_id ? Number(form.membership_plan_id) : null,
      assigned_trainer_id: form.assigned_trainer_id ? Number(form.assigned_trainer_id) : null,
      payment_status: form.payment_status,
      final_amount: form.final_amount ? Number(form.final_amount) : null,
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editId) {
        await updateGymMember(editId, payloadFromForm());
      } else {
        await createGymMember(payloadFromForm());
      }

      setFormOpen(false);
      setEditId(null);
      setForm(emptyForm());
      await loadMembers();
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
      await deleteGymMember(deleteId);
      setDeleteId(null);
      await loadMembers();
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
        title="Members"
        description="Manage member profiles, active memberships, and trainer assignment."
        actions={
          <button
            type="button"
            disabled={optionsLoading}
            onClick={() => {
              setEditId(null);
              setForm(emptyForm());
              setFormOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(14,165,233,0.28)] transition hover:-translate-y-0.5 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add Member
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-slate-100 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Search">
            <TextInput
              placeholder="Name, email, or phone..."
              value={query.q}
              onChange={(event) => setQuery({ ...query, q: event.target.value, page: 1 })}
              className="border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
            />
          </Field>
          <Field label="Status">
            <SelectInput
              value={query.status}
              onChange={(event) => setQuery({ ...query, status: event.target.value, page: 1 })}
              className="border-slate-700 bg-slate-900 text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </SelectInput>
          </Field>
          <Field label="Gender">
            <SelectInput
              value={query.gender}
              onChange={(event) => setQuery({ ...query, gender: event.target.value, page: 1 })}
              className="border-slate-700 bg-slate-900 text-white"
            >
              <option value="">All Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </SelectInput>
          </Field>
        </div>
      </div>

      {response && (
        <div className="space-y-6">
          <DataTable<GymMemberSummary>
            data={response.data}
            columns={columns}
            rowKey={(member) => String(member.id)}
            emptyTitle="No members found"
            emptyDescription="Create a member to start tracking membership and trainer assignment."
            mobileRender={(member) => (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900/5 text-sm font-semibold text-slate-900">
                    {initials(member.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-900">{member.name}</div>
                    <div className="truncate text-sm text-[color:var(--app-muted)]">{member.email}</div>
                  </div>
                  <StatusBadge value={member.status ?? 'inactive'} />
                </div>

                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[color:var(--app-muted)]">Phone</span>
                    <span className="font-medium text-slate-900">{member.phone}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[color:var(--app-muted)]">Membership</span>
                    <span className="font-medium text-slate-900">{member.membership_plan?.name ?? 'No plan'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[color:var(--app-muted)]">Trainer</span>
                    <span className="font-medium text-slate-900">{member.assigned_trainer?.user.name ?? '-'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    href={`/gym/members/${member.id}`}
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-center text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(member.id);
                      setForm(memberToForm(member));
                      setFormOpen(true);
                    }}
                    className="flex-1 rounded-xl border border-sky-200 bg-sky-50 py-2.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(member.id)}
                    className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          />

          <Pagination meta={response.meta} onPageChange={(page) => setQuery({ ...query, page })} />
        </div>
      )}

      <Modal
        open={formOpen}
        title={editId ? 'Edit Member' : 'Add Member'}
        onClose={() => {
          if (!submitting) {
            setFormOpen(false);
            setEditId(null);
          }
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Name">
              <TextInput value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </Field>
            <Field label="Email">
              <TextInput type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </Field>
            <Field label="Phone">
              <TextInput value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
            </Field>
            <Field label="Gender">
              <SelectInput value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as Gender | '' })}>
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </SelectInput>
            </Field>
            <Field label="Date of Birth">
              <TextInput type="date" value={form.dob} onChange={(event) => setForm({ ...form, dob: event.target.value })} />
            </Field>
            <Field label="Joining Date">
              <TextInput type="date" value={form.joining_date} onChange={(event) => setForm({ ...form, joining_date: event.target.value })} required />
            </Field>
            <Field label="Membership Plan">
              <SelectInput value={form.membership_plan_id} onChange={(event) => setForm({ ...form, membership_plan_id: event.target.value })}>
                <option value="">No plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={String(plan.id)}>
                    {plan.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Assigned Trainer">
              <SelectInput value={form.assigned_trainer_id} onChange={(event) => setForm({ ...form, assigned_trainer_id: event.target.value })}>
                <option value="">No trainer</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={String(trainer.id)}>
                    {trainer.user.name ?? 'Trainer'}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Status">
              <SelectInput value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as MemberStatus })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </SelectInput>
            </Field>
            <Field label="Payment Status">
              <SelectInput value={form.payment_status} onChange={(event) => setForm({ ...form, payment_status: event.target.value as PaymentStatus })}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </SelectInput>
            </Field>
            <Field label="Final Amount">
              <TextInput type="number" min="0" step="0.01" value={form.final_amount} onChange={(event) => setForm({ ...form, final_amount: event.target.value })} />
            </Field>
            <Field label="Emergency Contact">
              <TextInput value={form.emergency_contact} onChange={(event) => setForm({ ...form, emergency_contact: event.target.value })} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Address">
                <TextareaInput value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
              </Field>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditId(null);
              }}
              disabled={submitting}
              className="rounded-2xl border border-[color:var(--app-border)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.joining_date}
              className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Member"
        description="This member profile will be removed from the active member list."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => {
          if (!submitting) setDeleteId(null);
        }}
      />
    </div>
  );
}
