/**
 * =============================================================================
 * FILE HEADER — resourceFactory (services) — gerador do endpoint-set REST
 * =============================================================================
 *
 * O QUE FAZ:
 *   `createResource(group, version?, opts?)` monta, em uma linha, o conjunto de
 *   métodos REST de UM recurso do back-end: leitura (`find`, `get`, `getAll`,
 *   `search`, `getNoPagination`, ...) e, quando pedido, escrita (`create`,
 *   `update`, `deleteSoft`, `deleteRestore`, `deleteHard`, `clearDeleted`).
 *
 * POR QUE EXISTE: sem a factory, cada arquivo de `services/v1/*` repetiria a
 *   mesma URL com nomes de método ligeiramente diferentes. Aqui a URL é
 *   calculada UMA vez (`base` + sufixo) e o nome do método é o MESMO em todos os
 *   recursos — quem lê `userManagerTable.get(id)` sabe exatamente qual rota é.
 *
 * COMO O BACK-END ESPELHA ISTO: os sufixos vêm de `RESOURCE_ENDPOINTS`
 *   (`@/constants/api`) e correspondem às ações de `ResourceTableController` e
 *   `ResourceViewController` do CodeIgniter. Ou seja: os nomes das ações do
 *   controller e as chaves dessa constante precisam andar juntos.
 *
 * USO (os dois formatos que existem hoje):
 *   const userManagerTable = createResource('user-manager');
 *   const userView = createResource('user-manager-view', 'v1', { mutations: false });
 *
 * DEPENDÊNCIAS: `@/services/http` (toda chamada sai por ele, com URL base,
 *   headers, token e `ApiError`) e `@/constants/api` (`DEFAULT_API_VERSION`,
 *   `RESOURCE_ENDPOINTS`).
 *
 * CONSUMIDORES: todos os arquivos de `services/v1/*` — o padrão do projeto é
 *   exportar uma instância por grupo (ex.: `userManagerTable`, `userManagerView`)
 *   e, por tabela, as páginas que as usam.
 *
 * COMO CRIAR O SERVICE DE UM RECURSO NOVO:
 *   1. confirme o grupo no back-end (controller/tabela) e qual versão usar
 *      (`DEFAULT_API_VERSION` cobre o caso comum);
 *   2. se o grupo for só de leitura (`-view`), passe `{ mutations: false }`: o
 *      tipo devolvido passa a ser `ResourceReader` e não há como chamar escrita;
 *   3. exporte a instância em `services/v1` com o nome do grupo + `Table`/`View`;
 *   4. nunca escreva a URL na mão dentro da página: use a instância.
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. método NOVO só entra aqui se for padrão de TODOS os recursos — a factory
 *      descreve o contrato comum. Endpoint exclusivo de um recurso se chama com
 *      `http` direto no service dele;
 *   2. mudar um sufixo aqui muda TODOS os recursos de uma vez: alinhe antes com
 *      `RESOURCE_ENDPOINTS` e com o back-end;
 *   3. filtros viajam no BODY e paginação na QUERY (ver BLOCO 3) — inverter isso
 *      quebra os controllers sem erro visível no front.
 * =============================================================================
 */

import { http } from '@/services/http';
import { DEFAULT_API_VERSION, RESOURCE_ENDPOINTS as E } from '@/constants/api';
import type { CallOptions, PaginationInput, QueryParams } from '@/types/api';

/**
 * =============================================================================
 * BLOCO 1 — TIPOS: O CONTRATO DO ENDPOINT-SET
 * =============================================================================
 *
 * `Id` / `Body` — apelidos locais: identificador aceito no CAMINHO da URL
 *   (string OU number, porque a API pode devolver id numérico) e corpo de
 *   requisição (objeto plano).
 *
 * `ResourceReader` — o que TODO recurso sabe fazer LENDO. O comentário de cada
 *   método (no arquivo) diz o verbo e a rota; os três campos fixos (`base`,
 *   `version`, `group`) são o endereço do recurso, úteis para log/depuração sem
 *   remontar a URL na mão.
 *
 * `ResourceWriter extends ResourceReader` — acrescenta as MUTAÇÕES: `create`
 *   (POST), `update` (PUT com id no caminho), `deleteSoft` (DELETE),
 *   `deleteRestore` (PATCH) e `deleteHard` (DELETE). Como estende o reader, todo
 *   writer também lê.
 *
 * `ResourceOptions` — hoje só `mutations` (default `true`): escolhe QUAL dos dois
 *   contratos a factory devolve (ver BLOCO 2). É o único botão de configuração.
 * -------------------------------------------------------------------------
 */
type Id = string | number;
type Body = Record<string, unknown>;

