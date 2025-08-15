'use client';

import useSWRInfinite from 'swr/infinite';
import { useMemo } from 'react';
import { fetchTraces, type TraceRecord } from '@/api/traces';
import { Trace, TraceStatus } from '@/types/trace';
import { summarizeTrace } from '@/lib/otel';

const PAGE_LIMIT = 50;

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

  const recordsByTraceId = useMemo(() => {
    const map: Record<string, TraceRecord> = {};
    for (const r of flatRecords) {
      map[r.trace_id] = r;
    }
    return map;
  }, [flatRecords]);

  const filteredRecords = useMemo(() => {
    const records = flatRecords;
    if (!searchQuery) return records;
    const q = searchQuery.toLowerCase();
    return records.filter(r =>
      (r.trace_id && r.trace_id.toLowerCase().includes(q)) ||
      (r.servicename && r.servicename.toLowerCase().includes(q))
    );
  }, [flatRecords, searchQuery]);

  const mappedTraces: Trace[] = useMemo(() => {
    return filteredRecords.map(r => {
      const summary = summarizeTrace(r);
      const statusNum = Number(summary.statusCode);
      let status: TraceStatus = TraceStatus.SUCCESS;
      if (Number.isFinite(statusNum) && statusNum >= 400) status = TraceStatus.ERROR;
      return {
        traceId: r.trace_id,
        timestamp: r.timestamp,
        durationMs: summary.durationMs,
        traceStatus: summary.statusText || 'unknown',
        statusCode: summary.statusCode || '',
        name: summary.name || '—',
        statusText: summary.statusText || 'Unknown',
        service: r.servicename || 'unknown',
        status,
      } as Trace;
    });
  }, [filteredRecords]);

  // Show unique trace IDs only (records already unique by trace_id); additionally ensure only parent/root span summarized
  const uniqueMappedTraces = mappedTraces;

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
    data: uniqueMappedTraces,
    recordsByTraceId,
    isLoading,
    error,
    hasMore,
    loadMore,
    resetTraces,
    isValidating,
  } as const;
}


