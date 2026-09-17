/**
 * =========================================================================
 * FILE HEADER — routes/v1/nav.routes.tsx
 * =========================================================================
 *
 * O QUE FAZ: rotas do módulo Nav (v1), paths relativos ao pai "/v1". Espelha
 * `api/v1/nav-manager` (sem `-view`: não tem view própria) do backend.
 * O nav guarda o nome do app, a imagem, o ícone de mensagens e a versão do
 * sistema — é a "CASCA" em volta do menu, não o menu em si (a árvore de itens
 * está em `menu.routes.tsx`, ligada a um nav por FK).
 *
 * MAPA DAS ROTAS (path relativo ao pai "/v1"):
 *   nav-manager            -> GetAllPage  lista os nav_manager
 *   nav-manager/create     -> CreatePage  cria um nav
 *   nav-manager/:id        -> GetPage     detalhe do nav; o botão "Ver itens"
 *                                         leva ao MENU daquele nav
 *                                         (/v1/menu-manager?nav_manager_id=:id)
 *   nav-manager/update/:id -> UpdatePage  edita o nav
 *
 * RELAÇÃO COM O MÓDULO MENU (o que mais gera dúvida): nav é o registro PAI;
 *   cada item de menu aponta para ele por `nav_manager_id`. Por isso a lista de
 *   menu aceita `?nav_manager_id=` para filtrar, e o detalhe do nav é o ponto de
 *   entrada natural para os itens daquele nav.
 *
 * DEPENDÊNCIAS: `pages/v1/nav/{GetAllPage,CreatePage,GetPage,UpdatePage}`
 *   (todos com lazy import).
 *
 * CONSUMIDORES: `routes/v1/index.tsx` espalha `...navRoutes`; a navbar usa
 *   `paths.v1.nav.list`; o próprio módulo usa `paths.v1.menu.listByNav(id)`
 *   ("Ver itens") e as rotas de view/update do nav.
 *
 * REGRAS DE MANUTENÇÃO / ARMADILHAS:
 *   1. CRUD padrão do projeto, um path base por ação, com `path` RELATIVO ao pai
 *      "/v1" (sem barra inicial).
 *   2. `create` e `update/:id` são estáticos e vencem o coringa `:id` pelo
 *      ranking do React Router: a ordem no array não altera o comportamento.
 *   3. `:id` é o `id` de `nav_manager` — é o MESMO valor que aparece na
 *      querystring de menu e na coluna `nav_manager_id`. Ao renomear o segmento
 *      aqui, revise `GetPage`/`UpdatePage` do nav e os links de menu.
 *   4. `routes/paths.ts` é a fonte das URLs da aplicação; rota nova ou removida
 *      aqui exige ajuste lá e nos consumidores no MESMO commit.
 *
 * COMO CRIAR UM MÓDULO CRUD SIMILAR: mesmo padrão de `user.routes.tsx` e
 *   `menu.routes.tsx` — quatro páginas, quatro rotas, path base igual ao nome da
 *   tabela e lazy import em todas.
 * -------------------------------------------------------------------------
 */

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const GetAllPage = lazy(() => import('@/pages/v1/nav/GetAllPage'));
const CreatePage = lazy(() => import('@/pages/v1/nav/CreatePage'));
const GetPage = lazy(() => import('@/pages/v1/nav/GetPage'));
const UpdatePage = lazy(() => import('@/pages/v1/nav/UpdatePage'));

/**
 * =========================================================================
 * BLOCO 1 — DEFINIÇÃO DAS ROTAS
 * =========================================================================
 *
 * Quatro rotas, filhas de "/v1": o CRUD do nav — lista, create, detalhe
 * (`:id`) e update. O detalhe é o ponto de partida para o MENU do nav
 * ("Ver itens" -> `/v1/menu-manager?nav_manager_id=:id`).
 *
 * `:id` convive com `create`/`update` porque o React Router prioriza o segmento
 *   estático: a lista é filha do mesmo path base, sem precisar reordenar nada.
 *
 * O `element` recebe o componente por lazy import.
 * -------------------------------------------------------------------------
 */
export const navRoutes: RouteObject[] = [
  { path: 'nav-manager', element: <GetAllPage /> },
  { path: 'nav-manager/create', element: <CreatePage /> },
  { path: 'nav-manager/:id', element: <GetPage /> },
  { path: 'nav-manager/update/:id', element: <UpdatePage /> },
];

export default navRoutes;
