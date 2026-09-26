[◄ Índice da base de conhecimento](../../../README.md)

---

# Comentário — `timeline-comment`

Mesmo modelo de [`form/menu/menu_manager.md`](../menu/menu_manager.md): árvore
revisada aqui antes do `INSERT` (não migration, não seed — ver aviso em
[`README_modulo_form.md`](../../README_modulo_form.md)).

**O que é:** formulário de `timeline_post_comments` — o comentário de uma
publicação, com resposta opcional via `parent_id` (auto-relacionamento, mesmo
padrão de `menu_manager.parent_id`). Só comenta quem está logado; o autor
(`user_manager_id`) vem da sessão, não é campo. Modelo de dados completo em
[`README_modulo_timeline.md`](../../README_modulo_timeline.md).

`status` **não** é campo deste formulário: a criação nasce `published` e
esconder/remover é moderação (rota de update com `adminonly` ou pelo autor).
`edited_at` é do Processor.

## O registro `form_manager` (o formulário em si)

| Coluna | Valor |
| --- | --- |
| `slug` | `timeline-comment` |
| `table_name` | `timeline_post_comments` |
| `title` | Comentário |
| `description` | Comentário em uma publicação da timeline, com resposta a outro comentário. |
| `roles` | `["user","admin"]` |
| `react_route` | `/v1/timeline-post-comments/create` (previsto — Etapa D) |
| `submit_endpoint` | `/api/v1/timeline-post-comments/create` (previsto) |
| `http_method` | `POST` |
| `status` | `active` |
| `version` | `1` |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
timeline-comment
└─ Comentário (timeline_post_comments)
   ├─ Linha 1
   │  └─ Publicação
   ├─ Linha 2
   │  └─ Responder a
   └─ Linha 3
      └─ Comentário
```

## Grupo 1 — Comentário (`timeline_post_comments`)

_slug `comment` · icon `chat-dots`_

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Publicação | `timeline_post_id` | select | 12 | sim | remoto: `GET /api/v1/timeline-posts/get-no-pagination`, `valueKey=id`, `labelTemplate="Publicação #{id}"`; help: "Publicação que recebe o comentário." |
| 2 | Responder a | `parent_id` | select | 12 | não | remoto: `GET /api/v1/timeline-post-comments/get-no-pagination`, `valueKey=id`, `labelTemplate="Comentário #{id}"`; help: "Vazio = comentário de topo. Preenchido = resposta a este comentário." |
| 3 | Comentário | `content` | textarea | 12 | sim | `rows: 3`, `showCounter`; o teto de caracteres entra no `CreateRequest` (Etapa D) |

Observações de negócio (Processor, Etapa D):

- Se `parent_id` vier preenchido, validar que o pai pertence ao **mesmo**
  `timeline_post_id` (senão a resposta apareceria em outra publicação).
- Comentário de comentário de outro post é erro, não subnível novo: a árvore é
  rasa (`parent_id` é um nível de resposta).
- Não há like/estrela em comentário nesta etapa.

## Próximo passo

Revisar e então gerar o `INSERT` (`form_manager` → `form_groups` → `form_rows` →
`form_fields`) a partir exatamente desta tabela — mesmo fluxo de
`nav_manager.md`/`menu_manager.md`. Antes do `INSERT`: conferir os endpoints de
`src` e o `submit_endpoint` contra `route_manager` (checklist do
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
