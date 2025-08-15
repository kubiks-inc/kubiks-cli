export type TraceRecord = {
  id: number
  trace_id: string
  servicename: string
  timestamp: string
  data: unknown
}

const API_BASE = 'http://localhost:7432'

export async function fetchTraces(params?: { limit?: number; offset?: number }): Promise<TraceRecord[]> {
  const limit = params?.limit ?? 5
  const offset = params?.offset ?? 0
  const url = `${API_BASE}/api/traces?limit=${encodeURIComponent(String(limit))}&offset=${encodeURIComponent(String(offset))}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch traces: ${res.status} ${res.statusText}`)
  }
  return res.json()
}


