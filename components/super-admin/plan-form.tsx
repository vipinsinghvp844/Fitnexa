'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Field, SelectInput, TextInput, TextareaInput } from '@/components/admin/fields';
import { LoadingState } from '@/components/admin/loading-state';
import { AdminPageHeader, AdminSecondaryButton } from '@/components/admin/page-header';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { getErrorMessage, getValidationErrors } from '@/lib/errors';
import { createPlan, getPlan, PlanSummary, updatePlan } from '@/lib/super-admin';

type PlanFormMode = 'create' | 'edit';

type PlanFormState = {
  name: string;
  description: string;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  base_price: string;
  duration_days: string;
  duration_months: string;
  discount_percentage: string;
  max_members: string;
  max_trainers: string;
  max_branches: string;
  max_staff: string;
  max_classes: string;
  max_inventory_items: string;
  is_unlimited: boolean;
  features_json: string;
  status: 'active' | 'inactive';
};

const defaultState: PlanFormState = {
  name: '',
  description: '',
  billing_cycle: 'monthly',
  base_price: '',
  duration_days: '',
  duration_months: '',
  discount_percentage: '',
  max_members: '',
  max_trainers: '',
  max_branches: '',
  max_staff: '',
  max_classes: '',
  max_inventory_items: '',
  is_unlimited: false,
  features_json: '[""]',
  status: 'inactive',
};

function parseNumberOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isNaN(num) ? null : num;
}

