[◄ Índice da base de conhecimento](../README.md)

---

# Módulo Message — backend

Mensagens diretas entre usuários, 1 para 1 ou 1 para grupo, com agendamento de
envio e marca de leitura. Reaproveita a aparência e a forma de envio do chat
(mesma tela, mesmas cores de balão, marcação de usuário), mas **Message NUNCA é
um chat**: não existe sala, membro de sala, conversa nem thread. Uma linha de
`messages_manager` é uma mensagem; responder é enviar outra.

Documento do lado frontend:
[`src/frontend/projeto54900/src/markdown/geral/modulos/messages/README_plano.md`](../../../frontend/projeto54900/src/markdown/geral/modulos/messages/README_plano.md).

> **Estado em 2026-10-06 (banco DEV `codeigniter54900_db`, sem migration).**
> Pronto: **8 tabelas e 14 views**, **271 rotas** de API V1 (conjunto completo Tabela + View em cada recurso), listas e
> formulários administrativos (mensagens, grupos, membros, mensagens de grupo, anexos, advertências) e o **modo chat**
> (lista de conversas, conversa privada e de grupo, não lidas, leitura por membro, anexos, agendamento, edição/apagar com a
> regra do chat, marcação @ no grupo, filtro de palavrão com advertência). Decisões de projeto: atualização **só por polling**
> (sem WebSocket) e entrega das agendadas **sem cron** (§4.5; hospedagem só com FTP). Falta: visibilidade da mensagem de grupo
> no `messages-manager`/lista 36, migrations REMAKE e testes permanentes (§9).

## 0. Regra permanente — ÁREA ADMINISTRATIVA IRRESTRITA

Decisão do usuário (2026-10-06): as telas **administrativas** (listas, formulários e a API que as serve) **não impõem
restrição de estado**. Uma mensagem — 1 para 1 ou de grupo — é editável e excluível em **qualquer** status
(`scheduled`, `sent`, `blocked`, `removed`). A regra "só edita enquanto agendada" pertence ao **MODO CHAT** (a tela de
conversa, futura), que deve impô-la por conta própria, sem reintroduzi-la na área administrativa.

- O que **continua** valendo (autorização, não estado): só o **remetente ou o admin** altera/exclui (o destinatário e o membro
  recebem 403; quem nem vê a mensagem recebe 404); remetente, destinatário, `sent_at` e `read_at` da mensagem 1 para 1 só o
  admin altera; o grupo de uma mensagem de grupo é imutável.
- Implementação: o Processor não devolve mais 409 por "mensagem já enviada"; a exigência de data **futura** em `scheduled_at`
  só se aplica ao não-admin que reagenda uma mensagem ainda `scheduled`; a ação "Editar" das listas 36 e 39 não tem mais
  `business_rule_json` (script `20261006100000_area_administrativa_edicao_irrestrita.sql`); as UpdatePage não travam mais os campos.
- Ao criar o modo chat, **não** copiar esta liberdade: aplicar a restrição de estado no endpoint/tela do chat.
- **Listagens administrativas = `get-all` liberado ao admin** (decisão de 2026-10-06): o admin faz qualquer coisa; nenhuma regra de negócio/estado o trava.
  Aliviadas só para o admin (não-admin e o chat seguem iguais): membros (usuário inativo/bloqueado e grupo inativo), mensagem de grupo (grupo inativo; data
  passada = registrada como `sent` na data informada), mensagem 1 para 1 (remetente/destinatário inativos), leitura de grupo (mensagem não enviada e leitura
  do próprio remetente), marcações (teto de 20 e auto-marcação) e a view de usuários (`message-users-groups`: todos os status, filtrável por `um_status`).
  Continuam valendo as regras de **integridade** (existência 404, remetente ≠ destinatário, duplicidade, membro ativo para ser marcado, FKs).
- **NÃO IMPLEMENTADO (não solicitado):** se, nas listas administrativas, for pedido um `get-grouped` **pelo ID de um usuário que não é administrador**,
  aí sim passam a valer as regras daquele usuário (visibilidade, grupos de que participa etc.). Enquanto isso não for pedido, nada disso existe.
  A tabela de menu é gerida manualmente pelo usuário.

## 0.1 Regra permanente — TELAS ADMINISTRATIVAS SÓ PARA ADMIN; "Conversas" PARA TODOS

Decisão do usuário (2026-10-06): as listas e formulários administrativos (**Lista** 36, **Grupos** 37, **Membros** 38, **Mensagens de grupo** 39, **Anexos** 40 e
**Advertências** 41, mais os formulários 41–47) **não têm relação com "Conversas"** e só são vistos por **Administradores**. "Conversas" (`/v1/message-chat`) é o chat,
para todo usuário logado (não guest).

- **Onde vale:** `menu_manager` 48–52, `list_manager` 36–40 (e suas `list_actions`) e `form_manager` 41–46 com `roles = ["admin"]` (script
  `20261006230000_messages_telas_admin_somente_admin.sql`; 54 e a lista 41 já eram admin); no frontend as rotas administrativas ficam sob `RequireRole role="admin"`
  (`routes/v1/messages.routes.tsx`) e só `message-chat` fica de fora. "Mensagem" (47) e "Conversas" (53) seguem `["user", "admin"]`.
- **O que NÃO muda:** as **rotas da API** continuam abertas ao usuário comum (com as regras de autorização de cada recurso), porque o chat depende delas
  (`messages-manager`, `message-group-messages`, `message-attachments`, `message-group-members-view`, `message-mentions`...). Só a tela administrativa some para quem não é admin.
- **Efeito nas pendências antigas:** como o admin enxerga tudo nas listas, **não há o que ajustar** para o membro comum na Lista 36 (visibilidade da mensagem de
  grupo, pendência 2) nem na regra "Editar/Excluir só para o dono" (pendência 12); `with/{userId}` ignorar mensagem de grupo é o comportamento certo (pendência 11).

## 1. Identidade

| Item          | Valor                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Domínio       | `Messages`                                                                                                             |
| Namespaces    | `Api\V1\Messages\MessagesManager`, `Api\V1\Messages\MessagesUsers`, `Api\V1\Messages\MessageGroupsManager`             |
| Banco / grupo | `codeigniter54900_db` / conexão `default` (`DB_GROUP_001`), como o Timeline e o ChatRooms                              |
| Tabelas       | `messages_manager`, `message_groups_manager`, `message_group_members`, `message_group_messages`                        |
| Views         | `view_messages_manager`, `view_messages_users`, `view_message_groups_manager`, `view_message_group_members`, `view_message_group_messages` |
| Espelhos      | `ChatRooms/ChatMessages` (mensagem) e `ChatRooms/ChatRoomsManager` (grupo); escopo por dono como em `CalendarManager`/`TimelinePosts` |
| Padrão        | [`ROADMAP_padrao_modulo.md`](ROADMAP_padrao_modulo.md); toda tabela raiz leva `_manager`; uma view por tabela          |

## 2. Resumo — o que está pronto e o que falta

