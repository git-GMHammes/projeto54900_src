[◄ Índice da base de conhecimento](../README.md)

---

# Módulo Upload / UploadManager (API V1)

Recurso REST que **armazena e serve arquivos** (Office, imagem, áudio, vídeo,
PDF, compactados) como **anexos de qualquer outro módulo** do sistema. É
polimórfico: o dono de cada arquivo é identificado por `module` +
`reference_id` (+ `collection` opcional), sem foreign key.

Espelha o módulo `User/UserManager` e segue o
[`ROADMAP_padrao_modulo.md`](ROADMAP_padrao_modulo.md), com dois desvios
sancionados (ver a última seção).

## 1. Identidade

| Item | Valor |
| --- | --- |
| Domínio / Módulo | `Upload` / `UploadManager` |
| Namespace | `App\...\V1\Upload\UploadManager` |
| Slug de tabela | `upload-manager` → `api/v1/upload-manager/...` |
| Slug de view | `upload-manager-view` → `api/v1/upload-manager-view/...` |
| Tabela | `uploads` (banco `codeigniter54900_db`, grupo `DB_GROUP_001`) |
| View | `view_upload_manager` (projeção direta de `uploads`, prefixo `up_`) |
| Raiz física | `UPLOAD_DISK` = `writable/uploads/` (constante em `Config/Constants.php`) |

## 2. Onde o arquivo é gravado

```
writable/uploads/<module>/<reference_id>/<file_key><AAAAMMDDHHMMSS>.<ext>
```

- **Sem versão na pasta** — a tabela `uploads` não tem coluna de versão. A
  versão do sistema (`V1`, `V1A`, …) vive só no código/rotas; o disco só
  identifica por subpastas.
- `<module>` e `<collection>` são sanitizados para `[A-Za-z0-9_]`;
  `<reference_id>` é inteiro. Nada de `..` ou separador chega ao disco.
- Exemplo (foto do usuário 53):
  `writable/uploads/UserManager/53/1a2b3c4d5e6f70819a2b3c4d5e6f7081` +
  `20260905222254.jpg`.

`writable/uploads/*` já está no `.gitignore` (`src/.gitignore`).

## 3. Tabela `uploads`

| Coluna | Tipo | Papel |
| --- | --- | --- |
| `id` | BIGINT PK | |
| `module` | VARCHAR(64) NOT NULL | módulo dono; vira subpasta. **Imutável** via update |
| `reference_id` | BIGINT NOT NULL | id do registro dono; vira subpasta |
| `collection` | VARCHAR(64) NULL | agrupador (`avatar`, `attachment`, `cover`, …) |
| `file_key` | CHAR(32) NOT NULL UNIQUE | chave hex; prefixo do nome no disco |
| `original_name` | VARCHAR(255) NOT NULL | nome enviado pelo cliente |
| `stored_name` | VARCHAR(255) NOT NULL | `<file_key><AAAAMMDDHHMMSS>.<ext>` |
| `storage_path` | VARCHAR(500) NOT NULL | relativo à raiz: `<module>/<reference_id>/<stored_name>` |
| `file_url` | VARCHAR(500) NOT NULL | `.../api/v1/upload-manager/serve/<id>` (montado após o insert) |
| `mime_type` | VARCHAR(150) NULL | |
| `extension` | VARCHAR(20) NULL | |
| `file_size` | BIGINT NULL | bytes |
| `checksum_sha256` | CHAR(64) NULL | integridade / dedupe. **Nunca sai na API** (`$hidden`) |
| `category` | ENUM | `image,video,audio,document,spreadsheet,presentation,pdf,archive,other` (default `other`) |
| `title` | VARCHAR(255) NULL | rótulo editável |
| `description` | TEXT NULL | descrição editável |
| `status` | ENUM(`active`,`inactive`) | default `active`. `serve`/`download` só entregam `active` |
| `created_at` / `updated_at` / `deleted_at` | DATETIME | padrão (soft delete) |

