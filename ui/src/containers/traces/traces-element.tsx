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

  const {
    data: spansMap,
    traces,
    isLoading,
    error,
    resetTraces,
  } = useSpans('');

  console.log('allTraces', traces);
  console.log('spansMap', spansMap);

  const handleTraceClick = (trace: Trace) => {
    setSelectedTrace(trace);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedTrace(null);
  };

  return (
    <>
      <div className="container mx-auto h-full">
        <div className="w-full space-y-4 p-4">
          <TracesTable
            traces={traces}
            onTraceClick={handleTraceClick}
            isLoading={isLoading}
            error={error}
          />
          {selectedTrace && (
            <TraceDrawer
              trace={selectedTrace}
              isOpen={isDrawerOpen}
              onClose={handleDrawerClose}
              demoSpans={spansMap.get(selectedTrace.traceId) ?? []}
            />
          )}
        </div>
      </div>
    </>
  );
};
