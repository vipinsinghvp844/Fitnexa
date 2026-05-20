'use client';
import { useState, useRef } from 'react';
import { getErrorMessage } from '@/lib/errors';
import { updateGymProfile, uploadGymLogo, type GymProfile } from '@/lib/gym';
import { SettingField, Input, Textarea, SectionCard, SaveBar } from './field';

export function GeneralTab({ initial }: { initial: GymProfile }) {
  const [profile, setProfile] = useState<GymProfile>({ ...initial });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof GymProfile, v: string) => setProfile(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setSuccess(null); setError(null);
    try {
      if (logoFile) {
        await uploadGymLogo(logoFile);
      }
      await updateGymProfile({
        name: profile.name, email: profile.email, phone: profile.phone,
        website: profile.website, address: profile.address, city: profile.city,
        state: profile.state, country: profile.country, zip: profile.zip,
        description: profile.description
      });
      setSuccess('Profile updated successfully.');
      setLogoFile(null);
      // Not forcing a full reload, just showing success
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {error && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{error}</div>}
      {success && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{success}</div>}

      <SectionCard icon="🏢" title="Gym Profile" description="Basic information about your facility">
        <div>
          <label className="mb-3 block text-sm font-medium text-[color:var(--app-text)]">Gym Logo</label>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-[color:var(--app-border)] bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center overflow-hidden shrink-0">
              {logoFile ? (
                <img src={URL.createObjectURL(logoFile)} alt="Preview" className="h-full w-full object-cover" />
              ) : profile.logo_url ? (
                <img src={profile.logo_url} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-slate-400 font-bold uppercase">Logo</span>
              )}
            </div>
            <div>
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition">
                Choose Image...
              </button>
              <p className="mt-2 text-xs text-[color:var(--app-muted)]">JPG, PNG, SVG up to 2MB. Square ratio recommended.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-[color:var(--app-border)]">
          <SettingField label="Gym Name *">
            <Input required value={profile.name} onChange={e => set('name', e.target.value)} placeholder="e.g. FitZone" />
          </SettingField>
          <SettingField label="Phone">
            <Input type="tel" value={profile.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+1 234 567 890" />
          </SettingField>
          <SettingField label="Email">
            <Input type="email" value={profile.email || ''} onChange={e => set('email', e.target.value)} placeholder="contact@gym.com" />
          </SettingField>
          <SettingField label="Website">
            <Input type="url" value={profile.website || ''} onChange={e => set('website', e.target.value)} placeholder="https://..." />
          </SettingField>
        </div>
        
        <SettingField label="About / Description">
          <Textarea value={profile.description || ''} onChange={e => set('description', e.target.value)} placeholder="A short description of your gym..." />
        </SettingField>
      </SectionCard>

      <SectionCard icon="📍" title="Location Details" description="Physical address of your gym">
        <SettingField label="Street Address">
          <Input value={profile.address || ''} onChange={e => set('address', e.target.value)} placeholder="123 Main St" />
        </SettingField>
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingField label="City">
            <Input value={profile.city || ''} onChange={e => set('city', e.target.value)} placeholder="New York" />
          </SettingField>
          <SettingField label="State / Province">
            <Input value={profile.state || ''} onChange={e => set('state', e.target.value)} placeholder="NY" />
          </SettingField>
          <SettingField label="ZIP / Postal Code">
            <Input value={profile.zip || ''} onChange={e => set('zip', e.target.value)} placeholder="10001" />
          </SettingField>
          <SettingField label="Country">
            <Input value={profile.country || ''} onChange={e => set('country', e.target.value)} placeholder="United States" />
          </SettingField>
        </div>
      </SectionCard>

      <SaveBar saving={saving} onSave={handleSave} />
    </div>
  );
}
