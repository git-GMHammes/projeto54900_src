/**
 * =============================================================================
 * FILE HEADER — api.ts (types) — contratos da camada de API
 * =============================================================================
 *
 * O QUE FAZ: é a FONTE ÚNICA dos contratos que atravessam a camada de dados —
 *   `http` -> `services` -> `hooks` -> páginas. Tudo o que é "forma de chamada e
 *   de resposta" mora aqui, e não em cada service.
 *
 * POR QUE CENTRALIZAR: um tipo por preocupação (método, querystring, paginação,
 *   opções de chamada, resultado normalizado) evita que cada service invente a
 *   própria versão de "opções" ou de "página" — e faz uma mudança de contrato
 *   aparecer em UM arquivo só.
 *
 * MAPA DE CONSUMIDORES (quem depende de quê):
 *   `HttpMethod`, `RequestOptions`, `ApiErrorInit`, `QueryParams` -> `services/http.ts`
 *   `CallOptions`, `PaginationInput`, `QueryParams` -> `services/resourceFactory.ts`
 *   `CallOptions`                                   -> `services/dbSchema.ts`
 *   `ApiRow`, `NormalizedList`                      -> `utils/apiResult.ts`
 *   `ApiRow`                                        -> `services/formSchema.ts` e páginas
 *   `PageParams`, `QueryParams`, `SortOrder`        -> `utils/querystring.ts`
 *   `PageParams`                                    -> `hooks/usePagination.ts`
 *   `QueryParams`, `ApiRow`                         -> páginas de lista (montar chamadas)
 *
 * DEPENDÊNCIAS: nenhuma — tipos puros, sem import. É o tipo de arquivo que TUDO
 *   pode importar sem criar ciclo.
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. acrescentar campo aqui é mudança de contrato GLOBAL: confira o mapa de
 *      consumidores acima ANTES de editar;
 *   2. tipo de um módulo específico (auth, menu) NÃO entra aqui — tem arquivo
 *      próprio. Este arquivo só cobre o que é comum à camada de API;
 *   3. os nomes seguem o que o back-end entende (`page`, `limit`, `sort`,
 *      `order`): não renomear por estética, senão a querystring muda de sentido.
 * =============================================================================
 */

/**
 * =============================================================================
 * BLOCO 1 — MÉTODO E ORDENAÇÃO (`HttpMethod` / `SortOrder`)
 * =============================================================================
 *
 * `HttpMethod` — os cinco verbos que a camada aceita. É o tipo do primeiro
 *   parâmetro de `request()` (`services/http.ts`): o verbo é dado, não string
 *   livre, o que impede passar 'POST' onde se espera o que for.
 *
 * `SortOrder` — direção da ordenação ('ASC' | 'DESC'), usada nas querystrings de
 *   listagem (`?sort=&order=`) e serializada por `utils/querystring.ts`.
 *
 * OS VALORES SÃO OS DO BACK-END (maiúsculos). Mudar a caixa aqui quebraria a
 *   ordenação em silêncio: a API simplesmente cairia na ordenação padrão.
 * -------------------------------------------------------------------------
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type SortOrder = 'ASC' | 'DESC';

/**
 * =============================================================================
 * BLOCO 2 — QUERYSTRING (`QueryValue` / `QueryParams`)
 * =============================================================================
 *
 * `QueryValue` — o que pode virar parâmetro de URL: texto, número, booleano,
 *   `null`, `undefined` ou ARRAY de texto/número.
 *   - `null`/`undefined` existem para o chamador montar o objeto com campos
 *     condicionais; quem descarta (ou não) é o `toQueryString`;
 *   - ARRAY existe para filtro repetido (`roles[]=a&roles[]=b`) — o formato que o
 *     back-end entende como lista.
 *
 * `QueryParams` — o mapa `nome do parâmetro -> valor`, usado em `params` de
 *   `RequestOptions` (BLOCO 4), dentro de `PaginationInput` (BLOCO 3) e no objeto
 *   que `utils/querystring.ts` serializa.
 *
 * QUEM CONSOME: `services/http.ts` (monta a URL), `services/resourceFactory.ts`
 *   e as páginas que passam filtros extras.
 * -------------------------------------------------------------------------
 */
export type QueryValue = string | number | boolean | null | undefined | (string | number)[];
export type QueryParams = Record<string, QueryValue>;

