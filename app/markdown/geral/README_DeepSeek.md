[◄ Índice da base de conhecimento](../README.md)

---

# Análise de entendimento — antes do novo módulo

Documento de conferência (2026-09-26). Registra a análise detalhada dos três
pedidos feitos pelo usuário **antes** da passagem dos passos do novo módulo:
(1) como o sistema está sendo desenvolvido, (2) o que é o BUILD de Form/List/Menu
e (3) o modelo de migrate (REMAKE) e as regras de alteração no banco DEV.

Nada foi alterado no sistema nesta análise além deste arquivo e da sua entrada no
índice da base. Nenhuma migration, SQL, arquivo de código ou registro de banco foi
tocado.

---

## 1. Escopo e método

Fontes lidas para montar esta análise:

| Fonte                                                                                                    | O que foi extraído                                                                            |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `src/app/markdown/README.md`                                                                             | índice da base do backend — módulos, rotas, migrate, seed, regra do Composer                  |
| `src/frontend/projeto54900/src/markdown/README.md`                                                       | índice da base do frontend — FormGrid, construtores, listagem, modal, páginas, rotas          |
| `src/app/CLAUDE.md`                                                                                      | regra de ouro do banco, grupos de conexão, destino dos planos neste projeto                   |
| `CLAUDE.md` global                                                                                       | fluxo obrigatório de plano e regras invioláveis (segredos, pastas restritas, banco `diarias`) |
| `README_migrate.md`                                                                                      | modelo REMAKE, comandos `spark` e as proibições                                               |
| `README_form_builder.md`                                                                                 | construtor de formulários e o padrão árvore + modal                                           |
| `README_atualiza_readme.md`                                                                              | procedimento obrigatório de manutenção do índice da base                                      |
| `doc/sql/dump/202609201836.sql`, `doc/sql/insert/*.sql`                                                  | estado real das tabelas de definição (`form_*`, `list_*`, `menu_manager`, `route_manager`)    |
| `src/app/Database/Migrations/`                                                                           | conjunto REMAKE vigente                                                                       |
| `FormBuild.tsx`, `FormConstructorBuildPage.tsx`, `FormConstructorListPage.tsx`, `routes/v1/*.routes.tsx` | cadeia do BUILD no código                                                                     |

Método: para cada pedido, localizar a regra no **código ou no banco** (evidência
com arquivo e linha), não apenas no texto do markdown. Onde a evidência não fecha,
o ponto fica registrado em aberto.

---

## 2. Pedido 1 — Como o sistema está sendo desenvolvido

### 2.1 Backend

- CodeIgniter 4.7.4. `src/app/` é código da aplicação; `src/system/` é CORE do
  framework (listar sim, ler/editar só com autorização).
- **Sem arquivo `.env`.** A conexão `default` (`codeigniter54900_db`) lê as chaves
  `DB_*` por `env()`, mas essas variáveis vêm do `environment:` do serviço `php` no
  `docker-compose.yml`. Os grupos de módulo (`mapa`, `agenda`, `chat`) usam
  constantes `DB_*` de `Config/Database.php` — o array `$modules` é a fonte da
  verdade e o construtor monta cada grupo por `buildGroup()`. Acesso de módulo
  sempre nomeando o grupo (`db_connect('mapa')`, `$model->DBGroup = 'agenda'`),
  nunca caindo no `default` por omissão.
- **Composer proibido** sem autorização explícita (`README_regra_composer_proibido.md`).
  Se alguma tarefa parecer exigir `vendor/`, parar e avisar antes de propor plano.
  Preferir solução nativa — exemplo já no projeto: `Libraries/Auth/JwtService.php`
  gera JWT HS256 só com `hash_hmac`.
- **Padrão de módulo da API V1** (`ROADMAP_padrao_modulo.md`): Routes + Controller
  - Request + Processor/Service + Model, com classes base e SOLID; árvore de
    arquivos fixa; contrato de rotas canônicas (18 de tabela + 9/10 de view);
    envelope de resposta padronizado; mapa tipo-de-coluna → regra de validação.
    Módulo semelhante já padronizado serve de espelho. Pendência aberta registrada:
    `DB_GROUP_001` aponta para grupo inexistente.
- **Desvios sancionados de contagem de rotas** (`README_rotas_swagger.md`): `auth`
  com 6, `db-schema` com 3, `upload` multipart/streaming com 3,
  `user-profiles/me`, `calendar-event-attendees/respond` e
  `calendar-event-invites/accept-token`. Legenda de filtros `jwtauth`/`adminonly`.
