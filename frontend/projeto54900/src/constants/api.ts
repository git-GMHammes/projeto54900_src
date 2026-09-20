/**
 * =========================================================================
 * FILE HEADER — constants/api.ts
 * =========================================================================
 *
 * PROPOSITO: constantes da API — fonte da verdade dos nomes de grupo/modulo,
 * versoes suportadas, nomes do endpoint-set REST padrao e defaults de
 * paginacao. Espelha app/Config/Routes.php do backend CodeIgniter; qualquer
 * grupo/rota novo no backend precisa de uma entrada correspondente aqui
 * antes de um service em services/v1/*.ts poder usa-lo.
 *
 * DEPENDENCIAS: config/env (env.apiVersion) e types/api (PageParams).
 * CONSUMIDORES: todos os services/v1/*.ts (API_GROUPS, DEFAULT_API_VERSION),
 * services/resourceFactory.ts (RESOURCE_ENDPOINTS, monta os metodos REST),
 * utils/querystring.ts e hooks/usePagination.ts (PAGINATION_DEFAULTS).
 *
 * COMO REAPROVEITAR AO ADICIONAR UM GRUPO NOVO NO BACKEND: acrescentar a
 * chave em API_GROUPS com o mesmo prefixo de path do backend, depois criar
 * o service correspondente em services/v1/<recurso>.table.ts (ou .view.ts)
 * chamando createResource(API_GROUPS.<recurso>, 'v1').
 * -------------------------------------------------------------------------
 */

import { env } from '@/config/env';
import type { PageParams } from '@/types/api';

/** Versoes de API suportadas pelo frontend. Cada uma tem sua pasta em routes/ e services/. */
export const API_VERSIONS = ['v1', 'v1a'] as const;
export type ApiVersion = (typeof API_VERSIONS)[number];

/** Versao usada por padrao pelos services quando nenhuma e informada explicitamente. */
export const DEFAULT_API_VERSION: string = env.apiVersion;

/** Grupos de rota da API (prefixos de path). O sufixo "-view" consulta a view read-only. */
export const API_GROUPS = {
  auth: 'auth',
  userManager: 'user-manager',
  userManagerView: 'user-manager-view',
  userRoles: 'user-roles',
  uploadManager: 'upload-manager',
  uploadManagerView: 'upload-manager-view',
  formManager: 'form-manager',
  formManagerView: 'form-manager-view',
  formGroups: 'form-groups',
  formRows: 'form-rows',
  formCampos: 'form-campos',
  listManager: 'list-manager',
  listColumns: 'list-columns',
  listActions: 'list-actions',
  navManager: 'nav-manager',
  menuManager: 'menu-manager',
  calendarManagerView: 'calendar-manager-view',
  dbSchema: 'db-schema',
} as const;
export type ApiGroup = (typeof API_GROUPS)[keyof typeof API_GROUPS];

/** Nomes do endpoint-set REST padrao exposto pelos ResourceTableController / ResourceViewController. */
export const RESOURCE_ENDPOINTS = {
  find: 'find',
  getGrouped: 'get-grouped',
  search: 'search',
  get: 'get',
  getAll: 'get-all',
  getNoPagination: 'get-no-pagination',
  getDeleted: 'get-deleted',
  getWithDeleted: 'get-with-deleted',
  getDeletedAll: 'get-deleted-all',
  getAllWithDeleted: 'get-all-with-deleted',
  create: 'create',
  update: 'update',
  deleteSoft: 'delete-soft',
  deleteRestore: 'delete-restore',
  deleteHard: 'delete-hard',
  clearDeleted: 'clear-deleted',
} as const;

/** Defaults de paginacao aceitos pela API (?page=&limit=&sort=&order=). */
export const PAGINATION_DEFAULTS: Readonly<PageParams> = Object.freeze({
  page: 1,
  limit: 20,
  sort: 'id',
  order: 'ASC',
});
