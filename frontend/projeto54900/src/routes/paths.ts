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
      // pagina em branco (ponto de partida do novo construtor)
      blank: '/v1/form-constructor',
      // Construtor de Formularios atual (view_form_manager -> FormGrid -> API)
      constructor: '/v1/form-constructor-claude',
    },
  },

  // Reservado para o namespace Api\V1A do backend.
  v1a: {
    root: '/v1a',
  },

  notFound: '*',
} as const;

export default paths;
