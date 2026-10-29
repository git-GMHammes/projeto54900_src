[◄ Índice da base de conhecimento](../README.md)

---

# Módulo `company_manager` — empresas e acesso individual (API V1)

> NÃO EXISTE ALTERAÇÃO de MIGRATE: apenas no fim de cada ciclo um novo, para a renovação de todo o sistema.

Dois recursos novos e uma coluna nova:

1. **`company_manager`** — cadastro de empresas (módulo `Company/CompanyManager`).
2. **`user_manager.company_ids`** — JSON com os ids das empresas que o usuário pode acessar (ex.: `[1, 2]`).
3. **`user_resource_access`** — permissão **individual** de um usuário a um **form** ou **list**, independente da empresa (módulo `User/UserResourceAccess`).

Aplicado direto no banco DEV (`codeigniter54900_db`) em 2026-10-11, **sem migration** (a estrutura nova ainda não está nas migrations REMAKE — entra no próximo REMAKE autorizado).
Alterações no banco DEV:

| Conteúdo |
| -------- |
| tabelas `company_manager` e `user_resource_access`, coluna `user_manager.company_ids`, empresa DEFAULT, backfill, views `view_company_manager` e `view_user_resource_access` |
| 55 rotas de backend em `route_manager` |
| menu, `list_manager` 42/43, ações, `form_manager` 48/49 |
| 6 rotas de frontend em `route_manager` |
| `company_members`, 3 views e backfill dos vínculos |
| 46 rotas de backend em `route_manager` (company-members) |
| menu "Empresa" com submenus, listas 44/45 e 2 rotas de frontend |

## Empresas (`company_manager`)

| Coluna | Tipo | Observação |
| ------ | ---- | ---------- |
| `id` | BIGINT PK | `1` = empresa **DEFAULT** |
| `name` | VARCHAR(255) | obrigatório |
| `slug` | VARCHAR(100) UNIQUE | derivado do nome quando vazio; `[a-z0-9-]+` |
| `document` | VARCHAR(20) | CNPJ, opcional |
| `status` | ENUM `active`/`inactive` | padrão `active` |
| `created_at`/`updated_at`/`deleted_at` | DATETIME | exclusão lógica |

Regras (`Services/V1/Company/CompanyManager/Processor.php`): slug único (409); a empresa DEFAULT não pode ser excluída (403, soft e hard);
leitura aberta a qualquer autenticado, escrita só admin (`adminonly` nas rotas). `view_company_manager` traz `users_count`
(usuários cujo `company_ids` contém a empresa).

## Empresas do usuário (`user_manager.company_ids`)

- Coluna JSON, `NULL` = sem empresa. O backend aceita string JSON (`"[1,2]"`) ou array, normaliza para inteiros únicos e
  valida contra `company_manager` ativas (422 se alguma não existir). `null` explícito limpa o vínculo (string vazia seria descartada pela sanitização).
- **Modo desenvolvimento:** usuário criado sem `company_ids` entra na empresa DEFAULT. Como este projeto não usa `.env` e o container
  roda com `ENVIRONMENT=production` por padrão, "dev" é decidido pelo **host da requisição** (`Config\Company::$devHosts`:
  `localhost`, `127.0.0.1`, `::1`) ou por `ENVIRONMENT=development` — mesmo critério do `isDevHost()` do frontend.
  Em produção (host fora da lista) o usuário nasce sem empresa.
- `GET auth/me` e o payload de login devolvem `user.companies` (`[{id, name, slug}]`, só empresas ativas).
- A empresa **não** entra no JWT nem filtra dados dos módulos — é apenas o cadastro/vínculo (próximo passo).

## Permissão individual (`user_resource_access`)

| Coluna | Observação |
| ------ | ---------- |
| `user_manager_id` | FK `user_manager` (CASCADE) |
| `resource_type` | `form` ou `list` |
| `resource_id` | id em `form_manager` ou `list_manager` (sem FK: polimórfico) |
| `allowed` | `1` libera, `0` nega |

`UNIQUE (user_manager_id, resource_type, resource_id)` (409 ao repetir). Em `update` só `allowed` muda. CRUD e view: **todas as rotas `adminonly`**.

### Verificação — `GET api/v1/resource-access/check`

Query `type=form|list` + `id=N` **ou** `slug=...`. Resposta `data: { allowed, source, resource_id }`. Precedência:

1. **admin** → libera (`source: admin`);
2. **linha do usuário** para o recurso → `allowed` 1/0 vale (`source: user`);
3. **`roles` do form/list** (varchar: JSON `["user","admin"]` ou texto `admin`/`user,admin`) → perfil precisa estar na lista (`source: role`);
   `roles` vazio = livre para qualquer autenticado (`source: open`);
4. recurso inexistente/excluído → nega (`source: not_found`).

Quem verifica hoje (frontend, ver `geral/modulos/company-manager/README_plano.md` do frontend): `ListBuild`, `RecordFormBuild`, `FormBuild`, `FormRendererPage` e todas as páginas antigas de lista e de formulário (Create/Update).
**Não há bloqueio no backend** em `form-manager`/`list-manager`: quem consulta a API direto ainda lê a definição — é etapa futura.