/**
 * =============================================================================
 * BLOCO 3 — PAGINAÇÃO: NORMALIZADO x REQUEST
 * =============================================================================
 *
 * São DOIS tipos porque são DOIS momentos da mesma informação:
 *
 * `PageParams` — paginação JÁ NORMALIZADA: `page`, `limit`, `sort` e `order`
 *   sempre presentes, com o tipo final. É o que `hooks/usePagination.ts` mantém
 *   (sincronizado com a URL) e o que `utils/querystring.ts` serializa.
 *
 * `PaginationInput` — paginação COMO A CHAMADA MANDA: `Partial<PageParams>` mais
 *   `QueryParams` livres. Ou seja: pode OMITIR campo (o back-end aplica o default)
 *   e pode acrescentar parâmetros daquele endpoint específico (ex.: `q` da busca).
 *   É o tipo dos parâmetros de `find`/`getAll`/`search` em
 *   `services/resourceFactory.ts`.
 *
 * ERRO COMUM: passar `PageParams` onde se espera `PaginationInput` funciona (é
 *   subconjunto), mas o INVERSO não — é por isso que a normalização existe no
 *   hook, antes de chegar aqui.
 * -------------------------------------------------------------------------
 */
export interface PageParams {
  page: number;
  limit: number;
  sort: string;
  order: SortOrder;
}

// Paginacao como enviada numa request: subconjunto de PageParams + extras livres.
export type PaginationInput = Partial<PageParams> & QueryParams;

/**
 * =============================================================================
 * BLOCO 4 — OPÇÕES DE CHAMADA (`RequestOptions` / `CallOptions`)
 * =============================================================================
 *
 * `RequestOptions` — tudo o que uma chamada HTTP pode receber:
 *   params  -> querystring (BLOCO 2);
 *   body    -> corpo: objeto vira JSON; `FormData` passa cru (ver `http.ts`);
 *   headers -> cabeçalhos extras, mesclados por ÚLTIMO no `http.ts`, o que
 *              permite sobrescrever um cabeçalho fixo quando necessário;
 *   signal  -> `AbortSignal` para CANCELAR a requisição — é o que o `useApi` usa
 *              ao desmontar a tela.
 *   O `| undefined` explícito em cada campo existe por causa do
 *   `exactOptionalPropertyTypes` do projeto: sem ele, passar `params: undefined`
 *   não compilaria.
 *
 * `CallOptions` — `RequestOptions` SEM `body`. É o que `services/*` aceitam nos
 *   métodos cujo CORPO é do próprio método (`find(filters, pagination, opts)`,
 *   `create(data, opts)`): o chamador ajusta `params`/`headers`/`signal` e não
 *   consegue sobrescrever o corpo por acidente.
 *
 * QUEM CONSOME: `services/http.ts` (`RequestOptions`),
 *   `services/resourceFactory.ts` e `services/dbSchema.ts` (`CallOptions`).
 * -------------------------------------------------------------------------
 */
export interface RequestOptions {
  params?: QueryParams | undefined;
  body?: unknown;
  headers?: Record<string, string> | undefined;
  signal?: AbortSignal | undefined;
}

// Opcoes repassadas pelos services (sem body; o service monta o body).
export type CallOptions = Omit<RequestOptions, 'body'>;

/**
 * =============================================================================
 * BLOCO 5 — ERRO, LINHA CRUA E RESULTADO NORMALIZADO
 * =============================================================================
 *
 * `ApiErrorInit` — os campos OPCIONAIS do construtor de `ApiError`
 *   (`services/http.ts`): `status`, `data` e `url`. Existe para o erro poder ser
 *   criado em qualquer ponto da camada sem repetir a assinatura inteira — o
 *   `ApiError` aplica os defaults (`0`, `null`, `''`).
 *
 * `ApiRow` — UMA linha da API antes de qualquer modelagem: `Record<string,
 *   unknown>`. É o tipo de passagem dos adaptadores que ainda vão normalizar
 *   (ex.: `buildField` em `services/formSchema.ts`) e das páginas que exibem
 *   campos crus. Usá-lo é assumir que cada campo será VALIDADO na leitura (com os
 *   helpers de conversão), e não que ele já tem o tipo certo.
 *
 * `NormalizedList<T>` — o resultado de `normalizeList()`
 *   (`utils/apiResult.ts`): `rows`, `total`, `page` e `limit` no MESMO formato,
 *   independentemente do envelope que a API devolveu. É o tipo que as listagens
 *   consomem para paginar (`total`) e renderizar (`rows`), com o `<T>` escolhido
 *   por quem chama (ex.: `NormalizedList<MenuManagerItem>` em `useSiteMenu`).
 * -------------------------------------------------------------------------
 */
export interface ApiErrorInit {
  status?: number;
  data?: unknown;
  url?: string;
}

// Linha generica devolvida pela API antes de qualquer modelagem especifica.
export type ApiRow = Record<string, unknown>;

// Resultado de normalizeList().
export interface NormalizedList<T = ApiRow> {
  rows: T[];
  total: number;
  page: number;
  limit: number;
}
