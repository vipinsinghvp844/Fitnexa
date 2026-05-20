export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-6 py-16 text-center shadow-sm">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
      <p className="mt-5 text-sm font-medium text-[color:var(--app-muted)]">{label}</p>
    </div>
  );
}
