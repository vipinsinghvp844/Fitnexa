'use client';

import { ReactNode } from 'react';

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[30px] border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.40)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-[color:var(--app-text)]">{title}</h3>
            {description ? <p className="mt-2 text-sm leading-6 text-[color:var(--app-muted)]">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--app-border)] text-[color:var(--app-muted)] transition hover:text-[color:var(--app-text)]"
            aria-label="Close modal"
          >
            X
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
