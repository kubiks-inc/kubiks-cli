'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TraceVolumeChart } from './volume-chart';
import { TracesTable } from './traces-table';
import { TraceDrawer } from './trace-drawer';
import { useTraces } from '@/hooks/use-traces';
import { useTracesVolume } from '@/hooks/use-traces-volume';
import { TraceFilters } from './trace-filters-ui';
import { Trace, TimeRange } from '@/types/trace';
import { FilterCondition } from './trace-filters';
import {
  TimePeriodSelector,
  useTimePeriod,
} from '@/components/time-period-selector';
import { PageHeaderWithTitle } from '../page-header';
import { serializeFilters, deserializeFilters } from '@/lib/utils';

interface TracesContentProps {
  timerange?: { start: Date; end: Date };
}

export const TracesContent = ({ timerange }: TracesContentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange | null>(null);

  // Get filters from URL query params
  const filter = useMemo(() => {
    const filterParam = searchParams.get('filters');
    return deserializeFilters(filterParam || '') as FilterCondition[];
  }, [searchParams]);

  // Update URL when filters change
  const updateFiltersInUrl = (newFilters: FilterCondition[]) => {
    const params = new URLSearchParams(searchParams.toString());
    const filterString = serializeFilters(newFilters);

    if (filterString) {
      params.set('filters', filterString);
    } else {
      params.delete('filters');
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Add time period selector functionality
  const { selectedTimePeriod, setSelectedTimePeriod, getTimeRange } =
    useTimePeriod('7d');

  // Initialize time range on mount
  useEffect(() => {
    if (!timeRange) {
      setTimeRange(getTimeRange());
    }
  }, [timeRange, getTimeRange]);

  // Use provided timerange or calculated time range
  const effectiveTimeRange = useMemo(() => {
    if (timerange) {
      return timerange;
    }
    return timeRange || getTimeRange();
  }, [timerange, timeRange, getTimeRange]);

  const {
    data: allTraces,
    isLoading,
    error,
    hasMore,
    loadMore,
    resetTraces,
    isValidating,
  } = useTraces(filter, effectiveTimeRange);

  const {
    data: traceVolumeData,
    isLoading: volumeLoading,
    error: volumeError,
  } = useTracesVolume(effectiveTimeRange, filter);

  const handleTraceClick = (trace: Trace) => {
    setSelectedTrace(trace);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedTrace(null);
  };

  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
  };

  const handleFilterChange = (newFilter: FilterCondition[]) => {
    updateFiltersInUrl(newFilter);
  };

  return (
    <>
      <PageHeaderWithTitle title="Query">
        <TimePeriodSelector
          value={selectedTimePeriod}
          onValueChange={setSelectedTimePeriod}
          onTimeRangeChange={handleTimeRangeChange}
        />
      </PageHeaderWithTitle>
      <div className="container mx-auto h-full">
        <div className="w-full space-y-4 p-4">
          <TraceFilters
            currentFilter={filter}
            onFilterChange={handleFilterChange}
          />
          <TraceVolumeChart
            data={traceVolumeData}
            isLoading={volumeLoading}
            error={volumeError}
          />
          <TracesTable
            traces={allTraces}
            onTraceClick={handleTraceClick}
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoadingMore={isValidating && allTraces.length > 0}
            isLoading={isLoading}
            error={error}
          />
          {selectedTrace && (
            <TraceDrawer
              trace={selectedTrace}
              isOpen={isDrawerOpen}
              onClose={handleDrawerClose}
            />
          )}
        </div>
      </div>
    </>
  );
};
