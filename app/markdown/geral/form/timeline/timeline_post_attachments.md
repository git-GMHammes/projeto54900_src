[◄ Índice da base de conhecimento](../../../README.md)

---

# Anexo do post — `timeline-attachment`

Mesmo modelo de [`form/menu/menu_manager.md`](../menu/menu_manager.md): árvore
revisada aqui antes do `INSERT` (não migration, não seed — ver aviso em
[`README_modulo_form.md`](../../README_modulo_form.md)).

**O que é:** formulário de `timeline_post_attachments` — o anexo de uma
publicação da timeline ([`timeline_posts.md`](timeline_posts.md)). Tabela
**própria e isolada** do módulo Timeline: não usa o módulo Upload e não encosta no
Calendar (decisão do usuário em 2026-09-26). Espelho de estrutura:
[`form/calendar/calendar_event_attachments.md`](../calendar/calendar_event_attachments.md).

## O registro `form_manager` (o formulário em si)

| Coluna | Valor |
| --- | --- |
| `slug` | `timeline-attachment` |
| `table_name` | `timeline_post_attachments` |
| `title` | Anexo do Post |
| `description` | Metadados do anexo de uma publicação da timeline — título, ordem e status. O arquivo em si é enviado pela tela. |
| `roles` | `["user","admin"]` |
| `react_route` | `/v1/timeline-post-attachments/update` (previsto — Etapa D) |
| `submit_endpoint` | `/api/v1/timeline-post-attachments/update/{id}` (previsto) |
| `http_method` | `PUT` |
| `status` | `active` |
| `version` | `1` |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
timeline-attachment
└─ Anexo
   ├─ Linha 1
   │  ├─ Título
   │  ├─ Ordem
   │  └─ Status
   └─ Linha 2 (campos ocultos — preenchidos pela tela no envio)
      ├─ Publicação
      ├─ Chave do arquivo
      ├─ Nome original
      ├─ Nome armazenado
      ├─ Caminho
      ├─ URL do arquivo
      ├─ Tipo MIME
      ├─ Extensão
      ├─ Tamanho
      ├─ Checksum
      └─ Categoria
```

## Grupo 1 — Anexo (`timeline_post_attachments`)

_slug `attachment` · icon `paperclip`_

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Tooltip (`help_text`) | Observação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Título | `title` | text | 6 | não | Nome exibido do anexo. Vazio = nome original do arquivo. | campo visível; a API grava o nome original quando vazio |
| 1 | Ordem | `sort_order` | text | 3 | não | Ordem de exibição na publicação. | `input_mode=numeric` |
| 1 | Status | `status` | radio | 3 | não | Item ativo aparece na publicação. | `inline=1`; Ativo (`active`), Inativo (`inactive`) |
| 2 | Publicação | `timeline_post_id` | select | 4 | sim | Publicação dona do anexo. | **oculto** — pré-preenchido com o post clicado |
| 2 | Chave do arquivo | `file_key` | text | 3 | sim (API) | Identificador curto do arquivo. | **oculto** — gerado no envio |
| 2 | Nome original | `original_name` | text | 3 | sim (API) | Nome do arquivo como o usuário enviou. | **oculto** |
| 2 | Nome armazenado | `stored_name` | text | 3 | não | Nome no disco. | **oculto** — `<file_key><AAAAMMDDHHMMSS>.<ext>` |
| 2 | Caminho | `storage_path` | text | 3 | sim (API) | Caminho relativo dentro de `writable/`. | **oculto** |
| 2 | URL do arquivo | `file_url` | text | 6 | não | URL de visualização do arquivo. | **oculto** — montada a partir do baseURL da API |
| 2 | Tipo MIME | `mime_type` | text | 3 | não | Tipo do arquivo (ex.: `application/pdf`). | **oculto** |
| 2 | Extensão | `extension` | text | 3 | não | Extensão do arquivo (ex.: `pdf`). | **oculto** |
| 2 | Tamanho | `file_size` | text | 3 | não | Tamanho em bytes. | **oculto**; `input_mode=numeric` |
| 2 | Checksum | `checksum_sha256` | text | 3 | não | Hash SHA-256 do arquivo. | **oculto** |
| 2 | Categoria | `category` | select | 3 | não | Categoria do arquivo. | **oculto**; opções = enum da coluna (`image`…`other`) |
| 2 | Descrição | `description` | textarea | 3 | não | Texto livre sobre o anexo. | **oculto**; `rows: 2` |

## Upload do arquivo (fora do formulário)

O `FormGrid` não tem `field_type` de arquivo — o seletor é da **tela**, e os
metadados caem nesta tabela. Previsão para a Etapa D:

- **Envio:** `POST /api/v1/timeline-post-attachments/upload` (multipart) com
  `timeline_post_id` → grava em
  `writable/uploads/timeline_posts/<post_id>/`. É uma **rota extra sancionada**
  (como o `upload-manager` tem as suas 3); extensões e limites em
  `Config/Upload.php`.
- **Visualizar / baixar:** rotas `serve` e `download` do próprio módulo — sem
  depender do `upload-manager`.
- **Exclusão:** `delete-soft` é lógica e **não** apaga o arquivo físico;
  `delete-hard`/`clear-deleted` apagam. Mesmo ciclo de vida do Calendar.

## Próximo passo

Revisar e então gerar o `INSERT` (`form_manager` → `form_groups` → `form_rows` →
`form_fields`) a partir exatamente desta tabela — mesmo fluxo de
`nav_manager.md`/`menu_manager.md`. Antes do `INSERT`: conferir se
`/api/v1/timeline-post-attachments/update/{id}` já existe em `route_manager`
(checklist do
[`README_campo_select_rota.md`](../../../frontend/projeto54900/src/markdown/geral/README_campo_select_rota.md)).

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
