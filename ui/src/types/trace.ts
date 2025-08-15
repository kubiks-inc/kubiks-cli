export enum TraceStatus {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface Trace {
  traceId: string;
  timestamp: string;
  durationMs: number;
  statusCode: string;
  name: string;
  service: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
}
