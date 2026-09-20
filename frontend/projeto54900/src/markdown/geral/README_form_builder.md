[◄ Índice da base de conhecimento](../README.md)

---

# Construtor novo — `FormBuilderPage` (`/v1/form-constructor`)

Construtor que estamos montando juntos, do zero. **Não** é a página anterior
(`FormConstructorPage`, dirigida por seed + `view_form_manager`) — esta lê o
schema real do banco por introspecção e **persiste nó a nó**: cada nível é
gravado pelo botão **Salvar** do seu modal (services `form*`), o `id` retornado
liga a camada filha e **um filho só pode ser criado depois do pai salvo**.
Recarregar do banco uma árvore já persistida para reedição ainda **não** existe
(a tela sempre parte de estado novo).

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
   - **`card-body`**: uma **árvore de hierarquia** (`<FormTree>` + `<TreeNode>`,
     [`FormBuilderTree.tsx`](../../pages/v1/form/FormBuilderTree.tsx)) no visual de
     [`doc/html/estrutura.html`](../../../../../../doc/html/estrutura.html). Cada
     nível é uma **linha compacta** (chevron + ícone + `form_<tabela>` + `·
     {nome}` + pill de contagem); clicar expande/recolhe **só a estrutura
     abaixo** (nunca despeja formulário). O formulário de cada nó abre num
     **modal** ([`FormModal.tsx`](../../pages/v1/form/FormModal.tsx)), botão ✏️.
     - **`manager`** (1, `id = manager:{tabela}`) — `name = {tabela}`; ✏️ abre
       `managerSchema`; `[+] form_groups` (`adicionarGrupo`).
       - **`group`** (N, `grupos[tabela]`) — `name = grupo.title`; ✏️ abre
         `grupoSchema` + `<IconSelect>`; `[+] form_rows` (`adicionarLinha`); 🗑
         (`removerGrupo`).
         - **`row`** (N, `linhas[grupo.id]`) — `name = linha.note` ou
           `linha {sort_order}`; ✏️ / `[+] form_fields` abrem `rowSchema` (com o
           multiselect **Colunas** + hints de carregamento/erro); 🗑
           (`removerLinha`).
           - **`field`** (folha, 1 por `linha.columns`) — `name` = nome da
             coluna; sem chevron; ✏️ abre `campoSchema`; 🗑 (`removerColunaLinha`).

A árvore acompanha a do banco: `form_manager` → `form_groups` → `form_rows` →
`form_fields`.

### Colapso e modal — estado React, não os plugins JS do Bootstrap

`<FormTree>` guarda `Set<string>` de ids expandidos + o conjunto de todos os ids
montados (para "Expandir tudo" / "Recolher tudo"). Um `<TreeNode>` montado
**depois** da carga inicial é tratado como novo: abre a si e a toda a cadeia de
pais (`parents`), rola até a linha (`scrollIntoView`) e pisca (`tree-flash`) —
o `[+]` insere o nó **visível** na hierarquia. `<FormModal>` renderiza as
classes `.modal`/`.modal-backdrop` num portal para `<body>`, fecha em Esc /
clique fora / ×, e trava o scroll (`.modal-open`). Nada de `data-bs-toggle`:
o React é dono dessas subárvores e o bundle JS movendo/limpando os nós conflita
com o render. O 0,01% de CSS (giro do chevron, hover, guia tracejada, `tree-flash`)
fica em [`styles/_custom.scss`](../../styles/_custom.scss); o resto é utilitário.

### Persistência por nó — "Salvar" no modal

Cada nó grava sozinho, pela API do módulo Form (endpoint-set REST padrão):

| Nível         | Service (`@/services/v1`) | Rota                     | FK do pai enviada |
| ------------- | ------------------------- | ------------------------ | ----------------- |
| `form_manager`| `formManagerTable`        | `POST /v1/form-manager`  | —                 |
| `form_groups` | `formGroupsTable`         | `POST /v1/form-groups`   | `form_manager_id` |
| `form_rows`   | `formRowsTable`           | `POST /v1/form-rows`     | `form_group_id`   |
| `form_fields` | `formCamposTable`         | `POST /v1/form-campos`   | `form_row_id`     |

