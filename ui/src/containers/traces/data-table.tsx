'use client';

import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2, SearchIcon } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  className?: string;
  width?: string; // CSS grid column width (e.g., "180px", "1fr", "minmax(100px, 1fr)")
  render?: (item: any) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRowClick?: (item: T) => void;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description: string;
  };
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  onRowClick,
  emptyState,
  className,
}: DataTableProps<T>) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoadingMore || !loadMoreRef.current || !onLoadMore)
      return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          // Add a small delay to prevent rapid-fire triggers
          setTimeout(() => {
            onLoadMore();
          }, 100);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  if (isLoading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <div className="flex flex-col items-center gap-3 py-12">
          {emptyState.icon || (
            <SearchIcon className="w-12 h-12 text-muted-foreground/50" />
          )}
          <div className="text-center">
            <h3 className="text-lg font-medium mb-1">{emptyState.title}</h3>
            <p className="text-sm text-muted-foreground">
              {emptyState.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Generate grid template columns
  const gridTemplateColumns = columns.map(col => col.width || '1fr').join(' ');

  return (
    <div className={cn('w-full', className)}>
      {/* Table Header */}
      <div className="sticky top-0 bg-muted/30 border-b border-border z-10">
        <div
          className="grid gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide"
          style={{ gridTemplateColumns }}
        >
          {columns.map(column => (
            <div key={column.key} className={column.className}>
              {column.label}
            </div>
          ))}
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border/50">
        {data.map((item, index) => (
          <div
            key={item.id || item.traceId || item.spanId || index}
            className={cn(
              'grid gap-4 px-4 py-2 items-center text-sm transition-colors',
              onRowClick && 'cursor-pointer hover:bg-muted/50'
            )}
            style={{ gridTemplateColumns }}
            onClick={() => onRowClick?.(item)}
          >
            {columns.map(column => (
              <div key={column.key} className={column.className}>
                {column.render ? column.render(item) : item[column.key]}
              </div>
            ))}
          </div>
        ))}

        {/* Load More Section */}
        {hasMore && (
          <div
            ref={loadMoreRef}
            className="flex justify-center py-4 border-t border-border/50"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Loading more...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Scroll to load more...</span>
              </div>
            )}
          </div>
        )}

        {/* End of results indicator */}
        {!hasMore && data.length > 0 && (
          <div className="flex items-center justify-center py-4 text-muted-foreground">
            <span>No more results to load</span>
          </div>
        )}
      </div>
    </div>
  );
}
