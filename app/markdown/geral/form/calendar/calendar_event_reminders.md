[◄ Índice da base de conhecimento](../../../README.md)

---

# Cadastro de Lembrete — `cadastro-lembrete`

Mesmo modelo de [`form/modelo_ia/form.md`](../modelo_ia/form.md): árvore revisada
aqui antes do `INSERT` (não migration, não seed).

**O que é:** formulário de `calendar_event_reminders` — um lembrete de um
evento ([`calendar_events.md`](calendar_events.md)). Desenho novo, direto do
schema real.

## O registro `form_manager` (o formulário em si)

| Coluna | Valor |
| --- | --- |
| `slug` | `cadastro-lembrete` |
| `table_name` | `calendar_event_reminders` |
| `title` | Lembrete |
| `description` | Cadastro de lembrete de um evento de calendário. |
| `roles` | `["guest","user","admin"]` |
| `react_route` | `/v1/calendar-event-reminders/create` |
| `submit_endpoint` | `/api/v1/calendar-event-reminders/create` |
| `http_method` | `POST` |
| `status` | `active` |
| `version` | `1` |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
cadastro-lembrete
└─ Lembrete
   └─ Linha 1
      ├─ Evento
      ├─ Método
      └─ Minutos antes
```

## Grupo 1 — Lembrete

*slug `lembrete` · icon `bell`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Evento | `calendar_event_id` | select | 6 | sim | remoto: `GET /api/v1/calendar-events/get-no-pagination`, `valueKey=id`, `labelTemplate="{summary} #{id}"` |
| 1 | Método | `method` | select | 3 | não | opções (coluna `enum`): E-mail (`email`), Notificação (`popup`) |
| 1 | Minutos antes | `minutes` | text | 3 | sim | `input_mode=numeric`; placeholder `30` |

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
