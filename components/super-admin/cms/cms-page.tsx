'use client';

import { useState, useEffect, FormEvent } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Field, TextInput } from '@/components/admin/fields';
import { ImageUpload } from '@/components/admin/image-upload';
import { LoadingState } from '@/components/admin/loading-state';
import { getSettings, updateSettings, CmsSettings, CmsFeature, CmsTestimonial, CmsFaq, CmsNavLink } from '@/lib/super-admin';
import { getErrorMessage } from '@/lib/errors';
import * as Icons from 'lucide-react';

const TEMPLATES = [
  {
    id: 'animated-glass',
    name: 'Animated Glass (Premium)',
    desc: 'Cutting-edge glassmorphism with smooth framer-motion animations.',
    colors: ['bg-slate-900', 'bg-indigo-500', 'bg-cyan-400'],
    icon: '✨',
  },
  {
    id: 'minimal-elegant',
    name: 'Minimal Elegant (Premium)',
    desc: 'Ultra clean, sophisticated design for high-end SaaS brands.',
    colors: ['bg-[#fafafa]', 'bg-[#111111]', 'bg-[#666666]'],
    icon: '🏛️',
  },
  {
    id: 'dark-neon',
    name: 'Dark Neon (Premium)',
    desc: 'Cyberpunk inspired dark mode with glowing borders.',
    colors: ['bg-black', 'bg-rose-500', 'bg-orange-500'],
    icon: '🔥',
  },
  {
    id: 'modern',
    name: 'Modern Minimal',
    desc: 'Clean, light, and professional. Best for corporate gym brands.',
    colors: ['bg-white', 'bg-sky-500', 'bg-slate-800'],
    icon: '🌟',
  },
  {
    id: 'bold',
    name: 'Bold & Vibrant',
    desc: 'Dark theme with violet gradients. High-energy feel.',
    colors: ['bg-gray-950', 'bg-violet-600', 'bg-fuchsia-500'],
    icon: '⚡',
  },
  {
    id: 'sports',
    name: 'Sports Performance',
    desc: 'Energetic green design. Perfect for fitness & sports branding.',
    colors: ['bg-emerald-600', 'bg-white', 'bg-teal-700'],
    icon: '🏆',
  },
];