- Utilitários que alimentam os construtores: `db-schema` (introspecção read-only de
  `INFORMATION_SCHEMA`, com nome de tabela validado contra `$db->listTables()`);
  módulo `Upload/UploadManager` polimórfico (`module` + `reference_id` +
  `collection`), arquivos em `writable/uploads/<module>/<reference_id>/...`.

### 2.2 Frontend

- React + TypeScript + Vite. Também **sem `.env`**: os defaults das chaves `VITE_*`
  ficam em `src/config/env.ts`. Dev no host (`npm run dev`, `:54910`) com proxy
  `/api` e `/ws` para `:54900`; build estático em `dist/`.
- **Página por ação**: `pages/v1/<modulo>/<recurso>/<Acao>Page.tsx`, nomeada pelo
  verbo do endpoint (`CreatePage`, `UpdatePage`, `GetAllPage`, `GetPage`). Módulo
  de um recurso só dispensa a subpasta. Fluxo composto (grava em mais de uma
  tabela ligada por FK) ganha **pasta própria** no módulo — caso de referência:
  `pages/v1/user/register/RegisterPage.tsx`.
- **Idioma**: rota, arquivo, pasta e variável sempre em inglês; comentário e texto
  visível ao usuário em português.
- **Formulário sempre via `<FormGrid>`** (schema JSON, 22 tipos, máscara, validação
  e serialização resolvidas pela fábrica). Nunca `<input>`/`<label>`/coluna
  Bootstrap/validação à mão. Exceção: chrome que não é campo (cabeçalho, botão).
- **Listagem sempre pelo motor** `utils/listConstructor.tsx`, consumindo a definição
  em `list_manager`/`list_columns`/`list_actions`. Nunca `<thead>`/`<tbody>` com
  colunas fixas à mão. A página informa o `MANAGER_SLUG` (ex.:
  `FormConstructorListPage` usa `form-manager`) e o motor busca os dados no
  `api_get_endpoint`. Ação de linha `link` navega; `api_call` executa de verdade
  (no preview do construtor, só toast).
- **Modal sempre centralizado** (`modal-dialog-centered`) e controlado por estado
  React — nunca por `data-bs-toggle`/`bootstrap.Modal`.
- **Campo que guarda rota/endpoint** (`*_endpoint`, `*_route`, `*_url_template`) é
  `<select>` carregado de `route_manager` (`method - object - action`), nunca texto
  livre. **Campo cujo valor é JSON** é montado pela UI (`parse`/`montar` tolerantes),
  nunca digitado cru.
- **Navbar dinâmica** de `menu_manager` (`useSiteMenu`: `parent_id` nulo +
  `react_route` preenchida + `sort_order < 100`, com fallback estático). Faixas de
  `sort_order`: `<100` navbar real, `>=1000` catálogo "Extra", `>=2000` árvore
  administrativa exibida só na tela de gestão.
- Comportamento dev-only isolado por `isDevHost()` (`config/envHost.ts`), que é
  diferente de `env.isDev`: hoje libera `ApiDebugPanel` e `FakeFillButton`.
- `<EmptyState>` "EM BRANCO ate a fabrica" é **placeholder intencional** (código
  nunca religado), não ausência de cadastro no banco.

### 2.3 Base de conhecimento

- Duas bases espelhadas, uma por lado:
  `src/app/markdown/` (alimenta o `CLAUDE.md` do backend) e
  `src/frontend/projeto54900/src/markdown/` (alimenta o `CLAUDE.md` do frontend).
- **Regra fixa de manutenção** (`README_atualiza_readme.md`): todo markdown novo em
  qualquer subpasta exige atualizar o `README.md` da base na mesma alteração —
  linha no índice (palavra-chave minúscula sem acento, em crase, + frase de
  **exatamente 5 palavras**), bloco `### \`palavra-chave\`` de 2 a 5 linhas na
  seção Resumos e link na seção Conteúdo, no grupo da pasta. Todo markdown da base
  começa e termina com o link para o índice.
- Este arquivo segue essa regra: foi criado em `geral/` e registrado no índice em
  `src/app/markdown/README.md` (linha, resumo e link).
- `CLAUDE.md` locais e o global: nunca alterar; ler antes de executar.

### 2.4 Fluxo de plano

- Propor o plano verbalmente (título, objetivo, passos com tipo/alvo/motivo,
  critérios de sucesso, rollback, riscos) → aguardar autorização → criar o
  `_plano.json` → criar um `_no_plano.json` **por ação** planejada → encerrar
  listando os arquivos.
