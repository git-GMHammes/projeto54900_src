// PROPOSITO: recurso REST do SGD (api/v1/sgd). O backend (tabela e rotas) ainda NAO existe:
// as telas ja chamam este recurso e mostram o erro da API ate o modulo ser criado.

import { createResource } from '@/services/resourceFactory';
import { API_GROUPS } from '@/constants/api';

export const sgdTable = createResource(API_GROUPS.sgd, 'v1');

export default sgdTable;