| Peça                                                          | Estado                         |
| ------------------------------------------------------------- | ------------------------------ |
| 4 tabelas e 5 views no banco                                  | **Pronto**                     |
| API `messages-manager` (18 rotas) + 2 rotas extras (`with`, `read`) | **Pronto**               |
| API `messages-manager-view` (9 rotas)                         | **Pronto**                     |
| API `messages-users-view` (9 rotas) — resumo por interlocutor | **Pronto**                     |
| API `message-groups-manager` (18) e `-view` (9)               | **Pronto**                     |
| Entrega das agendadas **sem cron** (`MessageDispatcher` no `JwtAuthFilter`; `messages:dispatch` só local) | **Pronto** (2026-10-06, §4.5) |
| Sincronia das 65 rotas em `route_manager`                     | **Pronto**                     |
| Menu "Mensagem" > "Lista" e "Grupos", listas, formulários     | **Pronto** (ver §7)            |
| Migrations REMAKE 2026-10-05 (3 SQL + 3 classes PHP)          | **Pronto**, **não executado** no DEV (ver §6.1) |
| API de `message_group_members` (18 rotas + `sync` + view 9)   | **Pronto** (2026-10-06, ver §4.1) |
| Views `view_message_users_groups` e `view_message_group_memberships` + menu "Membros", lista 38 e tela de 2 cards | **Pronto** (2026-10-06, ver §4.1 e §7) |
| API de `message_group_messages` (ligação mensagem-grupo)      | **Pronto** (2026-10-06, §4.2): 18 rotas + view 9 |
| Enviar mensagem **para grupo** pela API                       | **Pronto** (2026-10-06, §4.2): `POST message-group-messages/create` |
| Mensagem de grupo visível aos membros                         | **Pronto só em `message-group-messages`** (§4.2); `messages-manager` e `with/{userId}` seguem sem as de grupo |
| Menu "Mensagens de grupo", lista 39 e formulários 45/46        | **Pronto** (2026-10-06, §7) |
| Leitura por membro em grupo (`read_at` por usuário)           | **Falta** (sem tabela)         |
| Anexos de mensagem (`message_attachments`, privada e de grupo): 18 rotas + `serve`/`download` + view 9 | **Pronto** (2026-10-06, §4.3) |
| Lista "Anexos de mensagens" (lista 40) e campo `arquivo` nos forms 41/42/45/46 | **Pronto** (2026-10-06, §7) |
| **Modo chat — Etapa 1:** lista de conversas (grupos do usuário + todos os usuários) com busca; contatos `message-contacts-view` | **Pronto** (2026-10-06, §4.4) |
| **Modo chat — Etapa 2:** conversa 1 para 1 privada no modal (balões, envio, leitura, polling de 5 s) | **Pronto** (2026-10-06, §4.4) |
| **Modo chat — Etapa 3:** não lidas — rota `GET messages-manager/unread-count`, badge nos cards e contador no menu | **Pronto** (2026-10-06, §4.4). |
| **Modo chat — Etapa 4:** conversa de grupo no modal; leitura por membro (`message_group_reads`), `read_count`/`readers_total`, badge e ordem nos grupos, contador do menu soma privadas + grupo | **Pronto** (2026-10-06, §4.4) |
| **Filtro de palavrão e advertência:** validação no backend (`ForbiddenWords`), mensagem `blocked` + advertência, tabela `message_warnings` (18) + view (9), lista admin | **Pronto** (2026-10-06, §4.4 e §7) |
| **Marcação de usuário (@) na conversa de GRUPO:** tabela `message_mentions` (18 rotas) + view (9) + `mentions[]` no envio e no chat | **Pronto** (2026-10-06, §4.4) |
| **Modo chat — Etapa 5:** anexos no chat, agendamento, **regra de estado do chat** (editar só enquanto agendada; apagar a própria) | **Pronto** (2026-10-06, §4.4) — **modo chat concluído** |
| Marcação de usuário (`message_mentions`)                      | **Falta**                      |
| Filtro de palavrão (`blocked` automático)                     | **Falta**                      |
| Cron do `messages:dispatch`                                   | **Não se aplica** (hospedagem só com FTP: sem `spark`, sem cron — ver §4.5) |
| Atualização das conversas                                     | **Decidido:** consulta periódica (polling); sem WebSocket |
| Testes automatizados permanentes e teste HTTP com JWT         | **Falta**                      |

## 3. Modelo de dados

### 3.1 `messages_manager` — a mensagem

| Coluna                      | Tipo                                        | Função                                                                              |
| --------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------- |
| `id`                        | bigint AI                                   | Identificador                                                                       |
| `sender_user_manager_id`    | bigint NOT NULL, FK `user_manager`          | Remetente                                                                           |
| `recipient_user_manager_id` | bigint **NULL**, FK `user_manager`          | Destinatário; NULL = mensagem de grupo                                              |
| `content`                   | text NOT NULL                               | Texto                                                                               |
| `status`                    | enum `scheduled`/`sent`/`blocked`/`removed` | `scheduled` = agendada (invisível ao destinatário); `blocked` = barrada; `removed` = removida |
| `scheduled_at`              | datetime NULL                               | Data/hora programada; NULL = envio imediato                                         |
| `sent_at`                   | datetime NULL                               | Quando foi enviada                                                                  |
| `read_at`                   | datetime NULL                               | Quando o destinatário viu (só serve ao 1 para 1)                                    |
| `created_at`/`updated_at`/`deleted_at` | datetime                         | Padrão do projeto                                                                   |

Índices: remetente, destinatário, `status`, `(status, scheduled_at)` (job) e
`(recipient_user_manager_id, read_at)` (não lidas). FKs com `ON DELETE CASCADE`.

### 3.2 Grupos

| Tabela                   | Colunas principais                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `message_groups_manager` | `owner_user_manager_id`, `name` (150), `description`, `status` (`active`/`inactive`)                       |
| `message_group_members`  | `message_groups_manager_id`, `user_manager_id`, `role` (`owner`/`member`), `status` (`active`/`left`/`removed`); `UNIQUE (grupo, usuário)` |
| `message_group_messages` | `messages_manager_id` (`UNIQUE` — uma mensagem, um grupo), `message_groups_manager_id`                     |

### 3.3 Duas formas de mensagem

- **1 para 1:** `recipient_user_manager_id` preenchido e **nenhuma** linha em `message_group_messages`.
- **1 para grupo:** `recipient_user_manager_id` NULL e **uma** linha em `message_group_messages`.

A regra "exatamente um dos dois" **não** está no banco (ele não cruza tabelas); precisa
ficar no Processor quando o envio para grupo for implementado (§9).

### 3.4 Views

| View                          | O que entrega                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `view_messages_manager`       | mensagem + remetente (`sm`/`sc`) + destinatário (`rm`/`rc`) + grupo da mensagem (`mg_id`, `mg_name`)        |
| `view_messages_users`         | uma linha por par (dono, interlocutor): total, não lidas, última mensagem. Só pares 1 para 1                |
| `view_message_groups_manager` | grupo + dono (`um`/`uc`) + `members_count` + `messages_count`                                               |
| `view_message_group_members`  | vínculo + grupo + usuário                                                                                   |
| `view_message_group_messages` | ligação + mensagem + grupo + remetente                                                                      |
| `view_message_users_groups`   | um usuário por linha (`id` = usuário): `um_username`, `um_status`, `uc_name`, `uc_email`, `groups_count`, `groups_names` (só vínculos ativos). Sem dados pessoais sensíveis |
| `view_message_group_memberships` | um grupo por linha: dono (`um_username`, `uc_name`), `members_count`, `members_names` (só vínculos ativos) |

`view_messages_users`: perspectiva do remetente conta `scheduled` e `sent`; a do
destinatário só `sent`; `removed`, `blocked` e excluídas não entram. `id` =
`owner * 4294967296 + peer`; `deleted_at` é sempre NULL (existe para `get-deleted*`
responderem vazio sem erro de coluna). A view não conhece o usuário logado: o
Processor escopa por dono.

