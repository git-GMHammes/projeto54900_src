/**
 * =========================================================================
 * FILE HEADER — services/v1/dbSchema.ts
 * =========================================================================
 *
 * PROPOSITO: utilitario READ-ONLY de introspeccao do banco — alimenta os
 * selects do construtor de formularios/listas com nomes de tabela/coluna
 * reais (em vez de digitados a mao). NAO usa createResource (nao e o
 * endpoint-set padrao de recurso): 3 rotas GET proprias. Espelho de
 * app/Config/Routes/Api/v1/Meta/DbSchema/Endpoint.php, grupo
 * api/v1/db-schema -> Api\V1\Meta\DbSchema\SchemaController.
 *
 *   tables()        -> GET db-schema/tables            (lista todas as tabelas)
 *   columns(table)  -> GET db-schema/columns/{table}   (colunas de 1 tabela)
 *   describe(table) -> GET db-schema/describe/{table}  (tipo/nulabilidade/etc. de cada coluna)
 *
 * DEPENDENCIAS: services/http (http.get) e constants/api (API_GROUPS.dbSchema,
 * DEFAULT_API_VERSION).
 * CONSUMIDORES: pages/v1/form/FormBuilderPage.tsx e
 * pages/v1/list/ListBuilderPage.tsx (montam selects de tabela/coluna ao
 * configurar um formulario/listagem), pages/v1/form/formBuilder.model.ts
 * (regras de montagem do builder). Reexportado pelo barrel
 * services/v1/index.ts.
 *
 * COMO REAPROVEITAR PARA OUTRO ENDPOINT SEM CRUD PADRAO: nao usar
 * createResource; montar o `base` com API_GROUPS/DEFAULT_API_VERSION e
 * expor um objeto com uma funcao por operacao GET (ver tambem
 * auth.service.ts, mesmo padrao para POST/GET simples).
 * -------------------------------------------------------------------------
 */

import { http } from '@/services/http';
import { API_GROUPS, DEFAULT_API_VERSION } from '@/constants/api';
import type { CallOptions } from '@/types/api';

const base = `/${DEFAULT_API_VERSION}/${API_GROUPS.dbSchema}`;

export const dbSchema = {
  /** Lista os nomes de todas as tabelas do banco. */
  tables: (opts?: CallOptions): Promise<unknown> => http.get(`${base}/tables`, opts),

  /** Lista os nomes das colunas de uma tabela. @param table nome exato da tabela */
  columns: (table: string, opts?: CallOptions): Promise<unknown> =>
    http.get(`${base}/columns/${encodeURIComponent(table)}`, opts),

  /** Descreve cada coluna de uma tabela (tipo, nulabilidade, default, etc.). @param table nome exato da tabela */
  describe: (table: string, opts?: CallOptions): Promise<unknown> =>
    http.get(`${base}/describe/${encodeURIComponent(table)}`, opts),
};

export default dbSchema;
