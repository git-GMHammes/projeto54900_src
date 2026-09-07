[◄ Índice da base de conhecimento](../README.md)

---

# Construtor de Formulários (`/v1/form-constructor`)

Página que **cria formulários dinâmicos gravando na própria API do módulo Form**.
Ela não tem schema fixo no código: lê a definição do formulário `form-constructor`
da view `view_form_manager` (JSON) e renderiza com `<FormGrid>`. O resultado
visual é equivalente a `src/public/form_test.html` (títulos de seção, linhas
`row g-3`, colunas `col-md-N` de 1/2/3 campos).

## Origem dos dados — o seed

`src/app/Database/Seeds/FormConstructorSeeder.php` popula, **via os Processors do
módulo Form** (mesmo caminho das rotas REST), um `form_manager` de slug
`form-constructor` com 4 grupos:

| Grupo (`fg_slug`) | Descreve os campos de | Envia para                         |
| ----------------- | --------------------- | ---------------------------------- |
| `formulario`      | `form_manager`        | `POST /api/v1/form-manager/create` |
| `grupos`          | `form_groups`         | `POST /api/v1/form-groups/create`  |
| `linhas`          | `form_rows`           | `POST /api/v1/form-rows/create`    |
| `campos`          | `form_campos`         | `POST /api/v1/form-campos/create`  |

Os campos `*_id` são `select` com `select_config_json.src` apontando para
`/api/v1/form-<x>/get-no-pagination` (o `FormGrid select` faz `fetch` próprio;
em dev o Vite faz proxy de `/api`).

Rodar (host, container do projeto):

```
podman compose exec php php spark db:seed FormConstructorSeeder
```

O seed é idempotente: se `form-constructor` já existe, faz `delete-hard`
(CASCADE apaga grupos/linhas/campos) e recria.

## Fluxo da página

1. `formManagerView.getGrouped({ fm_slug: ['form-constructor'] }, { limit: 1000 })`.
2. `normalizeList` → linhas da view (1 por campo).
3. `buildConstructorSchemas(rows)` (`src/services/formSchema.ts`) agrupa por
   `fg_slug`, ordena por `sort_order` e converte cada coluna `fc_*` na prop
   equivalente do `AnyFieldSchema`. Colunas `*_json` chegam como string (driver
   MySQLi) ou objeto — ambos tratados. `fc_help_text` vira `title` (tooltip),
   pois o `FormGrid` não tem slot de ajuda.
4. Cada grupo vira um `<form>` com um `<FormGrid>` e um botão. No submit:
   `new FormData(form)` → objeto (`name[]` de checkbox booleano → `1`; strings
   vazias descartadas) → `form-<x>/create`. Sucesso → toast + `form.reset()` +
   _remount_ do `<FormGrid>` do grupo filho (bump de `key`) para o `select` do
   `parent_id` re-buscar.

## Arquivos

```
src/services/v1/formManager.table.ts   formManager.view.ts
src/services/v1/formGroups.table.ts    formRows.table.ts    formCampos.table.ts
src/services/v1/index.ts               (barrel — +5 exports)
src/constants/api.ts                   (+5 grupos em API_GROUPS)
src/services/formSchema.ts             adapter view -> FormGridSchema
src/pages/v1/form/FormConstructorPage.tsx
src/routes/v1/form.routes.tsx          (lazy)  + routes/v1/index.tsx  + routes/paths.ts
```

## Limitações conhecidas

- `help_text` → `title` (não há slot de ajuda no `FormGrid`).
- `get-no-pagination` de `form-groups`/`form-rows` lista também os registros do
  próprio construtor.
- Sem fallback SPA no nginx para `/frontend/projeto54900/` (pendência de infra do
  `CLAUDE.md` do frontend) — usar `npm run dev`.

---

[◄ Índice da base de conhecimento](../README.md)