## 4. API V1

Todas sob `jwtauth` por prefixo em `Config/Filters.php` (lista explícita — ao
criar recurso novo, **adicionar o prefixo**, senão a rota fica aberta). `delete-hard`
e `clear-deleted` somam `adminonly` na própria rota. Blocos em `Config/Routes.php`
(seção `/Messages`).

| Recurso                       | Slugs (tabela / view)                                    | Rotas                         |
| ----------------------------- | -------------------------------------------------------- | ----------------------------- |
| Mensagem                      | `messages-manager` / `messages-manager-view`             | 18 + 2 extras / 9             |
| Resumo por interlocutor       | — / `messages-users-view`                                | só leitura, 9                 |
| Grupo                         | `message-groups-manager` / `message-groups-manager-view` | 18 / 9                        |
| Membros do grupo (N:N)        | `message-group-members` / `message-group-members-view`   | 18 + 1 (`sync`) / 9           |
| Usuários + contagem de grupos | — / `message-users-groups-view`                          | só leitura, 9                 |
| Grupos + membros (lista)      | — / `message-group-memberships-view`                     | só leitura, 9                 |
| Anexo de mensagem             | `message-attachments` / `message-attachments-view`       | 18 + 2 (`serve`, `download`) / 9 |
| Contatos do chat              | — / `message-contacts-view`                              | só leitura, 9                 |

Rotas extras de `messages-manager` (fora do contrato de 18):
`GET with/{userId}` (mensagens entre o usuário logado e `{userId}`, últimas 200, mais
antigas primeiro) e `PATCH read/{userId}` (carimba `read_at` nas recebidas de `{userId}`;
idempotente; devolve `marked`).

Arquivos (todos sob `src/app/`): `Config/Routes/Api/v1/Messages/{MessagesManager,MessagesUsers,MessageGroupsManager}/`,
`Controllers/Api/V1/Messages/...`, `Requests/V1/Messages/...`, `Services/V1/Messages/.../Processor.php`,
`Models/V1/Messages/.../SqlTableModel.php` e `SqlViewModel.php`, `Commands/MessagesDispatch.php`.
Total confirmado por `spark routes`: **65 rotas**.

### 4.1 Membros do grupo (`MessageGroupMembers`) — N:N usuários × grupos

A ligação é a própria `message_group_members` (`UNIQUE grupo+usuário`, `role`, `status`, `deleted_at`).
Código em `Config/Routes/Api/v1/Messages/MessageGroupMembers/{EndpointTable,EndpointCustom,EndPointView}.php`,
`Controllers/.../MessageGroupMembers/`, `Requests/.../MessageGroupMembers/`, `Services/.../MessageGroupMembers/Processor.php`
(tabela e view no mesmo Processor) e `Models/.../MessageGroupMembers/`. As views de usuários e de grupos têm
Processor e Model próprios (`MessageUsersGroups`, `MessageGroupMemberships`).

- **`PUT message-group-members/sync/{groupId}`** — corpo `{"add_user_ids":[..],"remove_user_ids":[..]}`,
  uma transação, resposta `{added, reactivated, removed, skipped}`:
  - par inexistente = insere `member`/`active`; `left`/`removed`/soft-deletado = **reativa** (limpa `deleted_at`); já ativo = ignora;
  - remoção grava `status=removed`; o vínculo `owner` nunca sai nem muda (conta em `skipped`);
  - só o **dono do grupo ou admin** (403 para membro comum; 404 para quem nem vê o grupo; guest 403);
  - grupo `inactive` recusa adicionar (409; remover é permitido); usuário inexistente = 404, inativo/bloqueado = 409;
  - ids repetidos são deduplicados; mesmo id em adicionar e remover = 422; as duas listas vazias = 422; até 1000 ids por lista;
  - um erro em qualquer id desfaz tudo (testado: `add [5, 999999]` não grava o 5).
- **Create/update/delete da tabela:** `create` (grupo + usuário) e `update` (`status` active/removed) passam pelo mesmo
  caminho do `sync`; `delete-*` do vínculo do dono = 403; `clear-deleted` só admin.
- **Visibilidade** (tabela e views): vínculos dos grupos que o usuário criou ou em que é membro ativo; admin vê tudo.
- `view_message_users_groups`: só usuários `active` (o filtro `um_status` do cliente é descartado); guest lê vazio.
- Filtros: `api/v1/message-group-members`, `-members-view`, `message-users-groups-view` e `message-group-memberships-view` em `jwtauth`.
- Rotas: **46** novas (19 + 9 + 9 + 9) — total do módulo = 111.

### 4.2 Mensagens de grupo (`MessageGroupMessages`) — enviar mensagem a um grupo

Modelo: `messages_manager` (`recipient_user_manager_id` NULL) + `message_group_messages` (`UNIQUE messages_manager_id`)
→ `message_groups_manager` → `message_group_members` (destinatários = **membros ativos na hora da leitura**; não há cópia por
membro, então quem entra no grupo depois passa a ver a mensagem e quem sai deixa de ver). O `id` deste recurso é o da
**ligação**. Código em `Config/Routes/Api/v1/Messages/MessageGroupMessages/{EndpointTable,EndPointView}.php`,
`Controllers/Requests/Services/Models .../MessageGroupMessages/`; a view é `view_message_group_posts` (sem dados pessoais;
a `view_message_group_messages` antiga expõe CPF/telefone/endereço do remetente e **não** tem API).

- **Create (= enviar ao grupo):** body `message_groups_manager_id`, `content`, `scheduled_at` (opcional). Mensagem e ligação
  gravadas na **mesma transação**. Remetente = sessão, ativo, **membro ativo do grupo** (quem não é membro recebe 404 — nem sabe
  que o grupo existe; admin envia a qualquer grupo); grupo inexistente 404, `inactive` 409; texto vazio 422; `scheduled_at`
  futuro = `scheduled`, vazio = `sent` com `sent_at` = agora, passado = 422. Guest 403.
- **Update (`PUT update/{id}`):** só remetente ou admin (outro 403; quem não vê 404). Texto e `scheduled_at` em **qualquer
  status** (área administrativa irrestrita, §0); `status=removed` cancela/remove; grupo imutável (mesmo valor é ignorado, outro = 403);
  nada mudou = 200; agendada não pode ficar sem data (422).
- **Exclusão:** `delete-soft`/`restore` afetam a ligação e a mensagem juntas, na transação; `delete-hard` apaga a mensagem
  (a ligação sai por FK `ON DELETE CASCADE`); só remetente ou admin. `clear-deleted` só admin (apaga as mensagens das ligações
  excluídas).
- **Visibilidade** (tabela e view): remetente, dono do grupo, membros ativos (**só `sent`**) e admin.
- Filtros: `api/v1/message-group-messages` e `-view` em `jwtauth`. Rotas: **27** novas (18 + 9) — total do módulo = 138.
- A entrega das agendadas **não depende de cron** (§4.5): o gatilho está no filtro de autenticação; `messages:dispatch` fica só para uso local.
- **Fora desta fase:** leitura por membro (quem já leu), mensagem de grupo no `messages-manager`/`with`, @, anexos e filtro de
  palavrão.

### 4.3 Anexos de mensagem (`MessageAttachments`) — conversa privada e de grupo

