# Rotas da API v1

> Este documento lista, de forma textual, todas as rotas REST definidas em
> `app/Config/Routes/Api/v1`, agrupadas por módulo, na mesma ordem em que são
> registradas em `app/Config/Routes.php`.
>
> Base: `{{www}}/index.php/api/v1`

---

## User — Módulo de usuários

### user-manager

Fonte: `Config/Routes/Api/v1/User/UserManager/EndpointTable.php`

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
| GET    | `/user-manager/get-deleted-all`           | `Api\V1\User\UserManager\ResourceTableController::getDeletedAll`        |
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

### user-roles

Fonte: `Config/Routes/Api/v1/User/UserRoles/EndpointTable.php` — módulo **somente leitura** (perfis de acesso), sem create/update/delete.

| Método | Rota                            | Controller::method                                               |
| ------ | ------------------------------- | ---------------------------------------------------------------- |
| POST   | `/user-roles/find`              | `Api\V1\User\UserRoles\ResourceTableController::find`            |
| POST   | `/user-roles/get-grouped`       | `Api\V1\User\UserRoles\ResourceTableController::getGrouped`      |
| GET    | `/user-roles/search`            | `Api\V1\User\UserRoles\ResourceTableController::search`          |
| GET    | `/user-roles/get/{id}`          | `Api\V1\User\UserRoles\ResourceTableController::get/$1`          |
| GET    | `/user-roles/get-all`           | `Api\V1\User\UserRoles\ResourceTableController::getAll`          |
| GET    | `/user-roles/get-no-pagination` | `Api\V1\User\UserRoles\ResourceTableController::getNoPagination` |

### user-profiles

Fonte: `Config/Routes/Api/v1/User/UserProfiles/EndpointTable.php`

| Método | Rota                                       | Controller::method                                                       |
| ------ | ------------------------------------------ | ------------------------------------------------------------------------ |
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
| POST   | `/user-profiles/create`                    | `Api\V1\User\UserProfiles\ResourceTableController::create`               |
| PUT    | `/user-profiles/update/{id}`               | `Api\V1\User\UserProfiles\ResourceTableController::update/$1`            |
| DELETE | `/user-profiles/delete-soft/{id}`          | `Api\V1\User\UserProfiles\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/user-profiles/delete-restore/{id}`       | `Api\V1\User\UserProfiles\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/user-profiles/delete-hard/{id}`          | `Api\V1\User\UserProfiles\ResourceTableController::deleteHard/$1`        |
| DELETE | `/user-profiles/clear-deleted`             | `Api\V1\User\UserProfiles\ResourceTableController::clearDeleted`         |
| DELETE | `/user-profiles/clear-deleted/{id}`        | `Api\V1\User\UserProfiles\ResourceTableController::clearDeleted/$1`      |

---

## Upload — Módulo de uploads (anexos polimórficos de outros módulos)

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

Hierarquia: `form_manager` > `form_groups` > `form_rows` > `form_fields` (rota `form-campos`) + view de ligação `view_form_manager`. APIs públicas (sem JWT).

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

## Agenda — Módulo de calendário (espelho do Google Agenda)

Hierarquia: `calendars` > `calendar_events` > `{attendees, reminders, attachments, extended_properties}`. APIs REST, contrato canônico (18 rotas) em todos os submódulos.

### calendars

Fonte: `Config/Routes/Api/v1/Agenda/Calendars/EndpointTable.php`

