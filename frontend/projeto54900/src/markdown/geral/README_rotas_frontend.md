[◄ Índice da base de conhecimento](../README.md)

---

# Rotas do frontend (React)

> Este documento lista, de forma textual, todas as rotas React registradas no
> data router (`react-router-dom`), na mesma ordem em que são montadas em
> `routes/index.tsx` → `routes/v1/index.tsx` → `routes/v1/*.routes.tsx`.
>
> Espelha o [`README_rotas_swagger.md`](../../../../../app/markdown/geral/README_rotas_swagger.md)
> do backend (`src/app/markdown/geral/`), mas aqui o eixo é **Path React → Página**,
> não **Método HTTP → Controller**.
>
> Multiempresa: após o login o `routerBasename` ganha o slug da empresa (`/<slug>/v1/...`) — ver [`README_rota_empresa_slug.md`](README_rota_empresa_slug.md).
> Base: `routerBasename` (`env.basePath`, default `/`) + o path abaixo. Em dev:
> `http://localhost:54910` + path.

---

## Raiz

Fonte: `routes/index.tsx` — `createBrowserRouter`, `basename = routerBasename`.
`TemplateLayout` (template global: cabeçalho, nav, menu lateral e rodapé; antes `RootLayout`) envolve toda a árvore; `errorElement` cai em
`RouteErrorPage` para qualquer exceção de loader/render de uma rota filha.

| Path   | Elemento                    | Observação                                        |
| ------ | --------------------------- | ------------------------------------------------- |
| `/`    | `pages/Home/CompanyHome`    | Índice (`index: true`) dentro do `TemplateLayout`; Home (landing page) estática da empresa do slug, com fallback para a `default` (ver `README_rota_empresa_slug.md`, seção 4.1) |
| `/acesso-negado` | `pages/errors/ForbiddenPage` | Aviso de acesso negado — destino do `RequireRole` |
| `/v1`  | _(grupo)_ — ver seção "v1"  | `v1Routes`, registrado como filho do `TemplateLayout` |
| `/v1a` | _(grupo)_ — ver seção "v1a" | `v1aRoutes`, idem                                 |
| `*`    | `pages/errors/NotFoundPage` | Qualquer path não casado por nenhuma rota acima   |

Fora da árvore de paths, capturado pelo `errorElement` do nó raiz:

| Gatilho                                   | Elemento                      | Observação                                             |
| ----------------------------------------- | ----------------------------- | ------------------------------------------------------ |
| Exceção lançada por loader/render de rota | `pages/errors/RouteErrorPage` | Renderiza dentro de `layouts/BlankLayout` (sem navbar) |

---

## v1 — Auth, usuários, uploads, formulários, listas, nav, menu, calendário, svg-map, knowledge-base, timeline e messages

Fonte: `routes/v1/index.tsx` — agrupa tudo sob o prefixo `/v1`, espelhando o
grupo `api/v1` do backend (`app/Config/Routes.php`).

| Path  | Elemento              | Observação                                                 |
| ----- | --------------------- | ---------------------------------------------------------- |
| `/v1` | _(loader → redirect)_ | Redireciona para `paths.v1.user.profilesList` (`/v1/user-profiles`) |

### Guardas de rota

| Escopo                                                                                  | Guarda                          | Efeito                                                                                                    |
| --------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `login`, `user-manager/create`, `user-profiles/create`, `convite/aceitar`                 | nenhuma                         | **Públicas** — login, as duas etapas do Cadastro de Usuário, e o destino do link de e-mail do convite de evento |
| todo o resto do bloco v1                                                                 | `RequireAuth`                   | Sem sessão redireciona para `/v1/login`; durante o refresh silencioso inicial mostra `LoadingOverlay`       |
| `user-manager*`, `user-profiles`, `form-constructor*`, `form-constructor-claude`, `list-constructor*`, `temp-nav*`, `temp-menu*`, `temp-header*`, `temp-footer*`, `knowledge-base` | `RequireRole role="admin"`      | Sem o papel `admin` redireciona para `/acesso-negado`                                                       |
| `form/:slug`                                                                             | nenhuma (além do `RequireAuth`) | Renderizador genérico de formulário — usado por usuário comum; o caso do slug `calendario` é tratado dentro de `FormRendererPage` |

As guardas vivem em `routes/RequireAuth.tsx` e `routes/RequireRole.tsx` e são
montadas como nós **sem path**, envolvendo as rotas-filhas.

### auth — Login

Fonte: `routes/v1/auth.routes.tsx` — espelha `api/v1/auth` do backend.
**Única tela** do módulo: `refresh`, `logout` e `me` são chamados direto pelo
`AuthContext` (via `authService`), sem rota nem página dedicada.

| Path        | Elemento (lazy)            | Observação                                                                                          |
| ----------- | -------------------------- | --------------------------------------------------------------------------------------------------- |
| `/v1/login` | `pages/v1/auth/LoginPage`  | **Pública.** Ao autenticar, o `AuthContext` guarda os tokens e a página navega para `paths.home`      |

### user-manager

Fonte: `routes/v1/user.routes.tsx` — espelha `api/v1/user-manager` (+ `-view`).
Páginas organizadas por ação, seguindo [`README_paginas_modulo.md`](README_paginas_modulo.md)
(`pages/v1/user/user-manager/<Acao>Page.tsx`).

