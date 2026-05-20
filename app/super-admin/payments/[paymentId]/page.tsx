'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatCard } from '@/components/admin/stat-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { getErrorMessage } from '@/lib/errors';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { getPayment, PaymentSummary } from '@/lib/super-admin';

interface PaymentDetailPageProps {
  params: {
    paymentId: string;
  };
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--app-muted)]">{label}</p>
      <p className="mt-2 break-words text-sm font-medium text-[color:var(--app-text)]">{value || 'N/A'}</p>
    </div>
  );
}

export default function PaymentDetailPage({ params }: PaymentDetailPageProps) {
  const [payment, setPayment] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPayment(params.paymentId)
      .then((response) => {
        setPayment(response);
      })
      .catch((fetchError) => {
        setError(getErrorMessage(fetchError, 'Failed to load payment'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.paymentId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-[color:var(--app-muted)]">Loading payment...</div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-rose-600">{error || 'Payment not found'}</p>
          <Link href="/super-admin/payments" className="mt-4 inline-block rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700">
            Back to Payments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Platform Transaction"
        title={`Payment #${payment.id}`}
        description={`${payment.gym.name || 'Unknown gym'} - ${payment.subscription.plan_name || 'No plan'}`}
        actions={
          <Link
            href="/super-admin/payments"
            className="inline-flex items-center rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)] transition hover:border-sky-300 hover:text-sky-600"
          >
            Back
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Amount" value={formatCurrency(payment.amount)} hint="Platform subscription charge" accent="emerald" icon={<DashboardIcon name="payments" className="h-5 w-5" />} />
        <StatCard label="Status" value={payment.payment_status} hint="Normalized financial status" icon={<DashboardIcon name="status" className="h-5 w-5" />} />
        <StatCard label="Method" value={payment.payment_method || 'N/A'} hint="Stripe, Razorpay, or manual" icon={<DashboardIcon name="credit-card" className="h-5 w-5" />} />
        <StatCard label="Created" value={formatDate(payment.created_at)} hint="Transaction creation date" icon={<DashboardIcon name="reports" className="h-5 w-5" />} />
      </section>

      <section className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--app-text)]">Transaction Info</h2>
            <p className="mt-2 text-sm text-[color:var(--app-muted)]">Full SaaS billing record tied to a platform subscription invoice.</p>
          </div>
          <StatusBadge value={payment.payment_status} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DetailRow label="Gym" value={payment.gym.name} />
          <DetailRow label="Plan" value={payment.subscription.plan_name} />
          <DetailRow label="Plan Type" value={payment.subscription.plan_type} />
          <DetailRow label="Payment Method" value={payment.payment_method} />
          <DetailRow label="Transaction ID" value={payment.transaction_id} />
          <DetailRow label="Provider Source" value={payment.source} />
          <DetailRow label="Raw Status" value={payment.status} />
          <DetailRow label="Paid At" value={formatDateTime(payment.paid_at)} />
          <DetailRow label="Created At" value={formatDateTime(payment.created_at)} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[color:var(--app-text)]">Invoice</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailRow label="Invoice ID" value={payment.invoice.id} />
            <DetailRow label="Invoice Number" value={payment.invoice.invoice_number} />
            <DetailRow label="Invoice Status" value={payment.invoice.status} />
            <DetailRow label="Due Date" value={formatDate(payment.invoice.due_date)} />
            <DetailRow label="Invoice Amount" value={formatCurrency(payment.invoice.amount ?? payment.amount)} />
            <DetailRow label="Final Amount" value={formatCurrency(payment.invoice.final_amount ?? payment.final_amount)} />
          </div>
        </div>

        <div className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[color:var(--app-text)]">Webhook Data</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--app-muted)]">
            Raw webhook payload storage is not configured in this schema. This record was created from the platform billing flow using the provider transaction ID below.
          </p>
          <div className="mt-5 grid gap-4">
            <DetailRow label="Provider" value={payment.payment_method} />
            <DetailRow label="Transaction ID" value={payment.transaction_id} />
            <DetailRow label="Notes" value={payment.notes} />
          </div>
        </div>
      </section>
    </div>
  );
}
