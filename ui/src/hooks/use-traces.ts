'use client';

import useSWR from 'swr';
import { useMemo } from 'react';
import { fetchTraces, type TraceRecord } from '@/api/traces';
import { Trace, TraceStatus } from '@/types/trace';

const PAGE_LIMIT = 500; // large page size to minimize requests

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

async function fetchAllTraces(): Promise<TraceRecord[]> {
  const results: TraceRecord[] = [];
  let offset = 0;
  // paginate until API returns empty page
  // prevent runaway: cap at 100k rows
  for (let i = 0; i < 200; i++) {
    const page = await fetchTraces({ limit: PAGE_LIMIT, offset });
    if (!page || page.length === 0) break;
    results.push(...page);
    if (page.length < PAGE_LIMIT) break;
    offset += PAGE_LIMIT;
  }
  return results;
}

export function useTraces(searchQuery: string) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<TraceRecord[]>(
    'all-traces',
    fetchAllTraces,
    { revalidateOnFocus: false }
  );

  const filteredRecords = useMemo(() => {
    const records = data ?? [];
    if (!searchQuery) return records;
    const q = searchQuery.toLowerCase();
    return records.filter(r =>
      (r.trace_id && r.trace_id.toLowerCase().includes(q)) ||
      (r.servicename && r.servicename.toLowerCase().includes(q))
    );
  }, [data, searchQuery]);

  const traces: Trace[] = useMemo(() => filteredRecords.map(mapRecordToTrace), [filteredRecords]);

  const resetTraces = async () => {
    await mutate(undefined, { revalidate: true });
  };

  return {
    data: traces,
    isLoading,
    error,
    hasMore: false,
    loadMore: () => { },
    resetTraces,
    isValidating,
  } as const;
}