## Rotas

101 no total: `company-manager` (18) + `company-manager-view` (9) + `user-resource-access` (18) + `user-resource-access-view` (9) + `resource-access/check` (1, desvio sancionado) + membros por empresa (46, ver abaixo).
Mapa em [`README_rotas_swagger.md`](README_rotas_swagger.md). Filtros em `Config/Filters.php` (`jwtauth` por wildcard).

## Arquivos

- `Config/Company.php`, `Config/Routes/Api/v1/{Company/CompanyManager,User/UserResourceAccess,Meta/ResourceAccess}/`
- `Controllers/Api/V1/{Company/CompanyManager,User/UserResourceAccess}/`, `Requests/V1/…`, `Services/V1/…/Processor.php`, `Models/V1/…`
- `Models/V1/User/UserManager/SqlTableModel.php` (`company_ids`), `Services/V1/User/UserManager/Processor.php` (normalização, validação, default dev),
  `Services/V1/Auth/AuthService.php` (`companies` no payload)

## Membros por empresa (`company_members`)

Espelho do módulo de membros de grupo de mensagem (`message_group_members`): o vínculo N:N **usuário ↔ empresa**. Aplicado no DEV em 2026-10-11

| Peça | O que é |
| ---- | ------- |
| `company_members` | `company_id`, `user_manager_id`, `role` (`admin`/`member`), `status` (`active`/`left`/`removed`), soft delete; `UNIQUE (company_id, user_manager_id)`; FK em cascata |
| `view_company_members` | vínculo + empresa + usuário/perfil (prefixos `cm_`, `co_`, `um_`, `uc_`) |
| `view_company_memberships` | uma empresa por linha com `members_count`, `members_names`, `members_search` |
| `view_company_users_companies` | um usuário por linha com `companies_count`, `companies_names` |

**API completa** (46 rotas): `company-members` (18 + `PUT sync/{companyId}`), `company-members-view` (9), `company-memberships-view` (9),
`company-users-companies-view` (9). Regras (`Services/V1/Company/CompanyMembers/Processor.php`):

- escrita (create, update, delete-*, sync) **só admin** (`adminonly` na rota + guarda no Processor); empresa não tem "dono";
- adicionar exige empresa (404) e usuário (404) existentes; vínculo `left`/`removed`/excluído é **reativado**, ativo é ignorado (`skipped`);
- `sync` grava vários vínculos numa transação, tudo ou nada (`add_user_ids`/`remove_user_ids`, teto 1000, sem interseção → 422);
- `update` muda `status` (`active`/`removed`) e/ou `role`; empresa e usuário são imutáveis;
- leitura (tabela e views): usuário comum vê só vínculos das empresas em que é membro ativo; admin vê tudo; `clear-deleted` só admin;
- `view_company_users_companies`: não-admin só enxerga usuários `active`; guest não lê.

**Fonte de verdade e `company_ids`:** `company_members` manda. `Libraries/Company/CompanyMembership.php` mantém as duas pontas iguais:
`syncUserCompanyIds()` recalcula `user_manager.company_ids` a cada mudança de vínculo; `applyUserCompanyIds()` leva os vínculos à lista
gravada quando alguém altera `company_ids` pelo `user-manager` (create/update do `UserManager\Processor`). O backfill inicial gerou 13 vínculos
(todos na DEFAULT).

**Tela de seleção** (frontend, 2026-10-11): `/v1/company-members/update/:id` marca usuários por empresa e grava por `sync` — ver `geral/modulos/company-manager/README_plano.md` do frontend.

**Menu "Empresa"** (`temp_menu`, offcanvas, admin): pai sem rota com os filhos Empresas, Membros (`/v1/company-members`, lista 44),
Usuários por empresa (`/v1/company-users`, lista 45) e Acesso individual (movido de "Usuários").

## Organograma de acesso (SAS)

Esquema Empresa → Usuários → Listas e Forms (desenhado em draw.io em 2026-10-11; a figura não faz parte desta base).

Escopo atual: **empresa e usuários**. Planos, cobrança e isolamento de dados por empresa ficam fora por enquanto.

### Consolidação com o sistema

Confere com o sistema: colunas e slug único de `company_manager`, empresa DEFAULT id=1, `view_company_manager.users_count`,
`user_manager.company_ids` (JSON), `roles` em `form_manager`/`list_manager`, `user_resource_access` (form/list, `allowed` 1/0),
árvore `form_groups → form_rows → form_fields` e `list_columns`/`list_actions`.

Lacunas do esquema (o sistema já tem, o desenho não mostrava) — **corrigidas no `.drawio` e no SVG em 2026-10-11** (itens 1 a 4); o item 5 segue como aviso no próprio desenho:

1. **`company_members` não aparece.** É a fonte de verdade do vínculo usuário ↔ empresa (`role` admin/member, `status`);
   `company_ids` é só a cópia derivada (ver "Fonte de verdade e `company_ids`").
