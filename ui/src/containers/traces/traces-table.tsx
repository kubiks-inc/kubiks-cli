'use client';

import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DatabaseIcon, XCircle, Trash2 } from 'lucide-react';
import { Trace, TraceStatus } from '@/types/trace';
import { Skeleton } from '@/components/ui/skeleton';
import CopyButton from '@/components/copy-button';

interface TracesTableProps {
  traces: Trace[];
  onTraceClick?: (trace: Trace) => void;
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
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

const formatDuration = (durationMs: number) => {
  if (durationMs < 1000) {
    return `${Number(durationMs.toFixed(2))}ms`;
  }
  return `${Number((durationMs / 1000).toFixed(2))}s`;
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export function TracesTable({
  traces,
  onTraceClick,
  isLoading = false,
  error = null,
  className,
}: TracesTableProps) {
  const handleClear = async () => {
    try {
      await fetch('/clean', { method: 'POST' });
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  };
  if (isLoading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex justify-end pb-2">
          <button onClick={handleClear} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm">
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Trace ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status Code</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-14" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <div className="flex flex-col items-center gap-3 py-12">
            <XCircle className="w-12 h-12 text-destructive" />
            <div className="text-center">
              <h3 className="text-lg font-medium mb-1">Error loading traces</h3>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full max-h-full overflow-auto', className)}>
      <div className="flex justify-end pb-2">
        <button onClick={handleClear} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm">
          <Trash2 className="w-4 h-4" /> Clear
        </button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Trace ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status Code</TableHead>
            {/* <TableHead>Status</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {traces.map(trace => (
            <TableRow
              key={trace.traceId}
              className={cn(
                'cursor-pointer transition-colors',
                onTraceClick && 'hover:bg-muted/50'
              )}
              onClick={() => onTraceClick?.(trace)}
            >
              <TableCell>
                <span className="text-muted-foreground">
                  {formatTimestamp(trace.timestamp)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {trace.traceId.substring(0, 10)}...
                  </code>
                  <CopyButton
                    text={trace.traceId}
                    buttonClassName="h-5 w-5"
                    iconClassName="h-3 w-3"
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{trace.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{trace.service}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span>{formatDuration(trace.durationMs)}</span>
                </div>
              </TableCell>
              <TableCell>
                {trace.statusCode && (
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {trace.statusCode}
                  </code>
                )}
              </TableCell>
              {/* <TableCell>{getStatusText(trace.status)}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {traces.length === 0 && (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <div className="flex flex-col items-center gap-3 py-12">
            <DatabaseIcon className="w-12 h-12 text-muted-foreground/50" />
            <div className="text-center">
              <h3 className="text-lg font-medium mb-1">No traces found</h3>
              <p className="text-sm text-muted-foreground">
                No traces match your current filters
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
