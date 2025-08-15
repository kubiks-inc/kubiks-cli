'use client';

import useSWRInfinite from 'swr/infinite';
import { useMemo } from 'react';
import { fetchTraces, type TraceRecord } from '@/api/traces';
import { Trace, TraceStatus } from '@/types/trace';

const PAGE_LIMIT = 20;

function mapRecordToTrace(record: TraceRecord): Trace {
  return {
    traceId: record.trace_id ?? String(record.id),
    timestamp: record.timestamp,
    durationMs: 0,
    traceStatus: 'unknown',
    statusCode: '',
    name: (record as any).name ?? '—',
    statusText: 'Unknown',
    service: record.servicename ?? 'unknown',
    status: TraceStatus.SUCCESS,
  };
}

export function useTraces(searchQuery: string) {
  const getKey = (pageIndex: number, previousPageData: TraceRecord[] | null) => {
    if (previousPageData && previousPageData.length === 0) return null;
    const offset = pageIndex * PAGE_LIMIT;
    return ['traces', PAGE_LIMIT, offset] as const;
  };

  const fetcher = async (_key: readonly unknown[]) => {
    const limit = _key[1] as number;
    const offset = _key[2] as number;
    return fetchTraces({ limit, offset });
  };

  const {
    data,
    size,
    setSize,
    isLoading,
    isValidating,
    error,
    mutate,
  } = useSWRInfinite<TraceRecord[]>(getKey, fetcher, {
    revalidateFirstPage: false,
  });

  const flatRecords = useMemo(() => (data ? ([] as TraceRecord[]).concat(...data) : []), [data]);

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return flatRecords;
    const q = searchQuery.toLowerCase();
    return flatRecords.filter(r =>
      (r.trace_id && r.trace_id.toLowerCase().includes(q)) ||
      (r.servicename && r.servicename.toLowerCase().includes(q))
    );
  }, [flatRecords, searchQuery]);

  const traces: Trace[] = useMemo(() => filteredRecords.map(mapRecordToTrace), [filteredRecords]);

  const hasMore = useMemo(() => {
    if (!data || data.length === 0) return false;
    const lastPage = data[data.length - 1];
    return lastPage.length === PAGE_LIMIT;
  }, [data]);

  const loadMore = () => setSize(size + 1);

  const resetTraces = async () => {
    await mutate([], { revalidate: false });
    await setSize(1);
  };

  return {
    data: traces,
    isLoading,
    error,
    hasMore,
    loadMore,
    resetTraces,
    isValidating,
  } as const;
}


