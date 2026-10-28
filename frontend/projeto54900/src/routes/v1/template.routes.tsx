/**
 * =========================================================================
 * FILE HEADER — routes/v1/template.routes.tsx
 * =========================================================================
 *
 * O QUE FAZ: rotas do módulo Template (v1), paths relativos ao pai "/v1".
 * Reúne as duas tabelas `temp_` (template) e espelha o backend:
 *   - `api/v1/temp-nav`  (`Template\TempNav`)  — a "CASCA" do app: nome, imagem,
 *     ícone de mensagens e versão do sistema.
 *   - `api/v1/temp-menu` (`Template\TempMenu`) — a árvore de itens de menu; cada
 *     item aponta para um temp_nav por FK (`temp_nav_id`).
 * Nenhuma das duas tem `-view` próprio.
 *
 * MAPA DAS ROTAS (path relativo ao pai "/v1"):
 *   temp-nav                 -> pages/v1/template/temp-nav/GetAllPage    lista os temp_nav
 *   temp-nav/create          -> CreatePage                               cria um nav
 *   temp-nav/:id             -> GetPage     detalhe do nav; o botão "Ver itens"
 *                                           leva a /v1/temp-menu?temp_nav_id=:id
 *   temp-nav/update/:id      -> UpdatePage                               edita o nav
 *   temp-menu                -> pages/v1/template/temp-menu/GetAllPage   lista/árvore de itens;
 *                                           aceita `?temp_nav_id=` para filtrar por nav
 *   temp-menu/create         -> CreatePage  cria item; lê `?temp_nav_id=` para pré-selecionar o nav
 *   temp-menu/:id            -> GetPage                                  detalhe do item
 *   temp-menu/update/:id     -> UpdatePage                               edita o item
 *
 *   temp-header, temp-footer (cada um: lista, /create e /update/:id) -> pages/v1/template/temp-header|temp-footer,
 *     lista e formularios gerados pelos builds do banco (ListBuild e RecordFormBuild), so admin.
 *
 *   temp-manager (lista, /create e /update/:id) -> pages/v1/template/temp-manager: catalogo de templates
 *     (template001/002/003) e as empresas de cada um; so superuser.
 *
 * MENU LATERAL: no contexto dos templates, a marcação `placement = 'offcanvas'`
 *   do item de menu é tratada como o menu lateral (ver README_menu.md).
 *
 * DEPENDÊNCIAS: `pages/v1/template/temp-nav/*` e `pages/v1/template/temp-menu/*`
 *   ({GetAllPage,CreatePage,GetPage,UpdatePage}, todos com lazy import).
 *
 * CONSUMIDORES: `routes/v1/index.tsx` espalha `...templateRoutes`; a navbar usa
 *   `paths.v1.nav.list`; o módulo usa `paths.v1.menu.listByNav(id)` ("Ver itens").
 *
 * REGRAS DE MANUTENÇÃO / ARMADILHAS:
 *   1. CRUD padrão do projeto, um path base por ação, com `path` RELATIVO ao pai
 *      "/v1" (sem barra inicial).
 *   2. `create` e `update/:id` são estáticos e vencem o coringa `:id` pelo
 *      ranking do React Router: a ordem no array não altera o comportamento.
 *   3. `:id` de temp-nav é o MESMO valor da querystring `temp_nav_id` de menu;
 *      `:id` de temp-menu é o id do ITEM, não do nav.
 *   4. `routes/paths.ts` é a fonte das URLs da aplicação; rota nova ou removida
 *      aqui exige ajuste lá e nos consumidores no MESMO commit.
 * -------------------------------------------------------------------------
 */

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import RequireRole from '@/routes/RequireRole';

const NavGetAllPage = lazy(() => import('@/pages/v1/template/temp-nav/GetAllPage'));
const NavCreatePage = lazy(() => import('@/pages/v1/template/temp-nav/CreatePage'));
const NavGetPage = lazy(() => import('@/pages/v1/template/temp-nav/GetPage'));
const NavUpdatePage = lazy(() => import('@/pages/v1/template/temp-nav/UpdatePage'));

const MenuGetAllPage = lazy(() => import('@/pages/v1/template/temp-menu/GetAllPage'));
const MenuCreatePage = lazy(() => import('@/pages/v1/template/temp-menu/CreatePage'));
const MenuGetPage = lazy(() => import('@/pages/v1/template/temp-menu/GetPage'));
const MenuUpdatePage = lazy(() => import('@/pages/v1/template/temp-menu/UpdatePage'));

const HeaderGetAllPage = lazy(() => import('@/pages/v1/template/temp-header/GetAllPage'));
const HeaderCreatePage = lazy(() => import('@/pages/v1/template/temp-header/CreatePage'));
const HeaderUpdatePage = lazy(() => import('@/pages/v1/template/temp-header/UpdatePage'));

const FooterGetAllPage = lazy(() => import('@/pages/v1/template/temp-footer/GetAllPage'));
const FooterCreatePage = lazy(() => import('@/pages/v1/template/temp-footer/CreatePage'));
const FooterUpdatePage = lazy(() => import('@/pages/v1/template/temp-footer/UpdatePage'));

const ManagerGetAllPage = lazy(() => import('@/pages/v1/template/temp-manager/GetAllPage'));
const ManagerCreatePage = lazy(() => import('@/pages/v1/template/temp-manager/CreatePage'));
const ManagerUpdatePage = lazy(() => import('@/pages/v1/template/temp-manager/UpdatePage'));

// SOMENTE ADMIN (temp_menu.roles=["admin"] para /v1/temp-nav e /v1/temp-menu) —
// telas de edição do template (casca do app e árvore de itens). A LEITURA que
// hooks/useSiteMenu.ts faz direto do service (fora do router) para montar a
// navbar de qualquer autenticado não passa por aqui.
export const templateRoutes: RouteObject[] = [
  {
    element: <RequireRole role="admin" />,
    children: [
      { path: 'temp-nav', element: <NavGetAllPage /> },
      { path: 'temp-nav/create', element: <NavCreatePage /> },
      { path: 'temp-nav/:id', element: <NavGetPage /> },
      { path: 'temp-nav/update/:id', element: <NavUpdatePage /> },
      { path: 'temp-menu', element: <MenuGetAllPage /> },
      { path: 'temp-menu/create', element: <MenuCreatePage /> },
      { path: 'temp-menu/:id', element: <MenuGetPage /> },
      { path: 'temp-menu/update/:id', element: <MenuUpdatePage /> },
      { path: 'temp-header', element: <HeaderGetAllPage /> },
      { path: 'temp-header/create', element: <HeaderCreatePage /> },
      { path: 'temp-header/update/:id', element: <HeaderUpdatePage /> },
      { path: 'temp-footer', element: <FooterGetAllPage /> },
      { path: 'temp-footer/create', element: <FooterCreatePage /> },
      { path: 'temp-footer/update/:id', element: <FooterUpdatePage /> },
    ],
  },
  // Catalogo de templates: SOMENTE SUPERUSER (o backend tambem restringe: filtro superuseronly).
  {
    element: <RequireRole role="superuser" />,
    children: [
      { path: 'temp-manager', element: <ManagerGetAllPage /> },
      { path: 'temp-manager/create', element: <ManagerCreatePage /> },
      { path: 'temp-manager/update/:id', element: <ManagerUpdatePage /> },
    ],
  },
];

export default templateRoutes;