Uma tabela serve às duas conversas: `message_attachments` → `messages_manager` (`ON DELETE CASCADE`); a mensagem de grupo se
distingue pela ligação `message_group_messages`. Espelho de `ChatRoomAttachments` (tabela própria e isolada do módulo Upload;
binário em `writable/uploads/message_attachments/<messages_manager_id>/`; `Config\Upload` só para tipos e limites). **Conjunto
completo:** `message-attachments` (18 rotas, com o `create` **multipart** — campo `file` + `messages_manager_id` — e as extras
`GET serve/{id}` e `GET download/{id}`) e `message-attachments-view` (9 rotas, sobre `view_message_attachments`). **29** rotas
novas — total do módulo = 167. Código em `Config/Routes/Api/v1/Messages/MessageAttachments/{EndpointTable,EndpointUpload,EndPointView}.php`,
`Controllers/Requests/Services/Models .../MessageAttachments/` (`Processor` + `StorageManager`).

- **Quem escreve** (create, update, delete-*): o **remetente da mensagem ou o admin**, em **qualquer status** da mensagem (área
  administrativa irrestrita, §0). Destinatário/membro que vê a mensagem mas não é o remetente = 403; quem nem vê = 404; guest 403.
  Mensagem excluída = 404. Arquivo: extensão e MIME permitidos e limite por categoria como no chat (422).
- **Trocar o anexo:** `create` com `replace=1` — os anexos ativos anteriores da mensagem sofrem soft delete (o binário fica até
  `delete-hard`/`clear-deleted`). `update` só edita `category`/`status` (`active`/`inactive`); arquivo e vínculo são imutáveis.
- **Quem lê / baixa** (tabela, view, `serve`, `download`): a visibilidade **da mensagem** — remetente, dono do grupo, destinatário e
  membro ativo (**só `sent`**), admin. Anexo não-`active`: só admin baixa.
- **`view_message_attachments`:** anexo (`mat_*`) + mensagem (`mm_*`) + `conversation_type` (`private`/`group`), `conversation_label`,
  `destination_name` (grupo, ou destinatário), `mgl_id`/`mg_name`, remetente (`sm_username`, `sc_name`) e destinatário (`rm_*`, `rc_*`) —
  **sem dados pessoais sensíveis**. `deleted_at` = anexo **ou** mensagem excluída (anexo de mensagem excluída some das leituras).
- **`attachments_count`** (coluna nova **ao final**) em `view_messages_manager` e `view_message_group_posts`; usada pela coluna "Anexos" das listas 36 e 39.
- Filtros: `api/v1/message-attachments` e `-view` em `jwtauth`. `delete-hard`/`clear-deleted` com `adminonly` na rota.
- **Fora desta fase:** vários anexos por mensagem pela tela (a tabela já suporta), mensagem de chat/@ e filtro de palavrão.

### 4.4 Modo chat — Etapa 1: contatos e busca (`MessageContacts`)

O **modo chat** é a tela de conversa (estilo WhatsApp) e é onde vale a restrição de estado "só edita enquanto agendada" (§0). Ele é
entregue **por etapas**: 1) lista de conversas (esta); 2) conversa 1 para 1 privada no modal; 3) não lidas e contador; 4) conversa de
grupo no modal; 5) anexos e a regra de estado do chat.

- **`view_message_contacts`:** um usuário por linha — `uc_name`, `um_username`, `uc_phone`, `phone_digits` (só dígitos, para a busca
  aceitar telefone com ou sem máscara). Sem CPF/CEP/endereço. Recurso **somente leitura** `message-contacts-view` (**9** rotas — total
  do módulo = 176; `jwtauth` em `Filters.php`).
- **Escopo (Processor):** só usuários `active`, **nunca o próprio usuário logado**, guest lê vazio; o filtro `um_status` do cliente é
  descartado; linha do próprio usuário/inativo = 404. Busca (`GET search?q=`): nome, usuário e celular e, se o termo tem dígitos,
  `phone_digits` — `(19) 5481-6592`, `1954816592` e `54816` acham o mesmo usuário.
- **Grupos da lista:** vêm de `message-group-memberships-view` (já escopada: grupos em que o usuário é dono ou membro ativo). A view ganhou
  `members_search` (**coluna nova ao final**: nome, usuário e telefone em dígitos dos membros ativos, até 1000 caracteres) e a busca do
  recurso passou a olhar nome do grupo, descrição, dono, `members_names` e `members_search` (com o termo em dígitos também). Nenhuma
  coluna existente saiu.
- **Correção de collation (bug latente):** `members_names` usava `COALESCE(nome, username)` (collations diferentes) e a busca por ele dava
  `Illegal mix of collations` (500) — por exemplo na lista 38 e na busca de grupos. Agora `members_names` e `members_search` são
  `CAST(... AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci` (scripts `20261006080000` e `20261006125500` atualizados).
- **Limite:** `members_search` é truncado em 1000 caracteres; grupos com muitos membros podem não ser achados por um membro além do corte.

**Etapa 2 — conversa 1 para 1 privada (sem mudança de banco nem de backend).** O modal reaproveita rotas que já existiam:
`GET messages-manager/with/{userId}` (últimas 200 mensagens entre o usuário logado e `{userId}`, das mais antigas para as mais novas; as do
outro só se `sent`; as minhas `scheduled` e `sent`; guest 403), `PATCH messages-manager/read/{userId}` (carimba `read_at` nas recebidas;
idempotente; devolve `marked`) e `POST messages-manager/create` (envio sem `scheduled_at` sai na hora, `status=sent`). Atualização
automática por **polling de 5 s** enquanto o modal está aberto (decisão do usuário: o módulo usa só polling, sem WebSocket). Testado: envio imediato,
visibilidade (destinatário não vê a agendada; terceiro não vê a conversa), `markRead` marca e é idempotente, o remetente passa a ver
`read_at` na própria mensagem, ordem e guest 403. **Fora desta etapa:** edição/exclusão pelo chat com a regra "só edita enquanto agendada"
(Etapa 5, junto com anexos), conversa de grupo (Etapa 4).

**Etapa 3 — não lidas e contador.** Sem mudança de banco; reaproveita `view_messages_users` (`messages-users-view`: `mu_peer_user_manager_id`,
`mu_unread_count`, `mu_last_message_at`, escopada ao dono). Uma rota nova, leve: **`GET messages-manager/unread-count`** → `{ total }`
(mensagens recebidas, `status=sent`, `read_at` nulo, não excluídas; **mesmo critério** de `mu_unread_count`; guest = 0) — Processor
`unreadCount()`, Model `countUnread()`, script `20261006140500_route_manager_messages_unread_count_sync.sql`. Total do módulo = 177 rotas.
Testado: o remetente não conta as próprias; o destinatário soma só as `sent` (a agendada não conta); depois de `read` volta ao inicial;
terceiro não é afetado; guest 0. **Não lidas de grupo:** Etapa 4 (abaixo).

**Etapa 4 — conversa de grupo e leitura por membro.**
- **Banco** (`20261006180000_message_group_reads_views.sql`): tabela `message_group_reads` (`messages_manager_id`, `user_manager_id`, `read_at`;
  `UNIQUE` mensagem+usuário; FKs em cascata); `view_message_group_reads` (leitura + mensagem + grupo + leitor, sem dados pessoais
  sensíveis); `view_message_group_chat_summary` (uma linha por par membro ativo × grupo: `mgcs_unread_count`, `members_count`, última
  mensagem — `id` = membro × 4294967296 + grupo, `deleted_at` sempre NULL).
