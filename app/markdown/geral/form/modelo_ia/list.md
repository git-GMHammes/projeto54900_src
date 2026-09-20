[◄ Índice da base de conhecimento](../../../README.md)

---

# Modelo IA — `list-constructor`, o meta-formulário do módulo List

Análogo direto de [`form/modelo_ia/form.md`](form.md) (`form-constructor`),
mas para o módulo List em vez do módulo Form. Mesmo padrão de
[`README_menu.md`](../../../../../frontend/projeto54900/src/markdown/geral/README_menu.md):
árvore revisada aqui antes do `INSERT` (não migration, não seed — ver aviso
em [`README_modulo_form.md`](../../README_modulo_form.md)).

**O que é:** um `form_manager` (`slug = list-constructor`) cujos 3
`form_groups` descrevem, cada um, os campos de **uma das 3 tabelas do módulo
List** (`list_manager`, `list_columns`, `list_actions`) — um formulário do
módulo Form que cria registros do módulo List. Diferente do
`form-constructor`, aqui não é reconstrução de dump — é desenho novo, direto
do schema real (`DESCRIBE list_manager/list_columns/list_actions`), porque o
List nunca teve um "modelo IA" documentado antes.

## Regra de campo — mesma do `form-constructor`

`field_name` é a coluna real da tabela; `field_key` é só o `id` do HTML,
namespaced por grupo (`fc_<grupo>_<coluna>`).

## O registro `form_manager` (o formulário em si)

| Coluna            | Valor                                                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `slug`            | `list-constructor`                                                                                                                                                                                     |
| `table_name`      | `list_manager`                                                                                                                                                                                         |
| `title`           | Construtor de Listagens                                                                                                                                                                                |
| `description`     | Meta-formulário: cada grupo abaixo define os campos de uma das três tabelas do módulo List. Preencha de cima para baixo — o formulário alimenta a listagem, a listagem alimenta as colunas e as ações. |
| `roles`           | `admin`                                                                                                                                                                                                |
| `react_route`     | `/v1/list-constructor`                                                                                                                                                                                 |
| `submit_endpoint` | `/api/v1/list-manager/create`                                                                                                                                                                          |
| `http_method`     | `POST`                                                                                                                                                                                                 |
| `status`          | `active`                                                                                                                                                                                               |
| `version`         | `1`                                                                                                                                                                                                    |

## Árvore de dados — hierarquia completa, sem detalhe (detalhe vai na tabela)

```
list-constructor
├─ Listagem (list_manager)
│  ├─ Linha 1
│  │  ├─ Slug
│  │  └─ Título
│  ├─ Linha 2
│  │  └─ Descrição
│  ├─ Linha 3
│  │  ├─ table_name
│  │  ├─ API get endpoint
│  │  └─ API search endpoint
│  ├─ Linha 4
│  │  ├─ Perfis
│  │  ├─ Ordenação padrão
│  │  └─ Direção
│  ├─ Linha 5
│  │  ├─ Limite padrão
│  │  ├─ Status
│  │  └─ Versão
│  └─ Linha 6
│     └─ Opções de limite
├─ Colunas (list_columns)
│  ├─ Linha 1
│  │  ├─ Listagem
│  │  └─ Rótulo
│  ├─ Linha 2
│  │  ├─ field_key
│  │  ├─ Ordem
│  │  └─ Formato
│  ├─ Linha 3
│  │  ├─ Classe CSS
│  │  └─ Fallback
│  ├─ Linha 4
│  │  ├─ Ordenável
│  │  ├─ Chave de ordenação
│  │  └─ Visível
│  ├─ Linha 5
│  │  └─ Concatenação
│  └─ Linha 6
│     └─ Ordenação composta
└─ Ações (list_actions)
   ├─ Linha 1
   │  ├─ Listagem
   │  └─ Rótulo
   ├─ Linha 2
   │  ├─ Ícone
   │  ├─ Tipo de ação
   │  └─ Ordem
   ├─ Linha 3
   │  ├─ href_template
   │  └─ api_endpoint
   ├─ Linha 4
   │  ├─ Método HTTP
   │  ├─ data_action
   │  └─ target
   ├─ Linha 5
   │  ├─ Confirmar
   │  └─ Mensagem de confirmação
   ├─ Linha 6
   │  └─ Perfis
   ├─ Linha 7
   │  └─ extra_data_json
   └─ Linha 8
      └─ business_rule_json
```

## Grupo 1 — Listagem (`list_manager`)

_slug `listagem` · icon `list-ul`_

