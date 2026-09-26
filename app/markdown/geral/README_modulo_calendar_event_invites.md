[◄ Índice da base de conhecimento](../README.md)

---

# Módulo Calendar / CalendarEventInvites (API V1)

Convite de evento por e-mail com **token temporário de uso único**. Dois
modos:

- **Modo A** — convidado **já cadastrado**: organizador informa
  `user_manager_id` (ou um `email` que já bate com um `user_profiles.email`
  existente — resolvido automaticamente para o mesmo caminho).
- **Modo B** — convidado **sem conta**: organizador informa só `email`; o
  `accept-token` executa um **auto-cadastro** na hora (ver §3.1) antes de
  adicionar o convidado.

Diferente da premissa original de [`calendar_event_attendees.md`](form/calendar/calendar_event_attendees.md)
("sem convidado externo"), este módulo é o ponto de entrada para trazer
alguém de fora para dentro do sistema.

Espelha o módulo `User/UserManager` e segue o
[`ROADMAP_padrao_modulo.md`](ROADMAP_padrao_modulo.md), com um desvio
sancionado (ver a última seção).

## 1. Identidade

| Item | Valor |
| --- | --- |
| Domínio / Módulo | `Calendar` / `CalendarEventInvites` |
| Namespace | `App\...\V1\Calendar\CalendarEventInvites` |
| Slug de tabela | `calendar-event-invites` → `api/v1/calendar-event-invites/...` |
| Tabela | `calendar_event_invites` (banco `codeigniter54900_db`, grupo `DB_GROUP_001`) |
| View | nenhuma |

## 2. Tabela `calendar_event_invites`

> **Criada/alterada direto no banco DEV (2026-09-26), sem migration
> versionada** — decisão do usuário, ver a regra "nenhuma migration nova sem
> autorização" em [`README_migrate.md`](README_migrate.md). O DDL abaixo é o
> contrato real (confirmado via `SHOW CREATE TABLE`, incluindo o `ALTER
> TABLE` do Modo B); se um REMAKE for gerado no futuro, replicar exatamente
> estas colunas/índices/FKs.

| Coluna | Tipo | Papel |
| --- | --- | --- |
| `id` | BIGINT PK auto | |
| `calendar_event_id` | BIGINT NOT NULL, FK → `calendar_events.id` CASCADE | evento do convite |
| `user_manager_id` | BIGINT **NULL**, FK → `user_manager.id` CASCADE | o convidado — **NULL** enquanto for só um e-mail sem conta (Modo B); preenchido no `accept-token` (usuário já existente ou recém-criado pelo auto-cadastro) |
| `email` | VARCHAR(255) NOT NULL | sempre preenchido — do perfil (Modo A) ou do valor cru do organizador (Modo B) |
| `created_by` | BIGINT NULL, FK → `user_manager.id` SET NULL | organizador que enviou o convite (`CurrentUser::id()`) |
| `token_hash` | VARCHAR(64) NOT NULL UNIQUE | SHA-256 do token cru — **nunca** o valor em si (mesmo padrão de `JwtService::hashToken`). `$hidden` no Model |
| `expires_at` | DATETIME NOT NULL | emissão + 72h |
| `used_at` | DATETIME NULL | preenchido no 1º uso — token de uso único ("resetado" = invalidado, não pode ser reaproveitado) |
| `created_at` / `updated_at` / `deleted_at` | DATETIME | padrão (soft delete) |

Índices: `UNIQUE(token_hash)`, `KEY(calendar_event_id)`, `KEY(user_manager_id)`,
`KEY(created_by)`.

## 3. Fluxo

