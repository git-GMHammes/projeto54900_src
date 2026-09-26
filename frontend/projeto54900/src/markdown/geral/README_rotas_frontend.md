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
> Base: `routerBasename` (`env.basePath`, default `/`) + o path abaixo. Em dev:
> `http://localhost:54910` + path.

---

## Raiz

Fonte: `routes/index.tsx` — `createBrowserRouter`, `basename = routerBasename`.
`RootLayout` (navbar + footer) envolve toda a árvore; `errorElement` cai em
`RouteErrorPage` para qualquer exceção de loader/render de uma rota filha.

| Path   | Elemento                    | Observação                                        |
| ------ | --------------------------- | ------------------------------------------------- |
| `/`    | `pages/Home/HomePage`       | Índice (`index: true`) dentro do `RootLayout`     |
| `/acesso-negado` | `pages/errors/ForbiddenPage` | Aviso de acesso negado — destino do `RequireRole` |
| `/v1`  | _(grupo)_ — ver seção "v1"  | `v1Routes`, registrado como filho do `RootLayout` |
| `/v1a` | _(grupo)_ — ver seção "v1a" | `v1aRoutes`, idem                                 |
| `*`    | `pages/errors/NotFoundPage` | Qualquer path não casado por nenhuma rota acima   |

Fora da árvore de paths, capturado pelo `errorElement` do nó raiz:

| Gatilho                                   | Elemento                      | Observação                                             |
| ----------------------------------------- | ----------------------------- | ------------------------------------------------------ |
| Exceção lançada por loader/render de rota | `pages/errors/RouteErrorPage` | Renderiza dentro de `layouts/BlankLayout` (sem navbar) |

---

## v1 — Auth, usuários, uploads, formulários, listas, nav, menu, calendário e svg-map

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
| `user-manager*`, `user-profiles`, `form-constructor*`, `form-constructor-claude`, `list-constructor*`, `nav-manager*`, `menu-manager*` | `RequireRole role="admin"`      | Sem o papel `admin` redireciona para `/acesso-negado`                                                       |
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
> (ou por item cadastrado em `menu_manager`).

### nav — Config/branding do app/navbar

Fonte: `routes/v1/nav.routes.tsx` — espelha `api/v1/nav-manager` (sem `-view`;
não tem view própria). Guarda nome do app, imagem, ícone de mensagens e versão
do sistema — a "casca" em volta do Menu, não o menu em si.

Guarda: **SOMENTE ADMIN** (`RequireRole role="admin"`).

| Path                          | Elemento (lazy)              | Observação                                                                                |
| ----------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------ |
| `/v1/nav-manager`             | `pages/v1/nav/GetAllPage`     | Listagem **real** (tabela própria do módulo, não usa `DataTable`/`Pagination` — stubados)  |
| `/v1/nav-manager/create`      | `pages/v1/nav/CreatePage`     | **Stub em branco** — aguardando a fábrica de formulários                                  |
| `/v1/nav-manager/:id`         | `pages/v1/nav/GetPage`        | Detalhe real; botão "Ver itens" leva para `/v1/menu-manager?nav_manager_id=:id`             |
| `/v1/nav-manager/update/:id`  | `pages/v1/nav/UpdatePage`     | **Stub em branco**, mesmo motivo acima                                                    |

### menu — Árvore de itens navegáveis

Fonte: `routes/v1/menu.routes.tsx` — espelha `api/v1/menu-manager` (sem
`-view`). Cada item pertence a um `nav-manager` (FK `nav_manager_id`) e pode
ter um `parent_id` (submenu). Antes de 2026-09-13 esta tabela se chamava
`menu_items` e a config de branding se chamava `menu_manager` — os nomes
foram trocados para refletir que esta é a árvore de menu de verdade.

Guarda: **SOMENTE ADMIN** (`RequireRole role="admin"`). Não confundir com a
**leitura** que `hooks/useSiteMenu.ts` faz direto do service (fora do router)
para montar a navbar de qualquer usuário autenticado — essa leitura não passa
por estas rotas.

