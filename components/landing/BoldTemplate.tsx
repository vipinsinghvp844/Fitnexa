import Link from 'next/link';
import type { PublicCmsContent } from '@/lib/cms';
import * as Icons from 'lucide-react';

export function BoldTemplate({ cms, platformName }: { cms: PublicCmsContent['cms']; platformName: string }) {
  return (
    <div className="min-h-screen bg-gray-950 font-sans text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30">
              <Icons.Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">{platformName}</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition">
              Log in
            </Link>
            <Link href="/register" className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-90">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-32 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.15),transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-violet-500/50 to-transparent" />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            <Icons.Sparkles className="h-4 w-4" />
            The next generation of gym management
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-8 bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            {cms.hero_title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-gray-400 mb-12 leading-relaxed">
            {cms.hero_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-violet-500/25 transition hover:opacity-90 hover:scale-105">
              🚀 Start Free Trial
            </Link>
            <Link href="/login" className="w-full sm:w-auto rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10">
              Sign In
            </Link>
          </div>
        </div>
        {/* Decorative glow */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-violet-600/10 blur-[80px]" />
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 relative">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Everything you need
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Built for serious gym owners who want to grow faster and work smarter.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cms.features.map((feature, idx) => {
              const Icon = (Icons as any)[feature.icon] || Icons.CheckCircle;
              return (
                <div key={idx} className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/3 p-8 backdrop-blur-sm transition hover:border-violet-500/30 hover:bg-violet-500/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-fuchsia-600/5 opacity-0 group-hover:opacity-100 transition" />
                  <div className="relative">
                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-400 ring-1 ring-violet-500/20">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-12 text-center shadow-2xl shadow-violet-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to transform your gym?</h2>
            <p className="text-violet-100 mb-8 text-lg">Join thousands of gym owners who trust {platformName}.</p>
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-violet-700 shadow-xl transition hover:scale-105">
              <Icons.ArrowRight className="h-5 w-5" />
              Get Started Now — It's Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="mx-auto max-w-7xl text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} {platformName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
