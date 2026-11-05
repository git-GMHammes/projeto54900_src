[◄ Índice da base de conhecimento](../README.md)

---

# Domínio Eleicoes2026 — eleitorado e votos (RJ), somente leitura

> NÃO EXISTE ALTERAÇÃO de MIGRATE: apenas no fim de cada ciclo um novo, para a renovação de todo o sistema.

Criado em 2026-11-04. Domínio da API V1 para os dados das eleições 2026 (RJ) importados direto no banco DEV
(`codeigniter54900_db`, conexão `default`). Segue o [`ROADMAP_padrao_modulo.md`](ROADMAP_padrao_modulo.md): **um módulo
por tabela e um por view**, cada um com rotas, controller, service (`Processor`) e model. Este domínio **substitui** o
antigo `data-explorer`, que foi retirado (era um módulo genérico único, fora do padrão).

## 1. Regras do domínio

- **Nome:** o domínio e o grupo de rotas se chamam `Eleicoes2026` / `eleicoes2026-...`.
- **Somente leitura:** só as rotas de consulta são registradas. Os dados são importados; não há create, update nem delete.
  Por isso não existem `CreateRequest`/`UpdateRequest`, `$allowedFields` é `[]` e os métodos `getCreateRules()` e
  `getUpdateRules()` do controller devolvem `[]`.
- **Acesso:** filtro `eleicoesauth` (`Filters/EleicoesAccessFilter.php`), por wildcard `api/v1/eleicoes2026-*/*` em
  `Config/Filters.php`; substitui `jwtauth` + `adminonly` nesses grupos. Aceita (1) o **token especial das Eleições**
  (seção 6) ou (2) o access token de **admin** logado, como antes. Sem `company_id` (catálogo global): qualquer admin
  de qualquer empresa lê.
- **Candidato:** cada candidato é um **módulo** do domínio, chamado `Candidato<numero>` (hoje `Candidato22001`), com a
  tabela de votos (`EndpointTable.php`) e a view do candidato (`EndPointView.php`) na mesma pasta, nos quatro caminhos
  (Routes, Controllers, Services, Models). Candidato novo = novo módulo `Candidato<numero>`, no mesmo padrão. Não há
  subpasta por tabela dentro do módulo.
- **Nome do objeto no banco:** tabelas e views com número de candidato levam o número no nome
  (`..._22001_...`), e é por ele que se escolhe a subpasta.

## 2. Módulos

| Objeto no banco | Tipo | Módulo (pasta) | Grupo da API (`/api/v1/...`) |
| --------------- | ---- | -------------- | ---------------------------- |
| `eleitorado_1_turno_2026_RJ` | tabela | `Eleicoes2026/Eleitorado1TurnoRj` | `eleicoes2026-eleitorado-1-turno-rj` |
| `eleitorado_local_votacao_2026_RJ` | tabela | `Eleicoes2026/EleitoradoLocalVotacaoRj` | `eleicoes2026-eleitorado-local-votacao-rj` |
| `view_eleicoes_2026_1_turno_bairro` | view | `Eleicoes2026/Eleicoes1TurnoBairro` | `eleicoes2026-1-turno-bairro-view` |
| `eleicoes_2026_votos_1t_2t_22001_RJ` | tabela | `Eleicoes2026/Candidato22001` | `eleicoes2026-candidato-22001` |
| `view_eleicoes_2026_22001_22` | view | `Eleicoes2026/Candidato22001` (mesmo módulo da tabela) | `eleicoes2026-candidato-22001-view` |
| `view_eleicoes_2026_22001_22_municipio` | view | `Eleicoes2026/Candidato22001Municipio` | `eleicoes2026-candidato-22001-municipio-view` |
| `view_eleicoes_2026_22001_22_bairro` | view | `Eleicoes2026/Candidato22001Bairro` | `eleicoes2026-candidato-22001-bairro-view` |

Não incluído: `eleicao_votacao_local_2024` (é de 2024).

### View do candidato 22001

`view_eleicoes_2026_22001_22` foi criada pelo usuário no banco DEV em 2026-11-04 (a antiga
`view_eleicoes_2026_flavio_menezes` deixou de existir). A definição segue o SQL registrado em
`doc/sql/view/eleicoes_2026_flavio_menezes.sql`: 18 colunas, `nr_turno` vindo do eleitorado (`e.nr_turno`, sempre 1) e
`INNER JOIN` de `eleicoes_2026_votos_1t_2t_22001_RJ` com `eleitorado_1_turno_2026_RJ` por `cd_municipio_zona_secao`.
Conferido por `SELECT`: as 18 colunas são as do `SqlViewModel` e a view devolve 58.918 linhas.

A view não tem `id` nem chave única (várias linhas por seção: cargo e partido); por isso não tem `get/{id}` e a
ordenação deve usar `sort=cd_municipio_zona_secao`.

### Views agregadas (2026-11-04)

