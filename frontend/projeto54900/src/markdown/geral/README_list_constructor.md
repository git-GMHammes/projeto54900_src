[◄ Índice da base de conhecimento](../README.md)

---

# Construtor de Listas (`list_manager` / `list_columns` / `list_actions`)

Estrutura de banco para descrever **grids/listagens alimentadas por API**
(paginação, ordenação, colunas compostas e ações por linha com permissão),
no mesmo espírito do [construtor de formulários](README_form_builder.md)
(`form_manager` → `form_groups` → `form_rows` → `form_fields`), mas para
listagens em vez de formulários.

**Estado atual: banco + backend REST + frontend completo (preview + builder).**
As 3 migrations (`app/Database/Migrations/2026-09-15-091508..091510_*`) já
rodaram no banco local (`codeigniter54900_db`), os 3 módulos de API
(`list-manager`, `list-columns`, `list-actions`) já existem, espelhando 100%
o padrão do módulo Form (`BaseTableModel`/`BaseTableService`/
`BaseResourceTableController` — mesmo endpoint-set de 19 rotas por módulo:
`find`, `get-grouped`, `search`, `get`, `get-all`, `get-no-pagination`,
`get-deleted*`, `get-all-with-deleted*`, `create`, `update`, `delete-soft`,
`delete-restore`, `delete-hard`, `clear-deleted*`). No frontend: `/v1/list-constructor`
(`ListConstructorPage.tsx`) **renderiza a grid de verdade** a partir dessas 3
tabelas, e `/v1/list-constructor/create` (`ListBuilderPage.tsx`, nos moldes
do `FormBuilderPage`) já deixa **criar listagens novas pela UI** — árvore
`list_manager` → `list_columns`/`list_actions`, colunas geradas
automaticamente a partir da tabela escolhida ("Colunas (auto)"). Sem modo
edição ainda (ver "Próximos passos").

| Módulo         | Model                                          | Service                                      | Controller                                                        | Rotas                   |
| -------------- | ---------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------- | ----------------------- |
| `list_manager` | `Models/V1/List/ListManager/SqlTableModel.php` | `Services/V1/List/ListManager/Processor.php` | `Controllers/Api/V1/List/ListManager/ResourceTableController.php` | `api/v1/list-manager/*` |
| `list_columns` | `Models/V1/List/ListColumns/SqlTableModel.php` | `Services/V1/List/ListColumns/Processor.php` | `Controllers/Api/V1/List/ListColumns/ResourceTableController.php` | `api/v1/list-columns/*` |
| `list_actions` | `Models/V1/List/ListActions/SqlTableModel.php` | `Services/V1/List/ListActions/Processor.php` | `Controllers/Api/V1/List/ListActions/ResourceTableController.php` | `api/v1/list-actions/*` |

Cada `Processor` valida a FK `list_manager_id` ativa (`list_columns`/
`list_actions`) ou a unicidade de `slug` (`list_manager`, que também nasce
sempre `status = 'draft'`, igual `form_manager`) e serializa para string JSON
as colunas `*_json` quando chegam como array (`limit_options_json`,
`concat_json`, `sort_concat_json`, `extra_data_json`, `business_rule_json`) —
mesmo padrão de `Form/FormCampos::encodeJsonColumns`. Testado ponta a ponta
via `curl` (create/get-all/FK inválida → 422/CASCADE em `delete-hard`).

## Origem — o padrão que está sendo formalizado

O desenho replica em dados o que hoje é escrito à mão em cada
`get_all.js` de listagens legadas (ex.:
`sad/v1a/pages/servidor_funcionario/get_all.js`,
`sad/v1a/pages/calculo_diaria/get_all.js`, de outro projeto, usados só como
guia — não fazem parte deste repositório):

| No `get_all.js`                                   | Vira, no banco                                                  |
| ------------------------------------------------- | --------------------------------------------------------------- |
| `ROW_BATCH_1` (colunas de dados)                  | linhas de `list_columns`                                        |
| `ROW_BATCH_ACTIONS` (botões por linha)            | linhas de `list_actions`                                        |
| `_page` / `_limit` / `_sort` / `_order`           | `list_manager.default_limit` / `default_sort` / `default_order` |
| célula composta (`_buildServidorFuncionarioCell`) | `list_columns.concat_json`                                      |
| clique em `<th data-sort>`                        | `list_columns.sortable` + `sort_key`/`sort_concat_json`         |
| `getXxxPermissions(row)` / `permissionKey`        | `list_actions.roles` + `business_rule_json`                     |

Não há schema fixo no código: os dados de cada listagem (colunas, ações,
paginação) são lidos do banco, do mesmo jeito que `form_manager` guarda a
árvore de um formulário.

## Árvore alvo

```
list_manager 1:N list_columns
list_manager 1:N list_actions
```

Diferente do construtor de formulários, aqui **não há aninhamento** —
`list_columns` e `list_actions` são coleções irmãs, ambas com FK direta para
`list_manager` (`ON DELETE CASCADE`). Uma view combinando as duas produziria
produto cartesiano (coluna × ação), por isso não foi criada; só entraria em
cena se uma tela de consumo específica precisar de leitura única.

## `list_manager` — a listagem em si

