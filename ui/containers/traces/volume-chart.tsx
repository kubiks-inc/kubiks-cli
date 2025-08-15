'use client';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { XCircle } from 'lucide-react';

export interface TraceVolumeData {
  bucket: string;
  successCount: number;
  errorCount: number;
  timeLabel: string;
}

export interface TraceVolumeChartProps {
  data: TraceVolumeData[];
  isLoading?: boolean;
  error?: Error | null;
}

const chartConfig: ChartConfig = {
  successCount: {
    label: 'Success',
    theme: {
      light: 'hsl(142, 76%, 36%)',
      dark: 'hsl(142, 76%, 36%)',
    },
  },
  errorCount: {
    label: 'Error',
    theme: {
      light: 'hsl(0, 84%, 60%)',
      dark: 'hsl(0, 84%, 60%)',
    },
  },
};

export const TraceVolumeChart = ({
  data,
  isLoading = false,
  error = null,
}: TraceVolumeChartProps) => {
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort data by bucket to ensure chronological order
    return data.sort(
      (a, b) => new Date(a.bucket).getTime() - new Date(b.bucket).getTime()
    );
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-2 border rounded-lg">
        <div className="aspect-auto h-[150px] w-full">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 border rounded-lg">
        <div className="flex items-center justify-center h-[150px] w-full">
          <div className="flex flex-col items-center gap-2 text-center">
            <XCircle className="w-8 h-8 text-destructive" />
            <div>
              <h3 className="text-sm font-medium mb-1">
                Error loading trace volume
              </h3>
              <p className="text-xs text-muted-foreground">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 border rounded-lg">
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[50px] w-full"
      >
        <BarChart data={processedData} barGap={1}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value, payload) => {
                  if (payload && payload[0] && payload[0].payload) {
                    const dataPoint = payload[0].payload as TraceVolumeData;
                    return new Date(dataPoint.bucket).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    });
                  }
                  return `Time: ${value}`;
                }}
                formatter={(value, name) => {
                  const numValue = Number(value);
                  return [
                    <span key={name} className="font-mono font-medium">
                      {numValue.toFixed(0)}
                    </span>,
                    chartConfig[name as keyof typeof chartConfig]?.label ||
                      name,
                  ];
                }}
                indicator="dot"
              />
            }
          />
          <Bar
            dataKey="successCount"
            fill="hsl(142, 76%, 36%)"
            radius={[2, 2, 0, 0]}
            stackId="1"
          />
          <Bar
            dataKey="errorCount"
            fill="hsl(0, 84%, 60%)"
            radius={[2, 2, 0, 0]}
            stackId="1"
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
