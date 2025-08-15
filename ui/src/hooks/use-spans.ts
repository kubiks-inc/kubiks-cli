'use client';

import useSWR from 'swr';
import { Span } from '@/types/span';

const API_BASE = 'http://localhost:7432';

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

export function useSpans(traceId: string) {
  const { data, error, isLoading, mutate } = useSWR<Span[]>(
    traceId ? `${API_BASE}/api/traces/${encodeURIComponent(traceId)}/spans` : null,
    fetcher
  );

  return {
    data: data ?? [],
    error,
    isLoading,
    mutate,
  } as const;
}


