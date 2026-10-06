[◄ Índice da base de conhecimento](../../../README.md)

---

# Módulo `messages` — frontend: estado atual e pendências

Mensagens diretas entre usuários (1 para 1 e 1 para grupo), com agendamento. Usa a
aparência e a forma de envio do chat, mas **Message NUNCA é um chat**: não há sala nem
conversa. Hoje o frontend tem as **listas com busca e o CRUD de tela** de mensagens e de
grupos; a **tela de conversa** (estilo chat/WhatsApp) ainda **não existe**. Detalhe técnico
do backend (tabelas, regras, rotas, scripts) em
[`app/markdown/geral/README_modulo_messages.md`](../../../../../../../app/markdown/geral/README_modulo_messages.md).

## Regra permanente — ÁREA ADMINISTRATIVA IRRESTRITA

Decisão do usuário (2026-10-06): nas telas administrativas (listas, cadastros e edições de `messages-manager`,
`message-groups-manager`, `message-group-members-manager` e `message-group-messages-manager`) **não há trava de estado**: a ação
"Editar" aparece e o formulário fica editável para uma mensagem em **qualquer status** (`scheduled`, `sent`, `blocked`,
`removed`). A regra "só edita enquanto agendada" é do **MODO CHAT** (tela de conversa, futura) e deve ser implementada lá, sem
voltar para a área administrativa. Continuam travados por **autorização** (o backend decide, 403 vira toast): remetente,
destinatário, "Enviada em" e "Lida em" da mensagem 1 para 1 (só admin), e o grupo de uma mensagem de grupo (nunca muda).
Detalhe técnico em [`README_modulo_messages.md`](../../../../../../../app/markdown/geral/README_modulo_messages.md) §0.

**Listagens administrativas = `get-all` liberado ao admin** (2026-10-06): nenhuma regra de negócio/estado trava o administrador (usuário inativo, grupo
inativo, data passada, leitura, marcações — o backend relaxa só para admin; o chat e o usuário comum seguem com as regras). **Não implementado (não pedido):**
se uma lista administrativa pedir `get-grouped` pelo ID de um usuário **não administrador**, aí valerão as regras desse usuário. O menu é gerido manualmente
pelo usuário; as telas administrativas só aparecem para admin.

## ✅ O que está pronto

### Menu (banco, não código)

| Item                                | Registro                              | Rota                         |
| ----------------------------------- | ------------------------------------- | ---------------------------- |
| **Mensagem** (pai, ícone `chat-dots`, redondo) | `menu_manager` 47          | —                            |
| **Lista**                           | `menu_manager` 48                     | `/v1/messages-manager`       |
| **Grupos**                          | `menu_manager` 49                     | `/v1/message-groups-manager` |
| **Membros**                         | `menu_manager` 50 (ícone `person-plus`) | `/v1/message-group-members-manager` |
| **Mensagens de grupo**              | `menu_manager` 51 (ícone `send`)      | `/v1/message-group-messages-manager` |
| **Anexos**                          | `menu_manager` 52 (ícone `paperclip`) | `/v1/message-attachments-manager` |
| **Conversas** (modo chat)           | `menu_manager` 53 (ícone `chat-left-dots`) | `/v1/message-chat` |
| **Advertências** (só admin)         | `menu_manager` 54 (ícone `exclamation-triangle`) | `/v1/message-warnings-manager` |

**Telas administrativas (Lista, Grupos, Membros, Mensagens de grupo, Anexos, Advertências): só `admin`** (menu, lista, formulário e rota sob `RequireRole`); **"Conversas": `user` e `admin`**, sem relação com as listas administrativas (regra em `README_modulo_messages.md` §0.1). Menu e lista vêm do banco (`menu_manager`, `list_manager`); nenhum item
foi escrito direto em `Navbar.tsx`.

### Telas (3 por recurso)

| Recurso                        | Lista com busca                | Cadastro                              | Edição                                      |
| ------------------------------ | ------------------------------ | ------------------------------------- | ------------------------------------------- |
| Mensagens (`messages-manager`) | `GetAllPage` — lista 36        | `CreatePage` — form 41                | `UpdatePage` — form 42                      |
| Grupos (`message-groups-manager`) | `GetAllPage` — lista 37     | `CreatePage` — form 43                | `UpdatePage` — form 44                      |

Todas em `pages/v1/messages/<recurso>/`, rotas em `routes/v1/messages.routes.tsx` (montadas em
`routes/v1/index.tsx`), caminhos em `paths.v1.messagesManager` e `paths.v1.messageGroupsManager`.

