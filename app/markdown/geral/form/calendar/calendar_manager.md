[◄ Índice da base de conhecimento](../../../README.md)

---

# Cadastro de Calendário — `calendario`

Mesmo modelo de [`form/modelo_ia/form.md`](../modelo_ia/form.md): árvore revisada
aqui antes do `INSERT` (não migration, não seed — ver aviso em
[`README_modulo_form.md`](../../README_modulo_form.md)).

**O que é:** formulário de `calendar_manager` — recadastro do que existia
antes do `TRUNCATE` das tabelas de form (slug `calendario`, usado em
`/v1/form/calendario` e `/v1/calendar-manager`), agora passando pelo
processo markdown-primeiro. Backend já pronto: CRUD REST completo (108 rotas
no módulo `Calendar`, ver
[`README_calendar.md`](../../../../../frontend/projeto54900/src/markdown/geral/modulos/calendar/README_calendar.md)).

## ⚠️ Colunas excluídas de propósito

`document_manager_id`, `map_manager_id`, `networking_manager_id` existem na
tabela (FKs pra módulos futuros, ver "Próximos módulos planejados" no
`README_calendar.md`) mas **esses módulos ainda não existem** — um select
remoto apontando pra eles quebraria (404). Ficam fora do formulário até os
módulos existirem. `user_manager_id` **entra** (módulo `User/UserManager` já
existe e está ativo).

## O registro `form_manager` (o formulário em si)

| Coluna | Valor |
| --- | --- |
| `slug` | `calendario` |
| `table_name` | `calendar_manager` |
| `title` | Calendário |
| `description` | Cadastro de Calendário |
| `roles` | `["guest","user","admin"]` |
| `react_route` | `/v1/calendar-manager/create` |
| `submit_endpoint` | `/api/v1/calendar-manager/create` |
| `http_method` | `POST` |
| `status` | `active` |
| `version` | `1` |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
calendario
├─ Principal
│  ├─ Linha 1
│  │  ├─ Nome do calendário
│  │  └─ Local
│  └─ Linha 2
│     └─ Descrição
├─ Vínculo e Integração
│  ├─ Linha 1
│  │  ├─ Usuário dono
│  │  └─ ID Google Calendar
│  └─ Linha 2
│     ├─ Calendário principal
│     └─ Papel de acesso
├─ Aparência
│  └─ Linha 1
│     ├─ Cor de fundo
│     └─ Cor do texto
├─ Configurações Regionais
│  └─ Linha 1
│     └─ Fuso horário
└─ Status
   └─ Linha 1
      └─ Status
```

## Grupo 1 — Principal

*slug `principal` · icon `calendar-event`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Nome do calendário | `summary` | text | 8 | sim | placeholder "Ex: Agenda da Diretoria" |
| 1 | Local | `location` | text | 4 | não | — |
| 2 | Descrição | `description` | textarea | 12 | não | `rows_qty=3` |

## Grupo 2 — Vínculo e Integração

*slug `vinculo-e-integracao` · icon `calendar2-heart`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Usuário dono | `user_manager_id` | select | 6 | não | remoto: `GET /api/v1/user-manager/get-no-pagination`, `valueKey=id`, `labelTemplate="{username} #{id}"` |
| 1 | ID Google Calendar | `google_calendar_id` | text | 6 | não | help: "Sincronização externa (opcional, não gerado automaticamente)." |
| 2 | Calendário principal | `is_primary` | checkbox | 4 | não | opção única "Sim" |
| 2 | Papel de acesso | `access_role` | select | 8 | não | opções (coluna `enum`): Livre/ocupado (`freeBusyReader`), Leitor (`reader`), Editor (`writer`), Proprietário (`owner`) |

## Grupo 3 — Aparência

*slug `aparencia` · icon `palette`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Cor de fundo | `background_color` | text | 6 | não | placeholder `#4285F4`; `max_length=7` |
| 1 | Cor do texto | `foreground_color` | text | 6 | não | placeholder `#FFFFFF`; `max_length=7` |

## Grupo 4 — Configurações Regionais

*slug `configuracoes-regionais` · icon `pin-map-fill`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Fuso horário | `time_zone` | text | 12 | sim | placeholder `America/Sao_Paulo` |

## Grupo 5 — Status

*slug `status` · icon `calendar2-check`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Status | `status` | radio | 12 | não | `inline=1`; opções (coluna `enum`, só 2 valores): Ativo (`active`), Inativo (`inactive`) |

## Próximo passo

Revisar e então gerar o `INSERT` a partir exatamente destas tabelas — mesmo
fluxo dos anteriores, aplicado a `calendar_manager`.

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
