[◄ Índice da base de conhecimento](../../../README.md)

---

# Módulos `product`, `movement` e `service` — frontend (estado e pendências)

> NÃO EXISTE ALTERAÇÃO de MIGRATE: apenas no fim de cada ciclo um novo, para a renovação de todo o sistema.

Bancos e APIs dos três módulos estão **completos e testados** (ver os READMEs do backend:
[`README_modulo_product.md`](../../../../../../../app/markdown/geral/README_modulo_product.md),
[`README_modulo_movement.md`](../../../../../../../app/markdown/geral/README_modulo_movement.md),
[`README_modulo_service.md`](../../../../../../../app/markdown/geral/README_modulo_service.md)). **As telas foram feitas** no mesmo
modelo do módulo [`location`](../location/README_plano.md): seed SQL (forms, listas, ações, menu, `route_manager`) + páginas finas
sobre componentes globais por props. **Abertas no navegador: só o cadastro e a edição de Produto e de Serviço**; as demais telas foram conferidas por tipos, lint, build e API (ver Pendências).

Regras seguidas: CRUD completo por tabela/view (criar, listar, editar, excluir, visualizar, menu), botão Voltar em
cadastro/atualização, campos pelo `FormGrid`/fábricas, lógica dirigida por dados em **componente global com props** (a `Page` é só
wrapper), páginas em `pages/v1/<modulo>/<recurso>/<Acao>Page.tsx`
([`README_paginas_modulo.md`](../../README_paginas_modulo.md)), inglês em código/rotas e PT-BR em UI/comentário. Módulos
independentes: nenhuma tela exige outro módulo; a ligação (ex.: `location_id` do produto) é campo opcional.

## 1. Telas e rotas

| Módulo | Rota | Página | Fonte |
| ------ | ---- | ------ | ----- |
| Product | `/v1/product-manager` | `product/product-manager/GetAllPage` | visão **Árvore** (`RecordTree` sobre `TreeBuild`) e **Tabela** (`ListBuild`, lista `product-manager`) |
| | `/create`, `/update/:id` | `CreatePage`, `UpdatePage` (sobre `RecordFormWithAttributes`) | forms `criar-produto` / `editar-produto` (núcleo) **mais todas as características do catálogo** num formulário só; `?parent_id=` pré-seleciona o pai |
| | `/v1/product-manager/:id` | `GetPage` | dados, `StockCard`, `AttributeEditor` (catálogo de produto), produtos filhos |
| | `/v1/product-attributes` (+ `/create`, `/update/:id`) | `product/product-attributes/*` | lista `product-attributes`; forms `criar/editar-atributo-de-produto` (`?product_id=`) |
| Movement | `/v1/movement-manager` | `movement/movement-manager/GetAllPage` | lista `movement-manager` |
| | `/create`, `/update/:id` | `MovementForm` (campos por tipo), `UpdatePage` | forms `criar-movimento` / `editar-movimento`; `?product_id=` |
| | `/v1/movement-manager/:id` | `GetPage` | `StatusActions` (Confirmar separação, Receber encomenda, Cancelar) e movimentos gerados |
| | `/v1/movement-stock` e `/:id` | `movement/movement-stock/*` | só leitura, lista `movement-stock` (saldo, reservado, encomendado, disponível, `below_min`) |
| Service | `/v1/service-manager` | `service/service-manager/GetAllPage` | visão **Árvore** e **Tabela** (lista `service-manager`) |
| | `/create`, `/update/:id`, `/:id` | `CreatePage`, `UpdatePage` (sobre `RecordFormWithAttributes`), `GetPage` | forms `criar/editar-servico` (núcleo) **mais todas as características do catálogo de serviço** num formulário só; detalhe com `AttributeEditor`, filhos e atalho "Novo pedido" |
| | `/v1/service-attributes` (+ `/create`, `/update/:id`) | `service/service-attributes/*` | lista e forms de atributo (`?service_id=`) |
| | `/v1/service-order` (+ `/create`, `/update/:id`, `/:id`) | `service/service-order/*` | lista `service-order`; forms `criar/editar-pedido-de-servico` (`?service_id=`, `?parent_id=`); detalhe com `StatusActions` e etapas |
| | `/v1/service-summary` e `/:id` | `service/service-summary/*` | só leitura, lista `service-summary` |

Menu (offcanvas): **Produtos** (Produtos, Características), **Movimento** (Movimentos, Saldo de estoque), **Serviços** (Serviços,
Pedidos, Características, Resumo). Rotas em `routes/v1/{product,movement,service}.routes.tsx`; caminhos em `routes/paths.ts`;
serviços HTTP em `services/v1/` (14 recursos, tabela e view separadas).

## 2. Seed SQL