- **"Não lida" em grupo** = mensagem `sent`, de **outra pessoa**, ainda sem leitura do membro e enviada **depois que o membro entrou** no
  grupo. O histórico anterior continua visível na conversa, mas não conta como não lido (quem entra não ganha uma pilha de não lidas).
- **Conjunto completo de APIs** (**38** rotas novas — total do módulo = 215): `message-group-reads` (**tabela, 18 rotas**: o membro cria só a
  **própria** leitura de mensagem `sent` de grupo de que é membro ativo — idempotente, remetente 422, estranho 404, guest 403, outro usuário
  só admin 403; update de `read_at` e delete-*/clear-deleted só **admin**; vê as próprias, as das mensagens que enviou e as dos grupos que
  criou), `message-group-reads-view` (**9**) e `message-group-chat-view` (**9**, escopada: cada um vê só as próprias linhas; guest vazio).
- **Rotas do chat** (`message-group-messages`, só **membro ativo**; outro 404; guest 403): `GET chat/{groupId}` (até 200 mensagens: as `sent`
  de todos e as `scheduled` só do remetente; `mine`, `author`, `read_count` e `readers_total` = membros ativos sem o remetente) e
  `PATCH chat/{groupId}/read` (marca as ainda não lidas; devolve `marked`; idempotente). O **envio** reaproveita `POST message-group-messages/create`.
- **Contador do menu:** `GET messages-manager/unread-count` agora devolve `{ total, private, group }` (`total` = soma; guest tudo 0).
- **Etapa 5 — anexos, agendamento e regra de estado do chat** (sem mudança de banco):
  - **Anexos nos balões:** `GET messages-manager/with/{userId}` e `GET message-group-messages/chat/{groupId}` passaram a devolver, em cada
    mensagem, `attachments` (`id`, `name`, `category`, `size`; só anexos ativos). Ver/baixar usa `serve`/`download` de `message-attachments`
    (visibilidade = a da mensagem). Enviar: grava a mensagem e, em seguida, sobe o arquivo (`POST message-attachments/create`) com o id dela
    (privada: `id`; grupo: `messages_manager_id` da resposta).
  - **Regra de estado do chat** (a área administrativa segue irrestrita, §0), em rotas próprias de `messages-manager` (**+2 rotas**, total do
    módulo = 217; `20261006160000_route_manager_messages_chat_edit_remove_sync.sql`): `PUT chat/{id}` edita `content` e/ou `scheduled_at` da
    PRÓPRIA mensagem, **só enquanto `scheduled`** (409 depois de enviada; 403 para outro remetente já enviado; 404 se não a enxerga; guest 403;
    texto vazio e data não futura = 422) e `DELETE chat/{id}` apaga a própria (`status=removed`) em qualquer status (idempotente). Valem para
    mensagem privada e de grupo (ambas são linhas de `messages_manager`).
  - **Agendamento sem cron:** `with`, `chat` e `unread-count` executam `dispatchDue()` (o mesmo UPDATE condicionado ao status do job
    `messages:dispatch`) — a agendada vencida é enviada na primeira consulta do chat, uma única vez. Desde a §4.5 o gatilho também roda em toda requisição autenticada.
  - Testado (22 verificações, descartáveis): editar enviada 409 / agendada ok / vazio, data passada e corpo vazio 422; 403 e 404 por papel;
    anexo em `with` e em `chat` (imagem e documento); apagar/cancelar (idempotente) e sumir da conversa; envio da agendada vencida
    uma vez só; membro não edita mensagem de outro.
- **Marcação de usuário (@) — só na conversa de GRUPO** (2026-10-06):
  - **Banco** (`20261006200000_message_mentions_table_view.sql`): tabela `message_mentions` (`messages_manager_id`, `user_manager_id`; `UNIQUE`
    mensagem+usuário; FKs em cascata; mesma estrutura de `chat_message_mentions`) e `view_message_mentions` (marcação + mensagem + grupo +
    marcado + autor, sem dados pessoais sensíveis).
  - **Conjunto completo de APIs** (**27** rotas novas — total do módulo = 244; `20261006200100_route_manager_messagementions_sync.sql`):
    `message-mentions` (**tabela, 18**) e `message-mentions-view` (**9**). Create: só o **remetente** da mensagem (ou admin) marca (membro que vê = 403;
    quem nem vê = 404; guest 403); a mensagem precisa ser **de grupo**; o marcado precisa ser usuário ativo, **membro ativo do grupo** e diferente do
    remetente (422); até **20** por mensagem; **idempotente** (soft-deletada reativa). Update (troca o marcado) e clear-deleted só admin; delete-soft/restore/hard
    pelo remetente ou admin. Visibilidade: o marcado, o remetente, o dono do grupo e admin.
  - **No chat:** `POST message-group-messages/create` aceita `mentions: [ids de usuário]` — validado **antes** de gravar (não membro, a si mesmo, formato ou
    mais de 20 = 422 e **nada** é gravado) e gravado **na mesma transação** da mensagem e da ligação; `GET chat/{groupId}` devolve `mentions`
    (`user_id` e `name`) em cada mensagem; `PUT messages-manager/chat/{id}` (edição no chat) mantém só as marcações cujo `@Nome` continua no texto.
  - Testado (25 verificações, descartáveis): envio com marcações (dedup), tudo ou nada, `mentions` no chat, a tabela (create/idempotência/422/403/404,
    visibilidade, update só admin) e a poda ao editar.
- **Filtro de palavrão e advertência** (2026-10-06):
  - **Dicionário único:** `src/frontend/projeto54900/src/config/palavras-proibidas.json` (campo `palavras`), lido pelo PHP a cada requisição
    por `App\Libraries\ForbiddenWords` — editar só o JSON muda o chat de salas, o frontend de mensagens e o backend. Mesma regra do frontend
    (`utils/palavrasProibidas.ts`): sem diferenciar maiúscula/acento, só palavra **inteira** (`cu` pega "vai tomar no cu", não "custo"/"cuidado"),
    frases valem. Arquivo ausente ou JSON inválido **não bloqueia** o envio (vai para o log).
  - **Pontos de envio e edição** (todos com o mesmo comportamento; **admin isento**, §0): `messages-manager/create`, `message-group-messages/create`
    (conversa privada e de grupo, chat e telas administrativas), `PUT messages-manager/chat/{id}`, `PUT messages-manager/update/{id}` e
    `PUT message-group-messages/update/{id}`. **Envio:** a mensagem é gravada `blocked` (nunca entregue; nas de grupo, sem marcações) e a chamada
    responde **422** ("Mensagem bloqueada: contem palavra proibida (X)"); **edição:** o texto NÃO muda e responde 422. Nos dois casos grava a advertência.
  - **Banco** (`20261006220000_message_warnings_table_view_menu_list_forms.sql`): tabela `message_warnings` (`messages_manager_id`, `user_manager_id`
    = quem tentou, `message_groups_manager_id` NULL = privada, `flagged_word`; FKs em cascata; mesmo desenho de `chat_room_warnings`) e
    `view_message_warnings` (sem dados pessoais sensíveis).
  - **Conjunto completo de APIs, TODAS `adminonly`** (**27** rotas novas — total do módulo = 271; `20261006220100_route_manager_messagewarnings_sync.sql`):
    `message-warnings` (**tabela, 18**) e `message-warnings-view` (**9**). Create manual (admin) exige mensagem e autor existentes (404) e pega o grupo da própria
    mensagem; update só altera `flagged_word`; writes só admin (403 para os demais). A advertência **automática** é gravada direto pelo model
    (`SqlTableModel::register`), sem passar pelo Processor admin.
  - Testado (28 verificações, descartáveis): regra do dicionário (palavra inteira, maiúscula/acento, texto limpo), privada e grupo (422, `blocked` + advertência,
    destinatário/membro não vê), edição no chat e na tela administrativa (texto não muda), admin isento, API de advertências (403/404, update só a palavra,
    view sem CPF, soft/restore) e dicionário ausente sem bloquear.
