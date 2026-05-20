'use client';

import { FormEvent, useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/data-table';
import { Field, SelectInput, TextInput } from '@/components/admin/fields';
import { LoadingState } from '@/components/admin/loading-state';
import { Modal } from '@/components/admin/modal';
import { Pagination } from '@/components/admin/pagination';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { PrimitiveQuery, useListQuery } from '@/hooks/use-list-query';
import { getErrorMessage, getValidationErrors } from '@/lib/errors';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  activateCoupon,
  CouponSummary,
  createCoupon,
  deactivateCoupon,
  getCoupons,
  ListQuery,
  updateCoupon,
} from '@/lib/super-admin';

type CouponsQuery = ListQuery & PrimitiveQuery;

const emptyForm = {
  tenant_id: '',
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  max_discount: '',
  valid_from: '',
  valid_to: '',
  usage_limit: '',
  status: 'active',
};

function discountLabel(coupon: CouponSummary) {
  return coupon.discount_type === 'percentage'
    ? `${Number(coupon.discount_value).toFixed(2)}%${coupon.max_discount ? ` up to ${formatCurrency(coupon.max_discount)}` : ''}`
    : formatCurrency(coupon.discount_value);
}

export default function SuperAdminCouponsPage() {
  const { query, updateQuery } = useListQuery<CouponsQuery>({
    page: 1,
    per_page: 10,
    search: '',
    status: '',
    discount_type: '',
    tenant_id: '',
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const [response, setResponse] = useState<Awaited<ReturnType<typeof getCoupons>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CouponSummary | null>(null);

  const loadCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      setResponse(await getCoupons(query));
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, 'Failed to load coupons'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    requestAnimationFrame(() => {
      if (mounted) {
        setLoading(true);
        setError(null);
      }
    });

    getCoupons(query)
      .then((payload) => {
        if (mounted) setResponse(payload);
      })
      .catch((fetchError) => {
        if (mounted) setError(getErrorMessage(fetchError, 'Failed to load coupons'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [query]);

  const filters = response?.filters;

  const toggleStatus = async (coupon: CouponSummary) => {
    try {
      if (coupon.status === 'active') {
        await deactivateCoupon(coupon.id);
      } else {
        await activateCoupon(coupon.id);
      }
      await loadCoupons();
    } catch (toggleError) {
      setError(getErrorMessage(toggleError, 'Failed to update coupon status'));
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Super Admin"
        title="SaaS Coupons"
        description="Create and control platform subscription discounts used during gym checkout."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(14,165,233,0.28)] transition hover:-translate-y-0.5 hover:bg-sky-600"
          >
            Create coupon
          </button>
        }
      />

      <section className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-5">
          <Field label="Search">
            <TextInput value={String(query.search ?? '')} onChange={(event) => updateQuery({ search: event.target.value, page: 1 })} placeholder="Code or gym" />
          </Field>
          <Field label="Status">
            <SelectInput value={String(query.status ?? '')} onChange={(event) => updateQuery({ status: event.target.value, page: 1 })}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </SelectInput>
          </Field>
          <Field label="Type">
            <SelectInput value={String(query.discount_type ?? '')} onChange={(event) => updateQuery({ discount_type: event.target.value, page: 1 })}>
              <option value="">All types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </SelectInput>
          </Field>
          <Field label="Gym">
            <SelectInput value={String(query.tenant_id ?? '')} onChange={(event) => updateQuery({ tenant_id: event.target.value, page: 1 })}>
              <option value="">All gyms</option>
              {filters?.gyms.map((gym) => (
                <option key={`coupon-gym-${gym.id}`} value={gym.id}>{gym.name}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Sort">
            <SelectInput
              value={`${query.sort_by}:${query.sort_direction}`}
              onChange={(event) => {
                const [sortBy, sortDirection] = event.target.value.split(':');
                updateQuery({ sort_by: sortBy, sort_direction: sortDirection as 'asc' | 'desc', page: 1 });
              }}
            >
              <option value="created_at:desc">Newest first</option>
              <option value="valid_to:asc">Expiring first</option>
              <option value="used_count:desc">Most used</option>
              <option value="code:asc">Code A-Z</option>
            </SelectInput>
          </Field>
        </div>
      </section>

      {loading ? <LoadingState label="Loading coupons..." /> : null}
      {error ? <LoadingState label={error} /> : null}

      {!loading && !error && response ? (
        <>
          <DataTable
            data={response.data}
            rowKey={(coupon) => `coupon-${coupon.id}`}
            emptyTitle="No coupons found"
            emptyDescription="Create a coupon to discount SaaS subscription checkout."
            mobileRender={(coupon) => (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-base font-semibold text-[color:var(--app-text)]">{coupon.code}</p>
                    <p className="mt-1 text-sm text-[color:var(--app-muted)]">{coupon.tenant?.name || 'Gym'}</p>
                  </div>
                  <StatusBadge value={coupon.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-[color:var(--app-muted)]">
                  <div>Discount: {discountLabel(coupon)}</div>
                  <div>Used: {coupon.used_count}/{coupon.usage_limit ?? '∞'}</div>
                  <div>Valid until: {formatDate(coupon.valid_to)}</div>
                  <div>{coupon.is_expired ? 'Expired' : 'Valid'}</div>
                </div>
              </div>
            )}
            columns={[
              {
                id: 'code',
                header: 'Coupon',
                render: (coupon) => (
                  <div>
                    <p className="font-mono font-semibold text-[color:var(--app-text)]">{coupon.code}</p>
                    <p className="mt-1 text-xs text-[color:var(--app-muted)]">{coupon.tenant?.name || 'Gym'}</p>
                  </div>
                ),
              },
              {
                id: 'discount',
                header: 'Discount',
                render: (coupon) => <span className="font-semibold text-[color:var(--app-text)]">{discountLabel(coupon)}</span>,
              },
              {
                id: 'usage',
                header: 'Usage',
                render: (coupon) => (
                  <div>
                    <p className="font-medium text-[color:var(--app-text)]">{coupon.used_count}/{coupon.usage_limit ?? '∞'}</p>
                    <p className="mt-1 text-xs text-[color:var(--app-muted)]">successful payments</p>
                  </div>
                ),
              },
              {
                id: 'validity',
                header: 'Validity',
                render: (coupon) => <span className="text-sm text-[color:var(--app-muted)]">{formatDate(coupon.valid_from)} - {formatDate(coupon.valid_to)}</span>,
              },
              {
                id: 'status',
                header: 'Status',
                render: (coupon) => <StatusBadge value={coupon.is_expired ? 'expired' : coupon.status} />,
              },
              {
                id: 'actions',
                header: 'Actions',
                render: (coupon) => (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(coupon);
                        setModalOpen(true);
                      }}
                      className="text-sm font-medium text-sky-600 hover:text-sky-700"
                    >
                      Edit
                    </button>
                    <button type="button" onClick={() => toggleStatus(coupon)} className="text-sm font-medium text-[color:var(--app-text)] hover:text-sky-600">
                      {coupon.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                ),
              },
            ]}
          />

          <Pagination meta={response.meta} onPageChange={(page) => updateQuery({ page })} />
        </>
      ) : null}

      <CouponModal
        open={modalOpen}
        coupon={editing}
        gyms={filters?.gyms ?? []}
        onClose={() => setModalOpen(false)}
        onSuccess={loadCoupons}
      />
    </div>
  );
}

function CouponModal({
  open,
  coupon,
  gyms,
  onClose,
  onSuccess,
}: {
  open: boolean;
  coupon: CouponSummary | null;
  gyms: Array<{ id: number; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => {
      if (coupon) {
        setForm({
          tenant_id: String(coupon.tenant_id),
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: String(coupon.discount_value),
          max_discount: coupon.max_discount ? String(coupon.max_discount) : '',
          valid_from: coupon.valid_from || '',
          valid_to: coupon.valid_to || '',
          usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
          status: coupon.status,
        });
      } else {
        setForm(emptyForm);
      }

      setError(null);
      setErrors({});
    });

    return () => cancelAnimationFrame(frame);
  }, [open, coupon]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setErrors({});

    const payload = {
      tenant_id: Number(form.tenant_id),
      code: form.code,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      max_discount: form.max_discount === '' ? null : Number(form.max_discount),
      valid_from: form.valid_from || null,
      valid_to: form.valid_to,
      usage_limit: form.usage_limit === '' ? null : Number(form.usage_limit),
      status: form.status,
    };

    try {
      if (coupon) {
        await updateCoupon(coupon.id, payload);
      } else {
        await createCoupon(payload);
      }
      await onSuccess();
      onClose();
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Failed to save coupon'));
      setErrors(getValidationErrors(submitError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title={coupon ? 'Edit coupon' : 'Create coupon'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        {error ? <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{error}</div> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Gym" error={errors.tenant_id?.[0]}>
            <SelectInput value={form.tenant_id} onChange={(event) => setForm({ ...form, tenant_id: event.target.value })} required>
              <option value="">Select gym</option>
              {gyms.map((gym) => <option key={`modal-gym-${gym.id}`} value={gym.id}>{gym.name}</option>)}
            </SelectInput>
          </Field>
          <Field label="Code" error={errors.code?.[0]}>
            <TextInput value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="SAVE20" required />
          </Field>
          <Field label="Type" error={errors.discount_type?.[0]}>
            <SelectInput value={form.discount_type} onChange={(event) => setForm({ ...form, discount_type: event.target.value })}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </SelectInput>
          </Field>
          <Field label="Value" error={errors.discount_value?.[0]}>
            <TextInput type="number" min="0.01" step="0.01" value={form.discount_value} onChange={(event) => setForm({ ...form, discount_value: event.target.value })} required />
          </Field>
          <Field label="Max discount" error={errors.max_discount?.[0]}>
            <TextInput type="number" min="0" step="0.01" value={form.max_discount} onChange={(event) => setForm({ ...form, max_discount: event.target.value })} placeholder="Optional cap" />
          </Field>
          <Field label="Usage limit" error={errors.usage_limit?.[0]}>
            <TextInput type="number" min="1" value={form.usage_limit} onChange={(event) => setForm({ ...form, usage_limit: event.target.value })} placeholder="Unlimited" />
          </Field>
          <Field label="Valid from" error={errors.valid_from?.[0]}>
            <TextInput type="date" value={form.valid_from} onChange={(event) => setForm({ ...form, valid_from: event.target.value })} />
          </Field>
          <Field label="Valid until" error={errors.valid_to?.[0]}>
            <TextInput type="date" value={form.valid_to} onChange={(event) => setForm({ ...form, valid_to: event.target.value })} required />
          </Field>
          <Field label="Status" error={errors.status?.[0]}>
            <SelectInput value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </SelectInput>
          </Field>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-[color:var(--app-border)] px-4 py-2 text-sm font-medium text-[color:var(--app-text)]">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {saving ? 'Saving...' : 'Save coupon'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