| Path                          | Elemento (lazy)              | Observação                                                                          |
| ------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------ |
| `/v1/menu-manager`             | `pages/v1/menu/GetAllPage`   | Listagem **real**; aceita `?nav_manager_id=` para restringir aos itens de 1 nav      |
| `/v1/menu-manager/create`      | `pages/v1/menu/CreatePage`   | **Stub em branco**; lê `?nav_manager_id=` para pré-preencher o título quando existir |
| `/v1/menu-manager/:id`         | `pages/v1/menu/GetPage`      | Detalhe real; "Voltar" religa em `?nav_manager_id=` do próprio item                  |
| `/v1/menu-manager/update/:id`  | `pages/v1/menu/UpdatePage`   | **Stub em branco**                                                                   |

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
| `/v1/convite/aceitar` | `pages/v1/calendar/calendar-event-invites/AceitarConvitePage` | **PÚBLICA** (exportada em `calendarInvitePublicRoutes`, fora do `<RequireAuth/>`) — destino do link de e-mail do convite de evento; lê `?token=` e chama `POST api/v1/calendar-event-invites/accept-token`. Ver [`README_modulo_calendar_event_invites.md`](../../../../../app/markdown/geral/README_modulo_calendar_event_invites.md) do backend |

### svgMap — Mapa SVG dos municípios do RJ (rota estática)

Fonte: `routes/v1/svgMap.routes.tsx` — **não espelha API**: a página só
consome arquivos estáticos de `public/svg-map/` (`rj_municipios.svg`,
`rj_municipios_nomes.json`, `rj_municipios_cores.json`). Portado em 2026-09-23
do CakePHP `diarias` (`Web/V1A/Mapa/Page/index.php` + `mapa_rj_tooltip.js` +
`mapa_rj_checklist.js`). Item "SVG" no navbar via `menu_manager`
(`sort_order` 85). Não portados: `modal_mapa_rj.php` e `mapa_rj_highlight.js`
Guarda: apenas `RequireAuth` (sem `RequireRole`).

(atendem telas do Cake que não existem aqui).

| Path           | Elemento (lazy)                     | Observação                                                                                         |
| -------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `/v1/svg-map` | `pages/v1/svg-map/SvgMapPage`     | SVG inline com tooltip de nome no hover; checklist (`CheckboxField` do FormGrid, controlado) sincronizado com o clique no mapa; marcado = cor do município + nome + bolinha |

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

Fonte: `components/layout/Navbar.tsx` — todos os links usam `paths.ts`, nunca
string solta.

**A barra NÃO é uma lista fixa de links.** Ela é montada a partir de
`menu_manager` (via `hooks/useSiteMenu.ts`, que lê o service direto, fora do
router) e filtrada por papel. Só estes itens são hardcoded no componente:

| Situação                                  | Itens hardcoded                                                        |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| Visitante sem sessão                      | `GUEST_NAV`: Home (`paths.home`) + Entrar (`paths.v1.auth.login`)       |
| Autenticado, mas API do menu falhou/vazia | `FALLBACK_NAV`: apenas Home                                             |
| Durante o bootstrap do `AuthContext`      | apenas Home (para "Entrar" não piscar antes de restaurar a sessão)      |

Com sessão, os itens de topo vêm de `menu_manager` (faixa de `sort_order`
`<100`), com os filhos de `parent_id` virando dropdown; itens com placement
`offcanvas` (e seus filhos) vão para o painel lateral. Um item de **topo** cuja
rota seja a de login é removido (`withoutRootLogin`) — dentro de um submenu ele
permanece.

> Ou seja: o path de cada item de navbar (Usuarios, Uploads, Formularios, Nav,
> Menus, Google Calendars, SVG…) é **dado de banco**, não deste documento. O
> mapa dos destinos continua nas seções acima; a manutenção é na tela
> `/v1/menu-manager`.

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

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
