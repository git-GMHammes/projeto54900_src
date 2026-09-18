[◄ Índice da base de conhecimento](../README.md)

---

# Node — comandos do frontend e mapa dos módulos

Frontend **React 19 + Vite 6 + TypeScript** (`C:/laragon/www/js/habilidade/projeto54900/src/frontend/projeto54900`).
Este documento cobre, nesta ordem:

1. como **instalar o Node e as dependências** (primeira vez) e **subir o app** em desenvolvimento;
2. como gerar o **BUILD** (`dist/`) e publicá-lo num servidor estático;
3. **para que serve cada módulo** de `src/`.

Complementa o [`CLAUDE.md`](../../../CLAUDE.md) do frontend — não o substitui.

---

## 1. Primeira vez — instalar o Node e subir o app

Frontend **React 19 + Vite 6 + TypeScript** exige **Node >= 20.19** no host.
Siga os passos em ordem; o `npm run dev` só funciona depois do `npm install`.

### 1.1 Checar o Node instalado

Abra um terminal (PowerShell ou Bash) e rode:

```bash
node -v
npm -v
```

O `node -v` precisa retornar **20.19.0 ou maior** (ex.: `v20.19.x`, `v22.x`).
Se retornar uma versão **menor** (ex.: `v20.18.1`) ou erro de comando não
encontrado, instale/atualize o Node no passo 1.2.

### 1.2 Atualizar o Node (opcional)

O requisito **`>= 20.19`** do `package.json` **não bloqueia** a instalação:
não há `engine-strict`, então o `npm install` emite só um **aviso** — e o Vite 6
aceita Node 20.x. Com o Node atual (ex.: `v20.18.1`) **já dá para ir direto ao
1.3** sem atualizar nada.

Se mesmo assim quiser deixar o Node na versão exigida:

1. Baixar o instalador **.msi** da versão **LTS** em `https://nodejs.org`.
2. Executar e instalar **por cima** da versão atual (o instalador substitui e
   mantém o `PATH`; marcar "Add to PATH" se perguntar).
3. Reabrir o terminal e conferir:

```bash
node -v
```

> Este PC instalou o Node pelo instalador oficial (`C:\Program Files\nodejs`)
> e **não usa `nvm`**. Quem usa `nvm-windows` faria `nvm install 22` +
> `nvm use 22`.

### 1.3 Instalar as dependências (primeira vez)

Cria a pasta `node_modules/` a partir do `package.json`:

```bash
cd C:/laragon/www/js/habilidade/projeto54900/src/frontend/projeto54900
npm install
 
```

> Repita o `npm install` apenas quando o `package.json` mudar ou a pasta
> `node_modules/` for apagada.
>
> Se aparecer o aviso **`EBADENGINE`** sobre a versão do Node, pode ignorar —
> é só aviso, não erro (o projeto não usa `engine-strict`).

### 1.4 Subir o app (dia a dia)

```bash
cd C:/laragon/www/js/habilidade/projeto54900/src/frontend/projeto54900
npm run dev
 
```

- Sobe o **dev-server do Vite** em **http://localhost:54910/** (`strictPort`,
  `host: true`).
- **Proxy embutido** (`vite.config.ts`), some em produção:
  - `/api` -> `http://localhost:54900` — evita CORS.
  - `/ws`  -> mesmo alvo, com upgrade WebSocket.
- HMR ativo (polling, para editar os arquivos no Windows).
- Depende do backend (`docker compose up -d`) no ar para `/api` responder.

O frontend **não usa `.env`** e **não roda em container**. As chaves `VITE_*`
têm defaults em `src/config/env.ts` (`base` `/`, API `/api`, versão `v1`,
WS `/ws`) — não é preciso exportar nada para o dia a dia.

### 1.5 Pré-requisitos

| Requisito | Observação |
| --- | --- |
| Node >= 20.19 no host | roda o `npm` (dev, build, lint) |
| Backend no ar | containers do `docker-compose.yml` (`mysql`, `php`, `nginx`, `node`) publicados no host em `:54900` — alvo do proxy `/api` e `/ws` |

### 1.6 Todos os scripts (`package.json`)

| Script | Comando real | Para que serve |
| --- | --- | --- |
| `dev` | `vite` | dev-server + HMR + proxy `/api` e `/ws` |
| `build` | `tsc -b && vite build` | build de produção -> `dist/` |
| `typecheck` | `tsc -b --noEmit` | checagem de tipos (strict máximo) |
| `preview` | `vite preview` | serve o `dist/` já gerado |
| `lint` | `eslint .` | ESLint 9 + `typescript-eslint` |

---

## 2. BUILD e deploy

