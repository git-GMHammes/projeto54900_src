[◄ Índice da base de conhecimento](../README.md)

---

# Módulo Audit Logs — log de auditoria e acesso

> NÃO EXISTE ALTERAÇÃO de MIGRATE: apenas no fim de cada ciclo um novo, para a renovação de todo o sistema.

Registra, por usuário, o que foi chamado na API e os eventos de sessão. Uma única tabela: `audit_logs`.

> **Estado atual (2026-10-22): somente DEV local.** A tabela foi criada direto no banco
> `codeigniter54900_db` (Podman). **Não existe migration** para ela — por regra do
> `README_migrate.md`, nenhuma migration nova sem autorização. Antes de qualquer REMAKE ou deploy na
> KingHost, a tabela precisa entrar nos snapshots (ver "Pendências").

## O que é gravado

| Campo | Conteúdo |
| --- | --- |
| `event_type` | `request`, `login_ok`, `login_fail`, `token_refresh`, `logout`, `session_expired`, `access_denied`, `block` |
| `user_id`, `login`, `full_name`, `profile`, `company_id`, `company_name` | cópia do usuário NO MOMENTO do evento |
| `http_method`, `uri`, `query_raw` | método, rota e querystring bruta (busca) |
| `action`, `resource`, `resource_id` | `search`/`read`/`create`/`update`/`delete`/`restore`, recurso da rota e ID afetado |
| `payload_raw` | corpo bruto de POST/PUT/PATCH/DELETE (JSON; multipart grava campos e metadados dos arquivos) |
| `response_id` | ID criado, lido da resposta da API (`data.id`) |
| `status_code`, `details` | status HTTP e motivo (falhas, bloqueios, expirações) |
| `ip_origin`, `ip_destination`, `user_agent`, `session_id` | `REMOTE_ADDR` (PHP), `SERVER_ADDR`, navegador e 12 primeiros caracteres do sid |

Valores de `password`, `current_password`, `new_password`, `token`, `access_token`, `refresh_token`
e semelhantes (`Config/AuditLog.php::$maskKeys`) saem como `"***"`. O restante é RAW completo.

## Onde está o código

- Tabela: `audit_logs` (DDL no banco DEV; sem arquivo em `Database/Migrations/`).
- Config: `app/Config/AuditLog.php` (liga/desliga, limite de payload, rotas excluídas, chaves mascaradas).
- Gravação e consulta: `app/Services/V1/Audit/AuditLogService.php`.
- Linha `request` de todo `api/v1/*`: `app/Filters/AuditFilter.php` (só `after`, alias `auditlog` em `Config/Filters.php`).
- Eventos de sessão: `AuthController` (login, falha, refresh, logout, bloqueio) e os filtros `JwtAuthFilter`
  (sessão expirada / sem token), `AdminOnlyFilter` e `EndpointAccessFilter` (acesso negado).
- Consulta: `app/Controllers/Api/V1/Audit/AuditLogController.php`, rotas em
  `Config/Routes/Api/v1/Audit/EndpointAuditLogs.php`, somente admin (`jwtauth` + `adminonly` por wildcard).

Evento explícito suprime a linha `request` da mesma requisição (sem duplicar). Falha ao gravar nunca
derruba a requisição: vai só para o log de arquivo (`[audit]`).

## Consulta (admin)

```
POST /api/v1/audit-logs/find?page=1&limit=20&sort=id&order=desc
{ "user_id": 27, "event_type": "login_fail", "date_from": "2026-10-22 00:00:00", "q": "timeline" }

GET  /api/v1/audit-logs/show/{id}
```

Filtros: `user_id`, `company_id`, `login`, `event_type`, `action`, `resource`, `resource_id`, `ip_origin`,
`http_method`, `status_code`, `session_id`, `date_from`, `date_to`, `q`.

## Pendências (fora do DEV local)

- Tela React de consulta.
- Entrar nos snapshots de Migrations (REMAKE) quando o usuário decidir; o DDL não usa coluna `json` nem
  `DEFAULT (expr)`, então é compatível com o MySQL 5.7.
- Produção KingHost (sem cron/spark): retenção/limpeza por gatilho em requisição; definir prazo.
- Volume: GET também é auditado; avaliar `excludePaths` para rotas de polling do módulo Messages.

---

[◄ Índice da base de conhecimento](../README.md)