| Coluna                | Tipo                                                  | Notas                                                                                                                                                               |
| --------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slug`                | `VARCHAR(255)` `NOT NULL` `UNIQUE`                    | identifica a listagem                                                                                                                                               |
| `table_name`          | `VARCHAR(255)` `NULL`                                 | tabela/view real de origem (schema) — validada contra `SchemaInspector::isKnownTable` no `Processor`, mesmo padrão de `form_manager.table_name`; alimenta "Colunas (auto)" e os selects `field_key`/`sort_key` sem depender de adivinhação |
| `title`               | `VARCHAR(255)` `NULL`                                 | título exibido acima da tabela                                                                                                                                      |
| `description`         | `TEXT` `NULL`                                         |                                                                                                                                                                     |
| `api_get_endpoint`    | `VARCHAR(255)` `NULL`                                 | endpoint `getAll` paginado                                                                                                                                          |
| `api_search_endpoint` | `VARCHAR(255)` `NULL`                                 | endpoint de busca (opcional)                                                                                                                                        |
| `roles`               | `VARCHAR(255)` `NULL`                                 | perfis que veem a listagem inteira — lista JSON de slugs, mesmo padrão de `form_manager.roles` (ver [`README_campo_json_montado.md`](README_campo_json_montado.md)) |
| `default_sort`        | `VARCHAR(255)` `DEFAULT 'id'`                         | coluna de ordenação inicial                                                                                                                                         |
| `default_order`       | `ENUM('asc','desc')` `DEFAULT 'desc'`                 |                                                                                                                                                                     |
| `default_limit`       | `INT` `DEFAULT 20`                                    | **"Limit por páginas"** — registros por página                                                                                                                      |
| `limit_options_json`  | `JSON` `NULL`                                         | opções de tamanho de página oferecidas ao usuário, ex. `[10,20,50,100]`                                                                                             |
| `status`              | `ENUM('draft','active','inactive')` `DEFAULT 'draft'` | mesmo ciclo de vida do `form_manager`                                                                                                                               |
| `version`             | `INT` `DEFAULT 1`                                     |                                                                                                                                                                     |

## `list_columns` — colunas de dados (equivale a `ROW_BATCH_1`)

FK `list_manager_id` → `list_manager.id` (`CASCADE`).

| Coluna             | Tipo                           | Notas                                                                                                         |
| ------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `sort_order`       | `INT` `DEFAULT 0`              | posição da coluna na tabela                                                                                   |
| `label`            | `VARCHAR(255)` `NOT NULL`      | cabeçalho exibido                                                                                             |
| `field_key`        | `VARCHAR(255)` `NULL`          | **nome do campo vindo das chaves da API** (ex.: `sf_nome_completo`)                                           |
| `concat_json`      | `JSON` `NULL`                  | concatenar colunas/conteúdo na célula — ver "Concatenação" abaixo                                             |
| `format`           | `VARCHAR(30)` `DEFAULT 'text'` | `text`/`cpf`/`cnpj`/`moeda`/`data`/`datetime`/`custom`/… — livre, não é `ENUM` para não travar novos formatos |
| `cell_class`       | `VARCHAR(120)` `NULL`          | classe CSS extra no `<td>` (ex. `text-center`)                                                                |
| `fallback`         | `VARCHAR(50)` `DEFAULT '—'`    | texto quando o valor é vazio/nulo                                                                             |
| `sortable`         | `TINYINT(1)` `DEFAULT 0`       | habilita `data-sort` no `<th>` (clique ordena)                                                                |
| `sort_key`         | `VARCHAR(255)` `NULL`          | chave enviada à API ao ordenar; `NULL` usa `field_key`                                                        |
| `sort_concat_json` | `JSON` `NULL`                  | ordenação composta (mais de uma coluna) — ver "Concatenação" abaixo                                           |
| `visible`          | `TINYINT(1)` `DEFAULT 1`       |                                                                                                               |

### Concatenação — `concat_json` e `sort_concat_json`

Mesma ideia do padrão ["campo JSON montado"](README_campo_json_montado.md):
quem edita a listagem não escreve JSON à mão (isso é trabalho de UI, numa
etapa futura), mas o **formato persistido** já fica definido agora. Uma lista
de partes, cada uma `field` (chave da API) ou `literal` (texto fixo):

```json
[
  { "type": "field",   "key": "sf_nome_completo" },
  { "type": "literal", "value": " — " },
  { "type": "field",   "key": "sf_cpf" }
]
```

Equivale a `_buildServidorFuncionarioCell(row)` do `get_all.js` de exemplo,
que empilha nome, CPF, residência, origem e grupo/cargo numa célula só.

`sort_concat_json` segue o mesmo formato, mas descreve a chave (ou chaves)
enviadas à API quando o usuário clica para ordenar por aquela coluna — cobre
o caso de uma coluna visualmente composta que precisa ordenar por mais de um
campo.

## `list_actions` — ações por linha (equivale a `ROW_BATCH_ACTIONS` + matriz de permissão)

FK `list_manager_id` → `list_manager.id` (`CASCADE`).

| Coluna               | Tipo                                       | Notas                                                                                              |
| -------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `sort_order`         | `INT` `DEFAULT 0`                          |                                                                                                    |
| `label`              | `VARCHAR(255)` `NOT NULL`                  | título/tooltip do botão (ex. "Editar")                                                             |
| `icon`               | `VARCHAR(120)` `NULL`                      | nome puro do ícone (`eye`, `pencil-square`, …) — **não** `bi bi-eye`/`fi fi-rr-*`; contrato do `<IconSelect>` (só conhece `bootstrap-icons`), ver "`list_actions` simplificado" abaixo |
| `action_type`        | `ENUM('link','api_call')` `DEFAULT 'link'` | `link` navega (`href_template`); `api_call` dispara requisição direta (ex.: `deleteSoft`)          |
| `href_template`      | `VARCHAR(255)` `NULL`                      | URL com `{id}` — usado quando `action_type = 'link'`                                               |
| `api_endpoint`       | `VARCHAR(255)` `NULL`                      | endpoint chamado quando `action_type = 'api_call'`                                                 |
| `http_method`        | `VARCHAR(10)` `DEFAULT 'GET'`              |                                                                                                    |
| `data_action`        | `VARCHAR(60)` `NULL`                       | identificador do event delegation do `get_all.js` original (`ver`/`editar`/`excluir`) — **fora do modal do builder** desde a simplificação (write-only, sem consumidor no React); coluna continua existindo, só não é mais editável por lá |
| `target`             | `VARCHAR(20)` `NULL`                       | ex. `_blank` (abrir em nova aba) — **fora do modal do builder**: não é aplicado por nenhum renderizador hoje (nem preview nem produção) |
| `confirm`            | `TINYINT(1)` `DEFAULT 0`                   | exige confirmação antes de executar — **funcional**: gera o `window.confirm()` real em produção (`FormConstructorListPage.tsx`) |
| `confirm_message`    | `VARCHAR(255)` `NULL`                      | texto do `window.confirm()` quando `confirm = 1`; vazio cai no texto genérico `"Confirma {label}?"` |
| `extra_data_json`    | `JSON` `NULL`                              | `data-*` extras montados a partir de outras chaves da linha (ex.: nome/CPF no confirm de exclusão) — **fora do modal do builder**: write-only, nenhum consumidor lê de volta (o React já tem a `row` via closure, diferente do JS vanilla original que precisava de atributos `data-*`) |
| `roles`              | `VARCHAR(255)` `NULL`                      | perfis permitidos — lista JSON de slugs, mesmo padrão do resto do projeto                          |
| `business_rule_json` | `JSON` `NULL`                              | condição sobre o dado da própria linha — **funcional**: `evalBusinessRule()` bloqueia o botão de verdade — ver "Regra de negócio" abaixo |

### Permissão em duas camadas — `roles` + `business_rule_json`

Os exemplos-guia mostram que "pode ver o botão" raramente é só uma questão
de perfil: em `calculo_diaria/get_all.js`,
`getCalculoPermissions(row)` bloqueia **Editar** para todo mundo, exceto
perfil `COFIN` **e** `status_atual === 'Aprovada'`; **Excluir** fica sempre
bloqueado nessa tela, para qualquer perfil. `list_actions` guarda essas duas
regras separadamente:

- **`roles`** — quem pode ver a ação, independente do conteúdo da linha
  (equivalente a `form_manager.roles` / `form_groups`).
- **`business_rule_json`** — condição sobre o dado da própria linha
  (equivalente ao corpo de `getXxxPermissions(row)`):

```json
{ "field": "status_atual", "op": "eq", "value": "Aprovada" }
```

Uma ação só é permitida quando **as duas** condições passam (perfil permitido
**e** regra de negócio satisfeita, quando presentes). `roles`/`business_rule_json`
nulos = sem restrição naquela camada.

## Seeds de exemplo — 2 arquivos, 9 `list_manager` no total

Ambos usam **os `Processor`s do módulo List** (mesmo caminho das rotas REST —
não é `INSERT` cru) e são idempotentes (por `slug`: `delete-hard` + recria).

**`app/Database/Seeds/ListConstructorSeeder.php`** — só `user-manager`
(`field_key`/`format`/`fallback` simples + `extra_data_json` na ação
"Editar"). Os exemplos originais `servidor-funcionario`/`calculo-diaria`
(inspiração de `sad/v1a/pages/.../get_all.js`, de outro projeto, sem backend
aqui) foram **removidos deste blueprint** e seus registros **excluídos
logicamente** (`deleteSoft`) — rodar este seeder de novo não os ressuscita.

**`app/Database/Seeds/ListConstructorRealTablesSeeder.php`** — 8
`list_manager` apontando para tabelas **reais deste projeto**, todos com
`api_get_endpoint` funcionando de verdade (testado via `curl`, todos `200`
com dados reais):

| slug              | `api_get_endpoint`                                                                                  | colunas de exemplo                  | ação                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------- |
| `bootstrap-icons` | `/api/v1/bootstrap-icons/get-all`                                                                   | name, codepoint, is_favorite        | —                                                           |
| `form-fields`     | `/api/v1/form-campos/get-all` *(tabela `form_fields`; rota ainda `form-campos`, Escopo B pendente)* | label, field_type, form_row_id      | —                                                           |
| `form-groups`     | `/api/v1/form-groups/get-all`                                                                       | title, slug, form_manager_id        | —                                                           |
| `form-manager`    | `/api/v1/form-manager/get-all`                                                                      | title, slug, status                 | **Editar** → `/v1/form-constructor/update/{id}` (rota real) |
| `form-rows`       | `/api/v1/form-rows/get-all`                                                                         | sort_order, gutter, form_group_id   | —                                                           |
| `list-actions`    | `/api/v1/list-actions/get-all`                                                                      | label, action_type, list_manager_id | —                                                           |
| `list-columns`    | `/api/v1/list-columns/get-all`                                                                      | label, field_key, list_manager_id   | —                                                           |
| `list-manager`    | `/api/v1/list-manager/get-all` (meta — lista a si mesmo)                                            | slug, title, status                 | —                                                           |

`bootstrap_icons` só tinha migration + seed de dados até esta rodada — ganhou
um módulo REST completo (`Models/Services/Controllers/Requests/V1/BootstrapIcons`
+ `Config/Routes/Api/v1/BootstrapIcons/EndpointTable.php`, mesmo endpoint-set
de 19 rotas), registrado em `Config/Routes.php` (grupo `bootstrap-icons`).

Rodar:

```
podman exec codeigniter54900_php php spark db:seed ListConstructorSeeder
podman exec codeigniter54900_php php spark db:seed ListConstructorRealTablesSeeder
```

Nenhuma das 9 listagens ativas hoje demonstra `business_rule_json` (esse
exemplo existia só em `calculo-diaria`, removido) — o mecanismo (ver seção
"Permissão em duas camadas" acima) continua implementado e testável na API,
só não está exercitado nos dados semeados no momento.

## Frontend — `/v1/list-constructor` (`ListConstructorPage.tsx`)

Página de **preview** (leitura, sem criar/editar `list_manager`/`list_columns`/
`list_actions` pela UI ainda): carrega os `list_manager` semeados
(`listManagerTable.getNoPagination`), deixa escolher um num **`<select>`**
(`onChange` recarrega tudo abaixo — antes era um grupo de botões, trocado a
pedido), busca as definições daquele manager
(`listColumnsTable.find({ list_manager_id })` / `listActionsTable.find(...)`)
e mostra:

1. Um card com os dados do `list_manager` (endpoint, roles, paginação default).
2. Uma tabela com as `list_columns` definidas (label, campo/`concat_json`,
   formato, chave de ordenação).
3. Uma tabela com as `list_actions` definidas (label, tipo, alvo, roles/regra).
4. **A grid renderizada de verdade** — busca dados reais no
   `api_get_endpoint` do manager (`http.get` + `resolveEndpoint()`, que já
   existe em `utils/formSubmit.ts` para tirar o prefixo `/api` antes de
   chamar), com paginação/ordenação sincronizadas na URL
   (`usePagination()`, já pronto). Clique no `<th>` de uma coluna `sortable`
   ordena de verdade na API. Célula resolvida por `concat_json` quando
   presente, senão por `field_key` (`fallback` quando vazio).

**Ações são só pré-visualização** — o clique nunca executa de verdade (nem
navega, nem chama a API de escrita): mostra um toast com o que seria chamado.
O botão fica **desabilitado com tooltip** quando `business_rule_json` não é
satisfeito pela linha (mecanismo implementado, sem exemplo ativo nos dados
semeados hoje — ver seção acima).

### O motor virou compartilhado — `src/utils/listConstructor.tsx`

Tipos, normalização (`toManager`/`toColumn`/`toAction`), resolução de célula
(`cellValue`/`resolveConcat`), avaliação de `business_rule_json`
(`evalBusinessRule`) e o tratamento especial por coluna (abaixo) **saíram de
`ListConstructorPage.tsx` e viraram um módulo puro reaproveitável**
(`src/utils/listConstructor.tsx`), sem estado React — cada página decide só
como buscar os dados e como reagir a clique em ação. Primeiro (e por
enquanto único) segundo consumidor: `FormConstructorListPage.tsx` (ver
abaixo). Um novo `resolveHrefTemplate(template, row)` também mora lá —
substitui **qualquer** `{campo}` no `href_template`/`api_endpoint` pelo valor
real da linha (`{id}`, `{slug}`, …), não só `{id}`.

### Tratamento especial por coluna — `list_columns.format` + `CUSTOM_CELL_RENDERERS`

Algumas colunas merecem um desenho diferente do texto puro (`slug` em
`<code>`, `status` como badge colorido, um ícone ao lado do nome numa lista
de ícones…). Em vez de um sistema genérico de "formatos universais", o
**dado que pede o tratamento** vem do banco (`list_columns.format` — string
livre, sempre foi assim) e **quem sabe desenhar** aquele tratamento é o
módulo compartilhado (`CUSTOM_CELL_RENDERERS` em `utils/listConstructor.tsx`):
um mapa `format → (value, column, row) => ReactNode`, consultado por
`renderCell()`; sem entrada para aquele `format`, cai no texto simples de
sempre (`cellValue()`). Ou seja, **o tratamento é opt-in por coluna**
(setando o `format` daquela linha de `list_columns`) — e por morar no motor
compartilhado, **qualquer página que consome o motor ganha o mesmo
tratamento de graça** (foi assim que `FormConstructorListPage.tsx` herdou
`code`/`status-badge` sem duplicar nada).

Aplicado hoje em `form-manager` (`format: 'code'` no `slug`,
`format: 'status-badge'` no `status` — mesmo `<code>`/badge colorido do
`FormConstructorListPage.tsx` original, `STATUS_BADGE_CLASS` agora no motor)
e em `user-manager` (`format: 'email-break'` no `uc_email`, `list_columns`
id 35 — insere `<wbr>` antes do último `@`, então a coluna encolhe para
`max(parte local, @domínio)` sem scroll horizontal; o texto copiado continua
íntegro e valor sem `@` (fallback `—`) sai como texto puro).

**Formato `phone` + detecção automática por `field_key`**: o renderer `phone`
reaproveita `aplicarMascara` de `components/ui/FormGrid/phone/mask.ts` (mesma máscara
do formulário: 10 dígitos → `(NN) NNNN-NNNN`, 11 → `(NN) NNNNN-NNNN`; fora
disso, ex. com DDI, sai o valor cru). Além de poder ser setado explicitamente,
é aplicado **sozinho** quando a coluna está em `format: 'text'` e o
`field_key` casa com `AUTO_FORMAT_BY_FIELD_KEY` (hoje só `/whatsapp/i` →
`phone`) — por isso `uc_whatsapp` do `user-manager` (id 36) sai mascarado sem
UPDATE no banco. Format explícito diferente de `text` sempre prevalece.

**Ações só-ícone (`user-profiles/GetAllPage.tsx`)**: o `ActionButton` desenha
`bi bi-{list_actions.icon}` (sem ícone cadastrado → volta ao `label`) dentro
de `.icon-action-tooltip`, mesmo padrão do `CalendarActionButton`. Texto do
tooltip/`aria-label`: `{label}: {valor da 1ª coluna}` (ex.: `Editar:
gustavo.hammes`), com sufixo `(indisponível)` quando `business_rule_json`
desabilita a ação. **Armadilha**: dentro do `.table-responsive` a bolha
padrão (centrada acima do botão) vaza pela borda direita — mesmo escondida
(`visibility: hidden`) ela conta como overflow e gera barra de rolagem
horizontal. Por isso a lista usa a variante `.icon-action-tooltip-bubble--start`
(`styles/_custom.scss`), que abre a bolha à esquerda do botão, centrada na
vertical, sempre dentro da tabela.

**Busca ao digitar (`user-profiles/GetAllPage.tsx`)**: `input-group` acima da
tabela, debounce de 400 ms (`useDebounce`). Com termo, a lista consulta
`list_manager.api_search_endpoint` (`?q=` + page/limit/sort/order — OR LIKE
nos `$searchFields` da view: hoje usuário, nome, e-mail, whatsapp, e também
CPF, telefone, endereço e perfil); vazio, volta ao `api_get_endpoint`. Termo
novo recomeça da página 1 e resposta de requisição antiga é descartada
(contador `requestSeq`). **Máscara**: termo só com dígitos e `( ) - +`/espaço
(ex.: `(41) 96208-0752`) é enviado só com dígitos (`normalizeSearchTerm`),
porque whatsapp/telefone estão gravados crus; termo com letra ou ponto segue
como digitado. O termo fica no estado da tela (não vai para a URL).

**Parte `icon` no `concat_json` — ícone com cor condicional**: além de
`field`/`literal`, o `concat_json` aceita
`{"type":"icon","icon":"<bootstrap-icon>","rule":{field,op,value},"classTrue":"…","classFalse":"…","title":"…"}`.
`rule` usa o mesmo formato/avaliador de `business_rule_json`
(`evalBusinessRule`, compara numérico quando possível); verdadeira →
`classTrue`, falsa → `classFalse`, sem `rule` → sempre `classTrue`. Ícones
antes da 1ª parte de texto ficam à esquerda, os demais à direita. A parte
`icon` **não entra no texto** da célula (`cellValue`/`resolveConcat` — usado
em tooltip, ordenação etc.), só no desenho (`renderCell`), e combina com
qualquer `format`. Aplicado em `user-manager`, coluna Usuário (`list_columns`
id 3): `people-circle` `text-danger` quando `um_user_role_id = 1` (Admin),
`text-success` nos demais.

**Filtro de status (mesma página)**: `<select>` ao lado da busca (grid
`col-md-8` + `col-md-4` = 100% da largura; empilha no mobile). Opções =
`enum_values` de `user_manager.status` via `dbSchema.describe('user_manager')`
(nada fixo no código) + "Todos os status". Havendo termo **ou** status, a
lista usa o `search` com `q` e `filters[um_status]=valor`; o backend só aplica
filtro de campo listado em `$filterFields` do `SqlViewModel` (whitelist —
ver `app/markdown/geral/ROADMAP_padrao_modulo.md`). Trocar status volta à
página 1.

Próximo candidato natural: `bootstrap-icons.name` com o ícone renderizado ao
lado do nome (`format: 'icon-name'`) — ainda não feito, é só registrar mais
uma entrada em `CUSTOM_CELL_RENDERERS` + atualizar o `format` daquela coluna.

## `FormConstructorListPage.tsx` migrada pro motor genérico

A tela de produção "Formulários" (`/v1/form-constructor`) **não usa mais
colunas fixas no código** — lê a definição de `list_manager` (slug
`form-manager`) + `list_columns` + `list_actions`, igual o preview, mas com
uma diferença central: **as ações executam de verdade**.

|                      | `ListConstructorPage.tsx` (preview) | `FormConstructorListPage.tsx` (produção)                                               |
| -------------------- | ----------------------------------- | -------------------------------------------------------------------------------------- |
| Colunas/células      | motor compartilhado                 | motor compartilhado (mesmo código)                                                     |
| Ação `link`          | toast "pré-visualização"            | `<Link>` real do react-router, navega de verdade                                       |
| Ação `api_call`      | toast "pré-visualização"            | chamada HTTP real (`http.{method}`), com `confirm()` quando `list_actions.confirm = 1` |
| `business_rule_json` | desabilita o botão (mock)           | desabilita o botão (real — bloqueia a ação de verdade)                                 |
| Fonte da listagem    | `<select>` entre as 9 semeadas      | fixa no slug `form-manager` (`MANAGER_SLUG`)                                           |

`list_actions` de `form-manager` ganhou uma 2ª linha pra isso funcionar como
a tela antiga: **Build** (`href_template: '/v1/form/{slug}'`, novo —
`resolveHrefTemplate` resolve `{slug}`, não só `{id}`) e **Editar**
(`href_template: '/v1/form-constructor/update/{id}'`, já existia). Paginação
ganhou controles reais (a versão antiga usava `getNoPagination`, sem
paginar) — comportamento herdado do motor, não uma escolha desta página.

### Decisão: `DataTable.tsx`/`Pagination.tsx` (stub) não foram tocados

`src/components/global/DataTable.tsx` e `Pagination.tsx` têm um aviso
explícito no código — "stub, não reimplementar aqui, aguardando a fábrica de
listas, versão anterior em backup" — deixado por uma sessão anterior. Mesmo
`list_manager`/`list_columns`/`list_actions` sendo candidatos naturais a essa
"fábrica de listas", a tabela e a paginação da `ListConstructorPage` foram
implementadas **localmente na própria página** (igual ao padrão cru de
`FormConstructorListPage.tsx`), para não sobrescrever aquele aviso sem
autorização explícita. Ligar `list_manager` como motor de fato de
`DataTable`/`Pagination` fica para quando alguém decidir puxar esse fio.

## `ListBuilderPage.tsx` — construtor de listagens novas (`/v1/list-constructor/create`)

Nos moldes do `FormBuilderPage.tsx` ([`README_form_builder.md`](README_form_builder.md)):
o usuário escolhe tabelas do banco (`dbSchema.tables()`, sem lista estática) e
cada tabela vira um card com uma árvore. Diferente do form (4 níveis
encadeados), aqui são só 2: `list_manager` (raiz) → **duas coleções irmãs**
`list_columns` e `list_actions` — nenhuma aninhada na outra, ambas folha.

- **Árvore/modal reaproveitados por fork, não por import cruzado**:
  [`ListBuilderTree.tsx`](../../pages/v1/list/ListBuilderTree.tsx) é uma
  cópia de `FormBuilderTree.tsx` com `TreeLevel`/ícones trocados
  (`manager`/`column`/`action`) — exatamente a extensão que o próprio
  `README_form_builder.md` já previa ("só `TreeLevel` e os ícones são
  específicos; trocar num fork"). Única mudança estrutural: como o manager
  tem **2** tipos de filho (não 1), `addActions` virou array
  (`{ label, onAdd, disabled }[]`) em vez de um `addLabel`/`onAdd` único.
  `FormModal.tsx` é 100% genérico — reaproveitado **sem fork**, importado
  direto de `pages/v1/form/FormModal`.
- **Modelo**: [`listBuilder.model.ts`](../../pages/v1/list/listBuilder.model.ts)
  — mesmo padrão de `formBuilder.model.ts` (`ManagerLocal`/`ColumnLocal`/
  `ActionLocal`, `xxxInicial`/`xxxPayload`). Introspecção de tabela/coluna
  (`TabelaInfo`/`ColunaInfo`/`toTabela`/`toColuna`) e os helpers genéricos de
  payload (`stripVazios`/`bit`) foram **exportados de `formBuilder.model.ts`
  e reaproveitados** (import direto), não duplicados.
- **"Colunas (auto)"** — dentro do modal do manager, um `<FormGrid>` `select
  multiple` lista as colunas reais da tabela (`dbSchema.columns(tabela)`,
  igual ao subcard LINHAS do form builder); cada escolha gera
  automaticamente um `list_columns` pré-preenchido (`field_key`/`label`/
  `sort_key` = nome da coluna). Colunas já usadas somem do listbox
  (`disabledValues`). Ainda cabe adicionar `list_columns` manualmente
  (`+ list_columns`, sem tabela associada — útil pra colunas 100%
  `concat_json`) ou `list_actions` (`+ list_actions`, nunca vem de coluna).
- **Modal de `list_columns` — texto livre virou escolha visual** (2 rodadas
  de ajuste, a pedido): `field_key` e `sort_key` usam a **mesma** lista de
  colunas reais da tabela (`dbSchema.columns`, `<select>`, opção em branco =
  nenhuma/`NULL`). `format`, `cell_class — alinhamento` e
  `cell_class — outras classes` viraram **3 listas lado a lado
  (`radio`/`radio`/`checkbox`, não mais `<select>`)**, todas com a mesma
  altura fixa (~10 itens, classe `.formgrid-fixed-list` em
  `styles/_custom.scss` — Bootstrap não tem utilitário de altura por
  "número de itens", único CSS novo desta rodada) — mais visual/operacional
  que um dropdown fechado. `format` usa `KNOWN_CELL_FORMATS`
  (`utils/listConstructor.tsx` — `'text'` + toda chave de
  `CUSTOM_CELL_RENDERERS`, nunca desalinha do motor); alinhamento é `radio`
  (único — `text-start`/`center`/`end` mexem na mesma propriedade CSS
  `text-align`, mais de um não tem efeito previsível); outras classes é
  `checkbox` (múltiplo — `text-nowrap`, `fw-bold`, `small`... cada uma cuida
  de uma propriedade CSS diferente, combinam sem conflito). Os dois grupos
  de `cell_class` se juntam numa string só separada por espaço antes de
  gravar (`cell_class` continua um único `VARCHAR(120)` no banco — a
  separação é só da UI). Logo abaixo, `fallback` divide linha com
  `Ordenável (sortable)`/`Visível`. `sort_order` foi realocado pro topo do
  modal (ao lado de `Label`) — antes estava no rodapé e passou despercebido.
- **JSON estáticos seguem `<textarea>` cru** (`concat_json`,
  `sort_concat_json`, `extra_data_json`, `business_rule_json`,
  `limit_options_json`) — mesmo débito já registrado pra `options_json`/
  `select_config_json` de `form_fields`; editor estruturado é etapa à parte.
- **Persistência por nó** (Salvar no modal): `create` sem `dbId`/`update` com
  `dbId`, igual ao form — `list_columns`/`list_actions` só habilitam depois
  que `list_manager` tem `dbId` (`addActions[].disabled`). Remoção usa
  `deleteSoft`.
- **Modo edição** (`/v1/list-constructor/update/:id`) — mesmo componente
  `ListBuilderPage`, detecta `:id` via `useParams` (igual `FormBuilderPage`).
  **Sem view, diferente do form**: `list_columns`/`list_actions` já são
  consultáveis direto por `list_manager_id`, então hidratar é só
  `GET list-manager/get/{id}` + 2× `find` em paralelo — sem achatar nada.
  Mappers inversos em `listBuilder.model.ts`: `managerFromRow`/
  `columnFromRow`/`actionFromRow` (linha crua da API → `*Local` já com
  `dbId`, espelhando `xxxPayload` ao contrário). Nesse modo o seletor de
  tabelas do topo some (o registro já existe) e um aviso substitui o card.
  **Colunas da tabela em modo edição — `table_name` persistido, não mais só
  heurístico**: `list_manager.table_name` (migration
  `2026-09-15-150000_AddTableNameToListManagerMigration`) guarda a tabela/view
  real de origem, validada contra o schema (`SchemaInspector::isKnownTable`,
  mesmo padrão de `form_manager.table_name`). Um `<select>` "Tabela/view de
  origem" (populado por `dbSchema.tables()`, que já inclui views) aparece
  dentro do próprio modal do manager — editável em qualquer modo, diferente do
  form (lá é gravado só na criação e nunca editado à mão), porque o modo
  edição do list builder não tem mais o seletor de tabelas do topo. O
  `field_key`/`sort_key` do modal de coluna e o "Colunas (auto)" do manager
  passam a resolver a tabela/view por `m.tableName`; `tabelaDoEndpoint()`
  (heurístico kebab-case → snake_case sobre `api_get_endpoint`/`slug`) vira
  só o fallback para registros antigos, gravados antes desse campo existir —
  se o palpite errar, os selects ficam vazios até o usuário escolher a
  origem certa no select.
- Link **"Nova lista"** no header do `ListConstructorPage.tsx` (preview) e
  botão **"Editar"** no card de cada manager (linkando pro modo edição
  acima) — mesmo padrão do "Novo formulário"/"Editar" em
  `FormConstructorListPage.tsx`.

## Status registrado pelo usuário (2026-09-15) — princípio de simplicidade

O construtor de formulários (`FormBuilderPage`) ficou **complexo demais —
tratado como FALHA**, não como modelo a repetir. Ao revisar o construtor de
listas, o usuário registrou:

- **`list_manager`** — ✅ aprovado, seguiu o conceito simples e rápido.
- **`list_columns`** — ✅ aprovado, seguiu **perfeitamente** o conceito
  simples e rápido.
- **`list_actions`** — precisava de trabalho: regras bem definidas, poucos
  campos, **muitos exemplos documentados direto nos próprios campos**
  (não só listar valores num select — explicar pra que serve cada um).

Regra prática pra qualquer campo novo num modal de builder (list ou
qualquer construtor futuro): antes de adicionar, perguntar "isso é
fundamental pra essa tela funcionar, ou é só write-only/decorativo hoje?" —
se for a 2ª opção, não adicionar (ou remover da UI se já existir).

### `list_actions` simplificado — de 13 campos pra 10, só o que é funcional

Investigando o pedido, achei que `icon`, `data_action`, `target` e
`extra_data_json` eram **write-only** — gravados pelo builder, mas nenhum
consumidor (`utils/listConstructor.tsx` nem `FormConstructorListPage.tsx`)
os lia de volta. Ficou assim:

| Campo | Decisão | Por quê |
| --- | --- | --- |
| `label`, `sort_order` | fica | identidade/ordem |
| `icon` | fica, virou `<IconSelect>` | decorativo hoje, mas visual/rápido escolher (mesmo componente do ícone de `form_groups`) — **nomes puros** (`eye`, `pencil-square`), sem prefixo `bi`/`fi` (contrato do `IconSelect`, que só conhece o pacote `bootstrap-icons`) |
| `action_type` | fica, virou `radio` com explicação no próprio rótulo | decide o resto da tela — `"link — abre uma URL (ex.: Ver detalhes, Editar)"` / `"api_call — chama a API direto (ex.: Excluir, Aprovar)"` |
| `href_template` **ou** `api_endpoint`+`http_method` | fica, **mostra só o do tipo escolhido** (`action_type === 'link'` decide) | menos campo na tela ao mesmo tempo |
| `confirm` + `confirm_message` | fica | **funcional de verdade** — `window.confirm()` real em produção |
| `roles` | fica | permissão — quem vê o botão |
| `business_rule_json` | fica | **funcional de verdade** — `evalBusinessRule` bloqueia o botão de verdade |
| `data_action` | **saiu da UI** | identificador do `get_all.js` original (delegação de evento em JS puro); no React a ação já chama a função direto |
| `target` | **saiu da UI** | não aplicado em lugar nenhum da renderização hoje |
| `extra_data_json` | **saiu da UI** | write-only confirmado, ninguém lê de volta |

Os 3 campos que saíram **continuam existindo no banco** (nenhuma migration,
nenhuma coluna removida) — só não aparecem mais no modal. Se um dia
ganharem consumidor de verdade, voltam pro form. Dado já salvo neles (ex.:
`extra_data_json` de `user-manager`) não se perde — só não é mais editável
por aqui.

### Bug de convenção corrigido — `:id/update` → `update/:id`

Descoberto ao revisar o `href_template` de `user-manager` (`/v1/user-manager/{id}/update`):
**3 módulos** usavam a ordem errada (`:id/update`) — `user-manager`,
`nav-manager`, `menu-manager` (todos com `UpdatePage` "stub em branco" hoje,
risco baixo de mudar). `form-constructor`/`list-constructor` já usavam a
ordem certa (`update/:id`). Corrigido nos 3: `routes/v1/{user,nav,menu}.routes.tsx`,
`routes/paths.ts`, [`README_rotas_frontend.md`](README_rotas_frontend.md),
e os `href_template`/`icon` já salvos no banco (ações "Editar" de
`user-manager` e "Build"/"Editar" de `form-manager`) — atualizados via API
(`PUT list-actions/update/{id}`), sem recriar os registros (evita trocar o
`id` de listas que já estavam sendo editadas).

### Ações `modal` por `data_action` — lista de segurança (2026-09-24)

A lista que era `user-manager` (dados de perfil + editar perfil) virou
`user-profiles` (`pages/v1/user/user-profiles/GetAllPage.tsx`, menu "Dados
Usuário"). O slug `user-manager` (list_manager id 18) passou a ser a **lista de
segurança** (`pages/v1/user/user-manager/GetAllPage.tsx`, menu "Listar"),
sobre a mesma `view_user_manager`.

As 3 ações são `action_type = 'modal'`; o banco guarda rótulo/ícone/endpoint e
**`list_actions.data_action`** diz à página qual comportamento aplicar
(`toAction` expõe o campo como `dataAction`):

| `data_action`    | Ícone                       | Comportamento                                                                 |
| ---------------- | --------------------------- | ----------------------------------------------------------------------------- |
| `toggle-status`  | `lock-fill` / `unlock-fill` | Botão único: `blocked` → `active`; `active`/`inactive` → `blocked` (confirma) |
| `reset-password` | `key-fill`                  | `ResetPasswordModal`: nova senha + confirmação (mín. 6) → `{ password_hash }` |
| `change-role`    | `person-badge`              | `ChangeRoleModal`: select de `user_roles` → `{ user_role_id }`                |

Todas usam `PUT /api/v1/user-manager/update/{id}` (hash bcrypt e checagem de
FK no `UserManager\Processor`). `data_action` sem tratamento na página → toast
de erro. `status-badge` ganhou a cor de `blocked` (`text-bg-danger`).

## Próximos passos (fora deste desafio)

- ~~**Tabela de origem confiável em modo edição**: hoje é só um palpite~~ —
  **resolvido**: `list_manager.table_name` persiste a tabela/view real,
  validada contra o schema (ver seção "Modo edição" acima).
- ~~**Pontos especiais na UI de criação**: `format` era texto livre~~ —
  **resolvido**: `format`/`field_key`/`sort_key`/`cell_class` agora são
  `<select>` no modal de `list_columns` (ver acima).
- **Editor estruturado dos JSON estáticos** (`concat_json`,
  `business_rule_json`, etc.) — hoje `<textarea>` cru, ver acima.
- **`DataTable`/`Pagination`**: avaliar se `list_manager` deveria virar o motor
  de verdade desses componentes hoje stub (ver decisão acima).
- **Views**: só se uma tela de consumo precisar de leitura única; hoje
  `list_columns`/`list_actions` são consultadas separadamente.

## Arquivos

```
app/Database/Migrations/2026-09-15-091508_CreateListManagerTableMigration.php
app/Database/Migrations/2026-09-15-091509_CreateListColumnsTableMigration.php
app/Database/Migrations/2026-09-15-091510_CreateListActionsTableMigration.php
app/Database/Migrations/2026-09-15-150000_AddTableNameToListManagerMigration.php   (list_manager.table_name)

