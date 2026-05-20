import { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-6 py-12 text-center shadow-sm">
      <h3 className="text-xl font-semibold text-[color:var(--app-text)]">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[color:var(--app-muted)]">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