1. **Organizador convida** (autenticado, `jwtauth`): `POST create` com
   `{ calendar_event_id, user_manager_id }` (Modo A) **ou**
   `{ calendar_event_id, email }` (Modo A resolvido automaticamente se o
   e-mail já existir em `user_profiles`, senão Modo B).
   - `Processor::validateOnCreate` confere FK de `calendar_event_id`. Modo A:
     bloqueia (409) se o usuário já é `attendee` do evento
     (`CalendarEventAttendees::existsByUserInEvent`). Modo B: bloqueia (409)
     se já existe um `attendee` com esse e-mail cru
     (`CalendarEventAttendees::existsByEmailInEvent`).
   - `Processor::create`: Modo A busca o perfil (`user_profiles`) do
     convidado — sem e-mail/nome cadastrado, 422. Modo B: se o e-mail já
     pertence a um usuário (`user_profiles.email` é `UNIQUE`), resolve para o
     Modo A na hora (evita tentar recriar a conta depois); senão segue sem
     `user_manager_id`. Invalida qualquer convite pendente anterior do mesmo
     par (evento + usuário **ou** evento + e-mail) — reenviar substitui o
     link antigo. Gera `token = bin2hex(random_bytes(32))`, grava só
     `token_hash = sha256(token)`, `expires_at = agora + 72h`, e envia o
     **e-mail 1** (`Libraries/Mail/MailerService`, conta `MAIL_NOREPLY_*`)
     com o link `{APP_FRONTEND_URL}/v1/convite/aceitar?token={token cru}`.
2. **Convidado clica no link** (sem sessão): a página do frontend
   (`/v1/convite/aceitar`) lê `?token=` e chama `POST accept-token` — **única
   rota pública** do módulo.
   - `Processor::acceptToken` calcula o hash, busca convite com
     `used_at IS NULL AND expires_at > agora`; não achar = 404.
   - **Se `user_manager_id` do convite ainda for `NULL` (Modo B)**: executa o
     auto-cadastro — ver §3.1 — e envia o **e-mail 2** (credenciais).
   - Chama **`CalendarEventAttendees\Processor::create()`** — o mesmo método
     que já adiciona convidados hoje internamente — com
     `calendar_event_id`/`user_manager_id` (já resolvido, existente ou
     recém-criado). 409 (já é attendee) é tratado como sucesso idempotente.
   - Marca `used_at` (reset/invalidação de uso único) e responde sucesso com
     `calendar_event_id` e `account_created` (`true` só quando o Modo B
     acabou de criar a conta agora).
3. **Aceitar/recusar segue o fluxo já existente**, exigindo login normal:
   `PUT /calendar-event-attendees/respond/{calendar_event_id}` — o token não
   cria sessão, só autoriza a entrada na lista de convidados.
   `AceitarConvitePage.tsx` usa `account_created` pra trocar a mensagem: se
   `true`, orienta o convidado a **conferir o e-mail 2 (usuário/senha) antes
   de ir para o login**, em vez do texto genérico "Convite aceito, faça login".

### 3.1 Auto-cadastro (Modo B, dentro do `accept-token`)

Reaproveita os `Processor::create()` **já existentes** — nenhuma lógica de
cadastro duplicada:

1. `username` = `password` (antes do hash) = **parte local do e-mail**
   (antes do `@`, só `[a-z0-9._-]`, minúsculo; fallback `guest` se vazio) —
   `Processor::emailLocalPart()` / `uniqueUsernameFrom()`. Colisão de
   username recebe sufixo numérico (`joao`, `joao1`, `joao2`, ...); a senha
   **nunca** leva sufixo.
2. `UserManager\Processor::create(['username' => ..., 'password_hash' =>
   <senha crua>, 'user_role_id' => Processor::GUEST_ROLE_ID])` — o próprio
   Processor já faz `password_hash(..., PASSWORD_BCRYPT)` e nunca seta
   `status` no create, que fica no `DEFAULT` do banco (`active`).
   `user_role_id` é **fixo em `3` (slug `guest`, `user_roles.id=3`)** —
   nunca o default genérico de um cadastro manual (`2`, papel `user`).
3. `UserProfiles\Processor::create(['user_manager_id' => <novo id>, 'email'
   => <email do convite>, 'name' => 'Guest'])`.
4. `calendar_event_invites.user_manager_id` é atualizado com o novo id (link
   de volta, útil para auditoria/idempotência).
