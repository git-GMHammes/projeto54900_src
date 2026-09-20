// Constantes nomeadas de rota do frontend. Use SEMPRE daqui, nunca string solta.
// Espelha a versao/prefixo da API: /v1/<grupo>, /v1a/<grupo>, ...
// (o basename do router — /frontend/projeto54900 — e aplicado automaticamente).

type RouteId = string | number;

export const paths = {
  home: '/',

  v1: {
    auth: {
      login: '/v1/login',
    },
    user: {
      list: '/v1/user-manager',
      create: '/v1/user-manager/create',
      view: (id: RouteId) => `/v1/user-manager/${id}`,
      update: (id: RouteId) => `/v1/user-manager/update/${id}`,
      // Etapa 2 do cadastro (user_profiles), encadeada pelo user_manager_id
      // retornado na etapa 1 (user.create)
      profilesCreate: '/v1/user-profiles/create',
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
      // Renderiza UM formulario real a partir da definicao gravada (por slug),
      // dentro de um modal (botao "Preencher formulario" revela os campos)
      render: (slug: string) => `/v1/form/${slug}`,
      // Mesma renderizacao, mas campos direto na pagina (sem modal), por
      // table_name + ID (nao slug) — destino do botao "Build" da lista em
      // /v1/form-constructor. id e a chave real; table_name e validado contra
      // o registro encontrado.
      build: (table: string, id: RouteId) => `/v1/form-constructor/${table}/${id}`,
    },
    list: {
      // Preview do construtor de listas (list_manager -> list_columns / list_actions)
      list: '/v1/list-constructor',
      // ListBuilderPage: nova listagem / edicao de uma existente
      create: '/v1/list-constructor/create',
      edit: (id: RouteId) => `/v1/list-constructor/update/${id}`,
    },
    // Nav — config/branding do app/navbar (nome, imagem, icone, versao)
    nav: {
      list: '/v1/nav-manager',
      create: '/v1/nav-manager/create',
      view: (id: RouteId) => `/v1/nav-manager/${id}`,
      update: (id: RouteId) => `/v1/nav-manager/update/${id}`,
    },
    // Calendar — listagem de calendarios (view_calendar_manager: calendario -> eventos)
    calendar: {
      list: '/v1/calendar-manager',
    },
    // Menu — arvore de itens navegaveis (era menu-items), ligada a um nav-manager
    menu: {
      list: '/v1/menu-manager',
      // Itens de UM nav especifico (usado pelo botao "Itens" do nav-manager)
      listByNav: (navId: RouteId) => `/v1/menu-manager?nav_manager_id=${navId}`,
      create: '/v1/menu-manager/create',
      createForNav: (navId: RouteId) => `/v1/menu-manager/create?nav_manager_id=${navId}`,
      view: (id: RouteId) => `/v1/menu-manager/${id}`,
      update: (id: RouteId) => `/v1/menu-manager/update/${id}`,
    },
  },

  // Reservado para o namespace Api\V1A do backend.
  v1a: {
    root: '/v1a',
  },

  notFound: '*',
} as const;

export default paths;
