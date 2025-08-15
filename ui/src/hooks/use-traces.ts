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
    refreshInterval: 1000, // Reload every second
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

      // Filter out requests with undefined/missing attributes and create valid request strings
      const validRequests = spans
        .map(r => {
          const method = r.attributes['http.method'];
          const url = r.attributes['http.url'];
          if (method && url) {
            // Truncate URL to 80 characters and add ... if longer
            const truncatedUrl = url.length > 50 ? url.substring(0, 50) + '...' : url;
            return method + ' ' + truncatedUrl;
          }
          return null;
        })
        .filter(request => request !== null);

      // Get unique status codes and create status text
      const statusCodes = spans
        .map(r => {
          const code = r.attributes['http.status_code'];
          const text = r.attributes['http.status_text'];
          if (code) {
            return text ? `${code} ${text}` : code;
          }
          return null;
        })
        .filter(status => status !== null);

      // Create status text: first status + "and n more" if multiple different statuses
      let statusText = statusCodes[0] || '';
      if (statusCodes.length > 1) {
        const uniqueStatuses = [...new Set(statusCodes)];
        if (uniqueStatuses.length > 1) {
          statusText += ` and ${uniqueStatuses.length - 1} more`;
        }
      }

      // Create trace name: first valid request + "and n more" if multiple valid requests
      let traceName = validRequests[0] || 'Unknown request';
      if (validRequests.length > 1) {
        traceName += ` and ${validRequests.length - 1} more`;
      }

      tracesArr.set(traceId, {
        traceId: traceId,
        timestamp: timestamp,
        durationMs,
        statusCode: statusText,
        name: traceName,
        service: rootSpan?.resourceAttributes['service.name'] ?? '',
      });
    }
    // Sort traces by timestamp (newest first) and return as array
    return Array.from(tracesArr.values()).sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
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


