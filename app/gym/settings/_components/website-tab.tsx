'use client';

import { useState } from 'react';
import { updateGymProfile, type GymProfile } from '@/lib/gym';
import { SettingField as Field, Input as TextInput } from './field';
import { ImageUpload } from '@/components/admin/image-upload';
import { getErrorMessage } from '@/lib/errors';
import * as Icons from 'lucide-react';

interface WebsiteTabProps {
  initial: GymProfile;
  onRefresh: () => void | Promise<void>;
}

export function WebsiteTab({ initial, onRefresh }: WebsiteTabProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Core website state
  const [form, setForm] = useState<Partial<GymProfile>>({
    website_enabled: initial.website_enabled ?? false,
    website_template: initial.website_template ?? 'modern',
    seo_title: initial.seo_title ?? '',
    seo_description: initial.seo_description ?? '',
    seo_keywords: initial.seo_keywords ?? '',
    custom_domain: initial.custom_domain ?? '',
    custom_domain_verified: initial.custom_domain_verified ?? false,
    banner_image: initial.banner_image ?? '',
    latitude: initial.latitude ?? 0,
    longitude: initial.longitude ?? 0,
    services: initial.services ?? [],
    opening_hours: initial.opening_hours ?? {
      'Monday - Friday': '6:00 AM - 10:00 PM',
      'Saturday': '8:00 AM - 8:00 PM',
      'Sunday': 'Closed',
    },
    social_links: initial.social_links ?? {
      facebook: '',
      instagram: '',
      youtube: '',
    },
    pricing_plans: initial.pricing_plans ?? [
      { name: 'Monthly Basic', price: '$29/mo', features: ['Gym Access', 'Locker Room'] },
      { name: 'VIP Premium', price: '$79/mo', features: ['24/7 Access', 'Personal Trainer', 'Sauna Access'] }
    ],
    trainers_data: initial.trainers_data ?? [
      { name: 'John Doe', specialization: 'Strength & Conditioning', avatar: '' },
      { name: 'Jane Smith', specialization: 'Yoga & Pilates Instruction', avatar: '' }
    ]
  });

  // Services management helpers
  const [newService, setNewService] = useState('');
  const addService = () => {
    if (!newService.trim()) return;
    setForm(prev => ({ ...prev, services: [...(prev.services || []), newService.trim()] }));
    setNewService('');
  };
  const removeService = (idx: number) => {
    setForm(prev => ({ ...prev, services: (prev.services || []).filter((_, i) => i !== idx) }));
  };

  // Pricing plans helpers
  const [newPlan, setNewPlan] = useState({ name: '', price: '', features: '' });
  const addPlan = () => {
    if (!newPlan.name.trim() || !newPlan.price.trim()) return;
    const planObj = {
      name: newPlan.name.trim(),
      price: newPlan.price.trim(),
      features: newPlan.features.split(',').map(f => f.trim()).filter(Boolean)
    };
    setForm(prev => ({ ...prev, pricing_plans: [...(prev.pricing_plans || []), planObj] }));
    setNewPlan({ name: '', price: '', features: '' });
  };
  const removePlan = (idx: number) => {
    setForm(prev => ({ ...prev, pricing_plans: (prev.pricing_plans || []).filter((_, i) => i !== idx) }));
  };

  // Trainers helpers
  const [newTrainer, setNewTrainer] = useState({ name: '', specialization: '', avatar: '' });
  const addTrainer = () => {
    if (!newTrainer.name.trim() || !newTrainer.specialization.trim()) return;
    setForm(prev => ({ ...prev, trainers_data: [...(prev.trainers_data || []), newTrainer] }));
    setNewTrainer({ name: '', specialization: '', avatar: '' });
  };
  const removeTrainer = (idx: number) => {
    setForm(prev => ({ ...prev, trainers_data: (prev.trainers_data || []).filter((_, i) => i !== idx) }));
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      await updateGymProfile(form);
      setSuccess('Public Website settings updated successfully!');
      await onRefresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl border border-[color:var(--app-border)] shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[color:var(--app-text)] flex items-center gap-2">
            <Icons.Globe className="h-6 w-6 text-sky-600 animate-pulse" /> Public Website Settings
          </h2>
          <p className="text-xs text-[color:var(--app-muted)] mt-1">
            Build, brand, SEO optimize, and publish your public-facing SEO-friendly landing page.
          </p>
        </div>

        {/* Toggle Publish / Draft */}
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${form.website_enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {form.website_enabled ? 'Live & Published' : 'Draft / Off'}
          </span>
          <button
            type="button"
            onClick={() => setForm(prev => ({ ...prev, website_enabled: !prev.website_enabled }))}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              form.website_enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md transform duration-300" />
          </button>
        </div>
      </div>

      {success && <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2"><Icons.CheckCircle2 className="h-5 w-5" />{success}</div>}
      {error && <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2"><Icons.AlertCircle className="h-5 w-5" />{error}</div>}

      {/* Website Template & Customization */}
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Website Template">
          <select
            value={form.website_template}
            onChange={(e) => setForm(prev => ({ ...prev, website_template: e.target.value }))}
            className="w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-3 text-sm text-[color:var(--app-text)] focus:border-sky-500 focus:outline-none"
          >
            <option value="modern">Modern Professional</option>
            <option value="glass">Glassmorphism Cyberpunk</option>
            <option value="dark">High-Contrast Neon</option>
          </select>
        </Field>

        <ImageUpload
          label="Website Banner Image"
          value={form.banner_image || ''}
          onChange={(url) => setForm(prev => ({ ...prev, banner_image: url }))}
        />
      </div>

      {/* Geolocation Map Details */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><Icons.MapPin className="h-5 w-5 text-amber-500" /> Location Coordinates (Google Maps)</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Latitude"><TextInput type="number" step="any" value={form.latitude ?? ''} onChange={(e) => setForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))} /></Field>
          <Field label="Longitude"><TextInput type="number" step="any" value={form.longitude ?? ''} onChange={(e) => setForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))} /></Field>
        </div>
      </div>

      {/* Custom Domain / Subdomain */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><Icons.Link className="h-5 w-5 text-indigo-500" /> Domain & Branding</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--app-muted)]">Subdomain URL (Free)</label>
            <div className="flex items-center rounded-xl border border-[color:var(--app-border)] bg-slate-50 px-4 py-3 text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{initial.slug}</span>.gymsaas.com
            </div>
          </div>

          <Field label="Custom Domain (Advanced)">
            <TextInput
              placeholder="e.g. www.mygym.com"
              value={form.custom_domain || ''}
              onChange={(e) => setForm(prev => ({ ...prev, custom_domain: e.target.value }))}
            />
          </Field>
        </div>

        {form.custom_domain && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <p className="font-bold text-slate-800 flex items-center gap-1.5"><Icons.Info className="h-4 w-4 text-sky-500" /> DNS Setup Instructions:</p>
            <p className="text-slate-600">To map your custom domain, add a <strong>CNAME record</strong> in your domain DNS registry provider:</p>
            <div className="grid grid-cols-2 gap-4 py-2 border-t border-slate-200 mt-2">
              <div>
                <p className="font-semibold text-slate-700">Type / Record</p>
                <p className="font-mono bg-white px-2 py-1 border border-slate-200 rounded mt-1 inline-block">CNAME</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Value / Target</p>
                <p className="font-mono bg-white px-2 py-1 border border-slate-200 rounded mt-1 inline-block">cname.gymsaas.com</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
              <Icons.ShieldAlert className="h-4 w-4 text-amber-500" />
              <span className="text-slate-600">Status: {form.custom_domain_verified ? 'Verified & Configured' : 'Verification Pending (DNS changes can take up to 24 hours)'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Services List Manager */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><Icons.Layers className="h-5 w-5 text-emerald-500" /> Managed Services</h3>
        <div className="flex gap-3 mb-4">
          <TextInput
            placeholder="Add new service (e.g. Cardio Zone, Personal Trainers)"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
          />
          <button
            type="button"
            onClick={addService}
            className="px-6 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.services?.map((service, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium text-slate-700 border border-slate-200">
              <span>{service}</span>
              <button type="button" onClick={() => removeService(idx)} className="text-rose-500 hover:text-rose-700"><Icons.X className="h-4 w-4" /></button>
            </div>
          ))}
          {(!form.services || form.services.length === 0) && (
            <p className="text-sm text-slate-400">No services added yet. Add some to display on your landing page.</p>
          )}
        </div>
      </div>

      {/* Pricing / Membership Plans Builder */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><Icons.CreditCard className="h-5 w-5 text-violet-500" /> Pricing & Plans</h3>
        <div className="grid md:grid-cols-3 gap-3 mb-4 items-end">
          <Field label="Plan Name"><TextInput placeholder="e.g. Premium VIP" value={newPlan.name} onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))} /></Field>
          <Field label="Price / Term"><TextInput placeholder="e.g. $49/mo" value={newPlan.price} onChange={(e) => setNewPlan(prev => ({ ...prev, price: e.target.value }))} /></Field>
          <Field label="Features (Comma Separated)"><TextInput placeholder="Gym Access, Trainers" value={newPlan.features} onChange={(e) => setNewPlan(prev => ({ ...prev, features: e.target.value }))} /></Field>
        </div>
        <button type="button" onClick={addPlan} className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 text-sm font-semibold hover:bg-slate-200 transition mb-6">
          + Add Membership Plan
        </button>
        <div className="grid gap-4 sm:grid-cols-2">
          {form.pricing_plans?.map((plan, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 relative">
              <button type="button" onClick={() => removePlan(idx)} className="absolute top-4 right-4 text-rose-500 hover:text-rose-700"><Icons.Trash2 className="h-4 w-4" /></button>
              <h4 className="font-bold text-slate-900 text-lg">{plan.name}</h4>
              <p className="text-sky-600 font-extrabold text-xl mt-1">{plan.price}</p>
              <ul className="mt-3 space-y-1">
                {plan.features.map((feat, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5"><Icons.Check className="h-3 w-3 text-emerald-500" />{feat}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Trainers Manager */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><Icons.Users className="h-5 w-5 text-pink-500" /> Trainers & Instructors</h3>
        <div className="grid md:grid-cols-3 gap-3 mb-4 items-end">
          <Field label="Trainer Name"><TextInput placeholder="e.g. John Doe" value={newTrainer.name} onChange={(e) => setNewTrainer(prev => ({ ...prev, name: e.target.value }))} /></Field>
          <Field label="Specialization"><TextInput placeholder="e.g. Cardio Master" value={newTrainer.specialization} onChange={(e) => setNewTrainer(prev => ({ ...prev, specialization: e.target.value }))} /></Field>
          <div className="md:col-span-1">
            <ImageUpload label="Avatar Image" value={newTrainer.avatar} onChange={(url) => setNewTrainer(prev => ({ ...prev, avatar: url }))} />
          </div>
        </div>
        <button type="button" onClick={addTrainer} className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 text-sm font-semibold hover:bg-slate-200 transition mb-6">
          + Add Trainer Profile
        </button>
        <div className="grid gap-4 sm:grid-cols-2">
          {form.trainers_data?.map((trainer, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 relative">
              <button type="button" onClick={() => removeTrainer(idx)} className="absolute top-4 right-4 text-rose-500 hover:text-rose-700"><Icons.Trash2 className="h-4 w-4" /></button>
              <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-white flex items-center justify-center text-slate-400">
                {trainer.avatar ? <img src={trainer.avatar} alt={trainer.name} className="w-full h-full object-cover" /> : <Icons.User className="h-8 w-8" />}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{trainer.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{trainer.specialization}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEO Configuration Options */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><Icons.Search className="h-5 w-5 text-sky-500" /> SEO & Google Ranking</h3>
        <div className="space-y-4">
          <Field label="SEO Title Tag">
            <TextInput
              placeholder="e.g. Best Power Gym in New Delhi | PowerHouse Gym"
              value={form.seo_title || ''}
              onChange={(e) => setForm(prev => ({ ...prev, seo_title: e.target.value }))}
            />
          </Field>
          <Field label="Meta Description (For Google Snippet)">
            <textarea
              rows={3}
              placeholder="e.g. Looking for the best personal training center in New Delhi? Visit PowerHouse Gym for elite strength coaches, premium machines, and dynamic group yoga classes."
              value={form.seo_description || ''}
              onChange={(e) => setForm(prev => ({ ...prev, seo_description: e.target.value }))}
              className="w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-3 text-sm text-[color:var(--app-text)] focus:border-sky-500 focus:outline-none"
            />
          </Field>
          <Field label="Keywords (Comma separated)">
            <TextInput
              placeholder="e.g. gym, fitness, strength, bodybuilding, delhi gym"
              value={form.seo_keywords || ''}
              onChange={(e) => setForm(prev => ({ ...prev, seo_keywords: e.target.value }))}
            />
          </Field>
        </div>
      </div>

      {/* Submit button */}
      <div className="border-t border-slate-100 pt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3 rounded-xl transition shadow-md disabled:opacity-50"
        >
          {loading && <Icons.Loader2 className="h-4 w-4 animate-spin" />}
          Save Public Website Changes
        </button>
      </div>
    </form>
  );
}
