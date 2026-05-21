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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 sm:p-6 backdrop-blur-sm">
      <div className="relative flex w-full max-w-2xl max-h-full flex-col rounded-[30px] border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] shadow-[0_28px_80px_rgba(2,6,23,0.40)]">
        <div className="flex-none p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-[color:var(--app-text)]">{title}</h3>
              {description ? <p className="mt-2 text-sm leading-6 text-[color:var(--app-muted)]">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--app-border)] text-[color:var(--app-muted)] transition hover:text-[color:var(--app-text)]"
              aria-label="Close modal"
            >
              X
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

