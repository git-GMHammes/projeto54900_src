[◄ Índice da base de conhecimento](../README.md)

---

# Rotas da API v1

> Este documento lista, de forma textual, todas as rotas REST definidas em
> `app/Config/Routes/Api/v1`, agrupadas por módulo, na mesma ordem em que são
> registradas em `app/Config/Routes.php`.
>
> Base: `{{www}}/index.php/api/v1`
>
> Cada seção informa o arquivo de origem (`EndpointTable.php` / `EndPointView.php`)
> e, quando houver, os **filtros** aplicados.

### Legenda de filtros

| Filtro      | Onde é definido                              | Efeito                                             |
| ----------- | -------------------------------------------- | -------------------------------------------------- |
| `jwtauth`   | `Config/Filters.php` → `$filters['jwtauth']`  | Exige `Authorization: Bearer` com sessão ativa      |
| `adminonly` | `Config/Filters.php` → `$filters['adminonly']`| Exige perfil admin (sempre roda depois do `jwtauth`) |

Dois modos de aplicação, e a diferença importa na leitura das tabelas:

- **Por wildcard de URI** — vale para o grupo inteiro (`api/v1/<grupo>/*`).
  É o caso da maioria dos grupos.
- **Rota a rota** — usado **só** em `user-manager` e `user-profiles`, porque
  cada um tem exatamente uma rota pública (`create`, o Cadastro de Usuário)
  misturada com rotas administrativas; um wildcard vazaria o filtro para ela.
  O detalhe está no próprio `EndpointTable.php` desses dois grupos.

Rotas **sem** filtro são públicas.

---

## Auth — Login e sessão

Fonte: `Config/Routes/Api/v1/Auth/EndpointAuth.php` — emissão/consumo de JWT.
`login`, `refresh` e `logout` são públicos; `logout` identifica a sessão pelo
Bearer **ou** pelo `{ refresh_token }` do corpo (funciona com access expirado).

**Filtros:** `me`, `change-password` e `self-block` exigem `jwtauth`
(rota a rota, não por wildcard — ver `EndpointAuth.php`).

| Método | Rota                     | Controller::method                                |
| ------ | ------------------------ | ------------------------------------------------- |
| POST   | `/auth/login`            | `Api\V1\Auth\AuthController::login`               |
| POST   | `/auth/refresh`          | `Api\V1\Auth\AuthController::refresh`             |
| POST   | `/auth/logout`           | `Api\V1\Auth\AuthController::logout`              |
| GET    | `/auth/me`               | `Api\V1\Auth\AuthController::me`                  |
| PUT    | `/auth/change-password`  | `Api\V1\Auth\AuthController::changePassword`      |
| PATCH  | `/auth/self-block`       | `Api\V1\Auth\AuthController::selfBlock`           |

---

## User — Módulo de usuários

### user-manager

Fonte: `Config/Routes/Api/v1/User/UserManager/EndpointTable.php`

**Filtros (rota a rota):** todas as rotas exigem `jwtauth` + `adminonly`,
**exceto `create`**, que é pública — é a **etapa 1 do Cadastro de Usuário**.

| Método | Rota                                      | Controller::method                                                      |
| ------ | ----------------------------------------- | ----------------------------------------------------------------------- |
| POST   | `/user-manager/find`                      | `Api\V1\User\UserManager\ResourceTableController::find`                 |
| POST   | `/user-manager/get-grouped`               | `Api\V1\User\UserManager\ResourceTableController::getGrouped`           |
| GET    | `/user-manager/search`                    | `Api\V1\User\UserManager\ResourceTableController::search`               |
| GET    | `/user-manager/get/{id}`                  | `Api\V1\User\UserManager\ResourceTableController::get/$1`               |
| GET    | `/user-manager/get-all`                   | `Api\V1\User\UserManager\ResourceTableController::getAll`               |
| GET    | `/user-manager/get-no-pagination`         | `Api\V1\User\UserManager\ResourceTableController::getNoPagination`      |
| GET    | `/user-manager/get-deleted/{id}`          | `Api\V1\User\UserManager\ResourceTableController::getDeleted/$1`        |
| GET    | `/user-manager/get-with-deleted/{id}`     | `Api\V1\User\UserManager\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/user-manager/get-deleted-all`           | `Api\V1\User\UserManager\ResourceTableController::getDeletedAll`        | **pública** (etapa 1 do Cadastro) |
| GET    | `/user-manager/get-all-with-deleted/{id}` | `Api\V1\User\UserManager\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/user-manager/get-all-with-deleted`      | `Api\V1\User\UserManager\ResourceTableController::getAllWithDeleted`    |
| POST   | `/user-manager/create`                    | `Api\V1\User\UserManager\ResourceTableController::create`               |
| PUT    | `/user-manager/update/{id}`               | `Api\V1\User\UserManager\ResourceTableController::update/$1`            |
| DELETE | `/user-manager/delete-soft/{id}`          | `Api\V1\User\UserManager\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/user-manager/delete-restore/{id}`       | `Api\V1\User\UserManager\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/user-manager/delete-hard/{id}`          | `Api\V1\User\UserManager\ResourceTableController::deleteHard/$1`        |
| DELETE | `/user-manager/clear-deleted`             | `Api\V1\User\UserManager\ResourceTableController::clearDeleted`         |
| DELETE | `/user-manager/clear-deleted/{id}`        | `Api\V1\User\UserManager\ResourceTableController::clearDeleted/$1`      |

### user-manager-view

Fonte: `Config/Routes/Api/v1/User/UserManager/EndPointView.php` — consulta da view `view_user_manager` (somente leitura).

**Filtros:** `jwtauth` + `adminonly` (ambos por wildcard de URI) — expõe dados
sensíveis de qualquer usuário.

| Método | Rota                                      | Controller::method                                                  |
| ------ | ----------------------------------------- | ------------------------------------------------------------------- |
| POST   | `/user-manager-view/find`                 | `Api\V1\User\UserManager\ResourceViewController::find`              |
| POST   | `/user-manager-view/get-grouped`          | `Api\V1\User\UserManager\ResourceViewController::getGrouped`        |
| GET    | `/user-manager-view/search`               | `Api\V1\User\UserManager\ResourceViewController::search`            |
| GET    | `/user-manager-view/get/{id}`             | `Api\V1\User\UserManager\ResourceViewController::get/$1`            |
| GET    | `/user-manager-view/get-all`              | `Api\V1\User\UserManager\ResourceViewController::getAll`            |
| GET    | `/user-manager-view/get-no-pagination`    | `Api\V1\User\UserManager\ResourceViewController::getNoPagination`   |
| GET    | `/user-manager-view/get-deleted/{id}`     | `Api\V1\User\UserManager\ResourceViewController::getDeleted/$1`     |
| GET    | `/user-manager-view/get-all-with-deleted` | `Api\V1\User\UserManager\ResourceViewController::getAllWithDeleted` |
| GET    | `/user-manager-view/get-deleted-all`      | `Api\V1\User\UserManager\ResourceViewController::getDeletedAll`     |

### user-directory-view

Fonte: `Config/Routes/Api/v1/User/UserDirectory/EndPointView.php` — consulta da
view `view_user_directory` (somente leitura). **Diferente de
`user-manager-view`: filtro é só `jwtauth`, sem `adminonly`** — a view só tem
`id`/`um_username`/`uc_name`/`uc_email` (sem senha/status/role/CPF/telefone/
endereço), então é seguro liberar para qualquer usuário logado. Usado por
pickers de "convidar usuário" (ex.: campo Usuário do convite de calendário).
Detalhe: [`form/user/user_directory_view.md`](form/user/user_directory_view.md).

| Método | Rota                                          | Controller::method                                                     |
| ------ | ---------------------------------------------- | ----------------------------------------------------------------------- |
| POST   | `/user-directory-view/find`                    | `Api\V1\User\UserDirectory\ResourceViewController::find`              |
| POST   | `/user-directory-view/get-grouped`             | `Api\V1\User\UserDirectory\ResourceViewController::getGrouped`        |
| GET    | `/user-directory-view/search`                  | `Api\V1\User\UserDirectory\ResourceViewController::search`            |
| GET    | `/user-directory-view/get/{id}`                | `Api\V1\User\UserDirectory\ResourceViewController::get/$1`            |
| GET    | `/user-directory-view/get-all`                 | `Api\V1\User\UserDirectory\ResourceViewController::getAll`            |
| GET    | `/user-directory-view/get-no-pagination`       | `Api\V1\User\UserDirectory\ResourceViewController::getNoPagination`   |
| GET    | `/user-directory-view/get-deleted/{id}`        | `Api\V1\User\UserDirectory\ResourceViewController::getDeleted/$1`     |
| GET    | `/user-directory-view/get-all-with-deleted`    | `Api\V1\User\UserDirectory\ResourceViewController::getAllWithDeleted` |
| GET    | `/user-directory-view/get-deleted-all`         | `Api\V1\User\UserDirectory\ResourceViewController::getDeletedAll`     |

### user-roles

Fonte: `Config/Routes/Api/v1/User/UserRoles/EndpointTable.php` — perfis de acesso.
Contrato canônico **completo** (18 rotas). Na prática o frontend consome apenas
a leitura (fonte de `select` do "Grupo de perfil"), mas as rotas de escrita
existem.

