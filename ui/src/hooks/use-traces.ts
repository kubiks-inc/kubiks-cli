'use client';

import useSWRInfinite from 'swr/infinite';
import { useMemo } from 'react';
import { fetchTraces, type TraceRecord } from '@/api/traces';
import { Trace, TraceStatus } from '@/types/trace';
import { summarizeTrace } from '@/lib/otel';

// OTEL data structure types
interface OtelAttribute {
  key: string;
  value?: {
    stringValue?: string;
    intValue?: number;
    doubleValue?: number;
    boolValue?: boolean;
  };
}

interface OtelSpan {
  attributes?: OtelAttribute[];
}

interface OtelScopeSpan {
  spans?: OtelSpan[];
}

interface OtelResourceSpan {
  scopeSpans?: OtelScopeSpan[];
}

interface OtelData {
  resourceSpans?: OtelResourceSpan[];
}

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
      if (map[r.trace_id]) {
        // Merge spans from multiple records with the same trace_id
        const existing = map[r.trace_id];
        if (existing.data && r.data &&
          typeof existing.data === 'object' && typeof r.data === 'object' &&
          'resourceSpans' in existing.data && 'resourceSpans' in r.data &&
          Array.isArray(existing.data.resourceSpans) && Array.isArray(r.data.resourceSpans)) {
          // Merge resourceSpans arrays
          const existingCount = (existing.data.resourceSpans as any[]).length;
          const newCount = (r.data.resourceSpans as any[]).length;
          existing.data.resourceSpans = [
            ...(existing.data.resourceSpans as any[]),
            ...(r.data.resourceSpans as any[])
          ];
          console.log(`Merged trace ${r.trace_id}: ${existingCount} + ${newCount} = ${(existing.data.resourceSpans as any[]).length} resourceSpans`);
        }
      } else {
        map[r.trace_id] = r;
      }
    }

    // Log final counts
    Object.entries(map).forEach(([traceId, record]) => {
      if (record.data && typeof record.data === 'object' && 'resourceSpans' in record.data) {
        const resourceSpans = record.data.resourceSpans as any[];
        console.log(`Trace ${traceId} has ${resourceSpans?.length || 0} resourceSpans`);
      }
    });

    return map;
  }, [flatRecords]);

  console.log(flatRecords);

  const filteredRecords = useMemo(() => {
    // Always filter out internal logs posting to our OTEL endpoint
    // const records = flatRecords.filter(r => {
    //   console.log(r.data);
    //   // Check for /logs endpoint in span attributes instead of serializing
    //   const otelData = r.data as OtelData;
    //   const hasLogsEndpoint = otelData?.resourceSpans?.some((resourceSpan: OtelResourceSpan) =>
    //     resourceSpan.scopeSpans?.some((scopeSpan: OtelScopeSpan) =>
    //       scopeSpan.spans?.some((span: OtelSpan) =>
    //         span.attributes?.some((attr: OtelAttribute) =>
    //           attr.key === 'http.url' &&
    //           attr.value?.stringValue?.includes('/logs')
    //         )
    //       )
    //     )
    //   );
    //   return !hasLogsEndpoint;
    // });
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