- Testado (31 verificações, teste descartável): autoria/visibilidade, agendada só do remetente, não lida só após a entrada, `chatRead`
  idempotente, `read_count` 1 de 2, total do menu, a tabela de leituras (create/idempotência/403/404/422, update e delete só admin,
  visibilidade) e o resumo escopado.

### 4.5 Entrega das mensagens agendadas SEM cron

Premissa de hospedagem: só o build do React e o FTP do PHP — **sem `spark`, sem cron e sem Composer**. Por isso a entrega não depende de nenhum agendador:

- **Gatilho:** `AppLibrariesMessageDispatcher::tick()`, chamado pelo `JwtAuthFilter` depois do token validado — **toda requisição autenticada de qualquer
  usuário** tenta entregar as agendadas vencidas (`scheduled` com `scheduled_at` <= agora), mesmo que a mensagem não seja dele. A mensagem agendada para o dia 9
  chega quando o primeiro usuário logar no dia 10; num grupo, o primeiro membro que entrar a entrega para todos. As consultas do chat (`with`, `chat`,
  `unread-count`) também chamam o mesmo `dispatchDue()`.
- **Intervalo mínimo de 60 s** no servidor inteiro, controlado por um arquivo em `writable/cache/messages_dispatch.stamp` (último instante; só FTP, sem tabela
  nova), com `flock` — duas requisições simultâneas não disparam duas vezes. O UPDATE é condicionado ao status, então nunca entrega a mesma mensagem duas vezes.
- **Segurança:** qualquer erro (arquivo ilegível, banco) vai para o log e **nunca** quebra a requisição do usuário.
- **`sent_at` = data agendada:** a mensagem entregue no dia 10 fica com "enviada em" do dia 9 (a hora em que deveria ter chegado).
- **Ordem da conversa:** `with/{userId}` e `chat/{groupId}` ordenam pela **data de entrega** (`COALESCE(sent_at, scheduled_at, created_at)`), não pelo id de criação.
- **Limite:** a granularidade é de cerca de 1 minuto e só há entrega enquanto algum usuário estiver logado e usando o sistema (sem acesso nenhum, nada
  seria lido de qualquer forma). O comando `php spark messages:dispatch` continua no código, só para uso local.
- Testado (10 verificações, descartáveis): entrega da vencida, `sent_at` agendado, arquivo de controle, intervalo respeitado, nova entrega após o intervalo,
  nunca duas vezes, arquivo de controle sujo sem quebrar, ordem por entrega (privada e grupo) e o membro que loga depois vê a entregue.

## 5. Regras de negócio

### 5.1 Mensagem (`MessagesManager\Processor`)

1. Guest não cria, edita nem exclui (403).
2. **Create.** Campos aceitos: remetente, destinatário, texto, `status`, `scheduled_at`,
   `sent_at`, `read_at`.
   - Remetente do corpo só vale para **admin**; não-admin com outro remetente = 403. Remetente
     e destinatário precisam ser usuários ativos; destinatário inexistente = 404, inativo = 409;
     remetente = destinatário = 422.
   - `status`: `blocked`/`removed` são respeitados; `scheduled`/`sent` são resolvidos pela data
     (`scheduled_at` futuro = `scheduled`, senão `sent`). `scheduled` sem data = 422.
   - `sent_at` vazio = agora (se `sent`); `read_at` vazio = não lida.
   - Data passada = 422, exceto **admin** registrando mensagem já enviada/bloqueada/removida.
3. **Update.** O formulário manda todas as colunas e só conta o que **mudou** (nada mudou = 200
   sem alterar; corpo sem campo = 422).
   - Remetente, destinatário, `sent_at`, `read_at` e status (exceto remover): só admin (403).
   - Texto e `scheduled_at`: remetente ou admin, em **qualquer status** (área administrativa irrestrita, §0; a restrição "só agendada" é do modo chat).
   - `status=removed` vale em qualquer status para remetente ou admin.
4. **Exclusão** (soft/restore/hard): remetente ou admin; destinatário recebe 403; quem não enxerga
   a mensagem recebe 404. `clear-deleted`: só admin.
5. **Visibilidade** (tabela e view): remetente vê tudo que enviou; destinatário só `sent`; admin vê
   tudo; fora disso a linha "não existe" (404 / lista vazia). Vale também para `get-deleted*`.
6. `with/{userId}` e `read/{userId}` descritos em §4. Ambos só para usuário não-guest.
7. **Entrega das agendadas** (§4.5): `UPDATE ... WHERE status='scheduled' AND scheduled_at <= agora`, com `sent_at` = a data **agendada**;
   condicionado ao status, então rodar em paralelo não entrega duas vezes. Disparada por `MessageDispatcher::tick()` (toda requisição autenticada,
   no máximo 1x/min) e pelas consultas do chat; o comando `php spark messages:dispatch` só existe para uso local.

### 5.2 Resumo por interlocutor (`MessagesUsers\Processor`)

Cada usuário vê só as linhas em que é o dono (`mu_owner_user_manager_id` vem do token; filtro de
dono enviado pelo cliente é descartado). Admin vê todas e pode filtrar por dono. Linha de outro
usuário = 404.

### 5.3 Grupo (`MessageGroupsManager\Processor`)

1. Guest não escreve (403); create exige usuário ativo.
2. **Create:** dono do corpo só vale para admin (403 para os demais; o dono precisa estar ativo);
   `status` (`active`/`inactive`) aceito, padrão `active`. O dono entra como membro `owner` **na
   mesma transação**.
3. **Update:** dono igual ao gravado é ignorado; diferente = 403 (dono imutável). Update só do dono
   ou admin; quem vê o grupo e não é dono = 403; quem nem vê = 404. Update vazio = 422.
4. **Visibilidade** (tabela e view): o dono, os membros **ativos** e o admin. O grupo **não é
   público**, ao contrário da sala de chat.
5. Exclusões: dono ou admin; `clear-deleted` só admin.

## 6. Scripts SQL (`doc/sql/insert/`, aplicados no banco DEV)

