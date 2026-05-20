import { cn } from '@/lib/cn';
import { ChartPoint } from '@/lib/super-admin';

export function ChartCard({
  title,
  description,
  points,
  formatValue,
}: {
  title: string;
  description?: string;
  points: ChartPoint[];
  formatValue?: (value: number) => string;
}) {
  const highestPoint = Math.max(...points.map((point) => point.value), 1);

  return (
    <section className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-[0_16px_42px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--app-text)]">{title}</h3>
          {description ? <p className="mt-2 text-sm leading-6 text-[color:var(--app-muted)]">{description}</p> : null}
        </div>
        {points.length ? (
          <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
            {formatValue ? formatValue(points[points.length - 1]?.value ?? 0) : points[points.length - 1]?.value ?? 0}
          </span>
        ) : null}
      </div>

      {points.length ? (
        <div className="mt-6">
          <div className="grid h-60 grid-cols-12 items-end gap-3">
            {points.map((point) => (
              <div key={`${title}-${point.label}`} className="flex h-full flex-col justify-end gap-2">
                <div
                  className={cn('rounded-t-[18px] bg-[linear-gradient(180deg,rgba(14,165,233,0.95),rgba(125,211,252,0.55))] dark:bg-[linear-gradient(180deg,rgba(56,189,248,0.95),rgba(14,165,233,0.22))]')}
                  style={{ height: `${Math.max((point.value / highestPoint) * 100, 6)}%` }}
                />
                <p className="text-[10px] font-medium text-[color:var(--app-muted)]">{point.label.slice(0, 3)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {points.slice(-4).map((point) => (
              <div key={`legend-${title}-${point.label}`} className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] px-3 py-2 text-xs text-[color:var(--app-muted)]">
                <span className="font-semibold text-[color:var(--app-text)]">{point.label}:</span>{' '}
                {formatValue ? formatValue(point.value) : point.value}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[24px] border border-dashed border-[color:var(--app-border)] px-4 py-10 text-center text-sm text-[color:var(--app-muted)]">
          No chart data available yet.
        </div>
      )}
    </section>
  );
}
