// Factory do endpoint-set REST padrao do backend.
// Espelha ResourceTableController / ResourceViewController do CodeIgniter.
//
// Uso:
//   const userManager = createResource('user-manager');           // versao default (env)
//   const userView    = createResource('user-manager-view', 'v1', { mutations: false });
//
// `mutations: false` gera so os metodos de leitura (para os grupos "-view").

import { http } from '@/services/http';
import { DEFAULT_API_VERSION, RESOURCE_ENDPOINTS as E } from '@/constants/api';
import type { CallOptions, PaginationInput, QueryParams } from '@/types/api';

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
