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
| `/v1`  | _(grupo)_ — ver seção "v1"  | `v1Routes`, registrado como filho do `RootLayout` |
| `/v1a` | _(grupo)_ — ver seção "v1a" | `v1aRoutes`, idem                                 |
| `*`    | `pages/errors/NotFoundPage` | Qualquer path não casado por nenhuma rota acima   |

Fora da árvore de paths, capturado pelo `errorElement` do nó raiz:

| Gatilho                                   | Elemento                      | Observação                                             |
| ----------------------------------------- | ----------------------------- | ------------------------------------------------------ |
| Exceção lançada por loader/render de rota | `pages/errors/RouteErrorPage` | Renderiza dentro de `layouts/BlankLayout` (sem navbar) |

---

## v1 — Módulo de usuários, uploads, formulários, nav, menu e calendário

Fonte: `routes/v1/index.tsx` — agrupa tudo sob o prefixo `/v1`, espelhando o
grupo `api/v1` do backend (`app/Config/Routes.php`).

| Path  | Elemento              | Observação                                                 |
| ----- | --------------------- | ---------------------------------------------------------- |
| `/v1` | _(loader → redirect)_ | Redireciona para `paths.v1.user.profilesList` (`/v1/user-profiles`) |

### user-manager

Fonte: `routes/v1/user.routes.tsx` — espelha `api/v1/user-manager` (+ `-view`).
Páginas organizadas por ação, seguindo [`README_paginas_modulo.md`](README_paginas_modulo.md)
(`pages/v1/user/user-manager/<Acao>Page.tsx`).

| Path                          | Elemento (lazy)                              | Observação                                                                           |
| ----------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------ |
| `/v1/user-manager`            | `pages/v1/user/user-manager/GetAllPage`       | Lista de segurança (menu "Listar"), slug `user-manager` — ações só-ícone `modal` por `data_action`: bloquear/desbloquear, reset de senha (`ResetPasswordModal`), perfil/role (`ChangeRoleModal`). **SOMENTE ADMIN** (`RequireRole role="admin"`, ver `routes/RequireRole.tsx`) — mesmo restrito no backend (`AdminOnlyFilter`) |
| `/v1/user-profiles`           | `pages/v1/user/user-profiles/GetAllPage`      | Lista de dados de usuários (menu "Dados Usuário"), slug `user-profiles` no Construtor de Listas — movida de `/v1/user-manager` em 2026-09-24 |
| `/v1/user-manager/create`     | `pages/v1/user/user-manager/CreatePage`       | **Stub em branco** — aguardando a fábrica de formulários (ver CLAUDE.md do frontend) |
| `/v1/user-manager/:id`        | `pages/v1/user/user-manager/GetPage`          | Detalhe. **SOMENTE ADMIN**                                                           |
| `/v1/user-manager/:id/update` | `pages/v1/user/user-manager/UpdatePage`       | **Stub em branco**, mesmo motivo acima. **SOMENTE ADMIN**                            |
| `/v1/register`                | `pages/v1/user/register/RegisterPage`         | Fluxo composto (não é ação de 1 tabela só): cria login em `user-manager`, depois perfil em `user-profiles`, ligados por `user_manager_id`. Wizard de 2 cards (não abas) sobre os builds `seguranca-novo` e `cadastro` |

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

