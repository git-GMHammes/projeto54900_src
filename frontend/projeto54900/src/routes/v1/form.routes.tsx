// Subrotas do modulo Form (v1). Paths relativos ao pai "v1".
// Espelha api/v1/form-manager (+ -view), form-groups, form-rows, form-campos.
//
// Padrao REST espelhando api/v1/form-manager:
// - /v1/form-constructor            -> FormConstructorListPage: lista os form_manager.
// - /v1/form-constructor/create     -> FormBuilderPage: novo formulario (arvore
//                                      form_manager -> form_groups -> form_rows -> form_fields).
// - /v1/form-constructor/update/:id -> FormBuilderPage em modo edicao: mesma tela,
//                                      hidratada com o registro existente.
// - /v1/form-constructor-claude     -> FormConstructorPage: construtor legado que
//                                      consome a view_form_manager. NAO mexer.
// - /v1/form/:slug                  -> FormRendererPage: renderiza UM formulario real
//                                      a partir da definicao gravada e submete para o
//                                      submit_endpoint do registro.
// - /v1/calendar-manager            -> redirect para /v1/form/calendario (apelido de
//                                      menu para o formulario publicado da slug 'calendario').

import { lazy } from 'react';
import { redirect } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

const FormConstructorListPage = lazy(() => import('@/pages/v1/form/FormConstructorListPage'));
const FormBuilderPage = lazy(() => import('@/pages/v1/form/FormBuilderPage'));
const FormConstructorPage = lazy(() => import('@/pages/v1/form/FormConstructorPage'));
const FormRendererPage = lazy(() => import('@/pages/v1/form/FormRendererPage'));

export const formRoutes: RouteObject[] = [
  { path: 'form-constructor', element: <FormConstructorListPage /> },
  { path: 'form-constructor/create', element: <FormBuilderPage /> },
  { path: 'form-constructor/update/:id', element: <FormBuilderPage /> },
  { path: 'form-constructor-claude', element: <FormConstructorPage /> },
  { path: 'form/:slug', element: <FormRendererPage /> },
  { path: 'calendar-manager', loader: () => redirect('/v1/form/calendario') },
];

export default formRoutes;
