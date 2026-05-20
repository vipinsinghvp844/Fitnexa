'use client';

import Link from 'next/link';
import type { PublicCmsContent } from '@/lib/cms';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

export function DarkNeonTemplate({ cms, platformName }: { cms: PublicCmsContent['cms']; platformName: string }) {
  return (
    <div className="min-h-screen bg-black font-sans text-gray-300 selection:bg-rose-500/30">
      {/* Background Grid & Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-rose-600/20 rounded-full blur-[120px]" />
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Icons.Flame className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-black tracking-widest uppercase text-white">{platformName}</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest text-gray-500">
            <a href="#about" className="hover:text-rose-400 transition-colors">About</a>
            <a href="#features" className="hover:text-rose-400 transition-colors">System</a>
            <a href="#testimonials" className="hover:text-rose-400 transition-colors">Intel</a>
          </nav>
          <div className="flex items-center gap-4 z-10">
            <Link href="/login" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition">Login</Link>
            <Link href="/register" className="relative group overflow-hidden rounded bg-rose-600 px-6 py-2 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all hover:bg-rose-500 hover:shadow-[0_0_30px_rgba(225,29,72,0.6)]">
              <span className="relative z-10">Deploy</span>
              <div className="absolute inset-0 h-full w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="pt-32 pb-24 px-6 min-h-[90vh] flex items-center">
          <div className="mx-auto max-w-6xl w-full">
            <motion.div 
              initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-mono text-rose-400 uppercase tracking-widest">
                <span className="animate-pulse h-2 w-2 bg-rose-500 rounded-full" /> System Online
              </div>
              <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white mb-6 leading-none">
                {cms.hero_title.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 === 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 mb-10 leading-relaxed max-w-2xl font-light">
                {cms.hero_subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-rose-600 px-8 py-4 font-bold uppercase tracking-widest text-white hover:bg-rose-500 transition-colors shadow-[0_0_30px_rgba(225,29,72,0.3)]">
                  Initialize Setup <Icons.Terminal className="h-5 w-5" />
                </Link>
                <Link href="#features" className="inline-flex items-center justify-center gap-2 border border-white/10 px-8 py-4 font-bold uppercase tracking-widest text-white hover:bg-white/5 transition-colors">
                  View Specs
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* About */}
        {(cms.about_title || cms.about_text) && (
          <section id="about" className="py-24 px-6 border-y border-white/5 bg-black/40 backdrop-blur-md">
            <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
              <div>
                <motion.h2 
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                  className="text-4xl font-black uppercase tracking-tight text-white mb-6"
                >
                  {cms.about_title}
                </motion.h2>
                <motion.div className="h-1 w-20 bg-rose-500 mb-8" />
                <motion.p 
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="text-lg text-gray-400 leading-relaxed"
                >
                  {cms.about_text}
                </motion.p>
              </div>
              <div className="relative h-64 md:h-full min-h-[300px] border border-white/10 bg-white/[0.02] overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-screen" />
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-orange-500/10" />
                <Icons.Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 text-white/5 group-hover:text-rose-500/20 transition-colors duration-700" />
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        {cms.features?.length > 0 && (
          <section id="features" className="py-32 px-6">
            <div className="mx-auto max-w-6xl">
              <div className="mb-20">
                <h2 className="text-4xl font-black uppercase tracking-tight text-white mb-2">System Modules</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-rose-500 to-orange-500" />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cms.features.map((feature, idx) => {
                  const Icon = (Icons as any)[feature.icon] || Icons.Zap;
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                      className="group relative border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                      <div className="mb-6 flex h-14 w-14 items-center justify-center border border-white/10 bg-black text-rose-500 group-hover:text-orange-400 group-hover:border-rose-500/50 transition-colors">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-wider text-white mb-4">{feature.title}</h3>
                      <p className="text-gray-400 leading-relaxed text-sm font-light">{feature.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {cms.testimonials?.length > 0 && (
          <section id="testimonials" className="py-24 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-rose-950/20">
            <div className="mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-4">User Intel</h2>
                <p className="text-gray-500 uppercase tracking-widest text-sm">Verified Reports</p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {cms.testimonials.map((t, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    className="border border-rose-500/20 bg-black/60 p-8 relative backdrop-blur-sm"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Icons.Target className="h-24 w-24 text-rose-500" />
                    </div>
                    <p className="text-gray-300 mb-8 relative z-10 leading-relaxed font-light">"{t.content}"</p>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="h-10 w-10 border border-rose-500/50 flex items-center justify-center bg-rose-500/10 text-rose-500 font-bold">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-bold uppercase tracking-wider text-sm">{t.name}</div>
                        <div className="text-rose-500 text-xs uppercase tracking-widest">{t.role}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6 bg-black text-xs font-mono uppercase tracking-widest text-gray-600">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div><span className="text-rose-500">{platformName}</span> // V1.0</div>
          <div>{cms.footer_text || `© ${new Date().getFullYear()} ALL RIGHTS RESERVED`}</div>
        </div>
      </footer>
    </div>
  );
}