5. **E-mail 2** — usuário, senha (texto puro, uma única vez) e link de login
   (`{APP_FRONTEND_URL}/v1/login`). Recomenda trocar a senha depois
   (`/v1/account/security`, já existente) — **não é forçado** automaticamente.

**Risco assumido de propósito**: a senha inicial é previsível a partir do
próprio e-mail do convidado (mesma regra do username) — decisão explícita do
usuário para simplificar o auto-cadastro, não uma falha de implementação.

## 4. Rotas — `api/v1/calendar-event-invites/...` (18 canônicas + 1 específica)

As 18 são idênticas ao §5.1 do ROADMAP, todas com `['filter' => 'jwtauth']`
(rota a rota, mesmo padrão de `user-manager/EndpointTable.php`, não por
wildcard em `Config/Filters.php`).

Específica do módulo:

| Verbo | Caminho | Método | Autenticação | Uso |
| --- | --- | --- | --- | --- |
| POST | `accept-token` | `acceptToken` | **pública** | Body `{ "token": "..." }`. Consome o token e adiciona o convidado. |

## 5. Camadas / arquivos

```
Libraries/Mail/MailerService.php                    sendHtml() sobre Config\Services::email()
Config/Email.php                                    lê MAIL_SMTP_*/MAIL_NOREPLY_* do ambiente (via env())
Config/Routes.php                                   + grupo calendar-event-invites
Config/Routes/Api/v1/Calendar/CalendarEventInvites/
  EndpointTable.php (18 + accept-token)
Controllers/Api/V1/Calendar/CalendarEventInvites/
  ResourceTableController.php   (processor + rules + acceptToken)
Requests/V1/Calendar/CalendarEventInvites/
  CreateRequest.php   UpdateRequest.php
Services/V1/Calendar/CalendarEventInvites/
  Processor.php        extends BaseTableService (create()/acceptToken()/hooks)
Models/V1/Calendar/CalendarEventInvites/
  SqlTableModel.php
Database/Migrations/
  (nenhuma — tabela criada direto no banco DEV, ver §2)
```

Nenhuma classe `Base*` foi alterada.

## 6. Variáveis de ambiente (`docker-compose.yml`, serviço `php`)

| Chave | Papel |
| --- | --- |
| `MAIL_SMTP_HOST` / `MAIL_SMTP_PORT` | host/porta SMTP (KingHost) |
| `MAIL_NOREPLY_USER` / `MAIL_NOREPLY_PASS` | conta remetente do convite |
| `APP_FRONTEND_URL` | base pública do frontend para montar o link do e-mail — **placeholder de dev** (`http://localhost:54900`); trocar pelo domínio real no deploy |

## 7. Desvio sancionado do padrão

**1 rota além das 18 canônicas** (`accept-token`), **pública** (sem
`jwtauth`). O padrão do ROADMAP não cobre autenticação por token de uso único
vindo de e-mail — mesmo tipo de desvio já registrado para `upload-manager`
(3 rotas extras) e para o `respond` de `calendar-event-attendees` (1 rota
extra, autenticada). Diferença aqui: a rota extra é a única pública do
módulo — todas as demais continuam exigindo `jwtauth`.

## 8. Pendências / fora do escopo

- Não há tela no frontend para o organizador **disparar** o convite (botão);
  hoje só a API (`POST create`) expõe a ação. Também não há campo de e-mail
  livre na UI — o `email` do Modo B só existe hoje via chamada direta à API.
- Envio real de e-mail não foi testado neste ambiente (sem SMTP acessível na
  máquina de desenvolvimento) — validado só por revisão de código, lint e
  smoke test direto no banco (sem o envio em si).
- Sem expiração/forçar-troca da senha inicial do auto-cadastro (Modo B) — o
  convidado pode continuar usando a senha previsível indefinidamente se não
  trocar por conta própria.

---

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo | Informação |
| --- | --- |
| **Nome** | Gustavo Hammes |
| **Local** | Rio de Janeiro |
| **LinkedIn** | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes) |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
