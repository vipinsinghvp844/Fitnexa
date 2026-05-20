import Link from 'next/link';
import type { PublicCmsContent } from '@/lib/cms';
import * as Icons from 'lucide-react';

export function SportsTemplate({ cms, platformName }: { cms: PublicCmsContent['cms']; platformName: string }) {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-emerald-600 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-600">
              <Icons.Dumbbell className="h-5 w-5" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">{platformName}</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-emerald-100">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-emerald-100 hover:text-white transition px-4 py-2">
              Log in
            </Link>
            <Link href="/register" className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 shadow transition hover:bg-emerald-50">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-white" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-white" />
        </div>
        <div className="relative mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white border border-white/20">
                <Icons.Trophy className="h-4 w-4 text-yellow-300" />
                #1 Gym Management Platform
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                {cms.hero_title}
              </h1>
              <p className="text-lg text-emerald-100 mb-8 leading-relaxed">
                {cms.hero_subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register" className="flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-bold text-emerald-700 shadow-lg transition hover:bg-emerald-50">
                  <Icons.Rocket className="h-5 w-5" />
                  Start Free Today
                </Link>
                <Link href="/login" className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="w-72 h-72 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <Icons.Dumbbell className="h-32 w-32 text-white/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-emerald-50 border-y border-emerald-100 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '10,000+', label: 'Active Members' },
              { value: '500+', label: 'Gyms Powered' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Support' },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-3xl font-black text-emerald-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Powerful features for <span className="text-emerald-600">serious gyms</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Everything your team needs to run a thriving fitness business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cms.features.map((feature, idx) => {
              const Icon = (Icons as any)[feature.icon] || Icons.CheckCircle;
              return (
                <div key={idx} className="relative flex flex-col gap-4 rounded-2xl border-2 border-gray-100 p-8 transition hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-3xl rounded-tr-2xl -z-0" />
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600 py-20 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to level up your gym?</h2>
          <p className="text-emerald-100 mb-8 text-lg">Start with a free trial. No credit card required.</p>
          <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-emerald-700 shadow-xl transition hover:bg-emerald-50">
            <Icons.ArrowRight className="h-5 w-5" />
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-6">
        <div className="mx-auto max-w-7xl text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} {platformName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
