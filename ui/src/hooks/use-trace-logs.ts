'use client';

import useSWR from 'swr';

const API_BASE = 'http://localhost:7432';

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

export interface TraceLogRecord {
  timestamp: string;
  level: string;
  message: string;
  attributes?: Record<string, unknown>;
}

export function useTraceLogs(traceId: string) {
  const { data, error, isLoading, mutate } = useSWR<TraceLogRecord[]>(
    traceId ? `${API_BASE}/api/traces/${encodeURIComponent(traceId)}/logs` : null,
    fetcher
  );

  return {
    data: data ?? [],
    error,
    isLoading,
    mutate,
  } as const;
}