| Path                          | Elemento (lazy)                              | Observação                                                                           |
| ----------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------ |
| `/v1/user-manager`            | `pages/v1/user/user-manager/GetAllPage`       | Lista de segurança (menu "Listar"), slug `user-manager` — ações só-ícone `modal` por `data_action`: bloquear/desbloquear, reset de senha (`ResetPasswordModal`), perfil/role (`ChangeRoleModal`). **SOMENTE ADMIN** (`RequireRole role="admin"`, ver `routes/RequireRole.tsx`) — mesmo restrito no backend (`AdminOnlyFilter`) |
| `/v1/user-profiles`           | `pages/v1/user/user-profiles/GetAllPage`      | Lista de dados de usuários (menu "Dados Usuário"), slug `user-profiles` no Construtor de Listas — movida de `/v1/user-manager` em 2026-09-24. **SOMENTE ADMIN** |
| `/v1/user-manager/create`     | `pages/v1/user/user-manager/CreatePage`       | **PÚBLICA** — etapa 1 do Cadastro de Usuário: build `cadastro-usuario` (`user_manager`). Ao criar, redireciona para `/v1/user-profiles/create?user_manager_id={id}` |
| `/v1/user-profiles/create`    | `pages/v1/user/user-profiles/CreatePage`      | **PÚBLICA** — etapa 2 do Cadastro: build `dados-do-usuario` (`user_profiles`), lê `?user_manager_id=` da querystring. Ao concluir, vai para `/v1/login` |
| `/v1/user-manager/:id`        | `pages/v1/user/user-manager/GetPage`          | Detalhe somente leitura (via `-view`). **SOMENTE ADMIN**                              |
| `/v1/user-manager/update/:id` | `pages/v1/user/user-manager/UpdatePage`       | Edição — build `atualizar-usuario`. **SOMENTE ADMIN**                                 |

> **Correção:** o wizard `/v1/register` que este documento citava **não existe**
> em `user.routes.tsx`. O Cadastro de Usuário hoje são as **duas rotas públicas**
> acima, encadeadas por `user_manager_id` (cria o login, depois o perfil).
>
> **Correção:** `/v1/user-manager/create` e `/v1/user-manager/update/:id` **não
> são stubs** — são páginas reais (etapas 1 e edição). O path de edição é
> `update/:id` (nessa ordem), o mesmo de `paths.v1.user.update(id)`.

### account — Self-service do usuário logado

Fonte: `routes/v1/account.routes.tsx` — não espelha um grupo único da API:
`profile` fala com `user-profiles/me` (leitura) + `user-profiles/update/:id`
(escrita, restrita ao próprio registro — ver `Services/V1/User/UserProfiles/Processor.php::update()`)
e `security` fala com `auth/change-password`. Acessadas pelo dropdown do
usuário no fim da Navbar (ícone `bi-person-circle`, vermelho se admin/verde
demais + username), nunca por um item do menu dinâmico. Adicionado em 2026-09-25.

| Path                    | Elemento (lazy)                          | Observação                                                                                   |
| ------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `/v1/account/profile`   | `pages/v1/account/profile/UpdatePage`    | Edita o próprio `user_profiles` (nome, telefone, whatsapp, email, cpf, cep, endereço)          |
| `/v1/account/security`  | `pages/v1/account/security/UpdatePage`   | Troca a própria senha; backend invalida o token atual ao trocar — a página faz logout local e redireciona para `/v1/login` |

### upload-manager

Fonte: `routes/v1/upload.routes.tsx` — espelha `api/v1/upload-manager` (+ `-view`).

| Path                     | Elemento (lazy)                  | Observação |
| ------------------------ | -------------------------------- | ---------- |
| `/v1/upload-manager`     | `pages/v1/upload/UploadListPage` | Listagem   |
| `/v1/upload-manager/:id` | `pages/v1/upload/UploadViewPage` | Detalhe    |

> **Lacuna encontrada:** `routes/paths.ts` define `paths.v1.upload.new =
'/v1/upload-manager/novo'`, mas nenhuma rota com esse path está registrada em
> `upload.routes.tsx` — navegar até lá hoje cai no `NotFoundPage` (`*`). Não
> corrigido aqui (fora do escopo deste documento); registrar se algum dia
> alguém for religar essa constante a uma página real.

### form — Formulários dinâmicos

Fonte: `routes/v1/form.routes.tsx` — espelha `api/v1/form-manager` (+ `-view`),
`form-groups`, `form-rows`, `form-campos`.

Guarda: **`form-constructor*` inteiro é SOMENTE ADMIN** (`RequireRole role="admin"`).
`/v1/form/:slug` fica **sem** guarda de papel — é o renderizador usado por
usuário comum (autocadastro); a exceção do slug `calendario` é resolvida dentro
de `FormRendererPage`.

