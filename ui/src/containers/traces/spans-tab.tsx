'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CopyButton } from '@/components/copy-button';
import Editor from '@monaco-editor/react';
import { ChevronDown, ChevronRight, Maximize2 } from 'lucide-react';
import { Trace } from '@/types/trace';
import { Span } from '@/types/span';

const formatDuration = (durationMs: number) => {
  if (durationMs < 1) {
    return `${(durationMs * 1000).toFixed(0)}µs`;
  }
  if (durationMs < 1000) {
    return `${durationMs.toFixed(2)}ms`;
  }
  return `${(durationMs / 1000).toFixed(2)}s`;
};

const getSpanColor = (span: Span) => {
  const httpStatusCode = span.attributes['http.response.status_code'];
  if (httpStatusCode !== undefined) {
    const statusCode = parseInt(String(httpStatusCode));
    if (statusCode >= 400) {
      return 'bg-red-500';
    }
    return 'bg-green-500';
  }
  if (span.attributes['http.response.status_code']) {
    const statusCode = parseInt(span.attributes['http.response.status_code']);
    if (statusCode >= 400) {
      return 'bg-red-500';
    }
    return 'bg-green-500';
  }
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
  spans.forEach(span => {
    spanMap.set(span.spanId, { span, children: [], level: 0 });
  });
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
  const spanName = span.attributes['http.url'] ? span.attributes['http.method'] + ' ' + (span.attributes['http.target'] ?? span.attributes['http.url']) : span.name;
  return (
    <div className="relative">
      {level > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border/60" style={{ left: `${(level - 1) * 20 + 8}px` }} />
      )}
      <div
        className={`flex items-center gap-2 p-2 hover:bg-muted/50 cursor-pointer rounded h-12 transition-all duration-150 ${isSelected ? 'bg-muted border border-primary/20 shadow-sm' : ''}`}
        onClick={() => onSelectSpan(span.spanId)}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        {hasChildren && (
          <button
            onClick={e => { e.stopPropagation(); onToggleExpanded(span.spanId); }}
            className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0 hover:scale-110"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </button>
        )}
        {!hasChildren && <div className="w-5 flex-shrink-0" />}
        <div className={`w-3 h-3 rounded-full ${getSpanColor(span)} flex-shrink-0 shadow-sm`} />
        <div className="text-xs text-muted-foreground min-w-[20px] text-center flex-shrink-0 bg-muted px-1 py-0.5 rounded">
          {hasChildren ? children.length : '1'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate text-foreground">{spanName}</div>
          <div className="text-xs text-muted-foreground truncate">{span.resourceAttributes['service.name'] || 'Unknown Service'}</div>
        </div>
        <div className="text-xs text-muted-foreground flex-shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">{formatDuration(span.durationMs)}</div>
      </div>
      {isExpanded && hasChildren && (
        <div className="relative">
          {children.map(child => (
            <div key={child.span.spanId} className="relative">
              <div className="absolute left-0 top-0 w-0.5 bg-border/60" style={{ left: `${level * 20 + 8}px`, height: '12px' }} />
              <div className="absolute top-0 w-0.5 bg-border/60" style={{ left: `${level * 20 + 8}px`, width: `${20}px`, height: '0.5px' }} />
              <SpanListItem
                node={child}
                selectedSpanId={selectedSpanId}
                onSelectSpan={onSelectSpan}
                expandedNodes={expandedNodes}
                onToggleExpanded={onToggleExpanded}
                startTime={startTime}
                maxDuration={maxDuration}
              />
            </div>
          ))}
        </div>
      )}
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
  const createSpanRows = (nodes: SpanNode[], level: number = 0): Array<{ span: Span; level: number }> => {
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
      <div className="space-y-0 w-full">
        {spanRows.map(({ span, level }) => {
          const spanStartTime = span.timestamp.getTime();
          const relativeStart = spanStartTime - startTime;
          const startPercent = (relativeStart / maxDuration) * 100;
          const durationPercent = (span.durationMs / maxDuration) * 100;
          const isSelected = selectedSpanId === span.spanId;
          return (
            <div key={span.spanId} className="relative h-12 flex items-center cursor-pointer group w-full hover:bg-muted/30 transition-colors" onClick={() => onSelectSpan(span.spanId)} style={{ paddingLeft: `${level * 20 + 12}px` }}>
              <div className="w-5 flex-shrink-0" />
              <div className="absolute inset-0 flex items-center">
                {level > 0 && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border/60" style={{ left: `${(level - 1) * 20 + 8}px` }} />
                )}
                <div
                  className={`h-3 rounded transition-all duration-200 ${getSpanColor(span)} ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''} group-hover:opacity-80 group-hover:scale-y-110`}
                  style={{ left: `${startPercent}%`, width: `${Math.max(durationPercent, 0.5)}%`, minWidth: '2px', position: 'absolute' }}
                />
                <div className="absolute left-0 top-full mt-1 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                  {span.name}
                </div>
              </div>
              <div className="absolute right-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{formatDuration(span.durationMs)}</div>
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
  spanName,
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
            options={{ readOnly: true, minimap: { enabled: true }, scrollBeyondLastLine: false, wordWrap: 'on', fontSize: 14, lineNumbers: 'on', folding: true, lineDecorationsWidth: 10, lineNumbersMinChars: 3 }}
            theme="vs-dark"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SpanDetails = ({ span, onOpenModal }: { span: Span | null; onOpenModal: (attributeKey: string, attributeValue: string) => void; }) => {
  if (!span) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Select a span to view details</div>;
  }
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
  const isLongValue = (value: any) => {
    const stringValue = String(value);
    return stringValue.length > 100 || stringValue.includes('\n');
  };
  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      <div>
        <h3 className="font-medium text-sm">Span Details</h3>
        <p className="text-xs text-muted-foreground mt-1 break-all overflow-hidden">{span.spanId}</p>
      </div>
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Name</div>
          <div className="text-sm break-words overflow-hidden">{span.name}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Service</div>
          <div className="text-sm break-words overflow-hidden">{span.resourceAttributes['service.name']}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Duration</div>
          <div className="text-sm">{formatDuration(span.durationMs)}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Kind</div>
          <div className="text-sm break-words overflow-hidden">{span.kind}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Status</div>
          <div className="text-sm flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getSpanColor(span)}`} />
            <span className="break-words overflow-hidden">{span.attributes['http.response.status_code'] || 'Unknown'}</span>
          </div>
        </div>
      </div>
      {Object.keys(span.attributes).length > 0 && (
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Span Attributes</div>
          <div className="space-y-2">
            {Object.entries(span.attributes).map(([key, value]) => {
              const formattedValue = formatAttributeValue(value);
              const longValue = isLongValue(value);
              return (
                <div key={key} className="border rounded-md p-2 bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-medium text-muted-foreground break-words min-w-0 flex-1 mr-2">{key}</div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {longValue && (
                        <Button variant="ghost" size="icon" onClick={() => onOpenModal(key, formattedValue)} className="h-5 w-5" title="View in full screen">
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                      )}
                      <CopyButton text={formattedValue} className="flex-shrink-0" buttonClassName="h-5 w-5" iconClassName="h-3 w-3" />
                    </div>
                  </div>
                  <div className="text-xs font-mono break-all select-text max-w-full overflow-hidden">
                    {longValue ? (
                      <div className="max-h-32 overflow-y-auto overflow-x-auto"><div className="whitespace-pre-wrap min-w-0">{formattedValue}</div></div>
                    ) : (
                      <div className="whitespace-pre-wrap break-all">{formattedValue}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
                    <div className="text-xs font-medium text-muted-foreground break-words min-w-0 flex-1 mr-2">{key}</div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {longValue && (
                        <Button variant="ghost" size="icon" onClick={() => onOpenModal(key, formattedValue)} className="h-5 w-5" title="View in full screen">
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                      )}
                      <CopyButton text={formattedValue} className="flex-shrink-0" buttonClassName="h-5 w-5" iconClassName="h-3 w-3" />
                    </div>
                  </div>
                  <div className="text-xs font-mono break-all select-text max-w-full overflow-hidden">
                    {longValue ? (
                      <div className="max-h-32 overflow-y-auto overflow-x-auto"><div className="whitespace-pre-wrap min-w-0">{formattedValue}</div></div>
                    ) : (
                      <div className="whitespace-pre-wrap break-all">{formattedValue}</div>
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

export function SpansTab({ trace, spans }: { trace: Trace; spans: Span[]; }) {
  const [selectedSpanId, setSelectedSpanId] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [modalState, setModalState] = useState<{ isOpen: boolean; attributeKey: string; attributeValue: string; }>({ isOpen: false, attributeKey: '', attributeValue: '' });
  useEffect(() => {
    if (spans.length > 0) {
      setExpandedNodes(new Set(spans.map(span => span.spanId)));
    }
  }, [spans]);
  const spanTree = useMemo(() => buildSpanTree(spans), [spans]);
  const startTime = useMemo(() => {
    if (spans.length === 0) return 0;
    return Math.min(...spans.map(s => s.timestamp.getTime()));
  }, [spans]);
  const maxDuration = useMemo(() => {
    if (spans.length === 0) return 1;
    if (trace.durationMs > 0) {
      return trace.durationMs;
    }
    const endTime = Math.max(...spans.map(s => s.timestamp.getTime()));
    const totalDuration = endTime - startTime;
    return Math.max(totalDuration, 1000);
  }, [spans, startTime, trace.durationMs]);
  const selectedSpan = useMemo(() => spans.find(s => s.spanId === selectedSpanId) || null, [spans, selectedSpanId]);
  const toggleExpanded = (spanId: string) => {
    const next = new Set(expandedNodes);
    if (next.has(spanId)) { next.delete(spanId); } else { next.add(spanId); }
    setExpandedNodes(next);
  };
  const handleOpenModal = (attributeKey: string, attributeValue: string) => { setModalState({ isOpen: true, attributeKey, attributeValue }); };
  const handleCloseModal = () => { setModalState({ isOpen: false, attributeKey: '', attributeValue: '' }); };
  return (
    <div className="flex-1 min-h-0 flex">
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
        <ResizablePanel defaultSize={75} minSize={50}>
          <div className="flex flex-col min-w-0 min-h-0 h-full">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
              <div className="flex">
                <div className="w-[420px] border-r p-2"><div className="text-xs text-muted-foreground font-medium">Spans Tree</div></div>
                <div className="flex-1 p-2">
                  <div className="flex text-xs text-muted-foreground">
                    {Array.from({ length: 9 }, (_, i) => {
                      const stepDuration = maxDuration / 8;
                      return (
                        <div key={i} className="flex-1 text-center" style={{ width: `${100 / 9}%` }}>
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
                <div className="w-[420px] border-r">
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
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <div className="flex flex-col min-h-0 h-full">
            <div className="p-4 border-b flex-shrink-0"><h3 className="font-medium text-sm">Span Details</h3></div>
            <ScrollArea className="flex-1 min-h-0"><div className="p-4"><SpanDetails span={selectedSpan} onOpenModal={handleOpenModal} /></div></ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <AttributeValueModal isOpen={modalState.isOpen} onClose={handleCloseModal} attributeKey={modalState.attributeKey} attributeValue={modalState.attributeValue} spanName={selectedSpan?.name || 'Unknown Span'} />
    </div>
  );
}


