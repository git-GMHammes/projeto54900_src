// Subrotas do modulo Form (v1). Paths relativos ao pai "v1".
// Espelha api/v1/form-manager (+ -view), form-groups, form-rows, form-campos.
//
// Padrao REST espelhando api/v1/form-manager:
// - /v1/form-constructor            -> FormConstructorListPage: lista os form_manager.
// - /v1/form-constructor/create     -> FormBuilderPage: novo formulario (arvore
//                                      form_manager -> form_groups -> form_rows -> form_fields).
// - /v1/form-constructor/update/:id -> FormBuilderPage em modo edicao: mesma tela,
//                                      hidratada com o registro existente.
// - /v1/form-constructor/:table/:id -> FormConstructorBuildPage: renderiza UM
//                                      formulario real (por table_name + ID, nao
//                                      slug) DIRETO na pagina (sem modal) — destino
//                                      do botao "Build" da lista acima. id e a
//                                      chave real da busca (nunca digitado); table
//                                      na URL e validado contra o table_name do
//                                      registro encontrado (mismatch = erro).
// - /v1/form-constructor-claude     -> FormConstructorPage: construtor legado que
//                                      consome a view_form_manager. NAO mexer.
// - /v1/form/:slug                  -> FormRendererPage: mesma renderizacao, mas
//                                      dentro de um modal (botao "Preencher formulario").
//
// ATENCAO A ORDEM: 'create' e 'update/:id' sao segmentos estaticos e o
// react-router os prioriza sobre o dinamico ':slug' automaticamente — mas
// mantenha 'create'/'update/:id' declarados ANTES de ':slug' aqui por clareza.

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const FormConstructorListPage = lazy(() => import('@/pages/v1/form/FormConstructorListPage'));
const FormBuilderPage = lazy(() => import('@/pages/v1/form/FormBuilderPage'));
const FormConstructorBuildPage = lazy(() => import('@/pages/v1/form/FormConstructorBuildPage'));
const FormConstructorPage = lazy(() => import('@/pages/v1/form/FormConstructorPage'));
const FormRendererPage = lazy(() => import('@/pages/v1/form/FormRendererPage'));

export const formRoutes: RouteObject[] = [
  { path: 'form-constructor', element: <FormConstructorListPage /> },
  { path: 'form-constructor/create', element: <FormBuilderPage /> },
  { path: 'form-constructor/update/:id', element: <FormBuilderPage /> },
  { path: 'form-constructor/:table/:id', element: <FormConstructorBuildPage /> },
  { path: 'form-constructor-claude', element: <FormConstructorPage /> },
  { path: 'form/:slug', element: <FormRendererPage /> },
];

export default formRoutes;
