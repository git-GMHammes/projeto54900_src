/**
 * =============================================================================
 * FILE HEADER — apiDebugLog (services) — store em memória das respostas de API
 * =============================================================================
 *
 * O QUE FAZ:
 *   Guarda, EM MEMÓRIA e SOMENTE EM DESENVOLVIMENTO, as últimas respostas de API
 *   (método, path, status, payload) e o último access token capturado — este
 *   junto das partes decodificadas do JWT. É a fonte do painel de depuração.
 *
 * POR QUE EXISTE: sem ele, investigar uma chamada exigiria abrir o DevTools a
 *   cada requisição. Com o store, o painel mostra o histórico e o token lido.
 *
 * QUEM ALIMENTA: `services/http.ts` — TODA requisição do sistema passa por lá e
 *   chama `record(...)` (BLOCO 4) depois de ler a resposta, antes de decidir
 *   entre sucesso e erro.
 *
 * QUEM CONSOME: o hook de depuração da API e o painel (`<ApiDebugPanel/>`),
 *   ligados por `subscribe()` — o padrão de store externo do React.
 *
 * DEV-ONLY, E ISSO É REGRA: `record()` começa verificando `isDevHost()`
 *   (`@/config/envHost`). Fora dos hosts de desenvolvimento ele é um no-op e
 *   NADA fica em memória — payload de resposta não é retido em produção. Não
 *   trocar essa checagem por outra condição sem revisar essa garantia.
 *
 * DEPENDÊNCIAS: `@/config/envHost` (`isDevHost`) e `@/utils/jwt` (`decodeJwt`,
 *   `findAccessToken`).
 *
 * CONSUMIDORES: o hook de depuração (assina o store) e `services/http.ts`
 *   (grava). Nenhuma tela de produção lê este módulo.
 *
 * COMO CRIAR UM STORE SIMILAR (estado global fora do React):
 *   1. variáveis de módulo para os dados + um `Set` de listeners;
 *   2. uma função `notify()` que avisa todos os listeners;
 *   3. funções de leitura (`getEntries`) e de escrita (`record`) que terminam
 *      chamando `notify()`;
 *   4. `subscribe(listener)` devolvendo a função de cancelar a assinatura — é o
 *      contrato que `useSyncExternalStore` exige.
 * =============================================================================
 */

import { isDevHost } from '@/config/envHost';
import { decodeJwt, findAccessToken } from '@/utils/jwt';

/**
 * =============================================================================
 * BLOCO 1 — TIPOS DO STORE
 * =============================================================================
 *
 * `ApiDebugEntry` — UMA resposta registrada, achatada para leitura no painel:
 *   id        -> sequencial interno (`seq`, BLOCO 2); é a CHAVE da lista;
 *   method    -> verbo HTTP usado (`GET`, `POST`, ...);
 *   path      -> URL COMPLETA montada por `http.ts` (base + caminho + query);
 *   status    -> código HTTP devolvido;
 *   ok        -> `response.ok` do fetch (atalho para pintar sucesso/erro);
 *   payload   -> corpo JÁ PARSEADO (JSON decodificado ou texto cru);
 *   timestamp -> `Date.now()` do registro (ordenação e hora exibida).
 *
 * `LatestToken` — o último access token visto, já decodificado:
 *   token      -> o JWT cru;
 *   header     -> parte 1 do JWT (`alg`, `typ`);
 *   payload    -> parte 2 do JWT (claims: `sub`, `exp`, papéis);
 *   sourcePath -> de qual requisição ele foi extraído (origem do token);
 *   capturedAt -> quando foi capturado.
 * -------------------------------------------------------------------------
 */
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

