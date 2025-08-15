export enum TraceStatus {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface Trace {
  traceId: string;
  timestamp: string;
  durationMs: number;
  traceStatus: string;
  statusCode: string;
  name: string;
  statusText: string;
  service: string;
  status: TraceStatus;
}

export interface TimeRange {
  start: Date;
  end: Date;
}