export interface ResourceReader {
  readonly base: string;
  readonly version: string;
  readonly group: string;

  /** POST find (filtros no body) ?page=&limit=&sort=&order= */
  find(filters?: Body, pagination?: PaginationInput, opts?: CallOptions): Promise<unknown>;
  /** POST get-grouped */
  getGrouped(body?: Body, pagination?: PaginationInput, opts?: CallOptions): Promise<unknown>;
  /** GET search?q=termo */
  search(q: string, pagination?: PaginationInput, opts?: CallOptions): Promise<unknown>;
  /** GET get/{id} */
  get(id: Id, opts?: CallOptions): Promise<unknown>;
  /** GET get-all?page=&limit=&sort=&order= */
  getAll(pagination?: PaginationInput, opts?: CallOptions): Promise<unknown>;
  /** GET get-no-pagination?sort=&order= */
  getNoPagination(sort?: QueryParams, opts?: CallOptions): Promise<unknown>;
  /** GET get-deleted/{id} */
  getDeleted(id: Id, opts?: CallOptions): Promise<unknown>;
  /** GET get-deleted-all?page=&limit=&sort=&order= */
  getDeletedAll(pagination?: PaginationInput, opts?: CallOptions): Promise<unknown>;
  /** GET get-all-with-deleted?page=&limit=&sort=&order=  (ou /{id}) */
  getAllWithDeleted(idOrPagination?: Id | PaginationInput, opts?: CallOptions): Promise<unknown>;
}

export interface ResourceWriter extends ResourceReader {
  /** POST create */
  create(data: unknown, opts?: CallOptions): Promise<unknown>;
  /** PUT update/{id} */
  update(id: Id, data: unknown, opts?: CallOptions): Promise<unknown>;
  /** DELETE delete-soft/{id} */
  deleteSoft(id: Id, opts?: CallOptions): Promise<unknown>;
  /** PATCH delete-restore/{id} */
  deleteRestore(id: Id, opts?: CallOptions): Promise<unknown>;
  /** DELETE delete-hard/{id} */
  deleteHard(id: Id, opts?: CallOptions): Promise<unknown>;
  /** DELETE clear-deleted  (ou /{id}) */
  clearDeleted(id?: Id, opts?: CallOptions): Promise<unknown>;
}

export interface ResourceOptions {
  mutations?: boolean;
}

/**
 * =============================================================================
 * BLOCO 2 — SOBRECARGAS DE `createResource` (o que o TypeScript promete)
 * =============================================================================
 *
 * O QUE FAZEM: descrevem, SÓ para o compilador, o que cada combinação de
 *   argumentos devolve. A implementação (BLOCO 3) é uma só e recebe tudo de
 *   forma mais frouxa.
 *
 * AS TRÊS FORMAS — e por que a segunda importa:
 *   1. `createResource(group)` -> `ResourceWriter` (versão default do `env`);
 *   2. `createResource(group, version, { mutations: false })` -> `ResourceReader`;
 *      sem os métodos de escrita no TIPO. É isso que impede, em tempo de
 *      compilação, chamar `update(...)` num grupo `-view` (cuja rota não existe
 *      no back-end);
 *   3. `createResource(group, version, { mutations: true })` -> `ResourceWriter`.
 *
 * SE FOR CRIAR UMA SOBRECARGA NOVA: ela serve para estreitar o RETORNO de uma
 *   combinação de argumentos já existente — não para acrescentar comportamento.
 *   Comportamento novo entra no BLOCO 3 e vale para todos os recursos.
 * -------------------------------------------------------------------------
 */
export function createResource(group: string, version?: string): ResourceWriter;
export function createResource(
  group: string,
  version: string,
  opts: { mutations: false },
): ResourceReader;
export function createResource(
  group: string,
  version: string,
  opts: { mutations?: true },
): ResourceWriter;
/**
 * =============================================================================
 * BLOCO 3 — IMPLEMENTAÇÃO: URL BASE E MÉTODOS DE LEITURA
 * =============================================================================
 *
 * `base` — `/<versão>/<grupo>` (ex.: `/v1/user-manager`): o endereço que
 *   `http.ts` completa com `env.apiBaseUrl`. Aqui NÃO se escreve protocolo nem
 *   host, e é por isso que a mesma factory serve a qualquer ambiente.
 *
 * `p(suffix)` — atalho de concatenação (`p('create')` gera
 *   `/v1/user-manager/create`), mantendo toda rota derivada de um único `base`.
 *
 * O `reader` — objeto com os nove métodos de leitura. Duas decisões explicam
 *   quase tudo nele:
 *
 *   1. O VERBO NÃO É DECORATIVO: `find` e `getGrouped` são POST (filtros no
 *      BODY) e recebem a paginação em `params` (QUERY); `search`, `getAll` e
 *      `getNoPagination` são GET e mandam tudo na QUERY. Trocar verbo ou mover
 *      parâmetro de lugar quebra o controller do back-end.
 *   2. `id` ENTRA NO CAMINHO: `get`, `getDeleted` e a variante por id de
 *      `getAllWithDeleted` montam `.../{id}`. Em `getAllWithDeleted` o MESMO
 *      método aceita duas formas — sem argumento ou com objeto vira paginação na
 *      query; com string/number vira `/{id}`. É o único método polimórfico.
 *
 * `opts` (`CallOptions`, de `@/types/api`) é repassado inteiro para o `http` — é
 *   por ele que chegam `signal` (cancelamento) e headers extras. Repare que os
 *   métodos espalham `...opts` ANTES de `params`: assim a paginação da chamada
 *   vence, e não o contrário.
 * -------------------------------------------------------------------------
 */