**Filtros:** `jwtauth` (por wildcard de URI).

| Método | Rota                            | Controller::method                                                        |
| ------ | ------------------------------- | ------------------------------------------------------------------------- |
| POST   | `/user-roles/find`              | `Api\V1\User\UserRoles\ResourceTableController::find`                     |
| POST   | `/user-roles/get-grouped`       | `Api\V1\User\UserRoles\ResourceTableController::getGrouped`               |
| GET    | `/user-roles/search`            | `Api\V1\User\UserRoles\ResourceTableController::search`                   |
| GET    | `/user-roles/get/{id}`          | `Api\V1\User\UserRoles\ResourceTableController::get/$1`                   |
| GET    | `/user-roles/get-all`           | `Api\V1\User\UserRoles\ResourceTableController::getAll`                   |
| GET    | `/user-roles/get-no-pagination` | `Api\V1\User\UserRoles\ResourceTableController::getNoPagination`          |
| GET    | `/user-roles/get-deleted/{id}`  | `Api\V1\User\UserRoles\ResourceTableController::getDeleted/$1`            |
| GET    | `/user-roles/get-with-deleted/{id}` | `Api\V1\User\UserRoles\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/user-roles/get-deleted-all`   | `Api\V1\User\UserRoles\ResourceTableController::getDeletedAll`            |
| GET    | `/user-roles/get-all-with-deleted/{id}` | `Api\V1\User\UserRoles\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/user-roles/get-all-with-deleted` | `Api\V1\User\UserRoles\ResourceTableController::getAllWithDeleted`     |
| POST   | `/user-roles/create`            | `Api\V1\User\UserRoles\ResourceTableController::create`                   |
| PUT    | `/user-roles/update/{id}`       | `Api\V1\User\UserRoles\ResourceTableController::update/$1`                |
| DELETE | `/user-roles/delete-soft/{id}`  | `Api\V1\User\UserRoles\ResourceTableController::deleteSoft/$1`            |
| PATCH  | `/user-roles/delete-restore/{id}` | `Api\V1\User\UserRoles\ResourceTableController::deleteRestore/$1`       |
| DELETE | `/user-roles/delete-hard/{id}`  | `Api\V1\User\UserRoles\ResourceTableController::deleteHard/$1`            |
| DELETE | `/user-roles/clear-deleted`     | `Api\V1\User\UserRoles\ResourceTableController::clearDeleted`             |
| DELETE | `/user-roles/clear-deleted/{id}`| `Api\V1\User\UserRoles\ResourceTableController::clearDeleted/$1`          |

### user-profiles

Fonte: `Config/Routes/Api/v1/User/UserProfiles/EndpointTable.php` — 19 rotas
(as 18 canônicas + `me`).

**Filtros (rota a rota):**

| Rota                | Filtros                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `create`            | **pública** (etapa 2 do Cadastro de Usuário)                                                    |
| `me`, `update/{id}` | `jwtauth` apenas — self-service; `update` restringe não-admin ao próprio registro no Processor  |
| todas as demais     | `jwtauth` + `adminonly` (listagem em massa e exclusão expõem/apagam dados de QUALQUER usuário)  |

| Método | Rota                                       | Controller::method                                                       |
| ------ | ------------------------------------------ | ------------------------------------------------------------------------ |
| GET    | `/user-profiles/me`                        | `Api\V1\User\UserProfiles\ResourceTableController::me`                   |
| POST   | `/user-profiles/find`                      | `Api\V1\User\UserProfiles\ResourceTableController::find`                 |
| POST   | `/user-profiles/get-grouped`               | `Api\V1\User\UserProfiles\ResourceTableController::getGrouped`           |
| GET    | `/user-profiles/search`                    | `Api\V1\User\UserProfiles\ResourceTableController::search`               |
| GET    | `/user-profiles/get/{id}`                  | `Api\V1\User\UserProfiles\ResourceTableController::get/$1`               |
| GET    | `/user-profiles/get-all`                   | `Api\V1\User\UserProfiles\ResourceTableController::getAll`               |
| GET    | `/user-profiles/get-no-pagination`         | `Api\V1\User\UserProfiles\ResourceTableController::getNoPagination`      |
| GET    | `/user-profiles/get-deleted/{id}`          | `Api\V1\User\UserProfiles\ResourceTableController::getDeleted/$1`        |
| GET    | `/user-profiles/get-with-deleted/{id}`     | `Api\V1\User\UserProfiles\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/user-profiles/get-deleted-all`           | `Api\V1\User\UserProfiles\ResourceTableController::getDeletedAll`        |
| GET    | `/user-profiles/get-all-with-deleted/{id}` | `Api\V1\User\UserProfiles\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/user-profiles/get-all-with-deleted`      | `Api\V1\User\UserProfiles\ResourceTableController::getAllWithDeleted`    |
| POST   | `/user-profiles/create`                    | `Api\V1\User\UserProfiles\ResourceTableController::create`               | **pública** (etapa 2 do Cadastro) |
| PUT    | `/user-profiles/update/{id}`               | `Api\V1\User\UserProfiles\ResourceTableController::update/$1`            | self-service: só `jwtauth`        |
| DELETE | `/user-profiles/delete-soft/{id}`          | `Api\V1\User\UserProfiles\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/user-profiles/delete-restore/{id}`       | `Api\V1\User\UserProfiles\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/user-profiles/delete-hard/{id}`          | `Api\V1\User\UserProfiles\ResourceTableController::deleteHard/$1`        |
| DELETE | `/user-profiles/clear-deleted`             | `Api\V1\User\UserProfiles\ResourceTableController::clearDeleted`         |
| DELETE | `/user-profiles/clear-deleted/{id}`        | `Api\V1\User\UserProfiles\ResourceTableController::clearDeleted/$1`      |

---

## Upload — Módulo de uploads (anexos polimórficos de outros módulos)

**Filtros:** `jwtauth` (por wildcard de URI) em todos os grupos deste módulo.

### upload-manager

Fonte: `Config/Routes/Api/v1/Upload/UploadManager/EndpointTable.php` — contrato canônico (18 rotas).

| Método | Rota                                        | Controller::method                                                          |
| ------ | ------------------------------------------- | --------------------------------------------------------------------------- |
| POST   | `/upload-manager/find`                      | `Api\V1\Upload\UploadManager\ResourceTableController::find`                 |
| POST   | `/upload-manager/get-grouped`               | `Api\V1\Upload\UploadManager\ResourceTableController::getGrouped`           |
| GET    | `/upload-manager/search`                    | `Api\V1\Upload\UploadManager\ResourceTableController::search`               |
| GET    | `/upload-manager/get/{id}`                  | `Api\V1\Upload\UploadManager\ResourceTableController::get/$1`               |
| GET    | `/upload-manager/get-all`                   | `Api\V1\Upload\UploadManager\ResourceTableController::getAll`               |
| GET    | `/upload-manager/get-no-pagination`         | `Api\V1\Upload\UploadManager\ResourceTableController::getNoPagination`      |
| GET    | `/upload-manager/get-deleted/{id}`          | `Api\V1\Upload\UploadManager\ResourceTableController::getDeleted/$1`        |
| GET    | `/upload-manager/get-with-deleted/{id}`     | `Api\V1\Upload\UploadManager\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/upload-manager/get-deleted-all`           | `Api\V1\Upload\UploadManager\ResourceTableController::getDeletedAll`        |
| GET    | `/upload-manager/get-all-with-deleted/{id}` | `Api\V1\Upload\UploadManager\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/upload-manager/get-all-with-deleted`      | `Api\V1\Upload\UploadManager\ResourceTableController::getAllWithDeleted`    |
| POST   | `/upload-manager/create`                    | `Api\V1\Upload\UploadManager\ResourceTableController::create`               |
| PUT    | `/upload-manager/update/{id}`               | `Api\V1\Upload\UploadManager\ResourceTableController::update/$1`            |
| DELETE | `/upload-manager/delete-soft/{id}`          | `Api\V1\Upload\UploadManager\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/upload-manager/delete-restore/{id}`       | `Api\V1\Upload\UploadManager\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/upload-manager/delete-hard/{id}`          | `Api\V1\Upload\UploadManager\ResourceTableController::deleteHard/$1`        |
| DELETE | `/upload-manager/clear-deleted`             | `Api\V1\Upload\UploadManager\ResourceTableController::clearDeleted`         |
| DELETE | `/upload-manager/clear-deleted/{id}`        | `Api\V1\Upload\UploadManager\ResourceTableController::clearDeleted/$1`      |

Fonte: `Config/Routes/Api/v1/Upload/UploadManager/EndpointUpload.php` — rotas específicas do módulo (multipart + streaming de binário), fora do contrato canônico de 18 rotas (ver `README_modulo_upload.md`, seção "Desvios sancionados").

| Método | Rota                            | Controller::method                                                 | Observação                                                                                                   |
| ------ | ------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| POST   | `/upload-manager/upload`        | `Api\V1\Upload\UploadManager\ResourceTableController::upload`      | multipart/form-data: `file` (obrigatório), `module`, `reference_id`, `collection?`, `title?`, `description?` |
| GET    | `/upload-manager/serve/{id}`    | `Api\V1\Upload\UploadManager\ResourceTableController::serve/$1`    | binário inline                                                                                               |
| GET    | `/upload-manager/download/{id}` | `Api\V1\Upload\UploadManager\ResourceTableController::download/$1` | binário como anexo                                                                                           |

