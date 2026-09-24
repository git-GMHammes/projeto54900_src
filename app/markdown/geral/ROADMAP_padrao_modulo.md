[◄ Índice da base de conhecimento](../README.md)

---

# ROADMAP — padrão de módulo da API V1

Padrão **obrigatório** para todo módulo novo da API V1 a partir de hoje. Um
módulo é um recurso REST sobre uma tabela (e, opcionalmente, uma view). Todos
os módulos têm a mesma estrutura de arquivos, **as mesmíssimas rotas**, o mesmo
envelope de resposta e validações derivadas do tipo da coluna no banco.

Referência viva: o módulo `UserManager` (`User/UserManager`) — é o espelho.
Nada de lógica nova nas classes base; o módulo só declara configuração e
sobrescreve hooks.

## 1. Fonte da verdade

1. **As tabelas do banco.** Toda tabela nasce de uma migration
   (`Y-m-d-His_Create<Nome>TableMigration`). O DDL define os campos, os tipos,
   o `NOT NULL`, os `ENUM`, as FKs — e é dele que saem as regras de validação
   dos Requests e as listas dos Models.
2. **As classes base** (`App\...\V1\Base*`). Elas fixam o comportamento; o
   módulo não reimplementa nada que já esteja nelas.
3. Regras de negócio (unicidade, FK, transições de status, hash de senha, etc.)
   entram **só** pelos hooks do `Processor`.

### Tabelas hoje

Banco `codeigniter54900_db` (conexão `default`; ver
[`README_conecta_banco_enviroments.md`](README_conecta_banco_enviroments.md) e
[`README_migrate.md`](README_migrate.md)).

| Domínio  | Tabela                                                                                                                                                     | Observação                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `User`   | `user_manager`                                                                                                                                             | credenciais; `username` unique; `status` ENUM                               |
| `User`   | `user_profiles`                                                                                                                                            | perfil 1:1, FK `user_manager_id` → `user_manager` (CASCADE); `email` unique |
| `User`   | `user_roles`                                                                                                                                               | `permissions` JSON; `slug` unique — módulo `User/UserRoles`, CRUD completo (2026-09-20) |
| `User`   | `view_user_manager`                                                                                                                                        | view: `user_manager` (um*) LEFT JOIN `user_profiles` (uc*)                  |
| `Calendar` | `calendar_manager`, `calendar_events`, `calendar_event_attendees`, `calendar_event_reminders`, `calendar_event_attachments`, `calendar_event_extended_properties` | migrations existem; **sem módulo ainda**                                    |
| `Upload` | `uploads`, `view_upload_manager`                                                                                                                            | módulo `Upload/UploadManager`; anexos polimórficos (ver desvio abaixo)      |

## 2. As 6 camadas

```
HTTP  ──►  Routes  ──►  Controller  ──►  Request (regras)      [validação de forma]
                              │
                              ▼
                          Processor (Service)                  [regra de negócio + orquestração]
                          ├─ hooks: validateOnCreate/Update, prepareData/prepareUpdateData
                          ▼
                          Model (SqlTableModel / SqlViewModel)  [acesso a dados]
                          ▼
                          Tabela / View no MySQL
```

- **Routes** — mapeiam verbo + caminho → método do Controller. Nenhuma lógica.
- **Controller** — recebe o request, chama `$this->validate(getCreateRules())`,
  delega ao `Processor`, formata a resposta com os helpers `respond*`. Toda
  ação tem `try { … } catch (\Throwable) { respondServerError } finally { }`.
  **Nenhuma regra de negócio.**
- **Request** — classe simples com `rules(): array` e `messages(): array`.
  Só validação de forma (tipo, tamanho, obrigatoriedade, `in_list` de ENUM).
- **Processor** — `Service` do módulo. Liga os Models no construtor e
  sobrescreve os hooks. Herda todo o CRUD genérico.
- **Model** — `SqlTableModel` (escrita + leitura de tabela) e `SqlViewModel`
  (leitura de view). Só declara propriedades; as queries vêm da base.
- **Migration** — cria a tabela/view. É o contrato de dados.

## 3. Herança e SOLID

