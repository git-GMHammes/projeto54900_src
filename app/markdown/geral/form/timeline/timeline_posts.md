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
   ├─ Linha 3
   │  └─ Publicação
   └─ Linha 4
      └─ Anexo
```

> **Form enxuto — 2026-09-28** (pedido do usuário: "como em qualquer rede
> social", só texto + anexo). Timeline, Republicar de, Título e Status saíram
> do FORM por soft delete (`form_fields` 221/222/223/225, `form_rows`
> 133/134/136 — SQL `doc/sql/insert/20260928084335_timeline_post_form_enxuto.sql`).
> As **colunas continuam** em `timeline_posts`, porque têm uso fora do form:
> o backend resolve `timeline_manager_id` (timeline do usuário, criada na 1ª
> publicação) e `status` (`published`); `repost_of_id` vem da ação
> "Republicar" sobre um post existente; `status` também é usado pela moderação
> e pelo filtro do feed; `title` existe nos posts antigos e na listagem
> clássica (o card não mostra título vazio).

## Grupo 1 — Publicação (`timeline_posts`)

_slug `post` · icon `collection`_

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 3 | Publicação | `content` | textarea | 12 | sim | `rows: 4`, `showCounter`; o teto de caracteres entra no `CreateRequest` (Etapa D); help (2026-09-28): "O que você quer compartilhar? Obrigatório. Para anexar imagem, vídeo ou documento, use o campo Anexo abaixo." |
| 4 | Anexo | `file` | arquivo | 12 | não | 1 arquivo por publicação; NÃO vai no JSON do post — o `NewPostModal` envia em multipart para `api/v1/timeline-post-attachments/create` (2026-09-28) |

Removidos do form em 2026-09-28 (soft delete, reversível): Timeline
(`timeline_manager_id`, select), Republicar de (`repost_of_id`, select),
Título (`title`, text), Status (`status`, radio).

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
