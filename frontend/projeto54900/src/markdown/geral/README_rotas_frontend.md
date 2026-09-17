[`README.md`](../README.md)

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

## v1 — Módulo de auth, usuários, uploads, formulários, listas, nav e menu

Fonte: `routes/v1/index.tsx` — agrupa `auth.routes.tsx`, `user.routes.tsx`,
`upload.routes.tsx`, `form.routes.tsx`, `list.routes.tsx`, `nav.routes.tsx` e
`menu.routes.tsx` sob o prefixo `/v1`, espelhando o grupo `api/v1` do backend
(`app/Config/Routes.php`).

| Path  | Elemento              | Observação                                                 |
| ----- | --------------------- | ---------------------------------------------------------- |
| `/v1` | _(loader → redirect)_ | Redireciona para `paths.v1.user.list` (`/v1/user-manager`) |

### auth

Fonte: `routes/v1/auth.routes.tsx` — espelha `api/v1/auth`. Só `login` tem
tela própria; `refresh`/`logout`/`me` são chamados pelo `AuthContext`, sem
rota/página dedicada.

| Path        | Elemento (lazy)           | Observação                              |
| ----------- | ------------------------- | --------------------------------------- |
| `/v1/login` | `pages/v1/auth/LoginPage` | Tela de login (link "Entrar" da navbar) |

### user-manager

Fonte: `routes/v1/user.routes.tsx` — espelha `api/v1/user-manager` (+ `-view`).
Páginas organizadas por ação, seguindo [`README_paginas_modulo.md`](README_paginas_modulo.md)
(`pages/v1/user/user-manager/<Acao>Page.tsx`).

| Path                          | Elemento (lazy)                         | Observação                                                                                                                                                                                                            |
| ----------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/v1/user-manager`            | `pages/v1/user/user-manager/GetAllPage` | Listagem — **stub em branco**, aguardando a fábrica de listas                                                                                                                                                         |
| `/v1/user-manager/create`     | `pages/v1/user/user-manager/CreatePage` | **Stub em branco** — aguardando a fábrica de formulários (ver CLAUDE.md do frontend)                                                                                                                                  |
| `/v1/user-manager/:id`        | `pages/v1/user/user-manager/GetPage`    | Detalhe                                                                                                                                                                                                               |
| `/v1/user-manager/update/:id` | `pages/v1/user/user-manager/UpdatePage` | **Stub em branco**, mesmo motivo acima. Path corrigido de `:id/update` para `update/:id` (2026-09-15) — alinhado com o padrão `form-constructor`/`list-constructor`                                                   |
| `/v1/register`                | `pages/v1/user/register/RegisterPage`   | Fluxo composto (não é ação de 1 tabela só): cria login em `user-manager`, depois perfil em `user-profiles`, ligados por `user_manager_id`. Wizard de 2 cards (não abas) sobre os builds `seguranca-novo` e `cadastro` |

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
| `/v1/form/:slug`                  | `pages/v1/form/FormRendererPage`        | Renderiza **qualquer** formulário publicado pela slug e submete para o `submit_endpoint` gravado. Ex.: `/v1/form/calendario` (link "Calendário" da navbar), `/v1/form/cadastro`, `/v1/form/seguranca-novo` |

> O wizard de cadastro (login + perfil) não é mais deste módulo — mudou para
> `/v1/register` (`pages/v1/user/register/RegisterPage.tsx`), ver seção
> "user-manager" acima. É um fluxo composto do módulo `user`, não do módulo `form`.

### list — Construtor de listas

Fonte: `routes/v1/list.routes.tsx` — espelha `api/v1/list-manager`,
`list-columns`, `list-actions`, nos mesmos moldes do módulo `form` acima
(árvore `list_manager → [list_columns, list_actions]`).

| Path                               | Elemento (lazy)                     | Observação                                                                                                                                                        |
| ----------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/v1/list-constructor`             | `pages/v1/list/ListConstructorPage` | Escolhe uma `list_manager` semeada, mostra as definições de `list_columns`/`list_actions` e renderiza a grid de verdade (dados reais do `api_get_endpoint` daquele manager) |
| `/v1/list-constructor/create`      | `pages/v1/list/ListBuilderPage`     | Nova listagem — árvore `list_manager → [list_columns, list_actions]`, nos moldes do `FormBuilderPage`                                                            |
| `/v1/list-constructor/update/:id`  | `pages/v1/list/ListBuilderPage`     | Mesma tela em modo edição: hidrata a árvore do registro existente (GET `list-manager/get/{id}` + find por `list_manager_id` em `list-columns`/`list-actions` — sem view, diferente do form). Ver `README_list_constructor.md` |

