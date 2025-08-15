export type Span = {
  traceId: string
  spanId: string
  parentSpanId: string
  kind: number
  name: string
  endTimeUnixNano: number
  startTimeUnixNano: number
  attributes: Record<string, string>
  resourceAttributes: Record<string, string>

  // computed
  durationMs: number
  timestamp: Date
}