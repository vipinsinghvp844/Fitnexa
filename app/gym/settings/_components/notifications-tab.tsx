'use client';
import { useState } from 'react';
import { getErrorMessage } from '@/lib/errors';
import { updateGymKVSettings } from '@/lib/gym';
import { Toggle, SectionCard, SaveBar } from './field';

export function NotificationsTab({ initial }: { initial: Record<string, any> }) {
  const bool = (k: string) => initial[k] === 'true';
  const [form, setForm] = useState({
    enable_renewal_alerts: bool('enable_renewal_alerts'),
    enable_payment_alerts: bool('enable_payment_alerts'),
    enable_email_alerts:   bool('enable_email_alerts'),
    enable_sms_alerts:     bool('enable_sms_alerts'),
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const set = (k: keyof typeof form, v: boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setSuccess(null); setError(null);
    try {
      const payload: Record<string, string> = {};
      (Object.keys(form) as (keyof typeof form)[]).forEach(k => { payload[k] = form[k] ? 'true' : 'false'; });
      await updateGymKVSettings(payload);
      setSuccess('Notification settings saved.');
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {error   && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{error}</div>}
      {success && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{success}</div>}

      <SectionCard icon="🔔" title="Member Alerts" description="Automatic alerts sent to members">
        <Toggle checked={form.enable_renewal_alerts} onChange={v => set('enable_renewal_alerts', v)} label="Renewal Alerts" hint="Notify members when their membership is about to expire" />
        <Toggle checked={form.enable_payment_alerts} onChange={v => set('enable_payment_alerts', v)} label="Payment Alerts" hint="Notify members about pending or overdue payments" />
      </SectionCard>

      <SectionCard icon="📬" title="Delivery Channels" description="How alerts are sent">
        <Toggle checked={form.enable_email_alerts} onChange={v => set('enable_email_alerts', v)} label="Email Notifications" hint="Send alerts via email — requires SMTP configured in .env" />
        <Toggle checked={form.enable_sms_alerts}   onChange={v => set('enable_sms_alerts', v)}   label="SMS Notifications"   hint="Requires active SMS gateway integration" />
      </SectionCard>

      <SaveBar saving={saving} onSave={handleSave} />
    </div>
  );
}
