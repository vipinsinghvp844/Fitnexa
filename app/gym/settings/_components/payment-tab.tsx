'use client';
import { useState } from 'react';
import { getErrorMessage } from '@/lib/errors';
import { updateGymPaymentSettings, type GymPaymentSettings, type GymPaymentProvider } from '@/lib/gym';
import { SettingField, SecretInput, Select, Input, SectionCard, SaveBar } from './field';

const MASK = '••••••••';

function StatusBadge({ enabled, provider }: { enabled: boolean; provider: string }) {
  if (provider === 'offline') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm">
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        <span className="font-medium text-[color:var(--app-muted)]">Offline payments only</span>
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${enabled ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-amber-50 dark:bg-amber-500/10'}`}>
      <span className={`h-2 w-2 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
      <span className={`font-medium ${enabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
        {enabled ? `${provider.charAt(0).toUpperCase() + provider.slice(1)} connected & active` : `Configure ${provider} API keys to enable online payments`}
      </span>
    </div>
  );
}

export function PaymentTab({ initial }: { initial: GymPaymentSettings }) {
  const [form, setForm] = useState<GymPaymentSettings>({ ...initial });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof GymPaymentSettings, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setSuccess(null); setError(null);
    try {
      const res = await updateGymPaymentSettings(form);
      const data = (res as any).data as GymPaymentSettings;
      setForm(data);
      setSuccess('Payment settings saved.');
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const provider = form.payment_provider;

  return (
    <div className="space-y-5 max-w-2xl">
      {error && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{error}</div>}
      {success && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{success}</div>}

      <StatusBadge enabled={form.payments_enabled} provider={provider} />

      <SectionCard icon="🏦" title="Payment Provider" description="Choose how members pay online">
        <SettingField label="Provider">
          <Select value={provider} onChange={e => set('payment_provider', e.target.value as GymPaymentProvider)}>
            <option value="offline">Offline (Cash / Manual)</option>
            <option value="stripe">Stripe</option>
            <option value="razorpay">Razorpay</option>
          </Select>
        </SettingField>
        <SettingField label="Payment Mode">
          <div className="flex gap-3">
            {(['test', 'live'] as const).map(m => (
              <label key={m} className={`flex-1 cursor-pointer rounded-xl border-2 px-4 py-3 text-center transition ${form.payment_mode === m ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-[color:var(--app-border)]'}`}>
                <input type="radio" className="sr-only" value={m} checked={form.payment_mode === m} onChange={() => set('payment_mode', m)} />
                <div className="text-sm font-bold text-[color:var(--app-text)] capitalize">{m}</div>
                <div className="text-xs text-[color:var(--app-muted)]">{m === 'test' ? 'No real charges' : 'Live transactions'}</div>
              </label>
            ))}
          </div>
        </SettingField>
      </SectionCard>

      {provider === 'stripe' && (
        <SectionCard icon="⚡" title="Stripe Configuration" description="Your Stripe API credentials">
          <SettingField label="Publishable Key" hint="Starts with pk_test_ or pk_live_">
            <Input placeholder="pk_test_..." value={form.stripe_public_key} onChange={e => set('stripe_public_key', e.target.value)} />
          </SettingField>
          <SettingField label="Secret Key" hint="Stored securely — never exposed in frontend">
            <SecretInput placeholder={form.stripe_secret_key === MASK ? 'Already configured (hidden)' : 'sk_test_...'} value={form.stripe_secret_key} onChange={v => set('stripe_secret_key', v)} />
          </SettingField>
          <SettingField label="Webhook Secret" hint="From your Stripe dashboard → Webhooks">
            <SecretInput placeholder={form.webhook_secret === MASK ? 'Already configured (hidden)' : 'whsec_...'} value={form.webhook_secret} onChange={v => set('webhook_secret', v)} />
          </SettingField>
        </SectionCard>
      )}

      {provider === 'razorpay' && (
        <SectionCard icon="💳" title="Razorpay Configuration" description="Your Razorpay API credentials">
          <SettingField label="Key ID" hint="Starts with rzp_test_ or rzp_live_">
            <Input placeholder="rzp_test_..." value={form.razorpay_key} onChange={e => set('razorpay_key', e.target.value)} />
          </SettingField>
          <SettingField label="Key Secret" hint="Stored securely — never exposed in frontend">
            <SecretInput placeholder={form.razorpay_secret === MASK ? 'Already configured (hidden)' : 'Enter secret...'} value={form.razorpay_secret} onChange={v => set('razorpay_secret', v)} />
          </SettingField>
          <SettingField label="Webhook Secret" hint="From your Razorpay dashboard → Webhooks">
            <SecretInput placeholder={form.webhook_secret === MASK ? 'Already configured (hidden)' : 'Enter webhook secret...'} value={form.webhook_secret} onChange={v => set('webhook_secret', v)} />
          </SettingField>
        </SectionCard>
      )}

      <SaveBar saving={saving} onSave={handleSave} />
    </div>
  );
}
