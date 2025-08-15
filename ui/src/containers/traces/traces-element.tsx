'use client';

import { useState } from 'react';
import { TracesTable } from './traces-table';
import { TraceDrawer } from './trace-drawer';
import { useSpans } from '@/hooks/use-traces';
import { Trace } from '@/types/trace';

interface TracesContentProps {
  timerange?: { start: Date; end: Date };
}

export const TracesContent = ({ timerange }: TracesContentProps) => {

  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Search input removed; fetching paginated traces only

  const {
    data: allTraces,
    isLoading,
    error,
    hasMore,
    loadMore,
    resetTraces,
    isValidating,
  } = useSpans('');

  console.log(allTraces);
  return null;

  const handleTraceClick = (trace: Trace) => {
    setSelectedTrace(trace);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedTrace(null);
  };

  // no-op: search removed

  return (
    <>
      <div className="container mx-auto h-full">
        <div className="w-full space-y-4 p-4">
          {/* search removed */}
          <TracesTable
            traces={allTraces}
            onTraceClick={handleTraceClick}
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoadingMore={isValidating && allTraces.length > 0}
            isLoading={isLoading}
            error={error}
          />
          {selectedTrace && (
            <TraceDrawer
              trace={selectedTrace}
              isOpen={isDrawerOpen}
              onClose={handleDrawerClose}
              demoSpans={
                recordsByTraceId[selectedTrace.traceId]
                  ? (() => {
                    const record = recordsByTraceId[selectedTrace.traceId];
                    console.log('Raw trace record:', record);
                    console.log('Raw trace data:', record.data);
                    const allSpans = extractSpansFromRecord(record);

                    // Filter out spans that are calls to /logs endpoint
                    const filteredSpans = allSpans.filter(span => {
                      const url = span.spanAttributes['http.url'] || span.spanAttributes['url.full'];
                      return !url || !url.includes('/logs');
                    });

                    console.log('All spans extracted:', allSpans.length);
                    console.log('Filtered spans (excluding /logs):', filteredSpans.length);
                    console.log('Extracted spans for trace:', selectedTrace.traceId, filteredSpans);
                    console.log('Span details:', filteredSpans.map(s => ({
                      name: s.spanName,
                      service: s.serviceName,
                      kind: s.spanKind,
                      duration: s.durationMs,
                      statusCode: s.statusCode,
                      url: s.spanAttributes['http.url'] || s.spanAttributes['url.full']
                    })));
                    return filteredSpans;
                  })()
                  : []
              }
            />
          )}
        </div>
      </div>
    </>
  );
};