- Neste projeto o destino muda: os planos vão para `src/writable/claude/`
  (pasta ignorada pelo Git), conforme o `CLAUDE.md` de `src/app/`; o modelo e as
  regras continuam os do global (`MODELO_plano.json` / `MODELO_no_plano.json`).
- Tarefa simples de pergunta/explicação não entra no fluxo.

---

## 3. Pedido 2 — BUILD

### 3.1 O que é, no código

- `src/frontend/projeto54900/src/components/global/FormBuild.tsx` renderiza **um
  formulário real** a partir da definição gravada no banco. Recebe `{ table, id }`
  por props — **não** lê `useParams()`, **não** monta `PageHeader` — justamente
  para poder ser chamado de qualquer lugar (página inteira, modal, card, collapse).
- Pipeline: busca a definição em `view_form_manager` filtrada por `fm_id` e
  monta o schema com `buildRenderSchema`; renderiza com `<FormGrid>`. **Validação
  cruzada**: o `table_name` recebido tem de bater com o do registro encontrado pelo
  `id` — se não bater, mostra erro em vez de renderizar o formulário errado.
  Submit usa `submit_endpoint` + `http_method` (`formDataToPayload`, `senderFor`,
  `resolveEndpoint`).
- **Decisão registrada (2026-09-20)**: a chave é `{table_name}` + `id`, **não**
  `slug`. Slug é texto digitado por humano (erro/duplicata — foi a causa do card
  "dup" no calendar-manager); `id` é a PK, nunca digitado, nunca ambíguo.
- Rota `GET /v1/form-constructor/:table/:id` → `FormConstructorBuildPage`: wrapper
  fino (cabeçalho, Voltar, Recarregar) que lê os params e repassa para o
  `FormBuild`. Declarada em `routes/v1/form.routes.tsx` sob
  `RequireRole role="admin"` e registrada em `route_manager`
  (`layer=frontend`, `object=form-manager`, `action=build`) — evidência:
  `doc/sql/insert/20260926141038_route_manager_sync.sql`, linha 487.
- O botão **Build** é **dado de banco, não código**: `list_actions` id 5,
  `list_manager_id` 7 (`form-manager`), `label='Build'`, `icon='eye'`,
  `action_type='link'`, `href_template='/v1/form/{slug}'`, `data_action='build'`
  — evidência: `doc/sql/dump/202609201836.sql`, linha 2711.
- Cadeia do construtor, para não confundir as telas:
  - `/v1/form-constructor` → `FormConstructorListPage`: listagem do **próprio motor
    de listas**, com `MANAGER_SLUG = 'form-manager'`.
  - `/v1/form-constructor/create` e `/update/:id` → `FormBuilderPage`: árvore
    `form_manager → form_groups → form_rows → form_fields`, persistindo **nó a nó**
    (Salvar no modal; `[+]` travado enquanto o pai não tem `dbId`; `deleteSoft` na
    remoção de nó já gravado).
  - `/v1/form-constructor/:table/:id` → `FormConstructorBuildPage` + `FormBuild`:
    o **Build** propriamente dito.
  - `/v1/form/:slug` → `FormRendererPage`: mesma renderização, **dentro de modal**,
    usada pelo usuário comum (ex.: autocadastro).
  - `/v1/form-constructor-claude` → `FormConstructorPage`: construtor legado
    (seed + `view_form_manager`); não mexer.

### 3.2 As três trilhas

| Trilha   | Definição (banco)                                                                                              | Renderizador                                                        | Onde vive o "acesso"                                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Form** | `form_manager` + `form_groups` + `form_rows` + `form_fields` (e a view `view_form_manager`, 1 linha por campo) | `<FormBuild>` → `<FormGrid>`                                        | ação de lista `Build` (`list_actions`) → rota `/v1/form-constructor/:table/:id` ou `/v1/form/:slug`                                                  |
| **List** | `list_manager` + `list_columns` + `list_actions`                                                               | motor `utils/listConstructor.tsx` (`renderCell`/`cellValue`, ações) | `api_get_endpoint` da própria definição; a página só informa o `MANAGER_SLUG`                                                                        |
| **Menu** | `nav_manager` (casca: nome, imagem, ícone, versão) + `menu_manager` (árvore, `parent_id` para submenu)         | `useSiteMenu` (navbar) e a árvore da tela de gestão                 | `react_route` do item de menu aponta para a tela — inclusive para uma tela de Build (ex. no dump: item 25 "Novo Calendário" → `/v1/form/calendario`) |

