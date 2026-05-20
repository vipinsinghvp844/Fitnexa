import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const toneStyles = {
  default: 'border-[color:var(--app-border)] bg-[color:var(--app-surface)]',
  accent: 'border-sky-200/70 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(255,255,255,0.94))] dark:border-sky-500/20 dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(8,15,28,0.95))]',
  success: 'border-emerald-200/80 bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(255,255,255,0.96))] dark:border-emerald-500/20 dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(8,15,28,0.95))]',
  warning: 'border-amber-200/80 bg-[linear-gradient(135deg,rgba(245,158,11,0.12),rgba(255,255,255,0.96))] dark:border-amber-400/20 dark:bg-[linear-gradient(135deg,rgba(245,158,11,0.14),rgba(8,15,28,0.95))]',
};

export function DashboardCard({
  title,
  description,
  value,
  meta,
  tone = 'default',
  className,
  children,
}: {
  title: string;
  description?: string;
  value?: string;
  meta?: string;
  tone?: keyof typeof toneStyles;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-[28px] border p-5 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur transition dark:shadow-[0_24px_64px_rgba(2,6,23,0.38)]',
        toneStyles[tone],
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-[color:var(--app-muted)]">{title}</h3>
          {description ? <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--app-muted)]">{description}</p> : null}
        </div>
        {meta ? <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-[color:var(--app-muted)] dark:bg-white/8">{meta}</span> : null}
      </div>
      {value ? <p className="mt-5 text-3xl font-semibold tracking-tight text-[color:var(--app-text)]">{value}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