Índices: `UNIQUE(file_key)`, `KEY(module, reference_id)`, `KEY(collection)`,
`KEY(category)`, `KEY(status)`. **Sem FK** (serve N módulos).

## 4. Rotas

### 4.1 Tabela — `api/v1/upload-manager/...` (18 canônicas + 3 específicas)

As 18 são idênticas ao §5.1 do ROADMAP (`find`, `get-grouped`, `search`,
`get/{id}`, `get-all`, `get-no-pagination`, `get-deleted/{id}`,
`get-with-deleted/{id}`, `get-deleted-all`, `get-all-with-deleted[/{id}]`,
`create`, `update/{id}`, `delete-soft/{id}`, `delete-restore/{id}`,
`delete-hard/{id}`, `clear-deleted[/{id}]`).

Específicas do módulo (arquivo `EndpointUpload.php`):

| Verbo | Caminho | Método | Uso |
| --- | --- | --- | --- |
| POST | `upload` | `upload` | `multipart/form-data`: `file` (obrigatório), `module`, `reference_id`, `collection?`, `title?`, `description?` → grava o arquivo e cria a linha. Responde **201** no envelope padrão com o registro. |
| GET | `serve/(:num)` | `serve/$1` | entrega o binário **inline** (`Content-Disposition: inline`), `Content-Type` do `mime_type`, header `X-Content-Type-Options: nosniff` |
| GET | `download/(:num)` | `download/$1` | entrega o binário como **anexo** (`Content-Disposition: attachment`) |

- `create` (JSON) continua existindo para registrar metadado de um arquivo já
  existente/externo; o caminho normal de envio é `POST upload`.
- `update/{id}` só altera **metadados**: `reference_id`, `collection`, `title`,
  `description`, `status`. Os campos físicos são removidos no
  `Processor::prepareUpdateData`. Trocar o binário = novo `POST upload` +
  `delete-soft` do antigo.
- `delete-hard/{id}` e `clear-deleted` removem a linha **e** o arquivo do disco
  (e o diretório do dono, se ficar vazio).

### 4.2 View — `api/v1/upload-manager-view/...` (10 linhas / 9 rotas)

Idêntico ao §5.2 do ROADMAP. Somente leitura sobre `view_upload_manager`
(colunas de negócio com prefixo `up_`; `checksum_sha256` não consta).

## 5. Política de arquivos — `Config/Upload.php`

- `allowedExt` / `allowedMime` — listas brancas (regras `ext_in` / `mime_in`).
  **SVG fica de fora** por padrão (conteúdo ativo).
- `maxSizeKbGlobal` — teto por upload (regra `max_size`); hoje 500 MB.
- `dedupe` (bool) — se `true`, recusa (409) upload de conteúdo idêntico
  (`sha256`) para o mesmo `module` + `reference_id`.
- `mimeCategory` / `extCategory` — mapeiam o arquivo para a `category`.
- `servePath` / `downloadPath` — usados para montar `file_url`.

## 6. Como classificar (`category`)

`StorageManager::categorize()` — casa o MIME por igualdade ou por prefixo
(`image/`, `audio/`, `video/`); se o MIME for genérico/ausente
(`application/octet-stream`), cai no mapa por extensão; o resto vira `other`.

## 7. Usando o módulo a partir de outro módulo

O módulo servido guarda o `id` (e/ou `file_url`) do upload onde precisar, ou
consulta pela chave `module` + `reference_id`.

### 7.1 Enviar (HTTP, forma recomendada)

```
POST /api/v1/upload-manager/upload           (multipart/form-data)
  file          = <binário>
  module        = UserManager
  reference_id  = 53
  collection    = avatar        (opcional)
  title         = Foto de perfil (opcional)
```

Resposta `201`:

