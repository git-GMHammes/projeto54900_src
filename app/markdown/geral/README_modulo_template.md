[◄ Índice](../README.md)

---

# Módulo Template — nav, menu, cabeçalho e rodapé por empresa

Substitui os JSONs `template001/002/003.json` por tabelas `temp_*` (prefixo `temp_` =
template). Os três templates são variantes de **código** (bordas 3D, sem bordas, menu
lateral em Offcanvas); o **conteúdo** vem do banco e vale para várias empresas.

## Tabelas

| Tabela        | Conteúdo                                                        | Equivale no JSON                 |
| ------------- | --------------------------------------------------------------- | -------------------------------- |
| `temp_nav`    | casca do app: título, imagem, ícone de mensagens, versão        | (sem equivalente nos JSONs)      |
| `temp_menu`   | árvore de itens (`parent_id`, `sort_order`, `placement`, `roles`) | `nav[]` (navbar) e `menu[]` (offcanvas) |
| `temp_manager` | catálogo de templates: `code` (`template001/002/003`), nome, empresas que usam cada um | (`template` do JSON) |
| `temp_header` | fundo, logo esquerda/centro/direita (texto, imagem, alt), nome  | `header`                         |
| `temp_footer` | 4 colunas (`col1..col4`: título, texto, imagem, alt)            | `footer`                         |

- `placement = 'navbar'` forma a barra de navegação; `'offcanvas'` forma o **menu lateral**
  (ver `README_modulo_nav_menu.md`).
- Nas colunas do rodapé e nas logos do cabeçalho, a **imagem preenchida vence** título e texto.
- `content_headings` (o meio do template) **não tem tabela**: o meio recebe qualquer módulo.
- `temp_footer` tem também `title`, `layout` (`columns` ou `highlight`) e `col1_icon..col4_icon`, todas NULL e
  aditivas: sem `layout` o rodapé é o de 4 colunas de sempre. Detalhe em `README_template001_modelo.md` (seção 15).
- `temp_header` e `temp_footer` podem ter várias linhas ativas por empresa: o frontend as
  empilha por `sort_order`. Não há coluna `template`.

## Empresas: `company_manager`

Todas as `temp_*` têm `company_manager` (JSON NOT NULL): lista de **slugs**, por exemplo
`["default","tryikads"]`. Regras, validação e slug imutável em
`README_modulo_companies.md` (seção "Empresas nas tabelas `temp_*`").

- **Leitura:** os models usam o escopo `json_slug` (`Models/V1/Concerns/CompanyScoped.php`):
  só aparecem as linhas cuja lista contém o slug da empresa da sessão. Sessão sem empresa
  válida não recebe nenhuma linha.
- **Escrita:** `adminonly` nas 7 rotas de escrita (`create`, `update`, `delete-soft`,
  `delete-restore`, `delete-hard`, `clear-deleted` e `clear-deleted/{id}`) de `temp-nav`,
  `temp-menu`, `temp-header` e `temp-footer`.

## Catálogo de templates (`temp_manager`)

Uma linha por template (`template001`, `template002`, `template003`, com `code` único e imutável) e a lista
`company_manager` (pode ser vazia) das empresas que o usam. **Uma empresa pode estar em vários templates:** o padrão
dela é o template ativo de **menor `id`**, e cada usuário pode escolher o seu (ver "Template do usuário").

- Acesso **exclusivo do superuser** (`superuseronly` em `Config/Filters.php`); sem escopo por empresa (catálogo global).
- `template-render/get` devolve `template: { id, code, name }` (o efetivo), `templates` (os ativos da empresa da sessão)
  e `preferred_id` (a escolha do usuário). As rotas `/template001`, `/template002` e `/template003` seguem como prévia.
- Valores iniciais (DEV): `template001` = `["default"]`, `template002` = `["tryikads"]`, `template003` = `[]`.

## Template do usuário (`user_manager.temp_manager_id`)

Coluna BIGINT nula em `user_manager`, FK para `temp_manager(id)` com `ON DELETE SET NULL`. Nula = automático.

