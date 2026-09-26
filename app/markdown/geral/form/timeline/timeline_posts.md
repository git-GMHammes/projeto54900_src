[◄ Índice da base de conhecimento](../../../README.md)

---

# Publicação — `timeline-post`

Mesmo modelo de [`form/menu/menu_manager.md`](../menu/menu_manager.md): árvore
revisada aqui antes do `INSERT` (não migration, não seed — ver aviso em
[`README_modulo_form.md`](../../README_modulo_form.md)).

**O que é:** formulário de `timeline_posts` — a publicação da timeline (texto,
com ou sem anexos). Cobre também a **republicação**: preenchendo `repost_of_id`,
a publicação passa a ser um repost e aponta para a original. É o formulário
principal do módulo — ver
[`README_modulo_timeline.md`](../../README_modulo_timeline.md) para o modelo de
dados completo.

**Anexo não é campo deste formulário.** O `FormGrid` não tem `field_type` de
arquivo: o seletor de arquivo é da tela, e os metadados do anexo moram na tabela
própria `timeline_post_attachments` — desenho em
[`timeline_post_attachments.md`](timeline_post_attachments.md). A tabela é
**isolada**: não usa o módulo Upload e não encosta no Calendar. O form cuida do
texto.

`user_manager_id` (dono) e `published_at`/`edited_at` não são campos — vêm da
sessão e do Processor, respectivamente. A timeline do usuário é criada
automaticamente na primeira publicação.

## O registro `form_manager` (o formulário em si)

| Coluna | Valor |
| --- | --- |
| `slug` | `timeline-post` |
| `table_name` | `timeline_posts` |
| `title` | Publicação |
| `description` | Nova publicação na timeline — texto, anexos (tabela própria do módulo) e republicação de uma publicação existente. |
| `roles` | `["user","admin"]` |
| `react_route` | `/v1/timeline-posts/create` (previsto — Etapa D) |
| `submit_endpoint` | `/api/v1/timeline-posts/create` (previsto) |
| `http_method` | `POST` |
| `status` | `active` |
| `version` | `1` |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
timeline-post
└─ Publicação (timeline_posts)
   ├─ Linha 1
   │  ├─ Timeline
   │  └─ Republicar de
   ├─ Linha 2
   │  └─ Título
   ├─ Linha 3
   │  └─ Publicação
   └─ Linha 4
      └─ Status
```

## Grupo 1 — Publicação (`timeline_posts`)

_slug `post` · icon `collection`_

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Timeline | `timeline_manager_id` | select | 6 | não | remoto: `GET /api/v1/timeline-manager/get-no-pagination`, `valueKey=id`, `labelTemplate="{title} #{id}"`; help: "Vazio = a sua timeline (criada automaticamente na primeira publicação)." |
| 1 | Republicar de | `repost_of_id` | select | 6 | não | remoto: `GET /api/v1/timeline-posts/get-no-pagination`, `valueKey=id`, `labelTemplate="Publicação #{id}"`; help: "Preenchido = republicação: esta publicação aponta para a original e aparece na sua timeline." |
| 2 | Título | `title` | text | 12 | não | opcional — a publicação pode ser só texto |
| 3 | Publicação | `content` | textarea | 12 | sim | `rows: 4`, `showCounter`; o teto de caracteres entra no `CreateRequest` (Etapa D) |
| 4 | Status | `status` | radio | 12 | não | `inline=1`; opções: Rascunho (`draft`), Publicada (`published`), Ocultada (`hidden`) |

Observações de negócio (Processor, Etapa D):

- `repost_of_id` não pode apontar para a própria publicação nem criar ciclo, e a
  original precisa estar `published` e não removida.
- `published_at` = `NOW()` quando o status é `published` e o campo vem vazio;
  `edited_at` = `NOW()` ao editar `title`/`content`.
- `removed` (quarto valor do enum) é resultado de **moderação**, não uma opção de
  status no formulário do usuário.

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
