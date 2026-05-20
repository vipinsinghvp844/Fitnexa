'use client';

import { useEffect, useState, useCallback } from 'react';
import { getGymProfile, updateGymProfile, getGymMembershipPlans, createGymMembershipPlan, deleteGymMembershipPlan, getGymTrainers, createGymTrainer, deleteGymTrainer, type GymProfile } from '@/lib/gym';
import { AdminPageHeader } from '@/components/admin/page-header';
import { LoadingState } from '@/components/admin/loading-state';
import { getErrorMessage } from '@/lib/errors';
import { ImageUpload } from '@/components/admin/image-upload';
import { SettingField as Field, Input as TextInput } from '../settings/_components/field';
import * as Icons from 'lucide-react';

export default function WebsiteBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GymProfile | null>(null);
  const [catalogPlans, setCatalogPlans] = useState<any[]>([]);
  const [catalogTrainers, setCatalogTrainers] = useState<any[]>([]);

  // Active step/tab in configuration accordion
  const [activeStep, setActiveStep] = useState<string>('template');
  
  // Real-time preview device toggle ('desktop' | 'mobile')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Website Form State
  const [form, setForm] = useState<Partial<GymProfile>>({
    website_enabled: false,
    website_template: 'modern',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    custom_domain: '',
    custom_domain_verified: false,
    banner_image: '',
    latitude: 0,
    longitude: 0,
    services: [],
    opening_hours: {},
    social_links: { facebook: '', instagram: '', youtube: '' },
    pricing_plans: [],
    trainers_data: [],
    classes_data: [],
    blogs_data: [],
    gallery_images: []
  });

  const fetchCatalogPlans = useCallback(async () => {
    try {
      const res = await getGymMembershipPlans();
      if (res && (res as any).data) {
        setCatalogPlans((res as any).data);
      }
    } catch (err) {
      console.error("Failed to load catalog plans", err);
    }
  }, []);

  // Fetch trainers from primary catalog
  const fetchCatalogTrainers = useCallback(async () => {
    try {
      const res = await getGymTrainers();
      if (res && (res as any).data) {
        setCatalogTrainers((res as any).data);
      }
    } catch (err) {
      console.error("Failed to load catalog trainers", err);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      await fetchCatalogPlans();
      await fetchCatalogTrainers();
      const res = await getGymProfile();
      const p = (res as any).data;
      setProfile(p);
      setForm({
        website_enabled: p.website_enabled ?? false,
        website_template: p.website_template ?? 'modern',
        seo_title: p.seo_title ?? '',
        seo_description: p.seo_description ?? '',
        seo_keywords: p.seo_keywords ?? '',
        custom_domain: p.custom_domain ?? '',
        custom_domain_verified: p.custom_domain_verified ?? false,
        banner_image: p.banner_image ?? '',
        latitude: p.latitude ?? 28.6139, // Default to Delhi coordinates
        longitude: p.longitude ?? 77.2090,
        services: p.services ?? ['Cardio Zone', 'Strength Training', 'Personal Coaching', 'Yoga & Meditation'],
        opening_hours: p.opening_hours ?? {
          'Monday - Friday': '6:00 AM - 10:00 PM',
          'Saturday': '8:00 AM - 8:00 PM',
          'Sunday': 'Closed',
        },
        social_links: p.social_links ?? { facebook: '', instagram: '', youtube: '' },
        pricing_plans: p.pricing_plans ?? [
          { name: 'Standard Club', price: '$29/mo', features: ['Gym Floor Access', 'Locker Room Access'] },
          { name: 'Elite Premium', price: '$79/mo', features: ['24/7 Access', 'Unlimited Yoga Classes', 'Dedicated Coach'] }
        ],
        trainers_data: p.trainers_data ?? [
          { name: 'Alex Rivera', specialization: 'Bodybuilding Specialist', avatar: '' },
          { name: 'Sarah Connor', specialization: 'Cardio & HIIT Coach', avatar: '' }
        ],
        classes_data: p.classes_data ?? [
          { name: 'Martial Arts', description: 'Master defensive tactics, flexibility, and physical discipline.', duration: '60 mins', intensity: 'High', image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=800&q=80', trainer: 'Alex Rivera' },
          { name: 'Endurance Running', description: 'Build supreme cardiovascular conditioning and lower body strength.', duration: '45 mins', intensity: 'Medium', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80', trainer: 'Sarah Connor' },
          { name: 'Yoga & Meditation', description: 'Realign your breathing, improve focus, and restore joints.', duration: '50 mins', intensity: 'Low', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80', trainer: 'Sarah Connor' }
        ],
        blogs_data: p.blogs_data ?? [
          { title: 'Boost your fitness with our new gym challenge', excerpt: 'Start our custom 30-day conditioning and lifting sprint. Get matched with professional meal trackers and direct coach mentorship.', date: '5 Jun', year: '2026', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80' },
          { title: 'Keep Your Body Healthy Over the Festive Season', excerpt: 'A simple guide to balanced nutrition, daily active movement, and keeping up your hydration during family holidays.', date: '18 Jun', year: '2026', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80' }
        ],
        gallery_images: p.gallery_images ?? [
          { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', category: 'yoga', caption: 'Vinyasa Flow Studio' },
          { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80', category: 'fitness', caption: 'Premium Cardio Deck' },
          { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', category: 'gym', caption: 'Strength Training Arena' }
        ]
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
  const [newPlan, setNewPlan] = useState({ name: '', price: '', duration_days: '30', features: '' });
  const addPlan = async () => {
    if (!newPlan.name.trim() || !newPlan.price.trim() || !newPlan.duration_days.trim()) return;
    setError(null);
    try {
      await createGymMembershipPlan({
        name: newPlan.name.trim(),
        price: parseFloat(newPlan.price) || 0,
        duration_days: parseInt(newPlan.duration_days) || 30,
        features: newPlan.features.split(',').map(f => f.trim()).filter(Boolean)
      });
      setNewPlan({ name: '', price: '', duration_days: '30', features: '' });
      await fetchCatalogPlans();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };
  const removePlan = async (id: number) => {
    if (!confirm('Are you sure you want to delete this membership plan? It will no longer show on the website.')) return;
    setError(null);
    try {
      await deleteGymMembershipPlan(id);
      await fetchCatalogPlans();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Trainers helpers
  const [newTrainer, setNewTrainer] = useState({ full_name: '', email: '', phone: '', specialization: '', avatar: '' });
  const addTrainer = async () => {
    if (!newTrainer.full_name.trim() || !newTrainer.specialization.trim()) return;
    setError(null);
    try {
      await createGymTrainer({
        full_name: newTrainer.full_name.trim(),
        email: newTrainer.email.trim(),
        phone: newTrainer.phone.trim(),
        specialization: newTrainer.specialization.trim(),
      });
      setNewTrainer({ full_name: '', email: '', phone: '', specialization: '', avatar: '' });
      await fetchCatalogTrainers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };
  const removeTrainer = async (id: number) => {
    if (!confirm('Are you sure you want to delete this trainer?')) return;
    setError(null);
    try {
      await deleteGymTrainer(id);
      await fetchCatalogTrainers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Classes helpers
  const [newClass, setNewClass] = useState({ name: '', description: '', duration: '', intensity: 'Medium', image: '', trainer: '' });
  const addClass = () => {
    if (!newClass.name.trim() || !newClass.description.trim()) return;
    setForm(prev => ({ ...prev, classes_data: [...(prev.classes_data || []), newClass] }));
    setNewClass({ name: '', description: '', duration: '', intensity: 'Medium', image: '', trainer: '' });
  };
  const removeClass = (idx: number) => {
    setForm(prev => ({ ...prev, classes_data: (prev.classes_data || []).filter((_, i) => i !== idx) }));
  };

  // Blogs helpers
  const [newBlog, setNewBlog] = useState({ title: '', excerpt: '', date: '', year: '', image: '' });
  const addBlog = () => {
    if (!newBlog.title.trim() || !newBlog.excerpt.trim()) return;
    
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = newBlog.date.trim() || `${now.getDate()} ${months[now.getMonth()]}`;
    const formattedYear = newBlog.year.trim() || `${now.getFullYear()}`;

    const blogObj = {
      ...newBlog,
      date: formattedDate,
      year: formattedYear
    };

    setForm(prev => ({ ...prev, blogs_data: [...(prev.blogs_data || []), blogObj] }));
    setNewBlog({ title: '', excerpt: '', date: '', year: '', image: '' });
  };
  const removeBlog = (idx: number) => {
    setForm(prev => ({ ...prev, blogs_data: (prev.blogs_data || []).filter((_, i) => i !== idx) }));
  };

  // Gallery helpers
  const [newGalleryItem, setNewGalleryItem] = useState({ url: '', category: 'gym', caption: '' });
  const addGalleryItem = () => {
    if (!newGalleryItem.url.trim()) return;
    setForm(prev => ({
      ...prev,
      gallery_images: [...(prev.gallery_images || []), newGalleryItem]
    }));
    setNewGalleryItem({ url: '', category: 'gym', caption: '' });
  };
  const removeGalleryItem = (idx: number) => {
    setForm(prev => ({ ...prev, gallery_images: (prev.gallery_images || []).filter((_, i) => i !== idx) }));
  };

  // Save Website changes
  const handleSave = async () => {
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      await updateGymProfile(form);
      setSuccess('Your website has been built and saved successfully!');
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  const previewTheme = form.website_template || 'modern';
  const previewSlug = profile?.slug || 'my-gym';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Public Website Builder"
        description="Design your premium search-ready public landing page, manage templates, and configure search rankings."
      />

      {/* Floating Publication & Actions Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[color:var(--app-border)] shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${form.website_enabled ? 'bg-emerald-50 text-emerald-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
            <Icons.Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              Status: {form.website_enabled ? (
                <span className="text-emerald-600">Live on the Web</span>
              ) : (
                <span className="text-slate-500">Draft Mode (Unpublished)</span>
              )}
            </div>
            <p className="text-xs text-[color:var(--app-muted)]">
              {form.website_enabled ? 'Anyone on Google can search and view your gym.' : 'Only you can preview it in your admin panel.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Draft Toggle */}
          <button
            type="button"
            onClick={() => setForm(prev => ({ ...prev, website_enabled: !prev.website_enabled }))}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition border ${
              form.website_enabled 
                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            {form.website_enabled ? 'Unpublish Page' : 'Go Live / Publish'}
          </button>

          {/* View Live URL */}
          <a
            href={`/gyms/${previewSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold px-4 py-2 rounded-xl text-xs transition border border-slate-200"
          >
            Open Live Site <Icons.ExternalLink className="h-3.5 w-3.5" />
          </a>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-2 rounded-xl text-xs transition shadow-sm disabled:opacity-50"
          >
            {saving && <Icons.Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save Website Changes
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <Icons.CheckCircle2 className="h-5 w-5 text-emerald-600" /> {success}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
          <Icons.AlertCircle className="h-5 w-5 text-rose-600" /> {error}
        </div>
      )}

      {/* Main Builder Grid Workspace */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Dynamic Easy-Config Accordion Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-[color:var(--app-border)] overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
                <Icons.Sliders className="h-5 w-5 text-indigo-600" /> Design & Configure
              </h2>
              <p className="text-xs text-[color:var(--app-muted)] mt-1">Configure your layout and parameters in simple sections.</p>
            </div>

            {/* Accordion List */}
            <div className="divide-y divide-slate-100">

              {/* 1. Template Layout Selection */}
              <div>
                <button
                  onClick={() => setActiveStep(activeStep === 'template' ? '' : 'template')}
                  className="w-full px-5 py-4 flex justify-between items-center text-left font-bold text-sm text-slate-900 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2"><Icons.Palette className="h-4.5 w-4.5 text-sky-500" /> 1. Choose Design Template</span>
                  <Icons.ChevronDown className={`h-4.5 w-4.5 transition-transform ${activeStep === 'template' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeStep === 'template' && (
                  <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-4">
                    <p className="text-xs text-slate-500">Pick from our premium, pre-built high-converting layout styles. Switching takes effect in the real-time preview instantly!</p>
                    
                    {/* Visual Templates Cards */}
                    <div className="grid gap-3">
                      {[
                        { id: 'modern', name: 'Luxury Wellness & Spa', desc: 'Clean elegant curves, gold/sage accents, and minimalist premium layouts.', colors: 'bg-gradient-to-r from-emerald-500 via-amber-500 to-slate-700' },
                        { id: 'glass', name: 'Cyberpunk Glass & Glow', desc: 'Futuristic frosted translucent containers, glowing neon cyber accents, and deep blurs.', colors: 'bg-gradient-to-r from-cyan-400 via-purple-600 to-pink-500' },
                        { id: 'dark', name: 'Hardcore Iron & Strength', desc: 'Bold high-contrast orange & black rugged layouts styled for high-converting strength clubs.', colors: 'bg-gradient-to-r from-black via-orange-600 to-zinc-900' }
                      ].map(tmpl => (
                        <div
                          key={tmpl.id}
                          onClick={() => setForm(prev => ({ ...prev, website_template: tmpl.id }))}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex gap-4 ${
                            form.website_template === tmpl.id 
                              ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-500' 
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl ${tmpl.colors} shrink-0 flex items-center justify-center text-white font-extrabold`}>
                            {tmpl.name[0]}
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                              {tmpl.name}
                              {form.website_template === tmpl.id && <Icons.CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tmpl.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Hero and Branding */}
              <div>
                <button
                  onClick={() => setActiveStep(activeStep === 'branding' ? '' : 'branding')}
                  className="w-full px-5 py-4 flex justify-between items-center text-left font-bold text-sm text-slate-900 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2"><Icons.Image className="h-4.5 w-4.5 text-emerald-500" /> 2. Hero & Branding Banner</span>
                  <Icons.ChevronDown className={`h-4.5 w-4.5 transition-transform ${activeStep === 'branding' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeStep === 'branding' && (
                  <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-4">
                    <ImageUpload
                      label="Main Hero Banner Image"
                      value={form.banner_image || ''}
                      onChange={(url) => setForm(prev => ({ ...prev, banner_image: url }))}
                    />
                    <div className="space-y-2 mt-4">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tagline / Main Headline</label>
                      <TextInput
                        placeholder="e.g. Unleash Your Peak Athletic Performance Today"
                        value={form.seo_title || ''}
                        onChange={(e) => setForm(prev => ({ ...prev, seo_title: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Dynamic Services List */}
              <div>
                <button
                  onClick={() => setActiveStep(activeStep === 'services' ? '' : 'services')}
                  className="w-full px-5 py-4 flex justify-between items-center text-left font-bold text-sm text-slate-900 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2"><Icons.Layers className="h-4.5 w-4.5 text-amber-500" /> 3. Managed Services List</span>
                  <Icons.ChevronDown className={`h-4.5 w-4.5 transition-transform ${activeStep === 'services' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeStep === 'services' && (
                  <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-4">
                    <p className="text-xs text-slate-500">Provide an attractive tags-based list of workouts, machines, or benefits you offer inside your facility.</p>
                    
                    <div className="flex gap-2">
                      <TextInput
                        placeholder="Add new service tag (e.g. Steam Room)"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={addService}
                        className="px-4 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {form.services?.map((serv, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 border border-slate-200">
                          <span>{serv}</span>
                          <button type="button" onClick={() => removeService(idx)} className="text-rose-500 hover:text-rose-700">
                            <Icons.X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Membership Plans */}
              <div>
                <button
                  onClick={() => setActiveStep(activeStep === 'plans' ? '' : 'plans')}
                  className="w-full px-5 py-4 flex justify-between items-center text-left font-bold text-sm text-slate-900 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2"><Icons.CreditCard className="h-4.5 w-4.5 text-indigo-500" /> 4. Membership Plans</span>
                  <Icons.ChevronDown className={`h-4.5 w-4.5 transition-transform ${activeStep === 'plans' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeStep === 'plans' && (
                  <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-4">
                    <div className="space-y-3 p-3 bg-white border border-slate-200 rounded-2xl">
                      <Field label="Plan Name"><TextInput placeholder="e.g. VIP Access Card" value={newPlan.name} onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))} /></Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Price (₹)"><TextInput type="number" placeholder="e.g. 1500" value={newPlan.price} onChange={(e) => setNewPlan(prev => ({ ...prev, price: e.target.value }))} /></Field>
                        <Field label="Duration (Days)"><TextInput type="number" placeholder="e.g. 30" value={newPlan.duration_days} onChange={(e) => setNewPlan(prev => ({ ...prev, duration_days: e.target.value }))} /></Field>
                      </div>
                      <Field label="Key Benefits (Comma separated)"><TextInput placeholder="Locker, Sauna, Unlimited Coaching" value={newPlan.features} onChange={(e) => setNewPlan(prev => ({ ...prev, features: e.target.value }))} /></Field>
                      <button
                        type="button"
                        onClick={addPlan}
                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition border border-indigo-200"
                      >
                        + Add Plan to Website
                      </button>
                    </div>

                    <div className="space-y-2 mt-4">
                      {catalogPlans && catalogPlans.map((plan) => (
                        <div key={plan.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-200 bg-white">
                          <div>
                            <span className="font-extrabold text-xs text-slate-900">{plan.name}</span>
                            <span className="ml-2 font-bold text-xs text-indigo-600">₹{plan.price} / {plan.duration_days} Days</span>
                          </div>
                          <button type="button" onClick={() => removePlan(plan.id)} className="text-rose-500 hover:text-rose-700">
                            <Icons.Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Trainers */}
              <div>
                <button
                  onClick={() => setActiveStep(activeStep === 'trainers' ? '' : 'trainers')}
                  className="w-full px-5 py-4 flex justify-between items-center text-left font-bold text-sm text-slate-900 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2"><Icons.Users className="h-4.5 w-4.5 text-pink-500" /> 5. Trainer Roster</span>
                  <Icons.ChevronDown className={`h-4.5 w-4.5 transition-transform ${activeStep === 'trainers' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeStep === 'trainers' && (
                  <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-4">
                    <div className="space-y-3 p-3 bg-white border border-slate-200 rounded-2xl">
                      <Field label="Full Name"><TextInput placeholder="e.g. John Doe" value={newTrainer.full_name} onChange={(e) => setNewTrainer(prev => ({ ...prev, full_name: e.target.value }))} /></Field>
                      <Field label="Email"><TextInput placeholder="e.g. john@example.com" value={newTrainer.email} onChange={(e) => setNewTrainer(prev => ({ ...prev, email: e.target.value }))} /></Field>
                      <Field label="Phone"><TextInput placeholder="e.g. +1 555 1234" value={newTrainer.phone} onChange={(e) => setNewTrainer(prev => ({ ...prev, phone: e.target.value }))} /></Field>
                      <Field label="Specialization"><TextInput placeholder="e.g. Weight Loss Expert" value={newTrainer.specialization} onChange={(e) => setNewTrainer(prev => ({ ...prev, specialization: e.target.value }))} /></Field>
                      <ImageUpload label="Trainer Avatar" value={newTrainer.avatar} onChange={(url) => setNewTrainer(prev => ({ ...prev, avatar: url }))} />
                      <button
                        type="button"
                        onClick={addTrainer}
                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition border border-indigo-200"
                      >
                        + Add Trainer to Website
                      </button>
                    </div>

                    <div className="grid gap-2 mt-4">
                      {catalogTrainers?.map((tr) => (
                        <div key={tr.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-200 bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center">
                              {tr.avatar ? <img src={tr.avatar} alt="" className="w-full h-full object-cover" /> : <Icons.User className="h-4 w-4 text-slate-400" />}
                            </div>
                            <div>
                              <p className="font-extrabold text-xs text-slate-900">{tr.full_name}</p>
                              <p className="text-[10px] text-slate-500">{tr.specialization}</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeTrainer(tr.id)} className="text-rose-500 hover:text-rose-700">
                            <Icons.Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 5a. Manage Classes */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep === 'classes' ? '' : 'classes')}
                  className="w-full px-5 py-4 flex justify-between items-center text-left font-bold text-sm text-slate-900 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2"><Icons.Dumbbell className="h-4.5 w-4.5 text-indigo-500" /> 5a. Manage Classes</span>
                  <Icons.ChevronDown className={`h-4.5 w-4.5 transition-transform ${activeStep === 'classes' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeStep === 'classes' && (
                  <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-4">
                    <div className="space-y-3 p-3 bg-white border border-slate-200 rounded-2xl">
                      <Field label="Class Name"><TextInput placeholder="e.g. Martial Arts" value={newClass.name} onChange={(e) => setNewClass(prev => ({ ...prev, name: e.target.value }))} /></Field>
                      <Field label="Description"><TextInput placeholder="e.g. Master defensive tactics..." value={newClass.description} onChange={(e) => setNewClass(prev => ({ ...prev, description: e.target.value }))} /></Field>
                      <Field label="Duration"><TextInput placeholder="e.g. 60 mins" value={newClass.duration} onChange={(e) => setNewClass(prev => ({ ...prev, duration: e.target.value }))} /></Field>
                      
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Intensity</label>
                        <select
                          value={newClass.intensity}
                          onChange={(e) => setNewClass(prev => ({ ...prev, intensity: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Assign Trainer</label>
                        <select
                          value={newClass.trainer}
                          onChange={(e) => setNewClass(prev => ({ ...prev, trainer: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                        >
                          <option value="">Select Trainer...</option>
                          {catalogTrainers?.map((t) => (
                            <option key={t.id} value={t.full_name}>{t.full_name}</option>
                          ))}
                        </select>
                      </div>

                      <ImageUpload label="Class Image" value={newClass.image} onChange={(url) => setNewClass(prev => ({ ...prev, image: url }))} />
                      
                      <button
                        type="button"
                        onClick={addClass}
                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition border border-indigo-200"
                      >
                        + Add Class to Website
                      </button>
                    </div>

                    <div className="grid gap-2 mt-4">
                      {form.classes_data?.map((cls, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-200 bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center">
                              {cls.image ? <img src={cls.image} alt="" className="w-full h-full object-cover" /> : <Icons.Dumbbell className="h-4 w-4 text-slate-400" />}
                            </div>
                            <div>
                              <p className="font-extrabold text-xs text-slate-900">{cls.name}</p>
                              <p className="text-[10px] text-slate-500">{cls.duration} • {cls.intensity} • Coach: {cls.trainer || 'None'}</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeClass(idx)} className="text-rose-500 hover:text-rose-700">
                            <Icons.Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 5b. Manage Blogs / Posts */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep === 'blogs' ? '' : 'blogs')}
                  className="w-full px-5 py-4 flex justify-between items-center text-left font-bold text-sm text-slate-900 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2"><Icons.BookOpen className="h-4.5 w-4.5 text-amber-500" /> 5b. Manage Blogs / Posts</span>
                  <Icons.ChevronDown className={`h-4.5 w-4.5 transition-transform ${activeStep === 'blogs' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeStep === 'blogs' && (
                  <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-4">
                    <div className="space-y-3 p-3 bg-white border border-slate-200 rounded-2xl">
                      <Field label="Post Title"><TextInput placeholder="e.g. Give your fitness a boost" value={newBlog.title} onChange={(e) => setNewBlog(prev => ({ ...prev, title: e.target.value }))} /></Field>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Short Excerpt</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Start our custom 30-day conditioning and lifting sprint..."
                          value={newBlog.excerpt}
                          onChange={(e) => setNewBlog(prev => ({ ...prev, excerpt: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 resize-none font-medium"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Date (e.g. 5 Jun)"><TextInput placeholder="e.g. 5 Jun" value={newBlog.date} onChange={(e) => setNewBlog(prev => ({ ...prev, date: e.target.value }))} /></Field>
                        <Field label="Year (e.g. 2026)"><TextInput placeholder="e.g. 2026" value={newBlog.year} onChange={(e) => setNewBlog(prev => ({ ...prev, year: e.target.value }))} /></Field>
                      </div>
                      
                      <ImageUpload label="Cover Image" value={newBlog.image} onChange={(url) => setNewBlog(prev => ({ ...prev, image: url }))} />
                      
                      <button
                        type="button"
                        onClick={addBlog}
                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition border border-indigo-200"
                      >
                        + Add Post to Website
                      </button>
                    </div>

                    <div className="grid gap-2 mt-4">
                      {form.blogs_data?.map((post, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-200 bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center">
                              {post.image ? <img src={post.image} alt="" className="w-full h-full object-cover" /> : <Icons.BookOpen className="h-4 w-4 text-slate-400" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-extrabold text-xs text-slate-900 truncate">{post.title}</p>
                              <p className="text-[10px] text-slate-500 truncate">{post.date}, {post.year}</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeBlog(idx)} className="text-rose-500 hover:text-rose-700">
                            <Icons.Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 5c. Manage Facility Gallery */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep === 'gallery' ? '' : 'gallery')}
                  className="w-full px-5 py-4 flex justify-between items-center text-left font-bold text-sm text-slate-900 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2"><Icons.Image className="h-4.5 w-4.5 text-pink-500" /> 5c. Manage Facility Gallery</span>
                  <Icons.ChevronDown className={`h-4.5 w-4.5 transition-transform ${activeStep === 'gallery' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeStep === 'gallery' && (
                  <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-4">
                    <div className="space-y-3 p-3 bg-white border border-slate-200 rounded-2xl">
                      <ImageUpload label="Gallery Image File" value={newGalleryItem.url} onChange={(url) => setNewGalleryItem(prev => ({ ...prev, url: url }))} />
                      
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
                        <select
                          value={newGalleryItem.category}
                          onChange={(e) => setNewGalleryItem(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                        >
                          <option value="gym">Gym Floor / Strength</option>
                          <option value="fitness">Cardio / HIIT / Fitness</option>
                          <option value="yoga">Yoga / Meditation</option>
                          <option value="running">Running / Track</option>
                        </select>
                      </div>

                      <Field label="Custom Caption"><TextInput placeholder="e.g. Strength Training Room" value={newGalleryItem.caption} onChange={(e) => setNewGalleryItem(prev => ({ ...prev, caption: e.target.value }))} /></Field>
                      
                      <button
                        type="button"
                        onClick={addGalleryItem}
                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition border border-indigo-200"
                      >
                        + Add Image to Gallery
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {form.gallery_images?.map((img: any, idx) => {
                        const url = typeof img === 'string' ? img : img.url;
                        const caption = typeof img === 'string' ? 'Facility' : img.caption;
                        const category = typeof img === 'string' ? 'gym' : img.category;
                        return (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-100">
                            {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <Icons.Image className="h-6 w-6 text-slate-400 p-2" />}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                              <span className="text-[9px] font-black uppercase text-white tracking-wider truncate">{category} • {caption}</span>
                              <button
                                type="button"
                                onClick={() => removeGalleryItem(idx)}
                                className="self-end bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg transition animate-none"
                              >
                                <Icons.Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Custom Domains & Maps */}
              <div>
                <button
                  onClick={() => setActiveStep(activeStep === 'domains' ? '' : 'domains')}
                  className="w-full px-5 py-4 flex justify-between items-center text-left font-bold text-sm text-slate-900 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2"><Icons.Link className="h-4.5 w-4.5 text-purple-500" /> 6. Subdomain, Domain & Maps</span>
                  <Icons.ChevronDown className={`h-4.5 w-4.5 transition-transform ${activeStep === 'domains' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeStep === 'domains' && (
                  <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Free Subdomain URL</label>
                      <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs text-slate-600">
                        <span className="font-extrabold text-slate-800">{previewSlug}</span>.gymsaas.com
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Custom Brand Domain</label>
                      <TextInput
                        placeholder="e.g. www.mypowerhouse.com"
                        value={form.custom_domain || ''}
                        onChange={(e) => setForm(prev => ({ ...prev, custom_domain: e.target.value }))}
                      />
                    </div>

                    {form.custom_domain && (
                      <div className="mt-2 p-3 rounded-2xl bg-slate-100 border border-slate-200 text-[10px] space-y-2">
                        <p className="font-extrabold text-slate-800 flex items-center gap-1"><Icons.Info className="h-3.5 w-3.5 text-indigo-600" /> DNS Instructions:</p>
                        <p className="text-slate-600">Add a <strong>CNAME record</strong> pointing to: <strong className="font-mono">cname.gymsaas.com</strong></p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Field label="Latitude"><TextInput type="number" step="any" value={form.latitude ?? ''} onChange={(e) => setForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))} /></Field>
                      <Field label="Longitude"><TextInput type="number" step="any" value={form.longitude ?? ''} onChange={(e) => setForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))} /></Field>
                    </div>
                  </div>
                )}
              </div>

              {/* 7. SEO Configurations */}
              <div>
                <button
                  onClick={() => setActiveStep(activeStep === 'seo' ? '' : 'seo')}
                  className="w-full px-5 py-4 flex justify-between items-center text-left font-bold text-sm text-slate-900 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2"><Icons.Search className="h-4.5 w-4.5 text-rose-500" /> 7. SEO & Google Indexing</span>
                  <Icons.ChevronDown className={`h-4.5 w-4.5 transition-transform ${activeStep === 'seo' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeStep === 'seo' && (
                  <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-4">
                    <Field label="SEO Document Title"><TextInput placeholder="e.g. Power House Gym | Best Fitness Center in Delhi" value={form.seo_title || ''} onChange={(e) => setForm(prev => ({ ...prev, seo_title: e.target.value }))} /></Field>
                    <Field label="Keywords Tag"><TextInput placeholder="e.g. gym, strength, delhi gym, premium workout" value={form.seo_keywords || ''} onChange={(e) => setForm(prev => ({ ...prev, seo_keywords: e.target.value }))} /></Field>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Google Description Snippet</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Premium weight loss, aerobics, and expert coaching programs."
                        value={form.seo_description || ''}
                        onChange={(e) => setForm(prev => ({ ...prev, seo_description: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Visual Live Mockup Browser Frame (7 cols) */}
        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Icons.Eye className="h-4 w-4" /> Live WYSIWYG Real-time Preview
            </span>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  previewDevice === 'desktop' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icons.Monitor className="h-3.5 w-3.5" /> Desktop
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  previewDevice === 'mobile' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icons.Smartphone className="h-3.5 w-3.5" /> Mobile
              </button>
            </div>
          </div>

          {/* Premium Browser Window Container */}
          <div className={`mx-auto rounded-3xl border border-slate-300 shadow-xl overflow-hidden transition-all duration-300 ${
            previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'
          }`}>
            
            {/* Browser Header Bar */}
            <div className="bg-slate-150 border-b border-slate-250 bg-slate-100 px-4 py-3 flex items-center gap-4 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 bg-white rounded-lg border border-slate-200 px-3 py-1 flex items-center justify-between text-[10px] text-slate-400 font-mono shadow-inner select-none truncate">
                <span className="flex items-center gap-1.5 truncate">
                  <Icons.Lock className="h-3 w-3 text-emerald-500 shrink-0" />
                  {form.custom_domain || `${previewSlug}.gymsaas.com`}
                </span>
                <Icons.RotateCw className="h-3 w-3 text-slate-300 shrink-0" />
              </div>
            </div>

            {/* Browser Body View (Live Mockup Layout styling based on selected theme!) */}
            <div className={`h-[580px] overflow-y-auto scrollbar-thin select-none ${
              previewTheme === 'dark' ? 'bg-[#0a0a0a] text-zinc-100' :
              previewTheme === 'glass' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
            }`}>
              
              {/* Navigation simulated */}
              <nav className={`border-b px-4 py-3 flex justify-between items-center text-xs sticky top-0 backdrop-blur-sm z-30 ${
                previewTheme === 'dark' ? 'border-zinc-900 bg-black/90' :
                previewTheme === 'glass' ? 'border-white/5 bg-slate-950/70' : 'border-slate-200/60 bg-white/90'
              }`}>
                <span className="font-extrabold tracking-tight">{profile?.name || 'My Gym'}</span>
                <div className="flex gap-2">
                  <span className={`w-2 h-2 rounded-full ${previewTheme === 'dark' ? 'bg-orange-500' : 'bg-sky-500'}`} />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                </div>
              </nav>

              {/* Hero Section simulated */}
              <header className={`relative py-12 px-6 text-center overflow-hidden border-b ${
                previewTheme === 'dark' ? 'bg-black border-zinc-900' :
                previewTheme === 'glass' ? 'bg-gradient-to-b from-slate-950 to-slate-900 border-white/5' : 'bg-white border-slate-200/60'
              }`}>
                {form.banner_image && (
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <img src={form.banner_image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="relative z-10 max-w-lg mx-auto space-y-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    previewTheme === 'dark' ? 'bg-orange-500/10 text-orange-500' : 'bg-sky-500/10 text-sky-600'
                  }`}>
                    Official Website
                  </span>
                  <h1 className={`text-xl font-black leading-tight sm:text-2xl ${
                    previewTheme === 'dark' ? 'uppercase text-white tracking-tighter' : ''
                  }`}>
                    {form.seo_title || `Welcome to ${profile?.name || 'Our Gym'}`}
                  </h1>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    {profile?.description || 'Your elite destination for strength conditioning, weight management, and performance transformation.'}
                  </p>
                  <div className="flex justify-center gap-2 pt-2">
                    <span className={`font-extrabold text-[10px] px-4 py-2 rounded-full shadow-sm text-white ${
                      previewTheme === 'dark' ? 'bg-orange-600' : 'bg-sky-600'
                    }`}>Join Direct</span>
                    <span className={`font-extrabold text-[10px] px-4 py-2 rounded-full shadow-sm border ${
                      previewTheme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
                    }`}>Call Desk</span>
                  </div>
                </div>
              </header>

              {/* Services simulated */}
              {form.services && form.services.length > 0 && (
                <section className="py-8 px-6 space-y-4">
                  <h2 className={`text-center font-black text-xs tracking-tight ${previewTheme === 'dark' ? 'uppercase text-white' : ''}`}>Our Premium Workouts</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {form.services.slice(0, 4).map((serv, idx) => (
                      <div key={idx} className={`p-3 rounded-2xl border ${
                        previewTheme === 'dark' ? 'bg-zinc-900/40 border-zinc-850' :
                        previewTheme === 'glass' ? 'bg-white/5 border-white/10 backdrop-blur' : 'bg-white border-slate-200 shadow-sm'
                      }`}>
                        <Icons.CheckCircle2 className={`h-4 w-4 mb-1.5 ${previewTheme === 'dark' ? 'text-orange-500' : 'text-sky-500'}`} />
                        <h3 className="font-extrabold text-[10px] truncate">{serv}</h3>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* BMI Widget simulation (NEW in preview!) */}
              <section className="py-8 px-6 space-y-4 border-t border-dashed border-slate-200 dark:border-zinc-800/80">
                <h2 className={`text-center font-black text-xs tracking-tight ${previewTheme === 'dark' ? 'uppercase text-white' : ''}`}>BMI Interactive Calculator</h2>
                <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${
                  previewTheme === 'dark' ? 'bg-zinc-900/20 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  <div className="flex gap-2">
                    <span className={`w-1/2 h-6 rounded-lg ${previewTheme === 'dark' ? 'bg-zinc-950 border border-zinc-800' : 'bg-slate-100'} text-[8px] flex items-center px-2 text-slate-400`}>Height (cm)</span>
                    <span className={`w-1/2 h-6 rounded-lg ${previewTheme === 'dark' ? 'bg-zinc-950 border border-zinc-800' : 'bg-slate-100'} text-[8px] flex items-center px-2 text-slate-400`}>Weight (kg)</span>
                  </div>
                  <div className={`py-1.5 rounded-xl text-center text-[10px] font-black uppercase ${
                    previewTheme === 'dark' ? 'bg-orange-600 text-white' : 'bg-slate-900 text-white'
                  }`}>Calculate BMI</div>
                </div>
              </section>

              {/* Pricing plans simulated */}
              {(() => {
                const previewPlans = catalogPlans && catalogPlans.length > 0
                  ? catalogPlans
                  : [
                      { id: 1, name: 'Standard Club', price: 1500, duration_days: 30 },
                      { id: 2, name: 'Elite Premium', price: 2500, duration_days: 30 }
                    ];
                return (
                  <section className="py-8 px-6 space-y-4 border-t border-dashed border-slate-200 dark:border-zinc-800/80">
                    <h2 className={`text-center font-black text-xs tracking-tight ${previewTheme === 'dark' ? 'uppercase text-white' : ''}`}>Membership Offerings</h2>
                    <div className="grid gap-3">
                      {previewPlans.slice(0, 3).map((plan, idx) => (
                        <div key={plan.id || idx} className={`p-4 rounded-2xl border relative flex justify-between items-center ${
                          previewTheme === 'dark' ? 'bg-zinc-900/40 border-zinc-850' :
                          previewTheme === 'glass' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xs'
                        }`}>
                          <div>
                            <p className="font-extrabold text-[10px]">{plan.name}</p>
                            <p className={`text-[10px] font-black mt-0.5 ${
                              previewTheme === 'dark' ? 'text-orange-500' : 'text-indigo-500'
                            }`}>
                              {typeof plan.price === 'number' || !isNaN(Number(plan.price)) 
                                ? `₹${Number(plan.price).toFixed(2)} / ${plan.duration_days} Days` 
                                : plan.price}
                            </p>
                          </div>
                          <span className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase ${
                            previewTheme === 'dark' ? 'bg-orange-600 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          }`}>
                            Buy
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })()}

              {/* Dynamic Roster simulated */}
              {catalogTrainers && catalogTrainers.length > 0 && (
                <section className="py-8 px-6 space-y-4 border-t border-dashed border-slate-200 dark:border-zinc-800/80">
                  <h2 className={`text-center font-black text-xs tracking-tight ${previewTheme === 'dark' ? 'uppercase text-white' : ''}`}>Elite Personal Coaches</h2>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none justify-center">
                    {catalogTrainers.slice(0, 3).map((tr, idx) => {
                      if (previewTheme === 'dark') {
                        return (
                          <div key={idx} className="bg-white rounded-xl p-2 shrink-0 w-24 border border-slate-100 flex flex-col items-center pb-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                              {tr.avatar ? <img src={tr.avatar} alt="" className="w-full h-full object-cover" /> : <Icons.User className="h-4 w-4 text-slate-400" />}
                            </div>
                              <span className="text-[7px] font-black bg-orange-600 text-white w-[90%] text-center rounded py-0.5 mt-1 truncate">{tr.full_name}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={idx} className="text-center shrink-0 w-20">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 mx-auto bg-slate-100 flex items-center justify-center">
                            {tr.avatar ? <img src={tr.avatar} alt="" className="w-full h-full object-cover" /> : <Icons.User className="h-5 w-5 text-slate-400" />}
                          </div>
                           <p className="font-bold text-[9px] text-slate-900 dark:text-white truncate mt-1">{tr.full_name}</p>
                           <p className="text-[7px] text-slate-500 truncate">{tr.specialization}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Live Preview: Classes Section */}
              {form.classes_data && form.classes_data.length > 0 && (
                <section className="py-8 px-6 space-y-4 border-t border-dashed border-slate-200 dark:border-zinc-800/80">
                  <h2 className={`text-center font-black text-xs tracking-tight ${previewTheme === 'dark' ? 'uppercase text-white' : ''}`}>Featured Classes</h2>
                  <div className="grid gap-3">
                    {form.classes_data.slice(0, 2).map((cls, idx) => (
                      <div key={idx} className={`p-3 rounded-2xl border flex items-center gap-3 ${
                        previewTheme === 'dark' ? 'bg-zinc-900/40 border-zinc-850' :
                        previewTheme === 'glass' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xs'
                      }`}>
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center border border-slate-200">
                          {cls.image ? <img src={cls.image} alt="" className="w-full h-full object-cover" /> : <Icons.Dumbbell className="h-5 w-5 text-slate-400" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-[10px] truncate text-slate-900 dark:text-white">{cls.name}</p>
                          <p className="text-[8px] text-slate-500 truncate">{cls.description}</p>
                        </div>
                        <span className="text-[8px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-white/10 dark:text-cyan-400 font-bold shrink-0">{cls.duration}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Live Preview: Facility Gallery Section */}
              {form.gallery_images && form.gallery_images.length > 0 && (
                <section className="py-8 px-6 space-y-4 border-t border-dashed border-slate-200 dark:border-zinc-800/80">
                  <h2 className={`text-center font-black text-xs tracking-tight ${previewTheme === 'dark' ? 'uppercase text-white' : ''}`}>Facility Gallery</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {form.gallery_images.slice(0, 3).map((img: any, idx) => {
                      const url = typeof img === 'string' ? img : img.url;
                      return (
                        <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-zinc-800">
                          {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <Icons.Image className="h-6 w-6 text-slate-400 p-2" />}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Live Preview: Blogs Section */}
              {form.blogs_data && form.blogs_data.length > 0 && (
                <section className="py-8 px-6 space-y-4 border-t border-dashed border-slate-200 dark:border-zinc-800/80">
                  <h2 className={`text-center font-black text-xs tracking-tight ${previewTheme === 'dark' ? 'uppercase text-white' : ''}`}>Latest Posts</h2>
                  <div className="grid gap-3">
                    {form.blogs_data.slice(0, 2).map((post, idx) => (
                      <div key={idx} className={`p-3 rounded-2xl border flex flex-col gap-2 ${
                        previewTheme === 'dark' ? 'bg-zinc-900/40 border-zinc-850' :
                        previewTheme === 'glass' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xs'
                      }`}>
                        {post.image && (
                          <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-zinc-800">
                            <img src={post.image} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-extrabold text-[10px] text-slate-900 dark:text-white leading-tight">{post.title}</p>
                          <p className="text-[8px] text-slate-500 line-clamp-2 mt-1">{post.excerpt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Operating Hours simulated */}
              <footer className={`py-6 px-6 border-t text-[9px] text-center text-slate-500 ${
                previewTheme === 'dark' ? 'border-zinc-900 bg-black' :
                previewTheme === 'glass' ? 'border-white/5 bg-slate-950/50' : 'border-slate-100 bg-white'
              }`}>
                <p className="font-bold text-slate-900 dark:text-white mb-2">Simulated Working Hours</p>
                {form.opening_hours && Object.entries(form.opening_hours).map(([day, hrs]: any) => (
                  <p key={day} className="text-slate-400">{day}: {hrs}</p>
                ))}
                <p className="mt-4">© {new Date().getFullYear()} {profile?.name || 'My Gym'}. Powered by Gym SaaS.</p>
              </footer>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
