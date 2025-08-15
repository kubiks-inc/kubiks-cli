'use client';

import { useState } from 'react';
import { TracesTable } from './traces-table';
import { TraceDrawer } from './trace-drawer';
import { useTraces } from '@/hooks/use-traces';
import { extractSpansFromRecord } from '@/lib/otel';
import { Trace } from '@/types/trace';
import { TraceFilters } from './trace-filters-ui';

interface TracesContentProps {
  timerange?: { start: Date; end: Date };
}

export const TracesContent = ({ timerange }: TracesContentProps) => {

  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    data: allTraces,
    recordsByTraceId,
    isLoading,
    error,
    hasMore,
    loadMore,
    resetTraces,
    isValidating,
  } = useTraces(searchQuery);

  const handleTraceClick = (trace: Trace) => {
    setSelectedTrace(trace);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedTrace(null);
  };

  const handleSearchChange = (newQuery: string) => {
    setSearchQuery(newQuery);
  };

  return (
    <>
      <div className="container mx-auto h-full">
        <div className="w-full space-y-4 p-4">
          <TraceFilters
            onSearchChange={handleSearchChange}
          />
          <TracesTable
            traces={allTraces as any}
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
