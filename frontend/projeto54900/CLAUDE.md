# CLAUDE.md — frontend/projeto54900

Frontend **React 19 + Vite 6 + TypeScript** do projeto54900. Consome a API
CodeIgniter 4 em `src/app/`. Vale para tudo dentro de `src/frontend/projeto54900/`.
Complementa os `CLAUDE.md` global e o de `src/app/` — não os substitui.

A base de conhecimento **deste** frontend fica em
[`src/markdown/README.md`](src/markdown/README.md) — ver seção "Base de conhecimento".

## Stack

| Item       | Versão                        | Observação                                        |
| ---------- | ----------------------------- | ------------------------------------------------- |
| React      | 19                            | `createRoot`, `StrictMode`                        |
| Vite       | 6                             | dev no host (`npm run dev`); build local em `dist/` |
| TypeScript | ~5.7 (strict máximo)          | `tsc -b` (solution: `tsconfig.app`/`tsconfig.node`) |
| Router     | `react-router-dom` 7          | data router (`createBrowserRouter`)               |
| UI         | **Bootstrap 5.3**             | 99,9% da interface                                |
| SCSS       | `sass` (dart)                 | só overrides de variável + `_custom.scss`         |
| Lint       | ESLint 9 + `typescript-eslint` | `npm run lint` (`recommendedTypeChecked`)        |

**TypeScript com strict máximo.** `tsconfig.app.json` liga `strict`,
`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`,
`noUnusedLocals/Parameters`, `noFallthroughCasesInSwitch`, `noImplicitReturns`,
`verbatimModuleSyntax` (use `import type`), `isolatedModules`. Alias `@/*` → `src/*`
em `tsconfig.app.json` + `vite.config.ts`. Sem `any` — respostas da API entram
como `unknown` e passam por `normalizeItem` / `normalizeList` (`utils/apiResult.ts`).
Tipos compartilhados da camada de API em `src/types/api.ts`.

## Tabelas e formulários — EM BRANCO (aguardando fábricas)

`components/global/DataTable.tsx`, `FormField.tsx` e `Pagination.tsx` são **stubs**
tipados que só renderizam um placeholder. As páginas de listagem
(`UserListPage`, `UploadListPage`) e o formulário (`UserFormPage`) mantêm a casca
(PageHeader, ações, rota) e um `<EmptyState>` no lugar da tabela/formulário; o
wiring anterior (endpoints, colunas, validação) está preservado em comentário
`// TODO(fábrica…)` no topo de cada arquivo.

Motivo: serão substituídos pela **fábrica de formulários** (FormGrid — ver
`src/markdown/geral/README_FormGrid.md`) e por uma **fábrica de listas**, ainda a
trazer. Não reimplementar DataTable/FormField/Pagination — religar via fábrica.
As páginas de detalhe (`UserViewPage`, `UploadViewPage`) e o envio de arquivo do
`UploadListPage` continuam ativos e tipados.

**Regra:** campo de formulário renderiza por schema JSON + `<FormGrid>`, não
`<input>`/`<select>`/`<label>` à mão — inclui select remoto/múltiplo. Débito
aberto: o subcard do `FormBuilderPage` ainda é markup manual. Detalhe em
[`src/markdown/geral/README_render_via_formgrid.md`](src/markdown/geral/README_render_via_formgrid.md).

## Campo com valor JSON — a UI monta, o usuário não digita

Campo cujo valor persistido é JSON (lista, objeto de config) **nunca** é editado
como JSON cru pelo usuário final: a UI oferece um controle comum (multi select,
tags, switches) e o código faz o par `montar` (estado → string JSON) / `parse`
(string → estado, tolerante — valor legado/JSON inválido/formato inesperado →
vazio). Vazio grava `''`. Opções sempre de API. Exceção: `settings_json`
(`<textarea>` de JSON de dev). Caso de referência: `profile_group` no
`FormBuilderPage`. Detalhe e regras em
[`src/markdown/geral/README_campo_json_montado.md`](src/markdown/geral/README_campo_json_montado.md).

## Regra de ouro — Bootstrap primeiro

- A UI é **99,9% Bootstrap**. Antes de escrever qualquer CSS, procure a classe
  utilitária/componente do Bootstrap que resolve.
- `styles/` é o **0,01%**: só entra o que o Bootstrap não faz de jeito nenhum.
  - `styles/_variables.scss` — overrides de variável do Bootstrap (ANTES do import).
  - `styles/_custom.scss` — regras pontuais. Se dá para fazer com classe, não escreva aqui.
  - `styles/index.scss` — ordem fixa: `variables` → `bootstrap/scss/bootstrap` → `custom`.