export function CmsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'template' | 'header' | 'hero' | 'about' | 'features' | 'how_it_works' | 'testimonials' | 'faqs' | 'cta' | 'seo_footer'>('template');

  const [cmsForm, setCmsForm] = useState<Partial<CmsSettings>>({});

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resSettings = await getSettings();
      if (resSettings.cms) {
        setCmsForm(resSettings.cms);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load CMS settings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updateSettings('cms', cmsForm as any);
      setSuccessMessage('CMS settings saved! Your landing page has been updated.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save CMS settings.'));
    } finally {
      setSaving(false);
    }
  };

  // Array Handlers
  const handleArrayAdd = (key: keyof CmsSettings, defaultObj: any) => {
    setCmsForm(prev => ({
      ...prev,
      [key]: [...(prev[key] as any[] || []), defaultObj],
    }));
  };

  const handleArrayRemove = (key: keyof CmsSettings, index: number) => {
    setCmsForm(prev => ({
      ...prev,
      [key]: (prev[key] as any[]).filter((_, i) => i !== index),
    }));
  };

  const handleArrayUpdate = (arrayKey: keyof CmsSettings, index: number, fieldKey: string, value: string) => {
    setCmsForm(prev => {
      const updated = [...(prev[arrayKey] as any[])];
      updated[index] = { ...updated[index], [fieldKey]: value };
      return { ...prev, [arrayKey]: updated };
    });
  };

  if (loading) return <LoadingState label="Loading CMS configuration..." />;

  const SECTIONS = [
    { id: 'template', label: 'Templates', icon: Icons.LayoutTemplate },
    { id: 'header', label: 'Header & Brand', icon: Icons.PanelTop },
    { id: 'hero', label: 'Hero Section', icon: Icons.Image },
    { id: 'about', label: 'About & Trusted By', icon: Icons.Info },
    { id: 'features', label: 'Features', icon: Icons.Star },
    { id: 'how_it_works', label: 'How it Works', icon: Icons.ListOrdered },
    { id: 'testimonials', label: 'Testimonials', icon: Icons.MessageSquareHeart },
    { id: 'faqs', label: 'FAQs', icon: Icons.HelpCircle },
    { id: 'cta', label: 'Final CTA', icon: Icons.Target },
    { id: 'seo_footer', label: 'SEO & Footer', icon: Icons.Globe2 },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <AdminPageHeader
          eyebrow="Content Management"
          title="CMS & Website Builder"
          description="Control your public marketing website — content, SEO metadata, and design templates."
        />
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-2.5 text-sm font-semibold text-[color:var(--app-text)] hover:bg-[color:var(--app-surface-raised)] transition shadow-sm"
          >
            <Icons.ExternalLink className="h-4 w-4" />
            Preview Site
          </a>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
          <Icons.CheckCircle2 className="h-5 w-5 shrink-0" />
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Section Nav */}
          <aside className="space-y-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSection(s.id as any)}
                  className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeSection === s.id
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                      : 'bg-[color:var(--app-surface)] border border-[color:var(--app-border)] text-[color:var(--app-text)] hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {s.label}
                </button>
              );
            })}
          </aside>

          {/* Content Area */}
          <div className="rounded-3xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-6 md:p-8 min-h-[500px]">

            {/* TEMPLATES */}
            {activeSection === 'template' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[color:var(--app-text)]">Choose Your Template</h2>
                  <p className="mt-1 text-sm text-[color:var(--app-muted)]">Select a design layout. Your content stays the same — only the design changes.</p>
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                  {TEMPLATES.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => setCmsForm({ ...cmsForm, active_template: tpl.id })}
                      className={`cursor-pointer rounded-2xl border-2 overflow-hidden transition-all ${
                        cmsForm.active_template === tpl.id ? 'border-sky-500 shadow-lg shadow-sky-500/15' : 'border-transparent hover:border-[color:var(--app-border-highlight)]'
                      }`}
                    >
                      <div className="h-36 relative overflow-hidden bg-[color:var(--app-surface)]">
                        <div className={`absolute inset-0 flex flex-col`}>
                          <div className={`${tpl.colors[0]} h-8 flex items-center px-3 gap-2`}>
                            <div className={`h-2 w-2 rounded-full ${tpl.colors[1]}`} />
                            <div className={`h-1.5 w-12 rounded ${tpl.colors[2]} opacity-50`} />
                          </div>
                          <div className={`${tpl.colors[0]} flex-1 flex flex-col items-center justify-center gap-1.5 p-3`}>
                            <div className={`h-2.5 w-32 rounded-full ${tpl.colors[1]} opacity-80`} />
                            <div className={`h-1.5 w-24 rounded-full ${tpl.colors[2]} opacity-40`} />
                            <div className={`mt-1 h-5 w-16 rounded-full ${tpl.colors[1]}`} />
                          </div>
                        </div>
                        {cmsForm.active_template === tpl.id && (
                          <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white">
                            <Icons.Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="bg-[color:var(--app-surface-raised)] p-4 relative">
                        {tpl.name.includes('Premium') && (
                          <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Pro</span>
                        )}
                        <div className="flex items-center gap-2 font-bold text-[color:var(--app-text)]">
                          <span>{tpl.icon}</span><span className="pr-8">{tpl.name}</span>
                        </div>
                        <p className="mt-1 text-xs text-[color:var(--app-muted)]">{tpl.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HEADER */}
            {activeSection === 'header' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[color:var(--app-text)]">Header & Branding</h2>
                  <p className="mt-1 text-sm text-[color:var(--app-muted)]">Customize the logo and navigation links.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Logo Type">
                    <select
                      className="w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-3 text-sm text-[color:var(--app-text)] focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      value={cmsForm.header_logo_type || 'text'}
                      onChange={(e) => setCmsForm({ ...cmsForm, header_logo_type: e.target.value as any })}
                    >
                      <option value="text">Text Logo</option>
                      <option value="image">Image Logo</option>
                    </select>
                  </Field>
                  {cmsForm.header_logo_type === 'text' ? (
                    <Field label="Logo Text"><TextInput value={cmsForm.header_logo_text || ''} onChange={(e) => setCmsForm({ ...cmsForm, header_logo_text: e.target.value })} /></Field>
                  ) : (
                    <ImageUpload 
                      label="Logo Image" 
                      value={cmsForm.header_logo_image || ''} 
                      onChange={(url) => setCmsForm({ ...cmsForm, header_logo_image: url })} 
                    />
                  )}
                </div>

                <div className="pt-4 border-t border-[color:var(--app-border)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[color:var(--app-text)]">Navigation Links</h3>
                    <button type="button" onClick={() => handleArrayAdd('header_nav_links', { label: '', url: '' })} className="text-sky-500 text-sm font-semibold hover:underline">+ Add Link</button>
                  </div>
                  <div className="space-y-3">
                    {(cmsForm.header_nav_links || []).map((link, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <TextInput value={link.label} onChange={(e) => handleArrayUpdate('header_nav_links', idx, 'label', e.target.value)} placeholder="Label (e.g. Features)" className="w-1/2" />
                        <TextInput value={link.url} onChange={(e) => handleArrayUpdate('header_nav_links', idx, 'url', e.target.value)} placeholder="URL (e.g. #features)" className="w-1/2" />
                        <button type="button" onClick={() => handleArrayRemove('header_nav_links', idx)} className="text-rose-500"><Icons.X className="h-5 w-5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* HERO */}
            {activeSection === 'hero' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[color:var(--app-text)]">Hero Section</h2>
                  <p className="mt-1 text-sm text-[color:var(--app-muted)]">The main hook of your landing page.</p>
                </div>
                <Field label="Main Headline"><TextInput value={cmsForm.hero_title || ''} onChange={(e) => setCmsForm({ ...cmsForm, hero_title: e.target.value })} /></Field>
                <Field label="Subtitle">
                  <textarea value={cmsForm.hero_subtitle || ''} onChange={(e) => setCmsForm({ ...cmsForm, hero_subtitle: e.target.value })} rows={3} className="w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-3 text-sm text-[color:var(--app-text)] focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none" />
                </Field>
                <ImageUpload 
                  label="Hero Image (Used in some templates)" 
                  value={cmsForm.hero_image || ''} 
                  onChange={(url) => setCmsForm({ ...cmsForm, hero_image: url })} 
                />
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="CTA Button Text"><TextInput value={cmsForm.hero_cta_text || ''} onChange={(e) => setCmsForm({ ...cmsForm, hero_cta_text: e.target.value })} /></Field>
                  <Field label="CTA Button URL"><TextInput value={cmsForm.hero_cta_url || ''} onChange={(e) => setCmsForm({ ...cmsForm, hero_cta_url: e.target.value })} /></Field>
                </div>
              </div>
            )}

            {/* ABOUT & TRUSTED BY */}
            {activeSection === 'about' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-[color:var(--app-text)]">Trusted By (Logos)</h2>
                  <p className="mt-1 text-sm text-[color:var(--app-muted)]">Showcase companies that use your platform.</p>
                </div>
                <Field label="Trusted By Label"><TextInput value={cmsForm.trusted_by_text || ''} onChange={(e) => setCmsForm({ ...cmsForm, trusted_by_text: e.target.value })} /></Field>
                <Field label="Company Names (Comma separated for now)">
                  <TextInput value={(cmsForm.trusted_by_logos || []).join(', ')} onChange={(e) => setCmsForm({ ...cmsForm, trusted_by_logos: e.target.value.split(',').map(s => s.trim()) })} />
                </Field>

                <div className="pt-6 border-t border-[color:var(--app-border)] space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[color:var(--app-text)]">About / Problem-Solution</h2>
                  </div>
                  <Field label="About Title"><TextInput value={cmsForm.about_title || ''} onChange={(e) => setCmsForm({ ...cmsForm, about_title: e.target.value })} /></Field>
                  <Field label="About Text">
                    <textarea value={cmsForm.about_text || ''} onChange={(e) => setCmsForm({ ...cmsForm, about_text: e.target.value })} rows={5} className="w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-3 text-sm text-[color:var(--app-text)] focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none" />
                  </Field>
                </div>
              </div>
            )}

            {/* FEATURES */}
            {activeSection === 'features' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Features Section Title"><TextInput value={cmsForm.features_title || ''} onChange={(e) => setCmsForm({ ...cmsForm, features_title: e.target.value })} /></Field>
                  <Field label="Features Section Subtitle"><TextInput value={cmsForm.features_subtitle || ''} onChange={(e) => setCmsForm({ ...cmsForm, features_subtitle: e.target.value })} /></Field>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[color:var(--app-border)]">
                  <h3 className="font-bold text-[color:var(--app-text)]">Feature Cards</h3>
                  <button type="button" onClick={() => handleArrayAdd('features', { title: '', description: '', icon: 'Zap' })} className="text-sky-500 text-sm font-semibold hover:underline">+ Add Feature</button>
                </div>
                <div className="space-y-4">
                  {(cmsForm.features || []).map((feature, idx) => (
                    <div key={idx} className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-[color:var(--app-text)]">Feature #{idx + 1}</span>
                        <button type="button" onClick={() => handleArrayRemove('features', idx)} className="text-rose-500 text-xs"><Icons.Trash2 className="h-4 w-4" /></button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <Field label="Title"><TextInput value={feature.title} onChange={(e) => handleArrayUpdate('features', idx, 'title', e.target.value)} /></Field>
                        <Field label="Lucide Icon"><TextInput value={feature.icon} onChange={(e) => handleArrayUpdate('features', idx, 'icon', e.target.value)} /></Field>
                        <Field label="Description"><TextInput value={feature.description} onChange={(e) => handleArrayUpdate('features', idx, 'description', e.target.value)} /></Field>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HOW IT WORKS */}
            {activeSection === 'how_it_works' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="How It Works Title"><TextInput value={cmsForm.how_it_works_title || ''} onChange={(e) => setCmsForm({ ...cmsForm, how_it_works_title: e.target.value })} /></Field>
                  <Field label="Subtitle"><TextInput value={cmsForm.how_it_works_subtitle || ''} onChange={(e) => setCmsForm({ ...cmsForm, how_it_works_subtitle: e.target.value })} /></Field>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[color:var(--app-border)]">
                  <h3 className="font-bold text-[color:var(--app-text)]">Steps</h3>
                  <button type="button" onClick={() => handleArrayAdd('how_it_works', { title: '', description: '', icon: 'CheckCircle' })} className="text-sky-500 text-sm font-semibold hover:underline">+ Add Step</button>
                </div>
                <div className="space-y-4">
                  {(cmsForm.how_it_works || []).map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-full grid gap-4 md:grid-cols-3">
                        <TextInput value={step.title} onChange={(e) => handleArrayUpdate('how_it_works', idx, 'title', e.target.value)} placeholder="Step Title" />
                        <TextInput value={step.description} onChange={(e) => handleArrayUpdate('how_it_works', idx, 'description', e.target.value)} placeholder="Description" />
                        <TextInput value={step.icon} onChange={(e) => handleArrayUpdate('how_it_works', idx, 'icon', e.target.value)} placeholder="Icon Name" />
                      </div>
                      <button type="button" onClick={() => handleArrayRemove('how_it_works', idx)} className="text-rose-500 mt-3"><Icons.X className="h-5 w-5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TESTIMONIALS */}
            {activeSection === 'testimonials' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Section Title"><TextInput value={cmsForm.testimonials_title || ''} onChange={(e) => setCmsForm({ ...cmsForm, testimonials_title: e.target.value })} /></Field>
                  <Field label="Section Subtitle"><TextInput value={cmsForm.testimonials_subtitle || ''} onChange={(e) => setCmsForm({ ...cmsForm, testimonials_subtitle: e.target.value })} /></Field>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[color:var(--app-border)]">
                  <h3 className="font-bold text-[color:var(--app-text)]">Reviews</h3>
                  <button type="button" onClick={() => handleArrayAdd('testimonials', { name: '', role: '', content: '', avatar_url: '' })} className="text-sky-500 text-sm font-semibold hover:underline">+ Add Testimonial</button>
                </div>
                <div className="space-y-4">
                  {(cmsForm.testimonials || []).map((t, idx) => (
                    <div key={idx} className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5">
                      <div className="flex justify-end mb-2">
                        <button type="button" onClick={() => handleArrayRemove('testimonials', idx)} className="text-rose-500 text-xs"><Icons.Trash2 className="h-4 w-4" /></button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <Field label="Name"><TextInput value={t.name} onChange={(e) => handleArrayUpdate('testimonials', idx, 'name', e.target.value)} /></Field>
                        <Field label="Role"><TextInput value={t.role} onChange={(e) => handleArrayUpdate('testimonials', idx, 'role', e.target.value)} /></Field>
                        <div className="md:col-span-1">
                          <ImageUpload 
                            label="Avatar" 
                            value={t.avatar_url || ''} 
                            onChange={(url) => handleArrayUpdate('testimonials', idx, 'avatar_url', url)} 
                          />
                        </div>
                        <div className="md:col-span-3">
                          <Field label="Content"><textarea value={t.content} onChange={(e) => handleArrayUpdate('testimonials', idx, 'content', e.target.value)} rows={2} className="w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-3 text-sm" /></Field>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQS */}
            {activeSection === 'faqs' && (
              <div className="space-y-6">
                <Field label="FAQs Title"><TextInput value={cmsForm.faqs_title || ''} onChange={(e) => setCmsForm({ ...cmsForm, faqs_title: e.target.value })} /></Field>
                <div className="flex items-center justify-between pt-4 border-t border-[color:var(--app-border)]">
                  <h3 className="font-bold text-[color:var(--app-text)]">Questions & Answers</h3>
                  <button type="button" onClick={() => handleArrayAdd('faqs', { question: '', answer: '' })} className="text-sky-500 text-sm font-semibold hover:underline">+ Add FAQ</button>
                </div>
                <div className="space-y-4">
                  {(cmsForm.faqs || []).map((faq, idx) => (
                    <div key={idx} className="flex gap-4 items-start rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5">
                      <div className="w-full space-y-4">
                        <TextInput value={faq.question} onChange={(e) => handleArrayUpdate('faqs', idx, 'question', e.target.value)} placeholder="Question" />
                        <textarea value={faq.answer} onChange={(e) => handleArrayUpdate('faqs', idx, 'answer', e.target.value)} placeholder="Answer" rows={2} className="w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-3 text-sm" />
                      </div>
                      <button type="button" onClick={() => handleArrayRemove('faqs', idx)} className="text-rose-500 mt-3"><Icons.Trash2 className="h-5 w-5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FINAL CTA */}
            {activeSection === 'cta' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[color:var(--app-text)]">Final Call to Action</h2>
                  <p className="mt-1 text-sm text-[color:var(--app-muted)]">Appears right above the footer to convert users.</p>
                </div>
                <Field label="CTA Title"><TextInput value={cmsForm.cta_title || ''} onChange={(e) => setCmsForm({ ...cmsForm, cta_title: e.target.value })} /></Field>
                <Field label="CTA Text"><textarea value={cmsForm.cta_text || ''} onChange={(e) => setCmsForm({ ...cmsForm, cta_text: e.target.value })} rows={3} className="w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-3 text-sm" /></Field>
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Button Text"><TextInput value={cmsForm.cta_button_text || ''} onChange={(e) => setCmsForm({ ...cmsForm, cta_button_text: e.target.value })} /></Field>
                  <Field label="Button URL"><TextInput value={cmsForm.cta_button_url || ''} onChange={(e) => setCmsForm({ ...cmsForm, cta_button_url: e.target.value })} /></Field>
                </div>
              </div>
            )}

            {/* SEO & FOOTER */}
            {activeSection === 'seo_footer' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[color:var(--app-text)]">SEO & Footer</h2>
                </div>
                <Field label="SEO Title"><TextInput value={cmsForm.seo_title || ''} onChange={(e) => setCmsForm({ ...cmsForm, seo_title: e.target.value })} /></Field>
                <Field label="SEO Meta Description"><textarea value={cmsForm.seo_description || ''} onChange={(e) => setCmsForm({ ...cmsForm, seo_description: e.target.value })} rows={4} className="w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-3 text-sm" /></Field>
                <div className="pt-6 border-t border-[color:var(--app-border)]">
                  <Field label="Footer Copyright Text"><TextInput value={cmsForm.footer_text || ''} onChange={(e) => setCmsForm({ ...cmsForm, footer_text: e.target.value })} /></Field>
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] px-6 py-4">
          <div className="text-sm text-[color:var(--app-muted)]">
            Changes will reflect immediately on your public website after saving.
          </div>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-sky-600 disabled:opacity-50 transition">
            {saving ? <><Icons.Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Icons.Save className="h-4 w-4" />Save All CMS Settings</>}
          </button>
        </div>
      </form>
    </div>
  );
}