app/Models/V1/List/ListManager/SqlTableModel.php        app/Models/V1/List/ListColumns/SqlTableModel.php        app/Models/V1/List/ListActions/SqlTableModel.php
app/Services/V1/List/ListManager/Processor.php           app/Services/V1/List/ListColumns/Processor.php           app/Services/V1/List/ListActions/Processor.php
app/Controllers/Api/V1/List/ListManager/ResourceTableController.php
app/Controllers/Api/V1/List/ListColumns/ResourceTableController.php
app/Controllers/Api/V1/List/ListActions/ResourceTableController.php
app/Requests/V1/List/{ListManager,ListColumns,ListActions}/{Create,Update}Request.php
app/Config/Routes/Api/v1/List/{ListManager,ListColumns,ListActions}/EndpointTable.php
app/Config/Routes.php   (+3 grupos: list-manager / list-columns / list-actions + bootstrap-icons)
app/Database/Seeds/ListConstructorSeeder.php              (so user-manager)
app/Database/Seeds/ListConstructorRealTablesSeeder.php     (8 tabelas reais)

app/Models/V1/BootstrapIcons/SqlTableModel.php
app/Services/V1/BootstrapIcons/Processor.php
app/Controllers/Api/V1/BootstrapIcons/ResourceTableController.php
app/Requests/V1/BootstrapIcons/{Create,Update}Request.php
app/Config/Routes/Api/v1/BootstrapIcons/EndpointTable.php

