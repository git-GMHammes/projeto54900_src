[◄ Índice da base de conhecimento](../../../README.md)

---

# Cadastro de Convidado — `cadastro-convidado`

Mesmo modelo de [`form/modelo_ia/form.md`](../modelo_ia/form.md): árvore revisada
aqui antes do `INSERT` (não migration, não seed).

**O que é:** formulário de `calendar_event_attendees` — um convidado de um
evento ([`calendar_events.md`](calendar_events.md)). Desenho novo, direto do
schema real.

## O registro `form_manager` (o formulário em si)

| Coluna | Valor |
| --- | --- |
| `slug` | `cadastro-convidado` |
| `table_name` | `calendar_event_attendees` |
| `title` | Convidado |
| `description` | Cadastro de convidado de um evento de calendário. |
| `roles` | `["guest","user","admin"]` |
| `react_route` | `/v1/calendar-event-attendees/create` |
| `submit_endpoint` | `/api/v1/calendar-event-attendees/create` |
| `http_method` | `POST` |
| `status` | `active` |
| `version` | `1` |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
cadastro-convidado
└─ Convidado
   ├─ Linha 1
   │  ├─ Usuário
   │  └─ Status de resposta
   ├─ Linha 2
   │  ├─ E-mail
   │  └─ Nome exibido
   ├─ Linha 3
   │  ├─ É organizador
   │  ├─ É o próprio usuário
   │  ├─ É recurso
   │  └─ É opcional
   ├─ Linha 4
   │  └─ Comentário
   └─ Linha 5 (campos ocultos)
      └─ Evento (oculto)
```

## Grupo 1 — Convidado

*slug `convidado` · icon `person-check`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Tooltip (`help_text`) | Observação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Usuário | `user_manager_id` | select | 8 | sim | Usuário do sistema convidado. Preenche e-mail e nome a partir do perfil. | (2026-09-24) remoto: `GET /api/v1/user-manager-view/get-no-pagination?sort=um_username&order=ASC`, `valueKey=id`, `labelTemplate="{um_username} — {uc_name} {uc_email}"`, `fillFields={"email":"uc_email","display_name":"uc_name"}` (ao escolher, preenche E-mail e Nome exibido; limpar a seleção esvazia os dois). Sem convidado externo desde 2026-09-24 |
| 1 | Status de resposta | `response_status` | select | 4 | sim | Resposta do convidado ao convite. Novos convites começam em "Sem resposta". | `default_value=needsAction` (Sem resposta — é um convite). Opções (coluna `enum`): Sem resposta (`needsAction`), Recusou (`declined`), Talvez (`tentative`), Aceitou (`accepted`) |
| 2 | E-mail | `email` | email | 6 | sim | E-mail do perfil do usuário escolhido. Preenchido automaticamente. | `read_only=1`; vem de `uc_email` (fillFields). A API grava sempre `user_profiles.email` |
| 2 | Nome exibido | `display_name` | text | 6 | sim | Nome do perfil do usuário escolhido. Preenchido automaticamente. | `read_only=1`; vem de `uc_name` (fillFields). A API grava sempre `user_profiles.name` |
| 3 | É organizador | `is_organizer` | checkbox | 3 | não | Marque se esta pessoa organiza o evento. | opção única "Sim" |
| 3 | É o próprio usuário | `is_self` | checkbox | 3 | não | Marque se o convidado é o dono do calendário. | opção única "Sim" |
| 3 | É recurso | `is_resource` | checkbox | 3 | não | Sala/equipamento em vez de pessoa. | opção única "Sim"; help: "Sala/equipamento em vez de pessoa." |
| 3 | É opcional | `is_optional` | checkbox | 3 | não | Presença opcional: o convidado não é obrigatório no evento. | opção única "Sim" |
| 4 | Comentário | `comment` | textarea | 12 | não | Observação sobre o convite. Aceita texto longo. | `rows_qty=5`, sem `max_length`; coluna `TEXT` (API aceita até 16383 caracteres) |
| 5 | Evento | `calendar_event_id` | select | 12 | sim | Evento ao qual o convite pertence. Preenchido automaticamente. | **oculto** (`is_hidden=1`, 2026-09-24), em linha própria — campo oculto também conta na soma de `col` da linha (máx. 12): a tela `/v1/calendar-manager` pré-preenche com o evento clicado. Remoto: `GET /api/v1/calendar-events/get-no-pagination`, `valueKey=id`, `labelTemplate="{summary} #{id}"` |

## Próximo passo

Revisar e então gerar o `INSERT` a partir exatamente desta tabela.

---

[◄ Índice da base de conhecimento](../../../README.md)

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |

## Alteração 2026-09-24 — vínculo com usuário do sistema

- DDL: `calendar_event_attendees.user_manager_id` (BIGINT NULL, FK → `user_manager.id`,
  `ON DELETE SET NULL`) — `app/Database/Migrations/202609241300_alter_table.sql`.
- Seed: campo **Usuário**, **Evento** oculto em linha própria, ação **Convidados** no
  list_manager `calendar-events-view` e `help_text` (tooltip) de todos os campos dos
  forms filhos do calendário — `app/Database/Migrations/202609241301_seed_table.sql`.
- API (`Processor`): mesmo usuário 2× no evento → 409. Regra de e-mail/nome
  substituída pela alteração (2) abaixo.

## Alteração 2026-09-24 (2) — regras dos campos

- Usuário, Status de resposta e Nome exibido obrigatórios; Status padrão `needsAction`.
- **Sem convidado externo**: `user_manager_id` obrigatório no `create`; a API ignora
  e-mail/nome do payload e grava sempre os do perfil (`user_profiles`). Perfil sem
  e-mail ou nome → 422.
- `comment` virou `TEXT` (`202609241400_alter_table.sql`, migration
  `AlterTable20260924Comment`); campo textarea de 5 linhas.
