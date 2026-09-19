/**
 * =========================================================================
 * FILE HEADER — routes/v1/menu.routes.tsx
 * =========================================================================
 *
 * O QUE FAZ: rotas do módulo Menu (v1), paths relativos ao pai "/v1". Espelha
 * `api/v1/menu-manager` (sem `-view` próprio) do backend — é a ÁRVORE de itens
 * navegáveis do sistema. Cada item pertence a um nav-manager (FK
 * `nav_manager_id`) e pode ter um `parent_id` (submenu do mesmo nav).
 *
 * MAPA DAS ROTAS (path relativo ao pai "/v1"):
 *   menu-manager            -> GetAllPage  listagem (tabela ou árvore); aceita
 *                                          `?nav_manager_id=` para restringir
 *                                          aos itens de UM nav
 *   menu-manager/create     -> CreatePage  criação; lê `?nav_manager_id=` para
 *                                          pré-preencher o nav de origem
 *   menu-manager/:id        -> GetPage     detalhe do item
 *   menu-manager/update/:id -> UpdatePage  edição do item
 *
 * CONVENÇÃO DA QUERYSTRING (o que liga este módulo ao nav): o parâmetro
 *   `?nav_manager_id=` é o MESMO nome da coluna FK — quem monta o link é o
 *   detalhe do nav (`pages/v1/nav/GetPage`), no botão "Ver itens".
 *
 * DEPENDÊNCIAS: `pages/v1/menu/{GetAllPage,CreatePage,GetPage,UpdatePage}`
 *   (todos com lazy import).
 *
 * CONSUMIDORES: `routes/v1/index.tsx` espalha `...menuRoutes`; a navbar usa
 *   `paths.v1.menu.list`; o módulo nav linka para
 *   `/v1/menu-manager?nav_manager_id=:id` via `paths.v1.menu.listByNav(id)`.
 *
 * REGRAS DE MANUTENÇÃO / ARMADILHAS:
 *   1. `menu-manager/:id` e `menu-manager/update/:id` convivem porque o React
 *      Router pontua o segmento estático ("update") acima do dinâmico (":id") —
 *      NÃO é a ordem do array que resolve. Idem para `create`.
 *   2. `:id` é o `id` de `menu_manager` (o ITEM), não o `nav_manager_id` (o nav).
 *      Confundir os dois é o erro mais provável ao mexer neste módulo.
 *   3. Item com `parent_id` é SUBMENU: a rota não tem nada de especial para
 *      isso — a hierarquia é resolvida na listagem (`GetAllPage`, modo árvore).
 *   4. `path` é relativo ao pai "/v1" (sem barra inicial); `routes/paths.ts` é a
 *      fonte das URLs da aplicação.
 *
 * COMO CRIAR UM MÓDULO CRUD SIMILAR: mesmo padrão de `user.routes.tsx` e
 *   `nav.routes.tsx` — quatro páginas, quatro rotas, path base igual ao nome da
 *   tabela e lazy import em todas.
 * -------------------------------------------------------------------------
 */

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const GetAllPage = lazy(() => import('@/pages/v1/menu/GetAllPage'));
const CreatePage = lazy(() => import('@/pages/v1/menu/CreatePage'));
const GetPage = lazy(() => import('@/pages/v1/menu/GetPage'));
const UpdatePage = lazy(() => import('@/pages/v1/menu/UpdatePage'));

/**
 * =========================================================================
 * BLOCO 1 — DEFINIÇÃO DAS ROTAS
 * =========================================================================
 *
 * Quatro rotas, filhas de "/v1": CRUD completo dos itens de menu. A listagem e
 * o create entendem `?nav_manager_id=` (ver o header); o detalhe e o update
 * trabalham por `:id` do item.
 *
 * PRECEDÊNCIA: `create` e `update/:id` são segmentos estáticos e vencem o
 *   coringa `:id` pelo ranking do React Router — a ordem do array pode ser lida
 *   como documentação, sem efeito no comportamento.
 *
 * O `element` recebe o componente por lazy import.
 * -------------------------------------------------------------------------
 */
export const menuRoutes: RouteObject[] = [
  { path: 'menu-manager', element: <GetAllPage /> },
  { path: 'menu-manager/create', element: <CreatePage /> },
  { path: 'menu-manager/:id', element: <GetPage /> },
  { path: 'menu-manager/update/:id', element: <UpdatePage /> },
];

export default menuRoutes;
