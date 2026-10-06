[◄ Índice da base de conhecimento](../../../README.md)

---

# Módulo `messages` — frontend: estado atual e pendências

Mensagens diretas entre usuários (1 para 1 e 1 para grupo), com agendamento. Usa a
aparência e a forma de envio do chat, mas **Message NUNCA é um chat**: não há sala nem
conversa. Hoje o frontend tem as **listas com busca e o CRUD de tela** de mensagens e de
grupos; a **tela de conversa** (estilo chat/WhatsApp) ainda **não existe**. Detalhe técnico
do backend (tabelas, regras, rotas, scripts) em
[`app/markdown/geral/README_modulo_messages.md`](../../../../../../../app/markdown/geral/README_modulo_messages.md).

## ✅ O que está pronto

### Menu (banco, não código)

| Item                                | Registro                              | Rota                         |
| ----------------------------------- | ------------------------------------- | ---------------------------- |
| **Mensagem** (pai, ícone `chat-dots`, redondo) | `menu_manager` 47          | —                            |
| **Lista**                           | `menu_manager` 48                     | `/v1/messages-manager`       |
| **Grupos**                          | `menu_manager` 49                     | `/v1/message-groups-manager` |

Roles `user` e `admin`. Menu e lista vêm do banco (`menu_manager`, `list_manager`); nenhum item
foi escrito direto em `Navbar.tsx`.

### Telas (3 por recurso)

| Recurso                        | Lista com busca                | Cadastro                              | Edição                                      |
| ------------------------------ | ------------------------------ | ------------------------------------- | ------------------------------------------- |
| Mensagens (`messages-manager`) | `GetAllPage` — lista 36        | `CreatePage` — form 41                | `UpdatePage` — form 42                      |
| Grupos (`message-groups-manager`) | `GetAllPage` — lista 37     | `CreatePage` — form 43                | `UpdatePage` — form 44                      |

Todas em `pages/v1/messages/<recurso>/`, rotas em `routes/v1/messages.routes.tsx` (montadas em
`routes/v1/index.tsx`), caminhos em `paths.v1.messagesManager` e `paths.v1.messageGroupsManager`.

CRUD de tela (regra do projeto):

- **Criar** — botão "Nova mensagem" / "Novo grupo", formulário e **Voltar**.
- **Ler** — lista paginada, ordenável, com **busca** (endpoint `.../search` do `list_manager`).
- **Editar** — ação "Editar" (mensagem: só se `mm_status = scheduled`), formulário preenchido e **Voltar**.
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
- **Editar mensagem:** os mesmos 7 campos preenchidos. Não-admin só edita texto e data de envio, e só
  enquanto agendada (campos travados na tela); remetente, destinatário, "Enviada em" e "Lida em" só admin.
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

`npm run typecheck` e `eslint` nos arquivos do módulo, sem erros. O formulário "Nova Mensagem" foi
aberto no navegador pelo usuário (permitiu achar os erros de data/hora e de auto-envio, já corrigidos).

## ⚠️ Pendências — para continuar depois

1. **Tela de conversa.** Não existe. Deve reaproveitar a tela e as cores de balão do chat, listando as
   mensagens entre o usuário logado e outro (`GET messages-manager/with/{userId}`) e marcando como lidas
   ao abrir (`PATCH messages-manager/read/{userId}`). Message **não** vira chat: sem sala nem thread.
2. **Lista lateral de interlocutores.** O service `messagesUsersView` (resumo por interlocutor: total,
   não lidas, última mensagem) existe e **não tem nenhum consumidor**. É o que alimenta a lateral da tela
   de conversa; falta também um contador de não lidas (ex.: no menu).
3. **Enviar para grupo.** O formulário só tem destinatário individual. Falta o campo **Grupo** (escolha
   entre destinatário **ou** grupo) — depende do backend (envio para grupo e visibilidade da mensagem de
   grupo, ver o README do backend, pendências 1 e 2).
4. **Membros do grupo.** Sem API e sem tela; a coluna "Membros" da lista de grupos só conta. Precisa de
   lista/cadastro de `message_group_members` e, na tela de grupo, ver e gerenciar os membros.
5. **Editar/Excluir aparecem para quem não pode.** A regra de negócio de uma ação (`business_rule_json`)
   só enxerga a linha, não o usuário logado: o destinatário e o membro não-dono veem os botões e recebem
   403 no toast. Solução: o backend devolver por linha "sou o remetente/dono" e a regra usar esse campo.
6. **`GetAllPage` duplicada.** As duas listas são cópia da lista de advertências do chat (mesmo desenho
   de várias telas do projeto). O princípio "nada estático, sempre componente global" pede um componente
   de lista por `slug` e `GetAllPage` só como wrapper. Hoje cada correção vale em um arquivo por vez.
7. **Marcação de usuário (@) e anexos** — dependem do backend; a tela repetirá o `select multiple` de
   menção e o campo `arquivo` do chat, com o Visualizador de Mídias.
8. **Sem teste de componente.** O projeto não tem infraestrutura (Vitest/Testing Library); as correções
   de data/hora e de auto-envio foram validadas por tipo, lint e leitura, e pelo uso no navegador.
9. **Botão DEBUG.** O preenchimento falso (`FakeFillButton`) pode escolher valores sem sentido (já gerou
   texto de lixo no campo Mensagem). Não é erro do formulário.
10. **Atenção — "Lida em" copiada do agendamento.** Por pedido do usuário, a tela copia a data do
    "Agendar envio" para "Lida em"; a mensagem agendada nasce **já lida** e não conta como não lida.
    Para contar não lidas, esvaziar "Lida em" ao agendar (ou deixar a tela de copiar essa data).

## Arquivos

- Backend: [`app/markdown/geral/README_modulo_messages.md`](../../../../../../../app/markdown/geral/README_modulo_messages.md).
- Frontend:
  - [`pages/v1/messages/messages-manager/`](../../../../pages/v1/messages/messages-manager/) — `GetAllPage`, `CreatePage`, `UpdatePage`.
  - [`pages/v1/messages/message-groups-manager/`](../../../../pages/v1/messages/message-groups-manager/) — idem, para grupos.
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
