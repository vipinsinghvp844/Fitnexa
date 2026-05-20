'use client';

import Link from 'next/link';
import type { PublicCmsContent } from '@/lib/cms';
import * as Icons from 'lucide-react';
import { useState } from 'react';

export function ModernTemplate({ cms }: { cms: PublicCmsContent['cms']; platformName: string }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-sky-500/30">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            {cms.header_logo_type === 'image' && cms.header_logo_image ? (
              <img src={cms.header_logo_image} alt="Logo" className="h-8 object-contain" />
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white">
                  <Icons.Activity className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  {cms.header_logo_text || 'SaaS Platform'}
                </span>
              </>
            )}
          </div>
          <nav className="hidden lg:flex gap-8 text-sm font-medium text-slate-600">
            {(cms.header_nav_links || []).map((link, i) => (
              <a key={i} href={link.url} className="hover:text-sky-600 transition-colors">{link.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">Log in</Link>
            <Link href={cms.hero_cta_url || '/register'} className="hidden sm:block rounded-full bg-sky-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-sky-700 shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-white pt-24 pb-32">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-sky-100/50 rounded-full blur-[100px] -z-10" />
          
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-4xl mx-auto mb-16 relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-700 font-medium">
                <Icons.Rocket className="h-4 w-4" /> Next-generation platform
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                {cms.hero_title}
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                {cms.hero_subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={cms.hero_cta_url || '/register'} className="w-full sm:w-auto rounded-full bg-sky-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-700 hover:-translate-y-0.5 transition-all">
                  {cms.hero_cta_text || 'Start Free Trial'}
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto rounded-full bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                  How it works
                </a>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-200/50 bg-white shadow-2xl shadow-slate-200/50 p-2 z-10 hidden md:block">
              <div className="overflow-hidden rounded-xl bg-slate-100">
                <img 
                  src={cms.hero_image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop'} 
                  alt="Platform Dashboard" 
                  className="w-full h-[500px] object-cover object-top"
                />
              </div>
            </div>
          </div>
        </section>

        {/* TRUSTED BY */}
        {cms.trusted_by_logos?.length > 0 && (
          <section className="py-12 bg-white border-t border-slate-100">
            <div className="mx-auto max-w-7xl px-6 text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">{cms.trusted_by_text}</p>
              <div className="flex flex-wrap justify-center gap-10 md:gap-16 items-center opacity-50 grayscale">
                {cms.trusted_by_logos.map((logo, i) => (
                  <span key={i} className="text-xl md:text-2xl font-black text-slate-800">{logo}</span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ABOUT */}
        {(cms.about_title || cms.about_text) && (
          <section id="about" className="py-24 bg-slate-50 border-y border-slate-200">
            <div className="mx-auto max-w-4xl px-6 text-center">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-8">{cms.about_title}</h2>
              <p className="text-lg md:text-2xl text-slate-600 leading-relaxed font-light">{cms.about_text}</p>
            </div>
          </section>
        )}

        {/* HOW IT WORKS */}
        {cms.how_it_works?.length > 0 && (
          <section id="how-it-works" className="py-24 bg-white">
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">{cms.how_it_works_title}</h2>
                <p className="text-xl text-slate-600">{cms.how_it_works_subtitle}</p>
              </div>
              <div className="grid md:grid-cols-3 gap-12 relative">
                <div className="hidden md:block absolute top-8 left-16 right-16 h-0.5 bg-slate-100 z-0" />
                {cms.how_it_works.map((step, idx) => {
                  const Icon = (Icons as any)[step.icon] || Icons.Check;
                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-600 border-4 border-white shadow-sm">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{step.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* FEATURES */}
        {cms.features?.length > 0 && (
          <section id="features" className="py-24 bg-slate-50 border-y border-slate-200">
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center mb-16 max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">{cms.features_title}</h2>
                <p className="text-xl text-slate-600">{cms.features_subtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cms.features.map((feature, idx) => {
                  const Icon = (Icons as any)[feature.icon] || Icons.CheckCircle;
                  return (
                    <div key={idx} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow">
                      <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* TESTIMONIALS */}
        {cms.testimonials?.length > 0 && (
          <section id="testimonials" className="py-24 bg-white">
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">{cms.testimonials_title}</h2>
                <p className="text-xl text-slate-600">{cms.testimonials_subtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {cms.testimonials.map((t, idx) => (
                  <div key={idx} className="rounded-2xl bg-slate-50 p-8 ring-1 ring-slate-200 flex flex-col justify-between">
                    <div>
                      <Icons.Quote className="h-8 w-8 text-sky-300 mb-6" />
                      <p className="text-lg text-slate-700 mb-8 italic leading-relaxed">"{t.content}"</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {t.avatar_url ? (
                        <img src={t.avatar_url} alt={t.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold ring-2 ring-white shadow-sm">
                          {t.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900">{t.name}</h4>
                        <p className="text-sm text-slate-500">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQs */}
        {cms.faqs?.length > 0 && (
          <section id="faq" className="py-24 bg-slate-50 border-t border-slate-200">
            <div className="mx-auto max-w-3xl px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">{cms.faqs_title}</h2>
              </div>
              <div className="space-y-4">
                {cms.faqs.map((faq, idx) => (
                  <div key={idx} className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
                    <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors">
                      {faq.question}
                      <Icons.ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === idx && (
                      <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FINAL CTA */}
        {cms.cta_title && (
          <section className="py-24 bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-sky-600" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
            <div className="mx-auto max-w-5xl px-6 relative z-10 text-center">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">{cms.cta_title}</h2>
              <p className="text-xl text-sky-100 mb-10 max-w-2xl mx-auto">{cms.cta_text}</p>
              <Link href={cms.cta_button_url || '/register'} className="inline-block rounded-full bg-white px-10 py-4 text-lg font-bold text-sky-600 transition hover:scale-105 shadow-xl shadow-sky-900/20">
                {cms.cta_button_text}
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-16 text-slate-400">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            {cms.header_logo_type === 'image' && cms.header_logo_image ? (
              <img src={cms.header_logo_image} alt="Logo" className="h-6 object-contain grayscale brightness-200 opacity-80" />
            ) : (
              <>
                <Icons.Activity className="h-6 w-6 text-sky-500" />
                <span className="font-bold text-xl">{cms.header_logo_text || 'SaaS Platform'}</span>
              </>
            )}
          </div>
          <div className="flex gap-6">
            {(cms.header_nav_links || []).map((l, i) => (
              <a key={i} href={l.url} className="hover:text-white transition-colors">{l.label}</a>
            ))}
          </div>
          <p>{cms.footer_text || `© ${new Date().getFullYear()} All rights reserved.`}</p>
        </div>
      </footer>
    </div>
  );
}
