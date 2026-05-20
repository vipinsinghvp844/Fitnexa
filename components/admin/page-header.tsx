import Link from 'next/link';
import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-[color:var(--app-border)] bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(255,255,255,0.95))] px-6 py-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)] dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(8,15,28,0.96))] sm:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">{eyebrow}</p>
          ) : null}
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--app-text)]">{title}</h1>
          {description ? <p className="mt-3 text-base leading-7 text-[color:var(--app-muted)]">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

export function AdminPrimaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(14,165,233,0.28)] transition hover:-translate-y-0.5 hover:bg-sky-600'
      )}
    >
      {children}
    </Link>
  );
}

export function AdminSecondaryButton({
  type = 'button',
  children,
  onClick,
  disabled,
}: {
  type?: 'button' | 'submit';
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