### Grupos ↔ Membros (N:N usuários × grupos) — `message-group-members-manager`

Pasta `pages/v1/messages/message-group-members-manager/`; caminhos em `paths.v1.messageGroupMembers`
(`list`, `update(id)` — o id é o do **grupo**).

- **Lista** (`GetAllPage`, lista 38): uma linha por grupo, com dono, quantidade e nomes dos membros; busca; ações
  "Editar membros" e "Excluir" (grupo). O botão **Novo** abre o modal.
- **Create = `CreateModal`, 2 etapas.** Etapa 1: o formulário 43 (`criar-grupo-mensagem`), igual ao de novo grupo.
  Etapa 2: o editor de dois cards com o grupo recém-criado fixo. Se a etapa 2 falhar, o grupo continua criado
  (dá para refazer ali mesmo ou pela tela de edição).
- **Update = `UpdatePage`, tela dedicada** com o `GroupMembersEditor`: card **Usuários** (busca + checklist de até
  1000 usuários ativos; se o total passa de 1000, a busca consulta o servidor) e card **Grupo** (select de grupos via
  FormGrid + card sem título com os membros atuais). Os dois ficam lado a lado no desktop (`col-lg-6`) e empilhados
  no mobile. Marcar usuário = vira "novo" no card do grupo; checkbox no membro = "remover" (dono travado). **Salvar**
  chama `PUT message-group-members/sync/{id}`; nada grava antes disso. Quem não é dono nem admin só lê.
- Create e Update **não** são formulários comuns e por isso não precisam ser iguais (decisão do usuário).
- Services: `messageGroupMembers.{table,view}.ts` (+ `syncMessageGroupMembers`), `messageUsersGroups.view.ts`,
  `messageGroupMemberships.view.ts`.

### Modo chat — Etapa 1: lista de conversas (`/v1/message-chat`)

O **modo chat** é a tela de conversa 1 para 1 privada (e, depois, de grupo); a restrição "só edita enquanto agendada" vale **só** aqui
(a área administrativa é irrestrita, ver a regra permanente acima). Entrega **por etapas**: 1 (esta) lista; 2 conversa privada no modal;
3 não lidas e contador; 4 conversa de grupo; 5 anexos e regra de estado do chat.

- **Tela** `pages/v1/messages/chat/ChatHomePage.tsx` — uma **lista de cards** (não é tabela nem grid), com busca no topo (debounce 400 ms):
  nome, usuário, telefone (com ou sem máscara) e grupo (pelo nome do grupo **ou por quem participa dele**).
  - **Grupos** (primeiro): só os do usuário logado (dono ou membro ativo) — nome em negrito e "N membro(s)" em cinza, fonte menor.
  - **Usuários**: todos os ativos, **exceto o próprio** — nome em negrito e "usuário · celular" em cinza, fonte menor; carregados de 50 em 50
    ("Carregar mais (N)").
  - Cada card é um botão que abre o `ChatModal`.
- **Etapa 2 — conversa privada** (`PrivateConversation.tsx`, usada pelo `ChatModal` quando o alvo é um usuário): balões (os meus à direita, em
  azul; os dele à esquerda, em cinza) com a hora e separador por dia ("Hoje", "Ontem", data); nas minhas, ícone de **enviada** ou **lida**
  (`read_at`) e, se agendada, "agendada <dia hora>". Rodapé fixo com `textarea` de 3 linhas: **Enter envia**, Shift+Enter quebra a linha.
  Ao abrir, carrega, rola para a última e marca as recebidas como lidas; **polling de 5 s** enquanto o modal está aberto — mensagem nova
  dele é marcada como lida e a lista rola para o fim só se a pessoa já estava no fim. Services em `services/v1/messagesChat.ts`
  (`listWith`, `markRead`, `send`, sobre rotas existentes de `messages-manager`). Sem edição, exclusão, agendamento nem anexo (Etapa 5);
  a conversa de **grupo** é a Etapa 4 (abaixo). O miolo comum (balões, rodapé, polling, rolagem) é o `ConversationPane.tsx`; a
  `PrivateConversation` e a `GroupConversation` só dizem como carregar e enviar.