| Classe base                                                                         | Fornece                                                                                                                                                                                                                                      | O módulo implementa                                                           |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `Controllers\BaseController`                                                        | bootstrap do CI4                                                                                                                                                                                                                             | —                                                                             |
| `Controllers\Api\V1\BaseResourceTableController`                                    | 18 endpoints (leitura + escrita + exclusão) + helpers `respondSuccess/Created/Paginated/NotFound/ValidationError/Error/ServerError` + `getPaginationParams`, `getJsonBody`, `getRequestBody`                                                 | `initController` → `$this->processor`; `getCreateRules()`, `getUpdateRules()` |
| `Controllers\Api\V1\BaseResourceViewController extends BaseResourceTableController` | 10 endpoints de leitura sobre view; `final getCreateRules()/getUpdateRules() → []`                                                                                                                                                           | `initController` → `$this->processor`                                         |
| `Services\V1\BaseViewService`                                                       | `sanitizeData`, `sanitizeString`, `removeMasks`, `formatDate`, `formatDatetime`, `buildPaginationParams`, leitura genérica de view                                                                                                           | `$this->viewModel` no construtor                                              |
| `Services\V1\BaseTableService extends BaseViewService`                              | leitura de tabela, **Template Method** `create()`/`update()`, soft-delete (`deleteSoft/deleteRestore/deleteHard/clearDeleted`)                                                                                                               | `$this->tableModel` (e `$this->viewModel` se houver view); hooks              |
| `Models\V1\BaseTableModel extends CodeIgniter\Model`                                | `findPaginated`, `findGrouped`, `searchByTerm`, `getOrdered`, `findOnlyDeleted`, `findWithDeleted`, `restore`, `clearDeleted`, `existsByField`, `safeSort/safeOrder` (whitelist anti-SQL-injection), `hideFields` ($hidden em retorno array) | propriedades (ver §6)                                                         |
| `Models\V1\BaseViewModel extends CodeIgniter\Model`                                 | versões `*View` das leituras, `findById`, `findDeletedById`                                                                                                                                                                                  | propriedades (ver §6)                                                         |

**SOLID aplicado:**

- **SRP** — cada camada faz uma coisa; a classe do módulo é fina.
- **OCP** — as bases são fechadas para modificação; a extensão é por herança
  e pelos hooks (`validateOnCreate`, `validateOnUpdate`, `prepareData`,
  `prepareUpdateData`, `getCreateRules`, `getUpdateRules`).
- **LSP** — `ResourceViewController` é um `BaseResourceTableController`
  substituível; sela (`final`) os hooks que não se aplicam a view.
- **Template Method** — `BaseTableService::create()` e `::update()` fixam o
  fluxo (sanitize → removeMasks → validateOn* → prepare* → persist) e deixam
  os passos variáveis para o `Processor`.

## 4. Árvore de arquivos de um módulo

Placeholders: `<Dominio>` (ex.: `User`, `Calendar`), `<Modulo>` (ex.: `UserManager`),
`<slug>` = kebab-case do módulo (ex.: `user-manager`), `<tabela>`, `<view>`.

```
src/app/
├─ Config/
│  ├─ Routes.php                         (+ 2 grupos: '<slug>' e '<slug>-view')
│  └─ Routes/Api/v1/<Dominio>/<Modulo>/
│     ├─ EndpointTable.php               (18 rotas)
│     └─ EndPointView.php                (10 rotas)   [só se houver view]
├─ Controllers/Api/V1/<Dominio>/<Modulo>/
│  ├─ ResourceTableController.php        extends BaseResourceTableController
│  └─ ResourceViewController.php         extends BaseResourceViewController  [só se houver view]
├─ Requests/V1/<Dominio>/<Modulo>/
│  ├─ CreateRequest.php
│  └─ UpdateRequest.php
├─ Services/V1/<Dominio>/<Modulo>/
│  └─ Processor.php                      extends BaseTableService (ou BaseViewService)
├─ Models/V1/<Dominio>/<Modulo>/
│  ├─ SqlTableModel.php                  extends BaseTableModel
│  └─ SqlViewModel.php                   extends BaseViewModel               [só se houver view]
└─ Database/Migrations/
   ├─ Y-m-d-His_Create<Modulo>TableMigration.php
   └─ Y-m-d-His_CreateView<Modulo>Migration.php                             [só se houver view]
```

Namespaces acompanham o caminho: `App\Controllers\Api\V1\<Dominio>\<Modulo>`,
`App\Requests\V1\<Dominio>\<Modulo>`, `App\Services\V1\<Dominio>\<Modulo>`,
`App\Models\V1\<Dominio>\<Modulo>`.

## 5. Contrato de rotas

