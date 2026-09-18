/**
 * =========================================================================
 * FILE HEADER — routes/v1/upload.routes.tsx
 * =========================================================================
 *
 * O QUE FAZ: rotas do módulo Uploads (v1), paths relativos ao pai "/v1".
 * Espelha `api/v1/upload-manager` (+ `-view`) do backend. É um módulo
 * SOMENTE LEITURA: não tem create nem update no front — os arquivos são
 * enviados por outros fluxos (upload de imagem em outros módulos).
 *
 * MAPA DAS ROTAS (path relativo ao pai "/v1"):
 *   upload-manager     -> UploadListPage  lista os uploads registrados
 *   upload-manager/:id -> UploadViewPage  detalhe/visualização de um upload
 *
 * DEPENDÊNCIAS: `pages/v1/upload/{UploadListPage,UploadViewPage}` (lazy import).
 *
 * CONSUMIDORES: `routes/v1/index.tsx` espalha `...uploadRoutes`; a navbar usa
 *   `paths.v1.upload.list`. O detalhe é aberto por link da própria lista.
 *
 * LACUNA CONHECIDA (documentada em `README_rotas_frontend.md`, NÃO corrigida
 *   aqui): `routes/paths.ts` define `paths.v1.upload.new` apontando para
 *   "/v1/upload-manager/novo", mas nenhuma rota com esse path está registrada
 *   abaixo — navegar até lá hoje cai no `NotFoundPage` (o "*" de
 *   `routes/index.tsx`). Se um dia essa constante for religada a uma página
 *   real, a rota correspondente tem de ser criada AQUI.
 *
 * REGRAS DE MANUTENÇÃO / ARMADILHAS:
 *   1. `path` é RELATIVO ao pai "/v1" (sem barra inicial) — o prefixo vem do
 *      agregador `routes/v1/index.tsx`.
 *   2. `:id` convive com o path base: o React Router casa primeiro o estático
 *      ("upload-manager") e só depois o dinâmico, então a ordem do array não
 *      altera o comportamento.
 *   3. `routes/paths.ts` é a fonte das URLs da aplicação — a lacuna acima é
 *      exatamente o sintoma de paths e rotas saírem de sincronia. Mantenha os
 *      dois no mesmo commit.
 *
 * COMO CRIAR UM MÓDULO SOMENTE-LEITURA SIMILAR:
 *   1. criar as duas páginas (lista e detalhe) em `pages/v1/<modulo>/`;
 *   2. criar `routes/v1/<modulo>.routes.tsx` com o path base (listagem) e
 *      o path base + `/:id` (detalhe), sem create/update;
 *   3. registrar em `routes/v1/index.tsx`, criar as URLs em `routes/paths.ts`
 *      e documentar em `README_rotas_frontend.md`.
 * -------------------------------------------------------------------------
 */

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const UploadListPage = lazy(() => import('@/pages/v1/upload/UploadListPage'));
const UploadViewPage = lazy(() => import('@/pages/v1/upload/UploadViewPage'));

/**
 * =========================================================================
 * BLOCO 1 — DEFINIÇÃO DAS ROTAS
 * =========================================================================
 *
 * Duas rotas, filhas de "/v1": a listagem (path base) e o detalhe
 * (path base + "/:id"). Sem create/update — o módulo é somente leitura.
 *
 * O `element` recebe o componente por lazy import: cada página é baixada só
 * quando visitada.
 * -------------------------------------------------------------------------
 */
export const uploadRoutes: RouteObject[] = [
  { path: 'upload-manager', element: <UploadListPage /> },
  { path: 'upload-manager/:id', element: <UploadViewPage /> },
];

export default uploadRoutes;