- **`dbId: number | null`** entra em `ManagerLocal` / `GrupoLocal` / `RowLocal` /
  `CampoLocal` (`formBuilder.model.ts`). `null` = ainda não persistido; o `id` da
  resposta (`respondCreated`) é gravado nele via `atualizar*`.
- **`<FormModal>` ganhou `onSave` / `saving` / `saveError`.** Com `onSave` o
  rodapé vira **Salvar** + **Fechar**; sem ele mantém o **Concluir** de antes.
  `renderModal()` passa `onSave={() => salvar<Nível>(…)}` nos 4 tipos.
- **`salvar<Nível>`** (na página): monta o payload com
  `managerPayload` / `grupoPayload` / `rowPayload` / `campoPayload`
  (`formBuilder.model.ts` — booleano→`0/1`, vazios omitidos, `select_config_json`
  via `camposParaPayload`), chama **`create`** (sem `dbId`) ou **`update`**
  (com `dbId`), grava `Number(rec.id)` no estado, mostra toast (`useToast`) e
  fecha o modal. Erro de API → `ApiError.message` no `.alert` do modal, sem
  quebrar o estado.
- **Gating pai→filho.** `<TreeNode addDisabled>` desabilita o `[+]` enquanto o
  nível acima não tem `dbId`: manager sem `dbId` trava `+ form_groups`, grupo sem
  `dbId` trava `+ form_rows`, linha sem `dbId` trava `+ form_fields` **e** o
  `<select>` **Colunas** do modal da linha. O nome do nó na árvore mostra
  ` · #<id>` quando salvo e ` · não salvo` quando não.
- **Remoção.** `removerGrupo` / `removerLinha` / `removerColunaLinha`: se o nó
  tem `dbId`, `deleteSoft(dbId)` **antes** de limpar o estado local (o `CASCADE`
  das FKs cuida dos filhos no banco); falha da API → toast de erro e o nó
  **permanece**. Nó sem `dbId` → só limpa local, como antes.

---

## ⭐ Padrão reutilizável — "árvore de hierarquia + formulário em modal"

> **Guardar como referência.** Este par de componentes resolve bem **qualquer
> tela de estrutura pai→filho com N níveis** onde cada nó tem um formulário
> próprio (menus, categorias, permissões, workflow, campos de relatório,
> capítulos/seções, BOM de produto, etc.). É genérico: não sabe nada de
> `form_manager` — a página é que mapeia o seu estado para `<TreeNode>`
> aninhados. Reaproveitar antes de inventar outra coisa.

**Componentes** (`src/pages/v1/form/`, mover para `components/ui/` se um 2º
consumidor aparecer):

| Arquivo | Papel | É genérico? |
| ------- | ----- | ----------- |
| [`FormBuilderTree.tsx`](../../pages/v1/form/FormBuilderTree.tsx) | `<FormTree>` (contexto de expansão + "Expandir/Recolher tudo") e `<TreeNode>` (linha compacta: chevron, ícone por `level`, `name`, pill de contagem, slots `onEdit`/`onAdd`/`onRemove`) | **Sim** — só `TreeLevel` (`manager`/`group`/`row`/`field`) e os ícones são específicos; trocar num fork |
| [`FormModal.tsx`](../../pages/v1/form/FormModal.tsx) | `<FormModal>` — modal 100% controlado por React: portal para `<body>`, `.modal`/`.modal-backdrop`, fecha em Esc / clique fora / ×, trava scroll (`.modal-open`) | **Sim, totalmente** — nada de específico do construtor |
| [`styles/_custom.scss`](../../styles/_custom.scss) `.form-tree` | giro do chevron, hover, guia tracejada, `@keyframes tree-flash` | **Sim** |

**Por que funciona (decisões a manter num reuso):**

