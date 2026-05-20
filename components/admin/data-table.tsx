import { ReactNode } from 'react';
import { EmptyState } from './empty-state';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  className?: string;
  render: (item: T) => ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  mobileRender,
  emptyTitle,
  emptyDescription,
}: {
  data: T[];
  columns: Array<DataTableColumn<T>>;
  rowKey: (item: T) => string;
  mobileRender?: (item: T) => ReactNode;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] shadow-sm">
      <div className="hidden rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-[color:var(--app-border)]">
            <thead className="bg-slate-950 text-slate-300">
              <tr>
                {columns.map((column) => (
                  <th key={column.id} className={`whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] ${column.className ?? ''}`}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--app-border)]">
              {data.map((item) => (
                <tr key={rowKey(item)} className="align-top transition-colors duration-150 hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={`${rowKey(item)}-${column.id}`} className={`whitespace-nowrap px-5 py-3 text-sm text-[color:var(--app-text)] ${column.className ?? ''}`}>
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {data.map((item) => (
          <div key={`mobile-${rowKey(item)}`} className="rounded-[24px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-4 shadow-sm">
            {mobileRender ? mobileRender(item) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
