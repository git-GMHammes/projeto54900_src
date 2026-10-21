[◄ Índice da base de conhecimento](../README.md)

---

# Módulo Product — produto de qualquer escala

Cadastra desde um comprimido até uma aeronave com **2 tabelas** e hierarquia de **2 níveis** (grupo -> campo).
Catálogo de grupos e campos: [`doc/json/produto.json`](../../../../doc/json/produto.json). Módulo **independente**:
`location_id` e `parent_id` são opcionais (`NULL` = sem ligação). Ver [`README_modulos_independentes.md`](README_modulos_independentes.md).

## 1. Banco (`codeigniter54900_db`, conexão `default`)

SQL: `Database/Migrations/202610181400_product_tables.sql` (reaplicável; sem triggers).

| Objeto | Papel |
| ------ | ----- |
| `product_manager` | Produto: `company_id`, `roles` (json), `parent_id` (kit/conjunto), `location_id` (opcional, FK para `location_manager`), `code` (`UNIQUE (company_id, code)`), `name`, `description`, `type`, `status`, `stock_min`, `stock_max`, `sort_order`, `deleted_at`. |
| `product_attributes` | Uma linha por característica: `product_id`, `group_code`, `field_code`, `label`, `value`, `unit`, `sort_order`. Campo novo entra no catálogo JSON, sem mudar o banco. |
| `view_product_manager` | Produto com pai, local (caminho completo), `children_count` e `attributes_count`. |
| `view_product_attributes` | Atributo com `product_code`, `product_name` e `product_type`. |

## 2. Rotas (jwtauth por wildcard; `adminonly` na exclusão definitiva)

Contrato canônico do [`ROADMAP_padrao_modulo.md`](ROADMAP_padrao_modulo.md): 54 rotas.

| Grupo | Rotas |
| ----- | ----- |
| `api/v1/product-manager` | 18 (tabela) |
| `api/v1/product-manager-view` | 9 (view) |
| `api/v1/product-attributes` | 18 (tabela) |
| `api/v1/product-attributes-view` | 9 (view) |

## 3. Regras de negócio (Processor)

| Regra | Resposta |
| ----- | -------- |
| Guest não escreve | 403 |
| Pai inexistente ou de outra empresa | 422 |
| Produto pai de si mesmo | 422 |
| Ciclo (pai que é descendente) | 409 |
| `code` repetido na empresa (inclusive excluídos) | 409 |
| Excluir (lógica ou definitiva) produto com filhos | 409 |
| Restaurar filho com pai excluído | 409 |
| `clear-deleted` | só admin; folhas primeiro |
| Atributo em produto inexistente ou de outra empresa | 422 |

`location_id` e `parent_id` de outra empresa: o model recusa (`CompanyScoped` confere as FKs) e a API responde 422.
Isolamento por empresa: tabelas em `column`, views em `via_table`.

## 3.1 Produto e características no mesmo envio

`POST product-manager/create` e `PUT product-manager/update/{id}` aceitam `attributes`: lista **completa** de
`{group_code, field_code, value, unit?, label?}`. A API grava produto e características na mesma transação; no update a lista
substitui as características do produto (`[]` apaga todas). Sem a chave, as características não mudam. Itens sem `value` são
ignorados; `group_code`/`field_code` minúsculos (1 a 50), `value` até 500, `unit` até 30, `label` até 100, no máximo 500 itens — 422 se
inválido, e nada é gravado. `roles` aceita lista (`["admin","user"]`) e é gravado como JSON (`[]` = todos). A lógica é a trait
`Services/V1/Concerns/ReplacesAttributes`, a mesma do Serviço.

## 4. Estado

- Pronto: banco, 54 rotas e teste ponta a ponta (`src/writable/claude/testes/test_movement.sh`, cobre Product e Movement).
- Pendente: frontend (telas, menu e `route_manager`); catálogo `produto.json` ainda não validado pela API (`group_code`/`field_code` livres).

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
