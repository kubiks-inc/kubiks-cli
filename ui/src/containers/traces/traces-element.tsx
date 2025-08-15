'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { TracesTable } from './traces-table';
import { TraceDrawer } from './trace-drawer';
import { useSpans } from '@/hooks/use-traces';
import { Trace } from '@/types/trace';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogsTable } from './logs-tab';

interface TracesContentProps {
  timerange?: { start: Date; end: Date };
}

export const TracesContent = ({ timerange }: TracesContentProps) => {

  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'traces' | 'logs'>('traces');

  const {
    data: spansMap,
    traces,
    isLoading,
    error,
    resetTraces,
  } = useSpans('');

  const handleTraceClick = (trace: Trace) => {
    setSelectedTrace(trace);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedTrace(null);
  };

  const handleClear = async () => {
    try {
      await fetch('/clean', { method: 'POST' });
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  };

  return (
    <div className="container mx-auto h-full">
      <div className="w-full space-y-4 p-4">
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'traces' | 'logs')}>
          <div className="flex items-center justify-between pb-2">
            <TabsList>
              <TabsTrigger value="traces">Traces</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            <button onClick={handleClear} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm">
              <Trash2 className="w-4 h-4" /> Clear
            </button>
          </div>
          <TabsContent value="traces">
            <TracesTable
              traces={traces}
              onTraceClick={handleTraceClick}
              isLoading={isLoading}
              error={error}
            />
          </TabsContent>
          <TabsContent value="logs">
            <LogsTable />
          </TabsContent>
        </Tabs>

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
  );
};
