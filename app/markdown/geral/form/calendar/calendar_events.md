[◄ Índice da base de conhecimento](../../../README.md)

---

# Cadastro de Evento — `cadastro-evento`

Mesmo modelo de [`form/modelo_ia/form.md`](../modelo_ia/form.md): árvore revisada
aqui antes do `INSERT` (não migration, não seed).

**O que é:** formulário de `calendar_events` — um evento dentro de um
calendário ([`calendar_manager.md`](calendar_manager.md)). Desenho novo,
direto do schema real (`DESCRIBE calendar_events`).

## ⚠️ Colunas excluídas de propósito — campos de sincronização

`google_event_id`, `ical_uid`, `recurring_event_id`, `html_link`,
`google_created_at`, `google_updated_at` existem na tabela mas são
preenchidos por uma futura sincronização com o Google Calendar — não fazem
sentido como campo digitado por humano num evento criado localmente. Ficam
fora do formulário.

## O registro `form_manager` (o formulário em si)

| Coluna | Valor |
| --- | --- |
| `slug` | `cadastro-evento` |
| `table_name` | `calendar_events` |
| `title` | Evento |
| `description` | Cadastro de evento dentro de um calendário. |
| `roles` | `["guest","user","admin"]` |
| `react_route` | `/v1/calendar-events/create` |
| `submit_endpoint` | `/api/v1/calendar-events/create` |
| `http_method` | `POST` |
| `status` | `active` |
| `version` | `1` |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
cadastro-evento
├─ Principal
│  ├─ Linha 1
│  │  ├─ Calendário
│  │  └─ Status
│  ├─ Linha 2
│  │  └─ Título
│  └─ Linha 3
│     ├─ Descrição
│     └─ Local
├─ Data e Hora
│  ├─ Linha 1
│  │  ├─ Data de início
│  │  ├─ Data/hora de início
│  │  └─ Fuso de início
│  └─ Linha 2
│     ├─ Data de término
│     ├─ Data/hora de término
│     └─ Fuso de término
├─ Recorrência
│  └─ Linha 1
│     ├─ Regra de recorrência
│     └─ Sequência
├─ Visibilidade e Aparência
│  └─ Linha 1
│     ├─ Transparência
│     ├─ Visibilidade
│     ├─ Cor
│     └─ Tipo de evento
└─ Convidados
   └─ Linha 1
      ├─ Convidados podem editar
      ├─ Convidados podem convidar outros
      ├─ Convidados veem outros convidados
      └─ Qualquer um pode se adicionar
```

## Grupo 1 — Principal

*slug `principal` · icon `calendar-event`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Calendário | `calendar_id` | select | 8 | sim | remoto: `GET /api/v1/calendar-manager/get-no-pagination`, `valueKey=id`, `labelTemplate="{summary} #{id}"` |
| 1 | Status | `status` | select | 4 | não | opções (coluna `enum`): Confirmado (`confirmed`), Provisório (`tentative`), Cancelado (`cancelled`) |
| 2 | Título | `summary` | text | 12 | sim | placeholder "Ex: Reunião de alinhamento" |
| 3 | Descrição | `description` | textarea | 6 | não | `rows_qty=3` |
| 3 | Local | `location` | text | 6 | não | — |

## Grupo 2 — Data e Hora

*slug `data-e-hora` · icon `clock-history`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Data de início | `start_date` | data | 4 | não | help: "Preencher OU esta, OU 'Data/hora de início' — evento de dia inteiro usa só a data." |
| 1 | Data/hora de início | `start_datetime` | data | 4 | não | `with_seconds=0` |
| 1 | Fuso de início | `start_time_zone` | text | 4 | não | placeholder `America/Sao_Paulo` |
| 2 | Data de término | `end_date` | data | 4 | não | — |
| 2 | Data/hora de término | `end_datetime` | data | 4 | não | — |
| 2 | Fuso de término | `end_time_zone` | text | 4 | não | placeholder `America/Sao_Paulo` |

## Grupo 3 — Recorrência

*slug `recorrencia` · icon `arrow-repeat`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Regra de recorrência | `recurrence` | textarea | 8 | não | `rows_qty=2`; placeholder `RRULE:FREQ=WEEKLY;COUNT=10`; help: "Formato RRULE (iCalendar), texto livre." |
| 1 | Sequência | `sequence` | text | 4 | não | `input_mode=numeric`; placeholder `0` |

## Grupo 4 — Visibilidade e Aparência

*slug `visibilidade-e-aparencia` · icon `eye`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Transparência | `transparency` | select | 3 | não | opções (coluna `enum`): Ocupado (`opaque`), Livre (`transparent`) |
| 1 | Visibilidade | `visibility` | select | 3 | não | opções (coluna `enum`): Padrão (`default`), Público (`public`), Privado (`private`), Confidencial (`confidential`) |
| 1 | Cor | `color_id` | text | 3 | não | placeholder "ID de cor do Google Calendar (1-11)" |
| 1 | Tipo de evento | `event_type` | select | 3 | não | opções (coluna `enum`): Padrão (`default`), Fora do escritório (`outOfOffice`), Foco (`focusTime`), Local de trabalho (`workingLocation`), Aniversário (`birthday`) |

## Grupo 5 — Convidados

*slug `convidados` · icon `people`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Convidados podem editar | `guests_can_modify` | checkbox | 3 | não | opção única "Sim" |
| 1 | Convidados podem convidar outros | `guests_can_invite_others` | checkbox | 3 | não | opção única "Sim"; default real da coluna é `1` (marcado) |
| 1 | Convidados veem outros convidados | `guests_can_see_other_guests` | checkbox | 3 | não | opção única "Sim"; default real da coluna é `1` (marcado) |
| 1 | Qualquer um pode se adicionar | `anyone_can_add_self` | checkbox | 3 | não | opção única "Sim" |

## Próximo passo

Revisar e então gerar o `INSERT` a partir exatamente destas tabelas.

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
