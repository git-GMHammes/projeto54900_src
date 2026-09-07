// Espelho de: app/Config/Routes/Api/v1/Meta/DbSchema/Endpoint.php
// Grupo: api/v1/db-schema  ->  Api\V1\Meta\DbSchema\SchemaController
//
// Utilitario read-only de introspeccao do banco. NAO usa createResource (nao e
// o endpoint-set padrao): 3 rotas GET proprias.
//
//   tables()          -> GET db-schema/tables
//   columns(table)    -> GET db-schema/columns/{table}
//   describe(table)   -> GET db-schema/describe/{table}
//
// Alimenta os selects do construtor de formularios com nomes de coluna reais.

import { http } from '@/services/http';
import { API_GROUPS, DEFAULT_API_VERSION } from '@/constants/api';
import type { CallOptions } from '@/types/api';

const base = `/${DEFAULT_API_VERSION}/${API_GROUPS.dbSchema}`;

export const dbSchema = {
  tables: (opts?: CallOptions): Promise<unknown> => http.get(`${base}/tables`, opts),

  columns: (table: string, opts?: CallOptions): Promise<unknown> =>
    http.get(`${base}/columns/${encodeURIComponent(table)}`, opts),

  describe: (table: string, opts?: CallOptions): Promise<unknown> =>
    http.get(`${base}/describe/${encodeURIComponent(table)}`, opts),
};

export default dbSchema;