### upload-manager-view

Fonte: `Config/Routes/Api/v1/Upload/UploadManager/EndPointView.php` — consulta da view `view_upload_manager` (contrato canônico, 10 linhas / 9 rotas).

| Método | Rota                                        | Controller::method                                                      |
| ------ | ------------------------------------------- | ----------------------------------------------------------------------- |
| POST   | `/upload-manager-view/find`                 | `Api\V1\Upload\UploadManager\ResourceViewController::find`              |
| POST   | `/upload-manager-view/get-grouped`          | `Api\V1\Upload\UploadManager\ResourceViewController::getGrouped`        |
| GET    | `/upload-manager-view/search`               | `Api\V1\Upload\UploadManager\ResourceViewController::search`            |
| GET    | `/upload-manager-view/get/{id}`             | `Api\V1\Upload\UploadManager\ResourceViewController::get/$1`            |
| GET    | `/upload-manager-view/get-all`              | `Api\V1\Upload\UploadManager\ResourceViewController::getAll`            |
| GET    | `/upload-manager-view/get-no-pagination`    | `Api\V1\Upload\UploadManager\ResourceViewController::getNoPagination`   |
| GET    | `/upload-manager-view/get-deleted/{id}`     | `Api\V1\Upload\UploadManager\ResourceViewController::getDeleted/$1`     |
| GET    | `/upload-manager-view/get-all-with-deleted` | `Api\V1\Upload\UploadManager\ResourceViewController::getAllWithDeleted` |
| GET    | `/upload-manager-view/get-deleted-all`      | `Api\V1\Upload\UploadManager\ResourceViewController::getDeletedAll`     |

---

## Form — Módulo de formulários dinâmicos

Hierarquia: `form_manager` > `form_groups` > `form_rows` > `form_fields` (rota
`form-campos`) + view de ligação `view_form_manager`.

**Filtros:** `jwtauth` (por wildcard de URI) nas tabelas (`form-manager`,
`form-groups`, `form-rows`, `form-campos`). A **única exceção é
`form-manager-view`**, sem filtro — é o endpoint que o renderizador público de
formulários consome (autocadastro).

### form-manager

Fonte: `Config/Routes/Api/v1/Form/FormManager/EndpointTable.php`

| Método | Rota                                      | Controller::method                                                      |
| ------ | ----------------------------------------- | ----------------------------------------------------------------------- |
| POST   | `/form-manager/find`                      | `Api\V1\Form\FormManager\ResourceTableController::find`                 |
| POST   | `/form-manager/get-grouped`               | `Api\V1\Form\FormManager\ResourceTableController::getGrouped`           |
| GET    | `/form-manager/search`                    | `Api\V1\Form\FormManager\ResourceTableController::search`               |
| GET    | `/form-manager/get/{id}`                  | `Api\V1\Form\FormManager\ResourceTableController::get/$1`               |
| GET    | `/form-manager/get-all`                   | `Api\V1\Form\FormManager\ResourceTableController::getAll`               |
| GET    | `/form-manager/get-no-pagination`         | `Api\V1\Form\FormManager\ResourceTableController::getNoPagination`      |
| GET    | `/form-manager/get-deleted/{id}`          | `Api\V1\Form\FormManager\ResourceTableController::getDeleted/$1`        |
| GET    | `/form-manager/get-with-deleted/{id}`     | `Api\V1\Form\FormManager\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/form-manager/get-deleted-all`           | `Api\V1\Form\FormManager\ResourceTableController::getDeletedAll`        |
| GET    | `/form-manager/get-all-with-deleted/{id}` | `Api\V1\Form\FormManager\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/form-manager/get-all-with-deleted`      | `Api\V1\Form\FormManager\ResourceTableController::getAllWithDeleted`    |
| POST   | `/form-manager/create`                    | `Api\V1\Form\FormManager\ResourceTableController::create`               |
| PUT    | `/form-manager/update/{id}`               | `Api\V1\Form\FormManager\ResourceTableController::update/$1`            |
| DELETE | `/form-manager/delete-soft/{id}`          | `Api\V1\Form\FormManager\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/form-manager/delete-restore/{id}`       | `Api\V1\Form\FormManager\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/form-manager/delete-hard/{id}`          | `Api\V1\Form\FormManager\ResourceTableController::deleteHard/$1`        |
| DELETE | `/form-manager/clear-deleted`             | `Api\V1\Form\FormManager\ResourceTableController::clearDeleted`         |
| DELETE | `/form-manager/clear-deleted/{id}`        | `Api\V1\Form\FormManager\ResourceTableController::clearDeleted/$1`      |

### form-manager-view

Fonte: `Config/Routes/Api/v1/Form/FormManager/EndPointView.php` — consulta da view `view_form_manager` (somente leitura).

| Método | Rota                                      | Controller::method                                                  |
| ------ | ----------------------------------------- | ------------------------------------------------------------------- |
| POST   | `/form-manager-view/find`                 | `Api\V1\Form\FormManager\ResourceViewController::find`              |
| POST   | `/form-manager-view/get-grouped`          | `Api\V1\Form\FormManager\ResourceViewController::getGrouped`        |
| GET    | `/form-manager-view/search`               | `Api\V1\Form\FormManager\ResourceViewController::search`            |
| GET    | `/form-manager-view/get/{id}`             | `Api\V1\Form\FormManager\ResourceViewController::get/$1`            |
| GET    | `/form-manager-view/get-all`              | `Api\V1\Form\FormManager\ResourceViewController::getAll`            |
| GET    | `/form-manager-view/get-no-pagination`    | `Api\V1\Form\FormManager\ResourceViewController::getNoPagination`   |
| GET    | `/form-manager-view/get-deleted/{id}`     | `Api\V1\Form\FormManager\ResourceViewController::getDeleted/$1`     |
| GET    | `/form-manager-view/get-all-with-deleted` | `Api\V1\Form\FormManager\ResourceViewController::getAllWithDeleted` |
| GET    | `/form-manager-view/get-deleted-all`      | `Api\V1\Form\FormManager\ResourceViewController::getDeletedAll`     |

### form-groups

Fonte: `Config/Routes/Api/v1/Form/FormGroups/EndpointTable.php`

| Método | Rota                                     | Controller::method                                                     |
| ------ | ---------------------------------------- | ---------------------------------------------------------------------- |
| POST   | `/form-groups/find`                      | `Api\V1\Form\FormGroups\ResourceTableController::find`                 |
| POST   | `/form-groups/get-grouped`               | `Api\V1\Form\FormGroups\ResourceTableController::getGrouped`           |
| GET    | `/form-groups/search`                    | `Api\V1\Form\FormGroups\ResourceTableController::search`               |
| GET    | `/form-groups/get/{id}`                  | `Api\V1\Form\FormGroups\ResourceTableController::get/$1`               |
| GET    | `/form-groups/get-all`                   | `Api\V1\Form\FormGroups\ResourceTableController::getAll`               |
| GET    | `/form-groups/get-no-pagination`         | `Api\V1\Form\FormGroups\ResourceTableController::getNoPagination`      |
| GET    | `/form-groups/get-deleted/{id}`          | `Api\V1\Form\FormGroups\ResourceTableController::getDeleted/$1`        |
| GET    | `/form-groups/get-with-deleted/{id}`     | `Api\V1\Form\FormGroups\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/form-groups/get-deleted-all`           | `Api\V1\Form\FormGroups\ResourceTableController::getDeletedAll`        |
| GET    | `/form-groups/get-all-with-deleted/{id}` | `Api\V1\Form\FormGroups\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/form-groups/get-all-with-deleted`      | `Api\V1\Form\FormGroups\ResourceTableController::getAllWithDeleted`    |
| POST   | `/form-groups/create`                    | `Api\V1\Form\FormGroups\ResourceTableController::create`               |
| PUT    | `/form-groups/update/{id}`               | `Api\V1\Form\FormGroups\ResourceTableController::update/$1`            |
| DELETE | `/form-groups/delete-soft/{id}`          | `Api\V1\Form\FormGroups\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/form-groups/delete-restore/{id}`       | `Api\V1\Form\FormGroups\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/form-groups/delete-hard/{id}`          | `Api\V1\Form\FormGroups\ResourceTableController::deleteHard/$1`        |
| DELETE | `/form-groups/clear-deleted`             | `Api\V1\Form\FormGroups\ResourceTableController::clearDeleted`         |
| DELETE | `/form-groups/clear-deleted/{id}`        | `Api\V1\Form\FormGroups\ResourceTableController::clearDeleted/$1`      |

### form-rows

Fonte: `Config/Routes/Api/v1/Form/FormRows/EndpointTable.php`