| Path                              | Elemento (lazy)                         | Observação                                                                                                                                                                                                       |
| --------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/v1/form-constructor`            | `pages/v1/form/FormConstructorListPage` | Lista os registros de `form_manager`                                                                                                                                                                             |
| `/v1/form-constructor/create`     | `pages/v1/form/FormBuilderPage`         | Construtor novo — árvore `form_manager → form_groups → form_rows → form_fields`                                                                                                                                  |
| `/v1/form-constructor/update/:id` | `pages/v1/form/FormBuilderPage`         | Mesma tela, hidratada com o registro existente (modo edição)                                                                                                                                                     |
| `/v1/form-constructor/:table/:id` | `pages/v1/form/FormConstructorBuildPage`| Renderiza **um** formulário real direto na página (sem modal), por `table_name` + ID — destino do botão "Build" da lista acima. O `table` da URL é validado contra o `table_name` do registro encontrado (mismatch = erro) |
| `/v1/form-constructor-claude`     | `pages/v1/form/FormConstructorPage`     | Construtor **legado** (consome `view_form_manager`) — marcado "NÃO mexer" no código                                                                                                                              |
| `/v1/form/:slug`                  | `pages/v1/form/FormRendererPage`        | Renderiza **qualquer** formulário publicado pela slug e submete para o `submit_endpoint` gravado. Ex.: `/v1/form/calendario` (link "Google Calendars" da navbar), `/v1/form/cadastro`, `/v1/form/seguranca-novo` |

> O wizard de cadastro (login + perfil) **não é deste módulo** — são as duas
> rotas públicas `user-manager/create` → `user-profiles/create` (seção
> "user-manager" acima). É um fluxo composto do módulo `user`.

> **`/v1/form-constructor` e `/v1/form-constructor-claude` são teste/dogfooding
> do próprio módulo Form** — construtor que grava em `form_manager` usando a
> API do próprio módulo (ver
> [`README_form_constructor.md`](README_form_constructor.md)), não uma
> dependência de outros módulos. Usuários, Calendário e Uploads têm listagem
> própria e resultado pronto (seções "user-manager", "calendar" e
> "upload-manager" acima) e não passam por essas duas rotas.

### list — Construtor de listagens

Fonte: `routes/v1/list.routes.tsx` — espelha `api/v1/list-manager`,
`list-columns` e `list-actions` (motor do "Construtor de Listas", nos mesmos
moldes do módulo form: árvore em níveis manager → colunas/ações).

Guarda: **todo o grupo é SOMENTE ADMIN** (`RequireRole role="admin"`). Não
confundir com a **leitura** de `list-manager`/`list-columns`/`list-actions` que
toda tela de listagem faz para saber suas próprias colunas/ações — essa leitura
não passa por estas rotas e continua acessível a qualquer usuário autenticado.

| Path                              | Elemento (lazy)                          | Observação                                                                                                                                            |
| --------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/v1/list-constructor`            | `pages/v1/list/ListConstructorPage`      | **Preview** do motor: escolhe uma listagem semeada, mostra as definições de colunas/ações e renderiza a grid com dados reais do `api_get_endpoint`       |
| `/v1/list-constructor/create`     | `pages/v1/list/ListBuilderPage`          | Construtor de uma listagem **nova** (árvore `list_manager` → colunas + ações)                                                                          |
| `/v1/list-constructor/update/:id` | `pages/v1/list/ListBuilderPage`          | Mesma tela em modo edição, hidratada do registro (`list-manager/get/{id}` + busca por `list_manager_id` em `list-columns`/`list-actions`)               |

> Não há view agrupada equivalente à `view_form_manager`: a hidratação da edição
> faz as buscas de colunas/ações por `list_manager_id`. Ver
> [`README_list_constructor.md`](README_list_constructor.md).
>
> Não há link dedicado na navbar para estas rotas — o acesso é por URL direta
> (ou por item cadastrado em `temp_menu`).

### nav — Config/branding do app/navbar

Fonte: `routes/v1/template.routes.tsx` — espelha `api/v1/temp-nav` (sem `-view`;
não tem view própria). Guarda nome do app, imagem, ícone de mensagens e versão
do sistema — a "casca" em volta do Menu, não o menu em si.

Guarda: **SOMENTE ADMIN** (`RequireRole role="admin"`).

| Path                          | Elemento (lazy)              | Observação                                                                                |
| ----------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------ |
| `/v1/temp-nav`             | `pages/v1/template/temp-nav/GetAllPage`     | Listagem **real** (tabela própria do módulo, não usa `DataTable`/`Pagination` — stubados)  |
| `/v1/temp-nav/create`      | `pages/v1/template/temp-nav/CreatePage`     | **Stub em branco** — aguardando a fábrica de formulários                                  |
| `/v1/temp-nav/:id`         | `pages/v1/template/temp-nav/GetPage`        | Detalhe real; botão "Ver itens" leva para `/v1/temp-menu?temp_nav_id=:id`             |
| `/v1/temp-nav/update/:id`  | `pages/v1/template/temp-nav/UpdatePage`     | **Stub em branco**, mesmo motivo acima                                                    |

### menu — Árvore de itens navegáveis

Fonte: `routes/v1/template.routes.tsx` — espelha `api/v1/temp-menu` (sem
`-view`). Cada item pertence a um `temp-nav` (FK `temp_nav_id`) e pode
ter um `parent_id` (submenu). Antes de 2026-09-13 esta tabela se chamava
`menu_items` e a config de branding usava o nome antigo desta tabela — os nomes
foram trocados para refletir que esta é a árvore de menu de verdade.

