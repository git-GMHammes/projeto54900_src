[◄ Índice da base de conhecimento](../README.md)

---

# Módulo Nav/Menu — config do app + árvore de navegação

> NÃO EXISTE ALTERAÇÃO de MIGRATE: apenas no fim de cada ciclo um novo, para a renovação de todo o sistema.

Dois recursos REST padrão da API V1, ligados por FK:

- **`temp_nav`** (`api/v1/temp-nav`) — a "casca" do app: nome, imagem,
  ícone de mensagens, versão do sistema. Não é o menu em si.
- **`temp_menu`** (`api/v1/temp-menu`) — árvore de itens navegáveis de
  UM `temp_nav` (FK `temp_nav_id`), com auto-relacionamento `parent_id`
  para submenu. Antes de 2026-09-13 os nomes eram trocados: esta tabela se
  chamava `menu_items` e a config de branding usava o nome que esta tabela tem hoje, `temp_menu`, antes da troca.

Ambos seguem o padrão obrigatório de módulo (Routes + Controller + Request +
Processor + Model + Migration, 18 rotas de tabela cada — ver
[`ROADMAP_padrao_modulo.md`](ROADMAP_padrao_modulo.md)).

## Schema

`temp_nav`:

| Coluna            | Tipo                                  | Observação                      |
| ------------------ | -------------------------------------- | -------------------------------- |
| `title`            | VARCHAR(255)                           | nome do app exibido na navbar    |
| `image`            | VARCHAR(255) NULL                      | logo                             |
| `message_icon`     | VARCHAR(255) NULL                      | ícone de notificações            |
| `system_version`   | VARCHAR(20) DEFAULT '1.0.0'             | badge ao lado do nome (ex. "v1") |
| `status`           | ENUM('active','draft','inactive')      | nasce `draft`                    |

`temp_menu`:

| Coluna             | Tipo                               | Observação                                          |
| ------------------- | ------------------------------------ | ---------------------------------------------------- |
| `temp_nav_id`   | BIGINT NOT NULL FK → `temp_nav.id` (CASCADE) | dono do item                              |
| `parent_id`        | BIGINT NULL FK → `temp_menu.id` (self, CASCADE) | submenu; `NULL` = raiz            |
| `title`            | VARCHAR(255) NOT NULL                | rótulo exibido                                       |
| `react_route`      | VARCHAR(255) NULL                    | destino no frontend; `NULL` = item só organizacional (agrupador sem link) |
| `placement`        | ENUM('navbar','offcanvas') DEFAULT 'navbar' | onde o item de topo (e todo o seu grupo de filhos) aparece: barra superior ou painel Offcanvas. Só vale no item de topo — filhos seguem o pai. Migrations `AlterTable20260924MenuPlacement` / `SeedTable20260924MenuPlacement` (2026-09-24) |
| `roles`            | JSON NULL                            | lista de slugs de `user_roles` com acesso — **hoje só cadastro, sem enforcement no frontend** (não há sessão/auth de usuário) |
| `sort_order`       | INT DEFAULT 0                        | ver convenção de faixas abaixo                       |
| `status`           | ENUM('active','draft','inactive')    | nasce `draft` (default da coluna; `create()` ignora status enviado no body) |

### Regra — Offcanvas é o menu lateral quando o template exigir

A marcação **Offcanvas** (`placement = 'offcanvas'`, painel `offcanvas-start` do
Bootstrap) deve ser tratada como o **menu lateral** sempre que o template exigir
esse tipo de menu. Nos templates (`/template001`, `/template002`, `/template003`):

- Itens `offcanvas` formam o **menu lateral**; itens `navbar` formam a **barra de navegação** (nav).
- Template001 e Template002: menu lateral em coluna fixa a partir de `lg` e painel Offcanvas abaixo de `lg`.
- Template003: não há coluna fixa; o menu lateral é sempre o painel Offcanvas, aberto pelo ícone da grade, em qualquer tamanho de tela.

## Convenção de faixas de `sort_order` (decisão desta sessão, 2026-09-13)

`temp_menu` guarda **todas** as rotas conhecidas do site na mesma tabela —
não só os links do topo. Como não existe (ainda) um campo dedicado tipo
`show_in_navbar`, a distinção é feita por `sort_order`:

| Faixa           | Significado                                                                 |
| ---------------- | ---------------------------------------------------------------------------- |
| `< 100`          | **Navbar real do site.** `parent_id` sempre nulo. É o que `GET template-render/get` (`Builder`) entrega ao nav do layout global (`components/template/TemplateNavRegion.tsx`); se a API falhar o nav mostra só Home. Hoje: Início(10), Usuários(20), Uploads(30), Formulários(40), Nav(50), Menus(60), Calendario(70). |
| `>= 1000`        | Catálogo "Extra": rotas reais do site que não aparecem no navbar nem na árvore administrativa (sub-rotas de CRUD, placeholders, 404). Hoje vivem todas reparentadas sob o nó "Extra" da árvore abaixo. |
| `>= 2000`        | Árvore administrativa "Menu" (ver abaixo) — visível só na tela de gestão, nunca no navbar real. |

**Nunca reparentar nem tirar de `sort_order < 100` os 7 itens do navbar** — eles
precisam continuar com `parent_id` nulo e `sort_order` nessa faixa, senão somem
do site.

## Árvore atual (temp_nav_id=1, "Menu Teste")

Construída manualmente nesta sessão (não é regra fixa, é o estado de exemplo/dev):

```
Início(10) / Usuários(20) / Uploads(30) / Formulários(40) / Nav(50) / Menus(60) / Calendario(70)   <- navbar real
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
│  ├─ Listar        -> /v1/temp-nav
│  └─ Menu
│     └─ Listar     -> /v1/temp-menu
├─ Calendario       -> /v1/form/calendario
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

Reproduzível do zero via `TempMenuSeeder` (ver seção Seeders) — o seed usa
títulos ASCII (Inicio/Usuario/Formularios...) por causa do bug de charset
abaixo; os títulos acentuados acima refletem o estado atual editado manualmente
via API antes da descoberta do bug.

## Consumo no frontend

- **Navbar real** (`layouts/TemplateLayout.tsx` + `components/template/*`, desde 2026-10-28; antes `Navbar.tsx` + `useSiteMenu.ts`):
  com sessão, o frontend chama `GET api/v1/template-render/get`. O backend (`Services/V1/Template/TemplateRender/Builder`) usa o
  primeiro `temp_nav` ativo da empresa, pega os `temp_menu` ativos dele, filtra por `roles` (superuser vê tudo; item sem `roles`
  é livre), descarta raízes com `sort_order >= 100`, monta a árvore e separa pelo `placement` do item de topo em `nav`
  (navbar) e `menu` (offcanvas = menu lateral). Visitante: nav só com Home e Entrar, sem consultar `temp_menu`.
- **Tela de gestão** (`pages/v1/template/temp-menu/GetAllPage.tsx`): com `?temp_nav_id=`
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
`create`/`update` de `temp_menu` (e provavelmente de qualquer tabela na
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

`app/Database/Seeds/TempNavSeeder.php` e `TempMenuSeeder.php`. Resumo:

- `TempNavSeeder`: idempotente por `title` ("Menu Teste") — se existe, faz
  `deleteHard` (CASCADE apaga os itens de menu) e recria via `Processor`.
- `TempMenuSeeder`: chama `TempNavSeeder` primeiro, depois recria a
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
- [x] **Navbar com dropdown real**: o nav do layout global (`TemplateNavRegion`) desenha dropdown de um nível, e o menu lateral
      desenha grupos recolhíveis (2026-10-28).
- [x] **Enforcement de `roles`**: implementado no backend, em
      `Services/V1/Template/TemplateRender/Builder.php` (antes em `hooks/useSiteMenu.ts`) — cada item é
      filtrado contra o `role_slug` da sessão antes de montar a
      árvore; `roles: null` libera para qualquer autenticado, um pai fora do
      role esconde os filhos junto.
- [ ] **Nomes provisórios**: "Buld Form" (grafia informal de "Build Form",
      mapeado para o módulo Formulários) — considerar renomear para algo mais
      claro quando o bug de acento for corrigido.
- [ ] **Investigar** o título "Início II" encontrado no item id1 (navbar real,
      rota `/`) — não foi alterado por nenhuma automação desta sessão;
      conferir se foi um teste manual antes de seguir confiando nesse valor.

[◄ Índice da base de conhecimento](../README.md)

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