| Script                                                  | O que faz                                                              |
| ------------------------------------------------------- | ---------------------------------------------------------------------- |
| `20261005193840_messages_manager.sql`                   | tabela `messages_manager` + `view_messages_manager`                    |
| `20261005200500_route_manager_messagesmanager_sync.sql` | 29 rotas em `route_manager`                                            |
| `20261005211500_view_messages_users.sql`                | `view_messages_users` (com `deleted_at` NULL)                          |
| `20261005211600_route_manager_messagesusers_sync.sql`   | 9 rotas                                                                |
| `20261005222000_messages_lista_menu_list_forms.sql`     | menu "Mensagem" > "Lista", `list_manager` 36, formulários 41 e 42      |
| `20261005230000_message_groups_tables_views.sql`        | 3 tabelas e 3 views de grupo; `recipient` aceita NULL; recria 2 views  |
| `20261005233000_route_manager_messagegroupsmanager_sync.sql` | 27 rotas                                                          |
| `20261006000000_message_groups_menu_list_forms.sql`     | menu "Grupos", `list_manager` 37, formulários 43 e 44                  |
| `20261006030000_messages_groups_forms_completos.sql`    | campos que faltavam nos 4 formulários (remetente/dono, status, datas)  |
| `20261006020000_messages_forms_help_content.sql`        | texto de ajuda do campo Mensagem                                       |
| `20261006080000_message_group_members_views_menu_list.sql` | `view_message_users_groups`, `view_message_group_memberships`, menu "Membros" (id 50), `list_manager` 38 (colunas 204–209, ações 97–98) |
| `20261006080100_route_manager_messagegroupmembers_sync.sql` | 46 rotas em `route_manager`                                        |
| `20261006092500_message_group_messages_view_menu_list_forms.sql` | `view_message_group_posts`, menu "Mensagens de grupo" (id 51), `list_manager` 39 (colunas 210–216, ações 99–100), formulários 45 e 46 (campos 311–316) |
| `20261006092600_route_manager_messagegroupmessages_sync.sql` | 27 rotas em `route_manager`                                       |
| `20261006100000_area_administrativa_edicao_irrestrita.sql` | remove a regra "só agendada" das ações 93 e 99 e ajusta descrições (§0)  |
| `20261006103500_message_attachments_table_view_menu_list_forms.sql` | tabela `message_attachments`, `view_message_attachments`, `attachments_count` (2 views), campo `arquivo` nos forms 41/42/45/46 (campos 317–320), menu "Anexos" (id 52), `list_manager` 40 (colunas 219–227, ações 101–105), colunas "Anexos" 217/218 |
| `20261006103600_route_manager_messageattachments_sync.sql` | 29 rotas em `route_manager`                                        |
| `20261006125500_message_chat_contacts_view_menu.sql` | `view_message_contacts`, `members_search` em `view_message_group_memberships` (e correção de collation do `members_names`), menu "Conversas" (id 53) |
| `20261006160000_route_manager_messages_chat_edit_remove_sync.sql` | 2 rotas em `route_manager` (`PUT`/`DELETE messages-manager/chat/{id}`) |
| `20261006220000_message_warnings_table_view_menu_list_forms.sql` | tabela `message_warnings`, `view_message_warnings`, menu "Advertências" (id 54), `list_manager` 41 (colunas 228–233, ações 106–107), formulário 47 (campo 321) |
| `20261006220100_route_manager_messagewarnings_sync.sql` | 27 rotas em `route_manager` (todas `adminonly`) |
| `20261006200000_message_mentions_table_view.sql` | tabela `message_mentions` e `view_message_mentions` |
| `20261006200100_route_manager_messagementions_sync.sql` | 27 rotas em `route_manager` |
| `20261006180000_message_group_reads_views.sql` | tabela `message_group_reads`, `view_message_group_reads`, `view_message_group_chat_summary` |
| `20261006180100_route_manager_messagegroupreads_sync.sql` | 38 rotas em `route_manager` (reads 18 + reads-view 9 + chat-view 9 + 2 do chat de grupo) |
| `20261006125600_route_manager_messagecontacts_sync.sql` | 9 rotas em `route_manager`                                          |
| `20261006010000_…`, `…011500_…`, `…013000_menu_40_icone_original.sql` | trocas de ícone de menu; o estado final está em §7 |

Todos idempotentes (ids fixos com `INSERT IGNORE` ou `WHERE NOT EXISTS`); cada um traz o
rollback no cabeçalho. Os planos de execução ficam em `src/writable/claude/` (ignorada pelo Git).

### 6.1 Migrations — rodada REMAKE de 2026-10-05

Padrão ativo do projeto: **3 migrations por rodada** (`replace_table`, `seed_table`, `replace_view`),
cada uma com um `.sql` e uma classe PHP, um minuto de diferença entre elas. Autorizada pelo usuário
em 2026-10-05. Em `src/app/Database/Migrations/`:

| Classe PHP                                   | SQL                                  | O que faz                                                         |
| -------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| `2026-10-05-213000_ReplaceTable20261005.php` | `202610052130_replace_table.sql`     | `DROP` + `CREATE` das **44** tabelas (as 40 anteriores + as 4 do Messages) |
| `2026-10-05-213100_SeedTable20261005.php`    | `202610052131_seed_table.sql`        | `DELETE` + `INSERT` de todas as tabelas, a partir do estado do banco DEV |
| `2026-10-05-213200_ReplaceView20261005.php`  | `202610052132_replace_view.sql`      | `DROP` + `CREATE` das **39** views (34 anteriores + as 5 do Messages) |

- `replace_table` e `seed_table` foram gerados **do banco DEV** no formato do modelo de 2026-10-04
  (cabeçalho/rodapé iguais, `CREATE TABLE IF NOT EXISTS`, uma tupla por linha). Em relação ao seed
  anterior, as únicas diferenças são as do módulo: +65 rotas em `route_manager`, +3 menus, +2 listas
  (+17 colunas, +4 ações), +4 formulários (+14 linhas, +22 campos) e as linhas das 4 tabelas novas.
- `replace_view` = arquivo anterior **inalterado** + as 5 views novas no estilo do modelo (todas as
  colunas das tabelas envolvidas, prefixo `{alias}_`, junções à esquerda com `deleted_at IS NULL`).
  A `view_messages_users` é agregada e por isso expõe só colunas de identificação.
- As 5 views novas também foram aplicadas no banco DEV, com **os mesmos nomes de coluna** de antes mais
  as colunas extras (nenhuma coluna existente sumiu; conferido por comparação).
- **Validação:** `php -l` nas 3 classes; os 3 `.sql` foram executados, na ordem e com o mesmo divisor
  de statements das classes, num banco **temporário** (já apagado): 44 tabelas, 39 views, nenhuma
  diferença de coluna nem de contagem de linhas em relação ao DEV.
- **Não foi rodado `spark migrate`** no DEV — todo REMAKE destrói e recria tudo. Rodar só com o usuário avisando.
- `down()` das classes de tabela e de seed é vazio de propósito (sem reversão genérica), como no modelo.

**Atenção ao rodar:**

1. **Dados de teste no seed.** O seed carrega o que está no DEV hoje, incluindo 1 mensagem com texto
   de lixo (gerado pelo botão DEBUG, `mm_status = scheduled`), 1 grupo "Nome do grupo" e 1 membro.
   Apague esses registros antes de um REMAKE, se não quiser levá-los.
2. **Dados pessoais nas views.** Pela regra do modelo, `view_messages_manager`, `view_message_groups_manager`,
   `view_message_group_members` e `view_message_group_messages` expõem **todas** as colunas de
   `user_profiles` do remetente/destinatário/dono (`cpf`, `phone`, `whatsapp`, `cep`, `address`), e quem
   lê a view é o outro participante da mensagem. É a mesma regra já aplicada às views do chat no
   `replace_view`. Se isso não for desejado, tirar essas colunas das views do Messages (arquivo e banco).
3. **Rodada de 2026-10-06 (Grupos ↔ Membros, Mensagens de grupo e Anexos) fora do REMAKE.** A tabela `message_attachments`, as 4 views novas
   (e as colunas `attachments_count` e `members_search` das existentes), os menus 50–53, as listas 38–40, os formulários 45 e 46, o campo `arquivo` e as 111 rotas só existem no DEV (scripts acima); `replace_view`/`seed_table` de 2026-10-05 **não** os trazem. Incorporar na próxima rodada
   REMAKE.