Guarda: **SOMENTE ADMIN** (`RequireRole role="admin"`). Não confundir com a
**leitura** que o layout global faz por `template-render/get` (fora do router)
para montar a navbar de qualquer usuário autenticado — essa leitura não passa
por estas rotas.

| Path                          | Elemento (lazy)              | Observação                                                                          |
| ------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------ |
| `/v1/temp-menu`             | `pages/v1/template/temp-menu/GetAllPage`   | Listagem **real**; aceita `?temp_nav_id=` para restringir aos itens de 1 nav      |
| `/v1/temp-menu/create`      | `pages/v1/template/temp-menu/CreatePage`   | **Stub em branco**; lê `?temp_nav_id=` para pré-preencher o título quando existir |
| `/v1/temp-menu/:id`         | `pages/v1/template/temp-menu/GetPage`      | Detalhe real; "Voltar" religa em `?temp_nav_id=` do próprio item                  |
| `/v1/temp-menu/update/:id`  | `pages/v1/template/temp-menu/UpdatePage`   | **Stub em branco**                                                                   |

### Layout global do sistema — `TemplateLayout`

O `TemplateLayout` (`layouts/TemplateLayout.tsx`) envolve as rotas normais no lugar do antigo `RootLayout` (que ficou no código, sem uso).
Ele renderiza a casca do template (`components/template/TemplateShell.tsx`), um código só para as três variantes
(`template001` bordas 3D, `template002` sem bordas, `template003` sem bordas com menu lateral em Offcanvas):

- **Visitante (sem login):** variante do template padrão da empresa do slug da URL (`/<slug>/v1/login`), pela rota pública
  `template-public/get/{slug}` (`hooks/useGuestTemplate.ts`); sem slug ou sem template, a do `env` (`VITE_GUEST_TEMPLATE`, padrão
  `template001`). Mostra o **cabeçalho(s) e o rodapé(s) da empresa** do slug (sem eles, o rodapé simples de sempre), nav só com
  **Home** e **Entrar** e o conteúdo (Home de cards, login, cadastro). Sem menu lateral.
- **Com sessão:** o template do usuário (`user_manager.temp_manager_id`) ou o de menor `id` ativo da empresa, vindo de
  `GET template-render/get` (`hooks/useTemplate.ts`): nav, menu lateral (itens `offcanvas`), cabeçalho(s) e rodapé(s) empilhados
  por `sort_order`. O nav mantém a marca do app, o badge de mensagens, o menu do usuário (Editar Perfil, Segurança, Sair) e a barra de favoritos.
- **Cores:** toda a paleta vem do `env` (`VITE_THEME`), antes e depois do login (`styles/_template-global.scss` leva a cor
  `primary` aos botões e componentes do Bootstrap dentro de `.tpl-app`).
- Componentes: `TemplateHeaderRegion`, `TemplateNavRegion`, `TemplateSideMenu`, `TemplateFooterRegion` e `TemplateShell`, em `components/template/`.
  A tela de chat em tela cheia e as páginas estáticas `/template001`, `/template002` e `/template003` ficam fora do layout.

### template — Cabeçalho e rodapé do template (`temp-header`, `temp-footer`)

Fonte: `routes/v1/template.routes.tsx` — espelha `api/v1/temp-header` e `api/v1/temp-footer`
(sem `-view`). Lista, busca, cadastro, edição e exclusão vêm dos builds do banco: `ListBuild`
(slugs `header` e `footer`) e `RecordFormBuild` (`criar-cabecalho`, `editar-cabecalho`,
`criar-rodape`, `editar-rodape`). Só admin (`RequireRole role="admin"`). A exclusão é a ação
"Excluir" da própria lista (`delete-soft`).

| Rota                          | Página                                          | Observação                                                         |
| ----------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| `/v1/temp-header`             | `pages/v1/template/temp-header/GetAllPage`      | Lista e busca (`ListBuild`, slug `header`)                         |
| `/v1/temp-header/create`      | `pages/v1/template/temp-header/CreatePage`      | `RecordFormBuild`, slug `criar-cabecalho`; nasce `draft`           |
| `/v1/temp-header/update/:id`  | `pages/v1/template/temp-header/UpdatePage`      | Slug `editar-cabecalho`; empresas (`company_manager`) via `patches` |
| `/v1/temp-footer`             | `pages/v1/template/temp-footer/GetAllPage`      | Lista e busca (slug `footer`)                                      |
| `/v1/temp-footer/create`      | `pages/v1/template/temp-footer/CreatePage`      | Slug `criar-rodape`                                                |
| `/v1/temp-footer/update/:id`  | `pages/v1/template/temp-footer/UpdatePage`      | Slug `editar-rodape`                                               |

`temp-manager` (catálogo de templates: `template001/002/003` e as empresas de cada um) segue o mesmo modelo
(`ListBuild` slug `template`; `criar-template` e `editar-template`), mas é **só superuser**
(`RequireRole role="superuser"`): `/v1/temp-manager`, `/v1/temp-manager/create`, `/v1/temp-manager/update/:id`.

