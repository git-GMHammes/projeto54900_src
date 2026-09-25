# Módulo `user-directory-view` — diretório mínimo de usuários

*Criado em 2026-09-25 — origem: campo "Usuário" do convite de evento
(`calendar_event_attendees`), ver [`calendar_event_attendees.md`](../calendar/calendar_event_attendees.md#alteração-2026-09-25--busca-remota-liberada-no-campo-usuário).*

## Por que existe

`api/v1/user-manager-view/*` e `api/v1/user-manager/*` são **admin-only**
(`Config/Filters.php`, filtro `adminonly`) porque expõem dados sensíveis de
**qualquer** usuário: status, role, telefone, whatsapp, CPF, endereço,
último login. Correto para telas administrativas — mas qualquer tela onde um
usuário comum precisa **escolher outro usuário** (ex.: convidar alguém num
evento de calendário) trombava com 403 Forbidden, porque não existia nenhum
endpoint de leitura de usuários liberado para não-admin.

`user-directory-view` resolve isso com uma **view SQL estreita** —
`view_user_directory` — que só tem 4 colunas:

```sql
CREATE VIEW view_user_directory AS
SELECT um.id AS id, um.username AS um_username, uc.name AS uc_name, uc.email AS uc_email
FROM user_manager um
LEFT JOIN user_profiles uc ON uc.user_manager_id = um.id AND uc.deleted_at IS NULL
WHERE um.deleted_at IS NULL;
```

Sem senha, status, role, telefone, CPF ou endereço — mesmo que alguém liste
**todos** os 10 endpoints de leitura deste grupo, o pior que sai é
id/username/nome/e-mail. Por isso o grupo `api/v1/user-directory-view/*` tem
só o filtro `jwtauth` (qualquer usuário logado), sem `adminonly`
(`Config/Filters.php` — comentário "EXCECAO DELIBERADA a adminonly").

## Estrutura (mirror do padrão `BaseResourceViewController`, 10 rotas)

| Camada     | Arquivo                                                                          |
| ---------- | --------------------------------------------------------------------------------- |
| View SQL   | `view_user_directory` (criada direto no banco dev, sem migration)                |
| Model      | `app/Models/V1/User/UserDirectory/SqlViewModel.php`                              |
| Processor  | `app/Services/V1/User/UserDirectory/Processor.php` (sem hooks — 100% genérico)   |
| Controller | `app/Controllers/Api/V1/User/UserDirectory/ResourceViewController.php`           |
| Rotas      | `app/Config/Routes/Api/v1/User/UserDirectory/EndPointView.php`, grupo registrado em `app/Config/Routes.php` |
| Filtro     | `app/Config/Filters.php` — `jwtauth` (wildcard `api/v1/user-directory-view/*`), **nunca** `adminonly` |

Rotas: `find` (POST), `get-grouped` (POST), `search` (GET), `get/{id}` (GET),
`get-all` (GET), `get-no-pagination` (GET), `get-deleted/{id}`,
`get-all-with-deleted`, `get-deleted-all` — mesmo contrato de 10 rotas de
qualquer view somente leitura do projeto (`ROADMAP_padrao_modulo.md`).

`likeFields`/`searchFields`/`sortableFields` do model: `um_username`,
`uc_name`, `uc_email`. `filterFields` vazio (sem coluna de status/role para
filtrar).

## Consumidor atual

Campo "Usuário" do form `cadastro-convidado` (`form_fields.id = 213`,
`select_config_json`):
- `src`: `GET /api/v1/user-directory-view/get-no-pagination?sort=um_username&order=ASC&limit=1000`
- `findSrc`: `POST /api/v1/user-directory-view/find`, `findColumn`: `um_username`

## Regra para novos usos

Qualquer tela nova que precise de um picker de usuário para não-admin deve
apontar para `user-directory-view`, **nunca** para `user-manager-view` ou
`user-manager`. Se precisar de mais um campo não sensível (ex.: um futuro
avatar/uuid), estender a VIEW e o Model — nunca trocar a fonte para a view
completa nem remover o `adminonly` de `user-manager-view`.

---
Índice: [`src/app/markdown/README.md`](../../../README.md)
