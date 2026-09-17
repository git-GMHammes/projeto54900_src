/**
 * =========================================================================
 * FILE HEADER — utils/apiResult.ts
 * =========================================================================
 *
 * PROPOSITO: normaliza a resposta da API para um formato unico, tolerando
 * variacoes de envelope entre endpoints/controllers do backend. Aceita:
 * array puro | { data } | { items } | { rows } | { result } para listas, e
 * paginacao em { pagination } | { meta } | campos soltos no proprio objeto
 * (total/page/limit) — assim cada pagina consome sempre a mesma forma
 * ({ rows, total, page, limit } ou o item plano), sem replicar essa logica
 * de deteccao em cada chamada.
 *
 * DEPENDENCIAS: types/api (ApiRow, NormalizedList).
 * CONSUMIDORES: e o utilitario mais usado do projeto — praticamente todas as
 * paginas de pages/v1/** (listagens, detalhes, forms) e
 * services/v1/auth.service.ts chamam normalizeList/normalizeItem logo apos
 * qualquer resposta de http.ts, antes de guardar em estado.
 *
 * COMO REAPROVEITAR: chamar normalizeList(raw) para respostas de listagem
 * (paginadas) e normalizeItem(raw) para respostas de um unico registro
 * (create/update/get). Nao chamar http.ts direto sem passar por aqui, para
 * nao reintroduzir a deteccao manual de envelope em cada pagina.
 * -------------------------------------------------------------------------
 */

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

/**
 * Extrai { rows, total, page, limit } de qualquer envelope de listagem
 * conhecido, com fallback de paginacao calculado a partir do tamanho real
 * do array quando o backend nao manda meta explicita.
 * @param payload corpo bruto da resposta HTTP (json ja parseado)
 * @returns lista tipada + metadados de paginacao, nunca lanca excecao
 */
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

/**
 * Extrai o registro de dentro de qualquer envelope de item conhecido
 * ({ data } | { item } | { result } | o proprio objeto).
 * @param payload corpo bruto da resposta HTTP (json ja parseado)
 * @returns o registro tipado, ou null se payload for null/undefined
 */
export function normalizeItem<T = ApiRow>(payload: unknown): T | null {
  const record = asRecord(payload);
  if (!record) return (payload ?? null) as T | null;
  return (record.data ?? record.item ?? record.result ?? record) as T;
}