Criadas direto no DEV (SQL em `doc/sql/view/view_eleicoes_2026_22001_22_municipio.sql` e `..._bairro.sql`; sem migration,
a renovação do snapshot é do usuário no fim do ciclo). Ambas somam `qt_votos` da `view_eleicoes_2026_22001_22`:

- `..._municipio`: `cd_municipio`, `nm_municipio`, `ds_cargo`, `qt_votos`, `qt_secoes` (92 municípios x 2 cargos).
- `..._bairro`: acrescenta `nm_bairro` (1.606 linhas de deputado estadual e 2.033 de presidente).

Totais conferidos com a view de origem: DEPUTADO ESTADUAL 46.700 (Coronel Menezes) e PRESIDENTE 4.966.844 (Flávio
Bolsonaro). **Na view o candidato só se distingue por `ds_cargo`** (não há nome/número do votável). `cd_municipio` é o
código do TSE (5 dígitos), não o IBGE do mapa SVG. Rotas de leitura iguais às da view de bairro (`sort=cd_municipio`).
Leitura pela API com token de admin ainda não testada (sem credencial na sessão); `php -l` e `spark routes` ok.

### Views de dashboard `view_dash_*` (2026-11-05)

Para a Home (sem login, token especial da seção 6). Criadas direto no DEV, SQL em `doc/sql/view/view_dash_*.sql`
(sem migration; a renovação do snapshot é do usuário no fim do ciclo). Todas somente leitura, 5 rotas por grupo
(`find`, `get-grouped`, `search`, `get-all`, `get-no-pagination`), sem `get/{id}`. Base: `eleitorado_1_turno_2026_RJ`
(38.738 seções, 12.857.000 eleitores, 92 municípios, 183 pares município-zona, 2.036 pares município-bairro, 5.061
locais) e `eleicoes_2026_votos_1t_2t_22001_RJ` (Coronel Menezes 22001, deputado estadual 46.700 votos; Flávio Bolsonaro,
presidente 4.966.844 votos). Votos são somados por seção e cargo antes do `JOIN` (sem multiplicar o eleitorado).

| View | Módulo (pasta `Eleicoes2026/`) | Grupo (`/api/v1/...`) | Colunas principais |
| ---- | ------------------------------ | --------------------- | ------------------ |
| `view_dash_resumo_geral` | `DashResumoGeral` | `eleicoes2026-dash-resumo-geral-view` | uma linha por cargo: votos, seções, eleitores, locais, municípios, zonas, bairros, % |
| `view_dash_eleitorado_municipio` | `DashEleitoradoMunicipio` | `eleicoes2026-dash-eleitorado-municipio-view` | eleitores (total, federal, estadual, municipal), seções, locais, zonas, bairros, % do estado |
| `view_dash_eleitorado_zona` | `DashEleitoradoZona` | `eleicoes2026-dash-eleitorado-zona-view` | idem por município e zona |
| `view_dash_eleitorado_bairro` | `DashEleitoradoBairro` | `eleicoes2026-dash-eleitorado-bairro-view` | idem por município e bairro |
| `view_dash_votos_municipio` | `DashVotosMunicipio` | `eleicoes2026-dash-votos-municipio-view` | por cargo: votos, seções com voto, eleitores, `pct_votos_eleitorado`, `pct_votos_estado` |
| `view_dash_votos_zona` | `DashVotosZona` | `eleicoes2026-dash-votos-zona-view` | idem por município e zona |
| `view_dash_votos_bairro` | `DashVotosBairro` | `eleicoes2026-dash-votos-bairro-view` | idem por município e bairro (só bairros com voto no cargo) |
| `view_dash_votos_local_votacao` | `DashVotosLocalVotacao` | `eleicoes2026-dash-votos-local-votacao-view` | por local de votação e cargo, com endereço, latitude e longitude |
| `view_dash_votos_partido` | `DashVotosPartido` | `eleicoes2026-dash-votos-partido-view` | por cargo, partido e votável: votos, municípios, seções, `pct_votos_cargo` |
| `view_dash_ranking_municipio` | `DashRankingMunicipio` | `eleicoes2026-dash-ranking-municipio-view` | `RANK()` por cargo: `nr_ranking_votos` e `nr_ranking_pct` |
| `view_dash_ranking_zona` | `DashRankingZona` | `eleicoes2026-dash-ranking-zona-view` | idem por município e zona |
| `view_dash_ranking_bairro` | `DashRankingBairro` | `eleicoes2026-dash-ranking-bairro-view` | idem por município e bairro |

Notas: `cd_municipio` é o código do TSE. Zonas e bairros são sempre dentro de um município (`cd_municipio` + `nr_zona` /
`nm_bairro`). Cada chamada recalcula a view (cerca de 0,7 a 1,4 s por requisição no DEV). Validado em 2026-11-05: 12
grupos = 200 com o token especial (`get-all`, `get-no-pagination`, `search`, `find`), 401 sem token, e `user-manager-view`
= 401 com o token especial. Totais conferidos por `SELECT` (eleitores 12.857.000 em município, zona e bairro).

