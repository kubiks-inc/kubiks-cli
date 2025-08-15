import { Span } from "@/types/span";

const API_BASE = ''

export async function fetchSpans(params?: { limit?: number; offset?: number }): Promise<Span[]> {
  const limit = params?.limit ?? 5
  const offset = params?.offset ?? 0
  const url = `${API_BASE}/api/spans?limit=${encodeURIComponent(String(limit))}&offset=${encodeURIComponent(String(offset))}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch traces: ${res.status} ${res.statusText}`)
  }
  return res.json()
}


