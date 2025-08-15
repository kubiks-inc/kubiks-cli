'use client';

import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CopyButton } from '@/components/copy-button';
import { LogRecord } from '@/api/traces';

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

export function LogsTable({ logs, loading, error }: { logs: LogRecord[]; loading?: boolean; error?: string | null; }) {
  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-4">
        {loading && <div className="text-sm text-muted-foreground">Loading logs…</div>}
        {error && <div className="text-sm text-destructive">{error}</div>}
        {!loading && !error && (
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
              {logs.map((log, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <span className="text-muted-foreground">{nanoToDateString(log.timeUnixNano || log.observedTimeUnixNano)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-muted px-2 py-1 rounded font-mono">{String(log.severityText ?? '')}</span>
                      {typeof log.severityNumber !== 'undefined' && (
                        <span className="text-xs text-muted-foreground">{String(log.severityNumber)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm break-words whitespace-pre-wrap">{bodyToString(log.body)}</div>
                  </TableCell>
                  <TableCell>
                    <CopyButton text={JSON.stringify(log)} />
                  </TableCell>
                </TableRow>
              ))}
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


