[◄ Índice da base de conhecimento](../README.md)

---

# Módulo Nav/Menu — config do app + árvore de navegação

Dois recursos REST padrão da API V1, ligados por FK:

- **`nav_manager`** (`api/v1/nav-manager`) — a "casca" do app: nome, imagem,
  ícone de mensagens, versão do sistema. Não é o menu em si.
- **`menu_manager`** (`api/v1/menu-manager`) — árvore de itens navegáveis de
  UM `nav_manager` (FK `nav_manager_id`), com auto-relacionamento `parent_id`
  para submenu. Antes de 2026-09-13 os nomes eram trocados: esta tabela se
  chamava `menu_items` e a config de branding se chamava `menu_manager`.

Ambos seguem o padrão obrigatório de módulo (Routes + Controller + Request +
Processor + Model + Migration, 18 rotas de tabela cada — ver
[`ROADMAP_padrao_modulo.md`](ROADMAP_padrao_modulo.md)).

## Schema

`nav_manager`:

| Coluna            | Tipo                                  | Observação                      |
| ------------------ | -------------------------------------- | -------------------------------- |
| `title`            | VARCHAR(255)                           | nome do app exibido na navbar    |
| `image`            | VARCHAR(255) NULL                      | logo                             |
| `message_icon`     | VARCHAR(255) NULL                      | ícone de notificações            |
| `system_version`   | VARCHAR(20) DEFAULT '1.0.0'             | badge ao lado do nome (ex. "v1") |
| `status`           | ENUM('active','draft','inactive')      | nasce `draft`                    |

`menu_manager`:

| Coluna             | Tipo                               | Observação                                          |
| ------------------- | ------------------------------------ | ---------------------------------------------------- |
| `nav_manager_id`   | BIGINT NOT NULL FK → `nav_manager.id` (CASCADE) | dono do item                              |
| `parent_id`        | BIGINT NULL FK → `menu_manager.id` (self, CASCADE) | submenu; `NULL` = raiz            |
| `title`            | VARCHAR(255) NOT NULL                | rótulo exibido                                       |
| `react_route`      | VARCHAR(255) NULL                    | destino no frontend; `NULL` = item só organizacional (agrupador sem link) |
| `roles`            | JSON NULL                            | lista de slugs de `user_roles` com acesso — **hoje só cadastro, sem enforcement no frontend** (não há sessão/auth de usuário) |
| `sort_order`       | INT DEFAULT 0                        | ver convenção de faixas abaixo                       |
| `status`           | ENUM('active','draft','inactive')    | nasce `draft` (default da coluna; `create()` ignora status enviado no body) |

## Convenção de faixas de `sort_order` (decisão desta sessão, 2026-09-13)

`menu_manager` guarda **todas** as rotas conhecidas do site na mesma tabela —
não só os links do topo. Como não existe (ainda) um campo dedicado tipo
`show_in_navbar`, a distinção é feita por `sort_order`:

| Faixa           | Significado                                                                 |
| ---------------- | ---------------------------------------------------------------------------- |
| `< 100`          | **Navbar real do site.** `parent_id` sempre nulo. É o que `hooks/useSiteMenu.ts` lê para montar `components/layout/Navbar.tsx` (fallback estático se a API falhar/vier vazia). Hoje: Início(10), Usuários(20), Uploads(30), Formulários(40), Nav(50), Menus(60), Google Calendars(70). |
| `>= 1000`        | Catálogo "Extra": rotas reais do site que não aparecem no navbar nem na árvore administrativa (sub-rotas de CRUD, placeholders, 404). Hoje vivem todas reparentadas sob o nó "Extra" da árvore abaixo. |
| `>= 2000`        | Árvore administrativa "Menu" (ver abaixo) — visível só na tela de gestão, nunca no navbar real. |

**Nunca reparentar nem tirar de `sort_order < 100` os 7 itens do navbar** — eles
precisam continuar com `parent_id` nulo e `sort_order` nessa faixa, senão somem
do site.

## Árvore atual (nav_manager_id=1, "Menu Teste")

Construída manualmente nesta sessão (não é regra fixa, é o estado de exemplo/dev):

```
Início(10) / Usuários(20) / Uploads(30) / Formulários(40) / Nav(50) / Menus(60) / Google Calendars(70)   <- navbar real
Menu (2000)
├─ Inicio          -> /
├─ Usuario
│  └─ Listar        -> /v1/user-manager
├─ Perfil
│  └─ Cadastrar Perfil -> /v1/register
├─ Buld Form
│  ├─ Listar        -> /v1/form-constructor
│  └─ Registrar     -> /v1/form-constructor/create
├─ Nav
│  ├─ Listar        -> /v1/nav-manager
│  └─ Menu
│     └─ Listar     -> /v1/menu-manager
├─ Google Calendar  -> /v1/form/calendario
└─ Extra
   ├─ V1 (Redirecionamento)      -> /v1
   ├─ Registrar                  -> /v1/user-manager/create
   ├─ Visualizar                 -> /v1/user-manager/:id
   ├─ Editar                     -> /v1/user-manager/:id/update
   ├─ Detalhe do Upload          -> /v1/upload-manager/:id
   ├─ Editar Formulário          -> /v1/form-constructor/update/:id
   ├─ Construtor Legado          -> /v1/form-constructor-claude
   ├─ Renderizar Formulário      -> /v1/form/:slug
   ├─ V1A (Placeholder)          -> /v1a
   └─ Página Não Encontrada (404) -> *
```