Registro em `Config/Routes.php`, dentro do grupo `api/v1`:

```php
$routes->group('<slug>', static function ($routes) {
    require __DIR__ . '/Routes/Api/v1/<Dominio>/<Modulo>/EndpointTable.php';
});
$routes->group('<slug>-view', static function ($routes) {   // só se houver view
    require __DIR__ . '/Routes/Api/v1/<Dominio>/<Modulo>/EndPointView.php';
});
```

### 5.1 Tabela — `api/v1/<slug>/...` (18 rotas, arquivo `EndpointTable.php`)

| Verbo  | Caminho                       | Método do Controller   |
| ------ | ----------------------------- | ---------------------- |
| POST   | `find`                        | `find`                 |
| POST   | `get-grouped`                 | `getGrouped`           |
| GET    | `search`                      | `search`               |
| GET    | `get/(:num)`                  | `get/$1`               |
| GET    | `get-all`                     | `getAll`               |
| GET    | `get-no-pagination`           | `getNoPagination`      |
| GET    | `get-deleted/(:num)`          | `getDeleted/$1`        |
| GET    | `get-with-deleted/(:num)`     | `getWithDeleted/$1`    |
| GET    | `get-deleted-all`             | `getDeletedAll`        |
| GET    | `get-all-with-deleted/(:num)` | `getAllWithDeleted/$1` |
| GET    | `get-all-with-deleted`        | `getAllWithDeleted`    |
| POST   | `create`                      | `create`               |
| PUT    | `update/(:num)`               | `update/$1`            |
| DELETE | `delete-soft/(:num)`          | `deleteSoft/$1`        |
| PATCH  | `delete-restore/(:num)`       | `deleteRestore/$1`     |
| DELETE | `delete-hard/(:num)`          | `deleteHard/$1`        |
| DELETE | `clear-deleted`               | `clearDeleted`         |
| DELETE | `clear-deleted/(:num)`        | `clearDeleted/$1`      |

### 5.2 View — `api/v1/<slug>-view/...` (10 rotas, arquivo `EndPointView.php`)

| Verbo | Caminho                | Método do Controller |
| ----- | ---------------------- | -------------------- |
| POST  | `find`                 | `find`               |
| POST  | `get-grouped`          | `getGrouped`         |
| GET   | `search`               | `search`             |
| GET   | `get/(:num)`           | `get/$1`             |
| GET   | `get-all`              | `getAll`             |
| GET   | `get-no-pagination`    | `getNoPagination`    |
| GET   | `get-deleted/(:num)`   | `getDeleted/$1`      |
| GET   | `get-all-with-deleted` | `getAllWithDeleted`  |
| GET   | `get-deleted-all`      | `getDeletedAll`      |

_(São 9 linhas: a view não tem `get-with-deleted/(:num)`. Ao criar o módulo,
replicar exatamente este conjunto — não inventar rota nem omitir.)_

Query string padrão nas listagens: `?page=1&limit=20&sort=id&order=desc`
(`limit` teto 1000). Corpo de `find`: `{ "campo": "valor" }`. Corpo de
`get-grouped`: `{ "campo": ["v1","v2"] }` (WHERE IN).

## 6. Envelope de resposta e status

Toda resposta é JSON com esta forma (helpers em `BaseResourceTableController`):

```json
{
  "method": "POST",
  "endpoint": "/api/v1/<slug>/create",
  "statusCode": 201,
  "message": "Registro criado com sucesso",
  "success": true,
  "data": {}
}
```

Listagens acrescentam `"pagination": { "page", "limit", "total", "pages" }`.
Erros de validação acrescentam `"errors": { "campo": "mensagem" }`.

| Situação                          | Status | Helper                                                       |
| --------------------------------- | ------ | ------------------------------------------------------------ |
| OK                                | 200    | `respondSuccess`                                             |
| Criado                            | 201    | `respondCreated`                                             |
| Listagem                          | 200    | `respondPaginated`                                           |
| Erro de validação (forma)         | 422    | `respondValidationError`                                     |
| Conflito de negócio (ex.: unique) | 409    | `respondError($msg, 409)` (via `$result['code']`)            |
| Não encontrado                    | 404    | `respondNotFound`                                            |
| Erro do cliente genérico          | 400    | `respondError`                                               |
| Exceção não tratada               | 500    | `respondServerError` (loga; em `development` inclui `debug`) |

## 7. Requests — regras a partir do DDL

