const badgeStyles: Record<string, string> = {
  active: 'bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  on_leave: 'bg-amber-500/12 text-amber-700 ring-amber-500/20 dark:text-amber-300',
  terminated: 'bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:text-rose-300',
  trial: 'bg-sky-500/12 text-sky-700 ring-sky-500/20 dark:text-sky-300',
  paused: 'bg-amber-500/12 text-amber-700 ring-amber-500/20 dark:text-amber-300',
  expired: 'bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:text-rose-300',
  cancelled: 'bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:text-rose-300',
  suspended: 'bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:text-rose-300',
  inactive: 'bg-slate-500/12 text-slate-700 ring-slate-500/20 dark:text-slate-300',
  // Additional statuses for staff/trainers
  completed: 'bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  pending: 'bg-amber-500/12 text-amber-700 ring-amber-500/20 dark:text-amber-300',
  failed: 'bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:text-rose-300',
  refunded: 'bg-fuchsia-500/12 text-fuchsia-700 ring-fuchsia-500/20 dark:text-fuchsia-300',
  present: 'bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  missed: 'bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:text-rose-300',
  paid: 'bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  unpaid: 'bg-slate-500/12 text-slate-700 ring-slate-500/20 dark:text-slate-300',
  overdue: 'bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:text-rose-300',
};

export function StatusBadge({ value }: { value: string }) {
  const key = value.toLowerCase();
  const className = badgeStyles[key] ?? 'bg-sky-500/12 text-sky-700 ring-sky-500/20 dark:text-sky-300';

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${className}`}>
      {value.replaceAll('_', ' ')}
    </span>
  );
}
