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
import { DatabaseIcon, XCircle } from 'lucide-react';
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

const getStatusText = (status: string) => {
  if (!status) {
    return <span className="text-muted-foreground font-medium">Unknown</span>;
  }
  const num = Number(status);
  if (!isNaN(num)) {
    if (num >= 200 && num < 300) {
      return (
        <span className="text-emerald-600 font-medium">
          {num}
        </span>
      );
    }
    if (num >= 300 && num < 400) {
      return (
        <span className="text-blue-600 font-medium">
          {num}
        </span>
      );
    }
    if (num >= 400 && num < 500) {
      return (
        <span className="text-amber-600 font-medium">
          {num}
        </span>
      );
    }
    if (num >= 500 && num < 600) {
      return (
        <span className="text-red-600 font-medium">
          {num}
        </span>
      );
    }
  }
  return (
    <span className="text-muted-foreground font-medium">
      {status}
    </span>
  );
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
  if (isLoading) {
    return (
      <div className={cn('w-full', className)}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
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
      {traces.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status Codes</TableHead>
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
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex items-center gap-1">
                      {getStatusText(trace.statusCode)}
                    </code>
                  )}
                </TableCell>
                {/* <TableCell>{getStatusText(trace.status)}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
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
