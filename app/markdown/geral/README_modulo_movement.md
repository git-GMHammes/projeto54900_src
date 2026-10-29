[◄ Índice da base de conhecimento](../README.md)

---

# Módulo Movement — movimento de produtos

> NÃO EXISTE ALTERAÇÃO de MIGRATE: apenas no fim de cada ciclo um novo, para a renovação de todo o sistema.

Entrada, saída, separação, desperdício e encomenda numa única tabela. **Semi-dependente**: exige `product_id`
(o Produto não conhece o Movimento); `location_id`, `origin_id` e `user_manager_id` são opcionais.
Regra geral em [`README_modulos_independentes.md`](README_modulos_independentes.md). Produto em [`README_modulo_product.md`](README_modulo_product.md).

## 1. Banco (`codeigniter54900_db`, conexão `default`)

SQL: `Database/Migrations/202610181600_movement_tables.sql` (aplicar depois do SQL do Produto; reaplicável; sem triggers).

| Objeto | Papel |
| ------ | ----- |
| `movement_manager` | `company_id`, `roles`, `product_id`, `type`, `quantity` (> 0), `status`, `occurred_at`, `expected_at`, `user_manager_id`, `location_id`, `origin_id`, `lot`, `expires_at`, `unit_cost`, `reason`, `reference`, `notes`, `deleted_at`. |
| `view_movement_manager` | Movimento com produto, usuário e local (caminho completo). |
| `view_movement_stock` | Saldo por produto (inclui produtos sem movimento, com zeros). |

## 2. Tipos e efeito no saldo

| `type` | Significado | Nasce | Efeito |
| ------ | ----------- | ----- | ------ |
| `entry` | Entrada | `done` | soma ao saldo |
| `exit` | Saída | `done` | subtrai do saldo |
| `waste` | Desperdício (estragou, quebrou, venceu) | `done` | subtrai do saldo |
| `reservation` | Separação (carrinho, aguardando envio) | `open` | reduz o disponível, não baixa o saldo |
| `order` | Encomenda (comprada, a caminho) | `open` | soma ao encomendado; exige `expected_at` |

`view_movement_stock`: `on_hand` = entradas − saídas − desperdícios (só `done`); `reserved` = separações `open`;
`ordered` = encomendas `open`; `available` = `on_hand` − `reserved`; `below_min` = 1 quando `stock_min` existe e
`available` < `stock_min`; `next_expected_at` = próxima chegada. Excluídos e `cancelled` não contam.

## 3. Rotas (jwtauth por wildcard; `adminonly` na exclusão definitiva)

Contrato canônico do [`ROADMAP_padrao_modulo.md`](ROADMAP_padrao_modulo.md): 36 rotas.

| Grupo | Rotas |
| ----- | ----- |
| `api/v1/movement-manager` | 18 (tabela) |
| `api/v1/movement-manager-view` | 9 (view) |
| `api/v1/movement-stock-view` | 9 (view de saldo, só leitura) |

Saldo de um produto: `GET movement-stock-view/get/{product_id}`. Abaixo do mínimo: `movement-stock-view/search?filters[below_min]=1`.

## 4. Regras de negócio (Processor)

| Regra | Resposta |
| ----- | -------- |
| Guest não escreve | 403 |
| Produto inexistente ou de outra empresa | 422 |
| `quantity` <= 0 | 422 |
| `order` sem `expected_at` | 422 |
| `exit`/`reservation` acima do disponível | 422 |
| `waste` acima do saldo | 422 |
| `user_manager_id`, `status` inicial e `occurred_at` | vêm da sessão/servidor; o cliente não os impõe |
| Alterar movimento `done` ou `cancelled` | 409 (corrige-se com movimento inverso) |
| `update` com `status: "done"` em `reservation` | gera uma `exit` (`origin_id` = a separação), na mesma transação |
| `update` com `status: "done"` em `order` | gera uma `entry` (herda `lot`, `expires_at`, `unit_cost`), na mesma transação |
| `update` com `status: "cancelled"` | só encerra o movimento aberto |
| Excluir movimento `done` | só admin (403) |

Produto, tipo, usuário, data e origem são imutáveis no `update`. Quantidade de separação aberta pode mudar, respeitando o disponível.

## 5. Estado e pendências

- Pronto: banco, 36 rotas e teste ponta a ponta (`test_movement.sh`, 53 verificações, duas empresas).
- Pendente: frontend (telas, menu e `route_manager`).
- Concorrência: duas saídas simultâneas podem ultrapassar o disponível (a conferência é leitura + gravação, sem trava de linha).
- Saldo por local não existe ainda: `location_id` é só informativo.

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
