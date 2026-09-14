// Constantes da API. Fonte da verdade dos nomes de grupo/modulo e versoes.
// Espelha app/Config/Routes.php do backend CodeIgniter.

import { env } from '@/config/env';
import type { PageParams } from '@/types/api';

// Versoes de API suportadas pelo frontend. Cada uma tem sua pasta em routes/ e services/.
export const API_VERSIONS = ['v1', 'v1a'] as const;
export type ApiVersion = (typeof API_VERSIONS)[number];

export const DEFAULT_API_VERSION: string = env.apiVersion;

// Grupos de rota da API (prefixos de path). O sufixo "-view" consulta a view read-only.
export const API_GROUPS = {
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
  navManager: 'nav-manager',
  menuManager: 'menu-manager',
  dbSchema: 'db-schema',
} as const;
export type ApiGroup = (typeof API_GROUPS)[keyof typeof API_GROUPS];

// Nome do endpoint-set REST padrao exposto pelos ResourceTableController / ResourceViewController.
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

// Defaults de paginacao aceitos pela API (?page=&limit=&sort=&order=).
export const PAGINATION_DEFAULTS: Readonly<PageParams> = Object.freeze({
  page: 1,
  limit: 20,
  sort: 'id',
  order: 'ASC',
});