| Método | Rota                                   | Controller::method                                                      |
| ------ | -------------------------------------- | ----------------------------------------------------------------------- |
| POST   | `/calendars/find`                      | `Api\V1\Agenda\Calendars\ResourceTableController::find`                 |
| POST   | `/calendars/get-grouped`               | `Api\V1\Agenda\Calendars\ResourceTableController::getGrouped`           |
| GET    | `/calendars/search`                    | `Api\V1\Agenda\Calendars\ResourceTableController::search`               |
| GET    | `/calendars/get/{id}`                  | `Api\V1\Agenda\Calendars\ResourceTableController::get/$1`               |
| GET    | `/calendars/get-all`                   | `Api\V1\Agenda\Calendars\ResourceTableController::getAll`               |
| GET    | `/calendars/get-no-pagination`         | `Api\V1\Agenda\Calendars\ResourceTableController::getNoPagination`      |
| GET    | `/calendars/get-deleted/{id}`          | `Api\V1\Agenda\Calendars\ResourceTableController::getDeleted/$1`        |
| GET    | `/calendars/get-with-deleted/{id}`     | `Api\V1\Agenda\Calendars\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/calendars/get-deleted-all`           | `Api\V1\Agenda\Calendars\ResourceTableController::getDeletedAll`        |
| GET    | `/calendars/get-all-with-deleted/{id}` | `Api\V1\Agenda\Calendars\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/calendars/get-all-with-deleted`      | `Api\V1\Agenda\Calendars\ResourceTableController::getAllWithDeleted`    |
| POST   | `/calendars/create`                    | `Api\V1\Agenda\Calendars\ResourceTableController::create`               |
| PUT    | `/calendars/update/{id}`               | `Api\V1\Agenda\Calendars\ResourceTableController::update/$1`            |
| DELETE | `/calendars/delete-soft/{id}`          | `Api\V1\Agenda\Calendars\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/calendars/delete-restore/{id}`       | `Api\V1\Agenda\Calendars\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/calendars/delete-hard/{id}`          | `Api\V1\Agenda\Calendars\ResourceTableController::deleteHard/$1`        |
| DELETE | `/calendars/clear-deleted`             | `Api\V1\Agenda\Calendars\ResourceTableController::clearDeleted`         |
| DELETE | `/calendars/clear-deleted/{id}`        | `Api\V1\Agenda\Calendars\ResourceTableController::clearDeleted/$1`      |

### calendar-events

Fonte: `Config/Routes/Api/v1/Agenda/CalendarEvents/EndpointTable.php`

| Método | Rota                                         | Controller::method                                                           |
| ------ | -------------------------------------------- | ---------------------------------------------------------------------------- |
| POST   | `/calendar-events/find`                      | `Api\V1\Agenda\CalendarEvents\ResourceTableController::find`                 |
| POST   | `/calendar-events/get-grouped`               | `Api\V1\Agenda\CalendarEvents\ResourceTableController::getGrouped`           |
| GET    | `/calendar-events/search`                    | `Api\V1\Agenda\CalendarEvents\ResourceTableController::search`               |
| GET    | `/calendar-events/get/{id}`                  | `Api\V1\Agenda\CalendarEvents\ResourceTableController::get/$1`               |
| GET    | `/calendar-events/get-all`                   | `Api\V1\Agenda\CalendarEvents\ResourceTableController::getAll`               |
| GET    | `/calendar-events/get-no-pagination`         | `Api\V1\Agenda\CalendarEvents\ResourceTableController::getNoPagination`      |
| GET    | `/calendar-events/get-deleted/{id}`          | `Api\V1\Agenda\CalendarEvents\ResourceTableController::getDeleted/$1`        |
| GET    | `/calendar-events/get-with-deleted/{id}`     | `Api\V1\Agenda\CalendarEvents\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/calendar-events/get-deleted-all`           | `Api\V1\Agenda\CalendarEvents\ResourceTableController::getDeletedAll`        |
| GET    | `/calendar-events/get-all-with-deleted/{id}` | `Api\V1\Agenda\CalendarEvents\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/calendar-events/get-all-with-deleted`      | `Api\V1\Agenda\CalendarEvents\ResourceTableController::getAllWithDeleted`    |
| POST   | `/calendar-events/create`                    | `Api\V1\Agenda\CalendarEvents\ResourceTableController::create`               |
| PUT    | `/calendar-events/update/{id}`               | `Api\V1\Agenda\CalendarEvents\ResourceTableController::update/$1`            |
| DELETE | `/calendar-events/delete-soft/{id}`          | `Api\V1\Agenda\CalendarEvents\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/calendar-events/delete-restore/{id}`       | `Api\V1\Agenda\CalendarEvents\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/calendar-events/delete-hard/{id}`          | `Api\V1\Agenda\CalendarEvents\ResourceTableController::deleteHard/$1`        |
| DELETE | `/calendar-events/clear-deleted`             | `Api\V1\Agenda\CalendarEvents\ResourceTableController::clearDeleted`         |
| DELETE | `/calendar-events/clear-deleted/{id}`        | `Api\V1\Agenda\CalendarEvents\ResourceTableController::clearDeleted/$1`      |

