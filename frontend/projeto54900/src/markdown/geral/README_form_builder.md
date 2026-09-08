[◄ Índice da base de conhecimento](../README.md)

---

# Construtor novo — `FormBuilderPage` (`/v1/form-constructor`)

Construtor que estamos montando juntos, do zero. **Não** é a página anterior
(`FormConstructorPage`, dirigida por seed + `view_form_manager`) — esta lê o
schema real do banco por introspecção e, por ora, mantém **tudo só em estado
local: nada é persistido**.

- Rota: `routes/v1/form.routes.tsx` → `form-constructor` → `FormBuilderPage` (lazy).
- Arquivo: [`src/pages/v1/form/FormBuilderPage.tsx`](../../pages/v1/form/FormBuilderPage.tsx).
- Árvore alvo: `form_manager` 1:N `form_groups` 1:N `form_rows` 1:N `form_fields`.

## Fonte dos dados — sem lista estática

| Dado    | Chamada                    | Endpoint                                                                            |
| ------- | -------------------------- | ----------------------------------------------------------------------------------- |
| Tabelas | `dbSchema.tables()`        | `GET api/v1/db-schema/tables`                                                       |
| Colunas | `dbSchema.columns(tabela)` | `GET api/v1/db-schema/columns/{tabela}`                                             |
| Perfis  | `src` do campo `select`    | `GET {apiBaseUrl}/v1/user-roles/get-no-pagination` — o próprio `<FormGrid>` carrega |

`dbSchema` vem de `@/services/v1`. As colunas são buscadas ao selecionar a
tabela e ficam em cache no estado (`colunas: Record<string, ColunasState>`) —
consumidas pelo select **Colunas** de cada LINHA (ver subcard LINHAS).

## Estrutura da tela (estado atual)

1. **Card seletor** — um `<FormGrid>` com um `select multiple` (`rows=10`,
   `valueKey/labelKey = name`) listando todas as tabelas do banco. `onChangeMultiple`
   → `handleTabelas`.
2. **Um card por tabela escolhida** (`tabelas.map`):
   - **`card-header`**: só o nome da tabela (`fw-semibold text-nowrap`). Sem mais nada.
   - **`card-body`**:
     - **Subcard `FORMULÁRIO`** — campos de `form_manager` (1:1 com a tabela).
     - **Subcard(s) `GRUPOS`** — campos de `form_groups` + `<IconSelect>`, N por
       tabela, com botão `[+]` (`adicionarGrupo`).
       - **Subcard(s) `LINHAS`** — campos de `form_rows`, N por grupo, com botão
         `[+]` (`adicionarLinha`), dentro do `card-body` de cada GRUPO.

A árvore renderizada acompanha a do banco: `form_manager` → `form_groups` →
`form_rows` → (a fazer: `form_fields`).

### Subcard FORMULÁRIO — `form_manager`

Renderizado por
**`<FormGrid schema={managerSchema(tabela, manager, atualizarManager)} />`**.
`managerSchema` (função pura, fora do componente) devolve um `FormGridSchema`.
Estado local `managers: Record<string, ManagerLocal>`; editado por
`atualizarManager`. Campos (fora `id`, timestamps):

