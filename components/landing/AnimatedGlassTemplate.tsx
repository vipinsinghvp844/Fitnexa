'use client';

import Link from 'next/link';
import type { PublicCmsContent } from '@/lib/cms';
import * as Icons from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';

export function AnimatedGlassTemplate({ cms }: { cms: PublicCmsContent['cms']; platformName: string }) {
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans text-white overflow-hidden relative selection:bg-indigo-500/30">
      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div style={{ y: yBg }} className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[80%] h-[80%] rounded-full bg-fuchsia-600/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {cms.header_logo_type === 'image' && cms.header_logo_image ? (
              <img src={cms.header_logo_image} alt="Logo" className="h-8 object-contain" />
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20">
                  <Icons.Activity className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                  {cms.header_logo_text || 'SaaS Platform'}
                </span>
              </>
            )}
          </div>
          <nav className="hidden lg:flex gap-8 text-sm font-medium text-slate-300">
            {(cms.header_nav_links || []).map((link, i) => (
              <a key={i} href={link.url} className="hover:text-white transition">{link.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-4 z-10">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">Log in</Link>
            <Link href={cms.hero_cta_url || '/register'} className="hidden sm:block rounded-full bg-white/10 border border-white/20 backdrop-blur-md px-5 py-2 text-sm font-medium text-white transition hover:bg-white/20">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="pt-32 pb-20 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <motion.div {...fadeIn} className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300 backdrop-blur-md">
                  <Icons.Sparkles className="h-4 w-4" /> The Future of Management
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
                >
                  {cms.hero_title}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl"
                >
                  {cms.hero_subtitle}
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link href={cms.hero_cta_url || '/register'} className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 p-[1px] group transition-transform hover:scale-105">
                    <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full px-8 py-4 flex items-center justify-center gap-2">
                      <span className="text-base font-bold text-white shadow-sm">{cms.hero_cta_text || 'Start Free Trial'}</span>
                      <Icons.ArrowRight className="h-5 w-5 text-white" />
                    </div>
                  </Link>
                  <a href="#how-it-works" className="rounded-full px-8 py-4 flex items-center justify-center gap-2 text-slate-300 border border-white/10 hover:bg-white/5 transition-colors">
                    See How it Works
                  </a>
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotateX: 20 }} animate={{ opacity: 1, scale: 1, rotateX: 0 }} transition={{ duration: 1, delay: 0.2 }}
                className="relative perspective-1000 hidden lg:block"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 blur-3xl rounded-full" />
                <img 
                  src={cms.hero_image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop'} 
                  alt="Dashboard Preview" 
                  className="relative w-full rounded-2xl border border-white/10 shadow-2xl shadow-indigo-500/10 object-cover object-top h-[500px]"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* TRUSTED BY */}
        {cms.trusted_by_logos?.length > 0 && (
          <section className="py-12 border-y border-white/5 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6">
              <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">{cms.trusted_by_text}</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-60 grayscale">
                {cms.trusted_by_logos.map((logo, i) => (
                  <span key={i} className="text-xl md:text-2xl font-black tracking-tighter text-white/80">{logo}</span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ABOUT */}
        {(cms.about_title || cms.about_text) && (
          <section id="about" className="py-24 md:py-32 px-6">
            <div className="mx-auto max-w-4xl text-center">
              <motion.h2 initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeIn} className="text-3xl md:text-5xl font-bold mb-8 text-white tracking-tight">
                {cms.about_title}
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="text-xl md:text-2xl text-slate-400 leading-relaxed font-light">
                {cms.about_text}
              </motion.p>
            </div>
          </section>
        )}

        {/* HOW IT WORKS */}
        {cms.how_it_works?.length > 0 && (
          <section id="how-it-works" className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
            <div className="mx-auto max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{cms.how_it_works_title || 'How It Works'}</h2>
                <p className="text-slate-400">{cms.how_it_works_subtitle}</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 relative">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2 z-0" />
                {cms.how_it_works.map((step, idx) => {
                  const Icon = (Icons as any)[step.icon] || Icons.CheckCircle;
                  return (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.2 }} className="relative z-10 text-center">
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 border border-indigo-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                      <p className="text-slate-400 leading-relaxed max-w-xs mx-auto">{step.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* FEATURES */}
        {cms.features?.length > 0 && (
          <section id="features" className="py-32 px-6">
            <div className="mx-auto max-w-7xl">
              <div className="text-center mb-20 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{cms.features_title || 'Core Features'}</h2>
                <p className="text-xl text-slate-400">{cms.features_subtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cms.features.map((feature, idx) => {
                  const Icon = (Icons as any)[feature.icon] || Icons.CheckCircle;
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="group relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-all hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-1"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                      <div className="relative z-10">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-indigo-400 border border-white/10 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-colors">
                          <Icon className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                        <p className="text-slate-400 leading-relaxed font-light">{feature.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* TESTIMONIALS */}
        {cms.testimonials?.length > 0 && (
          <section id="testimonials" className="py-32 px-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-fixed border-y border-white/5 relative">
            <div className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-3xl" />
            <div className="mx-auto max-w-7xl relative z-10">
              <div className="text-center mb-20">
                <h2 className="text-4xl font-bold mb-4 tracking-tight">{cms.testimonials_title || 'What Our Clients Say'}</h2>
                <p className="text-slate-400 text-lg">{cms.testimonials_subtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cms.testimonials.map((t, idx) => (
                  <motion.div 
                    key={idx} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md flex flex-col justify-between"
                  >
                    <div>
                      <Icons.Quote className="h-8 w-8 text-indigo-500/40 mb-6" />
                      <p className="text-lg text-slate-300 mb-8 italic">"{t.content}"</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {t.avatar_url ? (
                        <img src={t.avatar_url} alt={t.name} className="h-12 w-12 rounded-full object-cover border border-white/20" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/20 text-indigo-300">
                          <span className="font-bold">{t.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-white">{t.name}</h4>
                        <p className="text-sm text-slate-400">{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQS */}
        {cms.faqs?.length > 0 && (
          <section id="faq" className="py-32 px-6">
            <div className="mx-auto max-w-3xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold tracking-tight">{cms.faqs_title || 'Frequently Asked Questions'}</h2>
              </div>
              <div className="space-y-4">
                {cms.faqs.map((faq, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
                    <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-lg hover:bg-white/[0.02] transition-colors">
                      {faq.question}
                      <Icons.ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === idx && (
                      <div className="px-6 pb-5 text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FINAL CTA */}
        {cms.cta_title && (
          <section className="py-32 px-6">
            <div className="mx-auto max-w-5xl">
              <div className="rounded-[3rem] bg-gradient-to-br from-indigo-600 to-cyan-600 p-[1px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0" />
                <div className="rounded-[3rem] bg-[#0a0a0f]/40 backdrop-blur-2xl px-8 py-20 text-center relative z-10">
                  <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">{cms.cta_title}</h2>
                  <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">{cms.cta_text}</p>
                  <Link href={cms.cta_button_url || '/register'} className="inline-block rounded-full bg-white px-10 py-4 text-lg font-bold text-indigo-600 transition hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                    {cms.cta_button_text || 'Get Started Now'}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 py-16 px-6 bg-[#050508]">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-500">
              <Icons.Activity className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">{cms.header_logo_text || 'SaaS Platform'}</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            {(cms.header_nav_links || []).map((l, i) => (
              <a key={i} href={l.url} className="hover:text-white transition">{l.label}</a>
            ))}
          </div>
          <p className="text-sm text-slate-500">{cms.footer_text || `© ${new Date().getFullYear()} All rights reserved.`}</p>
        </div>
      </footer>
    </div>
  );
}