- **Template efetivo** (`Builder`): a escolha do usuário, se for um template **ativo** cuja lista `company_manager` traga o
  slug da empresa da sessão; senão o de menor `id` ativo da empresa; senão `null`. Uma escolha que deixou de valer
  (template inativo, apagado ou sem a empresa) cai no padrão, sem erro.
- **Gravação:** só `PUT /api/v1/template-render/preference`, body `{"temp_manager_id": <id>|null}`, para o PRÓPRIO usuário
  (`Services/V1/Template/TemplateRender/Preference.php`; 422 se o template não estiver disponível para a empresa). A coluna não
  está em `allowedFields` de `user_manager`: o CRUD de usuários nunca a altera.
- **Login e `me`:** `user.temp_manager_id` vem na resposta. Não vai nos claims do token: é preferência visual, não autorização.
- **Frontend:** seletor "Template" em "Editar perfil" (`components/global/TemplatePreference.tsx`): "Automático (menor ID da
  empresa)" mais os templates da empresa. A escolha vale em todo login.

## Template do visitante (rota pública)

`GET /api/v1/template-public/get/{slug}` — **sem login** (fora do `jwtauth`): devolve `{ color_theme, template, headers, footers }` da
empresa do slug da URL: o template padrão (menor `id` ativo, `{ id, code, name }` ou `null`) e os cabeçalhos e rodapés ativos
cuja lista `company_manager` traz o slug, no mesmo formato de `template-render/get` (empilhados por `sort_order`). **Não** saem
por essa rota: nav, menu e a casca do app (`temp_nav`). O frontend a usa nas telas de visitante (`/<slug>/v1/login`) para a
variante visual, o cabeçalho e o rodapé da empresa; sem slug na URL ou sem template, vale `VITE_GUEST_TEMPLATE` e o rodapé simples.
Como não há sessão, o filtro por empresa é feito no `Builder::publicContentOfSlug`, explicitamente pelo slug.

## Rotas

| Grupo             | Rotas                                    | Fonte                                                              |
| ----------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| `temp-nav`        | 18 (padrão `EndpointTable`)              | `Config/Routes/Api/v1/Template/TempNav/EndpointTable.php`          |
| `temp-menu`       | 18                                       | `.../Template/TempMenu/EndpointTable.php`                          |
| `temp-header`     | 18                                       | `.../Template/TempHeader/EndpointTable.php`                        |
| `temp-footer`     | 18                                       | `.../Template/TempFooter/EndpointTable.php`                        |
| `temp-manager`    | 18 (todas `superuseronly`)               | `.../Template/TempManager/EndpointTable.php`                       |
| `template-render` | 2: `GET .../get` e `PUT .../preference`  | `.../Template/TemplateRender/EndpointRender.php`                   |
| `template-public` | 1: `GET .../get/{slug}` (**pública**)    | `.../Template/TemplateRender/EndpointPublic.php`                   |

Todas com `jwtauth` por wildcard em `Config/Filters.php`, exceto `template-public` (sem login) e com `temp-manager` restrito ao
superuser (`superuseronly`). No `create`, `status` nunca vem do
cliente (nasce `draft`; ativar é um `update`) e `company_manager` ausente assume a empresa da sessão.

## `GET /api/v1/template-render/get[?temp_nav_id=]`

Entrega o template da empresa da sessão no formato dos JSONs (`Services/V1/Template/TemplateRender/Builder.php`):

```
{ color_theme: <nome da paleta> | null,   // company_manager.color_theme da empresa da sessao (null = padrao)
  template: {id,code,name} | null,   // template efetivo: a escolha do usuario ou o de menor id ativo da empresa
  templates: [ {id,code,name} ],       // templates ativos da empresa da sessao (o primeiro e o padrao)
  preferred_id: <id> | null,           // escolha gravada do usuario (null = automatico)
  temp_nav: {id,title,image,message_icon,system_version} | null,
  nav:     [ {id,order,label,url,icon,is_bookmark,type,placement,children[]} ],   // itens de topo 'navbar'
  menu:    [ ... ],                                                               // itens de topo 'offcanvas' = menu lateral
  headers: [ {id,name,sort_order,background_image[],logo[],company_name[]} ],     // empilhados por sort_order
  footers: [ {id,name,sort_order,title,layout,footer_headings[],footer_images[]} ] }
  // layout: 'columns' (padrao) ou 'highlight'; title: titulo do modelo highlight, com [d]palavra[/d];
  // footer_headings[].icon: classe Bootstrap Icons (bi-xxx) do item no modelo highlight.
```

