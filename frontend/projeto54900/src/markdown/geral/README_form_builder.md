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

| Dado    | Chamada                    | Endpoint                                     |
| ------- | -------------------------- | -------------------------------------------- |
| Tabelas | `dbSchema.tables()`        | `GET api/v1/db-schema/tables`                |
| Colunas | `dbSchema.columns(tabela)` | `GET api/v1/db-schema/columns/{tabela}`      |
| Perfis  | `src` do campo `select`    | `GET {apiBaseUrl}/v1/user-roles/get-no-pagination` — o próprio `<FormGrid>` carrega |

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

Renderizado por
**`<FormGrid schema={managerSchema(tabela, manager, atualizarManager)} />`**.
`managerSchema` (função pura, fora do componente) devolve um `FormGridSchema`.
Estado local `managers: Record<string, ManagerLocal>`; editado por
`atualizarManager`. Campos (fora `id`, timestamps):

| Campo             | `col` | `required` UI | Banco / `CreateRequest` | Tipo no schema |
| ----------------- | ----- | ------------- | ----------------------- | -------------- |
| `title`           | 12    | sim | `NULL` / `permit_empty` | `text` — cabeçalho no topo. **slug acompanha** enquanto `slugAuto` (`slugify` no `onChange`) |
| `profile_group`   | 12    | sim | `NULL` / `permit_empty` | `select` **`multiple`**, `src` = `${apiBaseUrl}/v1/user-roles/get-no-pagination`, `valueKey: 'slug'`, `labelKey: 'name'`. `values` = `parseStringList(m.profile_group)`; `onChangeMultiple` grava `toStringList(values)`; vazio → `''`. Ver [`README_campo_json_montado.md`](README_campo_json_montado.md). |
| `slug`            | 6     | sim | `NOT NULL` UNIQUE / `required` | `text` — identidade do formulário. Nasce vazio; acompanha o Título enquanto `slugAuto`; ao editar à mão zera `slugAuto` |
| `status`          | 6     | sim | `NOT NULL` DEFAULT `draft` / não enviado no create | `select` estático `draft`/`active`/`inactive` — sempre nasce `draft`; `required` só barra o botão `×` |
| `react_route`     | 12    | sim | `NULL` / `permit_empty` | `text` |
| `submit_endpoint` | 4     | sim | `NULL` / `permit_empty` | `text` |
| `http_method`     | 4     | sim | `NULL` DEFAULT `POST` / `permit_empty\|in_list` | `select` estático GET/POST/PUT/PATCH/DELETE — sempre nasce `POST`; `required` só barra o botão `×` |
| `version`         | 4     | sim (decorativo) | `NOT NULL` DEFAULT 1 / `permit_empty\|is_natural_no_zero` | `text` `inputMode: 'numeric'`; `onChange` faz `parseInt \|\| 1` → estado nunca fica vazio, `required` nunca dispara |
| `description`     | 12    | não | `NULL` / `permit_empty` | `textarea` (`rows: 2`, `showCounter: true` — contagem simples, sem `maxLength`) |

### Subcard GRUPOS — `form_groups`

Renderizado por
**`<FormGrid schema={grupoSchema(tabela, grupo, atualizarGrupo)} />`** mais um
`<IconSelect>` ao lado (o FormGrid não tem seletor de ícone). Estado local
`grupos: Record<string, GrupoLocal[]>`.

| Campo         | `col` | Tipo no schema                                            |
| ------------- | ----- | -------------------------------------------------------- |
| `title`       | 12    | `text` **`required`** (`NOT NULL` no banco) — **slug acompanha** (slugAuto) |
| `slug`        | 6     | `text`                                                  |
| `sort_order`  | 6     | `text` `inputMode: 'numeric'`                           |
| `collapsed`   | 12    | `checkbox` de 1 opção (`Recolhido`), controlado por array |
| `description` | 12    | `textarea` (`rows: 2`, `showCounter: true` — contagem simples) |
| `icon`        | —     | `<IconSelect>` fora do `<FormGrid>` (componente próprio) |

## Decisões de UI já tomadas

- **Campos via `<FormGrid>`**, não markup à mão — ver
  [`README_render_via_formgrid.md`](README_render_via_formgrid.md). A página só
  monta o schema; a fábrica renderiza grade, validação e serialização.
- **Slug automático**: `slug` nasce **vazio** (`managerInicial()`). Enquanto
  `slugAuto` for `true`, digitar o **Título** reescreve o `slug`
  (`slugify(title)` de [`@/utils/slug`](../../utils/slug.ts) no `onChange` —
  igual ao subcard GRUPOS com o `title` do grupo). Flag `slugAuto` só de UI;
  vira `false` ao editar o `slug` à mão. `slug` é obrigatório (`NOT NULL` +
  `required` no `CreateRequest`); a validação de envio entra quando o construtor
  ganhar `submit`.
- **Campos obrigatórios**: `required: true` no schema do `<FormGrid>` (todos os
  tipos aceitam) — pinta `*` no label e valida no `blur` (`"<label> é
  obrigatório"` + `is-invalid`). É **regra de produto do construtor**, mais
  estrita que o banco: hoje só `form_manager.slug` e `form_groups.title` são
  `NOT NULL` sem default; os demais marcados (`title`, `profile_group`,
  `react_route`, `submit_endpoint`, `http_method`, `status`, `version`) são
  `NULL` ou têm default no banco e `permit_empty` no `CreateRequest`. Enquanto o
  backend não for endurecido, a API ainda aceita esses campos vazios. Bloqueio
  de envio real só quando o construtor ganhar `submit`.
- **`profile_group`**: par `parseStringList` / `toStringList` de
  [`@/utils/jsonList`](../../utils/jsonList.ts).
- **Tipos e defaults**: `src/pages/v1/form/formBuilder.model.ts` (`ManagerLocal`,
  `managerInicial`, `GrupoLocal`, `grupoInicial`, `toTabela`, `toColuna`).
- **Sem persistência**: nenhum `submit`/`create` ainda. Só `useState`.
- **Layout**: página em `.container`; `col` do schema vira `col-md-N` (padrão do
  FormGrid).

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
src/pages/v1/form/FormBuilderPage.tsx     a página — estado + montagem de schema
src/pages/v1/form/formBuilder.model.ts    tipos, defaults, mappers (toTabela/toColuna)
src/utils/slug.ts                         slugify() (slug automático)
src/utils/jsonList.ts                     parseStringList()/toStringList() (profile_group)
src/services/v1/dbSchema.ts               tables() / columns(tabela)
src/components/ui/FormGrid/Input.tsx      a fábrica <FormGrid> (todos os campos)
src/components/ui/IconSelect.tsx          seletor de ícone dos grupos
src/routes/v1/form.routes.tsx             rota lazy
```

O campo "Grupo de perfil" não usa `services/v1/userRoles.table.ts` — o
`<FormGrid>` (`select` com `src`) faz o GET direto. O service continua
disponível para outros consumos.

Backend do `user-roles` (módulo read-only, espelha `User/UserManager`):
`app/Models/V1/User/UserRoles/`, `app/Services/V1/User/UserRoles/`,
`app/Controllers/Api/V1/User/UserRoles/`,
`app/Config/Routes/Api/v1/User/UserRoles/EndpointTable.php` (só rotas de leitura).

---

[◄ Índice da base de conhecimento](../README.md)
