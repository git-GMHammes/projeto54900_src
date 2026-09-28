[◄ Índice da base de conhecimento](../../../README.md)

---

# Denúncia — `timeline-report`

Mesmo modelo de [`form/menu/menu_manager.md`](../menu/menu_manager.md): árvore
revisada aqui antes do `INSERT` (não migration, não seed — ver aviso em
[`README_modulo_form.md`](../../README_modulo_form.md)).

**O que é:** formulário de `timeline_post_reports` — a denúncia de uma publicação
da timeline. Qualquer usuário autenticado denuncia (o denunciante vem da sessão,
não é campo); a `UNIQUE KEY (timeline_post_id, user_manager_id)` garante uma
denúncia por usuário por publicação. Modelo de dados completo em
[`README_modulo_timeline.md`](../../README_modulo_timeline.md).

**A fila de moderação não é este formulário.** `status`, `reviewed_by`,
`reviewed_at` e `review_note` são alterados pelas rotas de moderação
(`adminonly`), não pelo denunciante.

## O registro `form_manager` (o formulário em si)

| Coluna | Valor |
| --- | --- |
| `slug` | `timeline-report` |
| `table_name` | `timeline_post_reports` |
| `title` | Denúncia |
| `description` | Denúncia de uma publicação da timeline — motivo e detalhes. A revisão é feita pela moderação. |
| `roles` | `["user","admin"]` |
| `react_route` | `/v1/timeline-post-reports/create` (previsto — Etapa D) |
| `submit_endpoint` | `/api/v1/timeline-post-reports/create` (previsto) |
| `http_method` | `POST` |
| `status` | `active` |
| `version` | `1` |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
timeline-report
└─ Denúncia (timeline_post_reports)
   ├─ Linha 1
   │  └─ Publicação
   ├─ Linha 2
   │  └─ Motivo
   └─ Linha 3
      └─ Detalhes
```

## Grupo 1 — Denúncia (`timeline_post_reports`)

_slug `report` · icon `flag`_

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Publicação | `timeline_post_id` | select | 12 | sim | remoto: `GET /api/v1/timeline-posts/get-no-pagination`, `valueKey=id`, `labelTemplate="Publicação #{id}"`; help: "Publicação que está sendo denunciada." |
| 2 | Motivo | `reason` | radio (select até 2026-09-28) | 12 | sim | `inline=0` (uma opção por linha); estático (`options_json`), casando com o enum da coluna: Spam (`spam`), Abuso (`abuse`), Violência (`violence`), Nudez (`nudity`), Discurso de ódio (`hate`), Direitos autorais (`copyright`), Informação falsa (`misinformation`), Outro (`other`); help (2026-09-28): "Escolha o tipo de problema desta publicação para a moderação. Obrigatório." |
| 3 | Detalhes | `description` | textarea | 12 | não | `rows: 3`, `showCounter`; ajuda o moderador a decidir |

Uso na Home Feed (2026-09-28): o ícone de bandeira do `PostCard` abre o
`NewReportModal` (`pages/v1/timeline/home-feed/`) na própria página. O modal
remove o campo **Publicação** do schema e envia `timeline_post_id` = id do card;
mostra só Motivo (radio, obrigatório) e Detalhes (opcional). O campo 229 segue
no banco porque a página admin `/v1/form/timeline-report` o usa. SQL:
`doc/sql/insert/20260928112046_timeline_report_motivo_radio.sql`.

Observações de negócio (Processor, Etapa D):

- Denúncia repetida do mesmo usuário para a mesma publicação não cria linha
  nova: a `UNIQUE KEY` barra; o Processor deve responder conflito em vez de erro
  cru de banco.
- Denunciar a própria publicação é permitido pelo banco, mas não faz sentido —
  decisão de bloquear ou não fica para o Processor (registrado como ponto em
  aberto, não como regra).
- `status` nasce `pending` (default da coluna).

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