### 2.1 O que o build produz

`npm run build` roda `tsc -b` (falha se houver erro de tipo) e depois
`vite build`. A saída é **estática** (HTML + JS + CSS + assets com hash) e vai
para:

```
C:/laragon/www/js/habilidade/projeto54900/src/frontend/projeto54900/dist/
```

`dist/` é `.gitignore` — é artefato, gerado a cada build.

| Opção (`vite.config.ts`) | Valor | Efeito |
| --- | --- | --- |
| `build.outDir` | `dist` | pasta local, limpa a cada build (padrão do Vite) |
| `base` | `VITE_BASE_PATH` ou `/` | prefixo de **todos** os caminhos de asset no `index.html` |
| `sourcemap` | só fora de `production` | build de produção não gera `.map` |

O `base` também vira o `basename` do React Router (`config/env.ts` ->
`routerBasename`). **`base` e o caminho público onde o app é servido têm de casar.**

### 2.2 Deploy — app na raiz de um host

Cenário simples: o `dist/` vira o `DocumentRoot` (ou a raiz do site/CDN).

1. `npm run build` (usa `base: '/'`).
2. Copiar **o conteúdo** de `dist/` para o `DocumentRoot`.
3. Fallback de SPA: toda rota desconhecida serve o `index.html`.
   - **nginx:** `location / { try_files $uri $uri/ /index.html; }`
   - **Apache** (`.htaccess` na raiz, `AllowOverride All` + `mod_rewrite`):
     ```apache
     <IfModule mod_rewrite.c>
         RewriteEngine On
         RewriteBase /
         RewriteRule ^index\.html$ - [L]
         RewriteCond %{REQUEST_FILENAME} !-f
         RewriteCond %{REQUEST_FILENAME} !-d
         RewriteRule . /index.html [L]
     </IfModule>
     ```
4. A API tem de estar acessível como `/api` no mesmo host, ou o app precisa
   ser buildado com `VITE_API_BASE_URL=https://api.seu-dominio.tld/api` (e a API
   liberar **CORS** para a origem do app).

### 2.3 Deploy — app numa subpasta

Se o app é servido em `https://host/app/`:

```bash
VITE_BASE_PATH=/app/ npm run build
```

Copiar o conteúdo de `dist/` para a pasta `app/` do `DocumentRoot` e ajustar o
fallback de SPA para essa subpasta (`RewriteBase /app/` /
`try_files ... /app/index.html`).

### 2.4 Ajustes do servidor estático

- **MIME**: garantir `.js`/`.mjs` como `text/javascript` e `.css` como
  `text/css` (Apache antigo: `AddType`).
- **Cache** dos assets com hash (recomendado): `Cache-Control` longo para
  `assets/*`; **`index.html` sem cache** (`no-cache, must-revalidate`).
- **Compressão** (opcional): gzip/deflate para `text/*`, `application/javascript`,
  `application/json`, `image/svg+xml`.
- `npm run preview` **não** é servidor de produção (é o Vite); serve só para
  conferir o `dist/` antes de subir.

---

## 3. Módulos de `src/`

### 3.1 Raiz

| Arquivo | Função |
| --- | --- |
| `main.tsx` | entrypoint: importa `bootstrap.ts` e monta `<App>` com `createRoot` + `StrictMode` |
| `App.tsx` | árvore de providers: `AppConfigProvider` › `ToastProvider` › `<Suspense>` › `RouterProvider` |
| `bootstrap.ts` | **único** ponto de import do Bootstrap (CSS via SCSS + bundle JS com Popper) |
| `vite-env.d.ts` | tipos do `import.meta.env` (todas as chaves `VITE_*`) + `/// vite/client` |

### 3.2 Pastas

