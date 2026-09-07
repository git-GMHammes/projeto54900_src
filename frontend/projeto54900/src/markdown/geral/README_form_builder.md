[◄ Índice da base de conhecimento](../README.md)

---

# Construtor novo — `FormBuilderPage` (`/v1/form-constructor`)

Construtor que estamos montando juntos, do zero. **Não** é a página anterior
(`FormConstructorPage`, dirigida por seed + `view_form_manager`) — esta lê o
schema real do banco por introspecção e, por ora, mantém **tudo só em estado
local: nada é persistido**.

- Rota: `routes/v1/form.routes.tsx` → `form-constructor` → `FormBuilderPage` (lazy).
- Arquivo: [`src/pages/v1/form/FormBuilderPage.tsx`](../../pages/v1/form/FormBuilderPage.tsx).
- Árvore alvo: `form_manager` 1:N `form_groups` 1:N `form_rows` 1:N `form_campos`.

## Fonte dos dados — sem lista estática

| Dado    | Chamada                    | Endpoint                                |
| ------- | -------------------------- | --------------------------------------- |
| Tabelas | `dbSchema.tables()`        | `GET api/v1/db-schema/tables`           |
| Colunas | `dbSchema.columns(tabela)` | `GET api/v1/db-schema/columns/{tabela}` |

`dbSchema` vem de `@/services/v1`. As colunas são buscadas ao selecionar a
tabela e ficam em cache no estado (`ainda não exibidas na tela` — reservadas
para quando o corpo dos campos existir).

## Estrutura da tela (estado atual)

1. **Card seletor** — um `<FormGrid>` com um `select multiple` (`rows=10`,
   `valueKey/labelKey = name`) listando todas as tabelas do banco. `onChangeMultiple`
   → `handleTabelas`.
2. **Um card por tabela escolhida** (`tabelas.map`):
   - **`card-header`**: só o nome da tabela (`fw-semibold text-nowrap`). Sem mais nada.
   - **`card-body`**:
     - **Subcard `FORMULÁRIO`** — campos de `form_manager` (1:1 com a tabela).
     - **Subcard(s) `GRUPOS`** — campos de `form_groups`, N por tabela, com botão `+`
       (`adicionarGrupo`).

### Subcard FORMULÁRIO — `form_manager`

Estado local `managers: Record<string, ManagerLocal>` (chave = nome da tabela),
inicializado em `handleTabelas`; editado por `atualizarManager`. Campos (fora
`id`, `created_at`, `updated_at`, `deleted_at`):

| Campo             | Coluna (`col-*` responsivo) | Controle                                         |
| ----------------- | --------------------------- | ------------------------------------------------ |
| `name`            | `col-12`                    | input — **slug acompanha** (slugAuto)            |
| `slug`            | `col-12 col-sm-6`           | input (UNIQUE no banco)                          |
| `status`          | `col-12 col-sm-6`           | select `draft` / `active` / `inactive`           |
| `title`           | `col-12 col-sm-6`           | input                                            |
| `subtitle`        | `col-12 col-sm-6`           | input                                            |
| `profile_group`   | `col-12 col-sm-6`           | input                                            |
| `react_route`     | `col-12 col-sm-6`           | input                                            |
| `submit_endpoint` | `col-12 col-sm-8`           | input                                            |
| `http_method`     | `col-6 col-sm-4`            | select GET/POST/PUT/PATCH/DELETE (def. POST)     |
| `version`         | `col-6 col-sm-4`            | number (def. 1)                                  |
| `description`     | `col-12`                    | textarea                                         |
| `settings_json`   | `col-12`                    | textarea monospace — JSON livre de layout/estilo |

### Subcard GRUPOS — `form_groups`

Estado local `grupos: Record<string, GrupoLocal[]>`; `adicionarGrupo` /
`atualizarGrupo`. Campos (fora `id`, `form_manager_id`, timestamps):

