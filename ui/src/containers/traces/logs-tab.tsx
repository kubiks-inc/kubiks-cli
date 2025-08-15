'use client';

import { Fragment, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CopyButton } from '@/components/copy-button';
import useSWR from 'swr';
import { fetchAllLogs, LogRecord } from '@/api/traces';
import { extractStackTrace } from '@/lib/stacktrace';

function nanoToDateString(nano?: string) {
  if (!nano) return '';
  try {
    const ms = Number(nano) / 1_000_000;
    if (Number.isFinite(ms)) {
      return new Date(ms).toLocaleString();
    }
  } catch { }
  return '';
}

function bodyToString(body: any): string {
  if (!body) return '';
  if (typeof body === 'object') {
    // OTEL body format can be { stringValue, intValue, doubleValue, boolValue, bytesValue }
    const v = (body as any).stringValue ?? (body as any).intValue ?? (body as any).doubleValue ?? (body as any).boolValue ?? (body as any).bytesValue ?? body;
    try {
      if (typeof v === 'string' && (v.startsWith('{') || v.startsWith('['))) {
        const parsed = JSON.parse(v);
        return JSON.stringify(parsed);
      }
    } catch { }
    return String(v);
  }
  return String(body);
}

export function LogsTable() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const { data, error, isLoading } = useSWR<LogRecord[]>(
    'logs-all',
    () => fetchAllLogs(),
    { refreshInterval: 1000, revalidateOnFocus: false }
  );
  const logs = data ?? [];

  const toggleRow = (index: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  const truncate = (value: string, max: number) => {
    if (!value) return '';
    if (value.length <= max) return value;
    return value.slice(0, max) + '…';
  };

  const severityClasses = (severityText?: string) => {
    const s = String(severityText || '').toUpperCase();
    if (s.includes('FATAL')) return 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-200';
    if (s.includes('ERROR')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (s.includes('WARN')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    if (s.includes('INFO')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (s.includes('DEBUG')) return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    if (s.includes('TRACE')) return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    return 'bg-muted text-foreground';
  };
  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-4">
        {isLoading && <div className="text-sm text-muted-foreground">Loading logs…</div>}
        {error && <div className="text-sm text-destructive">{String((error as any)?.message || error)}</div>}
        {!isLoading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">Timestamp</TableHead>
                <TableHead className="w-[120px]">Severity</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[64px]">Copy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, idx) => {
                const fullMessage = bodyToString(log.body);
                const isExpanded = expanded.has(idx);
                return (
                  <Fragment key={idx}>
                    <TableRow key={`row-${idx}`} className="cursor-pointer" onClick={() => toggleRow(idx)}>
                      <TableCell>
                        <span className="text-muted-foreground">{nanoToDateString(log.timeUnixNano || log.observedTimeUnixNano)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded font-mono ${severityClasses(log.severityText)}`}>{String(log.severityText ?? '')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm break-words whitespace-pre-wrap">
                          {truncate(fullMessage, 80)}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <CopyButton text={JSON.stringify(log)} />
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`expand-${idx}`}>
                        <TableCell colSpan={4}>
                          {(() => {
                            const parsed = extractStackTrace(fullMessage);
                            if (!parsed) {
                              return (
                                <div className="text-sm text-foreground/90 break-words whitespace-pre-wrap">
                                  {fullMessage}
                                </div>
                              );
                            }
                            return (
                              <div className="space-y-2">
                                {parsed.header && (
                                  <div className="text-sm font-medium text-red-600 dark:text-red-400">
                                    {parsed.header}
                                  </div>
                                )}
                                <div className="rounded-md border bg-muted/40">
                                  <div className="p-3 overflow-auto">
                                    <ol className="text-xs font-mono space-y-1">
                                      {parsed.frames.map((f, i) => (
                                        <li key={i} className="leading-relaxed">
                                          <span className="text-muted-foreground">at </span>
                                          {f.functionName && (
                                            <span className="text-foreground">{f.functionName} </span>
                                          )}
                                          <span className="text-muted-foreground">
                                            ({f.file}
                                            {typeof f.line === 'number' ? `:${f.line}` : ''}
                                            {typeof f.column === 'number' ? `:${f.column}` : ''}
                                            )
                                          </span>
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="text-sm text-muted-foreground text-center py-8">No logs found</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </ScrollArea>
  );
}


