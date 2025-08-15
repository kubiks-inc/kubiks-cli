'use client';

import useSWR from 'swr';
import { useMemo } from 'react';
import { fetchAllSpans } from '@/api/traces';
import { Span } from '@/types/span';
import { Trace } from '@/types/trace';

export function useSpans(searchQuery: string) {
  const {
    data: allSpans,
    isLoading,
    error,
    mutate,
  } = useSWR<Span[]>('all-spans', fetchAllSpans, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  console.log('allSpans', allSpans);

  // Transform the data structure to a single accumulated array
  const spans = useMemo(() => {
    if (!allSpans) return [];
    return allSpans;
  }, [allSpans]);

  const filteredRecords = useMemo(() => {
    return spans.filter(r =>
      r.attributes['http.url'] != 'http://localhost:7432/v1/logs'
      && r.attributes['url.full'] != 'http://localhost:7432/v1/logs'
      && !r.attributes['http.target']?.includes('/_next/static')
    );
  }, [spans, searchQuery]);

  const transformedSpans = useMemo(() => {
    return filteredRecords.map(r => ({
      ...r,
      durationMs: (r.endTimeUnixNano - r.startTimeUnixNano) / 1000000,
      timestamp: new Date(r.startTimeUnixNano / 1000000),
    }));
  }, [filteredRecords]);

  const spansMap = new Map<string, Span[]>();
  for (const span of transformedSpans) {
    if (!spansMap.has(span.traceId)) {
      spansMap.set(span.traceId, []);
    }
    spansMap.get(span.traceId)?.push(span);
  }

  const traces = useMemo(() => {
    const tracesArr = new Map<string, Trace>();

    for (const [traceId, spans] of spansMap) {
      const minStartTime = Math.min(...spans.map(r => r.timestamp.getTime()));
      const maxEndTime = Math.max(...spans.map(r => r.timestamp.getTime() + r.durationMs));
      const timestamp = new Date(minStartTime).toISOString();
      const durationMs = (maxEndTime - minStartTime);

      const rootSpan = spans.find(r => r.timestamp.getTime() === minStartTime);

      console.log('rootSpan', rootSpan);

      const statusText = (rootSpan?.attributes['http.response.status_code'] ?? '') + ' ' + (rootSpan?.attributes['http.response.status_text'] ?? '');

      tracesArr.set(traceId, {
        traceId: traceId,
        timestamp: timestamp,
        durationMs,
        statusCode: statusText,
        name: rootSpan?.name ?? '',
        service: rootSpan?.resourceAttributes['service.name'] ?? '',
      });
    }
    return Array.from(tracesArr.values());
  }, [spans, searchQuery]);

  const resetTraces = async () => {
    await mutate();
  };

  return {
    data: spansMap,
    traces,
    isLoading,
    error,
    hasMore: false,
    loadMore: () => { },
    resetTraces,
    isValidating: false,
  } as const;
}


