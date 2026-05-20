import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function StatCard({
  label,
  value,
  hint,
  accent = 'sky',
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: 'sky' | 'emerald' | 'amber';
  icon?: ReactNode;
}) {
  const accentStyles = {
    sky: 'from-sky-500/14 to-sky-100/40 dark:from-sky-500/20 dark:to-sky-900/20',
    emerald: 'from-emerald-500/14 to-emerald-100/40 dark:from-emerald-500/20 dark:to-emerald-900/20',
    amber: 'from-amber-500/14 to-amber-100/40 dark:from-amber-500/20 dark:to-amber-900/20',
  };

  return (
    <div className={cn('rounded-[28px] border border-[color:var(--app-border)] bg-gradient-to-br p-5 shadow-[0_16px_38px_rgba(15,23,42,0.08)]', accentStyles[accent])}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[color:var(--app-muted)]">{label}</p>
        {icon ? <span className="text-[color:var(--app-muted)]">{icon}</span> : null}
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-[color:var(--app-text)]">{value}</p>
      {hint ? <p className="mt-3 text-sm text-[color:var(--app-muted)]">{hint}</p> : null}
    </div>
  );
}
