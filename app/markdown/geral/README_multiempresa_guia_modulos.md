[◄ Índice da base de conhecimento](../README.md)

---

# Multiempresa — guia de módulos e de ponta a ponta (API V1)

Complementa [`README_multiempresa_isolamento.md`](README_multiempresa_isolamento.md) (regras) e
[`README_modulo_companies.md`](README_modulo_companies.md) (cadastro de empresas e membros). Este guia mostra o
**fluxo completo**, **qual modo de escopo cada módulo usa** e o **passo a passo para um módulo novo entrar no isolamento**.
Rota correspondente no frontend: `/<slug-empresa>/v1/...` (ver `README_rota_empresa_slug.md` do frontend).

## 1. Fluxo de ponta a ponta

1. O usuário abre `/<slug>/v1/login` (sem slug = empresa DEFAULT, id 1). O frontend envia `company_slug` em `POST auth/login`.
2. `AuthService::login` resolve o slug para o id da empresa e confere o acesso: vínculo `active` em `company_members`
   **e** empresa `active` e não excluída (`userCanAccessCompany`). Qualquer falha devolve o mesmo 401 genérico.
3. Os tokens de acesso e de renovação nascem com a claim `cid` (id da empresa). O payload devolve `company_slug` e
   `user.companies` (`[{id, name, slug}]`).
4. `JwtAuthFilter` grava as claims em `CurrentUser` e, a cada chamada, reconfere o acesso à empresa do `cid`.
   Perdeu o vínculo, ou a empresa foi inativada: 401 e a sessão cai.
5. Os models usam `CurrentUser::companyId()` para filtrar leituras e carimbar gravações. O cliente nunca informa `company_id`.
6. `auth/refresh` mantém a empresa do token. Token sem `cid` exige novo login. Trocar de empresa = novo login.

## 2. Mapa dos módulos por modo de escopo

Convenção: a tabela física usa `column`; a view da tabela usa `via_table` (`view.id IN (SELECT id FROM <tabela> WHERE company_id = <cid>)`).

| Módulo (`Models/V1/...`) | Tabelas (`column`) | Views / exceções |
| ------------------------ | ------------------ | ---------------- |
| `Calendar` | CalendarManager, CalendarEvents, EventAttachments, EventAttendees, EventExtendedProperties, EventInvites, EventReminders | view do CalendarManager em `via_table` |
| `ChatRooms` | ChatRoomsManager, ChatMessages, ChatMessageEdits, ChatMessageMentions, ChatRoomMembers, ChatRoomFavorites, ChatRoomAttachments, ChatRoomAttachmentReports, ChatRoomWarnings | views em `via_table` |
| `Messages` | MessagesManager, MessageGroupsManager, MessageGroupMembers, MessageGroupMessages, MessageGroupReads, MessageAttachments, MessageMentions, MessageWarnings | views em `via_table`; `MessagesUsers` e `MessageUsersGroups` têm `company_id` próprio (`column`); `MessageContacts` em `membership`; `MessageGroupChat` e `MessageGroupMemberships` em `via_table` |
| `Timeline` | TimelineManager, Posts, PostAttachments, PostComments, PostRatings, PostReactions, PostReports | views em `via_table` |
| `Map` | MapManager, MapPoints, MapRoutes, MapRouteStops, MapLinks, MapAddresses, MapCategories | views em `via_table` |
| `Upload` | UploadManager | arquivo isolado; `reference_id` não é validado (ver pendências) |
| `User` | `user_manager`, `user_profiles`, `user_resource_access` | `membership`: só membros da empresa da sessão |
| `Company` | CompanyMembers (`column`) | `Companies` e `CompanyMemberships` em `self`; `CompanyUsersCompanies` em `column` |
| Globais (`none`) | `form_*`, `list_*`, `menu_manager`, `nav_manager`, `route_manager`, `user_roles`, `bootstrap_icons`, `aux_cor`, `map_icons`, `map_geocode_cache`, `map_postal_codes` | definição de telas é compartilhada entre empresas |

Fonte da verdade do mapa: `grep -rn "companyScope = " app/Models/V1`.

## 3. Como incluir um módulo novo no isolamento

1. **Migration:** `company_id BIGINT NOT NULL` na tabela, com FK para `company_manager(id)`, índice e **sem DEFAULT**. Dados existentes = empresa 1
   (modelo: `Database/_bkp/202610121800_add_company_id.sql`).
2. **Model da tabela** (`SqlTableModel`): `protected string $companyScope = 'column';`. O `BaseTableModel` já usa o trait `CompanyScoped`.
   O `beforeInsert` carimba a empresa da sessão e confere as FKs; o `beforeUpdate` remove `company_id` do payload.
3. **Model da view** (`SqlViewModel`): `$companyScope = 'via_table'`, `$companyViaTable` e, se a PK da view não for `id`, `$companyViaKey`.
   Se a view agrega por usuário (um registro por usuário e empresa), exponha `company_id` na própria view e use `column`.
4. **Consultas escritas a mão:** leia tabelas irmãs com `companyTable('tabela alias')` ou `companySql('alias')`; INSERT manual com `withCompany($row)`.
   Nenhuma consulta pode escapar do escopo só por não passar por `$this->table`.
5. **Tabelas de usuário:** `membership` (`$membershipKey`, `$membershipStatuses`). Admin de usuários inclui `pending` e `blocked`.
6. **Rotina de sistema sem sessão** (ex.: `dispatchDue`): use `withoutCompanyScope(fn)` com autorização já garantida por quem chama.
7. **Teste:** copie um script de `src/writable/claude/testes/` (`test_company_scope.sh`, `test_modules_scope.sh`) com duas empresas e dados descartáveis.

## 4. Respostas de erro

| Situação | Resposta |
| -------- | -------- |
| Login: usuário/senha/empresa/vínculo inválidos | 401 `Usuário ou senha inválidos` (sempre igual) |
| Token sem `cid`, vínculo perdido ou empresa inativa | 401, sessão cai |
| Admin cadastra usuário com `company_ids` de outra empresa | 403 `company_ids fora da empresa da sessão` |
| FK apontando para registro de outra empresa | 422 `Registro relacionado inválido` (`CompanyScopeException`) |
| Gravação com sessão sem empresa válida | recusada (`CompanyScopeException`) |
| Consulta com sessão sem empresa válida | nenhuma linha (falha fechada) |

## 5. Rotas públicas

Sem sessão não há escopo. Existem por decisão de produto: `GET company-manager-public/get-no-pagination` (só `id` e `name`)
e o cadastro de usuário (`jwtoptional`: reconhece a sessão quando existe). Rotas protegidas sempre têm `cid`.

## 6. Pendências

As mesmas de [`README_multiempresa_isolamento.md`](README_multiempresa_isolamento.md#pendências-conhecidas): `uploads.reference_id`
sem validação de empresa, unicidades globais (`slug` de timeline/mapa), `existsByField` global e WebSocket Node sem escopo.

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
