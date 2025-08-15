export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId: string;
  timestamp: string;
  duration: number;
  durationMs: number;
  statusCode: string;
  statusMessage: string;
  spanKind: string;
  serviceName: string;
  spanName: string;
  spanAttributes: Record<string, any>;
  resourceAttributes: Record<string, any>;
  events: any[];
  links: any[];
}
