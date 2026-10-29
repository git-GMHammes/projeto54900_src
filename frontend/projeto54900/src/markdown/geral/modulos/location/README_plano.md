[◄ Índice da base de conhecimento](../../../README.md)

---

# Módulo `location` — frontend (locais em árvore recursiva)

> NÃO EXISTE ALTERAÇÃO de MIGRATE: apenas no fim de cada ciclo um novo, para a renovação de todo o sistema.

Backend e banco em
[`README_modulo_location.md`](../../../../../../../app/markdown/geral/README_modulo_location.md).

## Telas

| Rota | Página | Fonte dos dados |
| ---- | ------ | --------------- |
| `/v1/location-manager` | `pages/v1/location/location-manager/GetAllPage` | visão **Árvore** (`LocationTree` sobre `TreeBuild`) e visão **Tabela** (`ListBuild`, lista 56) |
| `/v1/location-manager/create` | `…/CreatePage` | form 67 `criar-local`; `?parent_id=` pré-seleciona o pai |
| `/v1/location-manager/update/:id` | `…/UpdatePage` | form 68 `editar-local` |
| `/v1/location-types` (+ `/create`, `/update/:id`) | `pages/v1/location/location-types/*` | lista 57 e forms 69/70; só `admin` |

Menu "Locais" (offcanvas, ids 72–74) com os filhos Locais e Tipos de local. Seed reaplicável:
`app/Database/Migrations/202610181130_location_frontend_seed.sql` (forms, listas, menu e `route_manager`).

## Componente global novo

- **`TreeBuild`** (`components/global/`) — árvore por props (`load`, `idKey`, `parentKey`, `renderLabel`, `renderMeta`,
  `renderActions`). Carrega a lista plana **uma vez** e agrupa por pai em memória; serve a qualquer tabela com
  `parent_id`. Linha cujo pai não veio na lista sobe ao topo.

## Visualizar e mapa

`/v1/location-manager/:id` (`GetPage`): dados, locais filhos e `MapLinksPanel module="location-manager"`. Módulo registrado em `Config/MapLinkables.php`. Lista 56 ganhou as ações **Ver** e **Mapa**; a árvore, o botão Ver.

## Regras de tela

- Pai vazio = topo da árvore (o ✕ do select envia `null`). Erros 409/422 do Processor (ciclo, `code` repetido, pai
  inválido, excluir com filhos) aparecem como toast/mensagem da API.
- O botão Excluir da árvore fica desabilitado quando `children_count > 0`.
- O select de pai lista todos os locais (`location-manager-view/get-no-pagination`); ao editar, escolher o próprio
  local ou um descendente é recusado pela API.

## Pendências

- Telas conferidas por `tsc` e `eslint`; **não foram abertas no navegador** nesta entrega.
- Árvore com volume grande: trocar a carga única por `filters[parent_id]` sob demanda.

---

[◄ Índice da base de conhecimento](../../../README.md)
