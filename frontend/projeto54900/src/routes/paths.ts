// Constantes nomeadas de rota do frontend. Use SEMPRE daqui, nunca string solta.
// Espelha a versao/prefixo da API: /v1/<grupo>, /v1a/<grupo>, ...
// (o basename do router — /frontend/projeto54900 — e aplicado automaticamente).

type RouteId = string | number;

export const paths = {
  home: '/',

  v1: {
    user: {
      list: '/v1/user-manager',
      new: '/v1/user-manager/novo',
      view: (id: RouteId) => `/v1/user-manager/${id}`,
      edit: (id: RouteId) => `/v1/user-manager/${id}/editar`,
    },
    upload: {
      list: '/v1/upload-manager',
      new: '/v1/upload-manager/novo',
      view: (id: RouteId) => `/v1/upload-manager/${id}`,
    },
    form: {
      // Modulo form-constructor no padrao REST do backend:
      list: '/v1/form-constructor',
      create: '/v1/form-constructor/create',
      edit: (id: RouteId) => `/v1/form-constructor/update/${id}`,
      // Construtor legado (view_form_manager -> FormGrid -> API), nao mexer
      constructor: '/v1/form-constructor-claude',
      // Renderiza UM formulario real a partir da definicao gravada (por slug)
      render: (slug: string) => `/v1/form/${slug}`,
    },
  },

  // Reservado para o namespace Api\V1A do backend.
  v1a: {
    root: '/v1a',
  },

  notFound: '*',
} as const;

export default paths;
