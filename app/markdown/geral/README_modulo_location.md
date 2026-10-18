[◄ Índice da base de conhecimento](../README.md)

---

# Módulo Location — locais em árvore recursiva

Controla locais de qualquer escala (galáxia, país, rua, galpão, caixa, pasta) numa só tabela. Cada
local aponta para o pai pela mesma tabela (`parent_id`, nulo no topo). Módulo **independente**: sem
vínculo com Map, Produto, Patrimônio, Estoque, Agenda ou Mensagem. A integração futura será por
`location_id` no módulo consumidor ou por tabela de vínculo genérica.

## 1. Banco (`codeigniter54900_db`, conexão `default`)

SQL: `Database/Migrations/202610172321_location_tables.sql` (aplicar pelo cliente `mysql`: tem
`DELIMITER` nos triggers).

| Objeto | Papel |
| ------ | ----- |
| `location_types` | Rótulos de tipo, 32 hoje (geografia: `galaxy` … `number`; ambientes: `condominium`, `building`, `warehouse`, `garage`, `floor`, `aisle`, `room`; mobiliário: `vehicle`, `cabinet`, `shelf`, `pallet`; recipientes: `tank`, `barrel`, `drawer`, `crate`, `bag`, `box`, `folder`, `envelope`, `bottle`, `can`, `jar`, `flask`). O tipo **não define nível**: qualquer tipo pode ficar sob qualquer pai (um líquido-recipiente como garrafa, lata ou pote pode estar em caixa, prateleira ou direto numa sala). Global (sem `company_id`). |
| `location_manager` | Árvore por lista de adjacência. `company_id`, `parent_id` (FK própria, `RESTRICT`), `location_type_id`, `name`, `code`, `description`, `latitude`/`longitude` (para o Map), `sort_order`, `status`, `deleted_at`. `UNIQUE (parent_id, code)`. |
| `view_location_manager` | CTE recursiva: `root_id`, `depth` (0 no topo), `path_ids` (`1/5/9`), `path_names` (`País > Estado > ...`), `children_count`, dados do tipo. Percorre também os excluídos; o model esconde-os. |
| Triggers `trg_location_manager_bi/bu` | Pai de outra empresa, o próprio local como pai e ciclo (pai que é descendente). Repetem a barreira do `Processor`. |

## 1.1 Ordem de grandeza (`sort_order`)

`sort_order` classifica os tipos do **maior para o menor**: galáxia 10, planeta 20, país 40, rua 80,
galpão 120, prateleira 190, caixa 260, pasta 270, garrafa 290, lata 300, pote 310, frasco 320.
Os valores andam de 10 em 10 para sobrar vão. Tipo novo recebe o valor do vão certo (ex.: 205 entre
palete 200 e tanque 210), sem renumerar os demais. Ordenar por `sort_order` mostra a escala.

Novo tipo: `POST api/v1/location-types/create` (admin) com `code` (minúsculo, em inglês), `name` (rótulo
em português) e `sort_order`; ou acrescentar à lista de `Database/Migrations/202610180001_location_types_seed.sql`
(upsert por `code`, reaplicável). Listagem na ordem: `GET location-types/get-no-pagination?sort=sort_order&order=asc`.

## 2. Montar de baixo para cima

1. `POST location-manager/create` com a Caixa, sem `parent_id`.
2. Criar o Corredor e `PUT location-manager/update/{caixa}` com `{"parent_id": corredor}`.
3. Repetir: Galpão adota o Corredor, Rua adota o Galpão, e assim até a Galáxia.
4. `{"parent_id": null}` desliga o local do pai (volta ao topo).

## 3. Rotas (jwtauth por wildcard; `adminonly` na exclusão definitiva)

Contrato canônico do [`ROADMAP_padrao_modulo.md`](ROADMAP_padrao_modulo.md): 45 rotas.

| Grupo | Rotas |
| ----- | ----- |
| `api/v1/location-types` | 18 (tabela) |
| `api/v1/location-manager` | 18 (tabela) |
| `api/v1/location-manager-view` | 9 (view) |

Consultas de árvore sem rota nova:

- Filhos diretos: `POST location-manager/find` com `{"parent_id": X}`, ou `location-manager-view/search?filters[parent_id]=X`.
- Toda a árvore de um topo: `location-manager-view/search?filters[root_id]=X`.
- Descendentes por nome do ancestral: `location-manager-view/search?q=Galpão 2` (a busca varre `path_names`).
- Filtros da view: `parent_id`, `root_id`, `location_type_id`, `type_code`, `depth`, `status`.

## 4. Regras de negócio (Processor)

| Regra | Resposta |
| ----- | -------- |
| Guest não escreve | 403 |
| Pai inexistente ou de outra empresa | 422 |
| Local pai de si mesmo | 422 |
| Ciclo (novo pai é descendente) | 409 |
| `code` repetido entre irmãos | 409 |
| Excluir (lógica ou definitiva) local com filhos | 409 |
| Restaurar filho com pai excluído | 409 |
| `clear-deleted` | só admin; remove folhas primeiro |
| `location-types`: escrita só admin; tipo em uso não é excluído (409); `code` único (409) | |

Isolamento por empresa: `location_manager` em `column`, `view_location_manager` em `via_table`,
`location_types` global (`none`). Ver [`README_multiempresa_guia_modulos.md`](README_multiempresa_guia_modulos.md).

## 5. Estado e pendências

- Pronto: banco, 45 rotas, Controllers/Requests/Processors/Models, teste ponta a ponta
  (`src/writable/claude/testes/test_location.sh`, 35 verificações).
- Pendente: telas (CRUD completo, menu, árvore), registro dos três grupos em `route_manager`,
  `Config/MapLinkables.php` (ligação com o Map) e a tabela de vínculo genérica para os demais módulos.
- A `view_location_manager` percorre a árvore inteira a cada consulta (CTE). Se o volume crescer,
  considerar coluna `path` materializada ou closure table.

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