```json
{
  "method": "POST",
  "endpoint": "/api/v1/upload-manager/upload",
  "statusCode": 201,
  "message": "Registro criado com sucesso",
  "success": true,
  "data": {
    "id": 12,
    "module": "UserManager",
    "reference_id": 53,
    "collection": "avatar",
    "file_key": "1a2b3c4d5e6f70819a2b3c4d5e6f7081",
    "original_name": "foto.jpg",
    "stored_name": "1a2b3c4d5e6f70819a2b3c4d5e6f708120260905222254.jpg",
    "storage_path": "UserManager/53/1a2b3c4d5e6f70819a2b3c4d5e6f708120260905222254.jpg",
    "file_url": "http://localhost:54900/index.php/api/v1/upload-manager/serve/12",
    "mime_type": "image/jpeg",
    "extension": "jpg",
    "file_size": 84213,
    "category": "image",
    "title": "Foto de perfil",
    "status": "active",
    "created_at": "2026-09-05 22:22:54"
  }
}
```

### 7.2 Listar os anexos de um dono

```
POST /api/v1/upload-manager/get-grouped
  { "module": ["UserManager"], "reference_id": ["53"], "collection": ["avatar"] }
```

### 7.3 Exibir / baixar

- Inline (`<img src>`, preview): `GET /api/v1/upload-manager/serve/12` (ou o
  `file_url` gravado).
- Download forçado: `GET /api/v1/upload-manager/download/12`.

### 7.4 Exemplos de uso previstos

| Cenário | `module` | `reference_id` | `collection` |
| --- | --- | --- | --- |
| Foto de um usuário | `UserManager` | id do usuário | `avatar` |
| Documento de uma reunião | `CalendarEvent` | id do evento | `attachment` |

## 8. Camadas / arquivos

```
Config/Upload.php                                   política (mime/ext/tamanho/dedupe/categoria)
Config/Constants.php                                + UPLOAD_DISK
Config/Routes.php                                   + grupos upload-manager e upload-manager-view
Config/Routes/Api/v1/Upload/UploadManager/
  EndpointTable.php (18)  EndpointUpload.php (3)  EndPointView.php (10)
Controllers/Api/V1/Upload/UploadManager/
  ResourceTableController.php   (processor + rules + upload/serve/download)
  ResourceViewController.php
Requests/V1/Upload/UploadManager/
  CreateRequest.php   UpdateRequest.php   UploadRequest.php
Services/V1/Upload/UploadManager/
  Processor.php        extends BaseTableService (hooks + store/resolvePhysical/deleteHard/clearDeleted)
  StorageManager.php   política de disco (sem herança, sem banco)
Models/V1/Upload/UploadManager/
  SqlTableModel.php   SqlViewModel.php
Database/Migrations/
  2026-09-05-223100_CreateUploadManagerTableMigration.php
  2026-09-05-223101_CreateViewUploadManagerMigration.php
```

Nenhuma classe `Base*` foi alterada.

## 9. Aplicar

```
podman compose exec php php spark migrate
podman compose exec php php spark routes      # confere as ~31 rotas novas
```

## 10. Desvios sancionados do padrão

1. **Tabela polimórfica sem foreign key.** `uploads` serve N módulos; não há
   FK nem `CASCADE`. Consequência: excluir o dono **não** apaga os anexos
   (arquivos órfãos). Mitigação futura: endpoint/rotina `clear-orphans` (não
   implementado nesta versão).
2. **3 rotas além das 18/10 canônicas** (`upload`, `serve`, `download`). O
   padrão não cobre `multipart` nem streaming de binário. As 18/10 canônicas
   seguem intactas para os metadados.

## 11. Observações operacionais (fora do código)

- **Limite de corpo da requisição:** `client_max_body_size` do nginx
  (`docker/nginx/*.conf`) hoje não está definido (default ~1 MB) e
  `upload_max_filesize` / `post_max_size` do php-fpm (`docker/php/...`) podem
  precisar de ajuste para uploads grandes.
- **SVG e conteúdo ativo:** desabilitado por padrão em `Config/Upload.php`;
  `serve` responde sempre com `X-Content-Type-Options: nosniff` e `download`
  força anexo.

---

[◄ Índice da base de conhecimento](../README.md)
