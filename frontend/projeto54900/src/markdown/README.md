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

**1. Começar**

| #   | Palavra-chave                 | Assunto (5 palavras)               |
| --- | ----------------------------- | ---------------------------------- |
| 1   | [`node`](#node)               | Comandos do Node e módulos         |
| 2   | [`paginas`](#paginas)         | Página por módulo, recurso e ação  |
| 3   | [`alerta`](#alerta)           | Checklist antes de criar UI        |
| 4   | [`placeholder`](#placeholder) | Placeholder vazio não é bug        |
| 5   | [`comentario`](#comentario)   | Comentar código em estilo didático |

**2. Telas e navegação**

| #   | Palavra-chave         | Assunto (5 palavras)               |
| --- | --------------------- | ---------------------------------- |
| 6   | [`rotas`](#rotas)     | Mapa de todas as rotas React       |
| 7   | [`menu`](#menu)       | Nav e menu: duas tabelas           |
| 8   | [`modal`](#modal)     | Padrão único de modal centralizado |
| 9   | [`envhost`](#envhost) | O que isDevHost() libera hoje      |

**3. Formulários**

| #   | Palavra-chave               | Assunto (5 palavras)                    |
| --- | --------------------------- | --------------------------------------- |
| 10  | [`formgrid`](#formgrid)     | Fábrica de campos dirigida por JSON     |
| 11  | [`render`](#render)         | Renderizar formulário só via FormGrid   |
| 12  | [`json`](#json)             | Campo monta JSON sem digitação          |
| 13  | [`rota`](#rota)             | Campo de rota vira select               |
| 14  | [`construtor`](#construtor) | Página cria formulários via API         |
| 15  | [`builder`](#builder)       | Construtor novo: tabela vira formulário |

**4. Listagens**

| #   | Palavra-chave           | Assunto (5 palavras)              |
| --- | ----------------------- | --------------------------------- |
| 16  | [`listas`](#listas)     | Estrutura de banco para listagens |
| 17  | [`listagem`](#listagem) | Consumir o motor de listagens     |

**5. Módulos de negócio**

| #   | Palavra-chave               | Assunto (5 palavras)                    |
| --- | --------------------------- | --------------------------------------- |
| 18  | [`empresas`](#empresas)     | Empresas e acesso individual            |
| 19  | [`mensagens`](#mensagens)   | Listas e CRUD de mensagens              |
| 20  | [`timeline`](#timeline)     | Feed social: pronto, com pendências     |
| 21  | [`calendario`](#calendario) | Módulo calendário: só visualização hoje |
| 22  | [`mapa`](#mapa)             | Mapa Leaflet e vínculo a módulos        |
| 23  | [`produtos`](#produtos)     | Produto, movimento, serviço: telas prontas |

**6. Manutenção**

| #   | Palavra-chave                 | Assunto (5 palavras)                 |
| --- | ----------------------------- | ------------------------------------ |
| 24  | [`sessao`](#sessao)           | Sessão única entre abas, janelas     |
| 25  | [`atualizacao`](#atualizacao) | Registrar novo markdown neste índice |

**7. Template e temas**

| #   | Palavra-chave             | Assunto (5 palavras)                |
| --- | ------------------------- | ----------------------------------- |
| 26  | [`template`](#template)   | Modelo Template001 para empresas futuras |
| 27  | [`temas`](#temas)         | Paletas JSON de cores selecionáveis |
| 28  | [`template002`](#template002) | Template002 sem bordas, por empresa |
| 29  | [`template003`](#template003) | Template003 com menu em Offcanvas   |

---

## Resumos

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

### `alerta`

Alerta registrado em 2026-09-14 depois de um erro real: um elemento de navbar
foi adicionado direto em `Navbar.tsx`, fora de `temp-nav`/`temp-menu`.
Checklist obrigatório antes de escrever qualquer UI nova (item de navbar,
campo de formulário, página, rota, campo JSON, modal): se nenhum item do
checklist cobrir o caso, é sinal de decisão em aberto — **parar e perguntar**,
nunca inventar um padrão novo sozinho. Registra também, como caso de
referência, a decisão final sobre onde mora o estado de sessão (Entrar/Sair)
na navbar.

[`geral/README_alerta_padroes_ui.md`](geral/README_alerta_padroes_ui.md) — checklist obrigatório antes de criar UI nova.

### `placeholder`

Várias telas foram criadas como placeholders intencionais — `<EmptyState>`
fixo ("Formulário/Listagem em branco") + comentário `EM BRANCO ate a fabrica`.
**Não é bug de dado ausente**: é código nunca religado, e o sintoma engana
(parece faltar cadastro no banco, mas a tela nem chega a chamar a API).
Receita para religar: confirmar que é mesmo placeholder, checar se existe
build no `form_manager` (pipeline dinâmico) ou escrever o schema à mão (CRUD
direto), atenção ao select cuja lista carrega depois do primeiro render (usar
`src`, nunca `options` num `useState`), e sempre testar no navegador — `tsc`
limpo não prova que a tela funciona.

[`geral/README_erro_placeholder.md`](geral/README_erro_placeholder.md) — como identificar e religar um placeholder "em branco".

### `comentario`

Roteiro para comentar código React/TSX de forma didática — em **blocos**,
nunca linha a linha — adaptado de um roteiro equivalente usado em outro
projeto. Abre com três alertas críticos: esta tarefa é **só documentação**
(bug encontrado durante a leitura vira tarefa nova, nunca corrigido no mesmo
diff), `*/` dentro de um bloco `/** */` **quebra o comentário** (e o arquivo
inteiro), e nunca usar emoji dentro do texto do comentário. Cobre os três
alvos do stack: Página (`pages/v1/.../XPage.tsx`), camada Core (`services/`,
`hooks/`, `context/`, `utils/`) e componente de campo do `FormGrid`.

[`geral/README_comenta-codigo-didatico.md`](geral/README_comenta-codigo-didatico.md) — como comentar código React/TSX em blocos didáticos.

### `rotas`

Mapa textual de todas as rotas React registradas no data router
(`react-router-dom`), espelhando o `README_rotas_swagger.md` do backend mas com
o eixo **Path → Página**. Cobre a raiz (`/`, `/acesso-negado`, `*`,
`RouteErrorPage`), o grupo `v1` (`auth`/login, `user-manager` por ação
— `create`/`update/:id`/`:id`/lista —, `user-profiles` e as duas rotas públicas
do Cadastro de Usuário, `account`, `upload-manager`, `form` — incluindo
`/v1/form/:slug` e `/v1/form-constructor/:table/:id` —, `list-constructor`,
`temp-nav`, `temp-menu`, `calendar-manager` e `svg-map`), as **guardas**
(`RequireAuth` no bloco v1 e `RequireRole role="admin"` nos módulos
administrativos), o stub `v1a` e o dropdown do usuário na navbar — que é
dinâmica, alimentada por `temp_menu`. Registra também lacunas encontradas
(ex.: `paths.v1.upload.new` sem rota registrada). Ver [`paginas`](#paginas) para
a convenção de pastas por trás dessas rotas.

[`geral/README_rotas_frontend.md`](geral/README_rotas_frontend.md) — mapa de todas as rotas React do frontend.

[`geral/README_rota_empresa_slug.md`](geral/README_rota_empresa_slug.md) — rota multiempresa `/<slug-empresa>/v1/...`: basename, login, `RequireAuth` e logout.

### `menu`

`temp_nav` (a casca do app: nome, imagem, ícone, versão) e `temp_menu`
(a árvore de itens, com `parent_id` para submenu) são duas tabelas distintas
ligadas por FK — nenhuma delas é "o menu" sozinha. `useSiteMenu.ts` só lê
itens com `parent_id = NULL`, `react_route` preenchida e `sort_order < 100`;
hoje **não existe** dropdown/submenu na navbar pública. Documenta as faixas de
`sort_order` (navbar real / catálogo "Extra" / árvore administrativa) e erros
já cometidos (seed duplicando itens por não checar o que já existia, charset
`utf8` mojibake em `INSERT` direto).

[`geral/README_menu.md`](geral/README_menu.md) — como a navbar e a árvore administrativa de menu são montadas.

### `modal`

Regra: todo modal do frontend é **sempre centralizado** (`modal-dialog-centered`
em Bootstrap 5), nunca colado no topo da viewport, e controlado por **estado
React** (`open` via `useState`), nunca pela instância JS do Bootstrap
(`data-bs-toggle`/`bootstrap.Modal`). Dois componentes prontos cobrem a maioria
dos casos — `components/global/Modal.tsx` (genérico, sem footer próprio) e
`ConfirmModal.tsx` (confirmação, botões fixos) —; só criar um terceiro se o
caso não for nem um nem outro.

[`geral/README_modal.md`](geral/README_modal.md) — padrão de modal centralizado e controlado por React.

### `envhost`

`isDevHost()` (`config/envHost.ts`) compara `window.location.hostname` contra a
lista fixa `DEV_HOSTS` para decidir se um comportamento **dev-only** deve
aparecer — diferente de `env.isDev`, que só diz se o bundle foi buildado em
modo dev. Hoje libera dois comportamentos: o painel `ApiDebugPanel` (histórico
das últimas respostas de API + `access_token` mais recente decodificado) e o
`FakeFillButton` (preenche o formulário aberto com dados fake válidos,
respeitando as regras de negócio reais de cada `slug`). Documento cresce por
seção numerada a cada novo uso de `isDevHost()`.

[`geral/README_envHost.md`](geral/README_envHost.md) — o que `isDevHost()` libera hoje.

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

### `rota`

Regra geral, válida para qualquer construtor: **nenhum campo que armazena uma
rota/endpoint é `<input type="text">`** — sempre um `<select>` carregado de
`route_manager`, mostrando `method - object - action` (`labelTemplate`) e
gravando a coluna `endpoint` (`valueKey`). Cobre qualquer campo com sufixo
`_endpoint`/`_route`/`_url_template` (`href_template`, `api_endpoint`,
`submit_endpoint`, `api_get_endpoint`, `api_search_endpoint`). Checklist
obrigatório antes de aplicar: conferir se o `object` existe em `route_manager`
e se a tabela bate com o código-fonte real (rotas de backend ou de frontend,
prefixo `/api` só no backend), corrigindo tabela **e** os dois READMEs de
rotas juntos quando divergir.

[`geral/README_campo_select_rota.md`](geral/README_campo_select_rota.md) — campo de rota é sempre um select de `route_manager`.

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
árvore de estrutura: cada nível é uma **linha compacta colapsável**
(chevron + `[+]` para adicionar nó, que aparece na árvore com scroll + "pisca");
o **formulário de cada nó abre num modal** (`<FormGrid>`, botão ✏️). Colapso e
modal são **estado React**, não os plugins JS do Bootstrap. Decisões: `form_manager`
identificado só por `slug` (nasce vazio, acompanha o Título enquanto `slugAuto`).

**⭐ Padrão reutilizável** — os componentes `FormBuilderTree.tsx` (`<FormTree>` /
`<TreeNode>`) + `FormModal.tsx` são **genéricos**: servem para qualquer tela de
estrutura pai→filho de N níveis com formulário por nó. Ver a seção destacada no
markdown antes de reinventar.

[`geral/README_form_builder.md`](geral/README_form_builder.md) — construtor novo `FormBuilderPage`, o **padrão árvore+modal reutilizável** e o roadmap.

### `listas`

Estrutura de banco (`list_manager` 1:N `list_columns`/`list_actions`) para
descrever grids/listagens alimentadas por API — paginação, ordenação, colunas
compostas e ações por linha com permissão —, no mesmo espírito do
[construtor de formulários](#builder). Estado atual: banco + backend REST +
frontend completo — preview (`/v1/list-constructor`, `ListConstructorPage.tsx`)
e builder de listagens novas (`/v1/list-constructor/create`,
`ListBuilderPage.tsx`, nos moldes do `FormBuilderPage`), com modo edição.
Registra a simplificação de `list_actions` (13→10 campos, só o que é
funcional) e o motor compartilhado `src/utils/listConstructor.tsx`.

[`geral/README_list_constructor.md`](geral/README_list_constructor.md) — modelo de dados do construtor de listas e estado do frontend.

### `listagem`

Regra do frontend, espelhando [`render`](#render) mas para listagens/grids em
vez de formulários: uma tabela que lê dados de uma API passa pelo motor
`src/utils/listConstructor.tsx` (tipos + funções puras, sem estado React),
consumindo a definição em `list_manager`/`list_columns`/`list_actions` — nunca
`<thead>`/`<tbody>` com colunas fixas escritas à mão. Receita de 4 passos:
carregar a definição, buscar os dados reais no `api_get_endpoint`, renderizar
colunas via `renderCell`/`cellValue`, e renderizar ações decidindo entre toast
de pré-visualização (preview) ou execução real (produção). Inclui o padrão de
paginação por footer (`paginationWindow`, `src/utils/pagination.ts`).

[`geral/README_render_via_list_constructor.md`](geral/README_render_via_list_constructor.md) — regra de uso do motor de listagens e o footer de paginação.

### `empresas`

Módulo `company_manager`: cadastro de empresas (`/v1/company-manager`) e permissão individual de usuário a form/list
(`/v1/user-resource-access`), mais as ações **Empresas** e **Acesso individual** na lista de usuários. Nasceram dois
**componentes globais** por props: `ListBuild` (listagem por slug de `list_manager`) e `RecordFormBuild` (cadastro/edição
por slug de `form_manager`); as páginas são só wrappers. `checkResourceAccess`/`isDenied` (`services/v1/resourceAccess.ts`)
consultam `GET resource-access/check` e são aplicados em `ListBuild`, `RecordFormBuild`, `FormBuild` e `FormRendererPage`.
Inclui a tela de **seleção de empresa + marcação de usuários** (`/v1/company-members/update/:id`, modal de 2 etapas no "Novo"), espelho de `message-group-members-manager`.
O `check` de acesso agora vale também nas 24 listas e 24 formulários antigos. Pendências: empresa não exibida/filtrada no app, telas não abertas no navegador.

[`geral/modulos/company-manager/README_plano.md`](geral/modulos/company-manager/README_plano.md) — módulo company_manager no frontend, componentes globais e pendências.

### `locais`

Módulo `location`: locais em árvore recursiva (`/v1/location-manager`, visões Árvore e Tabela) e tipos de local (`/v1/location-types`, admin). Novo componente global `TreeBuild` (árvore por props, lista plana agrupada por `parent_id`). Forms 67–70, listas 56–57 e menu 72–74 por seed SQL. Pendências: telas não abertas no navegador, GetPage e ligação com o Map.

[`geral/modulos/location/README_plano.md`](geral/modulos/location/README_plano.md) — módulo location no frontend, `TreeBuild` e pendências.

### `mensagens`

Módulo `messages` (mensagens diretas 1 para 1 ou para grupo, com agendamento; **nunca um
chat**). Pronto: menu "Mensagem" > "Lista" e "Grupos", e para cada recurso a lista com busca,
o cadastro e a edição (CRUD de tela) com formulários que trazem quase todas as colunas da
tabela, remetente/dono preenchido com o usuário logado e select que impede enviar para si
mesmo. Peças compartilhadas novas: `utils/formSchemaPatch.ts` e a correção do campo
`datahora`. Falta: tela de conversa estilo chat, lista lateral de interlocutores (o service
existe sem consumidor), envio para grupo, membros do grupo, marcação de usuário e anexos.

[`geral/modulos/messages/README_plano.md`](geral/modulos/messages/README_plano.md) — módulo messages, estado atual e pendências.

### `timeline`

Módulo `timeline` (feed social), segundo da pasta `geral/modulos/`. Backend
completo e testado (7 tabelas/views, 189 rotas + rota extra `home-feed` com o
algoritmo do feed misto). Frontend com duas telas: listagem clássica
(`/v1/timeline-posts`, motor `list_manager`) e Home Feed (`/v1/timeline`,
scroll infinito, card único, botão flutuante de novo post) — os 5 formulários
do módulo já funcionam pelo renderizador genérico `/v1/form/<slug>`, sem
página própria. Dois componentes globais novos:
[`hooks/useInfiniteScroll.ts`](../hooks/useInfiniteScroll.ts) (1º hook de
scroll infinito do projeto) e
[`components/global/MediaPreview.tsx`](../components/global/MediaPreview.tsx)
(imagem/vídeo inline, demais categorias em ícone). Pendências: upload de
anexo não ligado no backend, curtir/avaliar "write-only", sem página de
detalhe/edição de post, falta a listagem agrupada por usuário criador.

[`geral/modulos/timeline/README_plano.md`](geral/modulos/timeline/README_plano.md) — módulo timeline, estado atual e pendências.

### `calendario`

Módulo `calendar` (espelho do Google Calendar), primeiro da pasta
`geral/modulos/`. Backend completo: 6 tabelas (`calendar_manager`,
`calendar_events`, `calendar_event_attendees`, `calendar_event_reminders`,
`calendar_event_attachments`, `calendar_event_extended_properties`) com CRUD
REST inteiro. Frontend ainda **só visualização**: `MonthCalendar`/`YearCalendar`
calculam a grade por `Date`/`Intl` puro e não leem nenhuma tabela do banco;
criar um calendário pelo modal grava em `calendar_manager`, mas a tela não
volta e não mostra esse calendário nem seus eventos. Roadmap: ligar a
visualização a um `calendar_id` real, marcar dias com evento e abrir CRUD de
evento a partir do dia clicado.

[`geral/modulos/calendar/README_calendar.md`](geral/modulos/calendar/README_calendar.md) — módulo calendário, estado atual e roadmap.

### `mapa`

Componentes **react-leaflet** (Leaflet 1.9.4 + react-leaflet 5, tiles do OpenStreetMap) para ponto, endereço,
CEP e rota com tempo de deslocamento. Tudo por props, sem `useParams`: `MapView` (marcadores `divIcon` com
Bootstrap Icons), `AddressSearch`, `CepSearch`, `RoutePlanner`, `MapLinkPicker` (modal com 4 abas) e
`MapLinksPanel`, o painel que mostra e edita os vínculos de **qualquer registro de qualquer módulo**
(`module` + `referenceId`, via `view_map_links`; módulo registrado em `Config/MapLinkables.php` no backend,
inclusive Upload). Endereços, CEP e trajetos passam sempre pelo proxy `map-geo` do backend (cache, limite e
chave do OpenRouteService só no servidor). Páginas `/v1/map` (`MapExplorer`) e `/v1/map/links/:module/:id`,
10 serviços `map*` + `mapGeo`, ação “Mapa” piloto na lista do Upload e o **administrativo completo dos 10
recursos** (lista, cadastro, edição, exclusão e menu pelos builders `ListBuild`/`RecordFormBuild`; dispensas
documentadas para o cache de geocodificação e os trajetos). Tipos, lint, build de teste e validação dos dados sem
erro; inclui o compartilhamento de localização nas conversas de mensagens (geo URI, `ShareLocationModal`/`ViewLocationModal`). **Ainda não verificado em tela**; pendente o tipo `map` no FormGrid.

[`geral/README_mapa.md`](geral/README_mapa.md) — componentes do mapa, rotas e como um módulo usa o mapa.

### `produtos`

Telas de Produto (54 rotas), Movimento (36) e Serviço (90): árvores e tabelas,
detalhes, formulários com `roles` por registro, saldo de estoque e fluxo de status do
pedido e do movimento, por seed SQL (forms, listas, menu, `route_manager`) e páginas
finas. Componentes globais novos: `RecordTree`, `TreeListPage`, `RecordDetail`,
`RecordFormWithRoles`, `AttributeEditor`, `StatusActions`, `StockCard`. Pendências:
telas não abertas no navegador, API sem filtro por `roles`, catálogos duplicados.

[`geral/modulos/product-movement-service/README_pendencias.md`](geral/modulos/product-movement-service/README_pendencias.md) — frontend de produto, movimento e serviço: telas, seed, componentes e pendências.

### `sessao`

O login vale para todas as abas e janelas do mesmo navegador. O `access_token` fica em
memória e o `refresh_token` no `localStorage`; como o servidor guarda uma sessão por
usuário, cada refresh invalida o token das outras abas. As abas se coordenam por
`BroadcastChannel`: a aba nova adota a sessão de quem já tem uma (sem girar o token),
quem renova avisa as demais e o logout propaga. Chamadas à API esperam o refresh inicial.

[`geral/README_sessao_entre_abas.md`](geral/README_sessao_entre_abas.md) — sessão compartilhada entre abas: problema, mecanismos e conferência.

### `atualizacao`

Como manter esta base viva. Todo markdown novo em `src/markdown/` exige atualizar
`README.md`: acrescentar a linha no índice (palavra-chave + frase de 5 palavras),
escrever o bloco de resumo e adicionar o link para o conteúdo completo ao fim do
próprio resumo. Todo markdown da base começa e termina com um link para este
`README.md`. Esta base alimenta o `CLAUDE.md` do frontend.

[`geral/README_atualiza_readme.md`](geral/README_atualiza_readme.md) — atualização desta base de conhecimento.

### `template`

Template001: página estática que serve de modelo para o template de cada empresa.
Conteúdo em JSON de arrays, cinco regiões (cabeçalho, nav, menu lateral, conteúdo,
rodapé) em Bootstrap, responsivo do celular à TV, ocupando a tela toda, com X para
ocultar regiões e botões de nav e menu no celular. Traz o mapa de arquivos, o
histórico dos pedidos e o passo a passo para criar o template de uma empresa.
Inclui o Template002, variante sem bordas com degradê entre os componentes.

[`geral/README_template001_modelo.md`](geral/README_template001_modelo.md) — modelo Template001 para templates por empresa.

### `temas`

Paletas de cores em JSON (`src/config/themes/`), escolhidas por `env.theme`
(`VITE_THEME`). Todos os JSONs têm as mesmas 24 chaves: degradê da página, 3D das
bordas e fundo, borda e letra de cada região. `_white` é suave, `_dark` é intenso;
um JSON novo na pasta funciona sem alterar código. Inclui o critério de contraste.

[`geral/README_temas_paleta.md`](geral/README_temas_paleta.md) — contrato e lista das paletas de cores.

### `template002`

Template002: variante sem bordas do Template001, com degradê entre os componentes e as mesmas paletas,
animações e contrato de JSON. Registra a empresa vinculada no banco (`temp_manager.company_manager`,
DEV em 2026-10-29: `tryikads`), a rota `/<slug>/template002`, os arquivos e as diferenças em relação
ao 001.

[`geral/README_template002_modelo.md`](geral/README_template002_modelo.md) — Template002: empresa vinculada, arquivos e diferenças.

### `template003`

Template003: parte do 002 e troca o menu lateral fixo por um painel Offcanvas aberto pelo ícone da
grade no nav. Registra que nenhuma empresa está vinculada a ele no banco (`temp_manager` id 3 com `[]`),
a pendência da empresa `drsergiopsicologo` (sem template vinculado), a rota `/<slug>/template003` e os
arquivos.

[`geral/README_template003_modelo.md`](geral/README_template003_modelo.md) — Template003: Offcanvas, vínculo com empresas e arquivos.

---

## Conteúdo

### `geral/`

- [`README_alerta_padroes_ui.md`](geral/README_alerta_padroes_ui.md) — checklist obrigatório antes de criar UI nova (navbar, campo, página, rota, campo JSON, modal); caso de referência do estado de sessão na navbar.
- [`README_atualiza_readme.md`](geral/README_atualiza_readme.md) — como atualizar esta base de conhecimento.
- [`README_campo_json_montado.md`](geral/README_campo_json_montado.md) — campo cujo valor é JSON montado pela UI (o usuário não digita JSON).
- [`README_campo_select_rota.md`](geral/README_campo_select_rota.md) — campo que grava uma rota/endpoint é sempre um `<select>` de `route_manager`.
- [`README_comenta-codigo-didatico.md`](geral/README_comenta-codigo-didatico.md) — roteiro para comentar código React/TSX em blocos didáticos.
- [`README_erro_placeholder.md`](geral/README_erro_placeholder.md) — como identificar e religar telas placeholder "em branco".
- [`README_form_builder.md`](geral/README_form_builder.md) — construtor novo `FormBuilderPage` (`/v1/form-constructor`), o padrão reutilizável árvore+modal, estado atual e roadmap.
- [`README_form_constructor.md`](geral/README_form_constructor.md) — página `/v1/form-constructor` e o `FormConstructorSeeder`.
- [`README_FormGrid.md`](geral/README_FormGrid.md) — componente `FormGrid`: fábrica de campos por schema JSON.
- [`README_envHost.md`](geral/README_envHost.md) — o que `isDevHost()` libera hoje (`ApiDebugPanel`, `FakeFillButton`).
- [`README_list_constructor.md`](geral/README_list_constructor.md) — modelo de dados do construtor de listas (`list_manager`/`list_columns`/`list_actions`) e estado do frontend.
- [`README_menu.md`](geral/README_menu.md) — como a navbar e a árvore administrativa de menu (`temp_nav`/`temp_menu`) são montadas.
- [`README_mapa.md`](geral/README_mapa.md) — componentes react-leaflet (MapView, MapLinksPanel...), rotas `/v1/map`, serviços `map*` e como qualquer módulo usa o mapa.
- [`README_modal.md`](geral/README_modal.md) — padrão de modal centralizado e controlado por estado React.
- [`README_node_comandos_modulos.md`](geral/README_node_comandos_modulos.md) — comandos Node/Vite (dev no host), build/deploy por `dist/` e mapa dos módulos de `src/`.
- [`README_paginas_modulo.md`](geral/README_paginas_modulo.md) — convenção de páginas por módulo/recurso/ação (`pages/v1/<modulo>/<recurso>/<Acao>Page.tsx`) e fluxo composto em pasta própria.
- [`README_render_via_formgrid.md`](geral/README_render_via_formgrid.md) — campo de formulário renderiza via `<FormGrid>` (schema JSON), não markup manual; débito do `FormBuilderPage`.
- [`README_render_via_list_constructor.md`](geral/README_render_via_list_constructor.md) — listagem renderiza via o motor `list_manager`/`list_columns`/`list_actions`, não tabela manual.
- [`README_rotas_frontend.md`](geral/README_rotas_frontend.md) — mapa de todas as rotas React do frontend, espelhando o `README_rotas_swagger.md` do backend.
- [`README_rota_empresa_slug.md`](geral/README_rota_empresa_slug.md) — rota multiempresa com slug da empresa na URL.
- [`README_sessao_entre_abas.md`](geral/README_sessao_entre_abas.md) — sessão compartilhada entre abas e janelas: adoção da sessão, aviso de renovação, logout propagado e portão de sessão.
- [`README_temas_paleta.md`](geral/README_temas_paleta.md) — paletas de cores em JSON: contrato das 24 chaves, lista das paletas, critério de contraste e como adicionar uma.
- [`README_template001_modelo.md`](geral/README_template001_modelo.md) — Template001 como modelo para o template de cada empresa: JSON de conteúdo, regiões, responsividade, temas, X de fechar, histórico dos pedidos e passo a passo.
- [`README_template002_modelo.md`](geral/README_template002_modelo.md) — Template002 (sem bordas): empresa vinculada no banco, rota, arquivos e diferenças em relação ao 001.
- [`README_template003_modelo.md`](geral/README_template003_modelo.md) — Template003 (menu Offcanvas): vínculo com empresas no banco, pendência da `drsergiopsicologo`, rota e arquivos.

### `geral/modulos/`

- [`calendar/README_calendar.md`](geral/modulos/calendar/README_calendar.md) — módulo `calendar` (espelho do Google Calendar): estado atual (só visualização) e roadmap.
- [`timeline/README_plano.md`](geral/modulos/timeline/README_plano.md) — módulo `timeline` (feed social): backend completo, duas telas de frontend prontas, pendências para continuar depois.
- [`company-manager/README_plano.md`](geral/modulos/company-manager/README_plano.md) — módulo `company_manager`: empresas e acesso individual a form/list, componentes `ListBuild` e `RecordFormBuild`, pendências.
- [`location/README_plano.md`](geral/modulos/location/README_plano.md) — módulo `location`: árvore recursiva de locais, tipos, componente `TreeBuild`, seed de form/list/menu, pendências.
- [`messages/README_plano.md`](geral/modulos/messages/README_plano.md) — módulo `messages` (mensagens diretas, nunca chat): listas, formulários e CRUD de tela de mensagens e grupos prontos; tela de conversa, envio para grupo e membros pendentes.
- [`product-movement-service/README_pendencias.md`](geral/modulos/product-movement-service/README_pendencias.md) — módulos `product`, `movement` e `service`: telas, seed, componentes globais e pendências do frontend.

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
