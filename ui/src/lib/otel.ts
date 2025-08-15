import { Span } from '@/types/span'
import type { TraceRecord } from '@/api/traces'

type OTelValue = { stringValue?: string; intValue?: number; doubleValue?: number; boolValue?: boolean }

function attributesArrayToMap(attrs: Array<{ key: string; value: OTelValue }> | undefined): Record<string, any> {
  const map: Record<string, any> = {}
  if (!attrs) return map
  for (const { key, value } of attrs) {
    if (!value) continue
    if (value.stringValue !== undefined) map[key] = value.stringValue
    else if (value.intValue !== undefined) map[key] = value.intValue
    else if (value.doubleValue !== undefined) map[key] = value.doubleValue
    else if (value.boolValue !== undefined) map[key] = value.boolValue
  }
  return map
}

function nsecStringToMs(nsec: string | number | undefined): number {
  if (!nsec) return 0
  const asNum = typeof nsec === 'string' ? Number(nsec) : nsec
  if (!Number.isFinite(asNum)) return 0
  return asNum / 1_000_000
}

function kindNumberToString(kind: number | undefined): string {
  switch (kind) {
    case 1: return 'INTERNAL'
    case 2: return 'SERVER'
    case 3: return 'CLIENT'
    case 4: return 'PRODUCER'
    case 5: return 'CONSUMER'
    default: return 'INTERNAL'
  }
}

export function extractSpansFromRecord(record: TraceRecord): Span[] {
  const data: any = record.data
  const result: Span[] = []
  if (!data || !Array.isArray(data.resourceSpans)) return result

  for (const resourceSpan of data.resourceSpans as any[]) {
    const resourceAttrs = attributesArrayToMap(resourceSpan?.resource?.attributes)
    const serviceName = resourceAttrs['service.name'] || record.servicename || 'unknown'
    const scopeSpans: any[] = resourceSpan?.scopeSpans || []
    for (const scope of scopeSpans) {
      const spans: any[] = scope?.spans || []
      for (const s of spans) {
        const spanAttrs = attributesArrayToMap(s?.attributes)
        const startMs = nsecStringToMs(s?.startTimeUnixNano)
        const endMs = nsecStringToMs(s?.endTimeUnixNano)
        const durationMs = Math.max(endMs - startMs, 0)
        const httpStatus = spanAttrs['http.status_code']
        const statusCode = httpStatus !== undefined ? String(httpStatus) : ''
        const statusMessage = spanAttrs['http.status_text'] || (s?.status?.message ?? '')

        const span: Span = {
          traceId: s?.traceId ?? record.trace_id,
          spanId: s?.spanId ?? '',
          parentSpanId: s?.parentSpanId ?? '',
          timestamp: new Date(startMs).toISOString(),
          duration: durationMs / 1000,
          durationMs,
          statusCode,
          statusMessage,
          spanKind: kindNumberToString(s?.kind),
          serviceName,
          spanName: s?.name ?? 'unknown',
          spanAttributes: spanAttrs,
          resourceAttributes: resourceAttrs,
          events: Array.isArray(s?.events) ? s.events : [],
          links: Array.isArray(s?.links) ? s.links : [],
        }
        result.push(span)
      }
    }
  }
  return result
}

export function summarizeTrace(record: TraceRecord) {
  const spans = extractSpansFromRecord(record).filter(s => s.traceId === record.trace_id)
  if (spans.length === 0) return { name: '—', durationMs: 0, statusCode: '', statusText: 'Unknown' }
  const minStart = Math.min(...spans.map(s => new Date(s.timestamp).getTime()))
  const maxEnd = Math.max(...spans.map(s => new Date(s.timestamp).getTime() + s.durationMs))
  const durationMs = Math.max(maxEnd - minStart, 0)
  // choose a representative span: first server/client or first span
  const rep = spans.find(s => s.spanKind === 'SERVER') || spans.find(s => s.spanKind === 'CLIENT') || spans[0]
  const statusCode = rep.statusCode || ''
  const statusText = statusCode ? (Number(statusCode) >= 400 ? 'Error' : 'OK') : (rep.statusMessage || 'Unknown')
  const name = rep.spanName || '—'
  return { name, durationMs, statusCode, statusText }
}


