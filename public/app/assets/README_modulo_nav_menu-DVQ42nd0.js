const a=`[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
# Módulo Nav/Menu — config do app + árvore de navegação\r
\r
Dois recursos REST padrão da API V1, ligados por FK:\r
\r
- **\`nav_manager\`** (\`api/v1/nav-manager\`) — a "casca" do app: nome, imagem,\r
  ícone de mensagens, versão do sistema. Não é o menu em si.\r
- **\`menu_manager\`** (\`api/v1/menu-manager\`) — árvore de itens navegáveis de\r
  UM \`nav_manager\` (FK \`nav_manager_id\`), com auto-relacionamento \`parent_id\`\r
  para submenu. Antes de 2026-09-13 os nomes eram trocados: esta tabela se\r
  chamava \`menu_items\` e a config de branding se chamava \`menu_manager\`.\r
\r
Ambos seguem o padrão obrigatório de módulo (Routes + Controller + Request +\r
Processor + Model + Migration, 18 rotas de tabela cada — ver\r
[\`ROADMAP_padrao_modulo.md\`](ROADMAP_padrao_modulo.md)).\r
\r
## Schema\r
\r
\`nav_manager\`:\r
\r
| Coluna            | Tipo                                  | Observação                      |\r
| ------------------ | -------------------------------------- | -------------------------------- |\r
| \`title\`            | VARCHAR(255)                           | nome do app exibido na navbar    |\r
| \`image\`            | VARCHAR(255) NULL                      | logo                             |\r
| \`message_icon\`     | VARCHAR(255) NULL                      | ícone de notificações            |\r
| \`system_version\`   | VARCHAR(20) DEFAULT '1.0.0'             | badge ao lado do nome (ex. "v1") |\r
| \`status\`           | ENUM('active','draft','inactive')      | nasce \`draft\`                    |\r
\r
\`menu_manager\`:\r
\r
| Coluna             | Tipo                               | Observação                                          |\r
| ------------------- | ------------------------------------ | ---------------------------------------------------- |\r
| \`nav_manager_id\`   | BIGINT NOT NULL FK → \`nav_manager.id\` (CASCADE) | dono do item                              |\r
| \`parent_id\`        | BIGINT NULL FK → \`menu_manager.id\` (self, CASCADE) | submenu; \`NULL\` = raiz            |\r
| \`title\`            | VARCHAR(255) NOT NULL                | rótulo exibido                                       |\r
| \`react_route\`      | VARCHAR(255) NULL                    | destino no frontend; \`NULL\` = item só organizacional (agrupador sem link) |\r
| \`placement\`        | ENUM('navbar','offcanvas') DEFAULT 'navbar' | onde o item de topo (e todo o seu grupo de filhos) aparece: barra superior ou painel Offcanvas. Só vale no item de topo — filhos seguem o pai. Migrations \`AlterTable20260924MenuPlacement\` / \`SeedTable20260924MenuPlacement\` (2026-09-24) |\r
| \`roles\`            | JSON NULL                            | lista de slugs de \`user_roles\` com acesso — **hoje só cadastro, sem enforcement no frontend** (não há sessão/auth de usuário) |\r
| \`sort_order\`       | INT DEFAULT 0                        | ver convenção de faixas abaixo                       |\r
| \`status\`           | ENUM('active','draft','inactive')    | nasce \`draft\` (default da coluna; \`create()\` ignora status enviado no body) |\r
\r
## Convenção de faixas de \`sort_order\` (decisão desta sessão, 2026-09-13)\r
\r
\`menu_manager\` guarda **todas** as rotas conhecidas do site na mesma tabela —\r
não só os links do topo. Como não existe (ainda) um campo dedicado tipo\r
\`show_in_navbar\`, a distinção é feita por \`sort_order\`:\r
\r
| Faixa           | Significado                                                                 |\r
| ---------------- | ---------------------------------------------------------------------------- |\r
| \`< 100\`          | **Navbar real do site.** \`parent_id\` sempre nulo. É o que \`hooks/useSiteMenu.ts\` lê para montar \`components/layout/Navbar.tsx\` (fallback estático se a API falhar/vier vazia). Hoje: Início(10), Usuários(20), Uploads(30), Formulários(40), Nav(50), Menus(60), Calendario(70). |\r
| \`>= 1000\`        | Catálogo "Extra": rotas reais do site que não aparecem no navbar nem na árvore administrativa (sub-rotas de CRUD, placeholders, 404). Hoje vivem todas reparentadas sob o nó "Extra" da árvore abaixo. |\r
| \`>= 2000\`        | Árvore administrativa "Menu" (ver abaixo) — visível só na tela de gestão, nunca no navbar real. |\r
\r
**Nunca reparentar nem tirar de \`sort_order < 100\` os 7 itens do navbar** — eles\r
precisam continuar com \`parent_id\` nulo e \`sort_order\` nessa faixa, senão somem\r
do site.\r
\r
## Árvore atual (nav_manager_id=1, "Menu Teste")\r
\r
Construída manualmente nesta sessão (não é regra fixa, é o estado de exemplo/dev):\r
\r
\`\`\`\r
Início(10) / Usuários(20) / Uploads(30) / Formulários(40) / Nav(50) / Menus(60) / Calendario(70)   <- navbar real\r
Menu (2000)\r
├─ Inicio          -> /\r
├─ Usuario\r
│  └─ Listar        -> /v1/user-manager\r
├─ Perfil\r
│  └─ Cadastrar Perfil -> /v1/register\r
├─ Buld Form\r
│  ├─ Listar        -> /v1/form-constructor\r
│  └─ Registrar     -> /v1/form-constructor/create\r
├─ Nav\r
│  ├─ Listar        -> /v1/nav-manager\r
│  └─ Menu\r
│     └─ Listar     -> /v1/menu-manager\r
├─ Calendario       -> /v1/form/calendario\r
└─ Extra\r
   ├─ V1 (Redirecionamento)      -> /v1\r
   ├─ Registrar                  -> /v1/user-manager/create\r
   ├─ Visualizar                 -> /v1/user-manager/:id\r
   ├─ Editar                     -> /v1/user-manager/:id/update\r
   ├─ Detalhe do Upload          -> /v1/upload-manager/:id\r
   ├─ Editar Formulário          -> /v1/form-constructor/update/:id\r
   ├─ Construtor Legado          -> /v1/form-constructor-claude\r
   ├─ Renderizar Formulário      -> /v1/form/:slug\r
   ├─ V1A (Placeholder)          -> /v1a\r
   └─ Página Não Encontrada (404) -> *\r
\`\`\`\r
\r
Reproduzível do zero via \`MenuManagerSeeder\` (ver seção Seeders) — o seed usa\r
títulos ASCII (Inicio/Usuario/Formularios...) por causa do bug de charset\r
abaixo; os títulos acentuados acima refletem o estado atual editado manualmente\r
via API antes da descoberta do bug.\r
\r
## Consumo no frontend\r
\r
- **Navbar real** (\`components/layout/Navbar.tsx\` + \`hooks/useSiteMenu.ts\`):\r
  busca \`nav_manager\` com \`status=active\`, depois \`menu_manager\` com\r
  \`nav_manager_id\` + \`status=active\`, filtra \`parent_id\` nulo e\r
  \`sort_order < 100\`, ordena e separa pelo \`placement\` do item de topo em\r
  \`{ navbar, offcanvas }\`. Itens \`offcanvas\` vão para o painel lateral aberto\r
  pelo botão com ícone antes de Home (botão só aparece se houver item\r
  offcanvas). Fallback para um array estático (\`FALLBACK_NAV\`) se a API\r
  falhar ou vier vazia.\r
- **Tela de gestão** (\`pages/v1/menu/GetAllPage.tsx\`): com \`?nav_manager_id=\`\r
  na URL, busca **todos** os itens desse nav (sem paginação) e renderiza como\r
  árvore indentada (componente local \`MenuTreeRow\`, expand/collapse em estado\r
  React), agrupando por \`parent_id\`. Sem esse parâmetro, lista todos os navs\r
  numa tabela plana paginada (comportamento original, inalterado).\r
- **Sem hierarquia real no Navbar ainda**: a árvore "Menu" acima só é visível\r
  na tela de gestão — o navbar do site continua com os 7 links fixos, sem\r
  dropdown. Ver "Pendências" abaixo.\r
\r
## Problema conhecido — título acentuado causa HTTP 500\r
\r
\`Config/Database.php:99\` define a conexão \`default\` com\r
\`'charset' => 'utf8'\` (MySQL "utf8" legado, 3 bytes), enquanto os grupos\r
nomeados (\`mapa\`, \`agenda\` — linhas 169 e 206) já usam \`'utf8mb4'\`. Qualquer\r
\`create\`/\`update\` de \`menu_manager\` (e provavelmente de qualquer tabela na\r
conexão \`default\`) com caractere acentuado no body falha com HTTP 500 — as\r
regras de validação (\`CreateRequest\`/\`UpdateRequest\`) não restringem charset,\r
então o erro deve estar na conversão de charset entre o driver MySQLi e o\r
schema real das tabelas (criadas com charset moderno). Reproduzido isolado:\r
\`{"title":"Usuário Teste"}\` já falha, mesmo sem FK.\r
\r
**Correção proposta (não aplicada — decisão do usuário):** trocar\r
\`'charset' => 'utf8'\` por \`'charset' => 'utf8mb4'\` em\r
\`Config/Database.php:99\` (grupo \`default\`), igual aos outros grupos. Baixo\r
risco (é o charset "correto" pro MySQL moderno), mas é config compartilhada —\r
não mexer sem autorização explícita.\r
\r
## Seeders\r
\r
\`app/Database/Seeds/NavManagerSeeder.php\` e \`MenuManagerSeeder.php\`. Resumo:\r
\r
- \`NavManagerSeeder\`: idempotente por \`title\` ("Menu Teste") — se existe, faz\r
  \`deleteHard\` (CASCADE apaga os itens de menu) e recria via \`Processor\`.\r
- \`MenuManagerSeeder\`: chama \`NavManagerSeeder\` primeiro, depois recria a\r
  árvore inteira (os 7 do navbar + a árvore "Menu" completa) — títulos ASCII\r
  por causa do bug de charset acima.\r
- Nenhum dos dois foi executado nesta sessão (rodar apagaria/recriaria os ids\r
  atuais construídos manualmente — mesma estrutura lógica, ids novos).\r
\r
## Pendências / continuar amanhã\r
\r
- [ ] **Decidir se corrige o bug de charset** (\`Config/Database.php:99\`,\r
      \`utf8\` → \`utf8mb4\`) — impacta qualquer texto acentuado gravado na\r
      conexão \`default\`, não só nav/menu.\r
- [ ] **Rodar os seeders** num ambiente novo/limpo para validar de ponta a\r
      ponta (nunca foram executados de fato).\r
- [ ] **Navbar com dropdown real**: hoje só a tela de gestão mostra a árvore;\r
      o site continua com 7 links fixos sem submenu. Decidir se/quando\r
      implementar (Fase 2, adiada por decisão do usuário).\r
- [x] **Enforcement de \`roles\`**: implementado em\r
      \`src/frontend/projeto54900/src/hooks/useSiteMenu.ts\` — cada item é\r
      filtrado contra \`user.role.slug\` (de \`useAuth()\`) antes de montar a\r
      árvore; \`roles: null\` libera para qualquer autenticado, um pai fora do\r
      role esconde os filhos junto.\r
- [ ] **Nomes provisórios**: "Buld Form" (grafia informal de "Build Form",\r
      mapeado para o módulo Formulários) — considerar renomear para algo mais\r
      claro quando o bug de acento for corrigido.\r
- [ ] **Investigar** o título "Início II" encontrado no item id1 (navbar real,\r
      rota \`/\`) — não foi alterado por nenhuma automação desta sessão;\r
      conferir se foi um teste manual antes de seguir confiando nesse valor.\r
\r
[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
### 📌 Metadados do Autor\r
\r
| Campo               | Informação                                                                                                                   |\r
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |\r
| **Nome**            | Gustavo Hammes                                                                                                               |\r
| **Local**           | Rio de Janeiro                                                                                                               |\r
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |\r
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |\r
`;export{a as default};