- **Etapa 4 — conversa de grupo** (`GroupConversation.tsx`, usada pelo `ChatModal` quando o alvo é um grupo): balões como na privada, com o
  **nome do autor** nas mensagens dos outros; nas minhas, "lida por X de N" (`read_count`/`readers_total`) e check duplo quando todos leram.
  Carrega por `GET message-group-messages/chat/{groupId}` e marca como lidas (`PATCH chat/{groupId}/read`) ao abrir e a cada mensagem nova de
  outra pessoa; envia por `POST message-group-messages/create`. Só membro ativo.
  - **Cards de grupo** (`ChatHomePage`): badge vermelho de não lidas (`messageGroupChatView`, mesma consulta de 10 s) e grupos com não lidas
    sobem ao topo, como nos usuários. O contador do menu agora soma privadas + grupo.
  - Services: `messagesChat.ts` (`listGroup`, `markGroupRead`, `sendGroup`), `messageGroupChat.view.ts`, `messageGroupReads.{table,view}.ts`.
- **Etapa 5 — anexos, agendamento e regra do chat** (`ConversationPane`, comum à conversa privada e de grupo; **modo chat concluído**):
  - **Rodapé:** além do `textarea` (Enter envia), **clipe** (anexa um arquivo; aparece como "chip" com botão de remover) e **relógio** (abre o
    campo `datahora` do FormGrid para **agendar**; o relógio fica amarelo quando há data). Mensagem só com anexo usa o nome do arquivo como
    texto (o texto é obrigatório na API). Gravada a mensagem, o arquivo sobe em seguida; se só o anexo falhar, a mensagem existe e aparece um aviso.
  - **Balões:** anexos dentro da mensagem (`ChatAttachmentView`): imagem e vídeo inline pelo `MediaPreview` (binário via `serve` com token →
    `blob:` URL), os demais como linha com ícone, nome e tamanho (clicar baixa).
  - **Regra de estado do chat** (só aqui; a área administrativa segue irrestrita): nas **minhas** mensagens, **agendada** tem **Editar**
    (em linha: texto e data com o `datahora`) e **Cancelar**; **enviada** tem **Apagar** (com confirmação). Usa `PUT`/`DELETE messages-manager/chat/{id}`
    (`messagesChat.editMessage` e `removeMessage`); vale para privada e de grupo.
  - A mensagem agendada vencida é entregue na primeira consulta do chat (o backend envia as vencidas, sem depender do cron — e também em toda requisição autenticada, no máximo 1x/min; ver `README_modulo_messages.md` §4.5). A conversa ordena pela **data de entrega**.
- **Marcação de usuário (@) — só na conversa de GRUPO** (`GroupConversation` informa `mentionCandidates` ao `ConversationPane`: os membros ativos do
  grupo, sem o próprio usuário, via `message-group-members-view`): digitar `@` abre as **sugestões** (filtra pelo nome; setas, Tab ou Enter escolhem; Esc
  fecha); escolher insere `@Nome ` e guarda o id. Ao enviar vão só as marcações cujo `@Nome` continua no texto (`mentions: [ids]` em
  `messagesChat.sendGroup`). Nos balões, o `@Nome` aparece em destaque e a mensagem que **marca o usuário logado** ganha **borda amarela**
  (`mentionsMe`). Sem alerta separado: o destaque aparece ao abrir a conversa. A conversa privada não marca.
- **Filtro de palavrão e advertência** (2026-10-06): o dicionário é o JSON único `config/palavras-proibidas.json` (também usado pelo chat de salas e pelo PHP).
  - **Chat (privada e grupo, incluindo a edição em linha):** o `ConversationPane` usa `avisoPalavrasProibidas` (`utils/palavrasProibidas.ts`): com palavra
    proibida no texto aparece um **aviso vermelho** e o **Enviar/Salvar fica desabilitado**. **Admin isento.**
  - **Formulários administrativos de mensagem** (41, 42, 45 e 46): se o texto tiver palavra proibida, a página mostra um toast "Mensagem bloqueada" e não envia.
  - O **backend** confere de novo (um envio direto à API cai no 422, a mensagem fica `blocked` e gera advertência — ver `README_modulo_messages.md` §4.4).
  - **Lista "Advertências"** (`pages/v1/messages/message-warnings-manager/GetAllPage`, lista 41, **só admin**): Mensagem, Grupo ("Privada" se vazio), Autor, Palavra, Status da
    mensagem, Registrada em; Editar (`UpdatePage`, form 47: só a palavra) e Excluir. **Sem cadastro.** Services: `messageWarnings.{table,view}.ts`.
