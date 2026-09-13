[◄ Índice da base de conhecimento](../README.md)

---

# Módulo Form (API V1)

Domínio que **persiste e serve formulários dinâmicos** — a definição estrutural
de um formulário (como o `src/public/form_test.html`) guardada no banco e
exposta por APIs REST **públicas** (sem JWT). O front React lê a definição e
renderiza os componentes de
`src/frontend/projeto54900/src/components/ui/FormGrid`.

Segue o [`ROADMAP_padrao_modulo.md`](ROADMAP_padrao_modulo.md); espelha
`User/UserManager`. Nenhuma classe `Base*` foi alterada.

## 1. Identidade

| Item | Valor |
| --- | --- |
| Domínio | `Form` |
| Namespace | `App\...\V1\Form\<Modulo>` |
| Módulos | `FormManager`, `FormGroups`, `FormRows`, `FormCampos` |
| Banco / grupo | `codeigniter54900_db` / `DB_GROUP_001` |
| Slugs | `form-manager`, `form-manager-view`, `form-groups`, `form-rows`, `form-campos` |
| Autenticação | **nenhuma** — `Config/Filters.php` não tem filtro global de auth |

## 2. Árvore de dados

```
form_manager  (o formulário)
   └─ form_groups   (subgrupos de contexto — "Dados Pessoais", "Contato", ...)
        └─ form_rows   (linhas; de 1 a 12 campos, soma dos `col` ≤ 12)
             └─ form_fields  (um campo; atributos de qualquer componente do FormGrid)
```

Todas as FKs são `ON DELETE CASCADE`. Todas as tabelas têm
`id`/`created_at`/`updated_at`/`deleted_at` (soft delete).

### 2.1 `form_manager`

| Coluna | Tipo | Nota |
| --- | --- | --- |
| `slug` | VARCHAR(255) NOT NULL **UNIQUE** | identidade do formulário (única) |
| `table_name` | VARCHAR(255) NULL | tabela real do banco escolhida no construtor — validada contra o schema (`SchemaInspector::isKnownTable`) no Processor; fonte da verdade para reabrir o formulário em edição |
| `title` | VARCHAR(255) NULL | cabeçalho exibido no topo (vazio → sem cabeçalho) |
| `description` | TEXT NULL | |
| `roles` | VARCHAR(255) NULL | lista JSON de slugs de `user_roles` com acesso ao formulário |
| `react_route` | VARCHAR(255) NULL | rota do React onde o form fica ativo |
| `submit_endpoint` | VARCHAR(255) NULL | para onde o form envia |
| `http_method` | VARCHAR(10) NULL DEFAULT `POST` | |
| `status` | ENUM(`draft`,`active`,`inactive`) DEFAULT `draft` | selado no create |
| `version` | INT NOT NULL DEFAULT 1 | |

### 2.2 `form_groups`

`form_manager_id` (FK), `title` (NOT NULL), `slug` (kebab, único por
`form_manager_id` — validado no Processor), `description`, `icon`, `sort_order`,
`collapsed` (TINYINT 1).

### 2.3 `form_rows`

`form_group_id` (FK), `sort_order`, `gutter` (DEFAULT `g-3`), `note`.
A regra **1 a 12 campos por linha** (contagem **e** soma dos `col` ≤ 12) é
aplicada pelo `Form/FormCampos/Processor` quando o campo é vinculado.

### 2.4 `form_fields` (atributos do FormGrid — híbrido)

- **Colunas explícitas:** `form_row_id` (FK), `sort_order`, `field_type` (ENUM
  com os 22 tipos), `col` (1–12), `label`, `field_name`, `field_key`,
  `placeholder`, `default_value`, `help_text`, `required`, `disabled`,
  `read_only`, `is_hidden`, `max_length`, `min_length`, `pattern`,
  `input_mode`, `autocomplete`.
- **Flags por tipo (TINYINT 1):** `no_numbers`, `no_letters`,
  `no_special_chars`, `strong_password`, `double_field`, `equal_fields`,
  `with_seconds`, `show_counter`, `inline`; `rows_qty` (INT), `min_date`,
  `max_date` (VARCHAR(10) ISO).
- **Colunas JSON:** `options_json` (radio/checkbox/select), `datalist_json`
  (text), `allowed_domains_json` (email), `select_config_json` (`src`,
  `valueKey`, `labelKey`, `labelTemplate`, `maxVisible`, `findSrc`,
  `findColumn`, `getSrc`, `authToken`), `style_json` (CSSProperties),
  `attributes_json` (o resto: `size`, `tabIndex`, `dir`, `lang`, `spellCheck`,
  `autoFocus`, `title`, `className`, `value`, `cols`, ...).