| Campo         | Coluna (`col-*` responsivo) | Controle                              |
| ------------- | --------------------------- | ------------------------------------- |
| `title`       | `col-12`                    | input — **slug acompanha** (slugAuto) |
| `slug`        | `col-12 col-sm-6`           | input                                 |
| `icon`        | `col-12 col-sm-6`           | `<IconSelect>`                        |
| `sort_order`  | `col-6 col-sm-4`            | number                                |
| `collapsed`   | `col-6 col-sm-8`            | switch                                |
| `description` | `col-12`                    | textarea                              |

## Decisões de UI já tomadas

- **Slug automático**: enquanto não editado à mão, `slug` = `slugify(name/title)`.
  Flag `slugAuto` só de UI (não existe nas tabelas); vira `false` ao editar o slug.
- **Sem persistência**: nenhum `submit`/`create` ainda. Só `useState`.
- **Layout**: página em `.container` (largura de container, não coluna fixa).
  Grids dos subcards responsivos — `col-12` no celular, proporção original a
  partir de `sm` (576px). Regra de ouro do frontend: só classes Bootstrap.
- **`slugify`**: `NFD` → remove diacríticos → lowercase → `[^a-z0-9]+` vira `-`.
- Subcards de `form_manager` e `form_groups` usam a mesma casca:
  `card bg-body-tertiary` + `card-body py-2` + `row g-2` + `form-control-sm`
  - `form-label mb-1 small`. Manter esse padrão nos próximos subcards.

## Próximos passos (a fazer)

### 1. Linhas — `form_rows` (subcard dentro de cada GRUPO)

Onde se define **a ordem e a organização em colunas por linha**. É a linha do
grid Bootstrap em que os campos serão distribuídos.

| Campo        | Tipo           | Observação                        |
| ------------ | -------------- | --------------------------------- |
| `sort_order` | `int` NOT NULL | ordem da linha dentro do grupo    |
| `label`      | `varchar(255)` | rótulo opcional da linha          |
| `gutter`     | `varchar(8)`   | espaçamento entre colunas (`g-*`) |
| `note`       | `varchar(255)` | nota interna                      |

(`id`, `form_group_id`, timestamps ficam de fora — como nos outros.)

### 2. Campos — `form_campos` (subcard dentro de cada LINHA)

Os campos em si. Colunas principais: `sort_order`, `field_type` (enum),
`col` (`tinyint` 1-12), `label`, `field_name`, `field_key`, `placeholder`,
`default_value`, `help_text`, flags (`required`, `disabled`, `read_only`,
`is_hidden`, `no_numbers`, `no_letters`, `strong_password`, `inline`, …),
`max_length`/`min_length`, `pattern`, `input_mode`, `autocomplete`,
`min_date`/`max_date`, `rows_qty`, e vários `*_json` (`options_json`,
`datalist_json`, `select_config_json`, `style_json`, `attributes_json`, …).
Mesma casca de subcard dos itens acima.

### Observação de nomenclatura (decidir ao religar)

- A tabela chama-se **`form_campos`** (português) enquanto as irmãs são
  `form_manager`, `form_groups`, `form_rows` (inglês) — quebra o padrão.
  Avaliar renomear para `form_fields`.
- O enum `field_type` mistura inglês (`text`, `password`, `email`, `textarea`,
  `select`, `radio`, `checkbox`), português (`senha`, `data`, `hora`, `moeda`) —
  com `password`/`senha` duplicando o mesmo tipo — e documentos BR (`cpf`,
  `cnpj`, `phone`, `cep`, `pis`, `placa`, `titulo`, `cnh`, `processo`,
  `renavam`, `sei`). Padronizar ao conectar com o `<FormGrid>` (ver
  [`README_FormGrid.md`](README_FormGrid.md), que cobre 21 tipos).

## Arquivos

```
src/pages/v1/form/FormBuilderPage.tsx     a página
src/services/v1/dbSchema.ts               tables() / columns(tabela)
src/components/ui/IconSelect.tsx          seletor de ícone dos grupos
src/components/ui/FormGrid/Input.tsx      o select do card seletor
src/routes/v1/form.routes.tsx             rota lazy
```

---

[◄ Índice da base de conhecimento](../README.md)
