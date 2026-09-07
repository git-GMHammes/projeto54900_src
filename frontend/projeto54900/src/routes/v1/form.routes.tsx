// Subrotas do modulo Form (v1). Paths relativos ao pai "v1".
// Espelha api/v1/form-manager (+ -view), form-groups, form-rows, form-campos.
//
// - /v1/form-constructor        -> FormBuilderPage: pagina em branco que estamos
//                                  montando juntos (o novo construtor).
// - /v1/form-constructor-claude -> FormConstructorPage: construtor atual, que
//                                  consome a view_form_manager e grava nas 4
//                                  tabelas. NAO mexer.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const FormBuilderPage = lazy(() => import('@/pages/v1/form/FormBuilderPage'));
const FormConstructorPage = lazy(() => import('@/pages/v1/form/FormConstructorPage'));

export const formRoutes: RouteObject[] = [
  { path: 'form-constructor', element: <FormBuilderPage /> },
  { path: 'form-constructor-claude', element: <FormConstructorPage /> },
];

export default formRoutes;