| Path                              | Elemento (lazy)                         | Observação                                                                                                                                                                                                       |
| --------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/v1/form-constructor`            | `pages/v1/form/FormConstructorListPage` | Lista os registros de `form_manager`                                                                                                                                                                             |
| `/v1/form-constructor/create`     | `pages/v1/form/FormBuilderPage`         | Construtor novo — árvore `form_manager → form_groups → form_rows → form_fields`                                                                                                                                  |
| `/v1/form-constructor/update/:id` | `pages/v1/form/FormBuilderPage`         | Mesma tela, hidratada com o registro existente (modo edição)                                                                                                                                                     |
| `/v1/form-constructor-claude`     | `pages/v1/form/FormConstructorPage`     | Construtor **legado** (consome `view_form_manager`) — marcado "NÃO mexer" no código                                                                                                                              |
| `/v1/form/:slug`                  | `pages/v1/form/FormRendererPage`        | Renderiza **qualquer** formulário publicado pela slug e submete para o `submit_endpoint` gravado. Ex.: `/v1/form/calendario` (link "Google Calendars" da navbar), `/v1/form/cadastro`, `/v1/form/seguranca-novo` |

> O wizard de cadastro (login + perfil) não é mais deste módulo — mudou para
> `/v1/register` (`pages/v1/user/register/RegisterPage.tsx`), ver seção
> "user-manager" acima. É um fluxo composto do módulo `user`, não do módulo `form`.

> **`/v1/form-constructor` e `/v1/form-constructor-claude` são teste/dogfooding
> do próprio módulo Form** — construtor que grava em `form_manager` usando a
> API do próprio módulo (ver
> [`README_form_constructor.md`](README_form_constructor.md)), não uma
> dependência de outros módulos. Usuários, Calendário e Uploads têm listagem
> própria e resultado pronto (seções "user-manager", "calendar" e
> "upload-manager" acima) e não passam por essas duas rotas.

### nav — Config/branding do app/navbar

Fonte: `routes/v1/nav.routes.tsx` — espelha `api/v1/nav-manager` (sem `-view`;
não tem view própria). Guarda nome do app, imagem, ícone de mensagens e versão
do sistema — a "casca" em volta do Menu, não o menu em si.

| Path                     | Elemento (lazy)              | Observação                                                                                |
| ------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------ |
| `/v1/nav-manager`        | `pages/v1/nav/GetAllPage`     | Listagem **real** (tabela própria do módulo, não usa `DataTable`/`Pagination` — stubados)  |
| `/v1/nav-manager/create` | `pages/v1/nav/CreatePage`     | **Stub em branco** — aguardando a fábrica de formulários                                  |
| `/v1/nav-manager/:id`    | `pages/v1/nav/GetPage`        | Detalhe real; botão "Ver itens" leva para `/v1/menu-manager?nav_manager_id=:id`             |
| `/v1/nav-manager/:id/update` | `pages/v1/nav/UpdatePage` | **Stub em branco**, mesmo motivo acima                                                    |

### menu — Árvore de itens navegáveis

Fonte: `routes/v1/menu.routes.tsx` — espelha `api/v1/menu-manager` (sem
`-view`). Cada item pertence a um `nav-manager` (FK `nav_manager_id`) e pode
ter um `parent_id` (submenu). Antes de 2026-09-13 esta tabela se chamava
`menu_items` e a config de branding se chamava `menu_manager` — os nomes
foram trocados para refletir que esta é a árvore de menu de verdade.

| Path                          | Elemento (lazy)              | Observação                                                                          |
| ------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------ |
| `/v1/menu-manager`             | `pages/v1/menu/GetAllPage`   | Listagem **real**; aceita `?nav_manager_id=` para restringir aos itens de 1 nav      |
| `/v1/menu-manager/create`      | `pages/v1/menu/CreatePage`   | **Stub em branco**; lê `?nav_manager_id=` para pré-preencher o título quando existir |
| `/v1/menu-manager/:id`         | `pages/v1/menu/GetPage`      | Detalhe real; "Voltar" religa em `?nav_manager_id=` do próprio item                  |
| `/v1/menu-manager/:id/update`  | `pages/v1/menu/UpdatePage`   | **Stub em branco**                                                                   |

### calendar — Listagem de calendários (view_calendar_manager)

Fonte: `routes/v1/calendar.routes.tsx` — espelha `api/v1/calendar-manager`
(+ `-view`). Rota própria desde 2026-09-20: **não é mais um redirect** para
`/v1/form/calendario` (decisão revertida — nenhum item de menu deve
redirecionar). Ver detalhe em
[`markdown/geral/modulos/calendar/README_calendar.md`](modulos/calendar/README_calendar.md).

| Path                   | Elemento (lazy)                                | Observação                                                                                                    |
| ---------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `/v1/calendar-manager` | `pages/v1/calendar/calendar-manager/GetAllPage` | Lista calendários com seus eventos (`view_calendar_manager`, agrupada no cliente); busca/paginação no cliente; botão "Novo Calendário" reaproveita o form `calendario` (mesmo de `/v1/form/calendario`) |

### svgMap — Mapa SVG dos municípios do RJ (rota estática)

Fonte: `routes/v1/svgMap.routes.tsx` — **não espelha API**: a página só
consome arquivos estáticos de `public/svg-map/` (`rj_municipios.svg`,
`rj_municipios_nomes.json`, `rj_municipios_cores.json`). Portado em 2026-09-23
do CakePHP `diarias` (`Web/V1A/Mapa/Page/index.php` + `mapa_rj_tooltip.js` +
`mapa_rj_checklist.js`). Item "SVG" no navbar via `menu_manager`
(`sort_order` 85). Não portados: `modal_mapa_rj.php` e `mapa_rj_highlight.js`
(atendem telas do Cake que não existem aqui).

| Path           | Elemento (lazy)                     | Observação                                                                                         |
| -------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `/v1/svg-map` | `pages/v1/svg-map/SvgMapPage`     | SVG inline com tooltip de nome no hover; checklist (`CheckboxField` do FormGrid, controlado) sincronizado com o clique no mapa; marcado = cor do município + nome + bolinha |

---

## v1a — Reservado

Fonte: `routes/v1a/index.tsx` — espelha o namespace `Api\V1A` do backend, ainda
sem módulos.

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

| Label            | Path                                                         |
| ---------------- | ------------------------------------------------------------ |
| Inicio           | `paths.home` (`/`)                                           |
| Usuarios         | `paths.v1.user.profilesList` (`/v1/user-profiles`)           |
| Uploads          | `paths.v1.upload.list` (`/v1/upload-manager`)                |
| Formularios      | `paths.v1.form.list` (`/v1/form-constructor`)                |
| Nav              | `paths.v1.nav.list` (`/v1/nav-manager`)                       |
| Menus            | `paths.v1.menu.list` (`/v1/menu-manager`)                     |
| Google Calendars | `paths.v1.form.render('calendario')` (`/v1/form/calendario`) |

Dropdown do usuário (fim da barra, só autenticado):

| Label          | Path                              |
| -------------- | ---------------------------------- |
| Editar Perfil  | `paths.v1.account.profile` (`/v1/account/profile`)   |
| Segurança      | `paths.v1.account.security` (`/v1/account/security`) |
| Sair           | `logout()` (`AuthContext`), sem rota própria         |

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