Template do usuário: em `/v1/account/profile` ('Editar perfil') o componente `TemplatePreference` escolhe o template
(`PUT template-render/preference`): 'Automático (menor ID da empresa)' ou um dos templates da empresa da sessão; vale em todo login.

Empresas: o campo `company_manager[]` (lista de slugs) usa `toStringArray` (`utils/jsonList.ts`);
sem empresas no cadastro, o backend assume a empresa da sessão. As telas de nav e menu
(`temp-nav`, `temp-menu`) também ganharam esse campo. O menu lateral tem o grupo "Template"
(Cabeçalhos e Rodapés).

### calendar — Listagem de calendários (view_calendar_manager)

Fonte: `routes/v1/calendar.routes.tsx` — espelha `api/v1/calendar-manager`
Guarda: apenas `RequireAuth` (sem `RequireRole`).

(+ `-view`). Rota própria desde 2026-09-20: **não é mais um redirect** para
`/v1/form/calendario` (decisão revertida — nenhum item de menu deve
redirecionar). Ver detalhe em
[`markdown/geral/modulos/calendar/README_calendar.md`](modulos/calendar/README_calendar.md).

| Path                   | Elemento (lazy)                                | Observação                                                                                                    |
| ---------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `/v1/calendar-manager` | `pages/v1/calendar/calendar-manager/GetAllPage` | Lista calendários com seus eventos (`view_calendar_manager`, agrupada no cliente); busca/paginação no cliente; botão "Novo Calendário" reaproveita o form `calendario` (mesmo de `/v1/form/calendario`) |
| `/v1/calendar-list` | `pages/v1/calendar/calendar-list/GetAllPage` | Lista **simples** de `calendar_manager` (sem eventos, sem ações) — motor `list_manager`/`list_columns` (slug `calendar-list`), busca + paginação de servidor |
| `/v1/convite/aceitar` | `pages/v1/calendar/calendar-event-invites/AceitarConvitePage` | **PÚBLICA** (exportada em `calendarInvitePublicRoutes`, fora do `<RequireAuth/>`) — destino do link de e-mail do convite de evento; lê `?token=` e chama `POST api/v1/calendar-event-invites/accept-token`. Ver [`README_modulo_calendar_event_invites.md`](../../../../../app/markdown/geral/README_modulo_calendar_event_invites.md) do backend |

### svgMap — Mapa SVG dos municípios do RJ (rota estática)

Fonte: `routes/v1/svgMap.routes.tsx` — **não espelha API**: a página só
consome arquivos estáticos de `public/svg-map/` (`rj_municipios.svg`,
`rj_municipios_nomes.json`, `rj_municipios_cores.json`). Portado em 2026-09-23
do CakePHP `diarias` (`Web/V1A/Mapa/Page/index.php` + `mapa_rj_tooltip.js` +
`mapa_rj_checklist.js`). Item "SVG" no navbar via `temp_menu`
(`sort_order` 85). Não portados: `modal_mapa_rj.php` e `mapa_rj_highlight.js`
Guarda: apenas `RequireAuth` (sem `RequireRole`).

(atendem telas do Cake que não existem aqui).

| Path           | Elemento (lazy)                     | Observação                                                                                         |
| -------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `/v1/svg-map` | `pages/v1/svg-map/SvgMapPage`     | SVG inline com tooltip de nome no hover; checklist (`CheckboxField` do FormGrid, controlado) sincronizado com o clique no mapa; marcado = cor do município + nome + bolinha |

### knowledge — Base de conhecimento (rota estática, só admin)

Fonte: `routes/v1/knowledge.routes.tsx` — **não espelha API**: a página só lê os
`.md` das duas bases (`src/app/markdown/` e `src/markdown/`), embutidos no bundle
por `import.meta.glob(..., { query: '?raw' })` (um chunk lazy por arquivo). O
índice é montado lendo a tabela de índice do `README.md` de cada base
(`services/knowledgeBase.ts`), sem os resumos; cada item abre um collapse do
Bootstrap (estado React) com os markdowns do tópico renderizados por
`components/global/MarkdownView.tsx` (`react-markdown` + `remark-gfm`). No
dev-server, `vite.config.ts` libera a pasta do backend em `server.fs.allow`.
Guarda: `RequireAuth` + `RequireRole role="admin"` (a base descreve regras
internas). Item de navbar em `temp_menu`: **pendente**.

| Path                 | Elemento (lazy)                              | Observação                                                                                                       |
| -------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `/v1/knowledge-base` | `pages/v1/knowledge/KnowledgeBasePage`       | Índice consolidado backend + frontend; clicar num item abre o collapse com o markdown; links entre `.md` abrem o collapse do item dono do arquivo |

### map — Mapa Leaflet e mapa de um registro

Fonte: `routes/v1/map.routes.tsx` (páginas lazy; o Leaflet só carrega nestas telas). Sob `RequireAuth`.
Detalhes em [`README_mapa.md`](README_mapa.md).