## 3. Rotas

Base: `{{www}}/index.php/api/v1/<grupo>/...`. Mesmos nomes de rota do padrão, só que apenas as de leitura.

| Verbo | Caminho | Tabelas com `deleted_at` | Tabela de votos (sem `deleted_at`) | View de bairro |
| ----- | ------- | :-: | :-: | :-: |
| POST | `find` | sim | sim | sim |
| POST | `get-grouped` | sim | sim | sim |
| GET | `search?q=` | sim | sim | sim |
| GET | `get/{id}` | sim | sim | não (chave texto) |
| GET | `get-all` | sim | sim | sim |
| GET | `get-no-pagination` | sim | sim | sim |
| GET | `get-deleted/{id}`, `get-with-deleted/{id}`, `get-deleted-all`, `get-all-with-deleted[/{id}]` | sim | não | não |

- Query string padrão: `?page=1&limit=20&sort=id&order=asc`. Corpo do `find`: `{ "campo": "valor" }`.
- A view `view_eleicoes_2026_1_turno_bairro` não tem coluna `id`: a chave é `cd_municipio_zona_secao` (texto com
  pontos, ex.: `58696.027.0149`). Por isso não tem `get/{id}`, e a ordenação padrão deve ser
  `sort=cd_municipio_zona_secao`.
- Sem token: 401. Perfil que não é admin (e sem token especial): 403.

## 6. Token especial das Eleições (sem login) — 2026-11-05

Para a Home da `menezes22001` ler as APIs Eleições sem logar.

| Item | Valor |
| ---- | ----- |
| Emissão | `GET {{www}}/index.php/api/v1/eleicoes-public/token` — **pública** (grupo `eleicoes-public`, fora de qualquer filtro; o wildcard `eleicoes2026-*` não o alcança) |
| Resposta | `data.access_token`, `token_type=Bearer`, `expires_in` (segundos), `scope=eleicoes2026` |
| Claims | `iss`, `aud`, `iat`, `exp`, `typ=eleicoes`, `scope=eleicoes2026`; **sem** `sub`, `sid`, `cid` (nem usuário nem sessão) |
| TTL | `JWT_ELEICOES_TTL` (padrão 3600 s), lido em `Config/Jwt.php` (`eleicoesTtl`) |
| Assinatura | HS256 nativo (`JwtService::issueEleicoesToken`), mesmo `JWT_SECRET`; sem Composer |
| Onde vale | só nos grupos `eleicoes2026-*` (filtro `eleicoesauth`); somente leitura |
| Onde NÃO vale | demais APIs: o `JwtAuthFilter` exige `typ=access` (401) |

Arquivos: `Filters/EleicoesAccessFilter.php`, `Controllers/Api/V1/Eleicoes2026/EleicoesToken/TokenController.php`,
`Config/Routes/Api/v1/Eleicoes2026/EleicoesToken/EndpointPublic.php`, registro em `Config/Routes.php` e alias/lista
`eleicoesauth` em `Config/Filters.php`.

Validado (2026-11-05): token novo emitido sem login; com ele, `get-all` e `get-no-pagination` das views município e
bairro = 200; sem token e com token inválido = 401; com o token especial `auth/me`, `user-manager-view/get-all` e
`template-render/get` = 401. O caminho do admin logado (fallback para `jwtauth` + `adminonly`) **não foi testado**
(sem credencial na sessão). Risco aceito: qualquer visitante obtém leitura das APIs Eleições pelo TTL do token.

## 4. Arquivos (mesmo caminho em cada camada)

```
Config/Routes/Api/v1/Eleicoes2026/<Modulo>/EndpointTable.php  e/ou EndPointView.php
Controllers/Api/V1/Eleicoes2026/<Modulo>/ResourceTableController.php  (ou ResourceViewController.php)
Services/V1/Eleicoes2026/<Modulo>/Processor.php
Models/V1/Eleicoes2026/<Modulo>/SqlTableModel.php  (ou SqlViewModel.php)
```

`<Modulo>` de candidato: `Candidato22001` (tabela e view juntas). Registro dos grupos em `Config/Routes.php` (bloco
`/Eleicoes2026`) e do filtro em `Config/Filters.php` (listas `jwtauth` e `adminonly`).

## 5. Pendências e observações

- Validado: `php -l`, rotas listadas no `spark routes` (todas com `jwtauth adminonly`), 401 sem token, 404 no antigo
  `data-explorer` e `SELECT` direto na view do candidato. **Leitura pela API com token de admin ainda não testada**
  (sem credencial na sessão).
- Tabela de votos sem `deleted_at` nem `created_at`: o model usa `$useSoftDeletes=false` e `$useTimestamps=false`.
- Frontend: consumido pela tela `/v1/svg-2026` (ver `README_SVG_2026.md` do frontend).
- Histórico: o `data-explorer` (plano `20261104150759_api_leitura_busca_todas_tabelas_views`) foi removido em 2026-11-04.

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