`CreateRequest` e `UpdateRequest` são classes simples (não estendem nada). O
docblock cita o DDL de referência. `rules()` retorna strings de validação do
CI4; `messages()` retorna as mensagens em pt-BR.

### 7.1 Mapa tipo de coluna → regra CI4

| Coluna no DDL                                                    | Regra base                                                                                    | Observação                                                |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `NOT NULL` (no create)                                           | `required`                                                                                    |                                                           |
| `NULL` / tem `DEFAULT`                                           | `permit_empty`                                                                                | no update, quase tudo vira `permit_empty`                 |
| `VARCHAR(n)`                                                     | `string\|max_length[n]`                                                                       | `n` = o mesmo `constraint` da migration                   |
| `ENUM('a','b','c')`                                              | `in_list[a,b,c]`                                                                              |                                                           |
| `TINYINT(1)` (flag)                                              | `permit_empty\|in_list[0,1]`                                                                  |                                                           |
| `INT` / `BIGINT` numérico                                        | `is_natural` ou `integer`                                                                     |                                                           |
| `BIGINT` de FK (`<x>_id`)                                        | `required\|is_natural_no_zero\|is_not_unique[<tabela_ref>.id]`                                | valida existência do pai                                  |
| `DATETIME` / `DATE`                                              | `permit_empty\|string\|valid_date[Y-m-d H:i:s]`                                               | o `Processor` normaliza com `formatDate`/`formatDatetime` |
| `JSON`                                                           | `permit_empty\|string`                                                                        | validar shape no `Processor` se preciso                   |
| `email`                                                          | `permit_empty\|valid_email\|max_length[n]`                                                    |                                                           |
| unique (`username`, `email`, `slug`)                             | regra de forma aqui; **unicidade real** no hook `validateOnCreate/Update` via `existsByField` |                                                           |
| campo com máscara (`cpf`, `cep`/`zip_code`, `phone`, `whatsapp`) | `permit_empty\|string`                                                                        | `removeMasks` tira a máscara antes de persistir           |

Regras de referência (`UserManager`):

```php
// CreateRequest::rules()
'username'      => 'required|string|max_length[255]',
'password_hash' => 'required|string|max_length[255]',
'token'         => 'permit_empty|string|max_length[255]',
'last_login_at' => 'permit_empty|string',
// status NÃO entra no create — nasce com o DEFAULT da coluna (Processor::prepareData faz unset)

// UpdateRequest::rules()
'username'      => 'permit_empty|string|max_length[255]',
'token'         => 'permit_empty|string|max_length[255]',
'status'        => 'permit_empty|in_list[active,inactive,blocked]',
'last_login_at' => 'permit_empty|string',
// password_hash NÃO é mutável por update
```

### 7.2 Regras de negócio (futuras) — no Processor, não no Request

O Request valida **forma**. Tudo que depende do banco ou de política entra nos
hooks:

- **Unicidade** → `validateOnCreate` / `validateOnUpdate` com
  `$this->tableModel->existsByField('<campo>', $valor, $excludeId)`; retornar
  `['success' => false, 'message' => '...', 'code' => 409]` ou `null`.
- **FK existe** → mesmo lugar, consultando o model do pai (ou regra
  `is_not_unique` no Request quando for simples).
- **Transformações** → `prepareData` (hash de senha, `formatDate`, gerar `uuid`,
  `unset` de campo imutável) e `prepareUpdateData` (remover o que não pode mudar).
- **Transições de status**, quotas, RBAC → `validateOnUpdate`.

## 8. Models — propriedades obrigatórias

### `SqlTableModel extends BaseTableModel`

| Propriedade              | Papel                                                                      |
| ------------------------ | -------------------------------------------------------------------------- |
| `$DBGroup`               | grupo de conexão — hoje `DB_GROUP_001` (ver §12, pendência)                |
| `$table`                 | nome da tabela física                                                      |
| `$primaryKey`            | `'id'`                                                                     |
| `$useSoftDeletes`        | `true` (todas as tabelas têm `deleted_at`)                                 |
| `$useTimestamps`         | `true`                                                                     |
| `$hidden`                | campos que **nunca** saem na resposta (`password_hash`, `token`, …)        |
| `$allowedFields`         | o que pode ser inserido/atualizado — DDL menos `id` e timestamps           |
| `$likeFields`            | campos de texto que usam `LIKE %v%` no `find`                              |
| `$sortableFields`        | whitelist de `ORDER BY` (anti-SQL-injection) — inclui `id` e os timestamps |
| `$searchFields` (public) | campos varridos pelo `GET /search`                                         |
| `$filterFields` (public) | só view: whitelist de filtro exato no `GET /search?filters[campo]=valor`   |

