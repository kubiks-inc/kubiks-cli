'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CopyButton } from '@/components/copy-button';
import Editor from '@monaco-editor/react';
import {
  X,
  Clock,
  Hash,
  Activity,
  Server,
  Code,
  Search,
  ChevronRight,
  ChevronDown,
  Maximize2,
} from 'lucide-react';
import { Trace, TraceStatus } from '@/types/trace';
import { Span } from '@/types/span';
import { useSpans } from '@/hooks/use-spans';
import { useTraceLogs } from '@/hooks/use-trace-logs';

interface TraceDrawerProps {
  trace: Trace;
  isOpen: boolean;
  onClose: () => void;
  demoSpans?: Span[]; // For demo purposes
}

const getStatusText = (status: TraceStatus) => {
  switch (status) {
    case TraceStatus.SUCCESS:
      return <span className="text-emerald-600 font-medium">Success</span>;
    case TraceStatus.ERROR:
      return <span className="text-red-600 font-medium">Error</span>;
    case TraceStatus.WARNING:
      return <span className="text-amber-600 font-medium">Warning</span>;
    default:
      return <span className="text-muted-foreground font-medium">Unknown</span>;
  }
};

const getStatusBadgeVariant = (status: TraceStatus) => {
  switch (status) {
    case TraceStatus.SUCCESS:
      return 'default';
    case TraceStatus.ERROR:
      return 'destructive';
    case TraceStatus.WARNING:
      return 'secondary';
    default:
      return 'outline';
  }
};