1. **Linha de árvore = só estrutura.** O nó nunca renderiza o formulário inline
   — colapsar um nó cheio de campos não organiza nada (foi o erro da 1ª versão).
   Editar é ação explícita (✏️) que abre o **modal**.
2. **Colapso e modal por estado React, nunca `data-bs-toggle` / `bootstrap.Modal`.**
   O React é dono da subárvore; o bundle JS do Bootstrap movendo/limpando esses
   nós briga com o ciclo de render.
3. **`[+]` dá feedback imediato.** Nó novo (montado após a carga inicial): abre
   a si + a cadeia de `parents`, `scrollIntoView` e pisca (`tree-flash`). O item
   aparece **visível** na hierarquia, não "em algum lugar lá embaixo".
4. **Um modal por vez.** A página guarda um `ModalAlvo` discriminado
   (`{ kind: 'manager' | 'group' | 'row' | 'field'; …ids }`) e um `renderModal()`
   escolhe qual `<FormGrid>` montar. Guarda `if (!nó) return null` cobre o nó
   apagado com o modal aberto.
5. **Formulários continuam via `<FormGrid>`** (schema JSON), só que dentro do
   modal — zero `<input>` à mão.

**Para reusar noutra tela:** copiar os 2 componentes + o bloco `.form-tree`,
ajustar `TreeLevel`/ícones, e na página nova: estado → `<TreeNode>` aninhados
(passar `parents` com os ids ancestrais) + `ModalAlvo` + `renderModal()`.

---

### Subcard FORMULÁRIO — `form_manager`

Renderizado por
**`<FormGrid schema={managerSchema(tabela, manager, atualizarManager)} />`**.
`managerSchema` (função pura, fora do componente) devolve um `FormGridSchema`.
Estado local `managers: Record<string, ManagerLocal>`; editado por
`atualizarManager`. Campos (fora `id`, timestamps):

| Campo             | `col` | `required` UI    | Banco / `CreateRequest`                                   | Tipo no schema                                                                                                                                                                                                                                                                                              |
| ----------------- | ----- | ---------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `table_name`      | —     | —                | `NULL` / `required`, validada contra o schema (422)        | **Sem campo no `<FormGrid>`** — gravado automaticamente com a tabela escolhida no card seletor (`handleTabelas` → `managerInicial(tabela)`); nunca editado à mão                                                                                                                                          |
| `title`           | 12    | sim              | `NULL` / `permit_empty`                                   | `text` — cabeçalho no topo. **slug acompanha** enquanto `slugAuto` (`slugify` no `onChange`)                                                                                                                                                                                                                |
| `roles`           | 12    | sim              | `NULL` / `permit_empty`                                   | `select` **`multiple`**, `src` = `${apiBaseUrl}/v1/user-roles/get-no-pagination`, `valueKey: 'slug'`, `labelKey: 'name'`. `values` = `parseStringList(m.roles)`; `onChangeMultiple` grava `toStringList(values)`; vazio → `''`. Ver [`README_campo_json_montado.md`](README_campo_json_montado.md). |
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

