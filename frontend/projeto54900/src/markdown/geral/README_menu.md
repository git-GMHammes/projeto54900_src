[◄ Índice da base de conhecimento](../README.md)

---

# Menu — como a navbar e a árvore administrativa são montadas

> **Atualização 2026-10-28:** a navbar e o menu lateral passaram a ser desenhados pelo layout global do template
> (`layouts/TemplateLayout.tsx` → `components/template/*`), alimentados por `GET api/v1/template-render/get`. O antigo
> `components/layout/Navbar.tsx` e o `hooks/useSiteMenu.ts` continuam no código, **sem uso**. As regras de dados abaixo
> (`placement`, faixas de `sort_order`, `roles`) seguem valendo e agora são aplicadas pelo backend (`Builder`).

Duas tabelas, ligadas por FK. Nenhuma delas é "o menu" sozinha.

- **`temp_nav`** (`api/v1/temp-nav`) — a casca do app: nome exibido na
  navbar, imagem, ícone de mensagens, versão do sistema. Não guarda itens de
  navegação.
- **`temp_menu`** (`api/v1/temp-menu`) — a árvore de itens. Cada linha
  pertence a UM `temp_nav` (`temp_nav_id`) e pode ter `parent_id`
  (auto-relacionamento, para submenu).

## Arquivos que montam a navbar real do site

| Arquivo                            | Papel                                                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `layouts/TemplateLayout.tsx`       | layout global: escolhe a variante (001, 002, 003) e a fonte dos dados (visitante ou sessão)           |
| `hooks/useTemplate.ts`             | com sessão, busca `template-render/get` (template, nav, menu lateral, cabeçalhos e rodapés)           |
| `components/template/TemplateNavRegion.tsx` | desenha o nav (itens, dropdown de 1 nível, badge de mensagens, menu do usuário); visitante: só Home e Entrar |
| `components/template/TemplateSideMenu.tsx`  | desenha o menu lateral (itens `offcanvas`): coluna (001, 002) ou Offcanvas (003)                |
| `hooks/useSiteMenu.ts`, `components/layout/Navbar.tsx` | **substituídos** (sem uso); a lógica de roles, dropdown e `FALLBACK_NAV` foi migrada     |
| `services/v1/tempNav.table.ts`  | recurso REST de `temp_nav`                                                                         |
| `services/v1/tempMenu.table.ts` | recurso REST de `temp_menu`                                                                        |
| `constants/api.ts`                 | nomes dos grupos (`API_GROUPS.tempNav` = `temp-nav`, `API_GROUPS.tempMenu` = `temp-menu`) |

## Chamadas de API (histórico do `useSiteMenu.ts`; hoje o backend faz o equivalente em `template-render/get`)

1. `GET api/v1/temp-nav?status=active&limit=1` — pega o primeiro nav ativo.
   Se não houver nenhum, `items` fica vazio.
2. `GET api/v1/temp-menu?temp_nav_id=<id do nav>&status=active&limit=100`
   — todos os itens ativos daquele nav.
3. Do resultado, filtra `parent_id === null` e `sort_order < 100`, ordena por
   `sort_order` e descarta quem não tem `react_route` preenchida.
4. Se a lista final tiver 0 itens (erro de rede, nav inativo, tabela vazia),
   o nav mostra só **Home** (`HOME_ONLY_ENTRIES` em `components/template/templateNav.ts`) em vez de ficar vazio.

## Destino do item — `placement` (Navbar / Offcanvas, 2026-09-24)

Coluna `temp_menu.placement ENUM('navbar','offcanvas') DEFAULT 'navbar'`.

- **Só o item de topo decide.** `useSiteMenu.ts` separa os itens de topo
  (`parent_id NULL`, `sort_order < 100`) em duas listas pelo `placement`;
  os filhos seguem o pai — o `placement` gravado num filho é ignorado.
- `navbar` → barra superior (dropdown se tiver filhos), como antes.
- `offcanvas` → painel `offcanvas-start` do Bootstrap (`#siteMenuOffcanvas`),
  com `list-group`; grupo com filhos vira `collapse`. Links levam
  `data-bs-dismiss="offcanvas"` para fechar o painel ao navegar.
- Botão de abertura: ícone `bi-grid-3x3-gap-fill`, primeiro `<li>` da barra
  (antes de Home). **Sempre visível**; sem item `offcanvas` o painel mostra um aviso.
- Tudo por `data-attributes` do Bootstrap (sem API JS — ver `types/vendor.d.ts`).
- Forms: `pages/v1/template/temp-menu/{CreatePage,UpdatePage}.tsx` têm o radio "Local".
- Listagem `/v1/temp-menu` (`GetAllPage.tsx`, árvore e tabela): ações só
  ícone com tooltip (`.icon-action-tooltip`). Item de topo tem 2 ícones de
  destino — Navbar (`bi-menu-button-wide-fill`) e Offcanvas
  (`bi-layout-sidebar-inset`); o ativo fica preenchido/desabilitado. O clique
  grava `placement` no item e em todos os descendentes (PUT por item).

### Regra — Offcanvas é o menu lateral quando o template exigir

A marcação **Offcanvas** (`placement = 'offcanvas'`, painel `offcanvas-start` do
Bootstrap) deve ser tratada como o **menu lateral** sempre que o template exigir
esse tipo de menu. Nos templates (`/template001`, `/template002`, `/template003`):

- Itens `offcanvas` formam o **menu lateral**; itens `navbar` formam a **barra de navegação** (nav).
- Template001 e Template002: menu lateral em coluna fixa a partir de `lg` e painel Offcanvas abaixo de `lg`.
- Template003: não há coluna fixa; o menu lateral é sempre o painel Offcanvas, aberto pelo ícone da grade, em qualquer tamanho de tela.

