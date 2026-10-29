[◄ Índice da base de conhecimento](../README.md)

---

# Multiempresa — login por slug, sessão amarrada e isolamento de dados (API V1)

> NÃO EXISTE ALTERAÇÃO de MIGRATE: apenas no fim de cada ciclo um novo, para a renovação de todo o sistema.

Cada empresa (`company_manager`) é um tenant. O endereço é **auto declarado**: o slug da empresa
vem na URL e decide em qual empresa a sessão nasce. Os dados são isolados por empresa na API.

## 1. Endereço e login

| Endereço                                  | Efeito                                                              |
| ----------------------------------------- | ------------------------------------------------------------------- |
| `/v1/login` e `/default/v1/login`         | entra na empresa DEFAULT (id 1)                                     |
| `/<slug-empresa>/v1/login`                | só entra quem tem o id da empresa em `user_manager.company_ids`      |
| `/<slug-empresa>/v1/...` (pós-login)      | rotas autenticadas; o slug tem de ser o da empresa da sessão         |

- Frontend: o slug lido da URL de carga entra no `basename` do router (`config/env.ts`). `POST auth/login`
  recebe `company_slug` (ausente = DEFAULT) e devolve `company_slug` com a empresa do login.
- **Falha de login sempre igual**: 401 `Usuário ou senha inválidos` para usuário inexistente, senha errada,
  usuário inativo/bloqueado, empresa inexistente ou sem acesso. O motivo real só vai para o log.
  Sem usuário, o servidor ainda gasta um bcrypt, para o tempo de resposta não denunciar o usuário.

## 2. Sessão amarrada a UMA empresa

- Os tokens (acesso e renovação) carregam a claim `cid` (id da empresa). `CurrentUser::companyId()` a expõe.
- `JwtAuthFilter` exige `cid` válido e confere a cada chamada se o usuário ainda tem a empresa em `company_ids`
  e se ela está ativa; senão a sessão cai (401). `auth/refresh` mantém a empresa e falha se o acesso foi perdido.
- Token sem `cid` (anterior à regra) exige novo login. Trocar de empresa = novo login.
- `JwtOptionalFilter` (`jwtoptional`): rota pública que reconhece a sessão quando existe (cadastro de usuário).

## 3. Isolamento de dados (`Models/V1/Concerns/CompanyScoped`)

Trait usada por `BaseTableModel` e `BaseViewModel`. O escopo entra em todas as consultas das classes base e
nos métodos nativos (`find`, `update`, `delete`, via `builder()`).

| `$companyScope` | Onde                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------- |
| `none` (padrão) | tabelas globais: `form_*`, `list_*`, `temp_menu`, `temp_nav`, `route_manager`, `user_roles`, `bootstrap_icons`, `aux_cor`, `map_icons`, `map_geocode_cache`, `map_postal_codes` |
| `column`        | 39 tabelas de conteúdo com `company_id` (calendar, chat, message, timeline, map, uploads) + `company_members` |
| `via_table`     | views dessas tabelas: `view.id IN (SELECT id FROM <tabela> WHERE company_id = <empresa>)` |
| `membership`    | `user_manager`, `user_profiles`, `user_resource_access` e views de usuário: só membros ativos da empresa |
| `self`          | `company_manager`, `view_company_manager`, `view_company_memberships`: só a empresa da sessão          |

- **Gravação**: o `company_id` vem sempre da sessão (callback `beforeInsert`); `beforeUpdate` o remove do payload.
  INSERT manual usa `withCompany()`; leitura manual de tabela irmã usa `companyTable()` / `companySql()`.
- **Integridade entre empresas**: `beforeInsert/Update` confere cada FK (lida do `information_schema`): o registro
  referenciado tem de ser da mesma empresa (ou, para `user_manager`, membro ativo dela). Violação → 422
  `Registro relacionado inválido` (`CompanyScopeException`), sem dizer se o registro existe em outra empresa.
- **Falha fechada**: sessão autenticada sem empresa válida → nenhuma linha. Só requisição **sem sessão** (rota pública
  por decisão de produto) fica sem escopo.
- `dispatchDue` (entrega de mensagens agendadas) roda sem escopo de propósito: rotina de sistema, de todas as empresas.
- `existsByField` (unicidade, ex.: `username`) continua global.
- Views com agregação por usuário ganharam `company_id` (`view_messages_users`, `view_message_users_groups`,
  `view_company_users_companies`): um registro por usuário e empresa.

## 4. Cadastro e aprovação por empresa

O acesso a uma empresa é o **vínculo** do usuário com ela (`company_members.status`): `pending` (aguardando
aprovação), `active`, `blocked` (bloqueado NA empresa), `left`, `removed`. O login e a sessão exigem vínculo
`active` na empresa do endereço (`AuthService::userCanAccessCompany`). `user_manager.status` continua sendo o da
conta (plataforma): `inactive` até a 1ª aprovação, `blocked` por bloqueio da plataforma/auto-bloqueio.

- **Cadastro público** (sem sessão): escolhe empresa(s) em `GET company-manager-public/get-no-pagination` (só `id` e
  `name`). Só a DEFAULT → conta `active` e vínculo `active`. Qualquer outra combinação → conta `inactive` e vínculos
  `pending` em cada empresa não-DEFAULT, a aprovar pelo admin **de cada empresa**.
- **Cadastro por admin logado**: só vincula à **própria** empresa (403 `company_ids fora da empresa da sessão`); sem
  `company_ids` nasce na empresa da sessão, já `active`/`active` (o admin atesta). No update, as demais empresas do
  usuário são preservadas.
- **Aprovar / bloquear / desbloquear**: `PUT user-manager/update/{id}` com `{status}` age sobre o vínculo do usuário
  **com a empresa da sessão** (`active` aprova ou desbloqueia, `blocked` bloqueia, `inactive` volta a `pending`); não
  altera as outras empresas. A 1ª aprovação ativa a conta (`inactive` → `active`). Admin não bloqueia a si mesmo (422).
  Qualquer admin da empresa pode aprovar (grupo de admins por empresa).
- Lista de usuários (`view_user_manager`): um registro por usuário e empresa (`company_id`, `cm_status`); botão
  **Aprovar usuário** (pending) / Bloquear (active) / Desbloquear (blocked); filtro por `cm_status`.

## 5. Migrations e testes

- `Database/_bkp/202610121800_add_company_id.sql` — `company_id` (FK, índice, sem DEFAULT) nas 39 tabelas;
  dados existentes = empresa 1.
- `Database/_bkp/202610121810_views_company.sql` e `202610121820_view_company_users_companies.sql` — views.
- `Database/_bkp/202610121900_company_members_pending.sql` — enum `pending`/`blocked` e `view_user_manager` por empresa.
- Testes de integração por API com duas empresas (usuários e dados descartáveis): em `src/writable/claude/testes/`.

## Pendências conhecidas

- `company-members/sync` aceita adicionar usuário existente por id (só admin da própria empresa).
- `uploads.reference_id` não é validado contra a empresa do registro referenciado (o arquivo em si é isolado).
- Unicidades globais (ex.: `slug` de timeline/mapa) valem entre empresas.
- Servidor WebSocket (Node) não acessa o banco; se passar a acessar, precisa respeitar a empresa.

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
