[◄ Índice da base de conhecimento](../README.md)

---

# Módulo ChatRooms (API V1)

Salas de chat moderadas. Qualquer usuário autenticado (exceto papel `guest`)
entra em qualquer sala sem pedir permissão só de ver a tabela; quem cria a
sala vira dono e moderador, responsável por bloquear quem se comportar mal ou
por fechar a sala.

> **Estado (2026-09-28): schema COMPLETO no banco DEV.** As 7 tabelas e as 7
> views já estão APLICADAS em `codeigniter54900_db` desde 2026-09-28 (script
> `doc/sql/insert/20260928154501_chatrooms_tables.sql`). **Correção de
> nomenclatura (2026-09-28):** a tabela mãe virou `chat_rooms_manager` —
> mesmo padrão de `timeline_manager`/`calendar_manager`/`user_manager`, toda
> tabela mãe/raiz de módulo leva o sufixo `_manager` — aplicada em
> `doc/sql/insert/20260928160312_chatrooms_manager_rename.sql`. **Backend PHP
> de `chat_rooms_manager` COMPLETO (2026-09-28):** as 27 rotas (18 de tabela +
> 9 de view) implementadas, testadas via `spark routes` e uma chamada real
> (401 correto do `jwtauth` sem token) — ver §6. As outras 6 tabelas do
> módulo (`chat_room_members`, `chat_messages`, `chat_room_attachments`,
> `chat_room_attachment_reports`, `chat_room_warnings`,
> `chat_room_favorites`), o dicionário JSON estático de palavrões e a tela
> React **ainda não existem** — fase seguinte, fora deste desenho.

## 1. Identidade

| Item               | Valor                                                                                                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domínio            | `ChatRooms`                                                                                                                                                                                                                     |
| Namespace previsto | `Api\V1\ChatRooms\<Modulo>` (`ChatRoomsManager`, `ChatRoomMembers`, `ChatMessages`, `ChatRoomAttachments`, `ChatRoomAttachmentReports`, `ChatRoomWarnings`, `ChatRoomFavorites`)                                                 |
| Banco / grupo      | `codeigniter54900_db` / conexão `default` (sem `$DBGroup`) — **decisão do usuário em 2026-09-28**: não usa o grupo `chat` já reservado em `Config/Database.php` (`projeto54900_chat`), mesma decisão que o Timeline tomou antes |
| Tabelas            | `chat_rooms_manager`, `chat_room_members`, `chat_messages`, `chat_room_attachments`, `chat_room_attachment_reports`, `chat_room_warnings`, `chat_room_favorites`                                                                |
| Views              | Uma por tabela (§3) — sem view de "feed" dedicada; `view_chat_rooms_manager` já serve de listagem principal e `view_chat_messages` de histórico por sala                                                                        |
| Anexos             | tabela própria `chat_room_attachments`, isolada do módulo Upload e do Timeline — não se mistura com nenhum outro módulo                                                                                                         |
| Padrão             | [`ROADMAP_padrao_modulo.md`](ROADMAP_padrao_modulo.md); espelha `Timeline` (módulo com várias views de apoio, sem migration)                                                                                                    |

Escopo deste documento: só o **schema** (tabelas + views) e as regras de
negócio previstas para o Processor. Backend PHP, dicionário de palavrões e
frontend ficam para uma entrega seguinte.

## 2. Modelo de dados

### 2.1 `chat_rooms_manager` — a sala

Criada pelo usuário que vira dono/moderador (`owner_user_manager_id`).
`moderation_accepted` (0/1) + `moderation_accepted_at` registram o aceite
obrigatório de responsabilidade pela moderação — o Processor **recusa
`create`** se o campo não vier `1` (não existe sala com aceite pendente
persistida). `status` `open`/`closed`; `closed_at`/`closed_reason` guardam
quando e por quê a sala fechou. **Nome corrigido em 2026-09-28** (era
`chat_rooms`): toda tabela mãe/raiz de módulo neste projeto leva o sufixo
`_manager`, mesmo padrão de `timeline_manager`/`calendar_manager`/
`user_manager`.