- Import de Bootstrap (CSS via SCSS + JS bundle com Popper) é **só** em
  `src/bootstrap.ts`. Não espalhe imports. O bundle JS não tem tipos oficiais:
  declaração ambiente em `src/types/vendor.d.ts`.
- Modo escuro: nativo do Bootstrap 5.3 (`data-bs-theme`). Não criar tema próprio.

## Convenção de rotas — espelha a API

A API versiona por namespace: `api/v1`, `api/v1a`, … (`src/app/Config/Routes.php`).
O frontend replica seco:

```
src/routes/
  index.tsx            createBrowserRouter, basename = env.basePath
  paths.ts             constantes nomeadas de rota (USE sempre daqui)
  v1/
    index.tsx          { path: 'v1', children: [...] }
    user.routes.tsx    /v1/user-manager ...   (espelha api/v1/user-manager)
    upload.routes.tsx  /v1/upload-manager ... (espelha api/v1/upload-manager)
  v1a/
    index.tsx          stub — espelha namespace Api\V1A
    README.md          como popular quando a API v1a ganhar módulos
```

- Páginas das rotas versionadas são **lazy** (`React.lazy` + `<Suspense>` no `App.tsx`).
- Path de rota sempre via `paths.ts`, nunca string solta.
- Nova versão de API → nova pasta `routes/vX/` + `services/vX/` + chave em `paths.ts`,
  no mesmo formato da `v1`.

## Camada de serviços — espelho 1:1 dos endpoints

`src/services/`:

| Arquivo                      | Espelha (backend)                                                               |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `http.ts`                    | wrapper fetch: `env.apiBaseUrl` + JSON + `X-Requested-With` + `ApiError`        |
| `resourceFactory.ts`         | endpoint-set REST padrão (`ResourceTableController` / `ResourceViewController`) |
| `v1/userManager.table.ts`    | `Routes/Api/v1/User/UserManager/EndpointTable.php`                              |
| `v1/userManager.view.ts`     | `Routes/Api/v1/User/UserManager/EndPointView.php`                               |
| `v1/uploadManager.table.ts`  | `Routes/Api/v1/Upload/UploadManager/EndpointTable.php`                          |
| `v1/uploadManager.upload.ts` | `Routes/Api/v1/Upload/UploadManager/EndpointUpload.php` (multipart)             |
| `v1/uploadManager.view.ts`   | `Routes/Api/v1/Upload/UploadManager/EndPointView.php`                           |
| `v1/index.ts`                | barrel dos services da v1                                                       |

- `createResource` tem overloads: sem opção → `ResourceWriter`; `{ mutations: false }`
  (grupos `-view`) → `ResourceReader` (só leitura). Métodos retornam `Promise<unknown>`.
- Endpoint-set padrão: `find`, `get-grouped`, `search`, `get/{id}`, `get-all`,
  `get-no-pagination`, `create`, `update/{id}`, `delete-soft`, `delete-restore`,
  `delete-hard`, `clear-deleted` — sempre com `?page=&limit=&sort=&order=`.
- Nomes de grupo/endpoint centralizados em `src/constants/api.ts`.

## Estrutura

```
src/
  main.tsx           entrypoint (bootstrap -> App)
  App.tsx            AppConfigProvider > ToastProvider > Suspense > RouterProvider
  bootstrap.ts       único ponto de import do Bootstrap
  vite-env.d.ts      /// vite/client + ImportMetaEnv (chaves VITE_*)
  types/             api.ts (contratos compartilhados), vendor.d.ts (bootstrap bundle)
  config/env.ts      leitura central de import.meta.env
  constants/api.ts   versões, grupos, endpoint-set, defaults de paginação
  routes/            ver "Convenção de rotas"
  layouts/           RootLayout (navbar+footer), BlankLayout
  pages/             Home, v1/user/*, v1/upload/*, errors/*
  components/
    global/          PageHeader, ConfirmModal, ToastStack, LoadingOverlay,
                     EmptyState  |  STUBS: DataTable, Pagination, FormField
    layout/          Navbar, Footer
  services/          ver "Camada de serviços"
  hooks/             useApi (genérico), usePagination (sync querystring), useToast, useDebounce
  context/           AppConfigContext, ToastContext
  utils/             format (pt-BR, + toText), querystring, validation, apiResult
  styles/            ver "Regra de ouro — Bootstrap primeiro"
  markdown/          base de conhecimento — ver "Base de conhecimento"
```

## Ambiente (sem container, sem `.env`)