Reproduzível do zero via `MenuManagerSeeder` (ver seção Seeders) — o seed usa
títulos ASCII (Inicio/Usuario/Formularios...) por causa do bug de charset
abaixo; os títulos acentuados acima refletem o estado atual editado manualmente
via API antes da descoberta do bug.

## Consumo no frontend

- **Navbar real** (`components/layout/Navbar.tsx` + `hooks/useSiteMenu.ts`):
  busca `nav_manager` com `status=active`, depois `menu_manager` com
  `nav_manager_id` + `status=active`, filtra `parent_id` nulo e
  `sort_order < 100`, ordena e mapeia para `{to,label,end}`. Fallback para um
  array estático (`FALLBACK_NAV`) se a API falhar ou vier vazia.
- **Tela de gestão** (`pages/v1/menu/GetAllPage.tsx`): com `?nav_manager_id=`
  na URL, busca **todos** os itens desse nav (sem paginação) e renderiza como
  árvore indentada (componente local `MenuTreeRow`, expand/collapse em estado
  React), agrupando por `parent_id`. Sem esse parâmetro, lista todos os navs
  numa tabela plana paginada (comportamento original, inalterado).
- **Sem hierarquia real no Navbar ainda**: a árvore "Menu" acima só é visível
  na tela de gestão — o navbar do site continua com os 7 links fixos, sem
  dropdown. Ver "Pendências" abaixo.

## Problema conhecido — título acentuado causa HTTP 500

`Config/Database.php:99` define a conexão `default` com
`'charset' => 'utf8'` (MySQL "utf8" legado, 3 bytes), enquanto os grupos
nomeados (`mapa`, `agenda` — linhas 169 e 206) já usam `'utf8mb4'`. Qualquer
`create`/`update` de `menu_manager` (e provavelmente de qualquer tabela na
conexão `default`) com caractere acentuado no body falha com HTTP 500 — as
regras de validação (`CreateRequest`/`UpdateRequest`) não restringem charset,
então o erro deve estar na conversão de charset entre o driver MySQLi e o
schema real das tabelas (criadas com charset moderno). Reproduzido isolado:
`{"title":"Usuário Teste"}` já falha, mesmo sem FK.

**Correção proposta (não aplicada — decisão do usuário):** trocar
`'charset' => 'utf8'` por `'charset' => 'utf8mb4'` em
`Config/Database.php:99` (grupo `default`), igual aos outros grupos. Baixo
risco (é o charset "correto" pro MySQL moderno), mas é config compartilhada —
não mexer sem autorização explícita.

## Seeders

`app/Database/Seeds/NavManagerSeeder.php` e `MenuManagerSeeder.php` — ver
[`README_seed.md`](README_seed.md) para os comandos. Resumo:

- `NavManagerSeeder`: idempotente por `title` ("Menu Teste") — se existe, faz
  `deleteHard` (CASCADE apaga os itens de menu) e recria via `Processor`.
- `MenuManagerSeeder`: chama `NavManagerSeeder` primeiro, depois recria a
  árvore inteira (os 7 do navbar + a árvore "Menu" completa) — títulos ASCII
  por causa do bug de charset acima.
- Nenhum dos dois foi executado nesta sessão (rodar apagaria/recriaria os ids
  atuais construídos manualmente — mesma estrutura lógica, ids novos).

## Pendências / continuar amanhã

- [ ] **Decidir se corrige o bug de charset** (`Config/Database.php:99`,
      `utf8` → `utf8mb4`) — impacta qualquer texto acentuado gravado na
      conexão `default`, não só nav/menu.
- [ ] **Rodar os seeders** num ambiente novo/limpo para validar de ponta a
      ponta (nunca foram executados de fato).
- [ ] **Navbar com dropdown real**: hoje só a tela de gestão mostra a árvore;
      o site continua com 7 links fixos sem submenu. Decidir se/quando
      implementar (Fase 2, adiada por decisão do usuário).
- [ ] **Enforcement de `roles`**: campo existe e é validado, mas nada no
      frontend filtra por perfil do usuário logado — não há sessão/auth no
      frontend hoje. Depende de um sistema de login existir primeiro.
- [ ] **Nomes provisórios**: "Buld Form" (grafia informal de "Build Form",
      mapeado para o módulo Formulários) — considerar renomear para algo mais
      claro quando o bug de acento for corrigido.
- [ ] **Investigar** o título "Início II" encontrado no item id1 (navbar real,
      rota `/`) — não foi alterado por nenhuma automação desta sessão;
      conferir se foi um teste manual antes de seguir confiando nesse valor.

[◄ Índice da base de conhecimento](../README.md)