- **Etapa 3 — não lidas:**
  - **Cards de usuário** (`ChatHomePage`): badge vermelho com o número de mensagens não lidas dele (`messagesUsersView`, consulta a cada
    10 s; atualiza na hora ao fechar o modal). Quem tem não lidas **sobe ao topo**, do mais recente ao mais antigo; sem busca, quem ainda não
    foi carregado nas páginas entra também (nome e usuário, sem celular). Grupos: sem badge (Etapa 4).
  - **Menu:** badge com o total ao lado de "Conversas" (`/v1/message-chat`) e do pai "Mensagem" na barra superior (`Navbar.tsx`, hook
    `hooks/useUnreadMessages.ts`: `GET messages-manager/unread-count` ao montar, a cada 20 s com a aba visível e quando algo chama
    `notifyUnreadChanged()`; desligado sem sessão e para guest). O badge não aparece no Offcanvas. Consulta periódica, não tempo real.
- Services: `messageContacts.view.ts` (contatos) e `messageGroupMembershipsView` (grupos). Backend: ver `README_modulo_messages.md` §4.4.

### Anexos de mensagens — campo `arquivo` nos formulários e lista `message-attachments-manager`

Toda conversa (privada ou de grupo) aceita **um** anexo opcional, na área administrativa, em **qualquer status** da mensagem.
- **Campo:** `arquivo` (`file`, "Anexo (opcional)") do FormGrid nos formulários 41, 42, 45 e 46 — mesmo padrão do chat. O arquivo
  **não** vai no JSON: gravada a mensagem, o arquivo sobe em seguida (`messageAttachmentsUpload.upload`, multipart) com o id da mensagem.
  Se o anexo falhar, a mensagem já existe (o erro é avisado e a tela segue para a lista).
- **Criar** (`messages-manager` e `message-group-messages-manager`): usa o id devolvido (na de grupo, `messages_manager_id`).
  **Editar:** o arquivo novo **substitui** o atual (`replace`); acima do campo, `MessageAttachmentCurrent` mostra o anexo atual com
  **Baixar** e **Remover** (`pages/v1/messages/MessageAttachmentCurrent.tsx`). Abaixo do formulário de edição ele mostra o
  **carregamento da mídia** com o componente global `MediaPreview` (imagem e vídeo inline; documento, planilha, PDF e demais em
  card com ícone) e um indicador "Carregando mídia..." enquanto o binário baixa (`serve` com token, `blob:` URL liberado ao desmontar).
- **Lista** `pages/v1/messages/message-attachments-manager/GetAllPage` (lista 40, com busca): Arquivo, Tipo, Tamanho, Conversa
  (Privada/Grupo), Destino, Mensagem, Remetente, Status, Enviado em. Ações: Baixar, Abrir mensagem (leva à edição da mensagem privada
  ou de grupo — em cada linha aparece **só** a que se aplica: as duas ações levam `"hide": true` na regra e a página filtra por
  `isActionVisible`), Excluir e Visualizador de Mídias. Sem cadastro próprio. Listas 36 e 39 ganharam a coluna "Anexos" (quantidade).
- Services: `messageAttachments.{table,view,upload}.ts` (`fetchServe`/`fetchDownload` devolvem `Blob`: o `jwtauth` só lê o cabeçalho
  `Authorization`); utilitário `utils/formFile.ts` (`selectedFile`, `saveBlob`).

### Mensagens de grupo — `message-group-messages-manager`

Pasta `pages/v1/messages/message-group-messages-manager/`; caminhos em `paths.v1.messageGroupMessages` (`list`, `create`,
`update(id)` — o id é o da **ligação** mensagem-grupo). Envia uma mensagem a **todos os membros ativos** de um grupo.

- **Lista** (`GetAllPage`, lista 39, com busca): Grupo, Mensagem, Remetente, Status, Agendada para, Enviada em, Membros. Ações
  "Editar" (qualquer status) e "Excluir" (mensagem e ligação).
- **Nova** (`CreatePage`, form 45 `criar-mensagem-grupo`): select **Grupo** (remoto, com busca; só os grupos de que o usuário
  participa) / Mensagem / Agendar envio (opcional). O remetente é o usuário logado.
- **Editar** (`UpdatePage`, form 46 `editar-mensagem-grupo`): grupo travado; texto e data editáveis em qualquer status (área administrativa irrestrita).
  O registro vem de `message-group-messages-view/get/{id}`.