### calendar-event-attendees

Fonte: `Config/Routes/Api/v1/Agenda/CalendarEventAttendees/EndpointTable.php`

| Método | Rota                                                  | Controller::method                                                                   |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| POST   | `/calendar-event-attendees/find`                      | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::find`                 |
| POST   | `/calendar-event-attendees/get-grouped`               | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::getGrouped`           |
| GET    | `/calendar-event-attendees/search`                    | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::search`               |
| GET    | `/calendar-event-attendees/get/{id}`                  | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::get/$1`               |
| GET    | `/calendar-event-attendees/get-all`                   | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::getAll`               |
| GET    | `/calendar-event-attendees/get-no-pagination`         | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::getNoPagination`      |
| GET    | `/calendar-event-attendees/get-deleted/{id}`          | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::getDeleted/$1`        |
| GET    | `/calendar-event-attendees/get-with-deleted/{id}`     | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/calendar-event-attendees/get-deleted-all`           | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::getDeletedAll`        |
| GET    | `/calendar-event-attendees/get-all-with-deleted/{id}` | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/calendar-event-attendees/get-all-with-deleted`      | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::getAllWithDeleted`    |
| POST   | `/calendar-event-attendees/create`                    | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::create`               |
| PUT    | `/calendar-event-attendees/update/{id}`               | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::update/$1`            |
| DELETE | `/calendar-event-attendees/delete-soft/{id}`          | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/calendar-event-attendees/delete-restore/{id}`       | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/calendar-event-attendees/delete-hard/{id}`          | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::deleteHard/$1`        |
| DELETE | `/calendar-event-attendees/clear-deleted`             | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::clearDeleted`         |
| DELETE | `/calendar-event-attendees/clear-deleted/{id}`        | `Api\V1\Agenda\CalendarEventAttendees\ResourceTableController::clearDeleted/$1`      |

### calendar-event-reminders

Fonte: `Config/Routes/Api/v1/Agenda/CalendarEventReminders/EndpointTable.php`

| Método | Rota                                                  | Controller::method                                                                   |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| POST   | `/calendar-event-reminders/find`                      | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::find`                 |
| POST   | `/calendar-event-reminders/get-grouped`               | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::getGrouped`           |
| GET    | `/calendar-event-reminders/search`                    | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::search`               |
| GET    | `/calendar-event-reminders/get/{id}`                  | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::get/$1`               |
| GET    | `/calendar-event-reminders/get-all`                   | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::getAll`               |
| GET    | `/calendar-event-reminders/get-no-pagination`         | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::getNoPagination`      |
| GET    | `/calendar-event-reminders/get-deleted/{id}`          | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::getDeleted/$1`        |
| GET    | `/calendar-event-reminders/get-with-deleted/{id}`     | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/calendar-event-reminders/get-deleted-all`           | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::getDeletedAll`        |
| GET    | `/calendar-event-reminders/get-all-with-deleted/{id}` | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/calendar-event-reminders/get-all-with-deleted`      | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::getAllWithDeleted`    |
| POST   | `/calendar-event-reminders/create`                    | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::create`               |
| PUT    | `/calendar-event-reminders/update/{id}`               | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::update/$1`            |
| DELETE | `/calendar-event-reminders/delete-soft/{id}`          | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/calendar-event-reminders/delete-restore/{id}`       | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/calendar-event-reminders/delete-hard/{id}`          | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::deleteHard/$1`        |
| DELETE | `/calendar-event-reminders/clear-deleted`             | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::clearDeleted`         |
| DELETE | `/calendar-event-reminders/clear-deleted/{id}`        | `Api\V1\Agenda\CalendarEventReminders\ResourceTableController::clearDeleted/$1`      |

### calendar-event-attachments

Fonte: `Config/Routes/Api/v1/Agenda/CalendarEventAttachments/EndpointTable.php`

