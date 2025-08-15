export type Span = {
  traceId: string
  spanId: string
  kind: number
  name: string
  endTimeUnixNano: number
  startTimeUnixNano: number
  attributes: Record<string, string>
  resourceAttributes: Record<string, string>
}