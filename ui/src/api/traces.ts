import { Span } from "@/types/span";

const API_BASE = ''

export async function fetchSpans(params?: { limit?: number; offset?: number }): Promise<Span[]> {
  const limit = params?.limit ?? 1000
  const offset = params?.offset ?? 0
  const url = `${API_BASE}/api/spans?limit=${encodeURIComponent(String(limit))}&offset=${encodeURIComponent(String(offset))}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch traces: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function fetchAllSpans(): Promise<Span[]> {
  const url = `${API_BASE}/api/spans-all`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch all traces: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export type LogRecord = {
  timeUnixNano?: string
  observedTimeUnixNano?: string
  severityText?: string
  severityNumber?: number
  body?: any
  attributes?: Record<string, any>
  resourceAttributes?: Record<string, any>
}

export async function fetchLogsByTraceId(traceId: string): Promise<LogRecord[]> {
  const url = `${API_BASE}/api/logs?traceId=${encodeURIComponent(traceId)}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch logs: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function fetchAllLogs(): Promise<LogRecord[]> {
  const url = `${API_BASE}/api/logs-all`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch all logs: ${res.status} ${res.statusText}`)
  }
  return res.json()
}


