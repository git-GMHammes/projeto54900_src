[◄ Índice da base de conhecimento](../../../README.md)

---

# Módulos `product`, `movement` e `service` — o que falta no frontend

Bancos e APIs dos três módulos estão **completos e testados** (ver os READMEs do backend:
[`README_modulo_product.md`](../../../../../../../app/markdown/geral/README_modulo_product.md),
[`README_modulo_movement.md`](../../../../../../../app/markdown/geral/README_modulo_movement.md),
[`README_modulo_service.md`](../../../../../../../app/markdown/geral/README_modulo_service.md)). **Nenhuma tela existe ainda**:
sem páginas, sem seed de form/lista/menu e sem `route_manager`. Referência de como se faz: o módulo
[`location`](../location/README_plano.md) (seed SQL + páginas finas sobre `FormBuild`, `ListBuild` e `TreeBuild`).

Regras que valem para tudo abaixo: CRUD completo por tabela/view (criar, listar, editar, excluir, visualizar, menu), botão
Voltar em cadastro/atualização, renderização por schema (`FormGrid`/fábricas, nada de `<input>` à mão), lógica dirigida por dados
em **componente global com props** (a `Page` é só wrapper), páginas em `pages/v1/<modulo>/<recurso>/<Acao>Page.tsx`
([`README_paginas_modulo.md`](../../README_paginas_modulo.md)), inglês em código/rotas e PT-BR em UI/comentário. Módulos
independentes: nenhuma tela exige outro módulo; a ligação (ex.: `location_id` do produto) é campo opcional.

## 1. Telas por módulo

### Product — 54 rotas prontas

| Rota | Página | Fonte |
| ---- | ------ | ----- |
| `/v1/product-manager` | `pages/v1/product/product-manager/GetAllPage` | visão **Árvore** (`TreeBuild`, por `parent_id`) e **Tabela** (`ListBuild` sobre `view_product_manager`) |
| `/v1/product-manager/create` e `/update/:id` | `CreatePage`, `UpdatePage` | forms `criar-produto` / `editar-produto`; `?parent_id=` pré-seleciona o pai |
| `/v1/product-manager/:id` | `GetPage` | dados, filhos, atributos, saldo do produto e local (se houver) |
| `/v1/product-attributes` (+ `/create`, `/update/:id`) | `pages/v1/product/product-attributes/*` | lista sobre `view_product_attributes`, forms de atributo |

### Movement — 36 rotas prontas

| Rota | Página | Fonte |
| ---- | ------ | ----- |
| `/v1/movement-manager` | `pages/v1/movement/movement-manager/GetAllPage` | `ListBuild` sobre `view_movement_manager`, filtros por tipo, status, produto e usuário |
| `/v1/movement-manager/create` e `/update/:id` | `CreatePage`, `UpdatePage` | forms `criar-movimento` / `editar-movimento` |
| `/v1/movement-manager/:id` | `GetPage` | movimento, origem e movimentos gerados |
| `/v1/movement-stock` | `pages/v1/movement/movement-stock/GetAllPage` (+ `GetPage`) | só leitura, `view_movement_stock`: saldo, reservado, encomendado, disponível, alerta `below_min` |

### Service — 90 rotas prontas

| Rota | Página | Fonte |
| ---- | ------ | ----- |
| `/v1/service-manager` | `pages/v1/service/service-manager/GetAllPage` | visão **Árvore** (pacote/obra/etapa) e **Tabela** (`view_service_manager`) |
| `/v1/service-manager/create` e `/update/:id` | `CreatePage`, `UpdatePage` | forms `criar-servico` / `editar-servico` |
| `/v1/service-attributes` (+ `/create`, `/update/:id`) | `pages/v1/service/service-attributes/*` | lista e forms de atributo |
| `/v1/service-order` (+ `/create`, `/update/:id`, `/:id`) | `pages/v1/service/service-order/*` | `ListBuild` sobre `view_service_order` (atrasados em destaque); detalhe com etapas (`parent_id`) |
| `/v1/service-summary` | `pages/v1/service/service-summary/GetAllPage` (+ `GetPage`) | só leitura, `view_service_summary`: pedidos, faturado, nota média, atrasados |

## 2. Seed SQL (um arquivo por módulo, reaplicável, no modelo de `202610181130_location_frontend_seed.sql`)

- `form_manager`/`form_groups`/`form_rows`/`form_fields`: um form de criar e um de editar por tabela (6 tabelas: `product_manager`,
  `product_attributes`, `movement_manager`, `service_manager`, `service_attributes`, `service_order`).
- `list_manager`/`list_columns`/`list_actions`: uma lista por view (8 views de tela: produto, atributo de produto, movimento, saldo,
  serviço, atributo de serviço, pedido, resumo) com ações Ver, Editar, Excluir.