| Método | Rota                                   | Controller::method                                                   |
| ------ | -------------------------------------- | -------------------------------------------------------------------- |
| POST   | `/form-rows/find`                      | `Api\V1\Form\FormRows\ResourceTableController::find`                 |
| POST   | `/form-rows/get-grouped`               | `Api\V1\Form\FormRows\ResourceTableController::getGrouped`           |
| GET    | `/form-rows/search`                    | `Api\V1\Form\FormRows\ResourceTableController::search`               |
| GET    | `/form-rows/get/{id}`                  | `Api\V1\Form\FormRows\ResourceTableController::get/$1`               |
| GET    | `/form-rows/get-all`                   | `Api\V1\Form\FormRows\ResourceTableController::getAll`               |
| GET    | `/form-rows/get-no-pagination`         | `Api\V1\Form\FormRows\ResourceTableController::getNoPagination`      |
| GET    | `/form-rows/get-deleted/{id}`          | `Api\V1\Form\FormRows\ResourceTableController::getDeleted/$1`        |
| GET    | `/form-rows/get-with-deleted/{id}`     | `Api\V1\Form\FormRows\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/form-rows/get-deleted-all`           | `Api\V1\Form\FormRows\ResourceTableController::getDeletedAll`        |
| GET    | `/form-rows/get-all-with-deleted/{id}` | `Api\V1\Form\FormRows\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/form-rows/get-all-with-deleted`      | `Api\V1\Form\FormRows\ResourceTableController::getAllWithDeleted`    |
| POST   | `/form-rows/create`                    | `Api\V1\Form\FormRows\ResourceTableController::create`               |
| PUT    | `/form-rows/update/{id}`               | `Api\V1\Form\FormRows\ResourceTableController::update/$1`            |
| DELETE | `/form-rows/delete-soft/{id}`          | `Api\V1\Form\FormRows\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/form-rows/delete-restore/{id}`       | `Api\V1\Form\FormRows\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/form-rows/delete-hard/{id}`          | `Api\V1\Form\FormRows\ResourceTableController::deleteHard/$1`        |
| DELETE | `/form-rows/clear-deleted`             | `Api\V1\Form\FormRows\ResourceTableController::clearDeleted`         |
| DELETE | `/form-rows/clear-deleted/{id}`        | `Api\V1\Form\FormRows\ResourceTableController::clearDeleted/$1`      |

### form-campos

Fonte: `Config/Routes/Api/v1/Form/FormCampos/EndpointTable.php` — manipula a tabela `form_fields` (slug de rota: `form-campos`).

| Método | Rota                                     | Controller::method                                                     |
| ------ | ---------------------------------------- | ---------------------------------------------------------------------- |
| POST   | `/form-campos/find`                      | `Api\V1\Form\FormCampos\ResourceTableController::find`                 |
| POST   | `/form-campos/get-grouped`               | `Api\V1\Form\FormCampos\ResourceTableController::getGrouped`           |
| GET    | `/form-campos/search`                    | `Api\V1\Form\FormCampos\ResourceTableController::search`               |
| GET    | `/form-campos/get/{id}`                  | `Api\V1\Form\FormCampos\ResourceTableController::get/$1`               |
| GET    | `/form-campos/get-all`                   | `Api\V1\Form\FormCampos\ResourceTableController::getAll`               |
| GET    | `/form-campos/get-no-pagination`         | `Api\V1\Form\FormCampos\ResourceTableController::getNoPagination`      |
| GET    | `/form-campos/get-deleted/{id}`          | `Api\V1\Form\FormCampos\ResourceTableController::getDeleted/$1`        |
| GET    | `/form-campos/get-with-deleted/{id}`     | `Api\V1\Form\FormCampos\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/form-campos/get-deleted-all`           | `Api\V1\Form\FormCampos\ResourceTableController::getDeletedAll`        |
| GET    | `/form-campos/get-all-with-deleted/{id}` | `Api\V1\Form\FormCampos\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/form-campos/get-all-with-deleted`      | `Api\V1\Form\FormCampos\ResourceTableController::getAllWithDeleted`    |
| POST   | `/form-campos/create`                    | `Api\V1\Form\FormCampos\ResourceTableController::create`               |
| PUT    | `/form-campos/update/{id}`               | `Api\V1\Form\FormCampos\ResourceTableController::update/$1`            |
| DELETE | `/form-campos/delete-soft/{id}`          | `Api\V1\Form\FormCampos\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/form-campos/delete-restore/{id}`       | `Api\V1\Form\FormCampos\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/form-campos/delete-hard/{id}`          | `Api\V1\Form\FormCampos\ResourceTableController::deleteHard/$1`        |
| DELETE | `/form-campos/clear-deleted`             | `Api\V1\Form\FormCampos\ResourceTableController::clearDeleted`         |
| DELETE | `/form-campos/clear-deleted/{id}`        | `Api\V1\Form\FormCampos\ResourceTableController::clearDeleted/$1`      |

---

## List — Módulo de construtor de listagens

Hierarquia: `list_manager` > `list_columns` e `list_manager` > `list_actions`
(duas coleções irmãs, sem aninhamento entre elas). Mesmo endpoint-set do módulo
Form — contrato canônico (18 rotas) em cada tabela.

**Filtros:** `jwtauth` (por wildcard de URI) nas três tabelas.

### list-manager

Fonte: `Config/Routes/Api/v1/List/ListManager/EndpointTable.php`

| Método | Rota                                      | Controller::method                                                      |
| ------ | ----------------------------------------- | ----------------------------------------------------------------------- |
| POST   | `/list-manager/find`                      | `Api\V1\List\ListManager\ResourceTableController::find`                 |
| POST   | `/list-manager/get-grouped`               | `Api\V1\List\ListManager\ResourceTableController::getGrouped`           |
| GET    | `/list-manager/search`                    | `Api\V1\List\ListManager\ResourceTableController::search`               |
| GET    | `/list-manager/get/{id}`                  | `Api\V1\List\ListManager\ResourceTableController::get/$1`               |
| GET    | `/list-manager/get-all`                   | `Api\V1\List\ListManager\ResourceTableController::getAll`               |
| GET    | `/list-manager/get-no-pagination`         | `Api\V1\List\ListManager\ResourceTableController::getNoPagination`      |
| GET    | `/list-manager/get-deleted/{id}`          | `Api\V1\List\ListManager\ResourceTableController::getDeleted/$1`        |
| GET    | `/list-manager/get-with-deleted/{id}`     | `Api\V1\List\ListManager\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/list-manager/get-deleted-all`           | `Api\V1\List\ListManager\ResourceTableController::getDeletedAll`        |
| GET    | `/list-manager/get-all-with-deleted/{id}` | `Api\V1\List\ListManager\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/list-manager/get-all-with-deleted`      | `Api\V1\List\ListManager\ResourceTableController::getAllWithDeleted`    |
| POST   | `/list-manager/create`                    | `Api\V1\List\ListManager\ResourceTableController::create`               |
| PUT    | `/list-manager/update/{id}`               | `Api\V1\List\ListManager\ResourceTableController::update/$1`            |
| DELETE | `/list-manager/delete-soft/{id}`          | `Api\V1\List\ListManager\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/list-manager/delete-restore/{id}`       | `Api\V1\List\ListManager\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/list-manager/delete-hard/{id}`          | `Api\V1\List\ListManager\ResourceTableController::deleteHard/$1`        |
| DELETE | `/list-manager/clear-deleted`             | `Api\V1\List\ListManager\ResourceTableController::clearDeleted`         |
| DELETE | `/list-manager/clear-deleted/{id}`        | `Api\V1\List\ListManager\ResourceTableController::clearDeleted/$1`      |

### list-columns

Fonte: `Config/Routes/Api/v1/List/ListColumns/EndpointTable.php`

| Método | Rota                                      | Controller::method                                                      |
| ------ | ----------------------------------------- | ----------------------------------------------------------------------- |
| POST   | `/list-columns/find`                      | `Api\V1\List\ListColumns\ResourceTableController::find`                 |
| POST   | `/list-columns/get-grouped`               | `Api\V1\List\ListColumns\ResourceTableController::getGrouped`           |
| GET    | `/list-columns/search`                    | `Api\V1\List\ListColumns\ResourceTableController::search`               |
| GET    | `/list-columns/get/{id}`                  | `Api\V1\List\ListColumns\ResourceTableController::get/$1`               |
| GET    | `/list-columns/get-all`                   | `Api\V1\List\ListColumns\ResourceTableController::getAll`               |
| GET    | `/list-columns/get-no-pagination`         | `Api\V1\List\ListColumns\ResourceTableController::getNoPagination`      |
| GET    | `/list-columns/get-deleted/{id}`          | `Api\V1\List\ListColumns\ResourceTableController::getDeleted/$1`        |
| GET    | `/list-columns/get-with-deleted/{id}`     | `Api\V1\List\ListColumns\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/list-columns/get-deleted-all`           | `Api\V1\List\ListColumns\ResourceTableController::getDeletedAll`        |
| GET    | `/list-columns/get-all-with-deleted/{id}` | `Api\V1\List\ListColumns\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/list-columns/get-all-with-deleted`      | `Api\V1\List\ListColumns\ResourceTableController::getAllWithDeleted`    |
| POST   | `/list-columns/create`                    | `Api\V1\List\ListColumns\ResourceTableController::create`               |
| PUT    | `/list-columns/update/{id}`               | `Api\V1\List\ListColumns\ResourceTableController::update/$1`            |
| DELETE | `/list-columns/delete-soft/{id}`          | `Api\V1\List\ListColumns\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/list-columns/delete-restore/{id}`       | `Api\V1\List\ListColumns\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/list-columns/delete-hard/{id}`          | `Api\V1\List\ListColumns\ResourceTableController::deleteHard/$1`        |
| DELETE | `/list-columns/clear-deleted`             | `Api\V1\List\ListColumns\ResourceTableController::clearDeleted`         |
| DELETE | `/list-columns/clear-deleted/{id}`        | `Api\V1\List\ListColumns\ResourceTableController::clearDeleted/$1`      |

