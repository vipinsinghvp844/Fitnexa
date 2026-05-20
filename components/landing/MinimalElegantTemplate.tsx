'use client';

import Link from 'next/link';
import type { PublicCmsContent } from '@/lib/cms';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

export function MinimalElegantTemplate({ cms, platformName }: { cms: PublicCmsContent['cms']; platformName: string }) {
  const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-[#111111] overflow-hidden selection:bg-[#111] selection:text-white">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 mix-blend-difference text-white py-6 px-8 flex items-center justify-between pointer-events-none">
        <div className="font-bold tracking-tighter text-xl pointer-events-auto">{platformName}</div>
        <div className="flex gap-6 items-center pointer-events-auto text-sm font-medium">
          <Link href="/login" className="hover:opacity-70 transition-opacity">Log in</Link>
          <Link href="/register" className="border border-white/20 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-colors">Start Free</Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="min-h-screen flex items-center px-8 pt-32 pb-24 relative">
          <div className="max-w-6xl mx-auto w-full">
            <motion.h1 
              initial="initial" animate="animate" variants={fadeUp}
              className="text-[4rem] md:text-[7rem] leading-[0.9] tracking-tighter font-medium mb-8 max-w-4xl"
            >
              {cms.hero_title}
            </motion.h1>
            <div className="grid md:grid-cols-2 gap-12 items-end">
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }}
                className="text-xl md:text-2xl text-[#666] leading-relaxed max-w-lg font-light"
              >
                {cms.hero_subtitle}
              </motion.p>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}
                className="flex md:justify-end"
              >
                <Link href="/register" className="group flex items-center gap-4 bg-[#111] text-white px-8 py-5 rounded-full hover:bg-black transition-colors text-lg">
                  Get started
                  <Icons.ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* About */}
        {(cms.about_title || cms.about_text) && (
          <section className="py-32 px-8 bg-white border-t border-[#eaeaea]">
            <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <h2 className="text-2xl font-medium tracking-tight">{cms.about_title}</h2>
              </div>
              <div className="md:col-span-8">
                <p className="text-2xl md:text-4xl font-light leading-snug text-[#333]">
                  {cms.about_text}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        {cms.features?.length > 0 && (
          <section className="py-32 px-8 bg-[#f5f5f5]">
            <div className="max-w-6xl mx-auto">
              <div className="mb-20">
                <h2 className="text-4xl md:text-5xl tracking-tighter font-medium">Core Capabilities</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                {cms.features.map((feature, idx) => {
                  const Icon = (Icons as any)[feature.icon] || Icons.Check;
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="group"
                    >
                      <div className="h-px w-full bg-[#e0e0e0] mb-8 group-hover:bg-[#111] transition-colors duration-500" />
                      <div className="mb-6 text-[#666] group-hover:text-[#111] transition-colors">
                        <Icon className="h-8 w-8 stroke-[1.5]" />
                      </div>
                      <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                      <p className="text-[#666] leading-relaxed font-light">{feature.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {cms.testimonials?.length > 0 && (
          <section className="py-32 px-8 bg-[#111] text-white">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-16">
                {cms.testimonials.map((t, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
                    className="flex flex-col justify-between"
                  >
                    <Icons.Quote className="h-10 w-10 text-white/20 mb-8" />
                    <p className="text-2xl md:text-3xl font-light leading-snug mb-12">"{t.content}"</p>
                    <div className="flex items-center gap-4">
                      {t.avatar_url ? (
                        <img src={t.avatar_url} alt={t.name} className="h-12 w-12 rounded-full grayscale object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center font-medium">
                          {t.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{t.name}</div>
                        <div className="text-white/50 text-sm">{t.role}</div>
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
      <footer className="py-12 px-8 border-t border-[#eaeaea] bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#666]">
          <div className="font-medium text-[#111]">{platformName}</div>
          <p>{cms.footer_text || `© ${new Date().getFullYear()} ${platformName}. All rights reserved.`}</p>
        </div>
      </footer>
    </div>
  );
}
