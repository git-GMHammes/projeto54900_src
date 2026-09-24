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
   ├─ Linha 1
   │  ├─ Método
   │  └─ Minutos antes
   └─ Linha 2 (campos ocultos)
      └─ Evento (oculto)
```

## Grupo 1 — Lembrete

*slug `lembrete` · icon `bell`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Tooltip (`help_text`) | Observação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Método | `method` | select | 6 | sim | Como avisar: por e-mail ou por notificação na tela. | `default_value=popup`. Opções (coluna `enum`): E-mail (`email`), Notificação (`popup`). Nenhum dos dois dispara ainda (sem agendador) |
| 1 | Minutos antes | `minutes` | select | 6 | sim | Com quanto tempo de antecedência do início o aviso dispara. | `default_value=30`. Lista fixa (como no Google): 5, 10, 30 min, 1 h (`60`), 1 dia (`1440`), 1 semana (`10080`). A API recusa outro valor (422) |
| 2 | Evento | `calendar_event_id` | select | 12 | sim | Evento que vai disparar o lembrete. | **oculto** (`is_hidden=1`) em linha própria — a tela `/v1/calendar-manager` pré-preenche com o evento clicado. Remoto: `GET /api/v1/calendar-events/get-no-pagination`, `valueKey=id`, `labelTemplate="{summary} #{id}"` |

## Alteração 2026-09-24 — modal "Lembretes"

- Tela: `/v1/calendar-manager` → "Ver eventos" → ação **Lembretes** (ícone `bell`).
- Seed: `app/Database/Migrations/202609241500_seed_table.sql` (migration
  `SeedTable20260924Reminders`).
- API: `minutes` só aceita a lista fixa (`CreateRequest::MINUTES_OPTIONS`);
  mesmo evento + método + minutos → 409 (já existia).

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