| Método | Rota                                                    | Controller::method                                                                     |
| ------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| POST   | `/calendar-event-attachments/find`                      | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::find`                 |
| POST   | `/calendar-event-attachments/get-grouped`               | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getGrouped`           |
| GET    | `/calendar-event-attachments/search`                    | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::search`               |
| GET    | `/calendar-event-attachments/get/{id}`                  | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::get/$1`               |
| GET    | `/calendar-event-attachments/get-all`                   | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getAll`               |
| GET    | `/calendar-event-attachments/get-no-pagination`         | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getNoPagination`      |
| GET    | `/calendar-event-attachments/get-deleted/{id}`          | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getDeleted/$1`        |
| GET    | `/calendar-event-attachments/get-with-deleted/{id}`     | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/calendar-event-attachments/get-deleted-all`           | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getDeletedAll`        |
| GET    | `/calendar-event-attachments/get-all-with-deleted/{id}` | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/calendar-event-attachments/get-all-with-deleted`      | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::getAllWithDeleted`    |
| POST   | `/calendar-event-attachments/create`                    | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::create`               |
| PUT    | `/calendar-event-attachments/update/{id}`               | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::update/$1`            |
| DELETE | `/calendar-event-attachments/delete-soft/{id}`          | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/calendar-event-attachments/delete-restore/{id}`       | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/calendar-event-attachments/delete-hard/{id}`          | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::deleteHard/$1`        |
| DELETE | `/calendar-event-attachments/clear-deleted`             | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::clearDeleted`         |
| DELETE | `/calendar-event-attachments/clear-deleted/{id}`        | `Api\V1\Agenda\CalendarEventAttachments\ResourceTableController::clearDeleted/$1`      |

### calendar-event-extended-properties

Fonte: `Config/Routes/Api/v1/Agenda/CalendarEventExtendedProperties/EndpointTable.php`

| Método | Rota                                                            | Controller::method                                                                            |
| ------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| POST   | `/calendar-event-extended-properties/find`                      | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::find`                 |
| POST   | `/calendar-event-extended-properties/get-grouped`               | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::getGrouped`           |
| GET    | `/calendar-event-extended-properties/search`                    | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::search`               |
| GET    | `/calendar-event-extended-properties/get/{id}`                  | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::get/$1`               |
| GET    | `/calendar-event-extended-properties/get-all`                   | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::getAll`               |
| GET    | `/calendar-event-extended-properties/get-no-pagination`         | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::getNoPagination`      |
| GET    | `/calendar-event-extended-properties/get-deleted/{id}`          | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::getDeleted/$1`        |
| GET    | `/calendar-event-extended-properties/get-with-deleted/{id}`     | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::getWithDeleted/$1`    |
| GET    | `/calendar-event-extended-properties/get-deleted-all`           | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::getDeletedAll`        |
| GET    | `/calendar-event-extended-properties/get-all-with-deleted/{id}` | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::getAllWithDeleted/$1` |
| GET    | `/calendar-event-extended-properties/get-all-with-deleted`      | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::getAllWithDeleted`    |
| POST   | `/calendar-event-extended-properties/create`                    | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::create`               |
| PUT    | `/calendar-event-extended-properties/update/{id}`               | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::update/$1`            |
| DELETE | `/calendar-event-extended-properties/delete-soft/{id}`          | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::deleteSoft/$1`        |
| PATCH  | `/calendar-event-extended-properties/delete-restore/{id}`       | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::deleteRestore/$1`     |
| DELETE | `/calendar-event-extended-properties/delete-hard/{id}`          | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::deleteHard/$1`        |
| DELETE | `/calendar-event-extended-properties/clear-deleted`             | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::clearDeleted`         |
| DELETE | `/calendar-event-extended-properties/clear-deleted/{id}`        | `Api\V1\Agenda\CalendarEventExtendedProperties\ResourceTableController::clearDeleted/$1`      |

---

## Meta — Utilitários read-only

### db-schema

Fonte: `Config/Routes/Api/v1/Meta/DbSchema/Endpoint.php` — introspecção do banco (somente leitura). Desvio sancionado: 3 rotas próprias.

| Método | Rota                           | Controller::method                                   |
| ------ | ------------------------------ | ---------------------------------------------------- |
| GET    | `/db-schema/tables`            | `Api\V1\Meta\DbSchema\SchemaController::tables`      |
| GET    | `/db-schema/columns/{tabela}`  | `Api\V1\Meta\DbSchema\SchemaController::columns/$1`  |
| GET    | `/db-schema/describe/{tabela}` | `Api\V1\Meta\DbSchema\SchemaController::describe/$1` |