2. **O fluxo "Empresa → Usuários → Listas/Forms" sugere um escopo que não existe.** `form_manager` e `list_manager` não têm
   `company_id`; a empresa não filtra dados nem entra no JWT (ver Pendências). "Permitido" hoje é só por `roles` ou por
   `user_resource_access`.
3. **O vínculo usuário → form/list não está desenhado.** A camada de permissão aparece só no rodapé, sem a precedência
   (admin → `user_resource_access` → `roles`; `roles` vazio = livre) nem o endpoint `resource-access/check`.
4. **Sem bloqueio no backend:** a verificação de acesso é só do frontend (ver Pendências).
5. Os números do desenho (13 usuários, papéis 2/9/2, 38 listas e 45 forms ativos, 0 registros em `user_resource_access`) são um
   retrato de 2026-10-11, não conferido no banco.

## Cor da empresa (`company_manager.color_theme`)

Coluna `VARCHAR(30)` opcional com o nome de uma paleta de `config/themes` do frontend (sem `.json`, ex.: `Purple_dark`); vazio = tema padrão.
Só vale quando o `config/env.ts` não fixa uma paleta (todas as linhas `theme:` comentadas): então a empresa do slug da URL define a cor, antes do
login por `GET template-public/get/{slug}` e depois por `GET template-render/get` (campo `color_theme`). O backend só valida o formato do nome
(letras, números e `_`); nome desconhecido cai no padrão no frontend. Seletor nos formulários `criar-empresa` e `editar-empresa`; a view
`view_company_manager` expõe `co_color_theme`. Ver `README_temas_paleta.md` (frontend).

## Empresas nas tabelas `temp_*` (template): `company_manager` = lista de slugs

As tabelas de template (`temp_nav`, `temp_menu`, `temp_header`, `temp_footer` e `temp_manager`)
têm a coluna `company_manager` (JSON, NOT NULL): lista de **slugs** das empresas
que enxergam o registro, por exemplo `["default","tryikads"]`. O slug é o mesmo
das rotas (`/default/template001`) e, nos perfis, de `roles`.

- **Um registro serve várias empresas.** Não se copia linha por empresa: para uma
  empresa nova usar o menu da DEFAULT, acrescenta-se o slug dela na lista dos
  itens (por exemplo `["default","tryikads"]`).
- **Slug imutável.** A lista não tem FK, então o `slug` de `company_manager` não
  pode ser alterado depois de criado (422 em `PUT /company-manager/update/{id}`).
- **Validação** (`Services/V1/Template/CompanyManagerColumn.php`, usado por
  `TempNav` e `TempMenu`): todo slug precisa existir em `company_manager`; quem
  não é superuser só pode listar a própria empresa; no create, sem a chave, vale
  a empresa da sessão; no update, lista vazia é recusada.
- **Fora das `temp_*`** a ligação continua por id: `company_id`, `company_members`
  e `user_manager.company_ids`.

## Pendências

- Entrar nas migrations REMAKE (tabelas, coluna, views, seeds) — exige autorização do usuário.
- Bloqueio de acesso a form/list também no backend. **Parcial (2026-10-12):** filtro `endpointaccess`
  (`Filters/EndpointAccessFilter.php` + `Config/EndpointAccess.php`) aplica perfil por rota/prefixo da API; piloto no módulo
  Messages (guest = 403, 401 sem perfil, admin sempre passa; rota sem regra = livre). Testado só a lógica isolada, sem token
  real. Falta: `user_resource_access` (permissão individual) ainda não é imposto no servidor — o mapeamento form/list → rota é
  ambíguo (3 listas dividem `user-manager-view/get-all` com `roles` diferentes; 2 listas sem endpoint).
- Empresa da sessão exibida no dropdown do usuário da Navbar (`user.company_slug`).
- ~~Escopo por empresa nos demais módulos e empresa ativa na sessão/JWT~~ — feito: ver [`README_multiempresa_isolamento.md`](README_multiempresa_isolamento.md).

---

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

## Acesso exclusivo do perfil superuser (2026-10-22)

- O modulo Empresa (`company-manager`, `company-members`, `company-memberships-view`, `company-users-companies-view`) e exclusivo do perfil `superuser`. Nem `admin` acessa.
- Backend: filtro `superuseronly` (`App\Filters\SuperuserOnlyFilter`) por wildcard em `Config/Filters.php`, depois de `jwtauth`. `company-manager-public` (select do cadastro de usuario) continua sem esse filtro.
- `superuser` esta acima de admin: `CurrentUser::isAdmin()` tambem retorna true para ele; `EndpointAccessFilter` e `UserResourceAccess` o liberam sempre.
- Invisivel em controle de perfil: `user_roles` (`SqlTableModel::scopedTable`) oculta o slug em toda leitura; criar/editar perfil com esse slug retorna 422; `user_role_id` do usuario nao aceita o perfil. A atribuicao a um usuario e feita direto no banco.
- Menu e telas: `temp_menu`, `list_manager` e `resource_access` do modulo carregam `["superuser"]`; rotas React usam `RequireRole role="superuser"`.
