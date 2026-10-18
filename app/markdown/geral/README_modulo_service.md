[◄ Índice da base de conhecimento](../README.md)

---

# Módulo Service — serviço de qualquer tipo

De uma troca de chuveiro e um passeio com cão a enfermagem, alvenaria e construção civil. Catálogo de grupos e
campos: [`doc/json/servico.json`](../../../../doc/json/servico.json). Módulo **independente**: sem ligação com Produto,
Location ou Movement (ligações só sob pedido). Ver [`README_modulos_independentes.md`](README_modulos_independentes.md).
Fluxo inspirado em marketplace de serviços: pedido, orçamento, agendamento, execução e avaliação.

## 1. Banco (`codeigniter54900_db`, conexão `default`)

SQL: `Database/Migrations/202610181700_service_tables.sql` (reaplicável; sem triggers).

| Objeto | Papel |
| ------ | ----- |
| `service_manager` | Catálogo: `company_id`, `roles`, `parent_id` (pacote/obra/etapa), `code` (`UNIQUE (company_id, code)`), `name`, `type`, `provider_type` (`biscate` autônomo informal, `mei`, `company` CNPJ), `provider_document`, `billing_unit`, `price`, `currency`, `duration`/`duration_unit`, `lead_time`/`lead_time_unit` (unidades `min`, `h`, `d`, `wk`, `mo`), `status`. |
| `service_attributes` | Uma linha por característica: `service_id`, `group_code`, `field_code`, `label`, `value`, `unit`. Campo novo entra no catálogo JSON. |
| `service_order` | Pedido/orçamento/execução: `service_id`, `parent_id` (etapas), `code`, `status`, cliente (texto livre e `customer_user_id` opcional), `executor_user_id`, `created_by`, `place`, `quantity`, `quoted_price`, `final_price`, datas (`requested_at`, `scheduled_at`, `started_at`, `finished_at`, `deadline_at`, `paid_at`), `rating` (1 a 5), `feedback`, `cancel_reason`. |
| `view_service_manager` | Serviço com pai, `children_count`, `attributes_count`, `open_orders_count`. |
| `view_service_attributes` | Atributo com `service_code`, `service_name`, `service_type`. |
| `view_service_order` | Pedido com serviço, executor, cliente, `days_to_deadline`, `is_late`, `duration_minutes`. |
| `view_service_summary` | Por serviço: pedidos (total, abertos, concluídos, cancelados, atrasados), `revenue`, `revenue_paid`, `avg_rating`, `avg_duration_minutes`. |

## 2. Rotas (jwtauth por wildcard; `adminonly` na exclusão definitiva)

Contrato canônico do [`ROADMAP_padrao_modulo.md`](ROADMAP_padrao_modulo.md): 90 rotas.

| Grupo | Rotas |
| ----- | ----- |
| `api/v1/service-manager` | 18 (tabela) |
| `api/v1/service-manager-view` | 9 (view) |
| `api/v1/service-attributes` | 18 (tabela) |
| `api/v1/service-attributes-view` | 9 (view) |
| `api/v1/service-order` | 18 (tabela) |
| `api/v1/service-order-view` | 9 (view) |
| `api/v1/service-summary-view` | 9 (resumo, só leitura) |

## 3. Fluxo do pedido (`status`)

`requested` → `quoted` → `accepted` → `scheduled` → `in_progress` → `done`; `cancelled` de qualquer estado aberto;
`rejected` (orçamento recusado) a partir de `quoted`. `quoted` pode ser repetido (novo orçamento) e `scheduled` também (reagendar).

## 4. Regras de negócio (Processor)

| Regra | Resposta |
| ----- | -------- |
| Guest não escreve | 403 |
| Serviço, pedido pai, executor ou cliente de outra empresa | 422 |
| Pedido nasce `requested`; `created_by` e `requested_at` vêm da sessão/servidor; status, andamento, nota e valor final não se impõem no create | — |
| `billing_unit` e `currency` herdam do serviço quando omitidos | — |
| `code` repetido na empresa (inclusive excluídos) | 409 |
| Serviço pai de si mesmo | 422 |
| Ciclo de serviço pai | 409 |
| Transição fora do fluxo | 409 |
| `quoted` sem `quoted_price`; `scheduled` sem `scheduled_at`; `done` sem preço; `cancelled`/`rejected` sem `cancel_reason` | 422 |
| `in_progress` grava `started_at`; `done` grava `finished_at` e `final_price` (= `quoted_price` se omitido) | — |
| Pedido `done` só aceita `rating`, `feedback`, `paid_at`, `notes` | 409 nos demais |
| `cancelled`/`rejected` não mudam | 409 |
| `rating` e `paid_at` só em pedido `done` | 422 |
| Serviço, pedido pai, `code`, `created_by`, `requested_at` imutáveis no update | ignorados |
| Excluir pedido `done`: só admin; pedido com etapas: 409; serviço com filhos: 409 | 403 / 409 |
| `clear-deleted` | só admin |

Isolamento por empresa: tabelas em `column`, views em `via_table`; chaves para outra empresa (serviço, pai, usuários) o
model recusa (`CompanyScoped`).

## 5. Estado e pendências

- Pronto: banco, 90 rotas e teste ponta a ponta (`src/writable/claude/testes/test_service.sh`, 71 verificações, duas empresas).
- Pendente: frontend; validação de `group_code`/`field_code` contra o catálogo; cadastro de clientes (hoje texto livre); financeiro (hoje só `paid_at`).
- Sem tabela de avaliações: a nota fica no pedido.

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