export function createResource(
  group: string,
  version: string = DEFAULT_API_VERSION,
  { mutations = true }: ResourceOptions = {},
): ResourceReader | ResourceWriter {
  const base = `/${version}/${group}`;
  const p = (suffix: string): string => `${base}/${suffix}`;

  const reader: ResourceReader = {
    base,
    version,
    group,

    find: (filters = {}, pagination = {}, opts) =>
      http.post(p(E.find), filters, { ...opts, params: pagination }),

    getGrouped: (body = {}, pagination = {}, opts) =>
      http.post(p(E.getGrouped), body, { ...opts, params: pagination }),

    search: (q, pagination = {}, opts) =>
      http.get(p(E.search), { ...opts, params: { q, ...pagination } }),

    get: (id, opts) => http.get(p(`${E.get}/${id}`), opts),

    getAll: (pagination = {}, opts) => http.get(p(E.getAll), { ...opts, params: pagination }),

    getNoPagination: (sort = {}, opts) => http.get(p(E.getNoPagination), { ...opts, params: sort }),

    getDeleted: (id, opts) => http.get(p(`${E.getDeleted}/${id}`), opts),

    getDeletedAll: (pagination = {}, opts) =>
      http.get(p(E.getDeletedAll), { ...opts, params: pagination }),

    getAllWithDeleted: (idOrPagination, opts) =>
      idOrPagination === undefined || typeof idOrPagination === 'object'
        ? http.get(p(E.getAllWithDeleted), { ...opts, params: idOrPagination ?? {} })
        : http.get(p(`${E.getAllWithDeleted}/${idOrPagination}`), opts),
  };

  /**
   * =============================================================================
   * BLOCO 4 — MUTAÇÕES (WRITER)
   * =============================================================================
   *
   * `if (!mutations) return reader;` — o CORTE: com `mutations: false` a função
   *   devolve o objeto só de leitura. É por isso que grupos `-view` não expõem
   *   escrita nem no tipo (BLOCO 2) nem em runtime.
   *
   * O objeto final espalha `...reader` e ACRESCENTA os métodos de escrita — todo
   *   `ResourceWriter` é também um `ResourceReader`, exatamente o que o `extends`
   *   da interface promete.
   *
   * DETALHES DE MANUTENÇÃO:
   *   1. `update` é PUT com o `id` no CAMINHO (`update/{id}`) e o registro inteiro
   *      no body — o back-end substitui o recurso;
   *   2. `deleteRestore` é PATCH (e não PUT/DELETE): é uma transição de estado do
   *      registro, não uma exclusão;
   *   3. `clearDeleted` tem DUAS formas, como `getAllWithDeleted`: sem argumento
   *      limpa tudo (`clear-deleted`); com id, limpa aquele registro
   *      (`clear-deleted/{id}`);
   *   4. `deleteSoft` e `deleteHard` usam o MESMO verbo DELETE e se diferenciam
   *      pelo sufixo — o que muda é o efeito no banco, não a rota.
   * -------------------------------------------------------------------------
   */
  if (!mutations) return reader;

  return {
    ...reader,

    create: (data, opts) => http.post(p(E.create), data, opts),
    update: (id, data, opts) => http.put(p(`${E.update}/${id}`), data, opts),
    deleteSoft: (id, opts) => http.delete(p(`${E.deleteSoft}/${id}`), opts),
    deleteRestore: (id, opts) => http.patch(p(`${E.deleteRestore}/${id}`), undefined, opts),
    deleteHard: (id, opts) => http.delete(p(`${E.deleteHard}/${id}`), opts),
    clearDeleted: (id, opts) =>
      id === undefined
        ? http.delete(p(E.clearDeleted), opts)
        : http.delete(p(`${E.clearDeleted}/${id}`), opts),
  };
}