- `menu_manager`: Produtos (Produtos, Atributos), Movimento (Movimentos, Saldo), Serviços (Serviços, Atributos, Pedidos, Resumo).
- `route_manager`: um registro por `object` (`product-manager`, `product-manager-view`, `product-attributes`, ...).
- Ids novos: consultar `MAX(id)` de cada tabela antes de fixar as faixas (as faixas 56–74 e 506–533 já são do Location).
- Campos `roles` e `company_id`: `company_id` nunca vai no form (a sessão carimba); `roles` é campo JSON montado
  ([`README_campo_json_montado.md`](../../README_campo_json_montado.md)): multi select de slugs de `user_roles`, vazio = todos.

## 3. Comportamento específico de tela

**Product**
- `location_id` é select **opcional** sobre `location-manager-view/get-no-pagination` (vazio grava `null`).
- `stock_min`/`stock_max` numéricos, opcionais. Na lista e no detalhe, selo "abaixo do mínimo" vem de `view_movement_stock`
  (`below_min`), sem depender de o módulo Movimento estar em uso (sem linha de saldo, não mostra selo).
- Atributos dirigidos pelo catálogo `doc/json/produto.json`: o usuário escolhe **grupo** e depois **campo** e o valor/unidade segue o
  `tipo` do campo (`enum` vira select, `boolean` vira switch, `medida` vira valor + unidade, `multiplo` permite várias linhas).
  Componente global novo `AttributeEditor` por props (catálogo, `product_id`, endpoints), reaproveitável pelo Serviço.

**Movement**
- O form muda por `type`: `order` exige `expected_at`; `entry`/`order` mostram lote, validade e custo; `waste` mostra motivo.
  `user_manager_id`, `status` e `occurred_at` não aparecem (a API define).
- Movimento aberto (`reservation`/`order`) mostra as ações **Confirmar separação** / **Receber encomenda** (`PUT update` com
  `status: "done"`; a API gera a saída/entrada e devolve `generated_id`) e **Cancelar** (`status: "cancelled"`). Movimento `done`
  ou `cancelled` não mostra Editar. Erros 422 (acima do disponível/saldo) e 409 aparecem como toast da API.
- Cartão de saldo do produto (saldo, reservado, encomendado, disponível) reutilizável na tela do produto e do movimento.

**Service**
- `provider_type` com rótulos: Biscate (autônomo informal), MEI, Empresa (CNPJ). `duration` e `lead_time` com unidade (min, h, d, wk, mo)
  lado a lado (campo par valor + unidade, componente global por props).
- Pedido: botões de transição conforme o `status` atual, cada um pedindo só o que a API exige: **Orçar** (`quoted_price`), **Aceitar**,
  **Agendar** (`scheduled_at`), **Iniciar**, **Concluir** (preço final opcional), **Cancelar/Recusar** (`cancel_reason`). Componente global
  `StatusActions` por props (mapa de fluxo + campos exigidos), reaproveitável pelo Movimento.
- Pedido concluído: só avaliação (1 a 5), comentário, pagamento e observações. Pedido atrasado (`is_late`) em destaque.

## 4. Componentes globais a criar (todos por props, em `components/global/`)

| Componente | Serve a |
| ---------- | ------- |
| `AttributeEditor` | atributos de produto e de serviço (catálogo JSON) |
| `StatusActions` | fluxo do pedido de serviço e ações do movimento aberto |
| `MeasureField` (valor + unidade) | duração, prazo, quantidade, atributos `medida` |
| `StockCard` | saldo do produto (tela do produto e do movimento) |

`TreeBuild`, `FormBuild`, `ListBuild` e `MapLinksPanel` já existem e não mudam.

## 5. Pendências de backend que afetam a tela

- A API **ainda não filtra por `roles`**: a coluna guarda os slugs, mas a leitura não esconde registros de quem não tem o perfil.
  Até lá, a tela não pode prometer esse bloqueio.
- `group_code`/`field_code` de atributos não são validados contra os catálogos `produto.json` e `servico.json`: quem valida é o
  `AttributeEditor`.
- Saldo por local não existe (`movement_manager.location_id` é informativo).

## 6. Ordem sugerida

1. Product (árvore, form, atributos e `AttributeEditor`).
2. Movement (form por tipo, ações de status, saldo e `StockCard`).
3. Service (árvore, `MeasureField`, pedido com `StatusActions`, resumo).
4. Menu, `route_manager` e conferência com `tsc` e `eslint`; abrir as telas no navegador (as do Location ainda não foram).

---

[◄ Índice da base de conhecimento](../../../README.md)

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