| Linha | Rótulo              | `field_name`          | Tipo     | col | Obrig. | Observação                                                                  |
| ----- | ------------------- | --------------------- | -------- | --- | ------ | --------------------------------------------------------------------------- |
| 1     | Slug                | `slug`                | text     | 6   | sim    | pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$`; help: "Identificador estável, único." |
| 1     | Título              | `title`               | text     | 6   | não    | placeholder "Cabeçalho acima da tabela"                                     |
| 2     | Descrição           | `description`         | textarea | 12  | não    | `rows_qty=3`                                                                |
| 3     | table_name          | `table_name`          | text     | 4   | sim    | help: "Tabela/view real de origem — alimenta 'Colunas (auto)' no builder."  |
| 3     | API get endpoint    | `api_get_endpoint`    | text     | 4   | não    | placeholder `/api/v1/.../get-all`                                           |
| 3     | API search endpoint | `api_search_endpoint` | text     | 4   | não    | placeholder `/api/v1/.../search`                                            |
| 4     | Perfis              | `roles`               | text     | 4   | não    | `datalist_json`: `["admin","editor","viewer","rh","financeiro"]`            |
| 4     | Ordenação padrão    | `default_sort`        | text     | 4   | não    | placeholder `id`                                                            |
| 4     | Direção             | `default_order`       | select   | 4   | não    | opções: Ascendente (`asc`), Descendente (`desc`)                            |
| 5     | Limite padrão       | `default_limit`       | text     | 3   | não    | `input_mode=numeric`; placeholder `20`                                      |
| 5     | Status              | `status`              | radio    | 6   | não    | `inline=1`; opções: Rascunho(`draft`), Ativo(`active`), Inativo(`inactive`) |
| 5     | Versão              | `version`             | text     | 3   | não    | `input_mode=numeric`; placeholder `1`                                       |
| 6     | Opções de limite    | `limit_options_json`  | textarea | 12  | não    | `rows_qty=2`; placeholder `[10,20,50,100]`                                  |

## Grupo 2 — Colunas (`list_columns`)

_slug `colunas` · icon `columns-gap`_

| Linha | Rótulo             | `field_name`       | Tipo     | col | Obrig. | Observação                                                                                                                                                   |
| ----- | ------------------ | ------------------ | -------- | --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | Listagem           | `list_manager_id`  | select   | 6   | sim    | remoto: `GET /api/v1/list-manager/get-no-pagination`, `valueKey=id`, `labelTemplate="{title} ({slug}) #{id}"`; help: "A qual listagem esta coluna pertence." |
| 1     | Rótulo             | `label`            | text     | 6   | sim    | placeholder "Ex: Nome completo"                                                                                                                              |
| 2     | field_key          | `field_key`        | text     | 4   | não    | help: "Chave vinda da API (ex.: sf_nome_completo)."                                                                                                          |
| 2     | Ordem              | `sort_order`       | text     | 4   | não    | `input_mode=numeric`                                                                                                                                         |
| 2     | Formato            | `format`           | select   | 4   | não    | opções: text, cpf, cnpj, moeda, data, datetime, custom                                                                                                       |
| 3     | Classe CSS         | `cell_class`       | text     | 6   | não    | placeholder `text-center`                                                                                                                                    |
| 3     | Fallback           | `fallback`         | text     | 6   | não    | placeholder `—`                                                                                                                                              |
| 4     | Ordenável          | `sortable`         | checkbox | 3   | não    | opção única "Sim"                                                                                                                                            |
| 4     | Chave de ordenação | `sort_key`         | text     | 6   | não    | help: "Vazio usa field_key."                                                                                                                                 |
| 4     | Visível            | `visible`          | checkbox | 3   | não    | opção única "Sim"                                                                                                                                            |
| 5     | Concatenação       | `concat_json`      | textarea | 12  | não    | `rows_qty=3`; placeholder `[{"type":"field","value":"nome"},{"type":"literal","value":" - "}]`                                                               |
| 6     | Ordenação composta | `sort_concat_json` | textarea | 12  | não    | `rows_qty=2`                                                                                                                                                 |

## Grupo 3 — Ações (`list_actions`)

_slug `acoes` · icon `hand-index-thumb`_

| Linha | Rótulo                  | `field_name`         | Tipo     | col | Obrig. | Observação                                                                                                    |
| ----- | ----------------------- | -------------------- | -------- | --- | ------ | ------------------------------------------------------------------------------------------------------------- |
| 1     | Listagem                | `list_manager_id`    | select   | 6   | sim    | remoto: `GET /api/v1/list-manager/get-no-pagination`, `valueKey=id`, `labelTemplate="{title} ({slug}) #{id}"` |
| 1     | Rótulo                  | `label`              | text     | 6   | sim    | placeholder "Ex: Editar"                                                                                      |
| 2     | Ícone                   | `icon`               | text     | 4   | não    | placeholder `bi-pencil`                                                                                       |
| 2     | Tipo de ação            | `action_type`        | select   | 4   | não    | opções: Link (`link`), Chamada de API (`api_call`)                                                            |
| 2     | Ordem                   | `sort_order`         | text     | 4   | não    | `input_mode=numeric`                                                                                          |
| 3     | href_template           | `href_template`      | text     | 6   | não    | placeholder `/v1/user-manager/update/{id}`                                                                    |
| 3     | api_endpoint            | `api_endpoint`       | text     | 6   | não    | placeholder `/api/v1/.../delete-soft/{id}`                                                                    |
| 4     | Método HTTP             | `http_method`        | select   | 4   | não    | opções: GET, POST, PUT, PATCH, DELETE                                                                         |
| 4     | data_action             | `data_action`        | text     | 4   | não    | help: "Nome do handler no front (ex.: delete-soft)."                                                          |
| 4     | target                  | `target`             | text     | 4   | não    | placeholder `_self` / `_blank`                                                                                |
| 5     | Confirmar               | `confirm`            | checkbox | 4   | não    | opção única "Sim"                                                                                             |
| 5     | Mensagem de confirmação | `confirm_message`    | text     | 8   | não    | placeholder "Confirma excluir?"                                                                               |
| 6     | Perfis                  | `roles`              | text     | 12  | não    | `datalist_json`: `["admin","editor","viewer","rh","financeiro"]`                                              |
| 7     | extra_data_json         | `extra_data_json`    | textarea | 12  | não    | `rows_qty=2`                                                                                                  |
| 8     | business_rule_json      | `business_rule_json` | textarea | 12  | não    | `rows_qty=2`; help: "Regra que habilita/bloqueia a ação por registro."                                        |

## Próximo passo

Revisar esta árvore e então gerar o `INSERT` (`form_manager` → `form_groups`
→ `form_rows` → `form_fields`) a partir exatamente destas tabelas — mesmo
fluxo do `form-constructor`, aplicado ao módulo List.

---

[◄ Índice da base de conhecimento](../../../README.md)

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
