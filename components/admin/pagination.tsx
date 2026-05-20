'use client';

import { PaginationMeta } from '@/lib/super-admin';

export function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  if (meta.last_page <= 1) {
    return null;
  }

  const pages = Array.from({ length: meta.last_page }, (_, index) => index + 1).slice(
    Math.max(0, meta.current_page - 3),
    Math.max(5, meta.current_page + 2)
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-3">
      <p className="text-sm text-[color:var(--app-muted)]">
        Showing {meta.from ?? 0} to {meta.to ?? 0} of {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(meta.current_page - 1)}
          disabled={meta.current_page <= 1}
          className="rounded-xl border border-[color:var(--app-border)] px-3 py-2 text-sm text-[color:var(--app-text)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>
        {pages.map((page) => (
          <button
            key={`page-${page}`}
            type="button"
            onClick={() => onPageChange(page)}
            className={`rounded-xl px-3 py-2 text-sm ${page === meta.current_page ? 'bg-sky-500 text-white' : 'border border-[color:var(--app-border)] text-[color:var(--app-text)]'}`}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(meta.current_page + 1)}
          disabled={meta.current_page >= meta.last_page}
          className="rounded-xl border border-[color:var(--app-border)] px-3 py-2 text-sm text-[color:var(--app-text)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