| Pasta | Função |
| --- | --- |
| `config/` | `env.ts` — **leitura central** de `import.meta.env`. Ninguém acessa `import.meta.env` fora daqui. Exporta `env` e `routerBasename` |
| `constants/` | `api.ts` — versões da API, nomes de grupo (`form-manager`, `db-schema`, …), endpoint-set REST padrão, defaults de paginação |
| `context/` | `AppConfigContext` (config global do app) e `ToastContext` (fila de toasts) |
| `hooks/` | `useApi` (chamada genérica com estado loading/erro), `usePagination` (sincroniza com a querystring), `useToast`, `useDebounce` |
| `layouts/` | `RootLayout` (navbar + footer) e `BlankLayout` (tela cheia, sem cromo) |
| `pages/` | telas roteadas: `Home/`, `errors/` (`NotFoundPage`, `RouteErrorPage`, `VersionPlaceholderPage`), `v1/user/*`, `v1/upload/*`, `v1/form/FormConstructorPage` |
| `routes/` | `index.tsx` (`createBrowserRouter`, `basename` = `env.basePath`), `paths.ts` (constantes de rota — **usar sempre daqui**), `v1/` (subrotas que espelham `api/v1`), `v1a/` (stub para o próximo namespace) |
| `services/` | camada HTTP, **espelho 1:1 dos endpoints** do backend — ver 3.3 |
| `components/global/` | peças reutilizáveis: `PageHeader`, `ConfirmModal`, `ToastStack`, `LoadingOverlay`, `EmptyState`. **Stubs** (placeholder tipado, aguardando fábricas): `DataTable`, `Pagination`, `FormField` |
| `components/layout/` | `Navbar` e `Footer` |
| `components/ui/FormGrid/` | **fábrica de campos dirigida por schema JSON**. `FormGrid` faz o switch por `field.type` e monta a grade Bootstrap (`col` 1-12), delegando a subcomponentes: `Input/`, `cpf/`, `cnpj/`, `cep/`, `phone/`, `moeda/`, `data/`, `hora/`, `pis/`, `placa/`, `titulo/`, `cnh/`, `processo/`, `renavam/`, `sei/`, `email/`, `textarea/`, `senha/`, `radio/`, `checkbox/`, `select/`. Helper `emitValue.ts` para os campos mascarados. Ver [`README_FormGrid.md`](README_FormGrid.md) |
| `styles/` | o **0,01%** que o Bootstrap não resolve. `_variables.scss` (overrides antes do import), `_custom.scss` (regras pontuais), `index.scss` (ordem fixa: variables → bootstrap → custom) |
| `types/` | `api.ts` (contratos compartilhados da camada de API), `vendor.d.ts` (declaração ambiente do bundle JS do Bootstrap) |
| `utils/` | `format.ts` (formatação pt-BR + `toText`), `querystring.ts`, `validation.ts`, `apiResult.ts` (`normalizeItem`/`normalizeList` — respostas entram como `unknown` e são normalizadas, sem `any`) |
| `markdown/` | esta base de conhecimento; alimenta o `CLAUDE.md` do frontend |

### 3.3 `services/` — espelho dos endpoints

| Arquivo | Espelha / função |
| --- | --- |
| `http.ts` | wrapper de `fetch`: prefixa `env.apiBaseUrl`, injeta JSON + `X-Requested-With`, lança `ApiError` |
| `resourceFactory.ts` | `createResource` — monta o endpoint-set REST padrão (`find`, `get-grouped`, `search`, `get/{id}`, `get-all`, `get-no-pagination`, `create`, `update/{id}`, `delete-soft`, `delete-restore`, `delete-hard`, `clear-deleted`). Overload `{ mutations: false }` → só leitura (grupos `-view`) |
| `formSchema.ts` | adapter: linhas achatadas da `view_form_manager` (prefixos `fm_`/`fg_`/`fr_`/`fc_`) → `FormGridSchema` por grupo (`buildConstructorSchemas`) |
| `v1/formManager.table.ts` | `api/v1/form-manager` (CRUD do formulário) |
| `v1/formManager.view.ts` | `api/v1/form-manager-view` (leitura da view achatada) |
| `v1/formGroups.table.ts` | `api/v1/form-groups` (subgrupos) |
| `v1/formRows.table.ts` | `api/v1/form-rows` (linhas, 1–12 campos) |
| `v1/formCampos.table.ts` | `api/v1/form-campos` (campos) |
| `v1/dbSchema.ts` | `api/v1/db-schema` — **read-only**, 3 rotas próprias (`tables`, `columns/{t}`, `describe/{t}`). Alimenta os selects do construtor com nomes de coluna reais |
| `v1/userManager.table.ts` / `v1/userManager.view.ts` | módulo User |
| `v1/uploadManager.table.ts` / `.upload.ts` / `.view.ts` | módulo Upload (o `.upload.ts` é multipart) |
| `v1/index.ts` | barrel dos services da v1 |

### 3.4 Fluxo do Construtor de Formulários

`pages/v1/form/FormConstructorPage.tsx` (rota `/v1/form-constructor`, lazy em
`routes/v1/form.routes.tsx`): lê a árvore do `form_manager` de slug
`form-constructor` via `formManager.view` → converte com `buildConstructorSchemas`
(`services/formSchema.ts`) → renderiza com `<FormGrid>`. Cada submit chama
`form-<x>/create`. Os selects de coluna usam `services/v1/dbSchema.ts`.
Detalhe em [`README_form_constructor.md`](README_form_constructor.md).

---

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