`field_type` ∈ `text, password, email, textarea, senha, select, radio,
checkbox, cpf, cnpj, phone, cep, data, hora, moeda, pis, placa, titulo, cnh,
processo, renavam, sei`.

Os Processors serializam para string as colunas JSON recebidas como
array/objeto (`json_encode`).

### 2.5 `view_form_manager`

Achata os 4 níveis — **1 linha por campo**. Colunas com prefixo de origem
(`fm_`, `fg_`, `fr_`, `fc_`); `id` = `form_fields.id` (pode ser NULL em ramo
sem campos); `created_at`/`updated_at`/`deleted_at` = os de `form_manager`.
Cada LEFT JOIN filtra `deleted_at IS NULL` do lado dependente.

Consumo típico (baixar um formulário inteiro):

```
POST /api/v1/form-manager-view/get-grouped
  { "fm_id": ["5"] }
```

→ todas as linhas de campos do formulário 5; o front reagrupa por
`fg_sort_order` → `fr_sort_order` → `fc_sort_order`.

## 3. Rotas (81 novas)

- `api/v1/form-manager/...` — 18 rotas canônicas (§5.1 do ROADMAP).
- `api/v1/form-manager-view/...` — 9 rotas de leitura (§5.2).
- `api/v1/form-groups/...` — 18 rotas canônicas.
- `api/v1/form-rows/...` — 18 rotas canônicas.
- `api/v1/form-campos/...` — 18 rotas canônicas.

Registro em `Config/Routes.php` (bloco `/Form` dentro do grupo `api/v1`).
Envelope de resposta e status: §6 do ROADMAP.

## 4. Regras de negócio (nos Processors, não nos Requests)

| Regra | Onde |
| --- | --- |
| `slug` único (form_manager) | `FormManager/Processor::validateOnCreate/Update` (409) |
| `table_name` deve ser tabela real do schema | `FormManager/Processor::validateOnCreate/Update` via `SchemaInspector::isKnownTable` (422) |
| `slug` único por formulário (form_groups) | `FormGroups/Processor` via `existsBySlugInForm` (409) |
| FK `form_manager_id` / `form_group_id` / `form_row_id` existe e está ativa | `validateOnCreate/Update` de cada Processor (422) |
| `status` de `form_manager` nasce `draft` | `FormManager/Processor::prepareData` (`unset`) |
| ≤ 12 campos por linha e soma `col` ≤ 12 | `FormCampos/Processor::validarGrid` (409) |
| colunas `*_json` como objeto → string | `encodeJsonColumns` nos Processors |

## 5. Camadas / arquivos

```
Database/Migrations/
  2026-09-06-012300_CreateFormManagerTableMigration.php
  2026-09-06-012301_CreateFormGroupsTableMigration.php
  2026-09-06-012302_CreateFormRowsTableMigration.php
  2026-09-06-012303_CreateFormCamposTableMigration.php
  2026-09-06-012304_CreateViewFormManagerMigration.php
  2026-09-12-231700_AddTableNameToFormManagerMigration.php
  2026-09-12-231701_BackfillTableNameFormManagerMigration.php
Models/V1/Form/FormManager/     SqlTableModel.php  SqlViewModel.php
Models/V1/Form/FormGroups/      SqlTableModel.php
Models/V1/Form/FormRows/        SqlTableModel.php   (+ sumCampoCols/countCampos)
Models/V1/Form/FormCampos/      SqlTableModel.php
Requests/V1/Form/*/             CreateRequest.php  UpdateRequest.php   (×4)
Services/V1/Form/*/             Processor.php                          (×4)
Controllers/Api/V1/Form/FormManager/   ResourceTableController.php  ResourceViewController.php
Controllers/Api/V1/Form/{FormGroups,FormRows,FormCampos}/  ResourceTableController.php
Config/Routes/Api/v1/Form/FormManager/  EndpointTable.php  EndPointView.php
Config/Routes/Api/v1/Form/{FormGroups,FormRows,FormCampos}/  EndpointTable.php
Config/Routes.php   (+ 5 grupos)
```

## 6. Aplicar

```
podman compose exec php php spark migrate     # cria as 4 tabelas + a view
podman compose exec php php spark routes       # confere as 81 rotas novas
```

Sem `-g`: as migrations rodam na conexão `default` (`codeigniter54900_db`),
igual a `UserManager`/`UploadManager`. Os Models usam `DB_GROUP_001`, que hoje
aponta para o mesmo banco.

## 7. Ordem de criação de dados

`form_manager` → `form_groups` (com `form_manager_id`) → `form_rows` (com
`form_group_id`) → `form_fields` (com `form_row_id`). Excluir um `form_manager`
(hard delete) leva junto grupos, linhas e campos (CASCADE); o `delete-soft`
marca apenas o registro-alvo.

---

[◄ Índice da base de conhecimento](../README.md)