### list-actions

Fonte: `Config/Routes/Api/v1/List/ListActions/EndpointTable.php`

| Método | Rota                                      | Controller::method                                                      |
| ------ | ----------------------------------------- | ----------------------------------------------------------------------- |
| POST   | `/list-actions/find`                      | `Api\V1\List\ListActions\ResourceTableController::find`                 |
| POST   | `/list-actions/get-grouped`               | `Api\V1\List\ListActions\ResourceTableController::getGrouped`           |
| GET    | `/list-actions/search`                    | `Api\V1\List\ListActions\ResourceTableController::search`               |
| GET    | `/list-actions/get/{id}`                  | `Api\V1\List\ListActions\ResourceTableController::get/$1`               |
| GET    | `/list-actions/get-all`                   | `Api\V1\List\ListActions\ResourceTableController::getAll`               |
| GET    | `/list-actions/get-no-pagination`         | `Api\V1\List\ListActions\ResourceTableController::getNoPagination`      |
| GET    | `/list-actions/get-deleted/{id}`          | `Api\V1\List\ListActions\ResourceTableController::getDeleted/$1`        |
| GET    | `/list-actions/get-with-deleted/{id}`     | `Api\V1\List\ListActions\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/list-actions/get-deleted-all`           | `Api\V1\List\ListActions\ResourceTableController::getDeletedAll`        |
| GET    | `/list-actions/get-all-with-deleted/{id}` | `Api\V1\List\ListActions\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/list-actions/get-all-with-deleted`      | `Api\V1\List\ListActions\ResourceTableController::getAllWithDeleted`    |
| POST   | `/list-actions/create`                    | `Api\V1\List\ListActions\ResourceTableController::create`               |
| PUT    | `/list-actions/update/{id}`               | `Api\V1\List\ListActions\ResourceTableController::update/$1`            |
| DELETE | `/list-actions/delete-soft/{id}`          | `Api\V1\List\ListActions\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/list-actions/delete-restore/{id}`       | `Api\V1\List\ListActions\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/list-actions/delete-hard/{id}`          | `Api\V1\List\ListActions\ResourceTableController::deleteHard/$1`        |
| DELETE | `/list-actions/clear-deleted`             | `Api\V1\List\ListActions\ResourceTableController::clearDeleted`         |
| DELETE | `/list-actions/clear-deleted/{id}`        | `Api\V1\List\ListActions\ResourceTableController::clearDeleted/$1`      |

---

## BootstrapIcons — Catálogo de ícones do Bootstrap Icons

**Filtros:** `jwtauth` (por wildcard de URI).

### bootstrap-icons

Fonte: `Config/Routes/Api/v1/BootstrapIcons/EndpointTable.php` — catálogo de
ícones do Bootstrap Icons, consumido pelo `IconSelect` do frontend e populado
por `Database/Seeds/BootstrapIconsSeeder.php`. Contrato canônico (18 rotas).

| Método | Rota                                         | Controller::method                                                         |
| ------ | -------------------------------------------- | -------------------------------------------------------------------------- |
| POST   | `/bootstrap-icons/find`                      | `Api\V1\BootstrapIcons\ResourceTableController::find`                      |
| POST   | `/bootstrap-icons/get-grouped`               | `Api\V1\BootstrapIcons\ResourceTableController::getGrouped`                |
| GET    | `/bootstrap-icons/search`                    | `Api\V1\BootstrapIcons\ResourceTableController::search`                    |
| GET    | `/bootstrap-icons/get/{id}`                  | `Api\V1\BootstrapIcons\ResourceTableController::get/$1`                    |
| GET    | `/bootstrap-icons/get-all`                   | `Api\V1\BootstrapIcons\ResourceTableController::getAll`                    |
| GET    | `/bootstrap-icons/get-no-pagination`         | `Api\V1\BootstrapIcons\ResourceTableController::getNoPagination`           |
| GET    | `/bootstrap-icons/get-deleted/{id}`          | `Api\V1\BootstrapIcons\ResourceTableController::getDeleted/$1`             |
| GET    | `/bootstrap-icons/get-with-deleted/{id}`     | `Api\V1\BootstrapIcons\ResourceTableController::getWithDeleted/$1`         |
| GET    | `/bootstrap-icons/get-deleted-all`           | `Api\V1\BootstrapIcons\ResourceTableController::getDeletedAll`             |
| GET    | `/bootstrap-icons/get-all-with-deleted/{id}` | `Api\V1\BootstrapIcons\ResourceTableController::getAllWithDeleted/$1`      |
| GET    | `/bootstrap-icons/get-all-with-deleted`      | `Api\V1\BootstrapIcons\ResourceTableController::getAllWithDeleted`         |
| POST   | `/bootstrap-icons/create`                    | `Api\V1\BootstrapIcons\ResourceTableController::create`                    |
| PUT    | `/bootstrap-icons/update/{id}`               | `Api\V1\BootstrapIcons\ResourceTableController::update/$1`                 |
| DELETE | `/bootstrap-icons/delete-soft/{id}`          | `Api\V1\BootstrapIcons\ResourceTableController::deleteSoft/$1`             |
| PATCH  | `/bootstrap-icons/delete-restore/{id}`       | `Api\V1\BootstrapIcons\ResourceTableController::deleteRestore/$1`          |
| DELETE | `/bootstrap-icons/delete-hard/{id}`          | `Api\V1\BootstrapIcons\ResourceTableController::deleteHard/$1`             |
| DELETE | `/bootstrap-icons/clear-deleted`             | `Api\V1\BootstrapIcons\ResourceTableController::clearDeleted`              |
| DELETE | `/bootstrap-icons/clear-deleted/{id}`        | `Api\V1\BootstrapIcons\ResourceTableController::clearDeleted/$1`           |

---

## AuxCor — Catálogo de cores nomeadas

**Filtros:** `jwtauth` (por wildcard de URI).

### aux-cor

Fonte: `Config/Routes/Api/v1/AuxCor/EndpointTable.php` — catálogo de cores
nomeadas, consumido pelo `SelectField` do frontend quando há `colorKey`.
Contrato canônico (18 rotas). Populado por
`doc/sql/insert/20260923135922_aux_cor.sql`.

| Método | Rota                                  | Controller::method                                                   |
| ------ | ------------------------------------- | -------------------------------------------------------------------- |
| POST   | `/aux-cor/find`                       | `Api\V1\AuxCor\ResourceTableController::find`                        |
| POST   | `/aux-cor/get-grouped`                | `Api\V1\AuxCor\ResourceTableController::getGrouped`                  |
| GET    | `/aux-cor/search`                     | `Api\V1\AuxCor\ResourceTableController::search`                      |
| GET    | `/aux-cor/get/{id}`                   | `Api\V1\AuxCor\ResourceTableController::get/$1`                      |
| GET    | `/aux-cor/get-all`                    | `Api\V1\AuxCor\ResourceTableController::getAll`                      |
| GET    | `/aux-cor/get-no-pagination`          | `Api\V1\AuxCor\ResourceTableController::getNoPagination`             |
| GET    | `/aux-cor/get-deleted/{id}`           | `Api\V1\AuxCor\ResourceTableController::getDeleted/$1`               |
| GET    | `/aux-cor/get-with-deleted/{id}`      | `Api\V1\AuxCor\ResourceTableController::getWithDeleted/$1`           |
| GET    | `/aux-cor/get-deleted-all`            | `Api\V1\AuxCor\ResourceTableController::getDeletedAll`               |
| GET    | `/aux-cor/get-all-with-deleted/{id}`  | `Api\V1\AuxCor\ResourceTableController::getAllWithDeleted/$1`        |
| GET    | `/aux-cor/get-all-with-deleted`       | `Api\V1\AuxCor\ResourceTableController::getAllWithDeleted`           |
| POST   | `/aux-cor/create`                     | `Api\V1\AuxCor\ResourceTableController::create`                      |
| PUT    | `/aux-cor/update/{id}`                | `Api\V1\AuxCor\ResourceTableController::update/$1`                   |
| DELETE | `/aux-cor/delete-soft/{id}`           | `Api\V1\AuxCor\ResourceTableController::deleteSoft/$1`               |
| PATCH  | `/aux-cor/delete-restore/{id}`        | `Api\V1\AuxCor\ResourceTableController::deleteRestore/$1`            |
| DELETE | `/aux-cor/delete-hard/{id}`           | `Api\V1\AuxCor\ResourceTableController::deleteHard/$1`               |
| DELETE | `/aux-cor/clear-deleted`              | `Api\V1\AuxCor\ResourceTableController::clearDeleted`                |
| DELETE | `/aux-cor/clear-deleted/{id}`         | `Api\V1\AuxCor\ResourceTableController::clearDeleted/$1`             |

---

## Calendar — Módulo de calendário (espelho do Google Calendar)