- Services: `messageGroupMessages.{table,view}.ts`.

CRUD de tela (regra do projeto):

- **Criar** — botão "Nova mensagem" / "Novo grupo", formulário e **Voltar**.
- **Ler** — lista paginada, ordenável, com **busca** (endpoint `.../search` do `list_manager`).
- **Editar** — ação "Editar" (mensagem: em qualquer status — área administrativa irrestrita), formulário preenchido e **Voltar**.
- **Excluir** — ação "Excluir" com confirmação (exclusão lógica) e toast com o resultado.
- **Visualizar mídia** — não se aplica ainda (mensagem e grupo sem anexo).

### Formulários completos

Os 4 formulários trazem **quase todas as colunas da tabela**; ficam de fora só `id`,
`created_at`, `updated_at` e `deleted_at`.

- **Nova mensagem:** Remetente · Destinatário / Mensagem / Status (padrão Enviada) · Agendar envio /
  Enviada em · Lida em. O remetente vem preenchido com o usuário logado (travado para não-admin).
  Escolher o "Agendar envio" copia a mesma data para "Enviada em" e "Lida em" (continuam editáveis).
- **Remetente e destinatário nunca são a mesma pessoa:** cada select bloqueia, na lista, quem foi
  escolhido no outro (`disabledValues`); o backend também recusa (422).
- **Editar mensagem:** os mesmos 7 campos preenchidos. Texto e data de envio editáveis em qualquer status (área
  administrativa irrestrita); remetente, destinatário, "Enviada em" e "Lida em" só admin (campos travados para os demais).
- **Novo grupo:** Dono (vem com o usuário logado; só admin troca) · Status (padrão Ativo) / Nome / Descrição.
- **Editar grupo:** Dono (sempre travado — o dono não muda) / Nome · Status / Descrição.

### Peças compartilhadas criadas ou alteradas

| Arquivo                                          | O que faz                                                                                                      |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `utils/formSchemaPatch.ts`                       | `fillValues` (valor inicial) e `patchFields` (desabilitar, controlar, `onChange`) por `field.name`, sem conhecer módulo |
| `components/ui/FormGrid/datahora/index.tsx`      | **Corrigido:** data e hora ficam em estado próprio mesmo no modo controlado; o aviso é calculado a cada renderização, não guardado |
| `utils/listConstructor.tsx`                      | `STATUS_BADGE_CLASS` ganhou `scheduled` (azul) e `removed` (cinza) — vale também para a lista do chat         |
| `components/layout/BookmarksBar.tsx`             | Atalho de sala de chat favorita: ícone `chat-square-text` (quadrado), para não se confundir com o redondo do menu Mensagem |
| `services/v1/messagesManager.{table,view}.ts`, `messagesUsers.view.ts`, `messageGroupsManager.{table,view}.ts` | Services REST (`createResource`); constantes em `constants/api.ts` |

### Validação feita

`npm run typecheck` e `eslint` nos arquivos do módulo, sem erros (inclui a tela Grupos ↔ Membros; essa tela ainda **não foi aberta no navegador**). O formulário "Nova Mensagem" foi
aberto no navegador pelo usuário (permitiu achar os erros de data/hora e de auto-envio, já corrigidos).

## ⚠️ Pendências — para continuar depois

1. **Tela de conversa.** Não existe. Deve reaproveitar a tela e as cores de balão do chat, listando as
   mensagens entre o usuário logado e outro (`GET messages-manager/with/{userId}`) e marcando como lidas
   ao abrir (`PATCH messages-manager/read/{userId}`). Message **não** vira chat: sem sala nem thread.
2. **Lista lateral de interlocutores.** O service `messagesUsersView` (resumo por interlocutor: total,
   não lidas, última mensagem) existe e **não tem nenhum consumidor**. É o que alimenta a lateral da tela
   de conversa; falta também um contador de não lidas (ex.: no menu).
3. ~~**Enviar para grupo.**~~ **Feito em 2026-10-06** em tela própria (seção "Mensagens de grupo"); o formulário 1 para 1 segue
   só com destinatário individual. Falta: a tela de conversa mostrar mensagens de grupo (backend, pendência 2).
4. ~~**Membros do grupo.**~~ **Feito em 2026-10-06** (seção "Grupos ↔ Membros"). Falta: "sair do grupo" pelo próprio
   membro, link da coluna "Membros" da lista de grupos para a tela de membros e teste no navegador com JWT real.