4. **Senhas no seed.** O seed inclui `user_manager` como nas rodadas anteriores (hash de senha e token);
   não publicar o arquivo fora do repositório privado.

## 7. Menu, lista e formulários (registros no banco)

| Peça        | Registro                                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Menu        | `menu_manager` 47 "Mensagem" (ícone `chat-dots`, redondo), 48 "Lista" (`/v1/messages-manager`), 49 "Grupos" (`/v1/message-groups-manager`), 50 "Membros" (`/v1/message-group-members-manager`, ícone `person-plus`), 51 "Mensagens de grupo" (`/v1/message-group-messages-manager`, ícone `send`), 52 "Anexos" (`/v1/message-attachments-manager`, ícone `paperclip`), 53 "Conversas" (`/v1/message-chat`, ícone `chat-left-dots`; tela própria do modo chat, sem `list_manager`), 54 "Advertências" (`/v1/message-warnings-manager`, ícone `exclamation-triangle`; só admin) |
| Listas      | `list_manager` 36 `messages-manager` (colunas 187–195, ações 93 Editar e 94 Excluir) e 37 `message-groups-manager` (colunas 196–203, ações 95 e 96); ambas com endpoint de busca |
| Lista 38    | `message-group-members-manager` sobre `view_message_group_memberships` (busca em `message-group-memberships-view/search`); colunas Grupo, Status, Dono, Membros, Nomes; ações 97 "Editar membros" (link para a tela de 2 cards) e 98 "Excluir" (soft delete do grupo) |
| Lista 41    | `message-warnings-manager` sobre `view_message_warnings` (busca em `message-warnings-view/search`; **só admin**); colunas Mensagem, Grupo (vazio = "Privada"), Autor, Palavra, Status da mensagem, Registrada em; ações 106 Editar (só a palavra, formulário 47 `editar-advertencia-mensagem`) e 107 Excluir. **Sem cadastro** (a advertência nasce do sistema) |
| Lista 40    | `message-attachments-manager` sobre `view_message_attachments` (busca em `message-attachments-view/search`); colunas Arquivo, Tipo, Tamanho, Conversa, Destino, Mensagem, Remetente, Status, Enviado em; ações 101 Baixar, 102/103 "Abrir mensagem" (privada/de grupo, por `conversation_type`), 104 Excluir, 105 Visualizador de Mídias. Sem cadastro próprio: o anexo nasce nos formulários da mensagem |
| Lista 39    | `message-group-messages-manager` sobre `view_message_group_posts` (busca em `message-group-messages-view/search`); colunas Grupo, Mensagem, Remetente, Status, Agendada para, Enviada em, Membros; ações 99 "Editar" (qualquer status, §0) e 100 "Excluir" |
| Formulários | 41 `criar-mensagem-direta`, 42 `editar-mensagem-direta`, 43 `criar-grupo-mensagem`, 44 `editar-grupo-mensagem` — com quase todas as colunas (só `id`, `created_at`, `updated_at`, `deleted_at` ficam de fora) |

A ação Editar das listas 36 e 39 aparece em **qualquer status** (§0; a regra "só `scheduled`" foi removida da área administrativa). O ícone do atalho de chat
(barra de atalhos) é código do frontend, não do banco — ver o documento do frontend.

## 8. Validação realizada

- `php -l` nos arquivos; `spark routes` = 65 rotas do módulo; 401 sem token em todos os grupos.
- Testes funcionais **temporários** do Processor com usuários reais de DEV, removidos após cada
  rodada (32 verificações de mensagem; 9 do resumo; 26 de grupo; 27 dos formulários completos).
  Cobriram criação, agendamento, recusas, visibilidade por papel, edição só do que mudou,
  `with`/`read`, job, dono e remetente só-admin, exclusões e limpeza.
- Os testes acharam um erro real: `get-deleted/{id}` em view sem `deleted_at` (500) — corrigido.
- **Não** feito: teste HTTP com JWT real (sem login de teste na sessão) e nenhum teste automatizado
  permanente. Hoje o único teste é refazer o roteiro à mão.

## 9. Pendências (em ordem sugerida)

1. ~~**Enviar para grupo pela API.**~~ **Feito em 2026-10-06** (§4.2) em `message-group-messages`. Decisão: o envio a
   grupo tem recurso próprio; `messages-manager/create` continua só 1 para 1.
2. ~~**Visibilidade da mensagem de grupo.**~~ **Encerrada (2026-10-06):** os membros veem pelo chat (`message-group-messages/chat/{groupId}`); a Lista 36 e o
   `messages-manager` são telas **só do admin**, que já vê tudo (§0.1).
3. ~~**API de `message_group_members`**~~ — **feita em 2026-10-06** (§4.1): adicionar/remover/reativar por `sync`.
   Falta só "sair do grupo" pelo próprio membro (`status=left`) e trocar `role`.
4. ~~**API de `message_group_messages`**~~ — **feita em 2026-10-06** (§4.2).
5. ~~**Leitura por membro.**~~ **Feita em 2026-10-06** (Etapa 4, §4.4): `message_group_reads` + `PATCH chat/{groupId}/read`.
6. ~~**Agendar o job**~~ — **resolvido sem cron em 2026-10-06** (§4.5): a hospedagem (KingHost básica, só build do React + FTP do PHP) não permite `spark` nem agendador.
7. ~~**Marcação de usuário**~~ — **feita em 2026-10-06** para a conversa de GRUPO (§4.4); a conversa privada não marca. (~~Anexos~~ **feitos em 2026-10-06**, §4.3.)
8. ~~**Filtro de palavrão**~~ — **feito em 2026-10-06** no módulo Messages (§4.4). O backend do **chat de salas** ainda não valida (só o frontend dele).
9. ~~**Tempo real**~~ — **decidido (2026-10-06):** só polling (5 s na conversa aberta, 10 s na lista, 20 s no menu). WebSocket descartado pelo usuário.
10. **Listas administrativas de Leituras e Marcações (pendente, dispensada em 2026-10-06):** `message_group_reads` (`message-group-reads` / `-view`) e
    `message_mentions` (`message-mentions` / `-view`) têm a API completa de tabela e de view, mas **não têm lista (`list_manager`), formulários nem item de menu**.
    Criar quando o usuário pedir (seguir o desenho da lista 41, só admin).
11. **Testes:** teste HTTP com JWT e roteiro automatizado permanente (os atuais são descartáveis).
11. ~~`with/{userId}` ignora mensagens de grupo~~ — **correto como está**: a conversa de grupo tem rota própria (§0.1).
12. ~~Listas: Editar/Excluir aparecendo para quem não é remetente/dono~~ — **encerrada**: as listas administrativas só são vistas por admin (§0.1).

## 10. Pontos de atenção

- **`read_at` preenchido no cadastro.** A tela copia a data do "Agendar envio" também para "Lida
  em" (pedido do usuário). A mensagem agendada nasce **já lida** e sai da contagem de não lidas
  (`mu_unread_count`). Para manter a contagem, esvaziar "Lida em" ao agendar.
- **Dados no banco DEV.** Há registros criados pelo uso (1 mensagem, 1 grupo, 1 membro em
  2026-10-06); os testes automatizados deste módulo sempre apagam o que criam.
- `messages_manager.recipient_user_manager_id` aceita NULL **por causa** do grupo; voltar a
  `NOT NULL` só se não houver mensagem de grupo.
- Rollback do schema: bloco no fim de `20261005230000_message_groups_tables_views.sql`.

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
