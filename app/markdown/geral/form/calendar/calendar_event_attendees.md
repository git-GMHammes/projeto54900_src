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
| 1 | Usuário | `user_manager_id` | select | 8 | sim | Usuário do sistema convidado. Preenche e-mail e nome a partir do perfil. | (2026-09-25) remoto: `GET /api/v1/user-directory-view/get-no-pagination?sort=um_username&order=ASC&limit=1000` (snapshot inicial, até 1000 usuários) + `findSrc=/api/v1/user-directory-view/find`, `findColumn=um_username` (busca ao digitar ≥2 chars, alcança usuários fora do snapshot) — **não** é `user-manager-view` (esse é admin-only); ver [`user_directory_view.md`](../user/user_directory_view.md). `valueKey=id`, `labelTemplate="{um_username} — {uc_name} {uc_email}"`, `fillFields={"email":"uc_email","display_name":"uc_name"}` (ao escolher, preenche E-mail e Nome exibido; limpar a seleção esvazia os dois). Sem convidado externo desde 2026-09-24 |
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

## Alteração 2026-09-25 — busca remota liberada no campo Usuário

- Bug 1 (wiring): campo Usuário só carregava um snapshot único de todos os usuários
  ao abrir o modal (canal `src`, sem `limit`) e a digitação apenas refiltrava esse
  snapshot no navegador — usuário fora do snapshot não aparecia (0 registros), mesmo
  existindo no banco. Causa: `services/formSchema.ts::buildField()` (ramo `select`)
  não propagava `findSrc`/`findColumn` do `select_config_json` para o `<FormGrid>` —
  o canal de busca remota do `SelectField`
  (`components/ui/FormGrid/select/index.tsx`) era código morto para todo select
  vindo de `form_manager`. Corrigido: `buildField()` agora propaga as duas chaves.
- Bug 2 (permissão — causa raiz real do relato do usuário): apontar o campo para
  `api/v1/user-manager-view/*` (primeira tentativa de correção) **não funciona para
  usuário comum** — esse grupo é `adminonly` por design (`Config/Filters.php`),
  pois a view expõe status/role/telefone/CPF/endereço de qualquer usuário. Todo
  usuário não-admin recebia **403 Forbidden** silencioso (só `console.warn`, sem
  aviso na tela) em qualquer busca, inclusive antes desta mudança — não era um bug
  de configuração do select, era a política de segurança do módulo de usuários
  funcionando como projetado.
- Correção final: criado módulo novo somente leitura **user-directory-view**
  (`api/v1/user-directory-view/*`), com filtro `jwtauth` apenas (sem `adminonly`) —
  detalhe completo em [`user_directory_view.md`](../user/user_directory_view.md).
  `select_config_json` do campo (`form_fields.id = 213`) passou a ter `src` com
  `&limit=1000` (snapshot inicial maior) + `findSrc=/api/v1/user-directory-view/find`
  e `findColumn=um_username` (POST com debounce a cada busca ≥2 chars, alcança
  qualquer usuário do sistema fora do snapshot, sem expor campos sensíveis).
  UPDATE aplicado direto no banco dev (`codeigniter54900_db`), não em migration nova.

## Alteração 2026-09-25 (2) — Aceitar/Recusar convite (self-service)

Endpoint novo, exclusivo deste módulo (fora do endpoint-set padrão da
`resourceFactory`): **`PUT /api/v1/calendar-event-attendees/respond/{calendar_event_id}`**
— `Api\V1\Calendar\CalendarEventAttendees\ResourceTableController::respond`,
`Processor::respond()`, `SqlTableModel::findByUserInEvent()`. Body:
`{ "response_status": "accepted" | "declined" | "tentative" | "needsAction" }`.

- **Por que não reaproveitar `PUT update/{id}` genérico**: esse endpoint não
  checa dono/convite (ver `project_seguranca_calendario_fase1.md` da memória —
  "fora do escopo, ainda pendente"). Se o botão de aceitar/recusar chamasse
  `update/{id}` com o id do attendee, qualquer usuário logado poderia alterar
  o convite de QUALQUER outra pessoa (IDOR), não só o próprio.
- **Como o `respond` evita isso**: não recebe id de attendee do cliente — o
  back-end resolve a linha por `CurrentUser::id()` + `calendar_event_id` da
  URL (`findByUserInEvent`). 404 se o usuário logado não for convidado desse
  evento. Só a coluna `response_status` é alterada; `is_organizer`, `comment`,
  `email` etc. ficam intocados.
- **Recusar não remove o convite**: `respond()` nunca toca `deleted_at` — só
  o dono (via "Convidados" → lixeira, `deleteSoft`) remove um convidado. O
  calendário continua na lista do convidado (`idsForCurrentUser()`,
  `calendar_manager.md`) até isso acontecer.
- **Frontend**: cards de "Próximos eventos" (`GetAllPage.tsx`) — o rodapé que
  antes mostrava as ações `modal` do evento (Convidados/Lembretes/Anexos)
  agora mostra 2 ícones fixos: ✓ verde (`btn-success`, tooltip "Aceitar") e
  ✕ vermelho (`btn-danger`, tooltip "Recusar"), chamando
  `respondToEvent(ev.id, status)` (`services/v1/calendarEventAttendees.table.ts`).
  As ações antigas continuam disponíveis no modal "Ver eventos".
