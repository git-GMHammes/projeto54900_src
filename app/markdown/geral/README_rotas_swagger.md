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
Contrato canônico (18 rotas). Populado por INSERT direto no banco DEV (tabela `aux_cor`).

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

### timeline-post-reactions

Fonte: `Config/Routes/Api/v1/Timeline/TimelinePostReactions/EndpointTable.php`

| Método | Rota | Controller::method |
| ------ | ---- | ----------------- |
| POST | `/timeline-post-reactions/find` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::find` |
| POST | `/timeline-post-reactions/get-grouped` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getGrouped` |
| GET | `/timeline-post-reactions/search` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::search` |
| GET | `/timeline-post-reactions/get/{id}` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::get/$1` |
| GET | `/timeline-post-reactions/get-all` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getAll` |
| GET | `/timeline-post-reactions/get-no-pagination` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getNoPagination` |
| GET | `/timeline-post-reactions/get-deleted/{id}` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getDeleted/$1` |
| GET | `/timeline-post-reactions/get-with-deleted/{id}` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getWithDeleted/$1` |
| GET | `/timeline-post-reactions/get-deleted-all` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getDeletedAll` |
| GET | `/timeline-post-reactions/get-all-with-deleted/{id}` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/timeline-post-reactions/get-all-with-deleted` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::getAllWithDeleted` |
| POST | `/timeline-post-reactions/create` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::create` |
| PUT | `/timeline-post-reactions/update/{id}` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::update/$1` |
| DELETE | `/timeline-post-reactions/delete-soft/{id}` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::deleteSoft/$1` |
| PATCH | `/timeline-post-reactions/delete-restore/{id}` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::deleteRestore/$1` |
| DELETE | `/timeline-post-reactions/delete-hard/{id}` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::deleteHard/$1` |
| DELETE | `/timeline-post-reactions/clear-deleted` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::clearDeleted` |
| DELETE | `/timeline-post-reactions/clear-deleted/{id}` | `Api\V1\Timeline\TimelinePostReactions\ResourceTableController::clearDeleted/$1` |

### timeline-post-reactions-view

Fonte: `Config/Routes/Api/v1/Timeline/TimelinePostReactions/EndPointView.php` —
consulta da view `view_timeline_post_reactions` (somente leitura, 9 rotas).

**Filtros:** `jwtauth` (por wildcard de URI).

| Método | Rota | Controller::method |
| ------ | ---- | ----------------- |
| POST | `/timeline-post-reactions-view/find` | `Api\V1\Timeline\TimelinePostReactions\ResourceViewController::find` |
| POST | `/timeline-post-reactions-view/get-grouped` | `Api\V1\Timeline\TimelinePostReactions\ResourceViewController::getGrouped` |
| GET | `/timeline-post-reactions-view/search` | `Api\V1\Timeline\TimelinePostReactions\ResourceViewController::search` |
| GET | `/timeline-post-reactions-view/get/{id}` | `Api\V1\Timeline\TimelinePostReactions\ResourceViewController::get/$1` |
| GET | `/timeline-post-reactions-view/get-all` | `Api\V1\Timeline\TimelinePostReactions\ResourceViewController::getAll` |
| GET | `/timeline-post-reactions-view/get-no-pagination` | `Api\V1\Timeline\TimelinePostReactions\ResourceViewController::getNoPagination` |
| GET | `/timeline-post-reactions-view/get-deleted/{id}` | `Api\V1\Timeline\TimelinePostReactions\ResourceViewController::getDeleted/$1` |
| GET | `/timeline-post-reactions-view/get-all-with-deleted` | `Api\V1\Timeline\TimelinePostReactions\ResourceViewController::getAllWithDeleted` |
| GET | `/timeline-post-reactions-view/get-deleted-all` | `Api\V1\Timeline\TimelinePostReactions\ResourceViewController::getDeletedAll` |

### timeline-post-ratings

Fonte: `Config/Routes/Api/v1/Timeline/TimelinePostRatings/EndpointTable.php`

| Método | Rota | Controller::method |
| ------ | ---- | ----------------- |
| POST | `/timeline-post-ratings/find` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::find` |
| POST | `/timeline-post-ratings/get-grouped` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getGrouped` |
| GET | `/timeline-post-ratings/search` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::search` |
| GET | `/timeline-post-ratings/get/{id}` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::get/$1` |
| GET | `/timeline-post-ratings/get-all` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getAll` |
| GET | `/timeline-post-ratings/get-no-pagination` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getNoPagination` |
| GET | `/timeline-post-ratings/get-deleted/{id}` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getDeleted/$1` |
| GET | `/timeline-post-ratings/get-with-deleted/{id}` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getWithDeleted/$1` |
| GET | `/timeline-post-ratings/get-deleted-all` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getDeletedAll` |
| GET | `/timeline-post-ratings/get-all-with-deleted/{id}` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/timeline-post-ratings/get-all-with-deleted` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::getAllWithDeleted` |
| POST | `/timeline-post-ratings/create` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::create` |
| PUT | `/timeline-post-ratings/update/{id}` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::update/$1` |
| DELETE | `/timeline-post-ratings/delete-soft/{id}` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::deleteSoft/$1` |
| PATCH | `/timeline-post-ratings/delete-restore/{id}` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::deleteRestore/$1` |
| DELETE | `/timeline-post-ratings/delete-hard/{id}` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::deleteHard/$1` |
| DELETE | `/timeline-post-ratings/clear-deleted` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::clearDeleted` |
| DELETE | `/timeline-post-ratings/clear-deleted/{id}` | `Api\V1\Timeline\TimelinePostRatings\ResourceTableController::clearDeleted/$1` |

### timeline-post-ratings-view

Fonte: `Config/Routes/Api/v1/Timeline/TimelinePostRatings/EndPointView.php` —
consulta da view `view_timeline_post_ratings` (somente leitura, 9 rotas).

**Filtros:** `jwtauth` (por wildcard de URI).

| Método | Rota | Controller::method |
| ------ | ---- | ----------------- |
| POST | `/timeline-post-ratings-view/find` | `Api\V1\Timeline\TimelinePostRatings\ResourceViewController::find` |
| POST | `/timeline-post-ratings-view/get-grouped` | `Api\V1\Timeline\TimelinePostRatings\ResourceViewController::getGrouped` |
| GET | `/timeline-post-ratings-view/search` | `Api\V1\Timeline\TimelinePostRatings\ResourceViewController::search` |
| GET | `/timeline-post-ratings-view/get/{id}` | `Api\V1\Timeline\TimelinePostRatings\ResourceViewController::get/$1` |
| GET | `/timeline-post-ratings-view/get-all` | `Api\V1\Timeline\TimelinePostRatings\ResourceViewController::getAll` |
| GET | `/timeline-post-ratings-view/get-no-pagination` | `Api\V1\Timeline\TimelinePostRatings\ResourceViewController::getNoPagination` |
| GET | `/timeline-post-ratings-view/get-deleted/{id}` | `Api\V1\Timeline\TimelinePostRatings\ResourceViewController::getDeleted/$1` |
| GET | `/timeline-post-ratings-view/get-all-with-deleted` | `Api\V1\Timeline\TimelinePostRatings\ResourceViewController::getAllWithDeleted` |
| GET | `/timeline-post-ratings-view/get-deleted-all` | `Api\V1\Timeline\TimelinePostRatings\ResourceViewController::getDeletedAll` |

### timeline-post-reports

Fonte: `Config/Routes/Api/v1/Timeline/TimelinePostReports/EndpointTable.php`

**Filtros:** `jwtauth` (wildcard de URI) + `adminonly` (rota a rota) em **todas
as rotas exceto `create`** — é o grupo da fila de moderação de denúncias.

| Método | Rota | Controller::method |
| ------ | ---- | ----------------- |
| POST | `/timeline-post-reports/find` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::find` |
| POST | `/timeline-post-reports/get-grouped` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::getGrouped` |
| GET | `/timeline-post-reports/search` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::search` |
| GET | `/timeline-post-reports/get/{id}` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::get/$1` |
| GET | `/timeline-post-reports/get-all` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::getAll` |
| GET | `/timeline-post-reports/get-no-pagination` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::getNoPagination` |
| GET | `/timeline-post-reports/get-deleted/{id}` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::getDeleted/$1` |
| GET | `/timeline-post-reports/get-with-deleted/{id}` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::getWithDeleted/$1` |
| GET | `/timeline-post-reports/get-deleted-all` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::getDeletedAll` |
| GET | `/timeline-post-reports/get-all-with-deleted/{id}` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/timeline-post-reports/get-all-with-deleted` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::getAllWithDeleted` |
| POST | `/timeline-post-reports/create` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::create` |
| PUT | `/timeline-post-reports/update/{id}` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::update/$1` |
| DELETE | `/timeline-post-reports/delete-soft/{id}` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::deleteSoft/$1` |
| PATCH | `/timeline-post-reports/delete-restore/{id}` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::deleteRestore/$1` |
| DELETE | `/timeline-post-reports/delete-hard/{id}` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::deleteHard/$1` |
| DELETE | `/timeline-post-reports/clear-deleted` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::clearDeleted` |
| DELETE | `/timeline-post-reports/clear-deleted/{id}` | `Api\V1\Timeline\TimelinePostReports\ResourceTableController::clearDeleted/$1` |

### timeline-post-reports-view

Fonte: `Config/Routes/Api/v1/Timeline/TimelinePostReports/EndPointView.php` —
consulta da view `view_timeline_post_reports` (9 rotas).

**Filtros:** `jwtauth` (wildcard de URI) + `adminonly` (rota a rota) nas **9
rotas** — fila de moderação, só admin lê.

| Método | Rota | Controller::method |
| ------ | ---- | ----------------- |
| POST | `/timeline-post-reports-view/find` | `Api\V1\Timeline\TimelinePostReports\ResourceViewController::find` |
| POST | `/timeline-post-reports-view/get-grouped` | `Api\V1\Timeline\TimelinePostReports\ResourceViewController::getGrouped` |
| GET | `/timeline-post-reports-view/search` | `Api\V1\Timeline\TimelinePostReports\ResourceViewController::search` |
| GET | `/timeline-post-reports-view/get/{id}` | `Api\V1\Timeline\TimelinePostReports\ResourceViewController::get/$1` |
| GET | `/timeline-post-reports-view/get-all` | `Api\V1\Timeline\TimelinePostReports\ResourceViewController::getAll` |
| GET | `/timeline-post-reports-view/get-no-pagination` | `Api\V1\Timeline\TimelinePostReports\ResourceViewController::getNoPagination` |
| GET | `/timeline-post-reports-view/get-deleted/{id}` | `Api\V1\Timeline\TimelinePostReports\ResourceViewController::getDeleted/$1` |
| GET | `/timeline-post-reports-view/get-all-with-deleted` | `Api\V1\Timeline\TimelinePostReports\ResourceViewController::getAllWithDeleted` |
| GET | `/timeline-post-reports-view/get-deleted-all` | `Api\V1\Timeline\TimelinePostReports\ResourceViewController::getDeletedAll` |

### timeline-post-attachments

Fonte: `Config/Routes/Api/v1/Timeline/TimelinePostAttachments/EndpointTable.php`

| Método | Rota | Controller::method |
| ------ | ---- | ----------------- |
| POST | `/timeline-post-attachments/find` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::find` |
| POST | `/timeline-post-attachments/get-grouped` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getGrouped` |
| GET | `/timeline-post-attachments/search` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::search` |
| GET | `/timeline-post-attachments/get/{id}` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::get/$1` |
| GET | `/timeline-post-attachments/get-all` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getAll` |
| GET | `/timeline-post-attachments/get-no-pagination` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getNoPagination` |
| GET | `/timeline-post-attachments/get-deleted/{id}` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getDeleted/$1` |
| GET | `/timeline-post-attachments/get-with-deleted/{id}` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getWithDeleted/$1` |
| GET | `/timeline-post-attachments/get-deleted-all` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getDeletedAll` |
| GET | `/timeline-post-attachments/get-all-with-deleted/{id}` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/timeline-post-attachments/get-all-with-deleted` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::getAllWithDeleted` |
| POST | `/timeline-post-attachments/create` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::create` |
| PUT | `/timeline-post-attachments/update/{id}` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::update/$1` |
| DELETE | `/timeline-post-attachments/delete-soft/{id}` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::deleteSoft/$1` |
| PATCH | `/timeline-post-attachments/delete-restore/{id}` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::deleteRestore/$1` |
| DELETE | `/timeline-post-attachments/delete-hard/{id}` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::deleteHard/$1` |
| DELETE | `/timeline-post-attachments/clear-deleted` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::clearDeleted` |
| DELETE | `/timeline-post-attachments/clear-deleted/{id}` | `Api\V1\Timeline\TimelinePostAttachments\ResourceTableController::clearDeleted/$1` |

