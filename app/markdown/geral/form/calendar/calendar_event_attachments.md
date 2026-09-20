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
   │  ├─ Evento
   │  └─ Título
   ├─ Linha 2
   │  └─ URL do arquivo
   └─ Linha 3
      ├─ Tipo MIME
      ├─ Ícone
      └─ ID do arquivo
```

## Grupo 1 — Anexo

*slug `anexo` · icon `paperclip`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Evento | `calendar_event_id` | select | 8 | sim | remoto: `GET /api/v1/calendar-events/get-no-pagination`, `valueKey=id`, `labelTemplate="{summary} #{id}"` |
| 1 | Título | `title` | text | 4 | não | — |
| 2 | URL do arquivo | `file_url` | text | 12 | sim | placeholder `https://...` |
| 3 | Tipo MIME | `mime_type` | text | 4 | não | placeholder `application/pdf` |
| 3 | Ícone | `icon_link` | text | 4 | não | placeholder `https://.../icon.png` |
| 3 | ID do arquivo | `file_id` | text | 4 | não | help: "ID externo (ex.: Google Drive), se aplicável." |

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