| Campo        | `col` | Tipo no schema                                                                                                                                                                                                                                                              |
| ------------ | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sort_order` | 6     | `text` `inputMode: 'numeric'` (`parseInt \|\| 0`)                                                                                                                                                                                                                           |
| `gutter`     | 6     | `select` estático `g-0`…`g-5` (default `g-3`); label "Gutter (espaço)" — classe de gap entre colunas do Bootstrap                                                                                                                                                           |
| `note`       | 12    | `text` — nota interna                                                                                                                                                                                                                                                       |
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
  - `senha` → `no_*`, `strong_password`, `double_field` (exige igualdade sozinho)
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
  `NOT NULL` sem default; os demais marcados (`title`, `roles`,
  `react_route`, `submit_endpoint`, `http_method`, `status`, `version`) são
  `NULL` ou têm default no banco e `permit_empty` no `CreateRequest`. Enquanto o
  backend não for endurecido, a API ainda aceita esses campos vazios. Bloqueio
  de envio real só quando o construtor ganhar `submit`.
- **`roles`**: par `parseStringList` / `toStringList` de
  [`@/utils/jsonList`](../../utils/jsonList.ts).
- **Tipos e defaults**: `src/pages/v1/form/formBuilder.model.ts` (`ManagerLocal`,
  `managerInicial`, `GrupoLocal`, `grupoInicial`, `RowLocal`, `rowInicial`,
  `CampoLocal`, `campoInicial`, `inferirFieldType`, `camposParaPayload`,
  `adicionarColunas`, `removerColuna`, `toTabela`, `toColuna`).
- **Persistência por nó**: botão **Salvar** no modal de cada nível
  (`create`/`update` pelos services `form*`) + `deleteSoft` na remoção de nó já
  gravado. `dbId` no estado liga a camada filha; `[+]` fica desabilitado sem o
  pai salvo. Recarregar árvore existente do banco para reedição continua fora
  (ver "Próximos passos").
- **Layout**: página em `.container`; `col` do schema vira `col-md-N` (padrão do
  FormGrid).

## Próximos passos (a fazer)

### Subcard CAMPO — só a config que alguém preenche

O 4º nível da árvore está montado — **um subcard por coluna selecionada**, dirigido
por `r.columns` (ver "Subcard CAMPO" acima), não pelo `[+]` manual espelho de
GRUPOS/LINHAS. `campoSchema` tem **3 blocos** (Estrutura / Estado e validação /
Específico — {tipo}) e só expõe o que é preenchido ao criar um field.

| Bloco                | Cobre                                                                                                                                                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Estrutura ✅          | `field_type`, `col`, `sort_order`, `label`, `field_name`, `field_key`, `placeholder`, `default_value`, `help_text`                                                                                                                                                                                           |
| Estado / validação ✅ | `required`, `disabled`, `read_only`, `is_hidden`, `min_length`, `max_length`, `pattern`, `input_mode`, `autocomplete`                                                                                                                                                                                        |
| Específico ✅         | por `field_type` via `CAMPOS_POR_TIPO` (só o que o `<Tipo>FieldSchema` declara): `no_*`, `strong_password`/`double_field`, `with_seconds`, `show_counter`, `inline`, `rows_qty`, `min_date`/`max_date`, `options_json`/`datalist_json`/`allowed_domains_json`, `sel_multiple` + grupo `sel_*`                |

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
  (ver "Observação de nomenclatura" abaixo). Resolver ao casar com os 22 tipos
  do `<FormGrid>` ([`README_FormGrid.md`](README_FormGrid.md)).
- **Persistência por nó**: ✅ feita (ver "Persistência por nó — Salvar no
  modal"). **Falta**: recarregar do banco uma árvore já persistida para
  reedição — hoje a tela sempre parte de estado novo, e reabrir um nó salvo
  reenvia o formulário como `update`.

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
  [`README_FormGrid.md`](README_FormGrid.md), que cobre 22 tipos).

## Arquivos

```
src/pages/v1/form/FormBuilderPage.tsx     a página — estado + árvore + montagem de schema
src/pages/v1/form/FormBuilderTree.tsx     <FormTree>/<TreeNode> — árvore de hierarquia (só UI)
src/pages/v1/form/FormModal.tsx           <FormModal> — modal controlado (portal), abre o form do nó
src/pages/v1/form/formBuilder.model.ts    tipos, defaults, mappers (toTabela/toColuna)
src/utils/slug.ts                         slugify() (slug automático)
src/utils/jsonList.ts                     parseStringList()/toStringList() (roles)
src/services/v1/dbSchema.ts               tables() / columns(tabela)
src/services/v1/formManager.table.ts      create/update/deleteSoft de form_manager (Salvar no modal)
src/services/v1/formGroups.table.ts       idem form_groups
src/services/v1/formRows.table.ts         idem form_rows
src/services/v1/formCampos.table.ts       idem form_fields
src/hooks/useToast.ts                     toast de sucesso/erro do Salvar/Remover
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

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
