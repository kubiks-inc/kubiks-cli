'use client';

import useSWRInfinite from 'swr/infinite';
import { useMemo } from 'react';
import { fetchSpans } from '@/api/traces';
import { Span } from '@/types/span';
import { Trace } from '@/types/trace';


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

  console.log('data', data);

  // Transform the data structure to a single accumulated array
  const allSpans = useMemo(() => {
    if (!data) return [];
    const spans: Span[] = [];
    for (const page of data) {
      spans.push(...page);
    }
    return spans;
  }, [data]);

  const filteredRecords = useMemo(() => {
    return allSpans.filter(r =>
      r.attributes['http.url'] != 'http://localhost:7432/v1/logs'
      && r.attributes['url.full'] != 'http://localhost:7432/v1/logs'
      && !r.attributes['http.target']?.includes('/_next/static')
    );
  }, [allSpans, searchQuery]);

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
  }, [allSpans, searchQuery]);


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
    data: spansMap,
    traces,
    isLoading,
    error,
    hasMore,
    loadMore,
    resetTraces,
    isValidating,
  } as const;
}


