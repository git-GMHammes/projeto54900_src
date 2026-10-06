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
> Pronto: schema (4 tabelas, 5 views), API V1 de mensagens, resumo por
> interlocutor e grupos (65 rotas), job de agendamento e CRUD de tela. Falta: tudo
> que faz a mensagem de **grupo** funcionar de ponta a ponta, a tela de conversa,
> marcação de usuário, anexos, leitura por membro e o agendador do job (§9).

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
| Job `messages:dispatch` (agendada → enviada)                  | **Pronto**, **não agendado**   |
| Sincronia das 65 rotas em `route_manager`                     | **Pronto**                     |
| Menu "Mensagem" > "Lista" e "Grupos", listas, formulários     | **Pronto** (ver §7)            |
| Migrations REMAKE 2026-10-05 (3 SQL + 3 classes PHP)          | **Pronto**, **não executado** no DEV (ver §6.1) |
| API de `message_group_members` (membros do grupo)             | **Falta** (tabela e view existem) |
| API de `message_group_messages` (ligação mensagem-grupo)      | **Falta** (tabela e view existem) |
| Enviar mensagem **para grupo** pela API                       | **Falta** — o create exige destinatário |
| Mensagem de grupo visível aos membros                         | **Falta** — hoje só remetente e admin veem |
| Leitura por membro em grupo (`read_at` por usuário)           | **Falta** (sem tabela)         |
| Marcação de usuário (`message_mentions`) e anexos             | **Falta**                      |
| Filtro de palavrão (`blocked` automático)                     | **Falta**                      |
| Cron do `messages:dispatch`                                   | **Falta**                      |
| Tempo real (WebSocket do Node)                                | **Falta** (nada definido)      |
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

Rotas extras de `messages-manager` (fora do contrato de 18):
`GET with/{userId}` (mensagens entre o usuário logado e `{userId}`, últimas 200, mais
antigas primeiro) e `PATCH read/{userId}` (carimba `read_at` nas recebidas de `{userId}`;
idempotente; devolve `marked`).

Arquivos (todos sob `src/app/`): `Config/Routes/Api/v1/Messages/{MessagesManager,MessagesUsers,MessageGroupsManager}/`,
`Controllers/Api/V1/Messages/...`, `Requests/V1/Messages/...`, `Services/V1/Messages/.../Processor.php`,
`Models/V1/Messages/.../SqlTableModel.php` e `SqlViewModel.php`, `Commands/MessagesDispatch.php`.
Total confirmado por `spark routes`: **65 rotas**.

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
   - Texto e `scheduled_at`: remetente só enquanto `scheduled` (409 depois); admin sempre.
   - `status=removed` vale em qualquer status para remetente ou admin.
4. **Exclusão** (soft/restore/hard): remetente ou admin; destinatário recebe 403; quem não enxerga
   a mensagem recebe 404. `clear-deleted`: só admin.
5. **Visibilidade** (tabela e view): remetente vê tudo que enviou; destinatário só `sent`; admin vê
   tudo; fora disso a linha "não existe" (404 / lista vazia). Vale também para `get-deleted*`.
6. `with/{userId}` e `read/{userId}` descritos em §4. Ambos só para usuário não-guest.
7. **Job `php spark messages:dispatch`:** `UPDATE ... WHERE status='scheduled' AND scheduled_at <= agora`,
   carimba `sent_at`; condicionado ao status, então rodar em paralelo não envia duas vezes.

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
3. **Senhas no seed.** O seed inclui `user_manager` como nas rodadas anteriores (hash de senha e token);
   não publicar o arquivo fora do repositório privado.

## 7. Menu, lista e formulários (registros no banco)

| Peça        | Registro                                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Menu        | `menu_manager` 47 "Mensagem" (ícone `chat-dots`, redondo), 48 "Lista" (`/v1/messages-manager`), 49 "Grupos" (`/v1/message-groups-manager`) |
| Listas      | `list_manager` 36 `messages-manager` (colunas 187–195, ações 93 Editar e 94 Excluir) e 37 `message-groups-manager` (colunas 196–203, ações 95 e 96); ambas com endpoint de busca |
| Formulários | 41 `criar-mensagem-direta`, 42 `editar-mensagem-direta`, 43 `criar-grupo-mensagem`, 44 `editar-grupo-mensagem` — com quase todas as colunas (só `id`, `created_at`, `updated_at`, `deleted_at` ficam de fora) |

A ação Editar da mensagem só aparece para `mm_status = scheduled`. O ícone do atalho de chat
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

1. **Enviar para grupo pela API.** `CreateRequest` exige `recipient_user_manager_id`. Precisa
   aceitar `message_groups_manager_id` **ou** destinatário (nunca os dois nem nenhum), exigir que o
   remetente seja membro ativo, recusar grupo `inactive`, gravar a mensagem e a linha de
   `message_group_messages` na mesma transação.
2. **Visibilidade da mensagem de grupo.** Hoje a regra é remetente/destinatário/admin; mensagem de
   grupo tem destinatário NULL e **só o remetente e o admin a veem**. Membros ativos do grupo
   precisam enxergá-la (tabela, view e `with`).
3. **API de `message_group_members`** (18 + 9): entrar, sair, adicionar, remover, papel. Hoje o
   membro só entra por INSERT direto; `members_count` apenas conta.
4. **API de `message_group_messages`** (18 + 9), ou decidir que a ligação é só interna ao create (1).
5. **Leitura por membro.** `read_at` único não serve a vários leitores. Criar tabela de leitura
   (mensagem + usuário + `read_at`) e estender `read/{...}` para grupo.
6. **Agendar o job.** `php spark messages:dispatch` a cada minuto (cron do servidor/container). Sem
   isso, mensagem agendada nunca é enviada.
7. **Marcação de usuário e anexos** — espelhar `chat_message_mentions` e `chat_room_attachments`
   (upload isolado, rotas `serve`/`download`, Visualizador de Mídias).
8. **Filtro de palavrão** (`blocked` automático + advertência), no mesmo desenho do chat.
9. **Tempo real:** definir se o recebimento usa o WebSocket do Node (como o chat) ou polling.
10. **Testes:** teste HTTP com JWT e roteiro automatizado permanente (os atuais são descartáveis).
11. `with/{userId}` ignora mensagens de grupo; revisar junto da pendência 2.
12. Listas: a regra de negócio das ações só vê a linha, não o usuário logado (Editar/Excluir
    aparecem também para quem não é remetente/dono; o backend responde 403). Opção: expor
    "sou o dono/remetente" por linha, no Processor, como `is_favorite` do chat.

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
