[◄ Índice da base de conhecimento](../../../README.md)

---

# Cadastro de Anexo — `cadastro-anexo-evento`

Mesmo modelo de [`form/modelo_ia/form.md`](../modelo_ia/form.md): árvore revisada
aqui antes do `INSERT` (não migration, não seed).

**O que é:** formulário de `calendar_event_attachments` — um anexo de um
evento ([`calendar_events.md`](calendar_events.md)). Desenho novo, direto do
schema real.

## ⚠️ Nota — anexo por link, não por upload

Diferente do módulo `Upload` (`uploads`, ver
[`form/upload/uploads.md`](../upload/uploads.md)), aqui o anexo é só uma
**referência de URL já existente** (`file_url`) — mesma limitação de
`field_type`: `form_fields` não tem tipo "arquivo". Se o anexo precisar ser
um upload de verdade, o caminho é enviar via `uploads` primeiro e colar a
`file_url` retornada aqui.

## O registro `form_manager` (o formulário em si)

| Coluna | Valor |
| --- | --- |
| `slug` | `cadastro-anexo-evento` |
| `table_name` | `calendar_event_attachments` |
| `title` | Anexo de Evento |
| `description` | Cadastro de anexo (por link) de um evento de calendário. |
| `roles` | `["guest","user","admin"]` |
| `react_route` | `/v1/calendar-event-attachments/create` |
| `submit_endpoint` | `/api/v1/calendar-event-attachments/create` |
| `http_method` | `POST` |
| `status` | `active` |
| `version` | `1` |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
cadastro-anexo-evento
└─ Anexo
   ├─ Linha 1
   │  └─ Título
   └─ Linha 2 (campos ocultos — preenchidos pela tela)
      ├─ Evento
      ├─ URL do arquivo
      ├─ Tipo MIME
      ├─ Ícone
      └─ ID do arquivo
```

## Grupo 1 — Anexo

*slug `anexo` · icon `paperclip`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Tooltip (`help_text`) | Observação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Título | `title` | text | 12 | não | Nome exibido do anexo. Vazio = nome original do arquivo. | único campo visível; a API grava o nome original quando vazio |
| 2 | Evento | `calendar_event_id` | select | 3 | sim | Evento ao qual o anexo pertence. | **oculto** — pré-preenchido com o evento clicado |
| 2 | URL do arquivo | `file_url` | text | 3 | não | Link de visualização do arquivo enviado. Preenchido pela API a partir do upload. | **oculto**; a API grava `uploads.file_url` (serve) |
| 2 | Tipo MIME | `mime_type` | text | 2 | não | Tipo do arquivo (ex.: application/pdf). Opcional. | **oculto**; a API grava `uploads.mime_type` |
| 2 | Ícone | `icon_link` | text | 2 | não | Link do ícone exibido ao lado do anexo. Opcional. | **oculto**; sem uso — a tela escolhe o ícone pelo MIME |
| 2 | ID do arquivo | `file_id` | text | 2 | sim (API) | Id do upload (tabela uploads). Preenchido após o envio do arquivo. | **oculto**; a tela envia o id retornado por `POST /api/v1/upload-manager/upload` |

## Alteração 2026-09-24 — upload físico (modal "Anexos")

- **Arquivo:** `POST /api/v1/upload-manager/upload` com `module=calendar_events`,
  `reference_id=<evento>`, `collection=attachments` → gravado em
  `writable/uploads/calendar_events/<evento>/`. Seletor `<input type="file">` na
  tela (o FormGrid não tem `field_type` `file`); extensões = `Config/Upload.php`.
- **Anexo:** `POST /api/v1/calendar-event-attachments/create` com `file_id`. O
  `Processor` exige upload ativo do mesmo evento (422), único por anexo (409), e
  regrava `file_url`/`mime_type` do upload. Falhou o anexo → a tela apaga o upload.
- **Visualizar / Baixar:** `GET /api/v1/upload-manager/serve/{file_id}` (inline) e
  `.../download/{file_id}` (attachment) — URLs montadas com `env.apiBaseUrl`
  (`uploads.file_url` sai com o baseURL interno do backend).
- **Exclusão (o upload acompanha o anexo — padrão lógico do projeto):**

  | Ação no anexo | Anexo | Upload | Arquivo em `writable/uploads/calendar_events/<evento>/` |
  | --- | --- | --- | --- |
  | `delete-soft` (Remover na tela) | lógica | lógica → `serve`/`download` 404 | fica |
  | `delete-restore` | restaurado | restaurado → link volta | fica |
  | `delete-hard` / `clear-deleted` | física | física | apagado |

- Seed: `202609241600_seed_table.sql` (migration `SeedTable20260924Attachments`).

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