### timeline-post-attachments-view

Fonte: `Config/Routes/Api/v1/Timeline/TimelinePostAttachments/EndPointView.php` —
consulta da view `view_timeline_post_attachments` (somente leitura, 9 rotas).

**Filtros:** `jwtauth` (por wildcard de URI).

| Método | Rota | Controller::method |
| ------ | ---- | ----------------- |
| POST | `/timeline-post-attachments-view/find` | `Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::find` |
| POST | `/timeline-post-attachments-view/get-grouped` | `Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::getGrouped` |
| GET | `/timeline-post-attachments-view/search` | `Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::search` |
| GET | `/timeline-post-attachments-view/get/{id}` | `Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::get/$1` |
| GET | `/timeline-post-attachments-view/get-all` | `Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::getAll` |
| GET | `/timeline-post-attachments-view/get-no-pagination` | `Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::getNoPagination` |
| GET | `/timeline-post-attachments-view/get-deleted/{id}` | `Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::getDeleted/$1` |
| GET | `/timeline-post-attachments-view/get-all-with-deleted` | `Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::getAllWithDeleted` |
| GET | `/timeline-post-attachments-view/get-deleted-all` | `Api\V1\Timeline\TimelinePostAttachments\ResourceViewController::getDeletedAll` |

### timeline-post-comments

Fonte: `Config/Routes/Api/v1/Timeline/TimelinePostComments/EndpointTable.php`