`app/Database/Migrations/202610190100_product_movement_service_frontend_seed.sql` — gerado por script, reaplicável (apaga as faixas
de ids próprias e as linhas de `route_manager` dos objetos novos antes de inserir):

- 12 forms (`form_manager` 71–82, `form_groups`, `form_rows`, 136 `form_fields`), 8 listas (`list_manager` 58–65, 73 colunas, 19 ações),
  11 itens de menu (`temp_menu` 75–85) e `route_manager` (180 de backend, copiadas de `company-manager`, e 26 de frontend).
- Campo `roles[]` (select múltiplo de `user_roles`, `valueKey: slug`): o payload sai como lista e a API grava como JSON.
  Sem nenhum perfil escolhido, o cadastro usa o padrão da coluna (todos) e a edição grava `[]` (= todos).
- `company_id` nunca vai no form (a sessão carimba). Usuário, `status` e data do movimento não aparecem (a API define).

## 3. Componentes globais criados (`components/global/`, todos por props)

| Componente | Serve a |
| ---------- | ------- |
| `RecordTree` | árvore com Ver, Novo filho, Editar e Excluir (produto e serviço) |
| `TreeListPage` | página com visões Árvore e Tabela |
| `RecordDetail` | visualização de um registro (`dl` + blocos extras + ações no cabeçalho) |
| `RecordFormWithRoles` | `RecordFormBuild` com o campo `roles` por registro |
| `RecordFormWithAttributes` | cadastro/edição com **todas as colunas**: núcleo (`RecordFormWithRoles`) + `AttributeForm`, no mesmo envio (`attributes` no corpo); serve produto e serviço por props |
| `AttributeForm` | **formulário completo** de características: um card por grupo do catálogo, com todos os campos (texto, enum, Sim/Não, data, número, valor + unidade) e listas para os campos que repetem; fica dentro do `<form>` do cadastro |
| `AttributeEditor` | edição avulsa de características na tela de detalhe (adicionar, atualizar, excluir uma a uma), dirigida por catálogo (`catalogs/productCatalog.ts`, `serviceCatalog.ts`) |
| `StatusActions` | botões de transição de status com campos exigidos por ação (pedido de serviço e movimento aberto) |
| `StockCard` | saldo do produto (some se o produto não tem linha de saldo) |

Também: `utils/recordLabels.ts` (rótulos PT-BR dos enums), `utils/attributeRows.ts`, `types/attributeCatalog.ts` e `catalogs/fieldLabels.ts` (rótulo PT-BR de cada campo e valor de enum do catálogo; código novo sem rótulo aparece humanizado).
`MeasureField` foi **dispensado**: valor e unidade (duração, prazo, quantidade) são dois campos lado a lado no form, por seed.

## 3.1 Produto e Serviço com todas as colunas (cadastro e edição)

**Produto** (`/v1/product-manager/create` e `/update/:id`) mostra, numa página só: o **núcleo** (pai, código, nome, tipo, status, ordem,
estoque mínimo/máximo, local, descrição, perfis) e **11 cards** com todas as características do catálogo (Identificação, Classificação,
Composição, Estética, Física, Técnica, Segurança, Regulatório, Armazenagem, Embalagem, Comercial — 57 campos). Peso, validade,
composição, temperatura, lote etc. estão nesses cards.

**Serviço** (`/v1/service-manager/create` e `/update/:id`) segue o mesmo modelo: o **núcleo** (pai, código, nome, tipo, prestador e
documento, unidade de cobrança, preço, duração, prazo, status, perfis) e **9 cards** do catálogo de serviço (Identificação, Classificação,
Execução, Agenda e prazos, Preço e pagamento, Fiscal, Exigências, Segurança, Especificação — 44 campos).

Regras comuns: Campo que repete (apelido, categoria, material, substância, fração, especificação,
norma, registro, restrição de uso...) vira lista com "Adicionar" e "×". A unidade padrão do catálogo já vem preenchida (kg, cm, Cel, mo...).

O envio é **um só**: o corpo do produto leva `attributes` (lista completa de `{group_code, field_code, value, unit?, label?}`) e a API
grava produto e características na mesma transação; no update a lista **substitui** as características do produto. Na edição, o
`attributes` só segue depois de carregar as atuais (nunca apaga por engano). Campo de arquivo (imagem, ficha técnica) fica de fora: sem upload.

### Fake fill do cadastro de serviço (ramos variados)

`/v1/service-manager/create` também tem o botão **Fake fill** (slug `criar-servico`): 10 serviços em rodízio (marido de aluguel,
passeio com cão, enfermagem domiciliar, alvenaria, ar-condicionado, limpeza pós-obra, montagem de móveis, fisioterapia, pintura e
eletricista), cada um com núcleo (prestador biscate/MEI/empresa com CPF ou CNPJ válido, unidade de cobrança, preço, duração e prazo com
unidade de tempo) e todos os 9 grupos de características (41 a 55 por serviço). Dados em `dev/fakeFill/servicoVariadoData.ts`, script em
`dev/fakeFill/servicoVariado.ts`; o motor `dev/fakeFill/atributosFill.ts` é compartilhado com o do produto.

