[◄ Índice da base de conhecimento](../../../README.md)

---

# Modelo IA — `form-constructor`, o meta-formulário do módulo Form

Espelha o padrão fixado em
[`README_menu.md`](../../../../../frontend/projeto54900/src/markdown/geral/README_menu.md):
antes de qualquer `INSERT`, a árvore é desenhada e revisada aqui, em markdown.
Depois desta revisão, vira `INSERT` gerado (não migration, não seed — ver aviso
em [`README_modulo_form.md`](../../README_modulo_form.md)).

**O que é:** um único `form_manager` (`slug = form-constructor`) cujos 4
`form_groups` descrevem, cada um, os campos de **uma das 4 tabelas do próprio
módulo Form** — o formulário edita a si mesmo. É a mesma ideia dogfooding já
usada em `list_manager` (ids `form-manager`/`form-groups`/`form-rows`/
`form-fields`, listagens que leem as próprias tabelas do módulo). Reconstrução
fiel do que existia no dump `doc/sql/dump/202609201602.sql` (ids antigos
1–57), revisado e sem os problemas encontrados no form `calendario` (nenhum
`field_name` diverge da coluna real — ver "Regra de campo" abaixo).

## Regra de campo — não repetir o erro do `calendario`

`field_name` **é** o `name` do `<input>` no HTML e **precisa ser exatamente**
a coluna real da tabela (minúsculo, snake_case — nunca `'Location'`, nunca
`'Access Role'`). `field_key` é outra coisa: só o `id` do HTML, namespaced por
grupo (`fc_<grupo>_<coluna>`) para não colidir entre campos de grupos
diferentes — nunca usado no submit.

## ⛔ Regra de tooltip — `help_text` obrigatório em todo campo

