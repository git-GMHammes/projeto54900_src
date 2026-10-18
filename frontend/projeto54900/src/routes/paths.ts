// Constantes nomeadas de rota do frontend. Use SEMPRE daqui, nunca string solta.
// Espelha a versao/prefixo da API: /v1/<grupo>, /v1a/<grupo>, ...
// (o basename do router — /frontend/projeto54900 — e aplicado automaticamente).

type RouteId = string | number;

export const paths = {
  home: '/',
  // Pagina dedicada de Acesso Negado (RequireRole redireciona pra ca) — sem
  // nenhum controle funcional, so aviso + link pra Home.
  forbidden: '/acesso-negado',

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
      // Lista de dados (user_profiles) — menu "Dados Usuário"
      profilesList: '/v1/user-profiles',
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
      // Lista simples de todos os calendarios (sem eventos agrupados).
      simpleList: '/v1/calendar-list',
      // Destino do link de e-mail do convite de evento (?token=...). Publica.
      acceptInvite: '/v1/convite/aceitar',
    },
    // knowledge — base de conhecimento (markdowns), so admin (rota estatica, sem API)
    knowledge: {
      view: '/v1/knowledge-base',
    },
    // svgMap — mapa SVG dos municipios do RJ (rota estatica, sem API)
    svgMap: {
      view: '/v1/svg-map',
    },
    // Map — explorador do mapa e mapa de UM registro de qualquer modulo (map_links).
    map: {
      explorer: '/v1/map',
      // `module` = slug registrado em Config/MapLinkables.php (ex.: 'calendar-events').
      links: (module: string, id: RouteId) => `/v1/map/links/${module}/${id}`,
    },
    // MapAdmin — administrativo completo dos 10 recursos do Map (lista + cadastro + edicao).
    // Trajetos: o cadastro e o planejador do Explorador (paths.v1.map.explorer).
    // Cache de geocodificacao: so lista/exclusao (escrito pelo proxy map-geo).
    mapAdmin: {
      manager: {
        list: '/v1/map-manager',
        create: '/v1/map-manager/create',
        update: (id: RouteId) => `/v1/map-manager/update/${id}`,
      },
      icons: {
        list: '/v1/map-icons',
        create: '/v1/map-icons/create',
        update: (id: RouteId) => `/v1/map-icons/update/${id}`,
      },
      categories: {
        list: '/v1/map-categories',
        create: '/v1/map-categories/create',
        update: (id: RouteId) => `/v1/map-categories/update/${id}`,
      },
      postalCodes: {
        list: '/v1/map-postal-codes',
        create: '/v1/map-postal-codes/create',
        update: (id: RouteId) => `/v1/map-postal-codes/update/${id}`,
      },
      addresses: {
        list: '/v1/map-addresses',
        create: '/v1/map-addresses/create',
        update: (id: RouteId) => `/v1/map-addresses/update/${id}`,
      },
      points: {
        list: '/v1/map-points',
        create: '/v1/map-points/create',
        update: (id: RouteId) => `/v1/map-points/update/${id}`,
      },
      routes: {
        list: '/v1/map-routes',
        update: (id: RouteId) => `/v1/map-routes/update/${id}`,
      },
      routeStops: {
        list: '/v1/map-route-stops',
        create: '/v1/map-route-stops/create',
        update: (id: RouteId) => `/v1/map-route-stops/update/${id}`,
      },
      links: {
        list: '/v1/map-links',
        create: '/v1/map-links/create',
        update: (id: RouteId) => `/v1/map-links/update/${id}`,
      },
      geocodeCache: {
        list: '/v1/map-geocode-cache',
      },
    },
    // Timeline — o modulo tem duas telas de feed e as LISTAS PADRAO dos seus
    // recursos. Todas as listas usam o motor do Construtor de Listas
    // (list_manager/list_columns): o slug homonimo da rota define titulo,
    // endpoint, colunas e ordenacao (ver pages/v1/timeline/StandardListPage.tsx).
    // Antes de 2026-09-28 os 5 recursos eram telas de formulario no renderizador
    // generico (`paths.v1.form.render('timeline-post' | 'timeline-settings' | ...)`);
    // aquele renderizador continua existindo, apenas nao e mais o destino dos
    // itens de menu do modulo.
    timeline: {
      // Home Feed (feed misto: hoje/outros usuários aleatório + mais curtidos/avaliados).
      home: '/v1/timeline',
      // Listagem classica do feed (slug list_manager 'timeline-feed').
      list: '/v1/timeline-posts',
      // Variante admin da listagem classica: get-all simples, sem "so meus posts" (slug 'timeline-posts-get-all').
      listGetAll: '/v1/timeline-posts-get-all',
      // Listas padrao por recurso (slugs 'timeline-post', 'timeline-manager', ...).
      post: '/v1/timeline-post',
      manager: '/v1/timeline-manager',
      comment: '/v1/timeline-comment',
      report: '/v1/timeline-report',
      attachment: '/v1/timeline-attachment',
      reaction: '/v1/timeline-reaction',
      rating: '/v1/timeline-rating',
    },
    // account — self-service do proprio usuario logado (dropdown da Navbar):
    // Editar Perfil (user-profiles/me) e Seguranca (troca da propria senha).
    // Sem espelho de grupo unico na API — profile usa user-profiles/me e
    // security usa auth/change-password (ver services/v1/index.ts).
    account: {
      profile: '/v1/account/profile',
      security: '/v1/account/security',
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
    // ChatRooms — salas de chat (modulo ChatRooms/ChatRoomsManager)
    chatRooms: {
      list: '/v1/chat-rooms-manager',
      create: '/v1/chat-rooms-manager/create',
      update: (id: RouteId) => `/v1/chat-rooms-manager/update/${id}`,
      chat: (id: RouteId) => `/v1/chat-rooms-manager/chat/${id}`,
    },
    // ChatMessages — mensagens das salas de chat. Update: remover (autor,
    // moderador ou admin) e editar o conteudo (so admin).
    chatMessages: {
      list: '/v1/chat-messages',
      create: '/v1/chat-messages/create',
      update: (id: RouteId) => `/v1/chat-messages/update/${id}`,
    },
    // ChatRoomAttachmentReports — denuncias de anexo (moderacao, so admin)
    chatRoomAttachmentReports: {
      list: '/v1/chat-room-attachment-reports',
      create: '/v1/chat-room-attachment-reports/create',
      update: (id: RouteId) => `/v1/chat-room-attachment-reports/update/${id}`,
    },
    // ChatRoomWarnings — advertências por palavra proibida (só admin)
    chatRoomWarnings: {
      list: '/v1/chat-room-warnings',
      create: '/v1/chat-room-warnings/create',
      update: (id: RouteId) => `/v1/chat-room-warnings/update/${id}`,
    },
    // ChatRoomFavorites — salas favoritas
    chatRoomFavorites: {
      list: '/v1/chat-room-favorites',
      create: '/v1/chat-room-favorites/create',
      update: (id: RouteId) => `/v1/chat-room-favorites/update/${id}`,
    },
    // MessagesManager — mensagens diretas remetente -> destinatario (modulo Messages; NAO e chat)
    messagesManager: {
      list: '/v1/messages-manager',
      create: '/v1/messages-manager/create',
      update: (id: RouteId) => `/v1/messages-manager/update/${id}`,
    },
    // LocationManager / LocationTypes — locais em arvore recursiva e seus tipos (tipos: so admin)
    locationManager: {
      list: '/v1/location-manager',
      create: '/v1/location-manager/create',
      view: (id: RouteId) => `/v1/location-manager/${id}`,
      update: (id: RouteId) => `/v1/location-manager/update/${id}`,
    },
    locationTypes: {
      list: '/v1/location-types',
      create: '/v1/location-types/create',
      update: (id: RouteId) => `/v1/location-types/update/${id}`,
    },
    // CompanyManager — cadastro de empresas (modulo Company; so admin)
    companyManager: {
      list: '/v1/company-manager',
      create: '/v1/company-manager/create',
      update: (id: RouteId) => `/v1/company-manager/update/${id}`,
    },
    // CompanyMembers / CompanyUsers — listas de membros por empresa e de empresas por usuario (so leitura; so admin)
    companyMembers: { list: '/v1/company-members', update: (id: RouteId) => `/v1/company-members/update/${id}` },
    companyUsers: { list: '/v1/company-users' },
    // UserResourceAccess — permissao individual de usuario a form/list (so admin). `create` aceita ?user_manager_id=
    userResourceAccess: {
      list: '/v1/user-resource-access',
      create: '/v1/user-resource-access/create',
      update: (id: RouteId) => `/v1/user-resource-access/update/${id}`,
    },
    // MessageGroupsManager — grupos de mensagem (modulo Messages; dono + membros)
    messageGroupsManager: {
      list: '/v1/message-groups-manager',
      create: '/v1/message-groups-manager/create',
      update: (id: RouteId) => `/v1/message-groups-manager/update/${id}`,
    },
    // MessageGroupMembers — grupos <-> membros (N:N usuarios x grupos; modulo Messages). `update` recebe o id do GRUPO
    messageGroupMembers: {
      list: '/v1/message-group-members-manager',
      update: (id: RouteId) => `/v1/message-group-members-manager/update/${id}`,
    },
    // MessageGroupMessages — mensagem enviada a um grupo (modulo Messages; NAO e chat). `update` recebe o id da LIGACAO
    messageGroupMessages: {
      list: '/v1/message-group-messages-manager',
      create: '/v1/message-group-messages-manager/create',
      update: (id: RouteId) => `/v1/message-group-messages-manager/update/${id}`,
    },
    // MessageAttachments — anexos de mensagens privadas e de grupo (modulo Messages; so lista; o anexo nasce no form da mensagem)
    messageAttachments: {
      list: '/v1/message-attachments-manager',
    },
    // MessageWarnings — advertencias de palavrao do modulo Messages (so admin; sem cadastro manual). `update` recebe o id da advertencia
    messageWarnings: {
      list: '/v1/message-warnings-manager',
      update: (id: RouteId) => `/v1/message-warnings-manager/update/${id}`,
    },
    // MessageChat — MODO CHAT do modulo Messages (conversa 1 para 1 privada e de grupo; NAO e sala de chat)
    messageChat: {
      home: '/v1/message-chat',
    },
    // ChatRoomMembers — membros das salas de chat (modulo ChatRooms/ChatRoomMembers)
    chatRoomMembers: {
      list: '/v1/chat-room-members',
      create: '/v1/chat-room-members/create',
      update: (id: RouteId) => `/v1/chat-room-members/update/${id}`,
    },
    // ChatRoomAttachments — anexos das mensagens (modulo ChatRooms/ChatRoomAttachments)
    chatRoomAttachments: {
      list: '/v1/chat-room-attachments',
      create: '/v1/chat-room-attachments/create',
      update: (id: RouteId) => `/v1/chat-room-attachments/update/${id}`,
    },
  },

  // Reservado para o namespace Api\V1A do backend.
  v1a: {
    root: '/v1a',
  },

  notFound: '*',
} as const;

export default paths;