| Path | Página | Observação |
| ---- | ------ | ---------- |
| `/v1/map` | `pages/v1/map/explorer/ExplorerPage` | wrapper de `MapExplorer`: escolher mapa, pontos, busca de endereço/CEP e trajeto |
| `/v1/map/links/:module/:id` | `pages/v1/map/links/LinksPage` | wrapper de `MapLinksPanel`; `module` = slug registrado em `Config/MapLinkables.php` (backend) |
| `/v1/map-manager`, `/v1/map-manager/create`, `/v1/map-manager/update/:id` | `pages/v1/map/map-manager/{GetAll,Create,Update}Page` | admin; builds `criar-mapa` / `editar-mapa` |
| `/v1/map-icons` (+ `/create`, `/update/:id`) | `pages/v1/map/map-icons/*` | admin |
| `/v1/map-categories` (+ `/create`, `/update/:id`) | `pages/v1/map/map-categories/*` | admin |
| `/v1/map-postal-codes` (+ `/create`, `/update/:id`) | `pages/v1/map/map-postal-codes/*` | admin |
| `/v1/map-addresses` (+ `/create`, `/update/:id`) | `pages/v1/map/map-addresses/*` | admin |
| `/v1/map-points` (+ `/create`, `/update/:id`) | `pages/v1/map/map-points/*` | admin |
| `/v1/map-routes`, `/v1/map-routes/update/:id` | `pages/v1/map/map-routes/{GetAll,Update}Page` | admin; “Novo trajeto” abre `/v1/map` |
| `/v1/map-route-stops` (+ `/create`, `/update/:id`) | `pages/v1/map/map-route-stops/*` | admin |
| `/v1/map-links` (+ `/create`, `/update/:id`) | `pages/v1/map/map-links/*` | admin |
| `/v1/map-geocode-cache` | `pages/v1/map/map-geocode-cache/GetAllPage` | admin; só lista e exclusão |

### timeline — Feed e listas padrão do módulo

Fonte: `routes/v1/timeline.routes.tsx` — espelha `api/v1/timeline-posts-view`
(+ `api/v1/timeline-posts` para as ações de escrita) e, nas listas padrão, os
`-view` de cada recurso via motor do Construtor de Listas. Guarda: apenas
`RequireAuth` (sem `RequireRole`). Backend completo e testado (7 recursos,
189 rotas) — ver
[`README_modulo_timeline.md`](../../../../../app/markdown/geral/README_modulo_timeline.md)
do backend.

**Mudança de 2026-09-28 — os itens de menu do módulo deixaram de apontar para
formulário.** Os 5 recursos saíam do renderizador genérico
(`/v1/form/timeline-post`, `/v1/form/timeline-settings`, `/v1/form/timeline-comment`,
`/v1/form/timeline-report`, `/v1/form/timeline-attachment`) e passaram a ter rota
do próprio módulo, exibindo **listas padrão**: `/v1/timeline-post`,
`/v1/timeline-manager`, `/v1/timeline-comment`, `/v1/timeline-report` e
`/v1/timeline-attachment`. Cada página é um wrapper fino de
`pages/v1/timeline/StandardListPage.tsx` (mesmo motor de `calendar-list`:
`list_manager`/`list_columns`, busca + paginação de servidor, **sem** formulário
e **sem** `list_actions`). O slug do `list_manager` é homônimo da rota — ver
["timeline" em `README_list_constructor.md`](README_list_constructor.md).
As rotas antigas `/v1/form/<slug>` **continuam existindo e funcionando**
(genéricas), apenas não são mais destino de item de menu.

Esta é a listagem **clássica** (Fase 2); a página inicial com feed
misto/scroll infinito pedida pelo usuário (Home Feed) é outra tela (Fase 3).

| Path                | Elemento (lazy)                                | Observação                                                                                                   |
| ------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `/v1/timeline` | `pages/v1/timeline/home-feed/GetAllPage` | **Home Feed** (Fase 3b) — feed misto (`GET .../timeline-posts-view/home-feed`, algoritmo no backend, `README_modulo_timeline.md` §5.1), scroll infinito 10 em 10 (`useInfiniteScroll`), card único por post (`PostCard.tsx`: mídia via `MediaPreview` global, curtir/avaliar/comentar/denunciar, 3 comentários + "ver mais" com scroll infinito próprio), botão flutuante de novo post (`NewPostModal.tsx`, reaproveita a técnica do `FormRendererPage`) |
| `/v1/timeline-posts` | `pages/v1/timeline/timeline-posts/GetAllPage` | Listagem **clássica** (Fase 2) — feed completo (`view_timeline_posts`), mais recentes primeiro — motor `list_manager`/`list_columns`/`list_actions` (slug `timeline-feed`), busca + paginação de servidor, mesmo padrão de `calendar-list/GetAllPage`. Ações Curtir/Avaliar/Republicar chamam a API de verdade (corpo montado por `list_actions.data_action`, ver header do arquivo) |
| `/v1/timeline-post` | `pages/v1/timeline/timeline-post/GetAllPage` | **Lista padrão** das publicações (`timeline_posts`) — slug `timeline-post`, wrapper de `StandardListPage`. Item de menu "Nova Publicação" (`temp_menu.id=31`) |
| `/v1/timeline-manager` | `pages/v1/timeline/timeline-manager/GetAllPage` | **Lista padrão** das timelines (`timeline_manager`) — slug `timeline-manager`. Item de menu "Minha Timeline" (`id=32`). Era o form `timeline-settings` |
| `/v1/timeline-comment` | `pages/v1/timeline/timeline-comment/GetAllPage` | **Lista padrão** dos comentários (`timeline_post_comments`) — slug `timeline-comment`. Item de menu "Comentar" (`id=33`) |
| `/v1/timeline-report` | `pages/v1/timeline/timeline-report/GetAllPage` | **Lista padrão** das denúncias (`timeline_post_reports`) — slug `timeline-report`. Item de menu "Denunciar" (`id=34`) |
| `/v1/timeline-attachment` | `pages/v1/timeline/timeline-attachment/GetAllPage` | **Lista padrão** dos anexos de post (`timeline_post_attachments`) — slug `timeline-attachment`. Item de menu "Anexo do Post" (`id=35`) |

