'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { TracesTable } from './traces-table';
import { TraceDrawer } from './trace-drawer';
import { useSpans } from '@/hooks/use-traces';
import { Trace } from '@/types/trace';
import { LogsTable } from './logs-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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

  // Show configuration instructions when there are no traces
  if (!isLoading && !error && traces.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-card border rounded-xl p-6 shadow-lg">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">No traces found</h1>
              <p className="text-sm text-muted-foreground">
                To start seeing traces, set up OpenTelemetry instrumentation
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border">
                <div className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1">Install package</h3>
                  <div className="bg-background border rounded p-2">
                    <code className="font-mono text-xs text-foreground">npm i @vercel/otel</code>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border">
                <div className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1">Create <code className="bg-background px-1 py-0.5 rounded text-xs font-mono">instrumentation.ts</code> in your Next.js app root directory</h3>
                  <div className="bg-background border rounded p-3 overflow-x-auto">
                    <pre className="font-mono text-xs text-foreground leading-tight">
                      {`// instrumentation.ts
import { registerOTel, OTLPHttpJsonTraceExporter } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "your-project-name",
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    }),
  });
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border">
                <div className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1">Restart your app</h3>
                  <div className="bg-background border rounded p-2">
                    <code className="font-mono text-xs text-foreground">kubiks</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      </div>

      {selectedTrace && (
        <TraceDrawer
          trace={selectedTrace}
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          demoSpans={spansMap.get(selectedTrace.traceId) ?? []}
        />
      )}
    </div>
  );
};