## Convenção de faixas de `sort_order` (não é constraint de banco, é convenção)

| Faixa     | Significado                                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `< 100`   | Navbar real. `parent_id` sempre `NULL` — é o que o `Builder` de `template-render/get` entrega.                                                         |
| `>= 1000` | Catálogo "Extra": rotas reais do site que não pertencem a menu nenhum (sub-rotas de CRUD com `:id`, páginas de sistema, 404). |
| `>= 2000` | Árvore administrativa, visível só na tela de gestão (`/v1/temp-menu?temp_nav_id=`), nunca no navbar real.               |

O nav (`TemplateNavRegion`) desenha item com filhos como **dropdown de um nível** (o filho precisa ter `react_route`; netos
não aparecem), e o menu lateral desenha o item com filhos como grupo recolhível. Um item "pai" sem `react_route` serve só para
agrupar filhos: aparece se tiver ao menos um filho com rota. Para um **item de topo** aparecer na navbar real ele precisa de
`parent_id = NULL`, `sort_order < 100`, status `active`, `roles` compatíveis com o perfil do usuário, e rota ou filho com rota.

## Tela de gestão (admin)

`pages/v1/template/temp-menu/GetAllPage.tsx`:

- Com `?temp_nav_id=<id>` na URL: busca **todos** os itens daquele nav
  (sem paginação) e monta a árvore indentada em estado React
  (expand/collapse), agrupando por `parent_id`. É a ÚNICA tela que mostra
  hierarquia de verdade.
- Sem esse parâmetro: lista todos os `temp_nav` numa tabela plana
  paginada (comportamento padrão de listagem).

O ponto de entrada para chegar lá com o filtro certo é o botão "Ver itens"
no detalhe de um nav (`pages/v1/template/temp-nav/GetPage.tsx`), que monta o link via
`paths.v1.menu.listByNav(id)`.

## Erros já cometidos aqui — não repetir

1. **Rodar seed/dump sem checar o que já existe.** Em 2026-09-19, rodar
   `DumpSeeder` inseriu itens novos em `temp_menu` que coexistiram com
   itens que já estavam no banco (nenhum conflito de `id`, então
   `REPLACE INTO` virou `INSERT` puro) — resultado: navbar duplicada.
   **Antes de rodar qualquer seed que toque `temp_menu`/`temp_nav`,
   contar quantas linhas já existem** (`SELECT COUNT(*) FROM temp_menu`).
   Se for maior que zero, não rodar sem entender o que já está lá.
2. **Charset.** A conexão `default` (`Config/Database.php`) usa `utf8`
   (legado), não `utf8mb4`. Gravar título acentuado direto por
   `INSERT`/`UPDATE` via `mysql` no client pode gerar mojibake se o cliente
   não estiver com `--default-character-set=utf8mb4`. Prefira gravar via API
   (`POST/PUT api/v1/temp-menu`) quando possível — o Processor do backend
   já lida com isso; se gravar direto no banco, sempre usar
   `--default-character-set=utf8mb4` no `mysql`.
3. **`react_route` de item organizacional.** Um item pensado como "pasta"
   (agrupador de submenu, sem link próprio) deve ter `react_route = NULL` —
   mas hoje isso o torna invisível também na navbar real (ver limitação
   acima). Confirmar com o usuário antes de criar itens assim.

## Árvore de navegação — proposta (2026-09-19)

```

Home
Usuários
├─ Listar
├─ Login
├─ Cadastro Usuário
└─ Dados Usuário
Calendário
└─ Novo Calendário
└─ Admin Calendário
Uploads
Form
├─ Listar Formulários
├─ Novo Formulário
└─ Modelo IA
List
├─ Listar
└─ Novo Listagem
Nav
├─ Listar Nav
└─ Novo Nav
Menus
├─ Listar Menus
└─ Novo Item
Entrar

```

| Item               | Rota                          |
| ------------------ | ----------------------------- |
| Home               | `/`                           |
| Usuários           | ``                            |
| Listar             | `/v1/user-manager`            |
| Login              | `/v1/login`                   |
| Cadastro Usuário   | `/v1/user-manager/create`     |
| Dados Usuário      | `/v1/user-profiles`           |
| Calendário         | ``                            |
| Novo Calendário    | `/v1/form/calendario`         |
| Admin Calendário   | `/v1/calendar-manager`        |
| Uploads            | `/v1/upload-manager`          |
| Form               | ``                            |
| Listar Formulários | `/v1/form-constructor`        |
| Novo Formulário    | `/v1/form-constructor/create` |
| Modelo IA          | `/v1/form-constructor-claude` |
| List               | ``                            |
| Listar             | `/v1/list-constructor`        |
| Novo Listagem      | `/v1/list-constructor/create` |
| Nav                | ``                            |
| Listar Nav         | `/v1/temp-nav`             |
| Novo Nav           | `/v1/temp-nav/create`      |
| Menus              | ``                            |
| Listar Menus       | `/v1/temp-menu`            |
| Novo Item          | `/v1/temp-menu/create`     |
| Entrar             | `/v1/login`                   |

> **Form é teste, os demais são resultado pronto.** O ramo "Form"
> (`/v1/form-constructor*`) é o ambiente de teste/dogfooding do próprio
> módulo Form — ver
> [`README_form_constructor.md`](README_form_constructor.md). Usuários,
> Calendário e Uploads têm listagem própria e já pronta (`GetAllPage`
> dedicada de cada módulo), sem passar pelo form-constructor.

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
