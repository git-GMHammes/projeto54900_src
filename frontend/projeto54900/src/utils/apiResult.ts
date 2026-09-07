// Normaliza a resposta da API para um formato unico, tolerando variacoes de envelope.
// Aceita: array puro | { data } | { items } | { rows } | { result } e paginacao em
// { pagination } | { meta } | campos soltos (total/page/limit).

import type { ApiRow, NormalizedList } from '@/types/api';

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function toNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeList<T = ApiRow>(payload: unknown): NormalizedList<T> {
  const record = asRecord(payload);
  const rawRows =
    (Array.isArray(payload) ? payload : undefined) ??
    record?.data ??
    record?.items ??
    record?.rows ??
    record?.result ??
    [];
  const rows: T[] = Array.isArray(rawRows) ? (rawRows as T[]) : [];

  const meta = asRecord(record?.pagination) ?? asRecord(record?.meta) ?? record ?? {};
  const total =
    toNumber(meta.total ?? meta.total_rows ?? meta.count, rows.length) || rows.length;
  const page = toNumber(meta.page ?? meta.current_page, 1) || 1;
  const limit = toNumber(meta.limit ?? meta.per_page, rows.length) || rows.length || 20;

  return { rows, total, page, limit };
}

export function normalizeItem<T = ApiRow>(payload: unknown): T | null {
  const record = asRecord(payload);
  if (!record) return (payload ?? null) as T | null;
  return (record.data ?? record.item ?? record.result ?? record) as T;
}
