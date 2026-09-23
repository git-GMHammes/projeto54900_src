[◄ Índice da base de conhecimento](../README.md)

---

# Menu — como a navbar e a árvore administrativa são montadas

Duas tabelas, ligadas por FK. Nenhuma delas é "o menu" sozinha.

- **`nav_manager`** (`api/v1/nav-manager`) — a casca do app: nome exibido na
  navbar, imagem, ícone de mensagens, versão do sistema. Não guarda itens de
  navegação.
- **`menu_manager`** (`api/v1/menu-manager`) — a árvore de itens. Cada linha
  pertence a UM `nav_manager` (`nav_manager_id`) e pode ter `parent_id`
  (auto-relacionamento, para submenu).

## Arquivos que montam a navbar real do site

| Arquivo                            | Papel                                                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `hooks/useSiteMenu.ts`             | busca os dados na API e monta a lista `{to, label, end}`                                              |
| `components/layout/Navbar.tsx`     | renderiza a lista como `<NavLink>`; tem o fallback estático `FALLBACK_NAV`                            |
| `services/v1/navManager.table.ts`  | recurso REST de `nav_manager`                                                                         |
| `services/v1/menuManager.table.ts` | recurso REST de `menu_manager`                                                                        |
| `constants/api.ts`                 | nomes dos grupos (`API_GROUPS.navManager` = `nav-manager`, `API_GROUPS.menuManager` = `menu-manager`) |

## Chamadas de API, na ordem que `useSiteMenu.ts` faz

1. `GET api/v1/nav-manager?status=active&limit=1` — pega o primeiro nav ativo.
   Se não houver nenhum, `items` fica vazio.
2. `GET api/v1/menu-manager?nav_manager_id=<id do nav>&status=active&limit=100`
   — todos os itens ativos daquele nav.
3. Do resultado, filtra `parent_id === null` e `sort_order < 100`, ordena por
   `sort_order` e descarta quem não tem `react_route` preenchida.
4. Se a lista final tiver 0 itens (erro de rede, nav inativo, tabela vazia),
   o `Navbar.tsx` usa `FALLBACK_NAV` (array fixo no código) em vez de mostrar
   navbar vazia.

## Convenção de faixas de `sort_order` (não é constraint de banco, é convenção)

| Faixa     | Significado                                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `< 100`   | Navbar real. `parent_id` sempre `NULL` — é o que `useSiteMenu.ts` lê.                                                         |
| `>= 1000` | Catálogo "Extra": rotas reais do site que não pertencem a menu nenhum (sub-rotas de CRUD com `:id`, páginas de sistema, 404). |
| `>= 2000` | Árvore administrativa, visível só na tela de gestão (`/v1/menu-manager?nav_manager_id=`), nunca no navbar real.               |

## ⚠️ Limitação atual — NÃO existe dropdown/submenu na navbar pública

`Navbar.tsx` só sabe renderizar uma lista **plana**: `nav.map(item => <NavLink>)`.
Não há nenhum componente de dropdown Bootstrap. Consequência prática:

- Um item com `parent_id` preenchido **nunca aparece na navbar do site**,
  mesmo que o pai tenha `sort_order < 100` — só aparece na tela de gestão
  (`pages/v1/menu/GetAllPage.tsx`, que desenha árvore indentada via
  `MenuTreeRow`, agrupando por `parent_id`, quando a URL tem
  `?nav_manager_id=`).
- Um item "pai" sem `react_route` (organizacional, só para agrupar filhos)
  também não aparece na navbar, porque o filtro de `useSiteMenu.ts` descarta
  quem não tem `react_route`.
- Ou seja: **hoje, para um item aparecer na navbar real, ele tem que ser
  `parent_id = NULL` E ter `react_route` preenchida E `sort_order < 100`.**
  Não existe meio-termo. Implementar dropdown de verdade é trabalho de
  frontend (mudar `Navbar.tsx` + `useSiteMenu.ts` para montar árvore),
  ainda não feito.

## Tela de gestão (admin)

`pages/v1/menu/GetAllPage.tsx`:

- Com `?nav_manager_id=<id>` na URL: busca **todos** os itens daquele nav
  (sem paginação) e monta a árvore indentada em estado React
  (expand/collapse), agrupando por `parent_id`. É a ÚNICA tela que mostra
  hierarquia de verdade.
- Sem esse parâmetro: lista todos os `nav_manager` numa tabela plana
  paginada (comportamento padrão de listagem).

O ponto de entrada para chegar lá com o filtro certo é o botão "Ver itens"
no detalhe de um nav (`pages/v1/nav/GetPage.tsx`), que monta o link via
`paths.v1.menu.listByNav(id)`.

## Erros já cometidos aqui — não repetir

1. **Rodar seed/dump sem checar o que já existe.** Em 2026-09-19, rodar
   `DumpSeeder` inseriu itens novos em `menu_manager` que coexistiram com
   itens que já estavam no banco (nenhum conflito de `id`, então
   `REPLACE INTO` virou `INSERT` puro) — resultado: navbar duplicada.
   **Antes de rodar qualquer seed que toque `menu_manager`/`nav_manager`,
   contar quantas linhas já existem** (`SELECT COUNT(*) FROM menu_manager`).
   Se for maior que zero, não rodar sem entender o que já está lá.
2. **Charset.** A conexão `default` (`Config/Database.php`) usa `utf8`
   (legado), não `utf8mb4`. Gravar título acentuado direto por
   `INSERT`/`UPDATE` via `mysql` no client pode gerar mojibake se o cliente
   não estiver com `--default-character-set=utf8mb4`. Prefira gravar via API
   (`POST/PUT api/v1/menu-manager`) quando possível — o Processor do backend
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
| Dados Usuário      | `/v1/user-profiles/create`    |
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
| Listar Nav         | `/v1/nav-manager`             |
| Novo Nav           | `/v1/nav-manager/create`      |
| Menus              | ``                            |
| Listar Menus       | `/v1/menu-manager`            |
| Novo Item          | `/v1/menu-manager/create`     |
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
