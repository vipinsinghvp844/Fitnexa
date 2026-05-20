'use client';

import { useState } from 'react';
import { useHydrated } from '@/hooks/use-hydrated';
import { DashboardIcon } from './dashboard-icons';

type ThemeMode = 'light' | 'dark';

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem('theme', theme);
}

export function ThemeToggle() {
  const hydrated = useHydrated();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';

    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }

    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] text-[color:var(--app-text)] shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-600 dark:hover:border-sky-500/40 dark:hover:text-sky-300"
      aria-label={hydrated && theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <DashboardIcon name={hydrated && theme === 'dark' ? 'sun' : 'moon'} className="h-5 w-5" />
    </button>
  );
}