Hierarquia: `calendar_manager` > `calendar_events` > `{attendees, reminders, attachments, extended_properties}`. APIs REST, contrato canônico (18 rotas) em todos os submódulos.

**Filtros:** `jwtauth` (por wildcard de URI) em todos os grupos deste módulo.

### calendar-manager

Fonte: `Config/Routes/Api/v1/Calendar/CalendarManager/EndpointTable.php`

| Método | Rota                                   | Controller::method                                                      |
| ------ | -------------------------------------- | ----------------------------------------------------------------------- |
| POST   | `/calendar-manager/find`                      | `Api\V1\Calendar\CalendarManager\ResourceTableController::find`                 |
| POST   | `/calendar-manager/get-grouped`               | `Api\V1\Calendar\CalendarManager\ResourceTableController::getGrouped`           |
| GET    | `/calendar-manager/search`                    | `Api\V1\Calendar\CalendarManager\ResourceTableController::search`               |
| GET    | `/calendar-manager/get/{id}`                  | `Api\V1\Calendar\CalendarManager\ResourceTableController::get/$1`               |
| GET    | `/calendar-manager/get-all`                   | `Api\V1\Calendar\CalendarManager\ResourceTableController::getAll`               |
| GET    | `/calendar-manager/get-no-pagination`         | `Api\V1\Calendar\CalendarManager\ResourceTableController::getNoPagination`      |
| GET    | `/calendar-manager/get-deleted/{id}`          | `Api\V1\Calendar\CalendarManager\ResourceTableController::getDeleted/$1`        |
| GET    | `/calendar-manager/get-with-deleted/{id}`     | `Api\V1\Calendar\CalendarManager\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/calendar-manager/get-deleted-all`           | `Api\V1\Calendar\CalendarManager\ResourceTableController::getDeletedAll`        |
| GET    | `/calendar-manager/get-all-with-deleted/{id}` | `Api\V1\Calendar\CalendarManager\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/calendar-manager/get-all-with-deleted`      | `Api\V1\Calendar\CalendarManager\ResourceTableController::getAllWithDeleted`    |
| POST   | `/calendar-manager/create`                    | `Api\V1\Calendar\CalendarManager\ResourceTableController::create`               |
| PUT    | `/calendar-manager/update/{id}`               | `Api\V1\Calendar\CalendarManager\ResourceTableController::update/$1`            |
| DELETE | `/calendar-manager/delete-soft/{id}`          | `Api\V1\Calendar\CalendarManager\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/calendar-manager/delete-restore/{id}`       | `Api\V1\Calendar\CalendarManager\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/calendar-manager/delete-hard/{id}`          | `Api\V1\Calendar\CalendarManager\ResourceTableController::deleteHard/$1`        |
| DELETE | `/calendar-manager/clear-deleted`             | `Api\V1\Calendar\CalendarManager\ResourceTableController::clearDeleted`         |
| DELETE | `/calendar-manager/clear-deleted/{id}`        | `Api\V1\Calendar\CalendarManager\ResourceTableController::clearDeleted/$1`      |

### calendar-manager-view

Fonte: `Config/Routes/Api/v1/Calendar/CalendarManager/EndPointView.php` — consulta
da view `view_calendar_manager` (somente leitura, 9 rotas). É a fonte da listagem
de calendários com seus eventos agrupados (`/v1/calendar-manager` no frontend).

**Filtros:** `jwtauth` (por wildcard de URI).

| Método | Rota                                                 | Controller::method                                                       |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------------------ |
| POST   | `/calendar-manager-view/find`                        | `Api\V1\Calendar\CalendarManager\ResourceViewController::find`           |
| POST   | `/calendar-manager-view/get-grouped`                 | `Api\V1\Calendar\CalendarManager\ResourceViewController::getGrouped`     |
| GET    | `/calendar-manager-view/search`                      | `Api\V1\Calendar\CalendarManager\ResourceViewController::search`         |
| GET    | `/calendar-manager-view/get/{id}`                    | `Api\V1\Calendar\CalendarManager\ResourceViewController::get/$1`         |
| GET    | `/calendar-manager-view/get-all`                     | `Api\V1\Calendar\CalendarManager\ResourceViewController::getAll`         |
| GET    | `/calendar-manager-view/get-no-pagination`           | `Api\V1\Calendar\CalendarManager\ResourceViewController::getNoPagination`|
| GET    | `/calendar-manager-view/get-deleted/{id}`            | `Api\V1\Calendar\CalendarManager\ResourceViewController::getDeleted/$1`  |
| GET    | `/calendar-manager-view/get-all-with-deleted`        | `Api\V1\Calendar\CalendarManager\ResourceViewController::getAllWithDeleted` |
| GET    | `/calendar-manager-view/get-deleted-all`             | `Api\V1\Calendar\CalendarManager\ResourceViewController::getDeletedAll`  |

### calendar-events

Fonte: `Config/Routes/Api/v1/Calendar/CalendarEvents/EndpointTable.php`

| Método | Rota                                         | Controller::method                                                           |
| ------ | -------------------------------------------- | ---------------------------------------------------------------------------- |
| POST   | `/calendar-events/find`                      | `Api\V1\Calendar\CalendarEvents\ResourceTableController::find`                 |
| POST   | `/calendar-events/get-grouped`               | `Api\V1\Calendar\CalendarEvents\ResourceTableController::getGrouped`           |
| GET    | `/calendar-events/search`                    | `Api\V1\Calendar\CalendarEvents\ResourceTableController::search`               |
| GET    | `/calendar-events/get/{id}`                  | `Api\V1\Calendar\CalendarEvents\ResourceTableController::get/$1`               |
| GET    | `/calendar-events/get-all`                   | `Api\V1\Calendar\CalendarEvents\ResourceTableController::getAll`               |
| GET    | `/calendar-events/get-no-pagination`         | `Api\V1\Calendar\CalendarEvents\ResourceTableController::getNoPagination`      |
| GET    | `/calendar-events/get-deleted/{id}`          | `Api\V1\Calendar\CalendarEvents\ResourceTableController::getDeleted/$1`        |
| GET    | `/calendar-events/get-with-deleted/{id}`     | `Api\V1\Calendar\CalendarEvents\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/calendar-events/get-deleted-all`           | `Api\V1\Calendar\CalendarEvents\ResourceTableController::getDeletedAll`        |
| GET    | `/calendar-events/get-all-with-deleted/{id}` | `Api\V1\Calendar\CalendarEvents\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/calendar-events/get-all-with-deleted`      | `Api\V1\Calendar\CalendarEvents\ResourceTableController::getAllWithDeleted`    |
| POST   | `/calendar-events/create`                    | `Api\V1\Calendar\CalendarEvents\ResourceTableController::create`               |
| PUT    | `/calendar-events/update/{id}`               | `Api\V1\Calendar\CalendarEvents\ResourceTableController::update/$1`            |
| DELETE | `/calendar-events/delete-soft/{id}`          | `Api\V1\Calendar\CalendarEvents\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/calendar-events/delete-restore/{id}`       | `Api\V1\Calendar\CalendarEvents\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/calendar-events/delete-hard/{id}`          | `Api\V1\Calendar\CalendarEvents\ResourceTableController::deleteHard/$1`        |
| DELETE | `/calendar-events/clear-deleted`             | `Api\V1\Calendar\CalendarEvents\ResourceTableController::clearDeleted`         |
| DELETE | `/calendar-events/clear-deleted/{id}`        | `Api\V1\Calendar\CalendarEvents\ResourceTableController::clearDeleted/$1`      |

### calendar-event-attendees

Fonte: `Config/Routes/Api/v1/Calendar/CalendarEventAttendees/EndpointTable.php`

| Método | Rota                                                  | Controller::method                                                                   |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| POST   | `/calendar-event-attendees/find`                      | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::find`                 |
| POST   | `/calendar-event-attendees/get-grouped`               | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getGrouped`           |
| GET    | `/calendar-event-attendees/search`                    | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::search`               |
| GET    | `/calendar-event-attendees/get/{id}`                  | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::get/$1`               |
| GET    | `/calendar-event-attendees/get-all`                   | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getAll`               |
| GET    | `/calendar-event-attendees/get-no-pagination`         | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getNoPagination`      |
| GET    | `/calendar-event-attendees/get-deleted/{id}`          | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getDeleted/$1`        |
| GET    | `/calendar-event-attendees/get-with-deleted/{id}`     | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/calendar-event-attendees/get-deleted-all`           | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getDeletedAll`        |
| GET    | `/calendar-event-attendees/get-all-with-deleted/{id}` | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/calendar-event-attendees/get-all-with-deleted`      | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::getAllWithDeleted`    |
| POST   | `/calendar-event-attendees/create`                    | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::create`               |
| PUT    | `/calendar-event-attendees/update/{id}`               | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::update/$1`            |
| PUT    | `/calendar-event-attendees/respond/{calendar_event_id}` | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::respond/$1` — self-service, aceita/recusa o próprio convite (não é do endpoint-set padrão) |
| DELETE | `/calendar-event-attendees/delete-soft/{id}`          | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/calendar-event-attendees/delete-restore/{id}`       | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/calendar-event-attendees/delete-hard/{id}`          | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::deleteHard/$1`        |
| DELETE | `/calendar-event-attendees/clear-deleted`             | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::clearDeleted`         |
| DELETE | `/calendar-event-attendees/clear-deleted/{id}`        | `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::clearDeleted/$1`      |

