[◄ Índice da base de conhecimento](../README.md)

---

# Índice — árvores de formulário (`form/`)

Todo `form_manager` deste banco nasce assim: markdown revisado aqui primeiro,
depois vira `INSERT` (nunca migration, nunca seed — motivo e histórico
completo em [`README_modulo_form.md`](README_modulo_form.md)). Esta página
lista, por pasta, os 17 formulários já desenhados — os 17 já com `INSERT`
executado no banco.

## `form/modelo_ia/` — meta-formulários (dogfooding)

| Arquivo                             | slug               | `table_name`                                               |
| ----------------------------------- | ------------------ | ---------------------------------------------------------- |
| [`form.md`](form/modelo_ia/form.md) | `form-constructor` | `form_manager` (+ `form_groups`/`form_rows`/`form_fields`) |
| [`list.md`](form/modelo_ia/list.md) | `list-constructor` | `list_manager` (+ `list_columns`/`list_actions`)           |

## `form/user/` — autenticação e cadastro de usuário

| Arquivo                                                        | slug                         | `table_name`    |
| -------------------------------------------------------------- | ---------------------------- | --------------- |
| [`login_user.md`](form/user/login_user.md)                     | `usuario-autenticacao`       | `user_manager`  |
| [`create_user_manager.md`](form/user/create_user_manager.md)   | `cadastro-usuario` (etapa 1) | `user_manager`  |
| [`create_user_profiles.md`](form/user/create_user_profiles.md) | `dados-do-usuario` (etapa 2) | `user_profiles` |

Etapas 1 e 2 se ligam por `user_manager_id` — ver "A chave que liga as duas
etapas" em `create_user_profiles.md`.

## `form/roules/` — perfis de acesso

| Arquivo                                      | slug            | `table_name` |
| -------------------------------------------- | --------------- | ------------ |
| [`user_roles.md`](form/roules/user_roles.md) | `cadastro-role` | `user_roles` |

`user_roles` era um módulo **read-only** (sem `create`/`update`/`delete`) até
2026-09-20 — completado ao padrão canônico (18 rotas) nesta sessão. Ver
aviso no topo do doc.

## `form/nav/` e `form/menu/` — navegação

| Arquivo                                             | slug            | `table_name`   |
| --------------------------------------------------- | --------------- | -------------- |
| [`nav/nav_manager.md`](form/nav/nav_manager.md)     | `cadastro-nav`  | `nav_manager`  |
| [`menu/menu_manager.md`](form/menu/menu_manager.md) | `cadastro-menu` | `menu_manager` |

`menu_manager` tem FK pra `nav_manager` (`nav_manager_id`) e auto-relação
(`parent_id`, submenu) — ver [`README_menu.md`](../../../frontend/projeto54900/src/markdown/geral/README_menu.md)
pra convenção de faixas de `sort_order`.

## `form/upload/` — metadados de upload

| Arquivo                                | slug               | `table_name` |
| -------------------------------------- | ------------------ | ------------ |
| [`uploads.md`](form/upload/uploads.md) | `atualizar-upload` | `uploads`    |

Só metadados (`title`/`description`/`category`/`status`) — `uploads` não
cabe num formulário de criação (sem `field_type` de arquivo; ver aviso no
doc).

## `form/route/` — catálogo de rotas

| Arquivo                                           | slug             | `table_name`    |
| ------------------------------------------------- | ---------------- | --------------- |
| [`route_manager.md`](form/route/route_manager.md) | `cadastro-route` | `route_manager` |

Cadastro manual — complementa a introspecção automática de
`Config/Routes.php` (355 linhas já existentes, geradas em bloco).

## `form/calendar/` — módulo Calendar completo

| Arquivo                                                                                        | slug                          | `table_name`                         |
| ---------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------ |
| [`calendar_manager.md`](form/calendar/calendar_manager.md)                                     | `calendario`                  | `calendar_manager`                   |
| [`calendar_manager_editar.md`](form/calendar/calendar_manager_editar.md)                       | `editar-calendario`           | `calendar_manager`                   |
| [`calendar_events.md`](form/calendar/calendar_events.md)                                       | `cadastro-evento`             | `calendar_events`                    |
| [`calendar_event_attendees.md`](form/calendar/calendar_event_attendees.md)                     | `cadastro-convidado`          | `calendar_event_attendees`           |
| [`calendar_event_reminders.md`](form/calendar/calendar_event_reminders.md)                     | `cadastro-lembrete`           | `calendar_event_reminders`           |
| [`calendar_event_attachments.md`](form/calendar/calendar_event_attachments.md)                 | `cadastro-anexo-evento`       | `calendar_event_attachments`         |
| [`calendar_event_extended_properties.md`](form/calendar/calendar_event_extended_properties.md) | `cadastro-propriedade-evento` | `calendar_event_extended_properties` |

A tabela órfã `calendars` (sem código associado; a FK de
`calendar_events.calendar_id` apontava errado pra ela) foi corrigida e
removida do banco antes deste `INSERT` — ver nota em
`README_modulo_form.md`.

## Próximo formulário

Ao desenhar um novo, seguir o mesmo molde: árvore em markdown (hierarquia
pura, detalhe só nas tabelas — ver qualquer arquivo acima como referência),
aprovação, depois `INSERT` em `doc/sql/insert/`. Acrescentar a linha aqui
**e** no aviso do topo de `README_modulo_form.md` — os dois índices devem
ficar em sincronia.

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