| Método | Rota | Controller::method |
| ------ | ---- | ----------------- |
| POST | `/timeline-post-comments/find` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::find` |
| POST | `/timeline-post-comments/get-grouped` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::getGrouped` |
| GET | `/timeline-post-comments/search` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::search` |
| GET | `/timeline-post-comments/get/{id}` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::get/$1` |
| GET | `/timeline-post-comments/get-all` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::getAll` |
| GET | `/timeline-post-comments/get-no-pagination` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::getNoPagination` |
| GET | `/timeline-post-comments/get-deleted/{id}` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::getDeleted/$1` |
| GET | `/timeline-post-comments/get-with-deleted/{id}` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::getWithDeleted/$1` |
| GET | `/timeline-post-comments/get-deleted-all` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::getDeletedAll` |
| GET | `/timeline-post-comments/get-all-with-deleted/{id}` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/timeline-post-comments/get-all-with-deleted` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::getAllWithDeleted` |
| POST | `/timeline-post-comments/create` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::create` |
| PUT | `/timeline-post-comments/update/{id}` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::update/$1` |
| DELETE | `/timeline-post-comments/delete-soft/{id}` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::deleteSoft/$1` |
| PATCH | `/timeline-post-comments/delete-restore/{id}` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::deleteRestore/$1` |
| DELETE | `/timeline-post-comments/delete-hard/{id}` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::deleteHard/$1` |
| DELETE | `/timeline-post-comments/clear-deleted` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::clearDeleted` |
| DELETE | `/timeline-post-comments/clear-deleted/{id}` | `Api\V1\Timeline\TimelinePostComments\ResourceTableController::clearDeleted/$1` |

### timeline-post-comments-view

Fonte: `Config/Routes/Api/v1/Timeline/TimelinePostComments/EndPointView.php` —
consulta da view `view_timeline_post_comments` (somente leitura, 9 rotas).

**Filtros:** `jwtauth` (por wildcard de URI).

| Método | Rota | Controller::method |
| ------ | ---- | ----------------- |
| POST | `/timeline-post-comments-view/find` | `Api\V1\Timeline\TimelinePostComments\ResourceViewController::find` |
| POST | `/timeline-post-comments-view/get-grouped` | `Api\V1\Timeline\TimelinePostComments\ResourceViewController::getGrouped` |
| GET | `/timeline-post-comments-view/search` | `Api\V1\Timeline\TimelinePostComments\ResourceViewController::search` |
| GET | `/timeline-post-comments-view/get/{id}` | `Api\V1\Timeline\TimelinePostComments\ResourceViewController::get/$1` |
| GET | `/timeline-post-comments-view/get-all` | `Api\V1\Timeline\TimelinePostComments\ResourceViewController::getAll` |
| GET | `/timeline-post-comments-view/get-no-pagination` | `Api\V1\Timeline\TimelinePostComments\ResourceViewController::getNoPagination` |
| GET | `/timeline-post-comments-view/get-deleted/{id}` | `Api\V1\Timeline\TimelinePostComments\ResourceViewController::getDeleted/$1` |
| GET | `/timeline-post-comments-view/get-all-with-deleted` | `Api\V1\Timeline\TimelinePostComments\ResourceViewController::getAllWithDeleted` |
| GET | `/timeline-post-comments-view/get-deleted-all` | `Api\V1\Timeline\TimelinePostComments\ResourceViewController::getDeletedAll` |

---

## Timeline — Módulo Messages/Timeline

Fonte: `Config/Routes/Api/v1/Timeline/**` — 7 tabelas × 18 rotas + 7 views × 9
rotas = **189 rotas**. Um grupo por tabela (`EndpointTable.php`) e um por view
(`EndPointView.php`), na ordem tabela → view. As 7 views são as do banco:
`view_timeline_manager`, `view_timeline_posts` (o feed),
`view_timeline_post_attachments`, `view_timeline_post_comments`,
`view_timeline_post_reactions`, `view_timeline_post_ratings` e
`view_timeline_post_reports`.

**Filtros:** `jwtauth` **por wildcard de URI** nos 14 grupos — o módulo não tem
nenhuma rota pública (o requisito do feed é "público para quem estiver logado").
`adminonly` **rota a rota**, nunca por wildcard, porque dentro do mesmo grupo há
rota que o usuário comum precisa: as 3 rotas de exclusão definitiva
(`delete-hard/{id}`, `clear-deleted`, `clear-deleted/{id}`) das 7 tabelas, e
**todas** as rotas de `timeline-post-reports` e `timeline-post-reports-view`
exceto `create` (que é o denunciar). O filtro de rota roda depois do filtro de
URI, com `CurrentUser` já populado.

> Os `Controller::method` abaixo já estão declarados nas rotas, mas as classes
> `Api\V1\Timeline\*` ainda **não existem**: são a Etapa D do módulo — ver
> [`README_modulo_timeline.md`](README_modulo_timeline.md).

### timeline-manager

Fonte: `Config/Routes/Api/v1/Timeline/TimelineManager/EndpointTable.php`

| Método | Rota | Controller::method |
| ------ | ---- | ----------------- |
| POST | `/timeline-manager/find` | `Api\V1\Timeline\TimelineManager\ResourceTableController::find` |
| POST | `/timeline-manager/get-grouped` | `Api\V1\Timeline\TimelineManager\ResourceTableController::getGrouped` |
| GET | `/timeline-manager/search` | `Api\V1\Timeline\TimelineManager\ResourceTableController::search` |
| GET | `/timeline-manager/get/{id}` | `Api\V1\Timeline\TimelineManager\ResourceTableController::get/$1` |
| GET | `/timeline-manager/get-all` | `Api\V1\Timeline\TimelineManager\ResourceTableController::getAll` |
| GET | `/timeline-manager/get-no-pagination` | `Api\V1\Timeline\TimelineManager\ResourceTableController::getNoPagination` |
| GET | `/timeline-manager/get-deleted/{id}` | `Api\V1\Timeline\TimelineManager\ResourceTableController::getDeleted/$1` |
| GET | `/timeline-manager/get-with-deleted/{id}` | `Api\V1\Timeline\TimelineManager\ResourceTableController::getWithDeleted/$1` |
| GET | `/timeline-manager/get-deleted-all` | `Api\V1\Timeline\TimelineManager\ResourceTableController::getDeletedAll` |
| GET | `/timeline-manager/get-all-with-deleted/{id}` | `Api\V1\Timeline\TimelineManager\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/timeline-manager/get-all-with-deleted` | `Api\V1\Timeline\TimelineManager\ResourceTableController::getAllWithDeleted` |
| POST | `/timeline-manager/create` | `Api\V1\Timeline\TimelineManager\ResourceTableController::create` |
| PUT | `/timeline-manager/update/{id}` | `Api\V1\Timeline\TimelineManager\ResourceTableController::update/$1` |
| DELETE | `/timeline-manager/delete-soft/{id}` | `Api\V1\Timeline\TimelineManager\ResourceTableController::deleteSoft/$1` |
| PATCH | `/timeline-manager/delete-restore/{id}` | `Api\V1\Timeline\TimelineManager\ResourceTableController::deleteRestore/$1` |
| DELETE | `/timeline-manager/delete-hard/{id}` | `Api\V1\Timeline\TimelineManager\ResourceTableController::deleteHard/$1` |
| DELETE | `/timeline-manager/clear-deleted` | `Api\V1\Timeline\TimelineManager\ResourceTableController::clearDeleted` |
| DELETE | `/timeline-manager/clear-deleted/{id}` | `Api\V1\Timeline\TimelineManager\ResourceTableController::clearDeleted/$1` |

### timeline-manager-view

Fonte: `Config/Routes/Api/v1/Timeline/TimelineManager/EndPointView.php` — consulta
da view `view_timeline_manager` (somente leitura, 9 rotas).

**Filtros:** `jwtauth` (por wildcard de URI).

| Método | Rota | Controller::method |
| ------ | ---- | ----------------- |
| POST | `/timeline-manager-view/find` | `Api\V1\Timeline\TimelineManager\ResourceViewController::find` |
| POST | `/timeline-manager-view/get-grouped` | `Api\V1\Timeline\TimelineManager\ResourceViewController::getGrouped` |
| GET | `/timeline-manager-view/search` | `Api\V1\Timeline\TimelineManager\ResourceViewController::search` |
| GET | `/timeline-manager-view/get/{id}` | `Api\V1\Timeline\TimelineManager\ResourceViewController::get/$1` |
| GET | `/timeline-manager-view/get-all` | `Api\V1\Timeline\TimelineManager\ResourceViewController::getAll` |
| GET | `/timeline-manager-view/get-no-pagination` | `Api\V1\Timeline\TimelineManager\ResourceViewController::getNoPagination` |
| GET | `/timeline-manager-view/get-deleted/{id}` | `Api\V1\Timeline\TimelineManager\ResourceViewController::getDeleted/$1` |
| GET | `/timeline-manager-view/get-all-with-deleted` | `Api\V1\Timeline\TimelineManager\ResourceViewController::getAllWithDeleted` |
| GET | `/timeline-manager-view/get-deleted-all` | `Api\V1\Timeline\TimelineManager\ResourceViewController::getDeletedAll` |

### timeline-posts

Fonte: `Config/Routes/Api/v1/Timeline/TimelinePosts/EndpointTable.php`

| Método | Rota | Controller::method |
| ------ | ---- | ----------------- |
| POST | `/timeline-posts/find` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::find` |
| POST | `/timeline-posts/get-grouped` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::getGrouped` |
| GET | `/timeline-posts/search` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::search` |
| GET | `/timeline-posts/get/{id}` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::get/$1` |
| GET | `/timeline-posts/get-all` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::getAll` |
| GET | `/timeline-posts/get-no-pagination` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::getNoPagination` |
| GET | `/timeline-posts/get-deleted/{id}` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::getDeleted/$1` |
| GET | `/timeline-posts/get-with-deleted/{id}` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::getWithDeleted/$1` |
| GET | `/timeline-posts/get-deleted-all` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::getDeletedAll` |
| GET | `/timeline-posts/get-all-with-deleted/{id}` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/timeline-posts/get-all-with-deleted` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::getAllWithDeleted` |
| POST | `/timeline-posts/create` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::create` |
| PUT | `/timeline-posts/update/{id}` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::update/$1` |
| DELETE | `/timeline-posts/delete-soft/{id}` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::deleteSoft/$1` |
| PATCH | `/timeline-posts/delete-restore/{id}` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::deleteRestore/$1` |
| DELETE | `/timeline-posts/delete-hard/{id}` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::deleteHard/$1` |
| DELETE | `/timeline-posts/clear-deleted` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::clearDeleted` |
| DELETE | `/timeline-posts/clear-deleted/{id}` | `Api\V1\Timeline\TimelinePosts\ResourceTableController::clearDeleted/$1` |

### timeline-posts-view

Fonte: `Config/Routes/Api/v1/Timeline/TimelinePosts/EndPointView.php` — consulta da
view `view_timeline_posts` (o feed; somente leitura, 9 rotas). É a fonte da
listagem do feed (`list_manager` slug `timeline-feed`).

**Filtros:** `jwtauth` (por wildcard de URI).

| Método | Rota | Controller::method |
| ------ | ---- | ----------------- |
| POST | `/timeline-posts-view/find` | `Api\V1\Timeline\TimelinePosts\ResourceViewController::find` |
| POST | `/timeline-posts-view/get-grouped` | `Api\V1\Timeline\TimelinePosts\ResourceViewController::getGrouped` |
| GET | `/timeline-posts-view/search` | `Api\V1\Timeline\TimelinePosts\ResourceViewController::search` |
| GET | `/timeline-posts-view/get/{id}` | `Api\V1\Timeline\TimelinePosts\ResourceViewController::get/$1` |
| GET | `/timeline-posts-view/get-all` | `Api\V1\Timeline\TimelinePosts\ResourceViewController::getAll` |
| GET | `/timeline-posts-view/get-no-pagination` | `Api\V1\Timeline\TimelinePosts\ResourceViewController::getNoPagination` |
| GET | `/timeline-posts-view/get-deleted/{id}` | `Api\V1\Timeline\TimelinePosts\ResourceViewController::getDeleted/$1` |
| GET | `/timeline-posts-view/get-all-with-deleted` | `Api\V1\Timeline\TimelinePosts\ResourceViewController::getAllWithDeleted` |
| GET | `/timeline-posts-view/get-deleted-all` | `Api\V1\Timeline\TimelinePosts\ResourceViewController::getDeletedAll` |

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

## Company — Cadastro de empresas

Cadastro de empresas (`company_manager`). O usuário acessa as empresas listadas em
`user_manager.company_ids` (JSON de ids); em desenvolvimento todos pertencem à
empresa **DEFAULT** (id 1, não pode ser excluída). Detalhes em
[`README_modulo_companies.md`](README_modulo_companies.md).

**Filtros:** `jwtauth` (por wildcard de URI) em todas; `adminonly` rota a rota nas
escritas (`create`, `update`, `delete-*`, `clear-deleted`) — leitura aberta a qualquer autenticado.

### company-manager

Fonte: `Config/Routes/Api/v1/Company/CompanyManager/EndpointTable.php` — contrato canônico (18 rotas).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/company-manager/find` | `Api\V1\Company\CompanyManager\ResourceTableController::find` |
| POST | `/company-manager/get-grouped` | `Api\V1\Company\CompanyManager\ResourceTableController::getGrouped` |
| GET | `/company-manager/search` | `Api\V1\Company\CompanyManager\ResourceTableController::search` |
| GET | `/company-manager/get/{id}` | `Api\V1\Company\CompanyManager\ResourceTableController::get/$1` |
| GET | `/company-manager/get-all` | `Api\V1\Company\CompanyManager\ResourceTableController::getAll` |
| GET | `/company-manager/get-no-pagination` | `Api\V1\Company\CompanyManager\ResourceTableController::getNoPagination` |
| GET | `/company-manager/get-deleted/{id}` | `Api\V1\Company\CompanyManager\ResourceTableController::getDeleted/$1` |
| GET | `/company-manager/get-with-deleted/{id}` | `Api\V1\Company\CompanyManager\ResourceTableController::getWithDeleted/$1` |
| GET | `/company-manager/get-deleted-all` | `Api\V1\Company\CompanyManager\ResourceTableController::getDeletedAll` |
| GET | `/company-manager/get-all-with-deleted/{id}` | `Api\V1\Company\CompanyManager\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/company-manager/get-all-with-deleted` | `Api\V1\Company\CompanyManager\ResourceTableController::getAllWithDeleted` |
| POST | `/company-manager/create` | `Api\V1\Company\CompanyManager\ResourceTableController::create` |
| PUT | `/company-manager/update/{id}` | `Api\V1\Company\CompanyManager\ResourceTableController::update/$1` |
| DELETE | `/company-manager/delete-soft/{id}` | `Api\V1\Company\CompanyManager\ResourceTableController::deleteSoft/$1` |
| PATCH | `/company-manager/delete-restore/{id}` | `Api\V1\Company\CompanyManager\ResourceTableController::deleteRestore/$1` |
| DELETE | `/company-manager/delete-hard/{id}` | `Api\V1\Company\CompanyManager\ResourceTableController::deleteHard/$1` |
| DELETE | `/company-manager/clear-deleted` | `Api\V1\Company\CompanyManager\ResourceTableController::clearDeleted` |
| DELETE | `/company-manager/clear-deleted/{id}` | `Api\V1\Company\CompanyManager\ResourceTableController::clearDeleted/$1` |

### company-manager-view

Fonte: `Config/Routes/Api/v1/Company/CompanyManager/EndPointView.php` — view `view_company_manager` (9 rotas de leitura).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/company-manager-view/find` | `Api\V1\Company\CompanyManager\ResourceViewController::find` |
| POST | `/company-manager-view/get-grouped` | `Api\V1\Company\CompanyManager\ResourceViewController::getGrouped` |
| GET | `/company-manager-view/search` | `Api\V1\Company\CompanyManager\ResourceViewController::search` |
| GET | `/company-manager-view/get/{id}` | `Api\V1\Company\CompanyManager\ResourceViewController::get/$1` |
| GET | `/company-manager-view/get-all` | `Api\V1\Company\CompanyManager\ResourceViewController::getAll` |
| GET | `/company-manager-view/get-no-pagination` | `Api\V1\Company\CompanyManager\ResourceViewController::getNoPagination` |
| GET | `/company-manager-view/get-deleted/{id}` | `Api\V1\Company\CompanyManager\ResourceViewController::getDeleted/$1` |
| GET | `/company-manager-view/get-all-with-deleted` | `Api\V1\Company\CompanyManager\ResourceViewController::getAllWithDeleted` |
| GET | `/company-manager-view/get-deleted-all` | `Api\V1\Company\CompanyManager\ResourceViewController::getDeletedAll` |

---

### company-members

Fonte: `Config/Routes/Api/v1/Company/CompanyMembers/EndpointTable.php` + `EndpointCustom.php` — contrato canônico (18 rotas) mais `sync`.
Vínculo N:N usuário ↔ empresa (espelho de `message-group-members`). Leitura escopada às empresas do usuário; escrita **`adminonly`**.

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/company-members/find` | `Api\V1\Company\CompanyMembers\ResourceTableController::find` |
| POST | `/company-members/get-grouped` | `Api\V1\Company\CompanyMembers\ResourceTableController::getGrouped` |
| GET | `/company-members/search` | `Api\V1\Company\CompanyMembers\ResourceTableController::search` |
| GET | `/company-members/get/{id}` | `Api\V1\Company\CompanyMembers\ResourceTableController::get/$1` |
| GET | `/company-members/get-all` | `Api\V1\Company\CompanyMembers\ResourceTableController::getAll` |
| GET | `/company-members/get-no-pagination` | `Api\V1\Company\CompanyMembers\ResourceTableController::getNoPagination` |
| GET | `/company-members/get-deleted/{id}` | `Api\V1\Company\CompanyMembers\ResourceTableController::getDeleted/$1` |
| GET | `/company-members/get-with-deleted/{id}` | `Api\V1\Company\CompanyMembers\ResourceTableController::getWithDeleted/$1` |
| GET | `/company-members/get-deleted-all` | `Api\V1\Company\CompanyMembers\ResourceTableController::getDeletedAll` |
| GET | `/company-members/get-all-with-deleted/{id}` | `Api\V1\Company\CompanyMembers\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/company-members/get-all-with-deleted` | `Api\V1\Company\CompanyMembers\ResourceTableController::getAllWithDeleted` |
| POST | `/company-members/create` | `Api\V1\Company\CompanyMembers\ResourceTableController::create` |
| PUT | `/company-members/update/{id}` | `Api\V1\Company\CompanyMembers\ResourceTableController::update/$1` |
| DELETE | `/company-members/delete-soft/{id}` | `Api\V1\Company\CompanyMembers\ResourceTableController::deleteSoft/$1` |
| PATCH | `/company-members/delete-restore/{id}` | `Api\V1\Company\CompanyMembers\ResourceTableController::deleteRestore/$1` |
| DELETE | `/company-members/delete-hard/{id}` | `Api\V1\Company\CompanyMembers\ResourceTableController::deleteHard/$1` |
| DELETE | `/company-members/clear-deleted` | `Api\V1\Company\CompanyMembers\ResourceTableController::clearDeleted` |
| DELETE | `/company-members/clear-deleted/{id}` | `Api\V1\Company\CompanyMembers\ResourceTableController::clearDeleted/$1` |
| PUT | `/company-members/sync/{id}` | `Api\V1\Company\CompanyMembers\ResourceTableController::sync/$1` |

`sync/{companyId}`: corpo `{"add_user_ids":[..],"remove_user_ids":[..]}` (teto 1000 por lista, tudo ou nada); devolve `added/reactivated/removed/skipped`.

### company-members-view

Fonte: `Config/Routes/Api/v1/Company/CompanyMembers/EndPointView.php` — view `view_company_members` (vínculo + empresa + usuário/perfil), 9 rotas.

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/company-members-view/find` | `Api\V1\Company\CompanyMembers\ResourceViewController::find` |
| POST | `/company-members-view/get-grouped` | `Api\V1\Company\CompanyMembers\ResourceViewController::getGrouped` |
| GET | `/company-members-view/search` | `Api\V1\Company\CompanyMembers\ResourceViewController::search` |
| GET | `/company-members-view/get/{id}` | `Api\V1\Company\CompanyMembers\ResourceViewController::get/$1` |
| GET | `/company-members-view/get-all` | `Api\V1\Company\CompanyMembers\ResourceViewController::getAll` |
| GET | `/company-members-view/get-no-pagination` | `Api\V1\Company\CompanyMembers\ResourceViewController::getNoPagination` |
| GET | `/company-members-view/get-deleted/{id}` | `Api\V1\Company\CompanyMembers\ResourceViewController::getDeleted/$1` |
| GET | `/company-members-view/get-all-with-deleted` | `Api\V1\Company\CompanyMembers\ResourceViewController::getAllWithDeleted` |
| GET | `/company-members-view/get-deleted-all` | `Api\V1\Company\CompanyMembers\ResourceViewController::getDeletedAll` |

### company-memberships-view

Fonte: `Config/Routes/Api/v1/Company/CompanyMemberships/EndPointView.php` — view `view_company_memberships` (empresa + `members_count`/`members_names`), 9 rotas; escopo: empresas do usuário.

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/company-memberships-view/find` | `Api\V1\Company\CompanyMemberships\ResourceViewController::find` |
| POST | `/company-memberships-view/get-grouped` | `Api\V1\Company\CompanyMemberships\ResourceViewController::getGrouped` |
| GET | `/company-memberships-view/search` | `Api\V1\Company\CompanyMemberships\ResourceViewController::search` |
| GET | `/company-memberships-view/get/{id}` | `Api\V1\Company\CompanyMemberships\ResourceViewController::get/$1` |
| GET | `/company-memberships-view/get-all` | `Api\V1\Company\CompanyMemberships\ResourceViewController::getAll` |
| GET | `/company-memberships-view/get-no-pagination` | `Api\V1\Company\CompanyMemberships\ResourceViewController::getNoPagination` |
| GET | `/company-memberships-view/get-deleted/{id}` | `Api\V1\Company\CompanyMemberships\ResourceViewController::getDeleted/$1` |
| GET | `/company-memberships-view/get-all-with-deleted` | `Api\V1\Company\CompanyMemberships\ResourceViewController::getAllWithDeleted` |
| GET | `/company-memberships-view/get-deleted-all` | `Api\V1\Company\CompanyMemberships\ResourceViewController::getDeletedAll` |

### company-users-companies-view

Fonte: `Config/Routes/Api/v1/Company/CompanyUsersCompanies/EndPointView.php` — view `view_company_users_companies` (usuário + `companies_count`/`companies_names`), 9 rotas. Não-admin só vê usuários `active`.

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/company-users-companies-view/find` | `Api\V1\Company\CompanyUsersCompanies\ResourceViewController::find` |
| POST | `/company-users-companies-view/get-grouped` | `Api\V1\Company\CompanyUsersCompanies\ResourceViewController::getGrouped` |
| GET | `/company-users-companies-view/search` | `Api\V1\Company\CompanyUsersCompanies\ResourceViewController::search` |
| GET | `/company-users-companies-view/get/{id}` | `Api\V1\Company\CompanyUsersCompanies\ResourceViewController::get/$1` |
| GET | `/company-users-companies-view/get-all` | `Api\V1\Company\CompanyUsersCompanies\ResourceViewController::getAll` |
| GET | `/company-users-companies-view/get-no-pagination` | `Api\V1\Company\CompanyUsersCompanies\ResourceViewController::getNoPagination` |
| GET | `/company-users-companies-view/get-deleted/{id}` | `Api\V1\Company\CompanyUsersCompanies\ResourceViewController::getDeleted/$1` |
| GET | `/company-users-companies-view/get-all-with-deleted` | `Api\V1\Company\CompanyUsersCompanies\ResourceViewController::getAllWithDeleted` |
| GET | `/company-users-companies-view/get-deleted-all` | `Api\V1\Company\CompanyUsersCompanies\ResourceViewController::getDeletedAll` |

---

## User/UserResourceAccess — Permissão individual a form/list

Permissão de um **usuário** a um **form** ou **list**, independente da empresa
(`user_resource_access`). Precedência na verificação: admin → linha do usuário
(`allowed` 1/0) → `roles` do form/list. Detalhes em
[`README_modulo_companies.md`](README_modulo_companies.md).

**Filtros:** `jwtauth` (wildcard) + `adminonly` em TODAS as rotas de CRUD e de view; a única rota
para usuário comum é `resource-access/check` (desvio sancionado: 1 rota própria).

### user-resource-access

Fonte: `Config/Routes/Api/v1/User/UserResourceAccess/EndpointTable.php` — contrato canônico (18 rotas, todas `adminonly`).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/user-resource-access/find` | `Api\V1\User\UserResourceAccess\ResourceTableController::find` |
| POST | `/user-resource-access/get-grouped` | `Api\V1\User\UserResourceAccess\ResourceTableController::getGrouped` |
| GET | `/user-resource-access/search` | `Api\V1\User\UserResourceAccess\ResourceTableController::search` |
| GET | `/user-resource-access/get/{id}` | `Api\V1\User\UserResourceAccess\ResourceTableController::get/$1` |
| GET | `/user-resource-access/get-all` | `Api\V1\User\UserResourceAccess\ResourceTableController::getAll` |
| GET | `/user-resource-access/get-no-pagination` | `Api\V1\User\UserResourceAccess\ResourceTableController::getNoPagination` |
| GET | `/user-resource-access/get-deleted/{id}` | `Api\V1\User\UserResourceAccess\ResourceTableController::getDeleted/$1` |
| GET | `/user-resource-access/get-with-deleted/{id}` | `Api\V1\User\UserResourceAccess\ResourceTableController::getWithDeleted/$1` |
| GET | `/user-resource-access/get-deleted-all` | `Api\V1\User\UserResourceAccess\ResourceTableController::getDeletedAll` |
| GET | `/user-resource-access/get-all-with-deleted/{id}` | `Api\V1\User\UserResourceAccess\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/user-resource-access/get-all-with-deleted` | `Api\V1\User\UserResourceAccess\ResourceTableController::getAllWithDeleted` |
| POST | `/user-resource-access/create` | `Api\V1\User\UserResourceAccess\ResourceTableController::create` |
| PUT | `/user-resource-access/update/{id}` | `Api\V1\User\UserResourceAccess\ResourceTableController::update/$1` |
| DELETE | `/user-resource-access/delete-soft/{id}` | `Api\V1\User\UserResourceAccess\ResourceTableController::deleteSoft/$1` |
| PATCH | `/user-resource-access/delete-restore/{id}` | `Api\V1\User\UserResourceAccess\ResourceTableController::deleteRestore/$1` |
| DELETE | `/user-resource-access/delete-hard/{id}` | `Api\V1\User\UserResourceAccess\ResourceTableController::deleteHard/$1` |
| DELETE | `/user-resource-access/clear-deleted` | `Api\V1\User\UserResourceAccess\ResourceTableController::clearDeleted` |
| DELETE | `/user-resource-access/clear-deleted/{id}` | `Api\V1\User\UserResourceAccess\ResourceTableController::clearDeleted/$1` |

### user-resource-access-view

Fonte: `Config/Routes/Api/v1/User/UserResourceAccess/EndPointView.php` — view `view_user_resource_access` (9 rotas, todas `adminonly`).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/user-resource-access-view/find` | `Api\V1\User\UserResourceAccess\ResourceViewController::find` |
| POST | `/user-resource-access-view/get-grouped` | `Api\V1\User\UserResourceAccess\ResourceViewController::getGrouped` |
| GET | `/user-resource-access-view/search` | `Api\V1\User\UserResourceAccess\ResourceViewController::search` |
| GET | `/user-resource-access-view/get/{id}` | `Api\V1\User\UserResourceAccess\ResourceViewController::get/$1` |
| GET | `/user-resource-access-view/get-all` | `Api\V1\User\UserResourceAccess\ResourceViewController::getAll` |
| GET | `/user-resource-access-view/get-no-pagination` | `Api\V1\User\UserResourceAccess\ResourceViewController::getNoPagination` |
| GET | `/user-resource-access-view/get-deleted/{id}` | `Api\V1\User\UserResourceAccess\ResourceViewController::getDeleted/$1` |
| GET | `/user-resource-access-view/get-all-with-deleted` | `Api\V1\User\UserResourceAccess\ResourceViewController::getAllWithDeleted` |
| GET | `/user-resource-access-view/get-deleted-all` | `Api\V1\User\UserResourceAccess\ResourceViewController::getDeletedAll` |

### resource-access

Fonte: `Config/Routes/Api/v1/Meta/ResourceAccess/Endpoint.php` — verificação do usuário da sessão.
Query: `type=form|list` + `id=N` ou `slug=...`; resposta `data: { allowed, source, resource_id }`
(`source`: `admin`, `user`, `role`, `open`, `not_found`).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| GET | `/resource-access/check` | `Api\V1\User\UserResourceAccess\ResourceTableController::check` |

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

## Map — Mapas, pontos, trajetos e CEP

Módulo `Map` (Leaflet + OpenStreetMap + OpenRouteService + Nominatim): 10 tabelas e 10 views,
18 rotas por tabela e 9 por view — **270 rotas** (inclui `map-links`, o vínculo universal), mais 5 rotas do proxy `map-geo` (275). Detalhes em
[`README_modulo_map.md`](README_modulo_map.md).

**Filtros:** `jwtauth` (por wildcard de URI) em todas; `adminonly` rota a rota em
`delete-hard`, `clear-deleted` e `clear-deleted/{id}` das tabelas. Não há rota pública.

### map-icons

Fonte: `Config/Routes/Api/v1/Map/MapIcons/EndpointTable.php` — contrato canônico (18 rotas).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-icons/find` | `Api\V1\Map\MapIcons\ResourceTableController::find` |
| POST | `/map-icons/get-grouped` | `Api\V1\Map\MapIcons\ResourceTableController::getGrouped` |
| GET | `/map-icons/search` | `Api\V1\Map\MapIcons\ResourceTableController::search` |
| GET | `/map-icons/get/{id}` | `Api\V1\Map\MapIcons\ResourceTableController::get/$1` |
| GET | `/map-icons/get-all` | `Api\V1\Map\MapIcons\ResourceTableController::getAll` |
| GET | `/map-icons/get-no-pagination` | `Api\V1\Map\MapIcons\ResourceTableController::getNoPagination` |
| GET | `/map-icons/get-deleted/{id}` | `Api\V1\Map\MapIcons\ResourceTableController::getDeleted/$1` |
| GET | `/map-icons/get-with-deleted/{id}` | `Api\V1\Map\MapIcons\ResourceTableController::getWithDeleted/$1` |
| GET | `/map-icons/get-deleted-all` | `Api\V1\Map\MapIcons\ResourceTableController::getDeletedAll` |
| GET | `/map-icons/get-all-with-deleted/{id}` | `Api\V1\Map\MapIcons\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/map-icons/get-all-with-deleted` | `Api\V1\Map\MapIcons\ResourceTableController::getAllWithDeleted` |
| POST | `/map-icons/create` | `Api\V1\Map\MapIcons\ResourceTableController::create` |
| PUT | `/map-icons/update/{id}` | `Api\V1\Map\MapIcons\ResourceTableController::update/$1` |
| DELETE | `/map-icons/delete-soft/{id}` | `Api\V1\Map\MapIcons\ResourceTableController::deleteSoft/$1` |
| PATCH | `/map-icons/delete-restore/{id}` | `Api\V1\Map\MapIcons\ResourceTableController::deleteRestore/$1` |
| DELETE | `/map-icons/delete-hard/{id}` | `Api\V1\Map\MapIcons\ResourceTableController::deleteHard/$1` |
| DELETE | `/map-icons/clear-deleted` | `Api\V1\Map\MapIcons\ResourceTableController::clearDeleted` |
| DELETE | `/map-icons/clear-deleted/{id}` | `Api\V1\Map\MapIcons\ResourceTableController::clearDeleted/$1` |

### map-icons-view

Fonte: `Config/Routes/Api/v1/Map/MapIcons/EndPointView.php` — view `view_map_icons` (9 rotas de leitura).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-icons-view/find` | `Api\V1\Map\MapIcons\ResourceViewController::find` |
| POST | `/map-icons-view/get-grouped` | `Api\V1\Map\MapIcons\ResourceViewController::getGrouped` |
| GET | `/map-icons-view/search` | `Api\V1\Map\MapIcons\ResourceViewController::search` |
| GET | `/map-icons-view/get/{id}` | `Api\V1\Map\MapIcons\ResourceViewController::get/$1` |
| GET | `/map-icons-view/get-all` | `Api\V1\Map\MapIcons\ResourceViewController::getAll` |
| GET | `/map-icons-view/get-no-pagination` | `Api\V1\Map\MapIcons\ResourceViewController::getNoPagination` |
| GET | `/map-icons-view/get-deleted/{id}` | `Api\V1\Map\MapIcons\ResourceViewController::getDeleted/$1` |
| GET | `/map-icons-view/get-all-with-deleted` | `Api\V1\Map\MapIcons\ResourceViewController::getAllWithDeleted` |
| GET | `/map-icons-view/get-deleted-all` | `Api\V1\Map\MapIcons\ResourceViewController::getDeletedAll` |

### map-manager

Fonte: `Config/Routes/Api/v1/Map/MapManager/EndpointTable.php` — contrato canônico (18 rotas).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-manager/find` | `Api\V1\Map\MapManager\ResourceTableController::find` |
| POST | `/map-manager/get-grouped` | `Api\V1\Map\MapManager\ResourceTableController::getGrouped` |
| GET | `/map-manager/search` | `Api\V1\Map\MapManager\ResourceTableController::search` |
| GET | `/map-manager/get/{id}` | `Api\V1\Map\MapManager\ResourceTableController::get/$1` |
| GET | `/map-manager/get-all` | `Api\V1\Map\MapManager\ResourceTableController::getAll` |
| GET | `/map-manager/get-no-pagination` | `Api\V1\Map\MapManager\ResourceTableController::getNoPagination` |
| GET | `/map-manager/get-deleted/{id}` | `Api\V1\Map\MapManager\ResourceTableController::getDeleted/$1` |
| GET | `/map-manager/get-with-deleted/{id}` | `Api\V1\Map\MapManager\ResourceTableController::getWithDeleted/$1` |
| GET | `/map-manager/get-deleted-all` | `Api\V1\Map\MapManager\ResourceTableController::getDeletedAll` |
| GET | `/map-manager/get-all-with-deleted/{id}` | `Api\V1\Map\MapManager\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/map-manager/get-all-with-deleted` | `Api\V1\Map\MapManager\ResourceTableController::getAllWithDeleted` |
| POST | `/map-manager/create` | `Api\V1\Map\MapManager\ResourceTableController::create` |
| PUT | `/map-manager/update/{id}` | `Api\V1\Map\MapManager\ResourceTableController::update/$1` |
| DELETE | `/map-manager/delete-soft/{id}` | `Api\V1\Map\MapManager\ResourceTableController::deleteSoft/$1` |
| PATCH | `/map-manager/delete-restore/{id}` | `Api\V1\Map\MapManager\ResourceTableController::deleteRestore/$1` |
| DELETE | `/map-manager/delete-hard/{id}` | `Api\V1\Map\MapManager\ResourceTableController::deleteHard/$1` |
| DELETE | `/map-manager/clear-deleted` | `Api\V1\Map\MapManager\ResourceTableController::clearDeleted` |
| DELETE | `/map-manager/clear-deleted/{id}` | `Api\V1\Map\MapManager\ResourceTableController::clearDeleted/$1` |

### map-manager-view

Fonte: `Config/Routes/Api/v1/Map/MapManager/EndPointView.php` — view `view_map_manager` (9 rotas de leitura).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-manager-view/find` | `Api\V1\Map\MapManager\ResourceViewController::find` |
| POST | `/map-manager-view/get-grouped` | `Api\V1\Map\MapManager\ResourceViewController::getGrouped` |
| GET | `/map-manager-view/search` | `Api\V1\Map\MapManager\ResourceViewController::search` |
| GET | `/map-manager-view/get/{id}` | `Api\V1\Map\MapManager\ResourceViewController::get/$1` |
| GET | `/map-manager-view/get-all` | `Api\V1\Map\MapManager\ResourceViewController::getAll` |
| GET | `/map-manager-view/get-no-pagination` | `Api\V1\Map\MapManager\ResourceViewController::getNoPagination` |
| GET | `/map-manager-view/get-deleted/{id}` | `Api\V1\Map\MapManager\ResourceViewController::getDeleted/$1` |
| GET | `/map-manager-view/get-all-with-deleted` | `Api\V1\Map\MapManager\ResourceViewController::getAllWithDeleted` |
| GET | `/map-manager-view/get-deleted-all` | `Api\V1\Map\MapManager\ResourceViewController::getDeletedAll` |

### map-categories

Fonte: `Config/Routes/Api/v1/Map/MapCategories/EndpointTable.php` — contrato canônico (18 rotas).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-categories/find` | `Api\V1\Map\MapCategories\ResourceTableController::find` |
| POST | `/map-categories/get-grouped` | `Api\V1\Map\MapCategories\ResourceTableController::getGrouped` |
| GET | `/map-categories/search` | `Api\V1\Map\MapCategories\ResourceTableController::search` |
| GET | `/map-categories/get/{id}` | `Api\V1\Map\MapCategories\ResourceTableController::get/$1` |
| GET | `/map-categories/get-all` | `Api\V1\Map\MapCategories\ResourceTableController::getAll` |
| GET | `/map-categories/get-no-pagination` | `Api\V1\Map\MapCategories\ResourceTableController::getNoPagination` |
| GET | `/map-categories/get-deleted/{id}` | `Api\V1\Map\MapCategories\ResourceTableController::getDeleted/$1` |
| GET | `/map-categories/get-with-deleted/{id}` | `Api\V1\Map\MapCategories\ResourceTableController::getWithDeleted/$1` |
| GET | `/map-categories/get-deleted-all` | `Api\V1\Map\MapCategories\ResourceTableController::getDeletedAll` |
| GET | `/map-categories/get-all-with-deleted/{id}` | `Api\V1\Map\MapCategories\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/map-categories/get-all-with-deleted` | `Api\V1\Map\MapCategories\ResourceTableController::getAllWithDeleted` |
| POST | `/map-categories/create` | `Api\V1\Map\MapCategories\ResourceTableController::create` |
| PUT | `/map-categories/update/{id}` | `Api\V1\Map\MapCategories\ResourceTableController::update/$1` |
| DELETE | `/map-categories/delete-soft/{id}` | `Api\V1\Map\MapCategories\ResourceTableController::deleteSoft/$1` |
| PATCH | `/map-categories/delete-restore/{id}` | `Api\V1\Map\MapCategories\ResourceTableController::deleteRestore/$1` |
| DELETE | `/map-categories/delete-hard/{id}` | `Api\V1\Map\MapCategories\ResourceTableController::deleteHard/$1` |
| DELETE | `/map-categories/clear-deleted` | `Api\V1\Map\MapCategories\ResourceTableController::clearDeleted` |
| DELETE | `/map-categories/clear-deleted/{id}` | `Api\V1\Map\MapCategories\ResourceTableController::clearDeleted/$1` |

### map-categories-view

Fonte: `Config/Routes/Api/v1/Map/MapCategories/EndPointView.php` — view `view_map_categories` (9 rotas de leitura).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-categories-view/find` | `Api\V1\Map\MapCategories\ResourceViewController::find` |
| POST | `/map-categories-view/get-grouped` | `Api\V1\Map\MapCategories\ResourceViewController::getGrouped` |
| GET | `/map-categories-view/search` | `Api\V1\Map\MapCategories\ResourceViewController::search` |
| GET | `/map-categories-view/get/{id}` | `Api\V1\Map\MapCategories\ResourceViewController::get/$1` |
| GET | `/map-categories-view/get-all` | `Api\V1\Map\MapCategories\ResourceViewController::getAll` |
| GET | `/map-categories-view/get-no-pagination` | `Api\V1\Map\MapCategories\ResourceViewController::getNoPagination` |
| GET | `/map-categories-view/get-deleted/{id}` | `Api\V1\Map\MapCategories\ResourceViewController::getDeleted/$1` |
| GET | `/map-categories-view/get-all-with-deleted` | `Api\V1\Map\MapCategories\ResourceViewController::getAllWithDeleted` |
| GET | `/map-categories-view/get-deleted-all` | `Api\V1\Map\MapCategories\ResourceViewController::getDeletedAll` |

### map-postal-codes

Fonte: `Config/Routes/Api/v1/Map/MapPostalCodes/EndpointTable.php` — contrato canônico (18 rotas).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-postal-codes/find` | `Api\V1\Map\MapPostalCodes\ResourceTableController::find` |
| POST | `/map-postal-codes/get-grouped` | `Api\V1\Map\MapPostalCodes\ResourceTableController::getGrouped` |
| GET | `/map-postal-codes/search` | `Api\V1\Map\MapPostalCodes\ResourceTableController::search` |
| GET | `/map-postal-codes/get/{id}` | `Api\V1\Map\MapPostalCodes\ResourceTableController::get/$1` |
| GET | `/map-postal-codes/get-all` | `Api\V1\Map\MapPostalCodes\ResourceTableController::getAll` |
| GET | `/map-postal-codes/get-no-pagination` | `Api\V1\Map\MapPostalCodes\ResourceTableController::getNoPagination` |
| GET | `/map-postal-codes/get-deleted/{id}` | `Api\V1\Map\MapPostalCodes\ResourceTableController::getDeleted/$1` |
| GET | `/map-postal-codes/get-with-deleted/{id}` | `Api\V1\Map\MapPostalCodes\ResourceTableController::getWithDeleted/$1` |
| GET | `/map-postal-codes/get-deleted-all` | `Api\V1\Map\MapPostalCodes\ResourceTableController::getDeletedAll` |
| GET | `/map-postal-codes/get-all-with-deleted/{id}` | `Api\V1\Map\MapPostalCodes\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/map-postal-codes/get-all-with-deleted` | `Api\V1\Map\MapPostalCodes\ResourceTableController::getAllWithDeleted` |
| POST | `/map-postal-codes/create` | `Api\V1\Map\MapPostalCodes\ResourceTableController::create` |
| PUT | `/map-postal-codes/update/{id}` | `Api\V1\Map\MapPostalCodes\ResourceTableController::update/$1` |
| DELETE | `/map-postal-codes/delete-soft/{id}` | `Api\V1\Map\MapPostalCodes\ResourceTableController::deleteSoft/$1` |
| PATCH | `/map-postal-codes/delete-restore/{id}` | `Api\V1\Map\MapPostalCodes\ResourceTableController::deleteRestore/$1` |
| DELETE | `/map-postal-codes/delete-hard/{id}` | `Api\V1\Map\MapPostalCodes\ResourceTableController::deleteHard/$1` |
| DELETE | `/map-postal-codes/clear-deleted` | `Api\V1\Map\MapPostalCodes\ResourceTableController::clearDeleted` |
| DELETE | `/map-postal-codes/clear-deleted/{id}` | `Api\V1\Map\MapPostalCodes\ResourceTableController::clearDeleted/$1` |

### map-postal-codes-view

Fonte: `Config/Routes/Api/v1/Map/MapPostalCodes/EndPointView.php` — view `view_map_postal_codes` (9 rotas de leitura).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-postal-codes-view/find` | `Api\V1\Map\MapPostalCodes\ResourceViewController::find` |
| POST | `/map-postal-codes-view/get-grouped` | `Api\V1\Map\MapPostalCodes\ResourceViewController::getGrouped` |
| GET | `/map-postal-codes-view/search` | `Api\V1\Map\MapPostalCodes\ResourceViewController::search` |
| GET | `/map-postal-codes-view/get/{id}` | `Api\V1\Map\MapPostalCodes\ResourceViewController::get/$1` |
| GET | `/map-postal-codes-view/get-all` | `Api\V1\Map\MapPostalCodes\ResourceViewController::getAll` |
| GET | `/map-postal-codes-view/get-no-pagination` | `Api\V1\Map\MapPostalCodes\ResourceViewController::getNoPagination` |
| GET | `/map-postal-codes-view/get-deleted/{id}` | `Api\V1\Map\MapPostalCodes\ResourceViewController::getDeleted/$1` |
| GET | `/map-postal-codes-view/get-all-with-deleted` | `Api\V1\Map\MapPostalCodes\ResourceViewController::getAllWithDeleted` |
| GET | `/map-postal-codes-view/get-deleted-all` | `Api\V1\Map\MapPostalCodes\ResourceViewController::getDeletedAll` |

### map-addresses

Fonte: `Config/Routes/Api/v1/Map/MapAddresses/EndpointTable.php` — contrato canônico (18 rotas).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-addresses/find` | `Api\V1\Map\MapAddresses\ResourceTableController::find` |
| POST | `/map-addresses/get-grouped` | `Api\V1\Map\MapAddresses\ResourceTableController::getGrouped` |
| GET | `/map-addresses/search` | `Api\V1\Map\MapAddresses\ResourceTableController::search` |
| GET | `/map-addresses/get/{id}` | `Api\V1\Map\MapAddresses\ResourceTableController::get/$1` |
| GET | `/map-addresses/get-all` | `Api\V1\Map\MapAddresses\ResourceTableController::getAll` |
| GET | `/map-addresses/get-no-pagination` | `Api\V1\Map\MapAddresses\ResourceTableController::getNoPagination` |
| GET | `/map-addresses/get-deleted/{id}` | `Api\V1\Map\MapAddresses\ResourceTableController::getDeleted/$1` |
| GET | `/map-addresses/get-with-deleted/{id}` | `Api\V1\Map\MapAddresses\ResourceTableController::getWithDeleted/$1` |
| GET | `/map-addresses/get-deleted-all` | `Api\V1\Map\MapAddresses\ResourceTableController::getDeletedAll` |
| GET | `/map-addresses/get-all-with-deleted/{id}` | `Api\V1\Map\MapAddresses\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/map-addresses/get-all-with-deleted` | `Api\V1\Map\MapAddresses\ResourceTableController::getAllWithDeleted` |
| POST | `/map-addresses/create` | `Api\V1\Map\MapAddresses\ResourceTableController::create` |
| PUT | `/map-addresses/update/{id}` | `Api\V1\Map\MapAddresses\ResourceTableController::update/$1` |
| DELETE | `/map-addresses/delete-soft/{id}` | `Api\V1\Map\MapAddresses\ResourceTableController::deleteSoft/$1` |
| PATCH | `/map-addresses/delete-restore/{id}` | `Api\V1\Map\MapAddresses\ResourceTableController::deleteRestore/$1` |
| DELETE | `/map-addresses/delete-hard/{id}` | `Api\V1\Map\MapAddresses\ResourceTableController::deleteHard/$1` |
| DELETE | `/map-addresses/clear-deleted` | `Api\V1\Map\MapAddresses\ResourceTableController::clearDeleted` |
| DELETE | `/map-addresses/clear-deleted/{id}` | `Api\V1\Map\MapAddresses\ResourceTableController::clearDeleted/$1` |

### map-addresses-view

Fonte: `Config/Routes/Api/v1/Map/MapAddresses/EndPointView.php` — view `view_map_addresses` (9 rotas de leitura).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-addresses-view/find` | `Api\V1\Map\MapAddresses\ResourceViewController::find` |
| POST | `/map-addresses-view/get-grouped` | `Api\V1\Map\MapAddresses\ResourceViewController::getGrouped` |
| GET | `/map-addresses-view/search` | `Api\V1\Map\MapAddresses\ResourceViewController::search` |
| GET | `/map-addresses-view/get/{id}` | `Api\V1\Map\MapAddresses\ResourceViewController::get/$1` |
| GET | `/map-addresses-view/get-all` | `Api\V1\Map\MapAddresses\ResourceViewController::getAll` |
| GET | `/map-addresses-view/get-no-pagination` | `Api\V1\Map\MapAddresses\ResourceViewController::getNoPagination` |
| GET | `/map-addresses-view/get-deleted/{id}` | `Api\V1\Map\MapAddresses\ResourceViewController::getDeleted/$1` |
| GET | `/map-addresses-view/get-all-with-deleted` | `Api\V1\Map\MapAddresses\ResourceViewController::getAllWithDeleted` |
| GET | `/map-addresses-view/get-deleted-all` | `Api\V1\Map\MapAddresses\ResourceViewController::getDeletedAll` |

### map-points

Fonte: `Config/Routes/Api/v1/Map/MapPoints/EndpointTable.php` — contrato canônico (18 rotas).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-points/find` | `Api\V1\Map\MapPoints\ResourceTableController::find` |
| POST | `/map-points/get-grouped` | `Api\V1\Map\MapPoints\ResourceTableController::getGrouped` |
| GET | `/map-points/search` | `Api\V1\Map\MapPoints\ResourceTableController::search` |
| GET | `/map-points/get/{id}` | `Api\V1\Map\MapPoints\ResourceTableController::get/$1` |
| GET | `/map-points/get-all` | `Api\V1\Map\MapPoints\ResourceTableController::getAll` |
| GET | `/map-points/get-no-pagination` | `Api\V1\Map\MapPoints\ResourceTableController::getNoPagination` |
| GET | `/map-points/get-deleted/{id}` | `Api\V1\Map\MapPoints\ResourceTableController::getDeleted/$1` |
| GET | `/map-points/get-with-deleted/{id}` | `Api\V1\Map\MapPoints\ResourceTableController::getWithDeleted/$1` |
| GET | `/map-points/get-deleted-all` | `Api\V1\Map\MapPoints\ResourceTableController::getDeletedAll` |
| GET | `/map-points/get-all-with-deleted/{id}` | `Api\V1\Map\MapPoints\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/map-points/get-all-with-deleted` | `Api\V1\Map\MapPoints\ResourceTableController::getAllWithDeleted` |
| POST | `/map-points/create` | `Api\V1\Map\MapPoints\ResourceTableController::create` |
| PUT | `/map-points/update/{id}` | `Api\V1\Map\MapPoints\ResourceTableController::update/$1` |
| DELETE | `/map-points/delete-soft/{id}` | `Api\V1\Map\MapPoints\ResourceTableController::deleteSoft/$1` |
| PATCH | `/map-points/delete-restore/{id}` | `Api\V1\Map\MapPoints\ResourceTableController::deleteRestore/$1` |
| DELETE | `/map-points/delete-hard/{id}` | `Api\V1\Map\MapPoints\ResourceTableController::deleteHard/$1` |
| DELETE | `/map-points/clear-deleted` | `Api\V1\Map\MapPoints\ResourceTableController::clearDeleted` |
| DELETE | `/map-points/clear-deleted/{id}` | `Api\V1\Map\MapPoints\ResourceTableController::clearDeleted/$1` |

### map-points-view

Fonte: `Config/Routes/Api/v1/Map/MapPoints/EndPointView.php` — view `view_map_points` (9 rotas de leitura).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-points-view/find` | `Api\V1\Map\MapPoints\ResourceViewController::find` |
| POST | `/map-points-view/get-grouped` | `Api\V1\Map\MapPoints\ResourceViewController::getGrouped` |
| GET | `/map-points-view/search` | `Api\V1\Map\MapPoints\ResourceViewController::search` |
| GET | `/map-points-view/get/{id}` | `Api\V1\Map\MapPoints\ResourceViewController::get/$1` |
| GET | `/map-points-view/get-all` | `Api\V1\Map\MapPoints\ResourceViewController::getAll` |
| GET | `/map-points-view/get-no-pagination` | `Api\V1\Map\MapPoints\ResourceViewController::getNoPagination` |
| GET | `/map-points-view/get-deleted/{id}` | `Api\V1\Map\MapPoints\ResourceViewController::getDeleted/$1` |
| GET | `/map-points-view/get-all-with-deleted` | `Api\V1\Map\MapPoints\ResourceViewController::getAllWithDeleted` |
| GET | `/map-points-view/get-deleted-all` | `Api\V1\Map\MapPoints\ResourceViewController::getDeletedAll` |

### map-routes

Fonte: `Config/Routes/Api/v1/Map/MapRoutes/EndpointTable.php` — contrato canônico (18 rotas).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-routes/find` | `Api\V1\Map\MapRoutes\ResourceTableController::find` |
| POST | `/map-routes/get-grouped` | `Api\V1\Map\MapRoutes\ResourceTableController::getGrouped` |
| GET | `/map-routes/search` | `Api\V1\Map\MapRoutes\ResourceTableController::search` |
| GET | `/map-routes/get/{id}` | `Api\V1\Map\MapRoutes\ResourceTableController::get/$1` |
| GET | `/map-routes/get-all` | `Api\V1\Map\MapRoutes\ResourceTableController::getAll` |
| GET | `/map-routes/get-no-pagination` | `Api\V1\Map\MapRoutes\ResourceTableController::getNoPagination` |
| GET | `/map-routes/get-deleted/{id}` | `Api\V1\Map\MapRoutes\ResourceTableController::getDeleted/$1` |
| GET | `/map-routes/get-with-deleted/{id}` | `Api\V1\Map\MapRoutes\ResourceTableController::getWithDeleted/$1` |
| GET | `/map-routes/get-deleted-all` | `Api\V1\Map\MapRoutes\ResourceTableController::getDeletedAll` |
| GET | `/map-routes/get-all-with-deleted/{id}` | `Api\V1\Map\MapRoutes\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/map-routes/get-all-with-deleted` | `Api\V1\Map\MapRoutes\ResourceTableController::getAllWithDeleted` |
| POST | `/map-routes/create` | `Api\V1\Map\MapRoutes\ResourceTableController::create` |
| PUT | `/map-routes/update/{id}` | `Api\V1\Map\MapRoutes\ResourceTableController::update/$1` |
| DELETE | `/map-routes/delete-soft/{id}` | `Api\V1\Map\MapRoutes\ResourceTableController::deleteSoft/$1` |
| PATCH | `/map-routes/delete-restore/{id}` | `Api\V1\Map\MapRoutes\ResourceTableController::deleteRestore/$1` |
| DELETE | `/map-routes/delete-hard/{id}` | `Api\V1\Map\MapRoutes\ResourceTableController::deleteHard/$1` |
| DELETE | `/map-routes/clear-deleted` | `Api\V1\Map\MapRoutes\ResourceTableController::clearDeleted` |
| DELETE | `/map-routes/clear-deleted/{id}` | `Api\V1\Map\MapRoutes\ResourceTableController::clearDeleted/$1` |

### map-routes-view

Fonte: `Config/Routes/Api/v1/Map/MapRoutes/EndPointView.php` — view `view_map_routes` (9 rotas de leitura).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-routes-view/find` | `Api\V1\Map\MapRoutes\ResourceViewController::find` |
| POST | `/map-routes-view/get-grouped` | `Api\V1\Map\MapRoutes\ResourceViewController::getGrouped` |
| GET | `/map-routes-view/search` | `Api\V1\Map\MapRoutes\ResourceViewController::search` |
| GET | `/map-routes-view/get/{id}` | `Api\V1\Map\MapRoutes\ResourceViewController::get/$1` |
| GET | `/map-routes-view/get-all` | `Api\V1\Map\MapRoutes\ResourceViewController::getAll` |
| GET | `/map-routes-view/get-no-pagination` | `Api\V1\Map\MapRoutes\ResourceViewController::getNoPagination` |
| GET | `/map-routes-view/get-deleted/{id}` | `Api\V1\Map\MapRoutes\ResourceViewController::getDeleted/$1` |
| GET | `/map-routes-view/get-all-with-deleted` | `Api\V1\Map\MapRoutes\ResourceViewController::getAllWithDeleted` |
| GET | `/map-routes-view/get-deleted-all` | `Api\V1\Map\MapRoutes\ResourceViewController::getDeletedAll` |

### map-route-stops

Fonte: `Config/Routes/Api/v1/Map/MapRouteStops/EndpointTable.php` — contrato canônico (18 rotas).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-route-stops/find` | `Api\V1\Map\MapRouteStops\ResourceTableController::find` |
| POST | `/map-route-stops/get-grouped` | `Api\V1\Map\MapRouteStops\ResourceTableController::getGrouped` |
| GET | `/map-route-stops/search` | `Api\V1\Map\MapRouteStops\ResourceTableController::search` |
| GET | `/map-route-stops/get/{id}` | `Api\V1\Map\MapRouteStops\ResourceTableController::get/$1` |
| GET | `/map-route-stops/get-all` | `Api\V1\Map\MapRouteStops\ResourceTableController::getAll` |
| GET | `/map-route-stops/get-no-pagination` | `Api\V1\Map\MapRouteStops\ResourceTableController::getNoPagination` |
| GET | `/map-route-stops/get-deleted/{id}` | `Api\V1\Map\MapRouteStops\ResourceTableController::getDeleted/$1` |
| GET | `/map-route-stops/get-with-deleted/{id}` | `Api\V1\Map\MapRouteStops\ResourceTableController::getWithDeleted/$1` |
| GET | `/map-route-stops/get-deleted-all` | `Api\V1\Map\MapRouteStops\ResourceTableController::getDeletedAll` |
| GET | `/map-route-stops/get-all-with-deleted/{id}` | `Api\V1\Map\MapRouteStops\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/map-route-stops/get-all-with-deleted` | `Api\V1\Map\MapRouteStops\ResourceTableController::getAllWithDeleted` |
| POST | `/map-route-stops/create` | `Api\V1\Map\MapRouteStops\ResourceTableController::create` |
| PUT | `/map-route-stops/update/{id}` | `Api\V1\Map\MapRouteStops\ResourceTableController::update/$1` |
| DELETE | `/map-route-stops/delete-soft/{id}` | `Api\V1\Map\MapRouteStops\ResourceTableController::deleteSoft/$1` |
| PATCH | `/map-route-stops/delete-restore/{id}` | `Api\V1\Map\MapRouteStops\ResourceTableController::deleteRestore/$1` |
| DELETE | `/map-route-stops/delete-hard/{id}` | `Api\V1\Map\MapRouteStops\ResourceTableController::deleteHard/$1` |
| DELETE | `/map-route-stops/clear-deleted` | `Api\V1\Map\MapRouteStops\ResourceTableController::clearDeleted` |
| DELETE | `/map-route-stops/clear-deleted/{id}` | `Api\V1\Map\MapRouteStops\ResourceTableController::clearDeleted/$1` |

### map-route-stops-view

Fonte: `Config/Routes/Api/v1/Map/MapRouteStops/EndPointView.php` — view `view_map_route_stops` (9 rotas de leitura).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-route-stops-view/find` | `Api\V1\Map\MapRouteStops\ResourceViewController::find` |
| POST | `/map-route-stops-view/get-grouped` | `Api\V1\Map\MapRouteStops\ResourceViewController::getGrouped` |
| GET | `/map-route-stops-view/search` | `Api\V1\Map\MapRouteStops\ResourceViewController::search` |
| GET | `/map-route-stops-view/get/{id}` | `Api\V1\Map\MapRouteStops\ResourceViewController::get/$1` |
| GET | `/map-route-stops-view/get-all` | `Api\V1\Map\MapRouteStops\ResourceViewController::getAll` |
| GET | `/map-route-stops-view/get-no-pagination` | `Api\V1\Map\MapRouteStops\ResourceViewController::getNoPagination` |
| GET | `/map-route-stops-view/get-deleted/{id}` | `Api\V1\Map\MapRouteStops\ResourceViewController::getDeleted/$1` |
| GET | `/map-route-stops-view/get-all-with-deleted` | `Api\V1\Map\MapRouteStops\ResourceViewController::getAllWithDeleted` |
| GET | `/map-route-stops-view/get-deleted-all` | `Api\V1\Map\MapRouteStops\ResourceViewController::getDeletedAll` |

### map-geocode-cache

Fonte: `Config/Routes/Api/v1/Map/MapGeocodeCache/EndpointTable.php` — contrato canônico (18 rotas).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-geocode-cache/find` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::find` |
| POST | `/map-geocode-cache/get-grouped` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::getGrouped` |
| GET | `/map-geocode-cache/search` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::search` |
| GET | `/map-geocode-cache/get/{id}` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::get/$1` |
| GET | `/map-geocode-cache/get-all` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::getAll` |
| GET | `/map-geocode-cache/get-no-pagination` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::getNoPagination` |
| GET | `/map-geocode-cache/get-deleted/{id}` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::getDeleted/$1` |
| GET | `/map-geocode-cache/get-with-deleted/{id}` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::getWithDeleted/$1` |
| GET | `/map-geocode-cache/get-deleted-all` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::getDeletedAll` |
| GET | `/map-geocode-cache/get-all-with-deleted/{id}` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/map-geocode-cache/get-all-with-deleted` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::getAllWithDeleted` |
| POST | `/map-geocode-cache/create` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::create` |
| PUT | `/map-geocode-cache/update/{id}` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::update/$1` |
| DELETE | `/map-geocode-cache/delete-soft/{id}` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::deleteSoft/$1` |
| PATCH | `/map-geocode-cache/delete-restore/{id}` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::deleteRestore/$1` |
| DELETE | `/map-geocode-cache/delete-hard/{id}` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::deleteHard/$1` |
| DELETE | `/map-geocode-cache/clear-deleted` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::clearDeleted` |
| DELETE | `/map-geocode-cache/clear-deleted/{id}` | `Api\V1\Map\MapGeocodeCache\ResourceTableController::clearDeleted/$1` |

### map-geocode-cache-view

Fonte: `Config/Routes/Api/v1/Map/MapGeocodeCache/EndPointView.php` — view `view_map_geocode_cache` (9 rotas de leitura).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-geocode-cache-view/find` | `Api\V1\Map\MapGeocodeCache\ResourceViewController::find` |
| POST | `/map-geocode-cache-view/get-grouped` | `Api\V1\Map\MapGeocodeCache\ResourceViewController::getGrouped` |
| GET | `/map-geocode-cache-view/search` | `Api\V1\Map\MapGeocodeCache\ResourceViewController::search` |
| GET | `/map-geocode-cache-view/get/{id}` | `Api\V1\Map\MapGeocodeCache\ResourceViewController::get/$1` |
| GET | `/map-geocode-cache-view/get-all` | `Api\V1\Map\MapGeocodeCache\ResourceViewController::getAll` |
| GET | `/map-geocode-cache-view/get-no-pagination` | `Api\V1\Map\MapGeocodeCache\ResourceViewController::getNoPagination` |
| GET | `/map-geocode-cache-view/get-deleted/{id}` | `Api\V1\Map\MapGeocodeCache\ResourceViewController::getDeleted/$1` |
| GET | `/map-geocode-cache-view/get-all-with-deleted` | `Api\V1\Map\MapGeocodeCache\ResourceViewController::getAllWithDeleted` |
| GET | `/map-geocode-cache-view/get-deleted-all` | `Api\V1\Map\MapGeocodeCache\ResourceViewController::getDeletedAll` |

### map-links

Fonte: `Config/Routes/Api/v1/Map/MapLinks/EndpointTable.php` — contrato canônico (18 rotas). Vínculo universal módulo ↔ mapa.

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-links/find` | `Api\V1\Map\MapLinks\ResourceTableController::find` |
| POST | `/map-links/get-grouped` | `Api\V1\Map\MapLinks\ResourceTableController::getGrouped` |
| GET | `/map-links/search` | `Api\V1\Map\MapLinks\ResourceTableController::search` |
| GET | `/map-links/get/{id}` | `Api\V1\Map\MapLinks\ResourceTableController::get/$1` |
| GET | `/map-links/get-all` | `Api\V1\Map\MapLinks\ResourceTableController::getAll` |
| GET | `/map-links/get-no-pagination` | `Api\V1\Map\MapLinks\ResourceTableController::getNoPagination` |
| GET | `/map-links/get-deleted/{id}` | `Api\V1\Map\MapLinks\ResourceTableController::getDeleted/$1` |
| GET | `/map-links/get-with-deleted/{id}` | `Api\V1\Map\MapLinks\ResourceTableController::getWithDeleted/$1` |
| GET | `/map-links/get-deleted-all` | `Api\V1\Map\MapLinks\ResourceTableController::getDeletedAll` |
| GET | `/map-links/get-all-with-deleted/{id}` | `Api\V1\Map\MapLinks\ResourceTableController::getAllWithDeleted/$1` |
| GET | `/map-links/get-all-with-deleted` | `Api\V1\Map\MapLinks\ResourceTableController::getAllWithDeleted` |
| POST | `/map-links/create` | `Api\V1\Map\MapLinks\ResourceTableController::create` |
| PUT | `/map-links/update/{id}` | `Api\V1\Map\MapLinks\ResourceTableController::update/$1` |
| DELETE | `/map-links/delete-soft/{id}` | `Api\V1\Map\MapLinks\ResourceTableController::deleteSoft/$1` |
| PATCH | `/map-links/delete-restore/{id}` | `Api\V1\Map\MapLinks\ResourceTableController::deleteRestore/$1` |
| DELETE | `/map-links/delete-hard/{id}` | `Api\V1\Map\MapLinks\ResourceTableController::deleteHard/$1` |
| DELETE | `/map-links/clear-deleted` | `Api\V1\Map\MapLinks\ResourceTableController::clearDeleted` |
| DELETE | `/map-links/clear-deleted/{id}` | `Api\V1\Map\MapLinks\ResourceTableController::clearDeleted/$1` |

### map-links-view

Fonte: `Config/Routes/Api/v1/Map/MapLinks/EndPointView.php` — view `view_map_links` (9 rotas de leitura). Use `find` com `{"ml_module": "...", "ml_reference_id": N}`.

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| POST | `/map-links-view/find` | `Api\V1\Map\MapLinks\ResourceViewController::find` |
| POST | `/map-links-view/get-grouped` | `Api\V1\Map\MapLinks\ResourceViewController::getGrouped` |
| GET | `/map-links-view/search` | `Api\V1\Map\MapLinks\ResourceViewController::search` |
| GET | `/map-links-view/get/{id}` | `Api\V1\Map\MapLinks\ResourceViewController::get/$1` |
| GET | `/map-links-view/get-all` | `Api\V1\Map\MapLinks\ResourceViewController::getAll` |
| GET | `/map-links-view/get-no-pagination` | `Api\V1\Map\MapLinks\ResourceViewController::getNoPagination` |
| GET | `/map-links-view/get-deleted/{id}` | `Api\V1\Map\MapLinks\ResourceViewController::getDeleted/$1` |
| GET | `/map-links-view/get-all-with-deleted` | `Api\V1\Map\MapLinks\ResourceViewController::getAllWithDeleted` |
| GET | `/map-links-view/get-deleted-all` | `Api\V1\Map\MapLinks\ResourceViewController::getDeletedAll` |

### map-geo

Fonte: `Config/Routes/Api/v1/Map/MapGeo/EndpointGeo.php` — proxy dos provedores (5 rotas próprias, desvio sancionado do contrato 18/9; `jwtauth`, guest 403).

| Método | Rota | Controller::method |
| ------ | ---- | ------------------ |
| GET | `/map-geo/status` | `Api\V1\Map\MapGeo\GeoController::status` |
| GET | `/map-geo/search` | `Api\V1\Map\MapGeo\GeoController::geocode` |
| GET | `/map-geo/reverse` | `Api\V1\Map\MapGeo\GeoController::reverse` |
| GET | `/map-geo/cep/{cep}` | `Api\V1\Map\MapGeo\GeoController::cep/$1` |
| POST | `/map-geo/route` | `Api\V1\Map\MapGeo\GeoController::route` |

---

---

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
