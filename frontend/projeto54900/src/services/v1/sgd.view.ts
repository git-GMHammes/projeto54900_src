// PROPOSITO: recurso REST SOMENTE LEITURA do SGD (api/v1/sgd-view, view view_sgd, prefixo sg_).
// O backend ainda NAO existe. Para escrita, ver sgd.table.ts.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const sgdView = createResource(API_GROUPS.sgdView, 'v1', { mutations: false });

export default sgdView;