export function PlanForm({
  mode,
  planId,
}: {
  mode: PlanFormMode;
  planId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<PlanFormState>(defaultState);
  const [plan, setPlan] = useState<PlanSummary | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const computedFeaturesJson = useMemo(() => {
    try {
      // Keep as-is if already valid JSON array
      JSON.parse(form.features_json);
      return form.features_json;
    } catch {
      return '[""]';
    }
  }, [form.features_json]);

  useEffect(() => {
    let mounted = true;

    if (mode === 'edit' && planId) {
      getPlan(planId)
        .then((response) => {
          if (!mounted) return;

          setPlan(response);
            setForm({
              name: response.name ?? '',
              description: response.description ?? '',
              billing_cycle: response.billing_cycle,
              base_price: String(response.base_price ?? ''),
              duration_days: String(response.duration_days ?? ''),
              duration_months: String(response.duration_months ?? ''),
              discount_percentage: String(response.discount_percentage ?? ''),
              max_members: response.max_members === null ? '' : String(response.max_members),
              max_trainers: response.max_trainers === null ? '' : String(response.max_trainers),
              max_branches: response.max_branches === null ? '' : String(response.max_branches),
              max_staff: response.max_staff === null ? '' : String(response.max_staff ?? ''),
              max_classes: response.max_classes === null ? '' : String(response.max_classes ?? ''),
              max_inventory_items: response.max_inventory_items === null ? '' : String(response.max_inventory_items ?? ''),
              is_unlimited: response.is_unlimited ?? false,
              features_json: JSON.stringify(response.features ?? []),
              status: response.status,
          });
        })
        .catch((error) => {
          if (!mounted) return;
          setMessage(getErrorMessage(error, 'Failed to load plan'));
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }

    return () => {
      mounted = false;
    };
  }, [mode, planId]);

  const handleChange = (field: keyof PlanFormState, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setErrors({});

    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        billing_cycle: form.billing_cycle,
        base_price: parseNumberOrNull(form.base_price),
        duration_days: parseNumberOrNull(form.duration_days),
        duration_months: parseNumberOrNull(form.duration_months),
        discount_percentage: parseNumberOrNull(form.discount_percentage),
        max_members: parseNumberOrNull(form.max_members),
        max_trainers: parseNumberOrNull(form.max_trainers),
        max_branches: parseNumberOrNull(form.max_branches),
        max_staff: parseNumberOrNull(form.max_staff),
        max_classes: parseNumberOrNull(form.max_classes),
        max_inventory_items: parseNumberOrNull(form.max_inventory_items),
        is_unlimited: form.is_unlimited,
        features: (() => {
          const parsed = JSON.parse(computedFeaturesJson) as unknown;
          return Array.isArray(parsed) ? parsed : [];
        })(),
        status: form.status,
      };

      if (mode === 'create') {
        const response = await createPlan(payload);
        router.push(`/super-admin/plans/${response.data.id}?updated=1`);
        return;
      }

      if (mode === 'edit' && planId) {
        const response = await updatePlan(planId, payload);
        router.push(`/super-admin/plans/${response.data.id}?updated=1`);
      }
    } catch (error) {
      setMessage(getErrorMessage(error, 'Unable to save plan'));
      setErrors(getValidationErrors(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState label={mode === 'edit' ? 'Loading plan...' : 'Loading...'} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Super Admin"
        title={mode === 'create' ? 'Create plan' : `Edit ${plan?.name ?? 'plan'}`}
        description="Configure platform plan pricing, limits, and entitlement features."
        actions={
          <Link
            href={mode === 'edit' && planId ? `/super-admin/plans/${planId}` : '/super-admin/plans'}
            className="inline-flex items-center rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)] transition hover:border-sky-300 hover:text-sky-600"
          >
            Back
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="rounded-[30px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Plan name" error={errors.name?.[0]}>
                <TextInput value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Starter / Pro / Elite" />
              </Field>

              <Field label="Status" error={errors.status?.[0]}>
                <SelectInput value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </SelectInput>
              </Field>

              <Field label="Billing cycle" error={errors.billing_cycle?.[0]}>
                <SelectInput value={form.billing_cycle} onChange={(e) => handleChange('billing_cycle', e.target.value)}>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </SelectInput>
              </Field>

              <Field label="Base price" error={errors.base_price?.[0]}>
                <TextInput value={form.base_price} onChange={(e) => handleChange('base_price', e.target.value)} placeholder="49.99" />
              </Field>

              <Field label="Duration (days)" error={errors.duration_days?.[0]}>
                <TextInput value={form.duration_days} onChange={(e) => handleChange('duration_days', e.target.value)} placeholder="30" />
              </Field>

              <Field label="Duration (months)" error={errors.duration_months?.[0]}>
                <TextInput value={form.duration_months} onChange={(e) => handleChange('duration_months', e.target.value)} placeholder="1" />
              </Field>

              <Field label="Discount (%)" error={errors.discount_percentage?.[0]}>
                <TextInput value={form.discount_percentage} onChange={(e) => handleChange('discount_percentage', e.target.value)} placeholder="10" />
              </Field>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_unlimited"
                  checked={form.is_unlimited}
                  onChange={(e) => handleChange('is_unlimited', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="is_unlimited" className="text-sm font-medium text-[color:var(--app-text)]">
                  Unlimited plan
                </label>
              </div>

              {!form.is_unlimited && (
                <>
                  <Field label="Max members" error={errors.max_members?.[0]} hint="Leave blank for unlimited">
                    <TextInput value={form.max_members} onChange={(e) => handleChange('max_members', e.target.value)} placeholder="500" />
                  </Field>

                  <Field label="Max trainers" error={errors.max_trainers?.[0]} hint="Leave blank for unlimited">
                    <TextInput value={form.max_trainers} onChange={(e) => handleChange('max_trainers', e.target.value)} placeholder="50" />
                  </Field>

                  <Field label="Max branches" error={errors.max_branches?.[0]} hint="Leave blank for unlimited">
                    <TextInput value={form.max_branches} onChange={(e) => handleChange('max_branches', e.target.value)} placeholder="10" />
                  </Field>

                  <Field label="Max staff" error={errors.max_staff?.[0]} hint="Leave blank for unlimited">
                    <TextInput value={form.max_staff} onChange={(e) => handleChange('max_staff', e.target.value)} placeholder="100" />
                  </Field>

                  <Field label="Max classes" error={errors.max_classes?.[0]} hint="Leave blank for unlimited">
                    <TextInput value={form.max_classes} onChange={(e) => handleChange('max_classes', e.target.value)} placeholder="200" />
                  </Field>

                  <Field label="Max inventory items" error={errors.max_inventory_items?.[0]} hint="Leave blank for unlimited">
                    <TextInput value={form.max_inventory_items} onChange={(e) => handleChange('max_inventory_items', e.target.value)} placeholder="1000" />
                  </Field>
                </>
              )}

              <Field label="Features (JSON array)" error={errors.features?.[0]} hint='Example: ["Swimming Pool","Cardio"]'>
                <TextareaInput value={form.features_json} onChange={(e) => handleChange('features_json', e.target.value)} rows={4} />
              </Field>
            </div>

            <Field label="Description" error={errors.description?.[0]}>
              <TextareaInput value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} placeholder="Describe what this plan includes..." />
            </Field>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-sky-500 text-white shadow-[0_12px_26px_rgba(14,165,233,0.24)]">
                  <DashboardIcon name="plans" className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--app-text)]">Plan configuration</p>
                  <p className="text-xs text-[color:var(--app-muted)]">Limits & features will be used during subscription assignment.</p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-[color:var(--app-muted)]">
                <div>• Plan type drives subscription cycle.</div>
                <div>• Members/trainers/branches limits are enforced by billing workflows.</div>
                <div>• Features are stored as an array.</div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <AdminSecondaryButton type="button" onClick={() => router.back()}>
                Cancel
              </AdminSecondaryButton>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Saving...' : mode === 'create' ? 'Create plan' : 'Save changes'}
              </button>
            </div>

            {message ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                {message}
              </div>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}
