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

## Convenção de `sort_order` e hierarquia (decisão desta sessão, 2026-09-14)

`menu_manager` guarda **só** o que aparece no Navbar real — nada de catálogo de
rotas extras nem árvore administrativa separada (isso existiu entre
2026-09-13 e 2026-09-14 e foi removido: over-engineering, ninguém pediu). A
árvore espelha 1:1 os grupos de módulo do backend (`Config/Routes.php`: /User,
/Upload, /Form, /Nav, /Menu — /Calendar e /Meta ficam fora por não terem página
no frontend ainda).

Regra de hierarquia: **grupo com filho nunca tem `react_route`** (fica só como
agrupador do dropdown); módulo com uma página só vira link direto, sem filho.
`sort_order` só ordena dentro do próprio nível (topo entre si, filhos entre
si) — não existe mais faixa `< 100` / `>= 1000` / `>= 2000`.

## Árvore atual (nav_manager "Menu Teste")

Reproduzível do zero via `MenuManagerSeeder` (ver seção Seeders). Títulos
ASCII por causa do bug de charset abaixo.

```
Inicio(10)                              -> /
User(20)                                   (sem link)
├─ Usuarios(1)                          -> /v1/user-manager
└─ Cadastro(2)                          -> /v1/register
Upload(30)                              -> /v1/upload-manager
Form(40)                                    (sem link)
├─ Formularios(1)                       -> /v1/form-constructor
└─ Calendário(2)                        -> /v1/form/calendario
Nav(50)                                 -> /v1/nav-manager
Menu(60)                                -> /v1/menu-manager
```

## Consumo no frontend

- **Navbar real** (`components/layout/Navbar.tsx` + `hooks/useSiteMenu.ts`):
  busca `nav_manager` com `status=active`, depois **todos** os itens ativos de
  `menu_manager` desse nav, monta árvore de 1 nível por `parent_id`
  (`buildTree`) e expõe `{to,label,end,children?}`. Item com `children` vira
  dropdown Bootstrap nativo (`nav-item dropdown` + `dropdown-toggle` +
  `dropdown-menu`, via `data-bs-toggle`, sem JS/CSS próprio). Fallback para um
  array estático (`FALLBACK_NAV`, já no formato com `children`) se a API
  falhar ou vier vazia.
- **Tela de gestão** (`pages/v1/menu/GetAllPage.tsx`): com `?nav_manager_id=`
  na URL, busca **todos** os itens desse nav (sem paginação) e renderiza como
  árvore indentada (componente local `MenuTreeRow`, expand/collapse em estado
  React), agrupando por `parent_id`. Sem esse parâmetro, lista todos os navs
  numa tabela plana paginada (comportamento original, inalterado).

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
  árvore de 10 itens da seção "Árvore atual" — títulos ASCII por causa do bug
  de charset acima.
- Executado em 2026-09-14: nav "Menu Teste" recriado (#3), 10 itens ativos.
  Comando: `podman compose exec php php spark db:seed MenuManagerSeeder`.

## Pendências / continuar amanhã

- [x] **Rodar os seeders** — feito em 2026-09-14.
- [x] **Navbar com dropdown real** — feito em 2026-09-14: `useSiteMenu.ts`
      monta árvore de 1 nível por `parent_id`, `Navbar.tsx` renderiza dropdown
      Bootstrap nativo para item com `children`.
- [ ] **Decidir se corrige o bug de charset** (`Config/Database.php:99`,
      `utf8` → `utf8mb4`) — impacta qualquer texto acentuado gravado na
      conexão `default`, não só nav/menu.
- [ ] **Enforcement de `roles`**: campo existe e é validado, mas nada no
      frontend filtra por perfil do usuário logado — não há sessão/auth no
      frontend hoje. Depende de um sistema de login existir primeiro.
- [ ] **Botão "Novo usuario"** (`pages/v1/user/user-manager/GetAllPage.tsx`)
      aponta para `paths.v1.user.create` (`CreatePage`, stub em branco) em vez
      de `paths.v1.user.register` (fluxo que funciona) — bug separado da
      hierarquia de menu, não corrigido nesta tarefa.

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