5. **Editar/Excluir aparecem para quem não pode.** A regra de negócio de uma ação (`business_rule_json`)
   só enxerga a linha, não o usuário logado: o destinatário e o membro não-dono veem os botões e recebem
   403 no toast. Solução: o backend devolver por linha "sou o remetente/dono" e a regra usar esse campo.
6. **`GetAllPage` duplicada.** As duas listas são cópia da lista de advertências do chat (mesmo desenho
   de várias telas do projeto). O princípio "nada estático, sempre componente global" pede um componente
   de lista por `slug` e `GetAllPage` só como wrapper. Hoje cada correção vale em um arquivo por vez.
7. ~~**Marcação de usuário (@)**~~ — **feita em 2026-10-06** na conversa de grupo (seção "Modo chat — Etapa 5", último item). (~~Anexos~~ **feitos em
   2026-10-06**, seção "Anexos de mensagens".)
8. **Sem teste de componente.** O projeto não tem infraestrutura (Vitest/Testing Library); as correções
   de data/hora e de auto-envio foram validadas por tipo, lint e leitura, e pelo uso no navegador.
9. **Botão DEBUG.** O preenchimento falso (`FakeFillButton`) pode escolher valores sem sentido (já gerou
   texto de lixo no campo Mensagem). Não é erro do formulário.
10. **Atenção — "Lida em" copiada do agendamento.** Por pedido do usuário, a tela copia a data do
    "Agendar envio" para "Lida em"; a mensagem agendada nasce **já lida** e não conta como não lida.
    Para contar não lidas, esvaziar "Lida em" ao agendar (ou deixar a tela de copiar essa data).
11. **Listas administrativas de Leituras e Marcações (pendente, dispensada em 2026-10-06).** O backend já tem a API completa de `message-group-reads` e
    `message-mentions` (tabela e view), mas não há lista, formulário, service de tela nem item de menu. Criar só quando o usuário pedir (modelo: lista 41
    "Advertências", só admin).

## Arquivos

- Backend: [`app/markdown/geral/README_modulo_messages.md`](../../../../../../../app/markdown/geral/README_modulo_messages.md).
- Frontend:
  - [`pages/v1/messages/messages-manager/`](../../../../pages/v1/messages/messages-manager/) — `GetAllPage`, `CreatePage`, `UpdatePage`.
  - [`pages/v1/messages/message-groups-manager/`](../../../../pages/v1/messages/message-groups-manager/) — idem, para grupos.
  - [`pages/v1/messages/message-group-members-manager/`](../../../../pages/v1/messages/message-group-members-manager/) — `GetAllPage`, `UpdatePage`, `CreateModal` (2 etapas), `GroupMembersEditor` (2 cards).
  - [`pages/v1/messages/message-group-messages-manager/`](../../../../pages/v1/messages/message-group-messages-manager/) — `GetAllPage`, `CreatePage`, `UpdatePage` (mensagem enviada a um grupo).
  - [`pages/v1/messages/message-attachments-manager/`](../../../../pages/v1/messages/message-attachments-manager/) — `GetAllPage` (lista de anexos); [`MessageAttachmentCurrent.tsx`](../../../../pages/v1/messages/MessageAttachmentCurrent.tsx) (anexo atual nos forms de edição).
  - [`pages/v1/messages/chat/`](../../../../pages/v1/messages/chat/) — `ChatHomePage` (lista de conversas), `ChatModal` e `PrivateConversation` (conversa 1 para 1 privada), `GroupConversation` (conversa de grupo), `ConversationPane` (miolo comum) e `ChatAttachmentView` (anexo no balão); [`hooks/useUnreadMessages.ts`](../../../../hooks/useUnreadMessages.ts) (contador do menu).
  - [`routes/v1/messages.routes.tsx`](../../../../routes/v1/messages.routes.tsx), entradas em [`routes/paths.ts`](../../../../routes/paths.ts).
  - [`utils/formSchemaPatch.ts`](../../../../utils/formSchemaPatch.ts), [`components/ui/FormGrid/datahora/index.tsx`](../../../../components/ui/FormGrid/datahora/index.tsx).
  - `services/v1/messagesManager.{table,view}.ts`, `messagesUsers.view.ts`, `messageGroupsManager.{table,view}.ts`.
- Rotas React documentadas em [`README_rotas_frontend.md`](../../README_rotas_frontend.md) (seção `messages`).

---

[◄ Índice da base de conhecimento](../../../README.md)

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
