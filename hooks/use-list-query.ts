'use client';

import { startTransition, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export type PrimitiveQuery = Record<string, string | number | undefined>;

export function useListQuery<T extends PrimitiveQuery>(initialQuery: T) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState<T>(initialQuery);

  const updateQuery = (patch: Partial<T>) => {
    const nextQuery = {
      ...query,
      ...patch,
    } as T;

    if ('page' in patch && patch.page === undefined) {
      delete nextQuery.page;
    }

    setQuery(nextQuery);

    const params = new URLSearchParams();
    Object.entries(nextQuery).forEach(([key, value]) => {
      if (value === undefined || value === '') return;
      params.set(key, String(value));
    });

    startTransition(() => {
      router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    });
  };

  return {
    query,
    setQuery,
    updateQuery,
  };
}