### nav — Config/branding do app/navbar

Fonte: `routes/v1/nav.routes.tsx` — espelha `api/v1/nav-manager` (sem `-view`;
não tem view própria). Guarda nome do app, imagem, ícone de mensagens e versão
do sistema — a "casca" em volta do Menu, não o menu em si.

| Path                         | Elemento (lazy)           | Observação                                                                                          |
| ---------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------- |
| `/v1/nav-manager`            | `pages/v1/nav/GetAllPage` | Listagem **real** (tabela própria do módulo, não usa `DataTable`/`Pagination` — stubados)           |
| `/v1/nav-manager/create`     | `pages/v1/nav/CreatePage` | **Stub em branco** — aguardando a fábrica de formulários                                            |
| `/v1/nav-manager/:id`        | `pages/v1/nav/GetPage`    | Detalhe real; botão "Ver itens" leva para `/v1/menu-manager?nav_manager_id=:id`                     |
| `/v1/nav-manager/update/:id` | `pages/v1/nav/UpdatePage` | **Stub em branco**, mesmo motivo acima. Path corrigido (2026-09-15), ver nota em user-manager acima |

### menu — Árvore de itens navegáveis

Fonte: `routes/v1/menu.routes.tsx` — espelha `api/v1/menu-manager` (sem
`-view`). Cada item pertence a um `nav-manager` (FK `nav_manager_id`) e pode
ter um `parent_id` (submenu). Antes de 2026-09-13 esta tabela se chamava
`menu_items` e a config de branding se chamava `menu_manager` — os nomes
foram trocados para refletir que esta é a árvore de menu de verdade.

| Path                          | Elemento (lazy)            | Observação                                                                           |
| ----------------------------- | -------------------------- | ------------------------------------------------------------------------------------ |
| `/v1/menu-manager`            | `pages/v1/menu/GetAllPage` | Listagem **real**; aceita `?nav_manager_id=` para restringir aos itens de 1 nav      |
| `/v1/menu-manager/create`     | `pages/v1/menu/CreatePage` | **Stub em branco**; lê `?nav_manager_id=` para pré-preencher o título quando existir |
| `/v1/menu-manager/:id`        | `pages/v1/menu/GetPage`    | Detalhe real; "Voltar" religa em `?nav_manager_id=` do próprio item                  |
| `/v1/menu-manager/update/:id` | `pages/v1/menu/UpdatePage` | **Stub em branco**. Path corrigido (2026-09-15), ver nota em user-manager acima      |

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
string solta. **A navbar é dinâmica**: `hooks/useSiteMenu.ts` busca o
`nav-manager` ativo e sua árvore de `menu-manager` (grupo sem `react_route`
vira dropdown, item com `react_route` vira link); em erro ou lista vazia,
`useSiteMenu` volta `null` e o `Navbar` cai no `FALLBACK_NAV` estático abaixo,
que espelha a árvore semeada pelo `MenuManagerSeeder`.

| Label (FALLBACK_NAV) | Path                                                         | Observação                |
| ---------------------- | ------------------------------------------------------------ | --------------------------- |
| Inicio                | `paths.home` (`/`)                                           |                            |
| User → Usuarios       | `paths.v1.user.list` (`/v1/user-manager`)                    | Dropdown "User"            |
| User → Cadastro       | `paths.v1.user.register` (`/v1/register`)                    | Dropdown "User"            |
| Upload                | `paths.v1.upload.list` (`/v1/upload-manager`)                | Link direto                |
| Form → Formularios    | `paths.v1.form.list` (`/v1/form-constructor`)                | Dropdown "Form"            |
| Form → Calendário | `paths.v1.form.render('calendario')` (`/v1/form/calendario`) | Dropdown "Form"      |
| Nav                   | `paths.v1.nav.list` (`/v1/nav-manager`)                      | Link direto                |
| Menu                  | `paths.v1.menu.list` (`/v1/menu-manager`)                    | Link direto                |
| Entrar                | `paths.v1.auth.login` (`/v1/login`)                          | Link direto                |

> `paths.v1.list.list` (`/v1/list-constructor`) não está em nenhum link de
> navbar (nem dinâmico, nem `FALLBACK_NAV`) — acesso só por URL direta.

[`README.md`](../README.md)

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
