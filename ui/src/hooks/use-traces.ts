'use client';

import useSWRInfinite from 'swr/infinite';
import { useMemo } from 'react';
import { fetchSpans } from '@/api/traces';
import { Span } from '@/types/span';


const PAGE_LIMIT = 50;

export function useSpans(searchQuery: string) {
  const getKey = (pageIndex: number, previousPageData: Span[] | null) => {
    if (previousPageData && previousPageData.length === 0) return null;
    const offset = pageIndex * PAGE_LIMIT;
    return ['spans', PAGE_LIMIT, offset] as const;
  };

  const fetcher = async (_key: readonly unknown[]): Promise<Span[]> => {
    const limit = _key[1] as number;
    const offset = _key[2] as number;
    return fetchSpans({ limit, offset });
  };

  const {
    data,
    size,
    setSize,
    isLoading,
    isValidating,
    error,
    mutate,
  } = useSWRInfinite<Span[]>(getKey, fetcher, {
    revalidateFirstPage: false,
  });

  console.log(data);

  const filteredRecords = useMemo(() => {
    if (!data) return [];
    const flattenedData = data.flat();
    return flattenedData.filter(r => r.attributes['http.url'] != 'http://localhost:7432/v1/logs');
  }, [data, searchQuery]);

  console.log(filteredRecords);

  const hasMore = useMemo(() => {
    if (!data || data.length === 0) return false;
    const lastPage = data[data.length - 1];
    return lastPage && lastPage.length === PAGE_LIMIT;
  }, [data]);

  const loadMore = () => setSize(size + 1);

  const resetTraces = async () => {
    await mutate([], { revalidate: false });
    await setSize(1);
  };

  return {
    data: filteredRecords,
    isLoading,
    error,
    hasMore,
    loadMore,
    resetTraces,
    isValidating,
  } as const;
}


