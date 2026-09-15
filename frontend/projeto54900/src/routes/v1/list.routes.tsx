// Subrota do modulo List (v1). Path relativo ao pai "v1".
// Espelha api/v1/list-manager, list-columns, list-actions.
//
// - /v1/list-constructor -> ListConstructorPage: escolhe uma das list_manager
//   semeadas, mostra as definicoes de list_columns/list_actions e renderiza a
//   grid de verdade (dados reais do api_get_endpoint daquele manager).
// - /v1/list-constructor/create -> ListBuilderPage: nova listagem (arvore
//   list_manager -> [list_columns, list_actions], nos moldes do
//   FormBuilderPage).
// - /v1/list-constructor/update/:id -> ListBuilderPage em modo edicao: hidrata
//   a arvore do registro existente (GET list-manager/get/{id} + find por
//   list_manager_id em list-columns/list-actions — sem view, diferente do
//   form). Ver README_list_constructor.md.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const ListConstructorPage = lazy(() => import('@/pages/v1/list/ListConstructorPage'));
const ListBuilderPage = lazy(() => import('@/pages/v1/list/ListBuilderPage'));

export const listRoutes: RouteObject[] = [
  { path: 'list-constructor', element: <ListConstructorPage /> },
  { path: 'list-constructor/create', element: <ListBuilderPage /> },
  { path: 'list-constructor/update/:id', element: <ListBuilderPage /> },
];

export default listRoutes;