Todo campo desenhado a partir deste modelo **precisa** de `help_text`: é ele
que gera o ícone ⓘ com tooltip no FormGrid (padrão do FRONTEND — ver
[`README_modulo_form.md`](../../README_modulo_form.md), seção 2.4, "Regra:
`help_text` obrigatório"). Na tabela de campos de cada form novo, usar a
coluna fixa **Tooltip (`help_text`)** — 1 frase curta dizendo para que serve
/ o que digitar — como em [`calendar_manager.md`](../calendar/calendar_manager.md).
Não gerar `INSERT` com essa coluna vazia.

> As tabelas abaixo são anteriores à regra (help só em alguns campos, dentro
> de "Observação"); ao recadastrar este form, completar o `help_text` de
> todos os campos.

## O registro `form_manager` (o formulário em si)

| Coluna | Valor |
| --- | --- |
| `slug` | `form-constructor` |
| `table_name` | `form_manager` |
| `title` | Construtor de Formulários |
| `description` | Meta-formulário: cada grupo abaixo define os campos de uma das quatro tabelas do módulo Form. Preencha de cima para baixo — o formulário alimenta o grupo, o grupo alimenta a linha, a linha alimenta o campo. |
| `roles` | `admin` |
| `react_route` | `/v1/form-constructor` |
| `submit_endpoint` | `/api/v1/form-manager/create` |
| `http_method` | `POST` |
| `status` | `active` |
| `version` | `1` |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
form-constructor
├─ Formulário (form_manager)
│  ├─ Linha 1
│  │  ├─ Slug
│  │  └─ Título exibido
│  ├─ Linha 2
│  │  └─ Descrição
│  ├─ Linha 3
│  │  ├─ Grupo de perfil
│  │  ├─ Rota no React
│  │  └─ Endpoint de envio
│  └─ Linha 4
│     ├─ Método HTTP
│     ├─ Status
│     └─ Versão
├─ Grupos (form_groups)
│  ├─ Linha 1
│  │  ├─ Formulário
│  │  └─ Título da seção
│  ├─ Linha 2
│  │  ├─ Slug
│  │  ├─ Ícone
│  │  └─ Ordem
│  ├─ Linha 3
│  │  └─ Descrição
│  └─ Linha 4
│     └─ Iniciar recolhido
├─ Linhas (form_rows)
│  ├─ Linha 1
│  │  ├─ Grupo
│  │  ├─ Ordem
│  │  └─ Gutter
│  └─ Linha 2
│     └─ Nota
└─ Campos (form_fields)
   ├─ Linha 1
   │  ├─ Linha
   │  ├─ Tipo
   │  ├─ col
   │  └─ Ordem
   ├─ Linha 2
   │  ├─ Rótulo
   │  ├─ name (atributo)
   │  └─ id (atributo)
   ├─ Linha 3
   │  ├─ Placeholder
   │  └─ Texto de ajuda
   ├─ Linha 4
   │  └─ Valor padrão
   ├─ Linha 5
   │  ├─ Obrigatório
   │  ├─ Desabilitado
   │  ├─ Somente leitura
   │  └─ Oculto
   ├─ Linha 6
   │  ├─ max_length
   │  ├─ min_length
   │  └─ pattern (regex)
   ├─ Linha 7
   │  ├─ input_mode
   │  ├─ autocomplete
   │  └─ rows (textarea)
   ├─ Linha 8
   │  ├─ Sem números
   │  ├─ Sem letras
   │  ├─ Sem especiais
   │  └─ Senha forte
   ├─ Linha 9
   │  ├─ Campo duplo
   │  ├─ Exigir igualdade
   │  ├─ Com segundos
   │  └─ Opções inline
   ├─ Linha 10
   │  ├─ Contador de caracteres
   │  ├─ Data mínima
   │  └─ Data máxima
   ├─ Linha 11
   │  ├─ options_json
   │  └─ datalist_json
   ├─ Linha 12
   │  ├─ allowed_domains_json
   │  └─ select_config_json
   └─ Linha 13
      ├─ style_json
      └─ attributes_json
```

## Grupo 1 — Formulário (`form_manager`)

*slug `formulario` · icon `ui-checks-grid`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Slug | `slug` | text | 6 | sim | placeholder `kebab-case`; pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$`; help: "Identificador estável, único. Ex: cadastro-funcionario." |
| 1 | Título exibido | `title` | text | 6 | não | placeholder "Cabeçalho no topo do formulário" |
| 2 | Descrição | `description` | textarea | 12 | não | `rows_qty=3`, `max_length=1000` |
| 3 | Grupo de perfil | `profile_group` | text | 4 | não | help: "Grupo de perfil dono do formulário."; `datalist_json`: `["admin","editor","viewer","rh","financeiro"]` |
| 3 | Rota no React | `react_route` | text | 4 | não | placeholder `/v1/meu-form` |
| 3 | Endpoint de envio | `submit_endpoint` | text | 4 | não | placeholder `/api/v1/...` |
| 4 | Método HTTP | `http_method` | select | 4 | não | opções: GET, POST, PUT, PATCH, DELETE |
| 4 | Status | `status` | radio | 5 | não | `inline=1`; opções: Rascunho(`draft`), Ativo(`active`), Inativo(`inactive`) |
| 4 | Versão | `version` | text | 3 | não | `input_mode=numeric`; placeholder `1` |

> ⚠️ **Nota (2026-09-20):** `profile_group` era o nome antigo da coluna —
> `RenameFormManagerProfileGroupToRolesMigration` já renomeou pra `roles` no
> schema real. Ao gerar o `INSERT`, trocar `field_name` de `profile_group`
> para `roles` (o dump preserva o nome antigo, não copiar literal).

## Grupo 2 — Grupos (`form_groups`)

*slug `grupos` · icon `collection`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Formulário | `form_manager_id` | select | 6 | sim | remoto: `GET /api/v1/form-manager/get-no-pagination`, `valueKey=id`, `labelTemplate="{title} ({slug}) #{id}"`; help: "A qual formulário este grupo pertence." |
| 1 | Título da seção | `title` | text | 6 | sim | placeholder "Ex: Dados Pessoais" |
| 2 | Slug | `slug` | text | 6 | não | placeholder `dados-pessoais`; pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| 2 | Ícone | `icon` | text | 3 | não | placeholder `bi-person` |
| 2 | Ordem | `sort_order` | text | 3 | não | `input_mode=numeric`; placeholder `0` |
| 3 | Descrição | `description` | textarea | 12 | não | `rows_qty=2` |
| 4 | Iniciar recolhido | `collapsed` | checkbox | 12 | não | opção única "Sim" (`value=1`) |

## Grupo 3 — Linhas (`form_rows`)

*slug `linhas` · icon `distribute-vertical`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Grupo | `form_group_id` | select | 6 | sim | remoto: `GET /api/v1/form-groups/get-no-pagination`, `valueKey=id`, `labelTemplate="{title} #{id}"`; help: "A qual grupo esta linha pertence." |
| 1 | Ordem | `sort_order` | text | 3 | não | `input_mode=numeric`; placeholder `0` |
| 1 | Gutter | `gutter` | select | 3 | não | opções: g-0, g-1, g-2, g-3, g-4, g-5 |
| 2 | Nota | `note` | text | 12 | não | — |

## Grupo 4 — Campos (`form_fields`)

*slug `campos` · icon `input-cursor-text`*

| Linha | Rótulo | `field_name` | Tipo | col | Obrig. | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Linha | `form_row_id` | select | 4 | sim | remoto: `GET /api/v1/form-rows/get-no-pagination`, `valueKey=id`, `labelTemplate="linha #{id} (grupo {form_group_id})"` |
| 1 | Tipo | `field_type` | select | 4 | sim | as 22 opções do ENUM (text, password, email, textarea, senha, select, radio, checkbox, cpf, cnpj, phone, cep, data, hora, moeda, pis, placa, titulo, cnh, processo, renavam, sei) |
| 1 | col | `col` | select | 2 | não | opções 1–12 |
| 1 | Ordem | `sort_order` | text | 2 | não | `input_mode=numeric` |
| 2 | Rótulo | `label` | text | 6 | não | — |
| 2 | name (atributo) | `field_name` | text | 3 | não | — |
| 2 | id (atributo) | `field_key` | text | 3 | não | — |
| 3 | Placeholder | `placeholder` | text | 6 | não | — |
| 3 | Texto de ajuda | `help_text` | text | 6 | não | — |
| 4 | Valor padrão | `default_value` | textarea | 12 | não | `rows_qty=2` |
| 5 | Obrigatório | `required` | checkbox | 3 | não | opção única "Sim" |
| 5 | Desabilitado | `disabled` | checkbox | 3 | não | opção única "Sim" |
| 5 | Somente leitura | `read_only` | checkbox | 3 | não | opção única "Sim" |
| 5 | Oculto | `is_hidden` | checkbox | 3 | não | opção única "Sim" |
| 6 | max_length | `max_length` | text | 3 | não | `input_mode=numeric` |
| 6 | min_length | `min_length` | text | 3 | não | `input_mode=numeric` |
| 6 | pattern (regex) | `pattern` | text | 6 | não | — |
| 7 | input_mode | `input_mode` | select | 4 | não | opções: text, numeric, decimal, email, tel, url, search, none |
| 7 | autocomplete | `autocomplete` | text | 4 | não | placeholder "name, email, off..." |
| 7 | rows (textarea) | `rows_qty` | text | 4 | não | `input_mode=numeric` |
| 8 | Sem números | `no_numbers` | checkbox | 3 | não | opção única "Sim" |
| 8 | Sem letras | `no_letters` | checkbox | 3 | não | opção única "Sim" |
| 8 | Sem especiais | `no_special_chars` | checkbox | 3 | não | opção única "Sim" |
| 8 | Senha forte | `strong_password` | checkbox | 3 | não | opção única "Sim" |
| 9 | Campo duplo | `double_field` | checkbox | 3 | não | opção única "Sim" |
| 9 | Exigir igualdade | `equal_fields` | checkbox | 3 | não | opção única "Sim" |
| 9 | Com segundos | `with_seconds` | checkbox | 3 | não | opção única "Sim" |
| 9 | Opções inline | `inline` | checkbox | 3 | não | opção única "Sim" |
| 10 | Contador de caracteres | `show_counter` | checkbox | 4 | não | opção única "Sim" |
| 10 | Data mínima | `min_date` | data | 4 | não | — |
| 10 | Data máxima | `max_date` | data | 4 | não | — |
| 11 | options_json | `options_json` | textarea | 6 | não | `rows_qty=3`; placeholder `[{"id":"a","value":"a","label":"A"}]`; help: "radio / checkbox / select inline." |
| 11 | datalist_json | `datalist_json` | textarea | 6 | não | `rows_qty=3`; placeholder `["opcao 1","opcao 2"]` |
| 12 | allowed_domains_json | `allowed_domains_json` | textarea | 6 | não | `rows_qty=2`; placeholder `["gov.br"]` |
| 12 | select_config_json | `select_config_json` | textarea | 6 | não | `rows_qty=3`; placeholder `{"src":"/api/v1/...","valueKey":"id","labelKey":"nome"}` |
| 13 | style_json | `style_json` | textarea | 6 | não | `rows_qty=2`; placeholder `{"textTransform":"uppercase"}` |
| 13 | attributes_json | `attributes_json` | textarea | 6 | não | `rows_qty=2`; placeholder `{"size":30,"tabIndex":1}` |

## Próximo passo

Revisar esta árvore (ajustar rótulo/help_text/obrigatoriedade se preciso) e
então gerar o `INSERT` (`form_manager` → `form_groups` → `form_rows` →
`form_fields`, nesta ordem, respeitando `table_name NOT NULL`) a partir
exatamente destas tabelas — nenhum campo novo, nenhum renomeado, sem
inventar o que não está aqui.

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