Observações: `nav_manager` e `menu_manager` são tabelas distintas ligadas por FK —
nenhuma delas é "o menu" sozinha. Não existe rota "Build" para listas: a grade é
renderizada in-line pela página consumidora. E `list_manager`/`list_columns`/
`list_actions`/`list-actions` também são listados por si mesmos no dump (o motor se
descreve), mas só a lista `form-manager` tem a ação `Build`.

### 3.3 Como um módulo novo entra (minha leitura operacional)

1. **Backend**: tabela/view + módulo PHP no padrão (Routes/Controller/Request/
   Processor/Model), espelhando um módulo existente; documentar em
   `src/app/markdown/geral/README_modulo_<x>.md` + entrada no índice.
2. **Definição de tela**: formulários e listagens gravados no banco — via
   `FormBuilderPage`/`ListBuilderPage` ou por INSERT direto no padrão observado em
   `doc/sql/insert/AAAAMMDDHHMMSS_<assunto>.sql` (o mesmo timestamp do nome).
3. **Acesso**: item em `menu_manager` apontando para a rota (com a faixa de
   `sort_order` correta), rota lazy em `routes/v1/<modulo>.routes.tsx` +
   `routes/paths.ts`, e registro em `route_manager` (o sync é idempotente por
   `layer + object + endpoint`).
4. **Nada de formulário ou grade escrito à mão no TSX** — só schema e definição.

### 3.4 Ponto em aberto (precisa da sua confirmação)

Minha leitura de "todos os Forms, List e Menus são com BUILD em Menu" é:
**toda tela desses três tipos é definição no banco renderizada por Build, e o
acesso é um item em `menu_manager` com `react_route` para a rota de Build/render** —
em vez de página CRUD escrita à mão.

Se a intenção for algo mais específico, preciso saber antes de executar, por
exemplo: um **Build também para `menu_manager`/`nav_manager`** (hoje essas listas
não têm a ação `Build` em `list_actions` — só `form-manager` tem), ou um Build
próprio para listas (`list_manager`), que hoje não existe.

---

## 4. Pedido 3 — Migrate / REMAKE

### 4.1 Modelo ativo

Não existe migration incremental neste projeto. Um **REMAKE** = 3 SQLs + 3 classes
PHP com o mesmo timestamp, em `app/Database/Migrations/`:

| Ordem | SQL (dump do banco DEV)          | Classe PHP                                         | Conteúdo                           |
| ----- | -------------------------------- | -------------------------------------------------- | ---------------------------------- |
| 1     | `AAAAMMDDHHMM_replace_table.sql` | `AAAA-MM-DD-HHMM00_ReplaceTable<AAAAMMDDHHMM>.php` | DROP TABLE + CREATE TABLE de todas |
| 2     | `AAAAMMDDHHMM_seed_table.sql`    | `AAAA-MM-DD-HHMM00_SeedTable<AAAAMMDDHHMM>.php`    | DELETE + INSERT de todos os dados  |
| 3     | `AAAAMMDDHHMM_create_view.sql`   | `AAAA-MM-DD-HHMM00_CreateView<AAAAMMDDHHMM>.php`   | DROP VIEW + CREATE VIEW de todas   |

Regras que eu entendo e vou seguir:

- A classe só lê o `.sql` ao lado e executa statement por statement
  (`executeSqlFile()`), sem Forge. `CREATE DATABASE`/`USE` do dump são ignorados —
  o banco vem da conexão `default`.
- O sufixo de data existe no **arquivo e na classe**; sem ele, colide com o REMAKE
  anterior no mesmo namespace.
- `down()` de ReplaceTable/SeedTable fica vazio (não há inverso genérico);
  CreateView faz `DROP VIEW IF EXISTS` de cada view.
- **Destrutivo**: `spark migrate` com um REMAKE pendente dropa todas as tabelas
  (inclusive a `migrations`) e recarrega o dump. Tudo que foi gravado depois do
  dump se perde — é destruição de tabelas e registros de desenvolvimento, como você
  descreveu. Backup antes, se houver dado novo.
- Comandos digitados no **host**: `podman compose exec php php spark migrate`
  (sem `-g` = conexão `default`). As migrations REMAKE **não** declaram `$DBGroup`
  — inclusive as tabelas do Calendar, que hoje vivem no `codeigniter54900_db`.
- Testes usam o grupo `tests` (SQLite em memória) — não apontar para bancos de
  módulo.

### 4.2 Estado atual

