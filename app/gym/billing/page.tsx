'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import { Field, SelectInput, TextInput, TextareaInput } from '@/components/admin/fields';
import { LoadingState } from '@/components/admin/loading-state';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/admin/pagination';
import { StatusBadge } from '@/components/admin/status-badge';
import {
  createGymBillingPayment,
  getGymBillingDashboard,
  getGymBillingInvoices,
  getGymBillingPayments,
  getGymMember,
  getGymMembers,
  type CreateGymBillingPaymentPayload,
  type GymBillingDashboard,
  type GymBillingInvoice,
  type GymBillingPayment,
  type GymMemberMembershipSummary,
  type GymMemberSummary,
  type GymPaymentMethod,
  type GymPaymentStatus,
  type PaginatedResponse,
} from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';
import { useToast } from '@/components/admin/toast';

type PaymentQuery = {
  start_date: string;
  end_date: string;
  payment_status: string;
  payment_method: string;
  q: string;
  page: number;
};

type PaymentForm = {
  member_id: string;
  membership_id: string;
  amount: string;
  discount: string;
  payment_method: GymPaymentMethod;
  payment_status: GymPaymentStatus;
  transaction_id: string;
  paid_at: string;
  notes: string;
};

const paymentMethods: Array<{ value: GymPaymentMethod; label: string }> = [
  { value: 'cash', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'online', label: 'Online' },
];

const paymentStatuses: Array<{ value: GymPaymentStatus; label: string }> = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

const emptyForm = (): PaymentForm => ({
  member_id: '',
  membership_id: '',
  amount: '',
  discount: '',
  payment_method: 'cash',
  payment_status: 'paid',
  transaction_id: '',
  paid_at: new Date().toISOString().slice(0, 16),
  notes: '',
});

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debounced;
}

function formatCurrency(amount?: string | number | null) {
  if (amount === null || amount === undefined || amount === '') return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
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

function methodLabel(method?: string | null) {
  return paymentMethods.find((option) => option.value === method)?.label ?? method ?? '-';
}

function MetricTile({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: 'sky' | 'emerald' | 'amber' | 'rose';
}) {
  const toneClass = {
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
  }[tone];

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClass}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 text-sm opacity-80">{detail}</div>
    </div>
  );
}

