# Base de conhecimento — frontend/projeto54900

Índice geral da base de conhecimento do frontend (`src/frontend/projeto54900/src/markdown/`).
Mesma função da base do backend (`src/app/markdown/`), mas este conteúdo alimenta o
[`CLAUDE.md`](../../CLAUDE.md) **do frontend**. Cada tópico tem uma palavra-chave e uma
frase de 5 palavras. A palavra-chave no índice é âncora para o resumo correspondente;
cada resumo termina com o link para o conteúdo completo.

> Regra: sempre que um novo markdown for criado em `src/markdown/` (qualquer
> subpasta), este arquivo deve ser atualizado — nova entrada no índice, novo
> bloco de resumo e novo link. Procedimento em
> [`geral/README_atualiza_readme.md`](geral/README_atualiza_readme.md).

---

## Índice

| Palavra-chave                 | Assunto (5 palavras)                     |
| ----------------------------- | --------------------------------------- |
| [`alerta`](#alerta)           | Checklist de UI antes de criar           |
| [`atualizacao`](#atualizacao) | Registrar novo markdown neste índice     |
| [`builder`](#builder)         | Construtor novo: tabela vira formulário  |
| [`calendar`](#calendar)       | Módulo calendário: estado atual e roadmap |
| [`comentarios`](#comentarios) | Comentar código em blocos, estilo didático |
| [`construtor`](#construtor)   | Página cria formulários via API          |
| [`formgrid`](#formgrid)       | Fábrica de campos dirigida por JSON      |
| [`grid`](#grid)               | Renderizar listagem só via motor         |
| [`json`](#json)               | Campo monta JSON sem digitação           |
| [`listas`](#listas)           | Construtor de listagens: banco a builder |
| [`modal`](#modal)             | Modal sempre centralizado, estado React  |
| [`node`](#node)               | Comandos do Node e módulos               |
| [`paginas`](#paginas)         | Página por módulo, recurso e ação        |
| [`render`](#render)           | Renderizar formulário só via FormGrid    |
| [`rotas`](#rotas)             | Mapa de todas as rotas React             |

---

## Resumos

### `alerta`

⚠️ Checklist obrigatório antes de criar qualquer elemento novo de UI (item de
navbar, campo de formulário, página, rota, campo JSON): passar pelos padrões
já documentados (nav/menu via `nav-manager`/`menu-manager`, `FormGrid`,
`pages/v1/<modulo>/<recurso>/<Acao>Page.tsx`, `paths.ts`, campo JSON
montado/parseado). Nasceu de um erro real: o bloco "Entrar/Sair" da sessão de
login foi hardcoded em `Navbar.tsx`, ignorando `useSiteMenu()`
(`nav-manager`/`menu-manager`) — sem nenhuma base que justificasse a exceção.
Registra também o caso em aberto (onde deveria morar esse estado de sessão),
com 3 caminhos possíveis, nenhum decidido ainda.

[`geral/README_alerta_padroes_ui.md`](geral/README_alerta_padroes_ui.md) — checklist de padrões de UI + o caso aberto da sessão de login na navbar.

### `atualizacao`

Como manter esta base viva. Todo markdown novo em `src/markdown/` exige atualizar
`README.md`: acrescentar a linha no índice (palavra-chave + frase de 5 palavras),
escrever o bloco de resumo e adicionar o link para o conteúdo completo ao fim do
próprio resumo. Todo markdown da base começa e termina com um link para este
`README.md`. Esta base alimenta o `CLAUDE.md` do frontend.

[`geral/README_atualiza_readme.md`](geral/README_atualiza_readme.md) — atualização desta base de conhecimento.

### `builder`

Construtor **novo** (`FormBuilderPage`, rota `/v1/form-constructor`) que estamos
montando do zero — não confundir com o [`construtor`](#construtor) anterior
(seed + `view_form_manager`). Lê o schema real do banco por introspecção
(`dbSchema.tables()` / `dbSchema.columns(tabela)`) e **persiste nó a nó**: o
botão **Salvar** de cada modal grava pelo service `form*` correspondente
(`create`/`update`), o `id` retornado liga a camada filha e o `[+]` de um nível
fica **desabilitado enquanto o pai não estiver salvo** (`deleteSoft` na remoção
de nó já gravado). Ao escolher tabelas no `select multiple`, cada
tabela vira um card cujo `card-body` é uma **árvore de hierarquia**
(`form_manager → form_groups → form_rows → form_fields`) no visual de
`doc/html/estrutura.html`: cada nível é uma **linha compacta colapsável**
(chevron + `[+]` para adicionar nó, que aparece na árvore com scroll + "pisca");
o **formulário de cada nó abre num modal** (`<FormGrid>`, botão ✏️). Colapso e
modal são **estado React**, não os plugins JS do Bootstrap. Decisões: `form_manager`
identificado só por `slug` (nasce vazio, acompanha o Título enquanto `slugAuto`).

**⭐ Padrão reutilizável** — os componentes `FormBuilderTree.tsx` (`<FormTree>` /
`<TreeNode>`) + `FormModal.tsx` são **genéricos**: servem para qualquer tela de
estrutura pai→filho de N níveis com formulário por nó. Ver a seção destacada no
markdown antes de reinventar.

[`geral/README_form_builder.md`](geral/README_form_builder.md) — construtor novo `FormBuilderPage`, o **padrão árvore+modal reutilizável** e o roadmap.

### `calendar`

Primeiro módulo da pasta nova `geral/modulos/` (cada módulo grande — depois
`networking`, `map`, `document_manager` — ganha sua própria pasta aqui).
Backend pronto: 6 recursos (`calendar_manager` + `calendar_events` e seus 4
sub-recursos — attendees/reminders/attachments/extended-properties), 108 rotas
`Api\V1\Calendar\*`. Frontend ainda só **exibição**: `/v1/form/calendario`
mostra `MonthCalendar` (mês atual) + `YearCalendar` (12 meses) calculados só
por `Date`/`Intl`, sem ler nenhuma tabela — **não existe calendário real
construído ainda**, nenhum evento é mostrado. Roadmap: criar o primeiro
`calendar` pelo modal já existente, clonar a tela para uma versão ligada a um
`calendar_id` real (eventos marcados no grid), CRUD de evento a partir do dia
clicado, sub-recursos do evento, lista de calendários.

[`geral/modulos/calendar/README_calendar.md`](geral/modulos/calendar/README_calendar.md) — estado atual (só visualização), contrato do backend e roadmap do módulo calendário.

### `comentarios`

Roteiro de como comentar o código deste frontend de forma didática, em
blocos (nunca linha a linha), para um dev júnior entender o propósito de
cada arquivo e como replicar o padrão. Adaptado de um roteiro equivalente de
outro projeto (CakePHP + JS separados) para a arquitetura real daqui, onde
não existe PHP — o `.tsx` já constrói e renderiza tudo. Cobre 3 blocos:
**Página** (`pages/v1/.../XPage.tsx` — hooks de estado, carregamento de
dados, handlers, JSX), **Camada Core** (`services/http.ts`,
`resourceFactory.ts`, hooks e contexts genéricos, `utils/*`) e **Componente
de Campo** (`components/ui/FormGrid/*` — contrato do `schema.type`, valor
"cru" vs visível). Define o formato do bloco de comentário TSDoc
(`O QUE FAZ`/`DEPENDÊNCIAS`/`CONSUMIDORES`/`COMO REAPROVEITAR`) e um
checklist de qualidade.

[`geral/README_comenta-codigo-didatico.md`](geral/README_comenta-codigo-didatico.md) — roteiro de comentários didáticos em blocos (Página / Core / Componente de Campo).

### `construtor`

Página `/v1/form-constructor` que cria formulários dinâmicos gravando na própria
API do módulo Form. Não tem schema no código: lê a árvore do `form_manager`
slug `form-constructor` da view `view_form_manager` (JSON, 1 linha por campo),
converte com `buildConstructorSchemas` (`src/services/formSchema.ts`) para
`FormGridSchema` por grupo e renderiza com `<FormGrid>` — visual equivalente ao
`src/public/form_test.html`. Os 4 grupos (`formulario`, `grupos`, `linhas`,
`campos`) descrevem os campos de `form_manager`/`form_groups`/`form_rows`/
`form_fields`; cada submit chama `form-<x>/create`. A definição vem do
`FormConstructorSeeder` (backend), que popula tudo via os Processors do módulo.
Services em `src/services/v1/form*.ts`, rota lazy em `routes/v1/form.routes.tsx`.

[`geral/README_form_constructor.md`](geral/README_form_constructor.md) — página construtor de formulários e o seed.

### `formgrid`

Fábrica de campos de formulário dirigida por um schema JSON. O componente
`FormGrid` recebe `{ rows: [{ sectionTitle?, fields: [...] }] }`, faz o switch por
`field.type` e monta a grade Bootstrap (`col` 1-12), delegando cada tipo a um
componente especializado. Cobre 22 tipos (CPF, CNPJ, CEP, telefone, moeda, data,
hora, PIS, placa, título de eleitor, CNH, processo, RENAVAM, SEI, e-mail,
textarea, senha, radio, checkbox, select com busca) mais `text`/`password`
padrão, com validação em digitação e no blur, modo controlado/não-controlado e
`<input type="hidden">` para os dígitos puros. **Portado** do `projeto55100`
para `src/components/ui/FormGrid/` (`.tsx`, TS strict máximo): imports `@/`, sem
deps do 55100 (o `cep` consulta a ViaCEP internamente), `select` com `fetch`
próprio (não acopla ao `http.ts`), helper `emitValue.ts` para os campos
mascarados. É a **fábrica de formulários** que substitui o stub
`components/global/FormField.tsx` (ainda no repo, sem uso). Falta religar nas
páginas (`pages/v1/user/user-manager/CreatePage.tsx` etc.).

[`geral/README_FormGrid.md`](geral/README_FormGrid.md) — fábrica de campos `FormGrid` dirigida por JSON.

### `grid`

Regra espelhando [`render`](#render) mas para **listagens/grids**: página que
lê dados de uma API renderiza pelo motor puro `src/utils/listConstructor.tsx`
(`toManager`/`toColumn`/`toAction`, `cellValue`/`renderCell`,
`evalBusinessRule`, `resolveHrefTemplate`) em vez de `<thead>`/`<tbody>` com
colunas fixas escritas à mão. A definição (colunas, ordenação, ações,
paginação) vem de `list_manager`/`list_columns`/`list_actions` — ver
[`listas`](#listas). Único ponto que cada página decide sozinha: ações em
modo **preview** (toast, não executa) vs **produção** (`<Link>`/chamada HTTP
reais) — foi assim que `FormConstructorListPage.tsx` (produção, ações reais)
e `ListConstructorPage.tsx` (preview) passaram a compartilhar o mesmo motor
sem duplicar código, inclusive o tratamento especial por coluna (`format`
`code`/`status-badge`).

[`geral/README_render_via_list_constructor.md`](geral/README_render_via_list_constructor.md) — regra de uso do motor de listagem e a receita de 4 passos pra consumir.

### `json`

Padrão para campos cujo **valor persistido é JSON** (lista, objeto de config)
mas que **não podem exigir o usuário digitando JSON**. A UI oferece um controle
comum (multi select, tags, switches) e o código faz o par `montar` (estado →
string JSON) / `parse` (string → estado), com o `parse` tolerante (valor legado,
JSON inválido ou formato inesperado → vazio). Vazio grava `''`. Opções sempre de
API, não lista fixa. A coluna do banco não muda por isto. Exceção: campo de
configuração livre de desenvolvedor pode ser `<textarea>` de JSON cru (não há
nenhum no módulo Form — `settings_json` foi removido). Padrão de nomenclatura:
campo de grupo de perfil = coluna `roles` (nunca `permissions`/`profile_group`).
Caso de referência: `roles` (campo "Grupo de perfil" do `FormBuilderPage`),
`<select multiple>` de `user_roles` gravando `["admin","user"]`.

[`geral/README_campo_json_montado.md`](geral/README_campo_json_montado.md) — campo grava JSON, a UI monta.

### `listas`

Banco + backend REST (endpoint-set padrão, igual módulo Form) + preview no
frontend (`/v1/list-constructor`) para o construtor de listagens:
`list_manager` 1:N `list_columns`, `list_manager` 1:N `list_actions`
(coleções irmãs, sem aninhamento — diferente do form). Formaliza em dados o
que hoje é escrito à mão em cada `get_all.js` de listagens legadas:
`list_columns` cobre `ROW_BATCH_1` (coluna/label, `field_key` vindo das
chaves da API, `concat_json` para células compostas, `sortable` +
`sort_key`/`sort_concat_json` para ordenação aplicada na API) e `list_actions`
cobre `ROW_BATCH_ACTIONS` + a matriz de permissão por linha (`roles` +
`business_rule_json`, equivalente a `getXxxPermissions(row)`). `list_manager`
guarda `default_limit`/`limit_options_json` (registros por página).
`ListConstructorPage.tsx` renderiza a grid de verdade a partir de 9 listas
semeadas (`ListConstructorSeeder` + `ListConstructorRealTablesSeeder`, 8 delas
apontando pra tabelas reais deste projeto, incluindo o módulo novo
`bootstrap-icons`), escolhidas por um `<select>`; tabela/paginação ficam
locais na página — `DataTable.tsx`/`Pagination.tsx` globais são stub
proposital, não mexido. O motor (tipos, célula, `business_rule_json`,
tratamento especial por `list_columns.format`) foi extraído pra
`utils/listConstructor.tsx` e já tem um 2º consumidor real:
`FormConstructorListPage.tsx` (`/v1/form-constructor`) não usa mais colunas
fixas no código — lê `list_manager`/`list_columns`/`list_actions` de verdade,
com ações que **executam** (`<Link>`/chamada HTTP reais), diferente do
preview (que só simula com toast). `ListBuilderPage.tsx`
(`/v1/list-constructor/create`, nos moldes do `FormBuilderPage`) já deixa
**criar listagens novas pela UI** — escolhe tabelas (`dbSchema`), árvore
`list_manager` → `list_columns`/`list_actions` (2 coleções irmãs, folha),
"Colunas (auto)" gera `list_columns` a partir das colunas reais da tabela.
`ListBuilderTree.tsx` é fork de `FormBuilderTree.tsx` (só `TreeLevel`/ícones
mudam, confirmando o padrão reutilizável já documentado em
[`builder`](#builder)); `FormModal.tsx` é reaproveitado sem fork. Sem modo
edição ainda.

[`geral/README_list_constructor.md`](geral/README_list_constructor.md) — construtor de listagens: banco, backend REST, preview, produção (`FormConstructorListPage`) e builder de listas novas (`ListBuilderPage`).

### `modal`

Regra: **todo modal sempre centralizado** (`modal-dialog-centered`) — nunca
colado no topo da página. Nenhum modal daqui usa a instância JS do Bootstrap
(`data-bs-toggle`); todos são controlados por estado React (`open` via
`useState`), renderizando o markup (`.modal.fade.show.d-block` +
`.modal-backdrop`) na mão. Dois componentes cobrem os casos: `Modal.tsx`
(genérico, sem footer próprio — caso de referência: `FormRendererPage.tsx`,
formulário dentro do modal) e `ConfirmModal.tsx` (confirmação, botões fixos
Confirmar/Cancelar). Checar os dois antes de criar um modal novo.

[`geral/README_modal.md`](geral/README_modal.md) — padrão de modal (sempre centralizado, estado React) e os dois componentes existentes.

### `node`

Comandos do Node/Vite e mapa dos módulos de `src/`. O frontend **não usa
`.env`** nem container: as chaves `VITE_*` têm defaults em `src/config/env.ts`
(`base` `/`, `/api`, `v1`, `/ws`). Começa pelo comando principal
(`npm run dev` no host: dev-server em `http://localhost:54910/` com proxy `/api`
e `/ws` para `:54900`) e os scripts. Depois detalha o **BUILD e deploy**
(`npm run build`): saída estática em `src/frontend/projeto54900/dist/`,
`base` = `VITE_BASE_PATH` ou `/`, publicar o conteúdo de `dist/` num servidor
estático com fallback de SPA para `index.html` — app na raiz ou em subpasta
(`VITE_BASE_PATH=/app/`). Fecha com uma tabela de função por pasta/arquivo do
`src/`, incluindo o espelho `services/` ↔ endpoints e o fluxo do construtor.

[`geral/README_node_comandos_modulos.md`](geral/README_node_comandos_modulos.md) — comandos Node, build/deploy e módulos do frontend.

### `paginas`

Convenção `pages/v1/<modulo>/<recurso>/<Acao>Page.tsx`, espelhando como a API
agrupa módulo → recurso/tabela → ação (`README_rotas_swagger.md` do backend).
1 arquivo por ação, nomeado pelo verbo do endpoint (`CreatePage`, `UpdatePage`,
`GetAllPage`, `GetPage`); módulo de 1 recurso só dispensa a subpasta (ex.
hipotético `pages/v1/plane/CreatePage.tsx`). Fluxo composto (grava em mais de 1
tabela do módulo, ligadas por FK) ganha **pasta própria na raiz do módulo**,
nomeada pelo que faz — caso de referência: `pages/v1/user/register/RegisterPage.tsx`
(login em `user-manager`, depois perfil em `user-profiles`). Regra de idioma:
rota/arquivo/pasta/variável **sempre em inglês**; comentário e texto visível ao
usuário **continuam em português**.

[`geral/README_paginas_modulo.md`](geral/README_paginas_modulo.md) — convenção de páginas por módulo/recurso/ação e onde entram fluxos compostos.

### `render`

Regra: **campo de formulário no frontend passa pelo `<FormGrid>`** (schema JSON),
não `<input>`/`<label>`/coluna Bootstrap/validação escritos à mão. A fábrica
(`components/ui/FormGrid/Input`, `default FormGrid`, `FormGridSchema = { rows:
[{ sectionTitle?, fields: [] }] }`, 22 tipos) já resolve grade, máscara,
validação e serialização. O tipo `select` cobre opções remotas (`src`) e
múltiplas (`multiple` + `values` + `onChangeMultiple`). Exceção: chrome que não
é campo (cabeçalhos, botões) — o seletor de tabelas do `FormBuilderPage` já usa
`<FormGrid>` e é o modelo. Débito registrado: o subcard FORMULÁRIO/GRUPOS do
`FormBuilderPage` (commit `0050e27`) é markup manual e deve virar
`FormGridSchema` — "Grupo de perfil" é o primeiro alvo. API completa em
[`formgrid`](#formgrid).

[`geral/README_render_via_formgrid.md`](geral/README_render_via_formgrid.md) — regra de uso do `FormGrid` e o débito do `FormBuilderPage`.

### `rotas`

Mapa textual de todas as rotas React registradas no data router
(`react-router-dom`), espelhando o `README_rotas_swagger.md` do backend mas com
o eixo **Path → Página**. Cobre a raiz (`/`, `*`, `RouteErrorPage`), o grupo
`v1` (`user-manager` por ação — `create`/`update`/`get-all`/`get` —, o wizard
`/v1/register`, `upload-manager`, `form` — incluindo o renderizador genérico
`/v1/form/:slug`), o stub `v1a` e os links da navbar. Registra também lacunas
encontradas (ex.: `paths.v1.upload.new` sem rota registrada). Ver [`paginas`](#paginas)
para a convenção de pastas por trás dessas rotas.

[`geral/README_rotas_frontend.md`](geral/README_rotas_frontend.md) — mapa de todas as rotas React do frontend.

---

## Conteúdo

### `geral/`

- [`README_alerta_padroes_ui.md`](geral/README_alerta_padroes_ui.md) — ⚠️ checklist de padrões de UI a checar antes de criar/editar, e o caso aberto da sessão de login na navbar.
- [`README_atualiza_readme.md`](geral/README_atualiza_readme.md) — como atualizar esta base de conhecimento.
- [`README_campo_json_montado.md`](geral/README_campo_json_montado.md) — campo cujo valor é JSON montado pela UI (o usuário não digita JSON).
- [`README_comenta-codigo-didatico.md`](geral/README_comenta-codigo-didatico.md) — roteiro de comentários didáticos em blocos, adaptado para Página/Core/Componente de Campo (React/TSX).
- [`README_form_builder.md`](geral/README_form_builder.md) — construtor novo `FormBuilderPage` (`/v1/form-constructor`), o padrão reutilizável árvore+modal, estado atual e roadmap.
- [`README_form_constructor.md`](geral/README_form_constructor.md) — página `/v1/form-constructor` e o `FormConstructorSeeder`.
- [`README_FormGrid.md`](geral/README_FormGrid.md) — componente `FormGrid`: fábrica de campos por schema JSON.
- [`README_list_constructor.md`](geral/README_list_constructor.md) — construtor de listagens (`list_manager`/`list_columns`/`list_actions`): banco, backend REST, preview, produção (`FormConstructorListPage.tsx` migrada) e builder de listas novas (`ListBuilderPage.tsx`).
- [`README_modal.md`](geral/README_modal.md) — padrão de modal: sempre centralizado (`modal-dialog-centered`), estado React, `Modal.tsx` genérico vs `ConfirmModal.tsx` de confirmação.
- [`README_node_comandos_modulos.md`](geral/README_node_comandos_modulos.md) — comandos Node/Vite (dev no host), build/deploy por `dist/` e mapa dos módulos de `src/`.
- [`README_paginas_modulo.md`](geral/README_paginas_modulo.md) — convenção de páginas por módulo/recurso/ação (`pages/v1/<modulo>/<recurso>/<Acao>Page.tsx`) e fluxo composto em pasta própria.
- [`README_render_via_formgrid.md`](geral/README_render_via_formgrid.md) — campo de formulário renderiza via `<FormGrid>` (schema JSON), não markup manual; débito do `FormBuilderPage`.
- [`README_render_via_list_constructor.md`](geral/README_render_via_list_constructor.md) — listagem renderiza via o motor `list_manager`/`list_columns`/`list_actions` (`utils/listConstructor.tsx`), não tabela manual; receita de consumo.
- [`README_rotas_frontend.md`](geral/README_rotas_frontend.md) — mapa de todas as rotas React do frontend, espelhando o `README_rotas_swagger.md` do backend.

### `geral/modulos/calendar/`

- [`README_calendar.md`](geral/modulos/calendar/README_calendar.md) — módulo calendário: estado atual (só visualização), contrato do backend (6 recursos, 108 rotas) e roadmap.

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