- REMAKE mais recente: **2026-09-25** —
  `2026-09-25-153600_ReplaceTable20260925.php`,
  `2026-09-25-153700_SeedTable20260925.php`,
  `2026-09-25-153800_CreateView20260925.php` e os SQLs
  `202609251536_replace_table.sql`, `202609251537_seed_table.sql`,
  `202609251538_create_view.sql`. Todo REMAKE sobrescreve o anterior.
- Há ainda o conjunto anterior sem sufixo de data (`2026-09-20-1817/1818/1819`) e o
  histórico de migrations removidas em `doc/sql/migrations_historico/removido/`.

### 4.3 O que eu faço e o que eu não faço

- **Não crio** migration nem SQL nova (ALTER, SEED, CREATE VIEW, REMAKE) por conta
  própria — isso atrapalha. Quem decide o REMAKE é você, e você avisa.
- **Alterações de estrutura de tabela e de dados são feitas direto no banco DEV**
  (INSERT/UPDATE), documentadas no markdown do módulo, sem arquivo em
  `app/Database/Migrations/` até o REMAKE ser autorizado.
- **Comentários no SQL de view**: proibido divisor `-- =====` (usar `-- -----`),
  nenhuma palavra-chave SQL dentro de comentário, `SET NAMES utf8mb4;` em linha
  própria — o formatador do editor já quebrou um arquivo exatamente assim.
- **Segredos**: nada de credencial em texto puro em arquivo versionado nem em
  allowlist; credenciais só por ambiente.
- **Banco `diarias` (10.250.104.120, homologação)**: somente leitura e exportação,
  para qualquer pedido, sempre.
- **Pastas restritas** (`system/`, `vendor/`, `node_modules/`, `.env`, caches de
  framework/build): listar sim; ler/editar/deletar só com autorização explícita.

---

## 5. Checklist transversal que vou aplicar

1. Plano verbal + autorização + `_plano.json` + `_no_plano.json` por ação, em
   `src/writable/claude/`.
2. Nada de Composer; nada de migration/SQL nova sem autorização.
3. Não ler `.env`; não alterar `CLAUDE.md`.
4. Não reformatar blocos inteiros; não tocar arquivo não relacionado.
5. Corrigir causa raiz, não sintoma.
6. Usar o módulo/arquivo vizinho já padronizado como espelho.
7. Campo via `<FormGrid>`; listagem via motor de listas; acesso por `menu_manager`.
8. Validar sintaxe/tipos do que foi alterado e testar na tela quando for UI
   (tsc limpo não prova que a tela funciona).
9. Responder com: arquivos alterados, padrão adotado, lacunas encontradas e
   validação realizada.

---

## 6. Lacunas observadas (registro — não corrigidas)

1. `list_actions` do `form-manager` aponta o Build para `/v1/form/{slug}` (modal),
   enquanto a rota direta `/v1/form-constructor/:table/:id` já existe no código — a
   definição no banco está desatualizada em relação à rota.
2. Índice da base do backend: a **tabela do índice** não tem a linha
   `calendar-event-invites`, embora exista o bloco de resumo desse tópico no fim da
   seção Resumos.
3. Contagem de rotas de view inconsistente dentro do mesmo índice do backend:
   "9 de leitura" no bloco `formulario` x "10 de view" no bloco `modulo`.
4. Base do frontend tem, no disco, as pastas `geral/modulos/{document_manager,map,
networking}` que não aparecem no índice nem na seção Conteúdo do `README.md`.
5. Escopo B do rename `form_campos` → `form_fields` pendente: rota
   `/api/v1/form-campos`, módulo PHP `FormCampos` e prefixo `fc_` da view.
6. `paths.v1.upload.new` sem rota registrada (já documentado no
   `README_rotas_frontend.md`).
7. `nav-manager`/`menu-manager` aparecem duplicados em `Config/Routes.php` (já
   documentado no `README_rotas_swagger.md`).
8. `components/global/FormField.tsx` continua no repositório sem uso (substituído
   pelo `FormGrid`); o `README_FormGrid.md` registra "falta religar nas páginas".
9. Débito registrado no `README_form_builder.md`: o subcard FORMULÁRIO/GRUPOS do
   `FormBuilderPage` ainda é markup manual e deveria virar `FormGridSchema`.

---

## 7. Em aberto

- Os **passos do novo módulo** — ainda não recebidos; é o que este documento
  aguarda.
- A **confirmação do item 3.4** (alcance exato de "BUILD em Menu").
- Se este arquivo deve permanecer na base depois da conferência: ele foi
  registrado no índice porque a regra da base não abre exceção para markdown novo
  em qualquer subpasta — se for um documento temporário, é só dizer que eu removo a
  entrada e o arquivo.

---

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
