'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Field, SelectInput, TextInput, TextareaInput } from '@/components/admin/fields';
import { LoadingState } from '@/components/admin/loading-state';
import { AdminPageHeader, AdminSecondaryButton } from '@/components/admin/page-header';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { getErrorMessage, getValidationErrors } from '@/lib/errors';
import { formatCurrency } from '@/lib/format';
import { createGym, getGym, getPlans, GymSummary, PlanSummary, updateGym } from '@/lib/super-admin';

type GymFormState = {
  name: string;
  owner_name: string;
  owner_email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  gst_number: string;
  status: 'active' | 'inactive' | 'suspended';
  subscription_plan_id: string;
};

const defaultState: GymFormState = {
  name: '',
  owner_name: '',
  owner_email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: '',
  gst_number: '',
  status: 'active',
  subscription_plan_id: '',
};

export function GymForm({
  mode,
  gymId,
}: {
  mode: 'create' | 'edit';
  gymId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<GymFormState>(defaultState);
  const [gym, setGym] = useState<GymSummary | null>(null);
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getPlans({ per_page: 50, status: 'active', sort_by: 'price', sort_direction: 'asc' }),
      mode === 'edit' && gymId ? getGym(gymId) : Promise.resolve(null),
    ])
      .then(([plansResponse, gymResponse]) => {
        if (!mounted) return;

        setPlans(plansResponse.data);

        if (gymResponse) {
          setGym(gymResponse);
          setLogoPreview(gymResponse.logo_url);
          setForm({
            name: gymResponse.name,
            owner_name: gymResponse.owner?.name || '',
            owner_email: gymResponse.owner?.email || '',
            phone: gymResponse.phone || '',
            address: gymResponse.address || '',
            city: gymResponse.city || '',
            state: gymResponse.state || '',
            country: gymResponse.country || '',
            gst_number: gymResponse.gst_number || '',
            status: gymResponse.status,
            subscription_plan_id: gymResponse.active_subscription?.plan_id ? String(gymResponse.active_subscription.plan_id) : '',
          });
        }
      })
      .catch((error) => {
        if (mounted) {
          setMessage(getErrorMessage(error, 'Failed to load gym form'));
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [gymId, mode]);

  const handleChange = (field: keyof GymFormState, value: string) => {
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

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== '') {
        payload.append(key, value);
      }
    });

    if (logoFile) {
      payload.append('logo', logoFile);
    }

    try {
      if (mode === 'create') {
        const response = await createGym(payload);
        router.push(`/super-admin/gyms/${response.data.id}?tempPassword=${encodeURIComponent(response.meta.temporary_password)}`);
      } else if (gymId) {
        const response = await updateGym(gymId, payload);
        router.push(`/super-admin/gyms/${response.data.id}?updated=1`);
      }
    } catch (error) {
      setMessage(getErrorMessage(error, 'Unable to save gym'));
      setErrors(getValidationErrors(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading gym details..." />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Gym Management"
        title={mode === 'create' ? 'Create gym' : `Edit ${gym?.name ?? 'gym'}`}
        description="Configure gym identity, owner account, commercial details, and the initial subscription plan from one place."
        actions={
          <Link
            href={mode === 'edit' && gymId ? `/super-admin/gyms/${gymId}` : '/super-admin/gyms'}
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
              <Field label="Gym name" error={errors.name?.[0]}>
                <TextInput value={form.name} onChange={(event) => handleChange('name', event.target.value)} placeholder="Power House Fitness" />
              </Field>
              <Field label="Status" error={errors.status?.[0]}>
                <SelectInput value={form.status} onChange={(event) => handleChange('status', event.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </SelectInput>
              </Field>
              <Field label="Owner name" error={errors.owner_name?.[0]}>
                <TextInput value={form.owner_name} onChange={(event) => handleChange('owner_name', event.target.value)} placeholder="John Doe" />
              </Field>
              <Field label="Owner email" error={errors.owner_email?.[0]}>
                <TextInput type="email" value={form.owner_email} onChange={(event) => handleChange('owner_email', event.target.value)} placeholder="owner@gym.com" />
              </Field>
              <Field label="Phone" error={errors.phone?.[0]}>
                <TextInput value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} placeholder="+91 98765 43210" />
              </Field>
              <Field label="GST number" error={errors.gst_number?.[0]}>
                <TextInput value={form.gst_number} onChange={(event) => handleChange('gst_number', event.target.value)} placeholder="GST-12345" />
              </Field>
              <Field label="City" error={errors.city?.[0]}>
                <TextInput value={form.city} onChange={(event) => handleChange('city', event.target.value)} placeholder="Mumbai" />
              </Field>
              <Field label="State" error={errors.state?.[0]}>
                <TextInput value={form.state} onChange={(event) => handleChange('state', event.target.value)} placeholder="Maharashtra" />
              </Field>
              <Field label="Country" error={errors.country?.[0]}>
                <TextInput value={form.country} onChange={(event) => handleChange('country', event.target.value)} placeholder="India" />
              </Field>
              <Field label="Subscription plan" hint="Assign the active platform plan at creation or update time." error={errors.subscription_plan_id?.[0]}>
                <SelectInput value={form.subscription_plan_id} onChange={(event) => handleChange('subscription_plan_id', event.target.value)}>
                  <option value="">No plan selected</option>
                  {plans.map((plan) => (
                    <option key={`plan-option-${plan.id}`} value={plan.id}>
                      {plan.name} · {plan.billing_cycle} · {formatCurrency(plan.base_price)}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            </div>

            <Field label="Address" error={errors.address?.[0]}>
              <TextareaInput value={form.address} onChange={(event) => handleChange('address', event.target.value)} placeholder="Street, area, landmark" />
            </Field>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-sky-500 text-white shadow-[0_12px_26px_rgba(14,165,233,0.24)]">
                  <DashboardIcon name="gym" className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--app-text)]">Gym logo</p>
                  <p className="text-xs text-[color:var(--app-muted)]">Upload a square logo for the gym profile and dashboards.</p>
                </div>
              </div>
              <div className="mt-5 rounded-[24px] border border-dashed border-[color:var(--app-border)] p-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Gym logo preview" className="h-40 w-full rounded-[20px] object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-[20px] bg-black/4 text-sm text-[color:var(--app-muted)] dark:bg-white/6">
                    No logo selected
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="mt-4 block w-full text-sm text-[color:var(--app-muted)]"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setLogoFile(file);
                    if (file) {
                      setLogoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {errors.logo?.[0] ? <p className="mt-2 text-xs font-medium text-rose-500">{errors.logo[0]}</p> : null}
              </div>
            </div>

            <div className="rounded-[28px] border border-[color:var(--app-border)] bg-[linear-gradient(160deg,rgba(14,165,233,0.08),rgba(255,255,255,0.95))] p-5 dark:bg-[linear-gradient(160deg,rgba(14,165,233,0.12),rgba(8,15,28,0.96))]">
              <p className="text-base font-semibold text-[color:var(--app-text)]">What happens next?</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--app-muted)]">
                <li>Owner account is created automatically and linked to the gym.</li>
                <li>Gym Admin role is provisioned for the selected tenant.</li>
                <li>If a plan is selected, the first subscription and payment records are created automatically.</li>
              </ul>
            </div>
          </div>
        </div>

        {message ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            {message}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <AdminSecondaryButton type="button" onClick={() => router.back()}>
            Cancel
          </AdminSecondaryButton>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : mode === 'create' ? 'Create gym' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
