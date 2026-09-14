// Store global (em memoria) das respostas de API — dev-only.
// Toda chamada passa por services/http.ts, que grava aqui via record().
// Consumir pelo hook useApiDebugLog() / <ApiDebugPanel/>.
//
// Ativo somente em DEV_HOSTS (config/envHost.ts); fora dele, record() e um
// no-op e nada e mantido em memoria.

import { isDevHost } from '@/config/envHost';
import { decodeJwt, findAccessToken } from '@/utils/jwt';

export interface ApiDebugEntry {
  id: number;
  method: string;
  path: string;
  status: number;
  ok: boolean;
  payload: unknown;
  timestamp: number;
}

export interface LatestToken {
  token: string;
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  sourcePath: string;
  capturedAt: number;
}

const MAX_ENTRIES = 50;

let entries: ApiDebugEntry[] = [];
let latestToken: LatestToken | null = null;
let seq = 0;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function captureAccessToken(payload: unknown, sourcePath: string): void {
  const token = findAccessToken(payload);
  if (!token) return;
  const decoded = decodeJwt(token);
  if (!decoded) return;
  latestToken = { token, header: decoded.header, payload: decoded.payload, sourcePath, capturedAt: Date.now() };
}

export function record(input: Omit<ApiDebugEntry, 'id' | 'timestamp'>): void {
  if (!isDevHost()) return;
  const entry: ApiDebugEntry = { ...input, id: ++seq, timestamp: Date.now() };
  entries = [entry, ...entries].slice(0, MAX_ENTRIES);
  captureAccessToken(input.payload, input.path);
  notify();
}

export function getEntries(): ApiDebugEntry[] {
  return entries;
}

export function getLatestToken(): LatestToken | null {
  return latestToken;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function clear(): void {
  entries = [];
  latestToken = null;
  notify();
}