- Só registros `active` e não excluídos. O `temp_nav` usado é o de `temp_nav_id` ou, sem o
  parâmetro, o primeiro ativo visível à empresa (menor `id`). No menu entram só as raízes com `sort_order < 100`
  (faixa da navegação real; ver `README_modulo_nav_menu.md`).
- O menu já sai filtrado por `roles`: item sem `roles` é livre; com `roles`, só para o perfil
  listado; `superuser` vê tudo. Item cujo pai está oculto some junto.

## Arquivos

- Models/Controllers/Services/Requests: `.../V1/Template/{TempNav,TempMenu,TempHeader,TempFooter,TempManager}/`
- Validação da lista de empresas: `Services/V1/Template/CompanyManagerColumn.php`
- Montagem do template: `Services/V1/Template/TemplateRender/Builder.php` (nav, menu, cabeçalhos, rodapés, template efetivo e conteúdo
  público por slug), `.../TemplateRender/Preference.php` e `Controllers/Api/V1/Template/TemplateRender/RenderController.php`
- Escopo por empresa: modo `json_slug` em `Models/V1/Concerns/CompanyScoped.php`
- Registro das rotas no catálogo: tabela `route_manager` (grupos `temp-header`, `temp-footer`, `temp-manager`, `template-render`, `template-public`)

## Telas de administração (frontend)

Rotas em `src/frontend/projeto54900/src/routes/v1/template.routes.tsx`, só admin:

- `temp-header` e `temp-footer`: lista, busca, cadastro, edição e exclusão gerados pelos builds do banco
  (`list_manager` slugs `header` e `footer`; `form_manager` slugs `criar-cabecalho`, `editar-cabecalho`,
  `criar-rodape`, `editar-rodape`). Páginas finas em `pages/v1/template/temp-header|temp-footer`.
- `temp-nav` e `temp-menu`: páginas próprias (menu em árvore); ganharam o campo `company_manager`.
  As colunas "Empresas" e "Ícone" vêm de `list_columns`.
- `temp-manager` (catálogo de templates e as empresas de cada um): `ListBuild` slug `template`, formulários `criar-template` e
  `editar-template`; **só superuser**.
- Menu lateral: grupo "Template" (`temp_menu`) com Cabeçalhos, Rodapés e Templates.
- Catálogo: linhas `frontend` em `route_manager` (grupos `temp-header`, `temp-footer` e `temp-manager`).

## Migração para o sistema real (layout global)

`TemplateLayout` (frontend) substituiu o `RootLayout`: um código só (`TemplateShell`) com cabeçalho, nav, menu lateral
(coluna ou Offcanvas), conteúdo e rodapé, nas três variantes. Antes do login: nav só com Home e Entrar e, pelo slug da URL
(`template-public/get/{slug}`), a variante, o cabeçalho e o rodapé da empresa; sem slug, a variante do `env` (`VITE_GUEST_TEMPLATE`).
Depois do login: o template do usuário ou da empresa, por `template-render/get`. Cores sempre da paleta do `env`. Detalhe em `README_rotas_frontend.md` (seção "Layout global do sistema").

## Pendências

- Os templates estáticos (`/template001`, `/002`, `/003`) seguem lendo os JSONs, de propósito (modelos de prévia); o sistema real usa `TemplateLayout` + `template-render/get`.
- Itens USUARIO e SAIR do nav vêm da sessão (sem coluna `type` no banco).
- Se a lista `company_manager` passar de ~100 slugs por registro, trocar a coluna JSON por
  tabela de ligação com FK (ver `README_modulo_companies.md`).
- Cache por empresa (Redis) só quando houver volume que justifique.
- Testar de ponta a ponta no navegador com login (nav, menu lateral e as três variantes) e `template-render`/`preference` por HTTP com token.

---

[◄ Índice](../README.md)
