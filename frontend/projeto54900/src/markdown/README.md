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
| [`atualizacao`](#atualizacao) | Registrar novo markdown neste índice     |
| [`builder`](#builder)         | Construtor novo: tabela vira formulário  |
| [`construtor`](#construtor)   | Página cria formulários via API          |
| [`formgrid`](#formgrid)       | Fábrica de campos dirigida por JSON      |
| [`json`](#json)               | Campo monta JSON sem digitação           |
| [`node`](#node)               | Comandos do Node e módulos               |
| [`render`](#render)           | Renderizar formulário só via FormGrid    |

---

## Resumos

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
(`dbSchema.tables()` / `dbSchema.columns(tabela)`) e mantém **tudo só em estado
local: nada persiste ainda**. Ao escolher tabelas no `select multiple`, cada
tabela vira um card: `card-header` só com o nome da tabela, `card-body` com um
subcard `FORMULÁRIO` (campos de `form_manager`, 1:1) e N subcards `GRUPOS`
(campos de `form_groups`). Decisões já tomadas: `form_manager` identificado só
por `slug` (nasce vazio e acompanha o Título enquanto `slugAuto`; obrigatório),
página em `.container`, grids dos
subcards responsivos (`col-12` no celular, proporção original a partir de `sm`),
casca comum `card bg-body-tertiary` + `row g-2` + `form-control-sm`. Próximos
passos: `form_rows` (ordem e colunas por linha) e `form_campos` (os campos) —
este com observação de nomenclatura (tabela em português; enum `field_type`
misturando pt/en/documentos BR).

[`geral/README_form_builder.md`](geral/README_form_builder.md) — construtor novo `FormBuilderPage` e o roadmap (rows, campos).

### `construtor`

Página `/v1/form-constructor` que cria formulários dinâmicos gravando na própria
API do módulo Form. Não tem schema no código: lê a árvore do `form_manager`
slug `form-constructor` da view `view_form_manager` (JSON, 1 linha por campo),
converte com `buildConstructorSchemas` (`src/services/formSchema.ts`) para
`FormGridSchema` por grupo e renderiza com `<FormGrid>` — visual equivalente ao
`src/public/form_test.html`. Os 4 grupos (`formulario`, `grupos`, `linhas`,
`campos`) descrevem os campos de `form_manager`/`form_groups`/`form_rows`/
`form_campos`; cada submit chama `form-<x>/create`. A definição vem do
`FormConstructorSeeder` (backend), que popula tudo via os Processors do módulo.
Services em `src/services/v1/form*.ts`, rota lazy em `routes/v1/form.routes.tsx`.

[`geral/README_form_constructor.md`](geral/README_form_constructor.md) — página construtor de formulários e o seed.

### `formgrid`

Fábrica de campos de formulário dirigida por um schema JSON. O componente
`FormGrid` recebe `{ rows: [{ sectionTitle?, fields: [...] }] }`, faz o switch por
`field.type` e monta a grade Bootstrap (`col` 1-12), delegando cada tipo a um
componente especializado. Cobre 21 tipos (CPF, CNPJ, CEP, telefone, moeda, data,
hora, PIS, placa, título de eleitor, CNH, processo, RENAVAM, SEI, e-mail,
textarea, senha, radio, checkbox, select com busca) mais `text`/`password`
padrão, com validação em digitação e no blur, modo controlado/não-controlado e
`<input type="hidden">` para os dígitos puros. **Portado** do `projeto55100`
para `src/components/ui/FormGrid/` (`.tsx`, TS strict máximo): imports `@/`, sem
deps do 55100 (o `cep` consulta a ViaCEP internamente), `select` com `fetch`
próprio (não acopla ao `http.ts`), helper `emitValue.ts` para os campos
mascarados. É a **fábrica de formulários** que substitui o stub
`components/global/FormField.tsx` (ainda no repo, sem uso). Falta religar nas
páginas (`UserFormPage` etc.).

[`geral/README_FormGrid.md`](geral/README_FormGrid.md) — fábrica de campos `FormGrid` dirigida por JSON.

### `json`

Padrão para campos cujo **valor persistido é JSON** (lista, objeto de config)
mas que **não podem exigir o usuário digitando JSON**. A UI oferece um controle
comum (multi select, tags, switches) e o código faz o par `montar` (estado →
string JSON) / `parse` (string → estado), com o `parse` tolerante (valor legado,
JSON inválido ou formato inesperado → vazio). Vazio grava `''`. Opções sempre de
API, não lista fixa. A coluna do banco não muda por isto. Exceção: campo de
configuração livre de desenvolvedor pode ser `<textarea>` de JSON cru (não há
nenhum no módulo Form — `settings_json` foi removido). Caso de referência:
`profile_group` (campo "Grupo de perfil" do `FormBuilderPage`), `<select
multiple>` de `user_roles` gravando `["admin","user"]`.

[`geral/README_campo_json_montado.md`](geral/README_campo_json_montado.md) — campo grava JSON, a UI monta.

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

---

## Conteúdo

### `geral/`

- [`README_atualiza_readme.md`](geral/README_atualiza_readme.md) — como atualizar esta base de conhecimento.
- [`README_campo_json_montado.md`](geral/README_campo_json_montado.md) — campo cujo valor é JSON montado pela UI (o usuário não digita JSON).
- [`README_form_builder.md`](geral/README_form_builder.md) — construtor novo `FormBuilderPage` (`/v1/form-constructor`), estado atual e roadmap.
- [`README_form_constructor.md`](geral/README_form_constructor.md) — página `/v1/form-constructor` e o `FormConstructorSeeder`.
- [`README_FormGrid.md`](geral/README_FormGrid.md) — componente `FormGrid`: fábrica de campos por schema JSON.
- [`README_node_comandos_modulos.md`](geral/README_node_comandos_modulos.md) — comandos Node/Vite (dev no host), build/deploy por `dist/` e mapa dos módulos de `src/`.
- [`README_render_via_formgrid.md`](geral/README_render_via_formgrid.md) — campo de formulário renderiza via `<FormGrid>` (schema JSON), não markup manual; débito do `FormBuilderPage`.
