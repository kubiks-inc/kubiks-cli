'use client';

import { useState } from 'react';
import { TracesTable } from './traces-table';
import { TraceDrawer } from './trace-drawer';
import { useTraces } from '@/hooks/use-traces';
import { extractSpansFromRecord } from '@/lib/otel';
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
    recordsByTraceId,
    isLoading,
    error,
    hasMore,
    loadMore,
    resetTraces,
    isValidating,
  } = useTraces('');

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
                  ? extractSpansFromRecord(recordsByTraceId[selectedTrace.traceId])
                    .filter(s => s.traceId === selectedTrace.traceId)
                  : []
              }
            />
          )}
        </div>
      </div>
    </>
  );
};