const formatDuration = (durationMs: number) => {
  if (durationMs < 1) {
    return `${(durationMs * 1000).toFixed(0)}µs`;
  }
  if (durationMs < 1000) {
    return `${durationMs.toFixed(2)}ms`;
  }
  return `${(durationMs / 1000).toFixed(2)}s`;
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const getSpanColor = (span: Span) => {
  // First check for HTTP status code in span attributes
  const httpStatusCode = span.spanAttributes['http.status_code'];
  if (httpStatusCode !== undefined) {
    const statusCode = parseInt(String(httpStatusCode));
    if (statusCode >= 400) {
      return 'bg-red-500'; // Error status codes (4xx, 5xx)
    }
    return 'bg-green-500'; // Success status codes (2xx, 3xx)
  }

  // If no HTTP status code, check the span's status code
  if (span.statusCode) {
    const statusCode = parseInt(span.statusCode);
    if (statusCode >= 400) {
      return 'bg-red-500'; // Error status codes
    }
    return 'bg-green-500'; // Success status codes
  }

  // Default to green if no status information is available
  return 'bg-green-500';
};

interface SpanNode {
  span: Span;
  children: SpanNode[];
  level: number;
}

const buildSpanTree = (spans: Span[]): SpanNode[] => {
  const spanMap = new Map<string, SpanNode>();
  const roots: SpanNode[] = [];

  // Create nodes for all spans
  spans.forEach(span => {
    spanMap.set(span.spanId, {
      span,
      children: [],
      level: 0,
    });
  });

  // Build parent-child relationships
  spans.forEach(span => {
    const node = spanMap.get(span.spanId)!;
    if (span.parentSpanId && spanMap.has(span.parentSpanId)) {
      const parent = spanMap.get(span.parentSpanId)!;
      parent.children.push(node);
      node.level = parent.level + 1;
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const SpanListItem = ({
  node,
  selectedSpanId,
  onSelectSpan,
  expandedNodes,
  onToggleExpanded,
  startTime,
  maxDuration,
}: {
  node: SpanNode;
  selectedSpanId: string;
  onSelectSpan: (spanId: string) => void;
  expandedNodes: Set<string>;
  onToggleExpanded: (spanId: string) => void;
  startTime: number;
  maxDuration: number;
}) => {
  const { span, children, level } = node;
  const isSelected = selectedSpanId === span.spanId;
  const isExpanded = expandedNodes.has(span.spanId);
  const hasChildren = children.length > 0;

  const spanStartTime = new Date(span.timestamp).getTime();
  const relativeStart = spanStartTime - startTime;
  const startPercent = (relativeStart / maxDuration) * 100;
  const durationPercent = (span.durationMs / maxDuration) * 100;

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-2 hover:bg-muted/50 cursor-pointer rounded h-12 ${isSelected ? 'bg-muted' : ''
          }`}
        onClick={() => onSelectSpan(span.spanId)}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren && (
          <button
            onClick={e => {
              e.stopPropagation();
              onToggleExpanded(span.spanId);
            }}
            className="p-1 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}

        <div
          className={`w-3 h-3 rounded-full ${getSpanColor(span)}`}
        />
        <span className="text-xs text-muted-foreground min-w-[20px]">1</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{span.spanName}</div>
          <div className="text-xs text-muted-foreground truncate">
            {span.serviceName}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDuration(span.durationMs)}
        </div>
      </div>

      {isExpanded &&
        children.map(child => (
          <SpanListItem
            key={child.span.spanId}
            node={child}
            selectedSpanId={selectedSpanId}
            onSelectSpan={onSelectSpan}
            expandedNodes={expandedNodes}
            onToggleExpanded={onToggleExpanded}
            startTime={startTime}
            maxDuration={maxDuration}
          />
        ))}
    </div>
  );
};

const WaterfallChart = ({
  spanTree,
  selectedSpanId,
  onSelectSpan,
  startTime,
  maxDuration,
  expandedNodes,
}: {
  spanTree: SpanNode[];
  selectedSpanId: string;
  onSelectSpan: (spanId: string) => void;
  startTime: number;
  maxDuration: number;
  expandedNodes: Set<string>;
}) => {
  // Create a flat list with level information to match the left panel structure
  const createSpanRows = (
    nodes: SpanNode[],
    level: number = 0
  ): Array<{ span: Span; level: number }> => {
    const result: Array<{ span: Span; level: number }> = [];
    nodes.forEach(node => {
      result.push({ span: node.span, level });
      if (expandedNodes.has(node.span.spanId)) {
        result.push(...createSpanRows(node.children, level + 1));
      }
    });
    return result;
  };

  const spanRows = createSpanRows(spanTree);

  return (
    <div className="flex-1 min-w-0 w-full">
      {/* Spans */}
      <div className="space-y-0 w-full">
        {spanRows.map(({ span, level }) => {
          const spanStartTime = new Date(span.timestamp).getTime();
          const relativeStart = spanStartTime - startTime;
          const startPercent = (relativeStart / maxDuration) * 100;
          const durationPercent = (span.durationMs / maxDuration) * 100;
          const isSelected = selectedSpanId === span.spanId;

          return (
            <div
              key={span.spanId}
              className="relative h-12 flex items-center cursor-pointer group w-full"
              onClick={() => onSelectSpan(span.spanId)}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
              {/* Left spacer to match the left panel layout */}
              <div className="w-5 flex-shrink-0" />

              <div className="absolute inset-0 flex items-center">
                <div
                  className={`h-3 rounded ${getSpanColor(span)} ${isSelected ? 'ring-2 ring-primary' : ''
                    } group-hover:opacity-80 transition-opacity`}
                  style={{
                    left: `${startPercent}%`,
                    width: `${Math.max(durationPercent, 0.5)}%`,
                    minWidth: '2px',
                    position: 'absolute',
                  }}
                />
              </div>
              <div className="absolute right-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {formatDuration(span.durationMs)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AttributeValueModal = ({
  isOpen,
  onClose,
  attributeKey,
  attributeValue,
  spanName
}: {
  isOpen: boolean;
  onClose: () => void;
  attributeKey: string;
  attributeValue: string;
  spanName: string;
}) => {
  const formatAttributeValue = (value: any) => {
    const stringValue = String(value);
    if (stringValue.startsWith('{') || stringValue.startsWith('[')) {
      try {
        const parsed = JSON.parse(stringValue);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return stringValue;
      }
    }
    return stringValue;
  };

  const getLanguage = (value: string) => {
    if (value.startsWith('{') || value.startsWith('[')) {
      try {
        JSON.parse(value);
        return 'json';
      } catch {
        return 'text';
      }
    }
    return 'text';
  };

  const content = formatAttributeValue(attributeValue);
  const language = getLanguage(content);
  const title = `${spanName} - ${attributeKey}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] flex flex-col !max-w-[95vw] sm:!max-w-[95vw]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 border rounded-md">
          <Editor
            height="100%"
            defaultLanguage={language}
            value={content}
            options={{
              readOnly: true,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              fontSize: 14,
              lineNumbers: 'on',
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
            }}
            theme="vs-dark"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SpanDetails = ({
  span,
  onOpenModal
}: {
  span: Span | null;
  onOpenModal: (attributeKey: string, attributeValue: string) => void;
}) => {
  if (!span) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a span to view details
      </div>
    );
  }

  const formatAttributeValue = (value: any) => {
    const stringValue = String(value);
    // Check if it's a JSON-like string that should be formatted
    if (stringValue.startsWith('{') || stringValue.startsWith('[')) {
      try {
        const parsed = JSON.parse(stringValue);
        return JSON.stringify(parsed, null, 2);
      } catch {
        // If it's not valid JSON, return as is
        return stringValue;
      }
    }
    return stringValue;
  };

  const isLongValue = (value: any) => {
    const stringValue = String(value);
    return stringValue.length > 100 || stringValue.includes('\n');
  };

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Header */}
      <div>
        <h3 className="font-medium text-sm">Span Details</h3>
        <p className="text-xs text-muted-foreground mt-1 break-all overflow-hidden">{span.spanId}</p>
      </div>

      {/* Basic Info */}
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Name</div>
          <div className="text-sm break-words overflow-hidden">{span.spanName}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Service</div>
          <div className="text-sm break-words overflow-hidden">{span.serviceName}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Duration</div>
          <div className="text-sm">{formatDuration(span.durationMs)}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Kind</div>
          <div className="text-sm break-words overflow-hidden">{span.spanKind}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Status</div>
          <div className="text-sm flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getSpanColor(span)}`} />
            <span className="break-words overflow-hidden">{span.statusCode || 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* Span Attributes */}
      {Object.keys(span.spanAttributes).length > 0 && (
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Span Attributes</div>
          <div className="space-y-2">
            {Object.entries(span.spanAttributes).map(([key, value]) => {
              const formattedValue = formatAttributeValue(value);
              const longValue = isLongValue(value);

              return (
                <div key={key} className="border rounded-md p-2 bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-medium text-muted-foreground break-words min-w-0 flex-1 mr-2">
                      {key}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {longValue && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onOpenModal(key, formattedValue)}
                          className="h-5 w-5"
                          title="View in full screen"
                        >
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                      )}
                      <CopyButton
                        text={formattedValue}
                        className="flex-shrink-0"
                        buttonClassName="h-5 w-5"
                        iconClassName="h-3 w-3"
                      />
                    </div>
                  </div>
                  <div className="text-xs font-mono break-all select-text max-w-full overflow-hidden">
                    {longValue ? (
                      <div className="max-h-32 overflow-y-auto overflow-x-auto">
                        <div className="whitespace-pre-wrap min-w-0">
                          {formattedValue}
                        </div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap break-all">
                        {formattedValue}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resource Attributes */}
      {span.resourceAttributes && Object.keys(span.resourceAttributes).length > 0 && (
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Resource Attributes</div>
          <div className="space-y-2">
            {Object.entries(span.resourceAttributes).map(([key, value]) => {
              const formattedValue = formatAttributeValue(value);
              const longValue = isLongValue(value);

              return (
                <div key={key} className="border rounded-md p-2 bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-medium text-muted-foreground break-words min-w-0 flex-1 mr-2">
                      {key}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {longValue && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onOpenModal(key, formattedValue)}
                          className="h-5 w-5"
                          title="View in full screen"
                        >
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                      )}
                      <CopyButton
                        text={formattedValue}
                        className="flex-shrink-0"
                        buttonClassName="h-5 w-5"
                        iconClassName="h-3 w-3"
                      />
                    </div>
                  </div>
                  <div className="text-xs font-mono break-all select-text max-w-full overflow-hidden">
                    {longValue ? (
                      <div className="max-h-32 overflow-y-auto overflow-x-auto">
                        <div className="whitespace-pre-wrap min-w-0">
                          {formattedValue}
                        </div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap break-all">
                        {formattedValue}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const TraceDrawer = ({
  trace,
  isOpen,
  onClose,
  demoSpans,
}: TraceDrawerProps) => {
  const { data: apiSpans = [] } = useSpans(trace.traceId);
  const { data: logs, isLoading: isLogsLoading } = useTraceLogs(trace.traceId);
  const spans: Span[] = (demoSpans ?? apiSpans) as Span[];
  const [selectedSpanId, setSelectedSpanId] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    attributeKey: string;
    attributeValue: string;
  }>({ isOpen: false, attributeKey: '', attributeValue: '' });

  useEffect(() => {
    if (spans.length > 0) {
      setExpandedNodes(new Set(spans.map(span => span.spanId)));
    }
  }, [spans]);

  const spanTree = useMemo(() => buildSpanTree(spans), [spans]);

  const startTime = useMemo(() => {
    if (spans.length === 0) return 0;
    return Math.min(...spans.map(s => new Date(s.timestamp).getTime()));
  }, [spans]);

  const maxDuration = useMemo(() => {
    if (spans.length === 0) return 1;
    // Calculate the actual end time of the trace
    const endTime = Math.max(
      ...spans.map(s => new Date(s.timestamp).getTime() + s.durationMs)
    );
    const totalDuration = endTime - startTime;
    // Ensure we have a reasonable minimum duration for visualization
    return Math.max(totalDuration, 1000); // At least 1ms
  }, [spans, startTime]);

  const selectedSpan = useMemo(
    () => spans.find(s => s.spanId === selectedSpanId) || null,
    [spans, selectedSpanId]
  );

  const toggleExpanded = (spanId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(spanId)) {
      newExpanded.delete(spanId);
    } else {
      newExpanded.add(spanId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleOpenModal = (attributeKey: string, attributeValue: string) => {
    setModalState({
      isOpen: true,
      attributeKey,
      attributeValue,
    });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, attributeKey: '', attributeValue: '' });
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={onClose}
      direction="right"
      handleOnly={true}
    >
      <DrawerContent className="max-w-none !w-[90%] sm:!max-w-none">
        <div className="w-full h-screen flex flex-col">
          <DrawerHeader className="pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-muted-foreground">Trace ID:</span>
                  {trace.traceId}
                </DrawerTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  {spans.length} spans • Started{' '}
                  {formatTimestamp(trace.timestamp)}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>

          <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
            {/* Combined Spans and Timeline Panel */}
            <ResizablePanel defaultSize={70} minSize={40}>
              <div className="flex flex-col min-w-0 min-h-0 h-full">
                <div className="p-4 border-b flex-shrink-0">
                  <h3 className="font-medium text-sm">Spans & Timeline</h3>
                </div>

                {/* Sticky Timeline Header */}
                <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                  <div className="flex">
                    <div className="w-96 border-r p-2">
                      <div className="text-xs text-muted-foreground font-medium">Spans</div>
                    </div>
                    <div className="flex-1 p-2">
                      <div className="flex text-xs text-muted-foreground">
                        {Array.from({ length: 9 }, (_, i) => {
                          const stepDuration = maxDuration / 8;
                          return (
                            <div
                              key={i}
                              className="flex-1 text-center"
                              style={{ width: `${100 / 9}%` }}
                            >
                              {formatDuration(i * stepDuration)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="flex">
                    {/* Left side - Span List */}
                    <div className="w-96 border-r">
                      <div className="p-4">
                        {spanTree.map(node => (
                          <SpanListItem
                            key={node.span.spanId}
                            node={node}
                            selectedSpanId={selectedSpanId}
                            onSelectSpan={setSelectedSpanId}
                            expandedNodes={expandedNodes}
                            onToggleExpanded={toggleExpanded}
                            startTime={startTime}
                            maxDuration={maxDuration}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Right side - Waterfall Chart */}
                    <div className="flex-1 min-w-0">
                      <div className="p-4 w-full">
                        <WaterfallChart
                          spanTree={spanTree}
                          selectedSpanId={selectedSpanId}
                          onSelectSpan={setSelectedSpanId}
                          startTime={startTime}
                          maxDuration={maxDuration}
                          expandedNodes={expandedNodes}
                        />
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Span Details */}
            <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
              <div className="flex flex-col min-h-0 h-full">
                <div className="p-4 border-b flex-shrink-0">
                  <h3 className="font-medium text-sm">Span Details</h3>
                </div>
                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4">
                    <SpanDetails span={selectedSpan} onOpenModal={handleOpenModal} />
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>

          {/* Footer */}
          <div className="border-t p-4 flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Duration {formatDuration(maxDuration / 1000000)}</span>
            </div>
          </div>
        </div>
      </DrawerContent>

      {/* Full-screen Modal for Attribute Values */}
      <AttributeValueModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        attributeKey={modalState.attributeKey}
        attributeValue={modalState.attributeValue}
        spanName={selectedSpan?.spanName || 'Unknown Span'}
      />
    </Drawer>
  );
};