```sql
CREATE TABLE IF NOT EXISTS `chat_rooms_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `owner_user_manager_id` bigint NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `moderation_accepted` tinyint(1) NOT NULL DEFAULT '0',
  `moderation_accepted_at` datetime DEFAULT NULL,
  `status` enum('open','closed') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'open',
  `closed_at` datetime DEFAULT NULL,
  `closed_reason` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_user_manager_id` (`owner_user_manager_id`),
  KEY `status` (`status`),
  CONSTRAINT `chat_rooms_manager_owner_user_manager_id_foreign` FOREIGN KEY (`owner_user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 2.2 `chat_room_members` — quem está na sala

Nasce quando o usuário entra na sala pela primeira vez (Processor grava, sem
tela própria de "entrar"). `role` `owner`/`member`; `status` `active`/
`blocked`/`left`. `blocked_reason` distingue os dois gatilhos de bloqueio:
`profanity_3x` (3 advertências) e `attachment_report` (denúncia de anexo
confirmada), mais `manual` para o moderador bloquear na mão.
`UNIQUE (chat_rooms_manager_id, user_manager_id)` — um usuário, uma linha por
sala.

```sql
CREATE TABLE IF NOT EXISTS `chat_room_members` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `chat_rooms_manager_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `role` enum('owner','member') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'member',
  `status` enum('active','blocked','left') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `blocked_reason` enum('profanity_3x','attachment_report','manual') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `blocked_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chat_room_user` (`chat_rooms_manager_id`,`user_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `status` (`status`),
  CONSTRAINT `chat_room_members_chat_rooms_manager_id_foreign` FOREIGN KEY (`chat_rooms_manager_id`) REFERENCES `chat_rooms_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_room_members_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 2.3 `chat_messages` — a mensagem

`status` `sent`/`blocked`/`removed`. **`blocked`** é a mensagem barrada pelo
filtro de palavrão: o Processor grava a linha (prova/auditoria) mas ela
**nunca aparece** para os demais usuários da sala — só gera a advertência em
`chat_room_warnings`. `removed` é remoção manual do moderador. A listagem
normal filtra `status = 'sent'`.

```sql
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `chat_rooms_manager_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `content` text COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('sent','blocked','removed') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'sent',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `chat_rooms_manager_id` (`chat_rooms_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `status` (`status`),
  CONSTRAINT `chat_messages_chat_rooms_manager_id_foreign` FOREIGN KEY (`chat_rooms_manager_id`) REFERENCES `chat_rooms_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_messages_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 2.4 `chat_room_attachments` — anexo da mensagem

Tabela **própria e isolada**, mesma decisão do Timeline
(`timeline_post_attachments`): não se mistura com o módulo Upload. FK para a
mensagem que carregou o arquivo (`chat_message_id`), não para a sala
diretamente — a sala é alcançada via `chat_messages.chat_rooms_manager_id`.
`status` ganha `blocked` (anexo com denúncia confirmada).

```sql
CREATE TABLE IF NOT EXISTS `chat_room_attachments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `chat_message_id` bigint NOT NULL,
  `file_key` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `stored_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `storage_path` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `file_url` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `mime_type` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `extension` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `checksum_sha256` char(64) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `category` enum('image','video','audio','document','spreadsheet','presentation','pdf','archive','other') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'other',
  `status` enum('active','blocked','inactive') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `file_key` (`file_key`),
  KEY `chat_message_id` (`chat_message_id`),
  KEY `category` (`category`),
  KEY `status` (`status`),
  CONSTRAINT `chat_room_attachments_chat_message_id_foreign` FOREIGN KEY (`chat_message_id`) REFERENCES `chat_messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 2.5 `chat_room_attachment_reports` — denúncia de anexo

Qualquer membro **da sala** pode denunciar um anexo. Diferente da advertência
de texto, a consequência é **imediata**: o Processor bloqueia o autor do
upload assim que a denúncia é criada, sem contar 3 chances. `status` nasce
`resolved` porque a ação já foi tomada no mesmo request (mantém as colunas
`reviewed_by`/`reviewed_at`/`review_note` só para auditoria/admin, mesmo
padrão de `timeline_post_reports`). `UNIQUE` impede o mesmo usuário denunciar
o mesmo anexo duas vezes.

```sql
CREATE TABLE IF NOT EXISTS `chat_room_attachment_reports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `chat_room_attachment_id` bigint NOT NULL,
  `reporter_user_manager_id` bigint NOT NULL,
  `reason` enum('nudity','violence','hate','harassment','spam','other') COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `status` enum('pending','reviewing','resolved','rejected') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'resolved',
  `reviewed_by` bigint DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `review_note` text COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `attachment_reporter` (`chat_room_attachment_id`,`reporter_user_manager_id`),
  KEY `reporter_user_manager_id` (`reporter_user_manager_id`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `status` (`status`),
  KEY `reason` (`reason`),
  CONSTRAINT `chat_room_attachment_reports_chat_room_attachment_id_foreign` FOREIGN KEY (`chat_room_attachment_id`) REFERENCES `chat_room_attachments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_room_attachment_reports_reporter_user_manager_id_foreign` FOREIGN KEY (`reporter_user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_room_attachment_reports_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `user_manager` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 2.6 `chat_room_warnings` — advertência automática de palavrão

Uma linha por mensagem barrada pelo filtro (dicionário **JSON estático**,
validado no `onChange` do frontend **e de novo no backend** antes do
`INSERT` — nunca confiar só no cliente). Aponta para a `chat_messages`
gravada com `status='blocked'`; `flagged_word` guarda a palavra que disparou,
para auditoria. **Sem coluna de contador**: a contagem de 3 por usuário/sala
é `COUNT(*)` desta tabela — mesma decisão do Timeline (contadores só saem por
agregação, nenhuma tabela deste banco guarda contador denormalizado).

```sql
CREATE TABLE IF NOT EXISTS `chat_room_warnings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `chat_rooms_manager_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `chat_message_id` bigint NOT NULL,
  `flagged_word` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `chat_rooms_manager_id` (`chat_rooms_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  KEY `chat_message_id` (`chat_message_id`),
  CONSTRAINT `chat_room_warnings_chat_rooms_manager_id_foreign` FOREIGN KEY (`chat_rooms_manager_id`) REFERENCES `chat_rooms_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_room_warnings_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_room_warnings_chat_message_id_foreign` FOREIGN KEY (`chat_message_id`) REFERENCES `chat_messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 2.7 `chat_room_favorites` — sala favorita (por usuário)

**Decisão do usuário (2026-09-28):** favorito é preferência pessoal de cada
usuário, não uma flag global na sala — mesmo padrão de
`timeline_post_reactions`/`timeline_post_ratings` (uma linha por usuário por
recurso). `UNIQUE (chat_rooms_manager_id, user_manager_id)`.

```sql
CREATE TABLE IF NOT EXISTS `chat_room_favorites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `chat_rooms_manager_id` bigint NOT NULL,
  `user_manager_id` bigint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chat_room_user` (`chat_rooms_manager_id`,`user_manager_id`),
  KEY `user_manager_id` (`user_manager_id`),
  CONSTRAINT `chat_room_favorites_chat_rooms_manager_id_foreign` FOREIGN KEY (`chat_rooms_manager_id`) REFERENCES `chat_rooms_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_room_favorites_user_manager_id_foreign` FOREIGN KEY (`user_manager_id`) REFERENCES `user_manager` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 2.8 O que NÃO tem tabela

- **Dicionário de palavrões**: é um **JSON estático** (arquivo, não tabela),
  carregado pelo frontend para validar no `onChange` e pelo backend para
  validar antes de qualquer `INSERT` em `chat_messages`. Onde esse arquivo
  mora (frontend/backend) é decisão da fase de implementação, fora deste
  desenho de schema.
- **Contadores** (`members_count`, `blocked_members_count`, etc.): saem por
  agregação nas views (§3), nenhuma tabela guarda contador denormalizado.
- **Limite de 100 mensagens na tela**: é filtro de consulta
  (`ORDER BY created_at DESC LIMIT 100` em `view_chat_messages`), o histórico
  completo permanece no banco — não existe purga nem coluna de "visível".

### 2.9 Referência rápida de colunas (tabela → coluna → para que serve)

| Tabela                         | Coluna                     | Para que serve                            |
| ------------------------------ | -------------------------- | ----------------------------------------- |
| `chat_rooms_manager`           | `id`                       | Identificador da sala                     |
| `chat_rooms_manager`           | `owner_user_manager_id`    | Dono e moderador responsável              |
| `chat_rooms_manager`           | `name`                     | Nome da sala                              |
| `chat_rooms_manager`           | `description`              | Descrição livre da sala                   |
| `chat_rooms_manager`           | `moderation_accepted`      | Aceite da responsabilidade pela moderação |
| `chat_rooms_manager`           | `moderation_accepted_at`   | Quando aceitou moderar                    |
| `chat_rooms_manager`           | `status`                   | Sala aberta ou fechada                    |
| `chat_rooms_manager`           | `closed_at`                | Quando a sala fechou                      |
| `chat_rooms_manager`           | `closed_reason`            | Motivo do fechamento                      |
| `chat_rooms_manager`           | `created_at`               | Data de criação                           |
| `chat_rooms_manager`           | `updated_at`               | Data da última alteração                  |
| `chat_rooms_manager`           | `deleted_at`               | Data da exclusão lógica                   |
| `chat_room_members`            | `id`                       | Identificador do vínculo                  |
| `chat_room_members`            | `chat_rooms_manager_id`    | Sala à qual pertence                      |
| `chat_room_members`            | `user_manager_id`          | Usuário membro da sala                    |
| `chat_room_members`            | `role`                     | Dono ou membro comum                      |
| `chat_room_members`            | `status`                   | Ativo, bloqueado ou saiu                  |
| `chat_room_members`            | `blocked_reason`           | Motivo do bloqueio                        |
| `chat_room_members`            | `blocked_at`               | Quando foi bloqueado                      |
| `chat_room_members`            | `created_at`               | Quando entrou na sala                     |
| `chat_room_members`            | `updated_at`               | Data da última alteração                  |
| `chat_room_members`            | `deleted_at`               | Data da exclusão lógica                   |
| `chat_messages`                | `id`                       | Identificador da mensagem                 |
| `chat_messages`                | `chat_rooms_manager_id`    | Sala da mensagem                          |
| `chat_messages`                | `user_manager_id`          | Autor da mensagem                         |
| `chat_messages`                | `content`                  | Texto da mensagem                         |
| `chat_messages`                | `status`                   | Enviada, bloqueada ou removida            |
| `chat_messages`                | `created_at`               | Data do envio                             |
| `chat_messages`                | `updated_at`               | Data da última alteração                  |
| `chat_messages`                | `deleted_at`               | Data da exclusão lógica                   |
| `chat_room_attachments`        | `id`                       | Identificador do anexo                    |
| `chat_room_attachments`        | `chat_message_id`          | Mensagem dona do anexo                    |
| `chat_room_attachments`        | `file_key`                 | Chave única do arquivo                    |
| `chat_room_attachments`        | `original_name`            | Nome original enviado                     |
| `chat_room_attachments`        | `stored_name`              | Nome salvo no servidor                    |
| `chat_room_attachments`        | `storage_path`             | Caminho físico do arquivo                 |
| `chat_room_attachments`        | `file_url`                 | URL de acesso ao arquivo                  |
| `chat_room_attachments`        | `mime_type`                | Tipo MIME do arquivo                      |
| `chat_room_attachments`        | `extension`                | Extensão do arquivo                       |
| `chat_room_attachments`        | `file_size`                | Tamanho do arquivo (bytes)                |
| `chat_room_attachments`        | `checksum_sha256`          | Hash de integridade do arquivo            |
| `chat_room_attachments`        | `category`                 | Categoria do arquivo enviado              |
| `chat_room_attachments`        | `status`                   | Ativo, bloqueado ou inativo               |
| `chat_room_attachments`        | `created_at`               | Data do upload                            |
| `chat_room_attachments`        | `updated_at`               | Data da última alteração                  |
| `chat_room_attachments`        | `deleted_at`               | Data da exclusão lógica                   |
| `chat_room_attachment_reports` | `id`                       | Identificador da denúncia                 |
| `chat_room_attachment_reports` | `chat_room_attachment_id`  | Anexo denunciado                          |
| `chat_room_attachment_reports` | `reporter_user_manager_id` | Usuário que denunciou                     |
| `chat_room_attachment_reports` | `reason`                   | Motivo da denúncia                        |
| `chat_room_attachment_reports` | `description`              | Detalhes da denúncia                      |
| `chat_room_attachment_reports` | `status`                   | Situação da denúncia                      |
| `chat_room_attachment_reports` | `reviewed_by`              | Moderador que revisou                     |
| `chat_room_attachment_reports` | `reviewed_at`              | Quando foi revisada                       |
| `chat_room_attachment_reports` | `review_note`              | Nota da revisão                           |
| `chat_room_attachment_reports` | `created_at`               | Data da denúncia                          |
| `chat_room_attachment_reports` | `updated_at`               | Data da última alteração                  |
| `chat_room_attachment_reports` | `deleted_at`               | Data da exclusão lógica                   |
| `chat_room_warnings`           | `id`                       | Identificador da advertência              |
| `chat_room_warnings`           | `chat_rooms_manager_id`    | Sala da advertência                       |
| `chat_room_warnings`           | `user_manager_id`          | Usuário advertido                         |
| `chat_room_warnings`           | `chat_message_id`          | Mensagem bloqueada relacionada            |
| `chat_room_warnings`           | `flagged_word`             | Palavra proibida detectada                |
| `chat_room_warnings`           | `created_at`               | Data da advertência                       |
| `chat_room_warnings`           | `updated_at`               | Data da última alteração                  |
| `chat_room_warnings`           | `deleted_at`               | Data da exclusão lógica                   |
| `chat_room_favorites`          | `id`                       | Identificador do favorito                 |
| `chat_room_favorites`          | `chat_rooms_manager_id`    | Sala favoritada                           |
| `chat_room_favorites`          | `user_manager_id`          | Usuário que favoritou                     |
| `chat_room_favorites`          | `created_at`               | Data em que favoritou                     |
| `chat_room_favorites`          | `updated_at`               | Data da última alteração                  |
| `chat_room_favorites`          | `deleted_at`               | Data da exclusão lógica                   |

## 3. Views de apoio (uma por tabela, aplicadas em 2026-09-28)

Mesma convenção do Timeline: `id` e `created_at`/`updated_at`/`deleted_at` da
tabela principal **sem prefixo**; demais colunas da principal com `{alias}_`;
tabelas relacionadas sempre prefixadas; `LEFT JOIN` com `deleted_at IS NULL`
nas relacionadas, **sem filtro de exclusão na tabela principal** (as rotas
`get-deleted`/`get-all-with-deleted` continuam enxergando os excluídos).

| View                                | Principal (alias)                       | Relacionadas (alias)                                                                                     |
| ----------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `view_chat_rooms_manager`           | `chat_rooms_manager` (`cr`)             | dono `um`/`uc`; contadores `members_count`, `blocked_members_count`, `messages_count`, `favorites_count` |
| `view_chat_room_members`            | `chat_room_members` (`crm`)             | sala `cr`; usuário `um`/`uc`                                                                             |
| `view_chat_messages`                | `chat_messages` (`cm`)                  | sala `cr`; autor `um`/`uc`; `attachments_count`                                                          |
| `view_chat_room_attachments`        | `chat_room_attachments` (`cra`)         | mensagem `cm` → sala `cr`; autor `um`/`uc`                                                               |
| `view_chat_room_attachment_reports` | `chat_room_attachment_reports` (`crar`) | anexo `cra`; denunciante `um`/`uc`; revisor `mu`/`muc`                                                   |
| `view_chat_room_warnings`           | `chat_room_warnings` (`crw`)            | sala `cr`; usuário `um`/`uc`; mensagem `cm`                                                              |
| `view_chat_room_favorites`          | `chat_room_favorites` (`crf`)           | sala `cr`; usuário `um`/`uc`                                                                             |

DDL original das 7 tabelas + 7 views:
`doc/sql/insert/20260928154501_chatrooms_tables.sql` (aplicado em
2026-09-28). Correção de nomenclatura da tabela mãe (`chat_rooms` →
`chat_rooms_manager`, view `view_chat_rooms` → `view_chat_rooms_manager`,
coluna `chat_room_id` → `chat_rooms_manager_id` nas 4 tabelas filhas que
apontam para a sala):
`doc/sql/insert/20260928160312_chatrooms_manager_rename.sql` (aplicado em
2026-09-28).

**"Sou eu que favoritei?"** não fica exposto na view, pelo mesmo motivo do
Timeline (decisão 13 do `README_modulo_timeline.md`): a view não tem noção
de usuário autenticado. Resolver do mesmo jeito — o Processor anexa
`is_favorite`/`my_role` em memória com uma query em lote, sem mudar a view.

## 4. Regras de negócio (vão no Processor, não no DDL)

1. **Entrar na sala.** Qualquer usuário autenticado, exceto `guest`
   (`user_roles.slug = 'guest'` via `user_manager.user_role_id`), entra em
   qualquer sala visível sem pedir permissão — `INSERT`/`UPSERT` em
   `chat_room_members` na primeira interação.
2. **Criar sala exige aceite.** `POST chat-rooms-manager/create` recusa (422) se
   `moderation_accepted != 1` — o dono declara que assume a responsabilidade
   por moderar antes da sala existir.
3. **Só usuário ativo escreve.** Antes de qualquer `INSERT` em
   `chat_messages`, checar `user_manager.status = 'active'`.
4. **Sala fechada bloqueia tudo.** Toda tentativa de `POST` em mensagem
   numa sala com `status = 'closed'` é rejeitada, retornando o texto fixo
   `"Sala fechada, procure o moderador da sala para entender o motivo."`.
5. **Filtro de palavrão.** Dicionário JSON estático. Mensagem com termo
   proibido é gravada com `status = 'blocked'` (nunca exibida) e gera 1 linha
   em `chat_room_warnings`. Ao completar 3 advertências do mesmo usuário na
   mesma sala (`COUNT(*)` sem soft-delete), o Processor marca
   `chat_room_members.status = 'blocked'`,
   `blocked_reason = 'profanity_3x'`.
6. **Denúncia de anexo é imediata.** `POST chat-room-attachment-reports/create`
   por qualquer membro ativo da sala bloqueia, no mesmo request, o autor do
   upload (`chat_room_members.status='blocked'`,
   `blocked_reason='attachment_report'`) e o próprio anexo
   (`chat_room_attachments.status='blocked'`) — sem contagem de 3 chances.
7. **3 bloqueados fecham a sala.** Quando o número de
   `chat_room_members.status='blocked'` de uma sala chega a 3
   (`blocked_members_count` da view), o Processor fecha a sala
   automaticamente (`chat_rooms_manager.status='closed'`, `closed_at=NOW()`,
   `closed_reason` fixo de auditoria).
8. **Só o dono reabre.** `PATCH`/ação dedicada de reabrir só aceita se
   `CurrentUser::id() == chat_rooms_manager.owner_user_manager_id`.
9. **Histórico completo, tela limitada.** A listagem de mensagens usa
   `view_chat_messages` com `cm_status='sent'`,
   `ORDER BY created_at DESC LIMIT 100`; nada é apagado do banco por causa
   desse limite.
10. **Favoritos.** Card (sem limite) para toda sala com linha em
    `chat_room_favorites` do usuário logado; atalho abaixo do NAV mostra só
    as 2 primeiras (regra de exibição do frontend/Processor, não do banco).

## 6. Backend PHP — `chat_rooms_manager` (implementado em 2026-09-28)

Único recurso das 7 tabelas do módulo com backend até aqui. Espelha
`Timeline/TimelineManager` (Controller/Request/Processor/Model), namespace
`Api\V1\ChatRooms\ChatRoomsManager`, slug `chat-rooms-manager` /
`chat-rooms-manager-view`.

| Camada | Arquivo |
| --- | --- |
| Rotas (18) | `Config/Routes/Api/v1/ChatRooms/ChatRoomsManager/EndpointTable.php` |
| Rotas (9) | `Config/Routes/Api/v1/ChatRooms/ChatRoomsManager/EndPointView.php` |
| Controller | `Controllers/Api/V1/ChatRooms/ChatRoomsManager/ResourceTableController.php` + `ResourceViewController.php` |
| Request | `Requests/V1/ChatRooms/ChatRoomsManager/CreateRequest.php` + `UpdateRequest.php` |
| Processor | `Services/V1/ChatRooms/ChatRoomsManager/Processor.php` |
| Model | `Models/V1/ChatRooms/ChatRoomsManager/SqlTableModel.php` + `SqlViewModel.php` |

**Regras aplicadas no Processor** (diferem do espelho `TimelineManager` onde
anotado):

1. **Guest não escreve nada** (403) em create/update/delete — só lê.
2. **Dono sempre da sessão.** `owner_user_manager_id` do corpo é ignorado;
   o Processor grava sempre `CurrentUser::id()`.
3. **Aceite de moderação é de forma, não de negócio.** `CreateRequest` exige
   `moderation_accepted` `required|in_list[1]` — o `create` nem chega ao
   Processor sem isso (422 padrão de validação, não 409). O Processor
   reafirma o valor e carimba `moderation_accepted_at` com a hora do
   servidor; `status`/`closed_at`/`closed_reason` nunca entram no create
   (sala sempre nasce `open`).
4. **Só o dono (ou admin) escreve.** `update`/`delete-soft`/`delete-restore`/
   `delete-hard` checam `owner_user_manager_id` — **diferente do
   `TimelineManager`**, que devolve 404 para não-dono (timeline é pessoal);
   aqui devolve **403**, porque a sala já é visível a todos na listagem
   (esconder a existência não faz sentido). Como este é o único endpoint de
   escrita do módulo, essa mesma regra **é** a implementação de "só o dono
   reabre" do §4.8 — ninguém mais chega no `update`.
5. **Transição de status carimba `closed_at` sozinha.** `closed_at` não é
   aceito do cliente: abrir→fechar carimba a hora do servidor; fechar→abrir
   limpa `closed_at` e `closed_reason`.
6. **Fechamento automático (3 bloqueados) é integração futura.** Quando o
   módulo `ChatRoomMembers` existir, ele deve chamar
   `SqlTableModel::update()` direto (ação do sistema, não passa pelas regras
   de dono deste Processor).

**Sincronizado em `route_manager`:**
`doc/sql/insert/20260928161921_route_manager_chatrooms_manager_sync.sql`
(27 registros, idempotente).

**Validado:** `php -l` em todos os arquivos, `spark routes` lista as 27 rotas
com `jwtauth` (wildcard) + `adminonly` nas 3 de exclusão definitiva, e
chamada real sem token devolve `401` (`"Token de acesso ausente..."`) — sem
erro 500, ou seja, autoload/namespace/DI resolvem certo. Teste funcional
completo (`create`/`update`/`delete`) com JWT válido fica pendente — não há
credencial de usuário disponível nesta sessão para gerar o token (regra do
projeto: credenciais só sob demanda do usuário, nunca persistidas).

## 7. Próximos passos (fora deste desenho)

- Dicionário JSON estático de palavras proibidas (onde mora, como o backend
  valida antes do `INSERT`).
- Backend PHP das outras 6 tabelas (Controller/Request/Processor/Model),
  rotas (18 por tabela + 9 por view, mesmo contrato do Timeline) e registro
  em `route_manager`.
- Tela React do Chat (lista de salas com cards de favoritos, atalho no NAV,
  tela de mensagens com upload, texto de sala fechada).
- `form_manager`/`list_manager` para as telas administrativas das 7 tabelas
  (toda tabela do projeto tem lista + form admin, mesmo padrão das demais).

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