> **Pendência das 5 listas padrão:** cada rota só mostra dados depois que o
> registro homônimo existir em `list_manager` (com `list_columns`) — criar em
> `/v1/list-constructor`. Até lá a página exibe
> `Listagem '<slug>' não encontrada em list_manager`.
> Os títulos dos itens de menu continuam os antigos ("Nova Publicação",
> "Comentar", …), embora as telas agora sejam de listagem — ajustar em
> `/v1/temp-menu` se for o caso.
> As listas padrão usam **GET** (`api_get_endpoint`/`api_search_endpoint`); uma
> listagem que exija POST (`get-grouped`, como `timeline-feed`) precisa de página
> própria, não deste wrapper.

**Lacuna conhecida (não corrigida nesta fase, mesmo padrão de
`upload.routes.tsx`):** as ações "Ver" (`/v1/timeline-posts/{id}`), "Comentar"
(`/v1/timeline-post-comments?timeline_post_id={id}`) e "Editar"
(`/v1/timeline-posts/update/{id}`) apontam para rotas que ainda não existem —
clicar cai no `NotFoundPage`. Ficam para quando a página de
detalhe/comentários e o formulário de edição de post existirem.

---

### messages — Mensagens diretas e grupos (listas e CRUD de tela)

Fonte: `routes/v1/messages.routes.tsx` — espelha `api/v1/messages-manager(-view)` e
`api/v1/message-groups-manager(-view)`. Guarda: apenas `RequireAuth`; quem pode
alterar cada registro é decidido pelo backend (remetente/dono ou admin). Message
**não é chat**: estas são listas e formulários; a tela de conversa ainda não existe.
Backend completo — ver
[`README_modulo_messages.md`](../../../../../app/markdown/geral/README_modulo_messages.md)
e o estado do frontend em
[`modulos/messages/README_plano.md`](modulos/messages/README_plano.md).

| Rota                                   | Página                                                      | Observação                                              |
| -------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| `/v1/messages-manager`                 | `pages/v1/messages/messages-manager/GetAllPage`             | lista 36 (`list_manager`), com busca; menu "Lista"      |
| `/v1/messages-manager/create`          | `pages/v1/messages/messages-manager/CreatePage`             | form 41 `criar-mensagem-direta`                         |
| `/v1/messages-manager/update/:id`      | `pages/v1/messages/messages-manager/UpdatePage`             | form 42 `editar-mensagem-direta`                        |
| `/v1/message-groups-manager`           | `pages/v1/messages/message-groups-manager/GetAllPage`       | lista 37, com busca; menu "Grupos"                      |
| `/v1/message-groups-manager/create`    | `pages/v1/messages/message-groups-manager/CreatePage`       | form 43 `criar-grupo-mensagem`                          |
| `/v1/message-groups-manager/update/:id`| `pages/v1/messages/message-groups-manager/UpdatePage`       | form 44 `editar-grupo-mensagem`                         |
| `/v1/message-group-members-manager`    | `pages/v1/messages/message-group-members-manager/GetAllPage`  | lista 38, com busca; menu "Membros"; **Novo** abre o `CreateModal` (2 etapas: form 43 + membros) |
| `/v1/message-group-messages-manager`   | `pages/v1/messages/message-group-messages-manager/GetAllPage`  | lista 39, com busca; menu "Mensagens de grupo"          |
| `/v1/message-group-messages-manager/create` | `pages/v1/messages/message-group-messages-manager/CreatePage` | form 45 `criar-mensagem-grupo`                     |
| `/v1/message-group-messages-manager/update/:id` | `pages/v1/messages/message-group-messages-manager/UpdatePage` | form 46 `editar-mensagem-grupo`; `:id` = ligação mensagem-grupo |
| `/v1/message-attachments-manager`      | `pages/v1/messages/message-attachments-manager/GetAllPage`    | lista 40, com busca; menu "Anexos"; Baixar, Abrir mensagem, Excluir, Visualizador (sem cadastro: o anexo nasce no form da mensagem) |
| `/v1/message-warnings-manager`         | `pages/v1/messages/message-warnings-manager/GetAllPage`       | lista 41, com busca; **só admin**; menu "Advertências"; sem cadastro |
| `/v1/message-warnings-manager/update/:id` | `pages/v1/messages/message-warnings-manager/UpdatePage`    | form 47 `editar-advertencia-mensagem` (só a palavra marcada) |
| `/v1/message-chat`                     | `pages/v1/messages/chat/ChatHomePage`                         | modo chat, Etapa 1: lista de cards (grupos do usuário + usuários) com busca; abre o `ChatModal`; menu "Conversas" |
| `/v1/message-group-members-manager/update/:id` | `pages/v1/messages/message-group-members-manager/UpdatePage` | `:id` = grupo; 2 cards (usuários × grupo), grava por `PUT message-group-members/sync/{id}` |