Este projeto **não usa `.env`** (trava no `.gitignore` raiz: "Este projeto
NUNCA usa .env") e **não tem container de frontend**. As chaves expostas ao
browser começam com `VITE_` (tipadas em `src/vite-env.d.ts`), mas nada as
define: o app roda com os **defaults** de `src/config/env.ts`.

| Chave              | Default efetivo          | Uso                                   |
| ------------------ | ------------------------ | ------------------------------------- |
| `VITE_BASE_PATH`   | `/`                      | `base` do Vite + `basename` do router |
| `VITE_API_BASE_URL`| `/api`                   | prefixo de toda chamada em `http.ts`  |
| `VITE_API_VERSION` | `v1`                     | versão default dos services           |
| `VITE_WS_URL`      | `/ws`                    | WebSocket (Node)                      |
| `VITE_DEV_PORT`    | `54910`                  | porta do dev-server (`vite.config.ts`) |
| `VITE_DEV_BACKEND` | `http://localhost:54900` | alvo do proxy `/api` e `/ws` no dev   |

Para um deploy que precise de outros valores (API em outro host, app numa
subpasta), exportar as chaves `VITE_*` no shell **antes do build** — o Vite lê
variáveis prefixadas `VITE_` do processo.

## Scripts

Rodam **no host** (Node >= 20.19). Nenhuma variável precisa ser exportada — os
defaults de `env.ts` cobrem o dev e o build padrão.

```
npm run dev        # dev-server Vite em http://localhost:54910/ (proxy /api e /ws -> :54900)
npm run build      # tsc -b && vite build -> dist/
npm run preview    # serve o dist/ já gerado (confere o build)
npm run typecheck  # tsc -b --noEmit (strict máximo)
npm run lint       # eslint .
```

O backend (API PHP + WebSocket) continua nos containers do `docker-compose.yml`,
publicados no host em `:54900` — é o alvo do proxy do dev-server.

## Build e deploy

- `npm run build` → `tsc -b` (falha se houver erro de tipo) + `vite build`.
  Saída **estática** em `src/frontend/projeto54900/dist/` (`build.outDir` no
  `vite.config.ts`). `dist/` é `.gitignore`.
- **Deploy:** publicar o **conteúdo de `dist/`** no servidor estático (nginx,
  Apache, CDN). O app é SPA — o servidor precisa de fallback para `index.html`
  em rota desconhecida. App numa subpasta: buildar com
  `VITE_BASE_PATH=/essa/subpasta/` para casar os caminhos dos assets.
- O `docker-compose.yml` **não** serve mais o frontend; o nginx de lá continua
  só para a API PHP e o proxy `/ws`.

## Base de conhecimento

Fica em [`src/markdown/`](src/markdown/). Tem a **mesma função** da base do
backend (`src/app/markdown/`), mas este conteúdo alimenta **este** `CLAUDE.md` —
é onde ficam registradas as decisões, convenções e o funcionamento interno de
componentes do frontend que não cabem aqui por extenso.

- O índice é [`src/markdown/README.md`](src/markdown/README.md): por tópico, uma
  palavra-chave + frase curta, um bloco de resumo e o link para o arquivo
  completo (nas subpastas, ex.: `geral/`).
- **Todo markdown novo em `src/markdown/` obriga a atualizar `src/markdown/README.md`**
  (nova entrada no índice + bloco de resumo + link). Procedimento em
  [`src/markdown/geral/README_atualiza_readme.md`](src/markdown/geral/README_atualiza_readme.md).
- Cada markdown da base começa e termina com um link para `src/markdown/README.md`.
- Quando um tópico da base vira regra de trabalho, ele também é resumido **neste
  `CLAUDE.md`**, com link para o markdown completo — este arquivo é o ponto de
  entrada; a base é o detalhamento.

Tópicos atuais: `atualizacao` (manutenção da base) e `formgrid`
([`README_FormGrid.md`](src/markdown/geral/README_FormGrid.md) — fábrica de
campos de formulário dirigida por JSON, origem `projeto55100`). Decisão de
linguagem já tomada: o frontend agora **é TypeScript**, o FormGrid entra como
`.tsx`; falta o trabalho de portabilidade em si (imports `@/`, remover deps do
55100, casar `select` remoto com `http.ts`).

## Planos de tarefa

Segue o `src/app/CLAUDE.md`: os arquivos do fluxo de plano deste projeto vão em
`src/writable/claude/` (não no local global). Modelo e regras: `CLAUDE.md` global.

## Restrições herdadas

- `node_modules/` e `dist/`: listar sim; ler/editar/deletar só com autorização
  expressa (regra global de pastas restritas). O projeto **não tem `.env`** nem
  container de frontend — config pelos defaults de `src/config/env.ts` (ver
  "Ambiente").
- `npm install` / `npm update`: permitido neste projeto (a trava de Composer é
  do projeto55100/KingHost, não se aplica aqui). Ainda assim, propor plano antes.