| Campo             | `col` | `required` UI    | Banco / `CreateRequest`                                   | Tipo no schema                                                                                                                                                                                                                                                                                              |
| ----------------- | ----- | ---------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`           | 12    | sim              | `NULL` / `permit_empty`                                   | `text` — cabeçalho no topo. **slug acompanha** enquanto `slugAuto` (`slugify` no `onChange`)                                                                                                                                                                                                                |
| `profile_group`   | 12    | sim              | `NULL` / `permit_empty`                                   | `select` **`multiple`**, `src` = `${apiBaseUrl}/v1/user-roles/get-no-pagination`, `valueKey: 'slug'`, `labelKey: 'name'`. `values` = `parseStringList(m.profile_group)`; `onChangeMultiple` grava `toStringList(values)`; vazio → `''`. Ver [`README_campo_json_montado.md`](README_campo_json_montado.md). |
| `slug`            | 6     | sim              | `NOT NULL` UNIQUE / `required`                            | `text` — identidade do formulário. Nasce vazio; acompanha o Título enquanto `slugAuto`; ao editar à mão zera `slugAuto`                                                                                                                                                                                     |
| `status`          | 6     | sim              | `NOT NULL` DEFAULT `draft` / não enviado no create        | `select` estático `draft`/`active`/`inactive` — sempre nasce `draft`; `required` só barra o botão `×`                                                                                                                                                                                                       |
| `react_route`     | 12    | sim              | `NULL` / `permit_empty`                                   | `text`                                                                                                                                                                                                                                                                                                      |
| `submit_endpoint` | 4     | sim              | `NULL` / `permit_empty`                                   | `text`                                                                                                                                                                                                                                                                                                      |
| `http_method`     | 4     | sim              | `NULL` DEFAULT `POST` / `permit_empty\|in_list`           | `select` estático GET/POST/PUT/PATCH/DELETE — sempre nasce `POST`; `required` só barra o botão `×`                                                                                                                                                                                                          |
| `version`         | 4     | sim (decorativo) | `NOT NULL` DEFAULT 1 / `permit_empty\|is_natural_no_zero` | `text` `inputMode: 'numeric'`; `onChange` faz `parseInt \|\| 1` → estado nunca fica vazio, `required` nunca dispara                                                                                                                                                                                         |
| `description`     | 12    | não              | `NULL` / `permit_empty`                                   | `textarea` (`rows: 2`, `showCounter: true` — contagem simples, sem `maxLength`)                                                                                                                                                                                                                             |

### Subcard GRUPOS — `form_groups`

Renderizado por
**`<FormGrid schema={grupoSchema(tabela, grupo, atualizarGrupo)} />`** mais um
`<IconSelect>` ao lado (o FormGrid não tem seletor de ícone). Estado local
`grupos: Record<string, GrupoLocal[]>`.

| Campo         | `col` | Tipo no schema                                                              |
| ------------- | ----- | --------------------------------------------------------------------------- |
| `title`       | 12    | `text` **`required`** (`NOT NULL` no banco) — **slug acompanha** (slugAuto) |
| `slug`        | 6     | `text`                                                                      |
| `sort_order`  | 6     | `text` `inputMode: 'numeric'`                                               |
| `collapsed`   | 12    | `checkbox` de 1 opção (`Recolhido`), controlado por array                   |
| `description` | 12    | `textarea` (`rows: 2`, `showCounter: true` — contagem simples)              |
| `icon`        | —     | `<IconSelect>` fora do `<FormGrid>` (componente próprio)                    |

Botão `[+]` "Adicionar grupo" no cabeçalho da seção (`adicionarGrupo(tabela)`).

### Subcard LINHAS — `form_rows` (dentro de cada GRUPO)

Renderizado por
**`<FormGrid schema={rowSchema(grupoId, linha, atualizarLinha, todasColunas, colunasUsadas, onAddColunas)} />`**.
Estado local `linhas: Record<string, RowLocal[]>` com **chave = `grupo.id`** (uuid).
Cabeçalho "Linhas" com botão `[+]` "Adicionar linha" (`adicionarLinha(grupo.id)`),
igual ao de Grupos. Cada linha é um `card border`. `form_group_id` fica implícito
(a linha pertence ao grupo renderizado); `id`/timestamps de fora.

| Campo        | `col` | Tipo no schema                                                                                                    |
| ------------ | ----- | ----------------------------------------------------------------------------------------------------------------- |
| `sort_order` | 6     | `text` `inputMode: 'numeric'` (`parseInt \|\| 0`)                                                                 |
| `gutter`     | 6     | `select` estático `g-0`…`g-5` (default `g-3`); label "Gutter (espaço)" — classe de gap entre colunas do Bootstrap |
| `note`       | 12    | `text` — nota interna                                                                                             |
| `columns`    | 12    | **Último campo da linha** (abaixo de `note`). Ver "Distribuição das colunas" abaixo. **Estado só de UI** — `form_rows` não tem essa coluna no banco; dirige os subcards CAMPO. Acima da lista de linhas, hint `Carregando colunas…` / `alert` de erro por `colunas[tabela]` |

#### Distribuição das colunas entre as linhas

Cada coluna da tabela vai para **no máximo uma linha** (de qualquer grupo).

- **Select `Colunas`** (`type: 'select'` **`multiple`**, `rows: 10` — listbox
  alto sempre aberto, `valueKey/labelKey = name`): `options` = **lista completa**
  das colunas da tabela (`colunas[tabela].items`); `values` fica **fixo em `[]`**
  — a seleção não "gruda", cada escolha só dispara `onAddColunas(values)`.
- **`disabledValues: colunasUsadas`** — as colunas já usadas por qualquer linha
  (de qualquer grupo) da tabela entram como `<option disabled>` (cinza, não
  selecionáveis) em **todos** os selects daquela tabela. `colunasUsadas` é
  derivado a cada render: `[...new Set(<todas as r.columns de todas as linhas de
  todos os grupos>)]`.
- **Limite `MAX_COLUNAS_POR_LINHA = 12`** (`formBuilder.model.ts`): aplicado em
  `adicionarColunas` (dedupe + teto); o label mostra `Colunas (n/12)`.
- `disabledValues` é prop opt-in do `<FormGrid>` select — ver
  [`README_FormGrid.md`](README_FormGrid.md).

### Subcard CAMPO — `form_fields` (1 por coluna selecionada)

Ao escolher uma coluna no listbox da LINHA, aparece **um `card border` "Campo —
{coluna}"** logo abaixo, dentro do `card-body` da linha. **Não há `[+]` manual** —
um subcard por item de `r.columns`. O header traz `×` (`btn-close`) que chama
`removerColunaLinha(grupoId, linhaId, coluna)`: tira a coluna de `r.columns`,
apaga o `CampoLocal` e a coluna volta a ficar selecionável no listbox.

- **Estado**: `campos: Record<string, Record<string, CampoLocal>>` — chave
  `linha.id` → `coluna.name`. `CampoLocal` guarda **o que alguém preenche ao
  criar um field**: as colunas de conteúdo/validação de `form_fields` + a config
  que cada `<Tipo>FieldSchema` do `<FormGrid>` declara. Atributos DOM soltos
  (`title`, `className`, `tabIndex`, `size`, `cols`, `dir`, `lang`, `spellCheck`,
  `autoFocus`, `list`) e `style_json` **ficam de fora** — renderer/submit
  cuidam. Nulláveis `INT`/data como `string` (`''` = não definido).
- **`campoInicial(coluna, sortOrder)`** (`formBuilder.model.ts`) — seed pela
  metadata: `field_name` = `field_key` = `coluna.name`; `label` = `coluna.name`;
  `field_type` = `inferirFieldType(coluna.data_type)` (`text*`→`textarea`,
  `date`→`data`, `time`→`hora`, `datetime`/`timestamp`→`data`, `enum`/`set`→
  `select`, resto→`text`); `required` = `!coluna.nullable`; `col: 12`; demais
  flags `false`, textos `''`.
- **`campoSchema(keyBase, campo, set)`** — devolve `FormGridSchema` com
  `sectionTitle` por bloco:
  - **Estrutura** (sempre): `field_type` (select do enum da migration,
    `FIELD_TYPE_OPCOES`), `col` (select 1–12), `sort_order`, `label`,
    `field_name`, `field_key`, `placeholder`, `default_value`, `help_text`.
  - **Estado e validação** (sempre): `checkbox` inline
    `required`/`disabled`/`read_only`/`is_hidden`; `min_length`, `max_length`
    (numérico), `pattern`, `input_mode` (select `INPUT_MODE_OPCOES`),
    `autocomplete`.
  - **Específico — {tipo}** (condicional): montado de **`CAMPOS_POR_TIPO`** — só
    o que o `<Tipo>FieldSchema` daquele `field_type` declara como opção de
    produto. `colunaField(nome, …)` traduz cada item no campo `<FormGrid>`
    adequado (flag→`checkbox`, array `*_json`→`textarea` cru, `min_date`/
    `max_date`→`data`, `rows_qty`→`text` numérico, `sel_*`→`text`).
- **`CAMPOS_POR_TIPO`** (em `FormBuilderPage.tsx`):
  - `text` → `datalist_json`, `no_*`
  - `password` → `no_*`
  - `senha` → `no_*`, `strong_password`, `double_field`, `equal_fields`
  - `email` → `allowed_domains_json`
  - `textarea` → `rows_qty`, `show_counter`, `no_*`
  - `select` → `sel_multiple`, `options_json` + grupo `sel_*` (`sel_src`,
    `sel_value_key`, `sel_label_key`, `sel_label_template`, `sel_max_visible`,
    `sel_rows`, `sel_auth_token`, `sel_find_src`, `sel_find_column`,
    `sel_get_src`)
  - `radio`/`checkbox` → `options_json`, `inline`
  - `data` → `min_date`, `max_date`
  - `hora` → `with_seconds`
  - `moeda` e mascarados (`cpf`…`sei`) → nada (só os blocos comuns)
- **`camposParaPayload(c)`** (`formBuilder.model.ts`) — serializa `sel_*` →
  `select_config_json` (chaves vazias/`false` omitidas; objeto vazio → `''`).
  Usado no `submit` futuro. `attributes_json` / `style_json` ficam sem UI.
- `adicionarColunasLinha` cria o `CampoLocal` de cada coluna nova; entradas de
  `campos` sem coluna correspondente em `r.columns` (excedente do teto) ficam
  ociosas e nunca são renderizadas.
- **Ainda cru**: `options_json`, `datalist_json`, `allowed_domains_json` são
  `<textarea>` — o editor estruturado (montar/parse) é a próxima etapa, ver
  [`README_campo_json_montado.md`](README_campo_json_montado.md).

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
  `managerInicial`, `GrupoLocal`, `grupoInicial`, `RowLocal`, `rowInicial`,
  `CampoLocal`, `campoInicial`, `inferirFieldType`, `camposParaPayload`,
  `adicionarColunas`, `removerColuna`, `toTabela`, `toColuna`).
- **Sem persistência**: nenhum `submit`/`create` ainda. Só `useState`.
- **Layout**: página em `.container`; `col` do schema vira `col-md-N` (padrão do
  FormGrid).

## Próximos passos (a fazer)

### Subcard CAMPO — só a config que alguém preenche

O 4º nível da árvore está montado — **um subcard por coluna selecionada**, dirigido
por `r.columns` (ver "Subcard CAMPO" acima), não pelo `[+]` manual espelho de
GRUPOS/LINHAS. `campoSchema` tem **3 blocos** (Estrutura / Estado e validação /
Específico — {tipo}) e só expõe o que é preenchido ao criar um field.

| Bloco               | Cobre                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Estrutura ✅         | `field_type`, `col`, `sort_order`, `label`, `field_name`, `field_key`, `placeholder`, `default_value`, `help_text`                                                               |
| Estado / validação ✅ | `required`, `disabled`, `read_only`, `is_hidden`, `min_length`, `max_length`, `pattern`, `input_mode`, `autocomplete`                                                             |
| Específico ✅        | por `field_type` via `CAMPOS_POR_TIPO` (só o que o `<Tipo>FieldSchema` declara): `no_*`, `strong_password`/`double_field`/`equal_fields`, `with_seconds`, `show_counter`, `inline`, `rows_qty`, `min_date`/`max_date`, `options_json`/`datalist_json`/`allowed_domains_json`, `sel_multiple` + grupo `sel_*` |

**Fora da UI (auto):** atributos DOM soltos (`title`, `className`, `tabIndex`,
`size`, `cols`, `dir`, `lang`, `spellCheck`, `autoFocus`, `list`) e `style_json`
— renderer/submit definem default/null. `sel_*` → `select_config_json` via
`camposParaPayload(c)`.

**Falta** (próximas etapas):

- **Editor estruturado dos arrays** — `options_json`, `datalist_json`,
  `allowed_domains_json` ainda são `<textarea>` de conteúdo cru; montar/parse
  fica para depois, ver
  [`README_campo_json_montado.md`](README_campo_json_montado.md).
- **Regra do grid**: 1 a 12 campos por linha **e** soma dos `col` ≤ 12 — hoje
  validada no `Form/FormCampos/Processor` ao vincular o campo, **não** no DDL. O
  construtor deveria somar os `col` da linha e avisar antes de qualquer envio.
- **`field_type`**: o ENUM mistura inglês/português e duplica `password`/`senha`
  (ver "Observação de nomenclatura" abaixo). Resolver ao casar com os 21 tipos
  do `<FormGrid>` ([`README_FormGrid.md`](README_FormGrid.md)).
- **Persistência**: continua fora de escopo — o `submit`/`create` de toda a
  árvore (`form_manager` → `form_fields`) é um passo à parte. Os nulláveis
  `INT`/data guardados como `string` (`''`) serão convertidos no envio.

### Observação de nomenclatura (decidir ao religar)

- **Resolvido** (Escopo A, migration `2026-09-07-170349`): a tabela `form_campos`
  foi renomeada para **`form_fields`**, alinhando com `form_manager` /
  `form_groups` / `form_rows`. Ainda pendente (Escopo B): o módulo PHP
  `FormCampos`, a rota `/api/v1/form-campos` e o prefixo `fc_` da view.
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