### Fake fill do cadastro de produto (material para cirurgias)

O botão **Fake fill** (dev-only, canto inferior esquerdo, só em `isDevHost()`) aparece em `/v1/product-manager/create` e preenche o
formulário inteiro com um **material para cirurgia**, em **rodízio** (cada clique cadastra o item seguinte; o índice fica no
`localStorage`, chave `fakeFill.produtoCirurgico.next`). São 16 itens: fio de sutura nylon 3-0, pinça hemostática Kelly, lâmina de bisturi
nº 15, campo cirúrgico TNT SMS, compressa de gaze estéril, trocarte 10 mm e o **kit de uma cirurgia** — luva estéril, avental estéril,
máscara cirúrgica, gorro, seringa 10 mL, agulha hipodérmica, cateter venoso periférico 20G, tesoura Metzenbaum, porta-agulha Mayo-Hegar e
degermante de clorexidina 2% (mistura líquida, com substâncias e frações). Dados em `dev/fakeFill/produtoCirurgicoData.ts`. Preenche o núcleo (código `CIR-XXXXXX`, nome, tipo
`material_cirurgico`, estoque mínimo/máximo, descrição) e os 11 grupos de características (cerca de 45 por item: composição, medidas,
especificações com nome e unidade, normas ABNT, registro Anvisa e validade, temperatura, umidade, validade, lote, datas, embalagem,
preços e GTIN-13 válido). Script em `dev/fakeFill/produtoCirurgico.ts`, ligado à slug `criar-produto` em `dev/fakeFill/registry.ts`.
Os campos de característica têm ids estáveis (`attr-<grupo>-<campo>`, `-unit`, `-new`, `-new-unit`, `-new-label`) para esse tipo de
script; um valor que não existe no catálogo avisa no console.

## 4. Conferência feita

`tsc -b`, `eslint` (componentes e páginas novos), `vite build` (em pasta temporária), **teste real no navegador** (Chrome headless: login, cadastro do produto preenchendo núcleo e características, conferência no banco, edição com remoção de item repetido), `test_product_form.sh` (17 verificações do envio com `attributes`), seed aplicado e
`src/writable/claude/testes/test_frontend_seed.sh` (39 verificações: forms e listas publicados, fontes dos selects respondem,
`roles` em lista aceito no cadastro e na edição dos quatro recursos, datas de hora do form aceitas).

## 5. Pendências

Concluído: cadastro e edição de Produto e de Serviço completos (núcleo + todas as características num envio), testados no navegador
(10 produtos cirúrgicos e 10 serviços pelo Fake fill). Para continuar, por prioridade:

1. **Abrir no navegador as telas ainda não testadas** (hoje só tipos, lint, build e API): Movimento (cadastro por tipo, detalhe com
   `StatusActions`, saldo), pedido de serviço (cadastro, detalhe com transições e etapas), listas e árvores de Produto e Serviço,
   detalhe com `AttributeEditor`, características avulsas e resumo de serviço.
2. **Revisar o formulário de pedido de serviço** (`criar/editar-pedido-de-servico`) contra `nucleo.service_order` do `servico.json`.
   Hoje o núcleo bate, mas nunca foi aberto na tela.
3. **Filtro por `roles` na leitura da API**: a coluna guarda os slugs, mas a leitura não esconde registros de quem não tem o perfil.
   A tela não promete esse bloqueio.
4. **Upload de arquivo**: campos de tipo `arquivo` (imagem, ficha técnica, portfólio, certificado) ficam de fora do formulário.
5. **Validar `group_code`/`field_code` na API** contra o catálogo; hoje só o `AttributeEditor` valida e os forms de característica
   avulsa aceitam texto livre.
6. **Catálogo em uma fonte só**: `src/catalogs/` é cópia de `doc/json/produto.json` e `servico.json`; trocar por endpoint.
7. Edição de movimento mostra todos os campos editáveis, sem esconder os que o tipo não usa (o cadastro esconde por tipo).
8. Saldo por local não existe (`movement_manager.location_id` é informativo).
9. Árvores carregam a lista plana uma vez; com volume grande, trocar por `filters[parent_id]` sob demanda.
10. Fora do escopo atual: cadastro de clientes de serviço (hoje texto livre) e financeiro (hoje só `paid_at`).

Observação de sessão: o login ocasional com 401 no primeiro acesso nunca foi isolado (sumiu após as correções de
[`README_sessao_entre_abas.md`](../../README_sessao_entre_abas.md)); se voltar, investigar.

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
