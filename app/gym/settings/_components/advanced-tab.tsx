'use client';
import { useState } from 'react';
import { getErrorMessage } from '@/lib/errors';
import { updateGymKVSettings } from '@/lib/gym';
import { SettingField, Input, Select, Textarea, SectionCard, SaveBar } from './field';

export function AdvancedTab({ initial }: { initial: Record<string, any> }) {
  const [form, setForm] = useState({
    currency_symbol:        initial['currency_symbol']        ?? '₹',
    currency_code:          initial['currency_code']          ?? 'INR',
    timezone:               initial['timezone']               ?? 'Asia/Kolkata',
    date_format:            initial['date_format']            ?? 'Y-m-d',
    default_class_capacity: initial['default_class_capacity'] ?? '30',
    max_members_limit:      initial['max_members_limit']      ?? '500',
    attendance_rules:       initial['attendance_rules']       ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setSuccess(null); setError(null);
    try {
      await updateGymKVSettings(form);
      setSuccess('Advanced settings saved.');
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {error   && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{error}</div>}
      {success && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{success}</div>}

      <SectionCard icon="🌍" title="Localization" description="Regional and format preferences">
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingField label="Currency Symbol">
            <Input value={form.currency_symbol} onChange={e => set('currency_symbol', e.target.value)} placeholder="₹" />
          </SettingField>
          <SettingField label="Currency Code">
            <Input value={form.currency_code} onChange={e => set('currency_code', e.target.value)} placeholder="INR" />
          </SettingField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingField label="Timezone">
            <Select value={form.timezone} onChange={e => set('timezone', e.target.value)}>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="UTC">UTC</option>
            </Select>
          </SettingField>
          <SettingField label="Date Format">
            <Select value={form.date_format} onChange={e => set('date_format', e.target.value)}>
              <option value="Y-m-d">YYYY-MM-DD</option>
              <option value="d/m/Y">DD/MM/YYYY</option>
              <option value="m/d/Y">MM/DD/YYYY</option>
            </Select>
          </SettingField>
        </div>
      </SectionCard>

      <SectionCard icon="🏋️" title="Gym Rules" description="Capacity and operational limits">
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingField label="Default Class Capacity" hint="Max members per class session">
            <Input type="number" min="1" value={form.default_class_capacity} onChange={e => set('default_class_capacity', e.target.value)} />
          </SettingField>
          <SettingField label="Max Members Limit" hint="Total members allowed in this gym">
            <Input type="number" min="1" value={form.max_members_limit} onChange={e => set('max_members_limit', e.target.value)} />
          </SettingField>
        </div>
        <SettingField label="Attendance Rules" hint="Optional notes or policies (internal use)">
          <Textarea value={form.attendance_rules} onChange={e => set('attendance_rules', e.target.value)} placeholder="e.g. Members must check in within 15 minutes of class start..." />
        </SettingField>
      </SectionCard>

      <SaveBar saving={saving} onSave={handleSave} />
    </div>
  );
}
