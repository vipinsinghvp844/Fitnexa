'use client';
import { useState } from 'react';
import { getErrorMessage } from '@/lib/errors';
import { updateGymKVSettings } from '@/lib/gym';
import { SettingField, Input, Toggle, SectionCard, SaveBar } from './field';

interface BillingSettings {
  invoice_prefix: string;
  tax_percent: string;
  auto_renew: string;
  trial_days: string;
}

export function BillingTab({ initial }: { initial: Record<string, any> }) {
  const [form, setForm] = useState<BillingSettings>({
    invoice_prefix: initial['invoice_prefix'] ?? 'GYM-',
    tax_percent:    initial['tax_percent']    ?? '0',
    auto_renew:     initial['auto_renew']     ?? 'false',
    trial_days:     initial['trial_days']     ?? '0',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const set = (k: keyof BillingSettings, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setSuccess(null); setError(null);
    try {
      await updateGymKVSettings(form);
      setSuccess('Billing settings saved.');
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {error   && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{error}</div>}
      {success && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{success}</div>}

      <SectionCard icon="🧾" title="Invoice Settings" description="Configure how invoices are generated">
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingField label="Invoice Prefix" hint="e.g. GYM-, INV-, FIT-">
            <Input value={form.invoice_prefix} onChange={e => set('invoice_prefix', e.target.value)} placeholder="GYM-" />
          </SettingField>
          <SettingField label="Tax Percentage (%)" hint="Applied to all invoices">
            <Input type="number" step="0.01" min="0" max="100" value={form.tax_percent} onChange={e => set('tax_percent', e.target.value)} placeholder="0" />
          </SettingField>
        </div>
      </SectionCard>

      <SectionCard icon="🔄" title="Subscription Settings" description="Renewal and trial configuration">
        <SettingField label="Trial Days" hint="Free trial period for new members (0 = no trial)">
          <Input type="number" min="0" max="365" value={form.trial_days} onChange={e => set('trial_days', e.target.value)} placeholder="0" />
        </SettingField>
        <Toggle
          checked={form.auto_renew === 'true'}
          onChange={v => set('auto_renew', v ? 'true' : 'false')}
          label="Auto-Renew Memberships"
          hint="Automatically renew expiring memberships when due"
        />
      </SectionCard>

      <SaveBar saving={saving} onSave={handleSave} />
    </div>
  );
}
