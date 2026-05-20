'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/data-table';
import { Field, SelectInput, TextInput } from '@/components/admin/fields';
import { LoadingState } from '@/components/admin/loading-state';
import { Pagination } from '@/components/admin/pagination';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatCard } from '@/components/admin/stat-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { PrimitiveQuery, useListQuery } from '@/hooks/use-list-query';
import { getErrorMessage } from '@/lib/errors';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { getPayments, ListQuery, PaymentSummary } from '@/lib/super-admin';

type PaymentsQuery = ListQuery & PrimitiveQuery;

function providerLabel(method: string | null | undefined) {
  if (!method) return 'N/A';
  return method.replaceAll('_', ' ');
}

export default function SuperAdminPaymentsPage() {
  const { query, updateQuery } = useListQuery<PaymentsQuery>({
    page: 1,
    per_page: 10,
    search: '',
    status: '',
    payment_method: '',
    tenant_id: '',
    date_from: '',
    date_to: '',
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const [response, setResponse] = useState<Awaited<ReturnType<typeof getPayments>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    requestAnimationFrame(() => {
      if (mounted) {
        setLoading(true);
        setError(null);
      }
    });

    getPayments(query)
      .then((payload) => {
        if (mounted) setResponse(payload);
      })
      .catch((fetchError) => {
        if (mounted) setError(getErrorMessage(fetchError, 'Failed to load platform payments'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [query]);

  const filters = response?.filters;
  const summary = response?.summary;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Super Admin"
        title="Platform Payments"
        description="Stripe, Razorpay, and manual SaaS subscription payments. Member billing is excluded from this ledger."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(summary?.total_revenue ?? 0)} hint="Paid platform subscription payments" accent="emerald" icon={<DashboardIcon name="payments" className="h-5 w-5" />} />
        <StatCard label="Today Revenue" value={formatCurrency(summary?.today_revenue ?? 0)} hint="Paid SaaS revenue today" accent="emerald" icon={<DashboardIcon name="reports" className="h-5 w-5" />} />
        <StatCard label="Failed Payments" value={String(summary?.failed_payments ?? 0)} hint="Failed platform charges" accent="amber" icon={<DashboardIcon name="alert-circle" className="h-5 w-5" />} />
        <StatCard label="Successful Payments" value={String(summary?.successful_payments ?? 0)} hint="Paid platform transactions" icon={<DashboardIcon name="check-circle" className="h-5 w-5" />} />
      </section>

      <section className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-6">
          <Field label="Search">
            <TextInput
              value={String(query.search ?? '')}
              onChange={(event) => updateQuery({ search: event.target.value, page: 1 })}
              placeholder="Transaction, method, gym"
            />
          </Field>

          <Field label="Status">
            <SelectInput value={String(query.status ?? '')} onChange={(event) => updateQuery({ status: event.target.value, page: 1 })}>
              <option value="">All statuses</option>
              {filters?.statuses.map((status) => (
                <option key={`payment-status-${status}`} value={status}>
                  {status}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Method">
            <SelectInput value={String(query.payment_method ?? '')} onChange={(event) => updateQuery({ payment_method: event.target.value, page: 1 })}>
              <option value="">All methods</option>
              {filters?.payment_methods.map((method) => (
                <option key={`payment-method-${method}`} value={method}>
                  {providerLabel(method)}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Gym">
            <SelectInput value={String(query.tenant_id ?? '')} onChange={(event) => updateQuery({ tenant_id: event.target.value, page: 1 })}>
              <option value="">All gyms</option>
              {filters?.gyms.map((gym) => (
                <option key={`payment-gym-${gym.id}`} value={gym.id}>
                  {gym.name}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="From">
            <TextInput type="date" value={String(query.date_from ?? '')} onChange={(event) => updateQuery({ date_from: event.target.value, page: 1 })} />
          </Field>

          <Field label="To">
            <TextInput type="date" value={String(query.date_to ?? '')} onChange={(event) => updateQuery({ date_to: event.target.value, page: 1 })} />
          </Field>
        </div>
      </section>

      {loading ? <LoadingState label="Loading platform payments..." /> : null}
      {error ? <LoadingState label={error} /> : null}

      {!loading && !error && response ? (
        <>
          <DataTable
            data={response.data}
            rowKey={(payment) => `payment-${payment.id}`}
            emptyTitle="No platform payments found"
            emptyDescription="Adjust filters or wait for Stripe/Razorpay subscription payments to arrive."
            mobileRender={(payment) => <PaymentMobileCard payment={payment} />}
            columns={[
              {
                id: 'gym',
                header: 'Gym',
                render: (payment) => (
                  <div>
                    <p className="font-semibold text-[color:var(--app-text)]">{payment.gym.name || 'Unknown gym'}</p>
                    <p className="mt-1 text-xs text-[color:var(--app-muted)]">{payment.subscription.plan_name || 'No plan'}</p>
                  </div>
                ),
              },
              {
                id: 'amount',
                header: 'Amount',
                render: (payment) => <span className="font-semibold text-[color:var(--app-text)]">{formatCurrency(payment.amount)}</span>,
              },
              {
                id: 'method',
                header: 'Method',
                render: (payment) => <span className="capitalize text-[color:var(--app-muted)]">{providerLabel(payment.payment_method)}</span>,
              },
              {
                id: 'status',
                header: 'Status',
                render: (payment) => <StatusBadge value={payment.payment_status} />,
              },
              {
                id: 'transaction',
                header: 'Transaction ID',
                render: (payment) => <span className="font-mono text-xs text-[color:var(--app-muted)]">{payment.transaction_id || 'N/A'}</span>,
              },
              {
                id: 'created',
                header: 'Created',
                render: (payment) => <span className="text-sm text-[color:var(--app-muted)]">{formatDateTime(payment.created_at)}</span>,
              },
              {
                id: 'actions',
                header: '',
                render: (payment) => (
                  <Link href={`/super-admin/payments/${payment.id}`} className="text-sm font-medium text-sky-600 hover:text-sky-700">
                    View
                  </Link>
                ),
              },
            ]}
          />

          <Pagination meta={response.meta} onPageChange={(page) => updateQuery({ page })} />
        </>
      ) : null}
    </div>
  );
}

function PaymentMobileCard({ payment }: { payment: PaymentSummary }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[color:var(--app-text)]">{payment.gym.name || 'Unknown gym'}</p>
          <p className="mt-1 text-sm text-[color:var(--app-muted)]">{payment.subscription.plan_name || 'No plan'}</p>
        </div>
        <StatusBadge value={payment.payment_status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-[color:var(--app-muted)]">
        <div>Amount: <span className="font-semibold text-[color:var(--app-text)]">{formatCurrency(payment.amount)}</span></div>
        <div className="capitalize">Method: {providerLabel(payment.payment_method)}</div>
        <div>Created: {formatDateTime(payment.created_at)}</div>
        <div className="truncate">Txn: {payment.transaction_id || 'N/A'}</div>
      </div>

      <Link href={`/super-admin/payments/${payment.id}`} className="inline-flex rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-white">
        View transaction
      </Link>
    </div>
  );
}