export default function GymBillingPage() {
  const [query, setQuery] = useState<PaymentQuery>({
    start_date: '',
    end_date: '',
    payment_status: '',
    payment_method: '',
    q: '',
    page: 1,
  });
  const debouncedQ = useDebouncedValue(query.q, 350);
  const { success, error: toastError } = useToast();

  const [dashboard, setDashboard] = useState<GymBillingDashboard | null>(null);
  const [payments, setPayments] = useState<PaginatedResponse<GymBillingPayment> | null>(null);
  const [invoices, setInvoices] = useState<PaginatedResponse<GymBillingInvoice> | null>(null);
  const [members, setMembers] = useState<GymMemberSummary[]>([]);
  const [selectedMember, setSelectedMember] = useState<GymMemberSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
      const [form, setForm] = useState<PaymentForm>(() => emptyForm());

  const membershipOptions = useMemo(() => {
    const memberships = new Map<number, GymMemberMembershipSummary>();

    if (selectedMember?.active_membership) {
      memberships.set(selectedMember.active_membership.id, selectedMember.active_membership);
    }

    selectedMember?.membership_history?.forEach((membership) => {
      memberships.set(membership.id, membership);
    });

    return Array.from(memberships.values());
  }, [selectedMember]);

  const finalAmount = useMemo(() => {
    const amount = Number(form.amount || 0);
    const discount = Number(form.discount || 0);
    return Math.max(0, amount - discount);
  }, [form.amount, form.discount]);

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const memberResponse = (await getGymMembers({ page: 1, per_page: 100, status: 'active' })) as PaginatedResponse<GymMemberSummary>;
      setMembers(memberResponse.data ?? []);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  const loadBilling = useCallback(async () => {
    setLoading(true);
        try {
      const [dashboardResponse, paymentsResponse, invoicesResponse] = await Promise.all([
        getGymBillingDashboard(),
        getGymBillingPayments({
          start_date: query.start_date || null,
          end_date: query.end_date || null,
          payment_status: query.payment_status || null,
          payment_method: query.payment_method || null,
          q: debouncedQ || null,
          page: query.page,
          per_page: 15,
        }),
        getGymBillingInvoices({ per_page: 6 }),
      ]);

      setDashboard((dashboardResponse as { data: GymBillingDashboard }).data);
      setPayments(paymentsResponse as PaginatedResponse<GymBillingPayment>);
      setInvoices(invoicesResponse as PaginatedResponse<GymBillingInvoice>);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, query.end_date, query.page, query.payment_method, query.payment_status, query.start_date]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOptions();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadOptions]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadBilling();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadBilling]);

  useEffect(() => {
    if (!form.member_id) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = (await getGymMember(Number(form.member_id))) as { data: GymMemberSummary };
        if (!cancelled) setSelectedMember(response.data);
      } catch (err) {
        if (!cancelled) toastError(getErrorMessage(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form.member_id]);

  const columns = useMemo<Array<DataTableColumn<GymBillingPayment>>>(
    () => [
      {
        id: 'member',
        header: 'Member',
        className: 'min-w-[250px]',
        render: (payment) => (
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900/5 text-sm font-semibold text-slate-900">
              {initials(payment.member?.name)}
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-slate-900">{payment.member?.name ?? 'Member'}</div>
              <div className="truncate text-sm text-[color:var(--app-muted)]">{payment.invoice?.invoice_number ?? '-'}</div>
            </div>
          </div>
        ),
      },
      {
        id: 'amount',
        header: 'Amount',
        className: 'w-[170px]',
        render: (payment) => (
          <div>
            <div className="font-semibold text-slate-900">{formatCurrency(payment.final_amount)}</div>
            <div className="text-xs text-[color:var(--app-muted)]">Discount {formatCurrency(payment.discount)}</div>
          </div>
        ),
      },
      {
        id: 'method',
        header: 'Method',
        className: 'w-[130px]',
        render: (payment) => <span className="font-medium text-slate-900">{methodLabel(payment.payment_method)}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        className: 'w-[130px]',
        render: (payment) => <StatusBadge value={payment.payment_status} />,
      },
      {
        id: 'date',
        header: 'Date',
        className: 'w-[170px]',
        render: (payment) => <span className="text-sm text-[color:var(--app-muted)]">{formatDateTime(payment.paid_at ?? payment.created_at)}</span>,
      },
    ],
    []
  );

  function updateQuery(patch: Partial<PaymentQuery>) {
    setQuery((current) => ({
      ...current,
      ...patch,
      page: patch.page ?? 1,
    }));
  }

  function handleMembershipChange(membershipId: string) {
    const membership = membershipOptions.find((item) => String(item.id) === membershipId);

    setForm((current) => ({
      ...current,
      membership_id: membershipId,
      amount: membership?.final_amount ? String(membership.final_amount) : current.amount,
      discount: membershipId ? '0' : current.discount,
    }));
  }

  function payloadFromForm(): CreateGymBillingPaymentPayload {
    return {
      member_id: Number(form.member_id),
      membership_id: form.membership_id ? Number(form.membership_id) : null,
      amount: Number(form.amount || 0),
      discount: Number(form.discount || 0),
      payment_method: form.payment_method,
      payment_status: form.payment_status,
      transaction_id: form.transaction_id.trim() || null,
      paid_at: form.payment_status === 'paid' && form.paid_at ? new Date(form.paid_at).toISOString() : null,
      notes: form.notes.trim() || null,
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setSubmitting(true);
        
    try {
      await createGymBillingPayment(payloadFromForm());
      success('Payment recorded and invoice status updated.');
      setForm(emptyForm());
      setSelectedMember(null);
      await loadBilling();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !payments) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Revenue"
        title="Billing and Payments"
        description="Record member payments, track invoices, and monitor gym revenue."
        actions={
          <button
            type="button"
            onClick={() => void loadBilling()}
            className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-600"
          >
            Refresh
          </button>
        }
      />

      

      

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Total Revenue" value={formatCurrency(dashboard?.total_revenue ?? 0)} detail="Collected member payments" tone="emerald" />
        <MetricTile label="Today Revenue" value={formatCurrency(dashboard?.today_revenue ?? 0)} detail="Paid today" tone="sky" />
        <MetricTile label="Pending" value={formatCurrency(dashboard?.pending_payments ?? 0)} detail={`${dashboard?.unpaid_invoices ?? 0} unpaid invoices`} tone="amber" />
        <MetricTile label="Monthly Revenue" value={formatCurrency(dashboard?.monthly_revenue ?? 0)} detail={`Overdue ${formatCurrency(dashboard?.overdue_amount ?? 0)}`} tone="rose" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-[color:var(--app-text)]">Record Payment</h2>
            <p className="mt-1 text-sm text-[color:var(--app-muted)]">Link payments to memberships when the payment belongs to a plan cycle.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Member">
                <SelectInput
                  value={form.member_id}
                  onChange={(event) => {
                    setSelectedMember(null);
                    setForm({ ...form, member_id: event.target.value, membership_id: '', amount: '' });
                  }}
                  disabled={optionsLoading || submitting}
                  required
                >
                  <option value="">Select member</option>
                  {members.map((member) => (
                    <option key={member.id} value={String(member.id)}>
                      {member.name ?? 'Member'}{member.phone ? ` - ${member.phone}` : ''}
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <Field label="Membership">
                <SelectInput
                  value={form.membership_id}
                  onChange={(event) => handleMembershipChange(event.target.value)}
                  disabled={!form.member_id || submitting}
                >
                  <option value="">No membership link</option>
                  {membershipOptions.map((membership) => (
                    <option key={membership.id} value={String(membership.id)}>
                      {membership.plan?.name ?? 'Membership'} ({membership.start_date ?? '-'} to {membership.end_date ?? '-'})
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <Field label="Amount">
                <TextInput
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => setForm({ ...form, amount: event.target.value })}
                  required
                />
              </Field>

              <Field label="Discount">
                <TextInput
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount}
                  onChange={(event) => setForm({ ...form, discount: event.target.value })}
                />
              </Field>

              <Field label="Paid At">
                <TextInput
                  type="datetime-local"
                  value={form.paid_at}
                  onChange={(event) => setForm({ ...form, paid_at: event.target.value })}
                  disabled={form.payment_status !== 'paid'}
                />
              </Field>

              <Field label="Transaction ID">
                <TextInput
                  value={form.transaction_id}
                  onChange={(event) => setForm({ ...form, transaction_id: event.target.value })}
                  placeholder="Optional"
                />
              </Field>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.2fr]">
              <Field label="Method">
                <div className="grid grid-cols-4 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-1">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setForm({ ...form, payment_method: method.value })}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        form.payment_method === method.value
                          ? 'bg-slate-950 text-white shadow-sm'
                          : 'text-[color:var(--app-muted)] hover:bg-black/5 hover:text-[color:var(--app-text)]'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Status">
                <div className="grid grid-cols-3 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-1">
                  {paymentStatuses.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setForm({ ...form, payment_status: status.value })}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        form.payment_status === status.value
                          ? 'bg-slate-950 text-white shadow-sm'
                          : 'text-[color:var(--app-muted)] hover:bg-black/5 hover:text-[color:var(--app-text)]'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Notes">
                <TextareaInput
                  value={form.notes}
                  onChange={(event) => setForm({ ...form, notes: event.target.value })}
                  placeholder="Receipt notes, gateway response, or front-desk context"
                  className="min-h-[48px]"
                />
              </Field>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--app-muted)]">Final Amount</div>
                <div className="mt-1 text-2xl font-semibold text-[color:var(--app-text)]">{formatCurrency(finalAmount)}</div>
              </div>
              <button
                type="submit"
                disabled={submitting || !form.member_id || !form.amount || Number(form.discount || 0) > Number(form.amount || 0)}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.24)] transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>

        <aside className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-[color:var(--app-text)]">Invoice Watchlist</h2>
            <p className="mt-1 text-sm text-[color:var(--app-muted)]">Auto-generated from memberships and updated by payments.</p>
          </div>

          <div className="space-y-3">
            {invoices?.data.length ? (
              invoices.data.map((invoice) => (
                <div key={invoice.id} className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[color:var(--app-text)]">{invoice.member?.name ?? 'Member'}</div>
                      <div className="mt-1 truncate text-xs text-[color:var(--app-muted)]">{invoice.invoice_number ?? '-'}</div>
                    </div>
                    <StatusBadge value={invoice.status} />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <span className="text-[color:var(--app-muted)]">Due {invoice.due_date ?? '-'}</span>
                    <span className="font-semibold text-[color:var(--app-text)]">{formatCurrency(invoice.final_amount)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[color:var(--app-muted)]">No invoices found.</p>
            )}
          </div>
        </aside>
      </section>

      <section className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Start Date">
            <TextInput type="date" value={query.start_date} onChange={(event) => updateQuery({ start_date: event.target.value })} />
          </Field>
          <Field label="End Date">
            <TextInput type="date" value={query.end_date} onChange={(event) => updateQuery({ end_date: event.target.value })} />
          </Field>
          <Field label="Status">
            <SelectInput value={query.payment_status} onChange={(event) => updateQuery({ payment_status: event.target.value })}>
              <option value="">All status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </SelectInput>
          </Field>
          <Field label="Method">
            <SelectInput value={query.payment_method} onChange={(event) => updateQuery({ payment_method: event.target.value })}>
              <option value="">All methods</option>
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Search">
            <TextInput value={query.q} onChange={(event) => updateQuery({ q: event.target.value })} placeholder="Member or invoice" />
          </Field>
        </div>
      </section>

      {payments ? (
        <div className="space-y-6">
          <DataTable<GymBillingPayment>
            data={payments.data}
            columns={columns}
            rowKey={(payment) => String(payment.id)}
            emptyTitle="No payments found"
            emptyDescription="Record a payment or adjust the filters."
            mobileRender={(payment) => (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900/5 text-sm font-semibold text-slate-900">
                    {initials(payment.member?.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-900">{payment.member?.name ?? 'Member'}</div>
                    <div className="truncate text-sm text-[color:var(--app-muted)]">{payment.invoice?.invoice_number ?? '-'}</div>
                  </div>
                  <StatusBadge value={payment.payment_status} />
                </div>

                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[color:var(--app-muted)]">Amount</span>
                    <span className="font-medium text-slate-900">{formatCurrency(payment.final_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[color:var(--app-muted)]">Method</span>
                    <span className="font-medium text-slate-900">{methodLabel(payment.payment_method)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[color:var(--app-muted)]">Date</span>
                    <span className="font-medium text-slate-900">{formatDateTime(payment.paid_at ?? payment.created_at)}</span>
                  </div>
                </div>

                {payment.notes ? (
                  <div className="rounded-xl border border-[color:var(--app-border)] bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {payment.notes}
                  </div>
                ) : null}
              </div>
            )}
          />

          <Pagination meta={payments.meta} onPageChange={(page) => updateQuery({ page })} />
        </div>
      ) : null}
    </div>
  );
}