Métodos de conveniência do módulo: aliases semânticos sobre `existsByField`
(ex.: `existsByUsername($username, $excludeId = null)`).

### `SqlViewModel extends BaseViewModel`

`$DBGroup`, `$table` (nome da view), `$primaryKey`, `$likeFields`,
`$sortableFields`, `$searchFields` e, opcionalmente, `$filterFields`
(filtros exatos aceitos junto da busca: `GET /search?q=&filters[campo]=valor`,
AND com o OR LIKE; campo fora da lista é ignorado; default `[]`). Colunas da view usam prefixo de origem
(`um_`, `uc_`); o `id` e os timestamps expostos são os da tabela principal.

## 9. Migrations — convenções

- Nome de classe: `Create<Modulo>TableMigration` (tabela),
  `CreateView<Modulo>Migration` (view). Timestamp `Y-m-d-His_`.
- **Colunas padrão em toda tabela:**
  - `id` `BIGINT` `auto_increment` + `addPrimaryKey('id')`
  - `created_at` `DATETIME NULL DEFAULT` `new RawSql('CURRENT_TIMESTAMP')`
  - `updated_at` `DATETIME NULL DEFAULT` `new RawSql('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')`
  - `deleted_at` `DATETIME NULL`
- `addUniqueKey('<campo>')` para cada unique do domínio.
- FK: `addForeignKey('<x>_id', '<tabela_pai>', 'id', '', 'CASCADE')`.
- View: `DROP VIEW IF EXISTS` + `CREATE VIEW` em SQL cru (`$this->db->query`),
  colunas com prefixo de origem, `LEFT JOIN` filtrando `deleted_at IS NULL` do
  lado dependente. `down()` só dropa a view.
- Sem `$DBGroup` na migration → roda no `default` (`codeigniter54900_db`).
  Ver [`README_migrate.md`](README_migrate.md).

## 10. Passo a passo — criar um módulo novo

Exemplo: domínio `Calendar`, módulo `CalendarManager`, tabela `calendar_manager`,
slug `calendar-manager`.

1. **Migration da tabela** (se ainda não existe):
   `SPARK make:migration CreateCalendarManagerTable` → preencher com o DDL, colunas
   padrão, uniques, FKs. (`SPARK` = `podman compose exec php php spark`.)
2. **Migration da view** (se o módulo terá view): `CreateViewCalendarManagerMigration`
   com o `CREATE VIEW` e prefixos.
3. `SPARK migrate` — cria em `codeigniter54900_db`. Conferir com
   `SPARK migrate:status`.
4. **Model(s)** em `Models/V1/Calendar/CalendarManager/`: `SqlTableModel` (e
   `SqlViewModel`), preenchendo as propriedades da §8 a partir do DDL.
5. **Requests** em `Requests/V1/Calendar/CalendarManager/`: `CreateRequest` +
   `UpdateRequest`, `rules()` pelo mapa da §7.1, `messages()` em pt-BR.
6. **Processor** em `Services/V1/Calendar/CalendarManager/Processor.php` estendendo
   `BaseTableService` (ou `BaseViewService` se for só leitura): construtor liga
   os models; sobrescrever só os hooks necessários.
7. **Controllers** em `Controllers/Api/V1/Calendar/CalendarManager/`:
   `ResourceTableController` (declara `processor` + `getCreateRules/getUpdateRules`)
   e `ResourceViewController` (só `processor`).
8. **Rotas**: criar `Config/Routes/Api/v1/Calendar/CalendarManager/EndpointTable.php`
   (18) e `EndPointView.php` (10) copiando o contrato da §5 e trocando o
   namespace do controller; registrar os 2 grupos em `Config/Routes.php`.
9. **Conferir**: `SPARK routes` lista as ~28 rotas novas; testar `create`,
   `find`, `get/{id}`, `update/{id}`, `delete-soft/{id}`.
10. Se o módulo introduzir um markdown na base, atualizar
    [`../README.md`](../README.md) (regra de
    [`README_atualiza_readme.md`](README_atualiza_readme.md)).