### calendar-event-reminders

Fonte: `Config/Routes/Api/v1/Calendar/CalendarEventReminders/EndpointTable.php`

| Método | Rota                                                  | Controller::method                                                                   |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| POST   | `/calendar-event-reminders/find`                      | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::find`                 |
| POST   | `/calendar-event-reminders/get-grouped`               | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getGrouped`           |
| GET    | `/calendar-event-reminders/search`                    | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::search`               |
| GET    | `/calendar-event-reminders/get/{id}`                  | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::get/$1`               |
| GET    | `/calendar-event-reminders/get-all`                   | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getAll`               |
| GET    | `/calendar-event-reminders/get-no-pagination`         | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getNoPagination`      |
| GET    | `/calendar-event-reminders/get-deleted/{id}`          | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getDeleted/$1`        |
| GET    | `/calendar-event-reminders/get-with-deleted/{id}`     | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/calendar-event-reminders/get-deleted-all`           | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getDeletedAll`        |
| GET    | `/calendar-event-reminders/get-all-with-deleted/{id}` | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/calendar-event-reminders/get-all-with-deleted`      | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::getAllWithDeleted`    |
| POST   | `/calendar-event-reminders/create`                    | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::create`               |
| PUT    | `/calendar-event-reminders/update/{id}`               | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::update/$1`            |
| DELETE | `/calendar-event-reminders/delete-soft/{id}`          | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/calendar-event-reminders/delete-restore/{id}`       | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/calendar-event-reminders/delete-hard/{id}`          | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::deleteHard/$1`        |
| DELETE | `/calendar-event-reminders/clear-deleted`             | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::clearDeleted`         |
| DELETE | `/calendar-event-reminders/clear-deleted/{id}`        | `Api\V1\Calendar\CalendarEventReminders\ResourceTableController::clearDeleted/$1`      |

### calendar-event-attachments

Fonte: `Config/Routes/Api/v1/Calendar/CalendarEventAttachments/EndpointTable.php`

| Método | Rota                                                    | Controller::method                                                                     |
| ------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| POST   | `/calendar-event-attachments/find`                      | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::find`                 |
| POST   | `/calendar-event-attachments/get-grouped`               | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::getGrouped`           |
| GET    | `/calendar-event-attachments/search`                    | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::search`               |
| GET    | `/calendar-event-attachments/get/{id}`                  | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::get/$1`               |
| GET    | `/calendar-event-attachments/get-all`                   | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::getAll`               |
| GET    | `/calendar-event-attachments/get-no-pagination`         | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::getNoPagination`      |
| GET    | `/calendar-event-attachments/get-deleted/{id}`          | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::getDeleted/$1`        |
| GET    | `/calendar-event-attachments/get-with-deleted/{id}`     | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/calendar-event-attachments/get-deleted-all`           | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::getDeletedAll`        |
| GET    | `/calendar-event-attachments/get-all-with-deleted/{id}` | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/calendar-event-attachments/get-all-with-deleted`      | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::getAllWithDeleted`    |
| POST   | `/calendar-event-attachments/create`                    | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::create`               |
| PUT    | `/calendar-event-attachments/update/{id}`               | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::update/$1`            |
| DELETE | `/calendar-event-attachments/delete-soft/{id}`          | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/calendar-event-attachments/delete-restore/{id}`       | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/calendar-event-attachments/delete-hard/{id}`          | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::deleteHard/$1`        |
| DELETE | `/calendar-event-attachments/clear-deleted`             | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::clearDeleted`         |
| DELETE | `/calendar-event-attachments/clear-deleted/{id}`        | `Api\V1\Calendar\CalendarEventAttachments\ResourceTableController::clearDeleted/$1`      |

### calendar-event-extended-properties

Fonte: `Config/Routes/Api/v1/Calendar/CalendarEventExtendedProperties/EndpointTable.php`

