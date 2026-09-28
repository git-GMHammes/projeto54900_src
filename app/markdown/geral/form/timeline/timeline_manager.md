[◄ Índice da base de conhecimento](../../../README.md)

---

# Timeline (edição) — `timeline-settings`

Mesmo modelo de [`form/menu/menu_manager.md`](../menu/menu_manager.md): árvore
revisada aqui antes do `INSERT` (não migration, não seed — ver aviso em
[`README_modulo_form.md`](../../README_modulo_form.md)).

**O que é:** formulário de `timeline_manager` — a **tabela pai** do módulo
Timeline, uma por usuário (criada automaticamente na primeira publicação, ver
[`README_modulo_timeline.md`](../../README_modulo_timeline.md)). Este formulário
não cria timeline nova: ele **edita** a timeline existente (título, slug, capa e
status). O dono (`user_manager_id`) **não é campo** — vem da sessão.

## O registro `form_manager` (o formulário em si)

| Coluna | Valor |
| --- | --- |
| `slug` | `timeline-settings` |
| `table_name` | `timeline_manager` |
| `title` | Timeline |
| `description` | Edição da própria timeline — título, slug, imagem de capa e status. |
| `roles` | `["user","admin"]` |
| `react_route` | `/v1/timeline-manager/update` (previsto — Etapa D) |
| `submit_endpoint` | `/api/v1/timeline-manager/update/{id}` (previsto — conferir contra `route_manager` antes do `INSERT`) |
| `http_method` | `PUT` |
| `status` | `active` |
| `version` | `1` |

Espelho do `atualizar-upload` (`PUT` em `/api/v1/upload-manager/update`), que é o
formulário de edição já existente — com a diferença de que aqui o endpoint fica
com `{id}`, para bater com o `endpoint` gravado em `route_manager`
(`/api/v1/timeline-manager/update/{id}`). O `atualizar-upload` grava o endpoint
sem `{id}`; divergência anotada, não corrigida aqui.

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
timeline-settings
└─ Timeline (timeline_manager)
   ├─ Linha 1
   │  ├─ Título
   │  └─ Status
   ├─ Linha 2
   │  └─ Slug
   ├─ Linha 3
   │  └─ Imagem de capa
   └─ Linha 4
      └─ Descrição
```

## Grupo 1 — Timeline (`timeline_manager`)

_slug `timeline` · icon `person-lines-fill`_

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Título | `title` | text | 8 | sim | placeholder "Ex: Minha timeline"; alimenta o `slug` enquanto ele não for editado à mão; help (2026-09-28): "Nome exibido da sua timeline. Obrigatório." |
| 1 | Status | `status` | radio | 4 | não | `inline=1`; opções: Rascunho (`draft`), Ativa (`active`), Inativa (`inactive`); help (2026-09-28): "Ativa = visível no feed; Inativa = oculta; Rascunho = ainda não publicada." |
| 2 | Slug | `slug` | text | 12 | sim | identidade legível (`UNIQUE` no banco), no molde do `form_manager.slug`; a API busca pelo `id`, nunca pelo slug |
| 3 | Imagem de capa | `cover_image_url` | text | 12 | não | por enquanto URL; o arquivo em si é do módulo Upload (`module='timeline'`, `collection='cover'`) — o `FormGrid` não tem campo de arquivo |
| 4 | Descrição | `description` | textarea | 12 | não | `rows: 2`, `showCounter`; help (2026-09-28): "Texto opcional de apresentação da sua timeline." |

Fora do formulário (preenchidos pelo Processor): `user_manager_id` (dono — vem da
sessão, base da `UNIQUE KEY`), `version` (default `1`) e os timestamps.

## Próximo passo

Revisar e então gerar o `INSERT` (`form_manager` → `form_groups` → `form_rows` →
`form_fields`) a partir exatamente desta tabela — mesmo fluxo de
`nav_manager.md`/`menu_manager.md`. Antes do `INSERT`: conferir se
`/api/v1/timeline-manager/update/{id}` já existe em `route_manager` (checklist do
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