---

### company-manager e user-resource-access — Empresas e acesso individual

Fonte: `routes/v1/company.routes.tsx` e `routes/v1/user.routes.tsx`. Guarda: `RequireRole role="admin"`
(a escrita também é `adminonly` no backend). As telas são wrappers dos componentes globais `ListBuild` e
`RecordFormBuild` (`components/global/`). Detalhes em
[`modulos/company-manager/README_plano.md`](modulos/company-manager/README_plano.md).

| Rota | Página | Observação |
| ---- | ------ | ---------- |
| `/v1/company-manager` | `pages/v1/company/company-manager/GetAllPage` | lista 42 (`list_manager`), com busca; menu "Empresas" |
| `/v1/company-manager/create` | `pages/v1/company/company-manager/CreatePage` | form 48 `criar-empresa` |
| `/v1/company-manager/update/:id` | `pages/v1/company/company-manager/UpdatePage` | form 49 `editar-empresa` |
| `/v1/company-members` | `pages/v1/company/company-members/GetAllPage` | lista 44 (`view_company_memberships`), com busca; menu "Empresa > Membros"; **Novo** abre o `CreateModal` (2 etapas: form 48 + membros) |
| `/v1/company-members/update/:id` | `pages/v1/company/company-members/UpdatePage` | `:id` = empresa; 2 cards (usuários × empresa), grava por `PUT company-members/sync/{id}`; só admin |
| `/v1/company-users` | `pages/v1/company/company-users/GetAllPage` | lista 45 (`view_company_users_companies`), com busca; menu "Empresa > Usuários por empresa"; só leitura |
| `/v1/user-resource-access` | `pages/v1/user/user-resource-access/GetAllPage` | lista 43, com busca; menu "Empresa > Acesso individual" |
| `/v1/user-resource-access/create` | `pages/v1/user/user-resource-access/CreatePage` | schema inline (tipo define o select de recurso); aceita `?user_manager_id=` |
| `/v1/user-resource-access/update/:id` | `pages/v1/user/user-resource-access/UpdatePage` | só o campo Acesso (permitir/negar) muda |

---

## v1a — Reservado

Fonte: `routes/v1a/index.tsx` — espelha o namespace `Api\V1A` do backend, ainda
sem módulos.

Guarda: `RequireAuth` (não é Home/Login/Cadastro).

| Path   | Elemento (lazy)                                         | Observação                               |
| ------ | ------------------------------------------------------- | ---------------------------------------- |
| `/v1a` | `pages/errors/VersionPlaceholderPage` (`version="v1a"`) | Placeholder — nenhum módulo criado ainda |

Ao criar o primeiro grupo em `api/v1a` no backend, replicar aqui o mesmo padrão
de `user.routes.tsx` / `upload.routes.tsx` (arquivo `vX/README.md` já deixa a
instrução).

---

## Navegação (navbar)

Fonte: `components/template/TemplateNavRegion.tsx` (layout global, desde 2026-10-28; antes `components/layout/Navbar.tsx`) —
todos os links usam `paths.ts`, nunca string solta.

**A barra NÃO é uma lista fixa de links.** Com sessão ela é montada a partir de `temp_menu`, entregue por
`GET template-render/get` (o backend filtra por papel). Só estes itens são fixos no código:

| Situação                                  | Itens fixos                                                             |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| Visitante sem sessão                      | `GUEST_ENTRIES`: Home (`paths.home`) + Entrar (`paths.v1.auth.login`)   |
| Autenticado, mas a API do template falhou | `HOME_ONLY_ENTRIES`: apenas Home                                        |
| Durante o bootstrap do `AuthContext`      | apenas Home (para "Entrar" não piscar antes de restaurar a sessão)      |

Com sessão, os itens de topo `navbar` vêm de `temp_menu` (raízes com `sort_order < 100`), com os filhos virando dropdown de um
nível; itens `offcanvas` (e seus filhos) formam o menu lateral. Um item de **topo** cuja rota seja a de login é removido
(`toNavEntries`); dentro de um submenu ele permanece.

> Ou seja: o path de cada item de navbar (Usuarios, Uploads, Formularios, Nav,
> Menus, Google Calendars, SVG…) é **dado de banco**, não deste documento. O
> mapa dos destinos continua nas seções acima; a manutenção é na tela
> `/v1/temp-menu`.

Dropdown do usuário (fim da barra, só autenticado) — este sim é fixo no código:

| Label          | Path                              |
| -------------- | ---------------------------------- |
| (cabeçalho)    | `user.full_name ?? user.username`  |
| Editar Perfil  | `paths.v1.account.profile` (`/v1/account/profile`)   |
| Segurança      | `paths.v1.account.security` (`/v1/account/security`) |
| Sair           | `logout()` (`AuthContext`), sem rota própria         |

O ícone do toggle (`bi-person-circle`) fica vermelho para admin e verde para os
demais papéis.

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