/**
 * =============================================================================
 * BLOCO 2 — ESTADO INTERNO DO STORE (variáveis de módulo)
 * =============================================================================
 *
 * O QUE FAZ: mantém o estado FORA do React — é o que permite a qualquer arquivo
 *   ler o histórico sem passar props, e o que mantém o painel atualizado por
 *   assinatura.
 *
 * VARIÁVEL A VARIÁVEL:
 *   MAX_ENTRIES -> teto do histórico (50). Mudar este número é a forma de mudar
 *                  quanto se guarda; as entradas antigas são descartadas pela
 *                  ponta (ver `record`, BLOCO 4);
 *   entries     -> histórico em memória, SEMPRE com a mais recente na frente;
 *   latestToken -> último `LatestToken` capturado, ou `null` se nenhum JWT
 *                  passou pelas respostas ainda;
 *   seq         -> contador de ids; só cresce e NÃO reinicia no `clear()`;
 *   listeners   -> quem quer ser avisado das mudanças (o hook de depuração).
 *                  Como é um `Set`, assinar duas vezes não duplica aviso.
 *
 * `notify()` é o ÚNICO ponto de disparo: toda função que altera o estado termina
 *   chamando ela. Uma função nova que mude estado também precisa chamar — sem
 *   isso o painel não atualiza, e a falha é silenciosa (sem erro no console).
 * -------------------------------------------------------------------------
 */
const MAX_ENTRIES = 50;

let entries: ApiDebugEntry[] = [];
let latestToken: LatestToken | null = null;
let seq = 0;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

/**
 * =============================================================================
 * BLOCO 3 — CAPTURA DO ACCESS TOKEN (a partir da resposta)
 * =============================================================================
 *
 * O QUE FAZ: procura um access token dentro do payload de QUALQUER resposta
 *   (`findAccessToken` varre as chaves conhecidas, ex.: `access_token`) e, se
 *   achar, decodifica o JWT e guarda o resultado em `latestToken`.
 *
 * POR QUE DECODIFICAR: `decodeJwt` NÃO valida assinatura — apenas lê header e
 *   payload em base64url. O objetivo é DIAGNÓSTICO (ver `exp`, `sub`, papéis),
 *   não autenticação: quem valida o token é o back-end.
 *
 * POR QUE SAIR EM SILÊNCIO QUANDO NÃO ACHA: a maioria das respostas não traz
 *   token (listagens, updates). Retornar sem fazer nada é o comportamento
 *   esperado — `latestToken` apenas permanece com o valor anterior.
 *
 * QUEM CHAMA: `record()` (BLOCO 4), passando o `path` como `sourcePath`.
 * -------------------------------------------------------------------------
 */
function captureAccessToken(payload: unknown, sourcePath: string): void {
  const token = findAccessToken(payload);
  if (!token) return;
  const decoded = decodeJwt(token);
  if (!decoded) return;
  latestToken = { token, header: decoded.header, payload: decoded.payload, sourcePath, capturedAt: Date.now() };
}

/**
 * =============================================================================
 * BLOCO 4 — API PÚBLICA DO STORE
 * =============================================================================
 *
 * `record(input)` — grava UMA resposta. Recebe o entry SEM `id`/`timestamp` (o
 *   store é dono desses dois campos) e faz, na ordem:
 *     1. `isDevHost()`: fora do host de desenvolvimento, SAI SEM GRAVAR (nada em
 *        memória, nenhum listener avisado) — é a barreira que mantém o store
 *        dev-only;
 *     2. monta o entry com `id` sequencial e `timestamp` do momento;
 *     3. insere na FRENTE e corta em `MAX_ENTRIES` (histórico recente primeiro);
 *     4. tenta capturar o token (BLOCO 3);
 *     5. `notify()` avisa quem assina.
 *
 * `getEntries()` — snapshot do histórico (a referência atual do array; quem
 *   consome trata como leitura).
 *
 * `getLatestToken()` — o último token capturado, ou `null`.
 *
 * `subscribe(listener)` — assina as mudanças e DEVOLVE a função de cancelar
 *   (`listeners.delete`). É exatamente o contrato de `useSyncExternalStore`, e é
 *   por isso que o hook consegue usar este store sem estado paralelo.
 *
 * `clear()` — esvazia histórico e token guardado e avisa os assinantes (é o
 *   botão de limpar do painel). O `seq` NÃO reinicia DE PROPÓSITO: ids antigos
 *   nunca se repetem, o que evita chave duplicada na renderização da lista.
 * -------------------------------------------------------------------------
 */
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
