'use client';

import { useEffect, useState } from 'react';
import { TracesTable } from './traces-table';
import { TraceDrawer } from './trace-drawer';
import { useSpans } from '@/hooks/use-traces';
import { Trace } from '@/types/trace';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchAllLogs, LogRecord } from '@/api/traces';
import { LogsTable } from './logs-tab';

interface TracesContentProps {
  timerange?: { start: Date; end: Date };
}

export const TracesContent = ({ timerange }: TracesContentProps) => {

  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'traces' | 'logs'>('traces');
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const [logsError, setLogsError] = useState<string | null>(null);

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

  useEffect(() => {
    if (activeTab !== 'logs') return;
    setLogsLoading(true);
    setLogsError(null);
    fetchAllLogs()
      .then(setLogs)
      .catch(err => setLogsError(err?.message ?? 'Failed to load logs'))
      .finally(() => setLogsLoading(false));
  }, [activeTab]);

  return (
    <div className="container mx-auto h-full">
      <div className="w-full space-y-4 p-4">
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'traces' | 'logs')}>
          <TabsList>
            <TabsTrigger value="traces">Traces</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="traces">
            <TracesTable
              traces={traces}
              onTraceClick={handleTraceClick}
              isLoading={isLoading}
              error={error}
            />
          </TabsContent>
          <TabsContent value="logs">
            <LogsTable logs={logs} loading={logsLoading} error={logsError} />
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