| Método | Rota                                                            | Controller::method                                                                            |
| ------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| POST   | `/calendar-event-extended-properties/find`                      | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::find`                 |
| POST   | `/calendar-event-extended-properties/get-grouped`               | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getGrouped`           |
| GET    | `/calendar-event-extended-properties/search`                    | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::search`               |
| GET    | `/calendar-event-extended-properties/get/{id}`                  | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::get/$1`               |
| GET    | `/calendar-event-extended-properties/get-all`                   | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getAll`               |
| GET    | `/calendar-event-extended-properties/get-no-pagination`         | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getNoPagination`      |
| GET    | `/calendar-event-extended-properties/get-deleted/{id}`          | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getDeleted/$1`        |
| GET    | `/calendar-event-extended-properties/get-with-deleted/{id}`     | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/calendar-event-extended-properties/get-deleted-all`           | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getDeletedAll`        |
| GET    | `/calendar-event-extended-properties/get-all-with-deleted/{id}` | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/calendar-event-extended-properties/get-all-with-deleted`      | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::getAllWithDeleted`    |
| POST   | `/calendar-event-extended-properties/create`                    | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::create`               |
| PUT    | `/calendar-event-extended-properties/update/{id}`               | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::update/$1`            |
| DELETE | `/calendar-event-extended-properties/delete-soft/{id}`          | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/calendar-event-extended-properties/delete-restore/{id}`       | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/calendar-event-extended-properties/delete-hard/{id}`          | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::deleteHard/$1`        |
| DELETE | `/calendar-event-extended-properties/clear-deleted`             | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::clearDeleted`         |
| DELETE | `/calendar-event-extended-properties/clear-deleted/{id}`        | `Api\V1\Calendar\CalendarEventExtendedProperties\ResourceTableController::clearDeleted/$1`      |

### calendar-event-invites

Fonte: `Config/Routes/Api/v1/Calendar/CalendarEventInvites/EndpointTable.php` —
convite de evento por e-mail com token temporário. Contrato canônico (18 rotas)
+ `accept-token` = 19 rotas.

**Filtros (rota a rota):** todas exigem `jwtauth`, **exceto `accept-token`**,
que é pública (o convidado clica no link do e-mail sem sessão ativa). Este
prefixo **não** está no wildcard de `Config/Filters.php` — mesmo padrão de rota
mista usado em `user-manager`.

| Método | Rota                                                       | Controller::method                                                                          |
| ------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| POST   | `/calendar-event-invites/find`                              | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::find`                         |
| POST   | `/calendar-event-invites/get-grouped`                       | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getGrouped`                   |
| GET    | `/calendar-event-invites/search`                            | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::search`                       |
| GET    | `/calendar-event-invites/get/{id}`                          | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::get/$1`                       |
| GET    | `/calendar-event-invites/get-all`                           | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getAll`                       |
| GET    | `/calendar-event-invites/get-no-pagination`                 | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getNoPagination`              |
| GET    | `/calendar-event-invites/get-deleted/{id}`                  | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getDeleted/$1`                |
| GET    | `/calendar-event-invites/get-with-deleted/{id}`             | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getWithDeleted/$1`            |
| GET    | `/calendar-event-invites/get-deleted-all`                   | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getDeletedAll`                |
| GET    | `/calendar-event-invites/get-all-with-deleted/{id}`         | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getAllWithDeleted/$1`         |
| GET    | `/calendar-event-invites/get-all-with-deleted`              | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::getAllWithDeleted`            |
| POST   | `/calendar-event-invites/create`                            | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::create`                       |
| PUT    | `/calendar-event-invites/update/{id}`                       | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::update/$1`                    |
| POST   | `/calendar-event-invites/accept-token`                      | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::acceptToken`                  | **pública** (link do e-mail) |
| DELETE | `/calendar-event-invites/delete-soft/{id}`                  | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::deleteSoft/$1`                |
| PATCH  | `/calendar-event-invites/delete-restore/{id}`               | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::deleteRestore/$1`             |
| DELETE | `/calendar-event-invites/delete-hard/{id}`                  | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::deleteHard/$1`                |
| DELETE | `/calendar-event-invites/clear-deleted`                     | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::clearDeleted`                 |
| DELETE | `/calendar-event-invites/clear-deleted/{id}`                | `Api\V1\Calendar\CalendarEventInvites\ResourceTableController::clearDeleted/$1`              |

---

## Nav — Config/branding do app e da navbar

Guarda nome do app, imagem, ícone de mensagens e versão do sistema — a "casca"
em volta do Menu, não o menu em si.

**Filtros:** `jwtauth` (por wildcard de URI).

### nav-manager

Fonte: `Config/Routes/Api/v1/Nav/NavManager/EndpointTable.php` — contrato canônico (18 rotas).

| Método | Rota                                     | Controller::method                                                     |
| ------ | ---------------------------------------- | ---------------------------------------------------------------------- |
| POST   | `/nav-manager/find`                      | `Api\V1\Nav\NavManager\ResourceTableController::find`                  |
| POST   | `/nav-manager/get-grouped`               | `Api\V1\Nav\NavManager\ResourceTableController::getGrouped`            |
| GET    | `/nav-manager/search`                    | `Api\V1\Nav\NavManager\ResourceTableController::search`                |
| GET    | `/nav-manager/get/{id}`                  | `Api\V1\Nav\NavManager\ResourceTableController::get/$1`                |
| GET    | `/nav-manager/get-all`                   | `Api\V1\Nav\NavManager\ResourceTableController::getAll`                |
| GET    | `/nav-manager/get-no-pagination`         | `Api\V1\Nav\NavManager\ResourceTableController::getNoPagination`       |
| GET    | `/nav-manager/get-deleted/{id}`          | `Api\V1\Nav\NavManager\ResourceTableController::getDeleted/$1`         |
| GET    | `/nav-manager/get-with-deleted/{id}`     | `Api\V1\Nav\NavManager\ResourceTableController::getWithDeleted/$1`     |
| GET    | `/nav-manager/get-deleted-all`           | `Api\V1\Nav\NavManager\ResourceTableController::getDeletedAll`         |
| GET    | `/nav-manager/get-all-with-deleted/{id}` | `Api\V1\Nav\NavManager\ResourceTableController::getAllWithDeleted/$1`  |
| GET    | `/nav-manager/get-all-with-deleted`      | `Api\V1\Nav\NavManager\ResourceTableController::getAllWithDeleted`     |
| POST   | `/nav-manager/create`                    | `Api\V1\Nav\NavManager\ResourceTableController::create`                |
| PUT    | `/nav-manager/update/{id}`               | `Api\V1\Nav\NavManager\ResourceTableController::update/$1`             |
| DELETE | `/nav-manager/delete-soft/{id}`          | `Api\V1\Nav\NavManager\ResourceTableController::deleteSoft/$1`         |
| PATCH  | `/nav-manager/delete-restore/{id}`       | `Api\V1\Nav\NavManager\ResourceTableController::deleteRestore/$1`      |
| DELETE | `/nav-manager/delete-hard/{id}`          | `Api\V1\Nav\NavManager\ResourceTableController::deleteHard/$1`         |
| DELETE | `/nav-manager/clear-deleted`             | `Api\V1\Nav\NavManager\ResourceTableController::clearDeleted`          |
| DELETE | `/nav-manager/clear-deleted/{id}`        | `Api\V1\Nav\NavManager\ResourceTableController::clearDeleted/$1`       |

---

## Menu — Árvore de itens navegáveis

Cada item pertence a um `nav_manager` (FK `nav_manager_id`) e pode ter um
`parent_id` (submenu do mesmo nav).

**Filtros:** `jwtauth` (por wildcard de URI).

> **Observação:** `nav-manager` e `menu-manager` estão registrados **duas
> vezes** em `Config/Routes.php` (o bloco de cada um aparece duplicado, com o
> mesmo `require`). O CodeIgniter rejeita a rota duplicada, então o efeito
> prático é nulo — mas é ruído a remover do arquivo.

### menu-manager

Fonte: `Config/Routes/Api/v1/Menu/MenuManager/EndpointTable.php` — contrato canônico (18 rotas).

| Método | Rota                                      | Controller::method                                                      |
| ------ | ----------------------------------------- | ----------------------------------------------------------------------- |
| POST   | `/menu-manager/find`                      | `Api\V1\Menu\MenuManager\ResourceTableController::find`                 |
| POST   | `/menu-manager/get-grouped`               | `Api\V1\Menu\MenuManager\ResourceTableController::getGrouped`           |
| GET    | `/menu-manager/search`                    | `Api\V1\Menu\MenuManager\ResourceTableController::search`               |
| GET    | `/menu-manager/get/{id}`                  | `Api\V1\Menu\MenuManager\ResourceTableController::get/$1`               |
| GET    | `/menu-manager/get-all`                   | `Api\V1\Menu\MenuManager\ResourceTableController::getAll`               |
| GET    | `/menu-manager/get-no-pagination`         | `Api\V1\Menu\MenuManager\ResourceTableController::getNoPagination`      |
| GET    | `/menu-manager/get-deleted/{id}`          | `Api\V1\Menu\MenuManager\ResourceTableController::getDeleted/$1`        |
| GET    | `/menu-manager/get-with-deleted/{id}`     | `Api\V1\Menu\MenuManager\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/menu-manager/get-deleted-all`           | `Api\V1\Menu\MenuManager\ResourceTableController::getDeletedAll`        |
| GET    | `/menu-manager/get-all-with-deleted/{id}` | `Api\V1\Menu\MenuManager\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/menu-manager/get-all-with-deleted`      | `Api\V1\Menu\MenuManager\ResourceTableController::getAllWithDeleted`    |
| POST   | `/menu-manager/create`                    | `Api\V1\Menu\MenuManager\ResourceTableController::create`               |
| PUT    | `/menu-manager/update/{id}`               | `Api\V1\Menu\MenuManager\ResourceTableController::update/$1`            |
| DELETE | `/menu-manager/delete-soft/{id}`          | `Api\V1\Menu\MenuManager\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/menu-manager/delete-restore/{id}`       | `Api\V1\Menu\MenuManager\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/menu-manager/delete-hard/{id}`          | `Api\V1\Menu\MenuManager\ResourceTableController::deleteHard/$1`        |
| DELETE | `/menu-manager/clear-deleted`             | `Api\V1\Menu\MenuManager\ResourceTableController::clearDeleted`         |
| DELETE | `/menu-manager/clear-deleted/{id}`        | `Api\V1\Menu\MenuManager\ResourceTableController::clearDeleted/$1`      |

---

## Meta — Utilitários read-only

### db-schema

Fonte: `Config/Routes/Api/v1/Meta/DbSchema/Endpoint.php` — introspecção do banco (somente leitura). Desvio sancionado: 3 rotas próprias.

**Filtros:** `jwtauth` (por wildcard de URI).

| Método | Rota                           | Controller::method                                   |
| ------ | ------------------------------ | ---------------------------------------------------- |
| GET    | `/db-schema/tables`            | `Api\V1\Meta\DbSchema\SchemaController::tables`      |
| GET    | `/db-schema/columns/{tabela}`  | `Api\V1\Meta\DbSchema\SchemaController::columns/$1`  |
| GET    | `/db-schema/describe/{tabela}` | `Api\V1\Meta\DbSchema\SchemaController::describe/$1` |

### route-manager

Fonte: `Config/Routes/Api/v1/Meta/RouteManager/EndpointTable.php` — catálogo de
rotas da API e do frontend (CRUD completo, padrão Manager). Alimenta o campo de
seleção de rota (`route_manager`) usado pelos construtores, para escolher uma
rota pré-cadastrada em vez de digitá-la.

**Filtros:** `jwtauth` (por wildcard de URI).

| Método | Rota                                         | Controller::method                                                         |
| ------ | -------------------------------------------- | -------------------------------------------------------------------------- |
| POST   | `/route-manager/find`                        | `Api\V1\Meta\RouteManager\ResourceTableController::find`                   |
| POST   | `/route-manager/get-grouped`                 | `Api\V1\Meta\RouteManager\ResourceTableController::getGrouped`             |
| GET    | `/route-manager/search`                      | `Api\V1\Meta\RouteManager\ResourceTableController::search`                 |
| GET    | `/route-manager/get/{id}`                    | `Api\V1\Meta\RouteManager\ResourceTableController::get/$1`                 |
| GET    | `/route-manager/get-all`                     | `Api\V1\Meta\RouteManager\ResourceTableController::getAll`                 |
| GET    | `/route-manager/get-no-pagination`           | `Api\V1\Meta\RouteManager\ResourceTableController::getNoPagination`        |
| GET    | `/route-manager/get-deleted/{id}`            | `Api\V1\Meta\RouteManager\ResourceTableController::getDeleted/$1`          |
| GET    | `/route-manager/get-with-deleted/{id}`       | `Api\V1\Meta\RouteManager\ResourceTableController::getWithDeleted/$1`      |
| GET    | `/route-manager/get-deleted-all`             | `Api\V1\Meta\RouteManager\ResourceTableController::getDeletedAll`          |
| GET    | `/route-manager/get-all-with-deleted/{id}`   | `Api\V1\Meta\RouteManager\ResourceTableController::getAllWithDeleted/$1`   |
| GET    | `/route-manager/get-all-with-deleted`        | `Api\V1\Meta\RouteManager\ResourceTableController::getAllWithDeleted`      |
| POST   | `/route-manager/create`                      | `Api\V1\Meta\RouteManager\ResourceTableController::create`                 |
| PUT    | `/route-manager/update/{id}`                 | `Api\V1\Meta\RouteManager\ResourceTableController::update/$1`              |
| DELETE | `/route-manager/delete-soft/{id}`            | `Api\V1\Meta\RouteManager\ResourceTableController::deleteSoft/$1`          |
| PATCH  | `/route-manager/delete-restore/{id}`         | `Api\V1\Meta\RouteManager\ResourceTableController::deleteRestore/$1`       |
| DELETE | `/route-manager/delete-hard/{id}`            | `Api\V1\Meta\RouteManager\ResourceTableController::deleteHard/$1`          |
| DELETE | `/route-manager/clear-deleted`               | `Api\V1\Meta\RouteManager\ResourceTableController::clearDeleted`           |
| DELETE | `/route-manager/clear-deleted/{id}`          | `Api\V1\Meta\RouteManager\ResourceTableController::clearDeleted/$1`        |

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
