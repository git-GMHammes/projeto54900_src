/**
 * =========================================================================
 * FILE HEADER — routes/v1/list.routes.tsx
 * =========================================================================
 *
 * O QUE FAZ: rotas do módulo List (v1), paths relativos ao pai "/v1". Espelha
 * `api/v1/list-manager`, `list-columns` e `list-actions` do backend — o motor
 * "Construtor de Listas", nos mesmos moldes do módulo form (árvore em níveis:
 * manager -> colunas/ações).
 *
 * MAPA DAS ROTAS (path relativo ao pai "/v1"):
 *   list-constructor            -> ListConstructorPage  PREVIEW do motor: escolhe
 *                                                       uma das listagens semeadas,
 *                                                       mostra as definições de
 *                                                       colunas/ações e renderiza a
 *                                                       grid de verdade (dados reais
 *                                                       do `api_get_endpoint`)
 *   list-constructor/create     -> ListBuilderPage      construtor de uma listagem
 *                                                       NOVA (árvore manager ->
 *                                                       [colunas, ações], nos moldes
 *                                                       do FormBuilderPage)
 *   list-constructor/update/:id -> ListBuilderPage      MESMA tela em modo edição,
 *                                                       hidratada do registro
 *                                                       (GET list-manager/get/{id} +
 *                                                       find por list_manager_id em
 *                                                       list-columns/list-actions)
 *
 * DIFERENÇA EM RELAÇÃO AO MÓDULO FORM (útil na manutenção): aqui NÃO existe view
 *   agrupada equivalente à `view_form_manager` — a hidratação da edição faz as
 *   buscas de colunas/ações por `list_manager_id`. Ver
 *   `README_list_constructor.md`.
 *
 * DEPENDÊNCIAS: `pages/v1/list/{ListConstructorPage,ListBuilderPage}` (lazy
 *   import).
 *
 * CONSUMIDORES: `routes/v1/index.tsx` espalha `...listRoutes`. NÃO há link
 *   dedicado na navbar hoje — o acesso é por URL direta (ver
 *   `README_rotas_frontend.md`).
 *
 * REGRAS DE MANUTENÇÃO / ARMADILHAS:
 *   1. As listagens em si (slug, `table_name`, endpoints, colunas, ações) vivem
 *      no banco: uma rota nova aqui não cria listagem, cria ACESSO.
 *   2. `create` e `update/:id` compartilham o `ListBuilderPage` — mudança de
 *      comportamento vale para as duas rotas; para separar, separe componentes.
 *   3. `:id` é o `id` de `list_manager`; já as colunas/ações são buscadas por
 *      `list_manager_id`. Não confundir os dois identificadores ao depurar.
 *   4. `path` é relativo ao pai "/v1", sem barra inicial; `routes/paths.ts` é a
 *      fonte das URLs da aplicação.
 *
 * COMO CRIAR UM CONSTRUTOR SIMILAR (árvore em níveis): o mesmo padrão está em
 *   `form.routes.tsx` (form_manager -> form_groups -> form_rows -> form_fields).
 * -------------------------------------------------------------------------
 */

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import RequireRole from '@/routes/RequireRole';

const ListConstructorPage = lazy(() => import('@/pages/v1/list/ListConstructorPage'));
const ListBuilderPage = lazy(() => import('@/pages/v1/list/ListBuilderPage'));

/**
 * =========================================================================
 * BLOCO 1 — DEFINIÇÃO DAS ROTAS
 * =========================================================================
 *
 * Três rotas, filhas de "/v1": o preview (`list-constructor`) e o construtor de
 * listagens em create e update — o update reusa o MESMO componente, mudando só
 * a hidratação.
 *
 * O `element` recebe o componente por lazy import: o código de cada página é
 * baixado só quando visitada.
 * -------------------------------------------------------------------------
 */
// SOMENTE ADMIN (menu_manager.roles=["admin"] para /v1/list-constructor) —
// nao confundir com a LEITURA de list-manager/list-columns/list-actions que
// toda tela de listagem do app faz (inclusive as de usuario comum) pra saber
// suas proprias colunas/acoes: essa leitura nao passa por esta rota.
export const listRoutes: RouteObject[] = [
  {
    element: <RequireRole role="admin" />,
    children: [
      { path: 'list-constructor', element: <ListConstructorPage /> },
      { path: 'list-constructor/create', element: <ListBuilderPage /> },
      { path: 'list-constructor/update/:id', element: <ListBuilderPage /> },
    ],
  },
];

export default listRoutes;