src/frontend/.../src/services/v1/{listManager,listColumns,listActions}.table.ts
src/frontend/.../src/services/v1/index.ts        (+3 exports)
src/frontend/.../src/constants/api.ts             (+3 grupos em API_GROUPS)
src/frontend/.../src/utils/listConstructor.tsx    (motor compartilhado: tipos, normalizacao, renderCell, evalBusinessRule, resolveHrefTemplate)
src/frontend/.../src/pages/v1/list/ListConstructorPage.tsx   (preview, consome o motor)
src/frontend/.../src/pages/v1/form/FormConstructorListPage.tsx   (producao, consome o motor, acoes reais)
src/frontend/.../src/pages/v1/list/listBuilder.model.ts   (ManagerLocal/ColumnLocal/ActionLocal, xxxInicial/xxxPayload)
src/frontend/.../src/pages/v1/list/ListBuilderTree.tsx    (fork de FormBuilderTree.tsx: ListTree/ListTreeNode)
src/frontend/.../src/pages/v1/list/ListBuilderPage.tsx    (construtor de listagens novas, /v1/list-constructor/create)
src/frontend/.../src/pages/v1/form/formBuilder.model.ts   (+export stripVazios/bit/Payload, reaproveitados pelo list builder)
src/frontend/.../src/routes/v1/list.routes.tsx    (+ routes/v1/index.tsx, routes/paths.ts)
```

---

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