**Não** copiar lógica das classes base para o módulo. Se algo genérico faltar,
o lugar é a classe base — com revisão.

### 10.1 Desvio sancionado — módulo `Upload/UploadManager`

O módulo de anexos foge do padrão em **dois pontos**, documentados em
[`README_modulo_upload.md`](README_modulo_upload.md):

1. **Tabela `uploads` sem foreign key** — é polimórfica (serve N módulos via
   `module` + `reference_id`), então não há FK nem `CASCADE`. Trade-off:
   possibilidade de arquivos órfãos ao excluir o dono.
2. **3 rotas além das 18/10** — `POST upload` (multipart), `GET serve/(:num)`
   e `GET download/(:num)`, em `EndpointUpload.php`. O padrão não cobre
   `multipart` nem streaming de binário. As 18/10 canônicas seguem intactas
   para os metadados; `update` só altera metadados (campos físicos imutáveis).

Novos módulos **não** devem tomar isto como licença para inventar rotas ou
abrir mão de FK — o desvio vale só para o caso de anexo polimórfico.

## 11. Checklist de conformidade (revisão de PR)

- [ ] Caminho e namespace = `V1/<Dominio>/<Modulo>` em todas as camadas.
- [ ] Controllers só com `initController` + hooks de regra; zero lógica.
- [ ] 18 rotas de tabela e 10 (9 linhas) de view, idênticas à §5.
- [ ] `rules()` derivado do DDL; `max_length[n]` batendo com o `constraint`.
- [ ] Unicidade/FK/transições nos hooks do `Processor`, nunca no Controller.
- [ ] Model com `$hidden` para segredos, `$sortableFields` com whitelist.
- [ ] Tabela com `id`/`created_at`/`updated_at`/`deleted_at` padrão.
- [ ] Envelope de resposta e status conforme §6.
- [ ] Nenhuma classe base modificada sem necessidade justificada.

## 12. Pendências / decisões em aberto

O padrão só fecha 100% depois destas decisões (nenhuma resolvida neste ROADMAP):

1. **`DB_GROUP_001` aponta para grupo inexistente.**
   [`Config/Constants.php`](../../Config/Constants.php) define
   `DB_GROUP_001 = 'codeigniter54900_mysql'`, mas
   [`Config/Database.php`](../../Config/Database.php) **não tem** esse grupo
   (tem `default`, `mapa`, `agenda`, `chat`, `tests`). Os Models da API V1
   (`$DBGroup = DB_GROUP_001`) tentam conectar num grupo que não existe,
   enquanto as migrations (sem `$DBGroup`) criam as tabelas no `default`
   (`codeigniter54900_db`). **Decidir:** (a) `DB_GROUP_001 = 'default'`; ou
   (b) criar `public array $codeigniter54900_mysql` em `Database.php` apontando
   para `codeigniter54900_db`. Enquanto não decidir, os endpoints não sobem.
2. **Modelo mental divergente entre `CLAUDE.md` e o código.**
   [`../../CLAUDE.md`](../../CLAUDE.md) descreve "um grupo por domínio"
   (`mapa`/`agenda`/`chat`); o código da API V1 usa "um grupo numerado por
   banco" (`DB_GROUP_001`). Alinhar os dois textos após a decisão do item 1.
3. **`MASKED_FIELDS` x nome da coluna.**
   [`Services/V1/BaseViewService.php`](../../Services/V1/BaseViewService.php)
   lista `zip_code` / `uc_zip_code`, mas a coluna em `user_profiles` é `cep`
   (view: `uc_cep`). A remoção de máscara nunca roda para o CEP. **Decidir:**
   renomear a coluna para `zip_code` ou trocar a constante para `cep`.

Extras observados (menor prioridade): `user_roles` sem tabela-pivô
usuário↔papel (módulo `User/UserRoles` já existe, CRUD completo desde
2026-09-20); `user_profiles.uuid` sem geração;
`BaseResourceViewController::getAllWithDeleted()` ignora o `$id` (a versão de
tabela trata os dois casos).

## 13. Links

- [`README_migrate.md`](README_migrate.md) — rodar migrations.
- [`README_conecta_banco_enviroments.md`](README_conecta_banco_enviroments.md) — conexões e credenciais.
- [`README_atualiza_readme.md`](README_atualiza_readme.md) — registrar markdown novo no índice.
- [`../../CLAUDE.md`](../../CLAUDE.md) — regras do `src/app/`.

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
