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
   │  ├─ Evento
   │  └─ Status de resposta
   ├─ Linha 2
   │  ├─ E-mail
   │  └─ Nome exibido
   ├─ Linha 3
   │  ├─ É organizador
   │  ├─ É o próprio usuário
   │  ├─ É recurso
   │  └─ É opcional
   └─ Linha 4
      └─ Comentário
```

## Grupo 1 — Convidado

*slug `convidado` · icon `person-check`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Evento | `calendar_event_id` | select | 8 | sim | remoto: `GET /api/v1/calendar-events/get-no-pagination`, `valueKey=id`, `labelTemplate="{summary} #{id}"` |
| 1 | Status de resposta | `response_status` | select | 4 | não | opções (coluna `enum`): Sem resposta (`needsAction`), Recusou (`declined`), Talvez (`tentative`), Aceitou (`accepted`) |
| 2 | E-mail | `email` | email | 6 | sim | — |
| 2 | Nome exibido | `display_name` | text | 6 | não | — |
| 3 | É organizador | `is_organizer` | checkbox | 3 | não | opção única "Sim" |
| 3 | É o próprio usuário | `is_self` | checkbox | 3 | não | opção única "Sim" |
| 3 | É recurso | `is_resource` | checkbox | 3 | não | opção única "Sim"; help: "Sala/equipamento em vez de pessoa." |
| 3 | É opcional | `is_optional` | checkbox | 3 | não | opção única "Sim" |
| 4 | Comentário | `comment` | text | 12 | não | `max_length=500` |

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
