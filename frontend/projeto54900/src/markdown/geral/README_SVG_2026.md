[← Base de conhecimento](../README.md)

# SVG-2026 — duplicata do módulo SVG para a empresa Menezes 22001

Criado em 2026-11-04. O `svg-2026` é uma **cópia do módulo `svg-map`** (mapa SVG dos 92 municípios do RJ), feita para a
empresa `menezes22001`. É um módulo **só de frontend**: não chama API nem backend, apenas lê arquivos estáticos.
Sobre o módulo original, ver a seção `svgMap` de [`README_rotas_frontend.md`](README_rotas_frontend.md).

## Empresa e acesso

| Item | Valor |
| ---- | ----- |
| Empresa | `Menezes 22001` (`company_manager.id` 4), slug `menezes22001`, ativa |
| Paleta | `color_theme` = `Dark` (definido em 2026-11-05 direto no banco DEV; antes era NULL = padrão do sistema). Sem migration/seed |
| Superusuário | `gustavo.hammes` (id 1), vínculo `admin` na empresa |
| Usuários vinculados | `gustavo.*` (ids 1-6 e 142-144), `lorena.*` (145-147) e `cel.menezes.*` (151-153): 15 ao todo |
| Vínculo | linha ativa em `company_members` e id 4 em `user_manager.company_ids` |
| Role no vínculo | conta com role Admin entra como `admin`; as demais, como `member` |

Entrada pela URL `/menezes22001/v1/login`. Backup do `company_ids` anterior à mudança:
`src/writable/claude/20261104155758_company_ids_backup.json`.

## Arquivos do módulo

| Original (`svg-map`) | Cópia (`svg-2026`) |
| -------------------- | ------------------ |
| `pages/v1/svg-map/SvgMapPage.tsx` | `pages/v1/svg-2026/Svg2026Page.tsx` |
| `routes/v1/svgMap.routes.tsx` (`svgMapRoutes`) | `routes/v1/svg2026.routes.tsx` (`svg2026Routes`) |
| `paths.v1.svgMap.view` = `/v1/svg-map` | `paths.v1.svg2026.view` = `/v1/svg-2026` |
| `public/svg-map/` (SVG + 2 JSONs) | `public/svg-2026/` (mesmos 3 arquivos) |
| `#svgMapWrapper` em `styles/_custom.scss` | `#svg2026Wrapper` (bloco duplicado no mesmo arquivo) |

A rota fica atrás de `RequireAuth` (sem `RequireRole`), registrada em `routes/v1/index.tsx` logo após `svgMapRoutes`.
Os ids do DOM (`svg2026Wrapper`, `svg2026Offcanvas`, `svg2026Labels`) foram renomeados para não colidir com o original.

## Banco (DEV) — rota e menu

| Tabela | Registro | Observação |
| ------ | -------- | ---------- |
| `route_manager` | `frontend` / `svg-2026` / `GET` / `/v1/svg-2026` / `pages/v1/svg-2026/Svg2026Page` | espelha a linha 801 do `svg-map` |
| `temp_menu` | id 93, `SVG-2026`, `/v1/svg-2026`, `offcanvas`, `sort_order` 85 | `company_manager=["menezes22001"]`, `roles=["guest","user","admin"]` |
| `temp_menu` | id 94, `SVG`, `/v1/svg-map`, `offcanvas`, `sort_order` 86 | `company_manager=["menezes22001"]`, `roles=["superuser"]` |
| `temp_menu` | id 95, `Home`, `/`, `navbar`, `sort_order` 10 (2026-11-07) | `company_manager=["menezes22001"]`, `roles=["guest","user","admin","superuser"]`; `temp_nav_id`, `icon` copiados do id 1. Linha própria da empresa; o id 1 (Home das demais empresas) não foi alterado. Backup: `src/writable/claude/20261107190000_temp_menu_home_backup.sql`. Rollback: `DELETE FROM temp_menu WHERE id = 95` |

Os dois itens foram inseridos direto no banco DEV; **não há migration/seed** para eles (a renovação do snapshot é feita
no fim do ciclo, pelo usuário).

## Home da Menezes com JWT especial das Eleições (2026-11-05)

A Home de `/menezes22001` deixou de ser a `DefaultHome` pura: `pages/Home/company/Menezes22001Home.tsx` (registrada em
`companyHomes.ts`) renderiza a mesma `DefaultHome` e, ao abrir, obtém o **token especial das Eleições** (sem login),
guardado só em memória em `services/v1/eleicoes2026.public.ts`:

- `getEleicoesPublicToken()` busca `GET /v1/eleicoes-public/token`, renova 1 min antes de expirar e divide a busca entre
  chamadas simultâneas.
- `eleicoesPublicGet(group, path, params)` faz GET num grupo `eleicoes2026-*` com esse token no `Authorization`
  (sobrepõe o token de sessão).
- O token só vale nas APIs `eleicoes2026-*`; nas demais dá 401. Contrato e filtro: `README_modulo_eleicoes2026.md`
  (backend, seção 6). A Home ainda **não exibe dados** das Eleições: só obtém o token.

## Eleições 2026 no mapa (2026-11-04)

Douglas Ruas (22, GOVERNADOR) incluído em 2026-11-07: constante `DOUGLAS` em `eleicoes2026.ts` e entrada em `CANDIDATOS`; modal e collapses percorrem a lista, então não há código por candidato. Os dados vêm das mesmas views (carga na tabela `eleicoes_2026_votos_1t_2t_22001_RJ`, ver README do backend). Candidato novo = novo `Candidato` na lista + foto.

O módulo deixou de ser só estático: consome as views do domínio Eleicoes2026
(ver `app/markdown/geral/README_modulo_eleicoes2026.md`) pelo service `services/v1/eleicoes2026.view.ts`.

| Elemento | Comportamento |
| -------- | ------------- |
| Clique no município | marca/desmarca o checkbox **e** abre o `MunicipioModal`: cards do Coronel Menezes (deputado estadual), do Flávio Bolsonaro (presidente) e do Douglas Ruas (governador) lado a lado em `md` (empilhados no mobile; `modal-xl`), com os votos no município e o total do RJ |
| Municípios marcados | `ResultadosMunicipio` abaixo do mapa: um Collapse por município (inicia recolhido) com `row`/`col` e 3 cards (`col-lg-4`, lado a lado em `lg`, empilhados no mobile; a lista de bairros rola por dentro, máx. 60vh); cada um lista os bairros agrupados com o total de votos |
| Clique no bairro | Collapse discreto com tabela: Local (endereço em cinza, itálico, menor), Zona/Sessão, Votos |
| Ordem | sempre do maior para o menor voto |

Percentual do eleitorado no modal (2026-11-05): abaixo dos votos do município, cada card mostra "X,XX% do eleitorado (N eleitores)". Os eleitores vêm de `view_dash_votos_municipio` (`fetchDashVotosMunicipio`, `services/v1/eleicoes2026.dash.ts`), buscada em paralelo com os votos em `carregarTotaisMunicipios` e guardada em `TotaisMunicipio.eleitores`. O percentual é `votos / eleitores` (2 casas, `formatarPctEleitorado`), o mesmo cálculo de `pct_votos_eleitorado` da view. Se a view do eleitorado falhar, `eleitores` fica 0 e a linha não aparece; o modal segue só com os votos.

Percentual por bairro (2026-11-05): em cada bairro do card de resultados (`ResultadosMunicipio`), logo abaixo do nome, uma linha menor, em itálico e cinza claro (`form-text fst-italic text-body-tertiary`): "X,XX% do eleitorado do bairro (N eleitores)". Os eleitores vêm de `view_dash_votos_bairro` (`fetchDashVotosBairro`), buscada uma única vez e guardada em cache no módulo (`eleitoresPorBairro` em `eleicoes2026.ts`), com chave código TSE do município + bairro em maiúsculas. Bairro sem correspondência, ou falha na busca, fica sem a linha (`BairroVotos.eleitores` = 0); a falha não é guardada no cache e a próxima abertura tenta de novo.

Tema do modal: o `MunicipioModal` renderiza dentro do `ThemePortal` (`components/template/ThemePortal.tsx`), não de um `createPortal` puro no `document.body`. O portal puro tira o modal do `.tpl-app` do `TemplateShell` e ele perde `data-bs-theme` e as variáveis de cor (ficava branco no tema dark); o `ThemePortal` reaplica a paleta da empresa. Corrigido em 2026-11-05.

Menu Home da menezes22001 (2026-11-05, SUBSTITUÍDO em 2026-11-07 pela linha própria id 95; o `company_manager` do id 1 no DEV não contém `menezes22001`): o item `Home` (`temp_menu` id 1, `/`, navbar, `roles=["guest","user","admin"]`) ganhou `menezes22001` no JSON `company_manager`, que passou a ser `["default","tryikads","drsergiopsicologo","menezes22001"]`. Sem linha nova (ver regra de menu por empresa em JSON). Comando aplicado no DEV e a aplicar na KingHost:

```sql
UPDATE temp_menu
SET company_manager = JSON_ARRAY_APPEND(company_manager, '$', 'menezes22001')
WHERE title = 'Home' AND react_route = '/' AND parent_id IS NULL AND deleted_at IS NULL
  AND NOT JSON_CONTAINS(company_manager, '"menezes22001"');
```

Tema do Offcanvas (checklist de municípios): sem `bg-white` fixo. O Offcanvas do Bootstrap já usa `--bs-body-bg` e `--bs-body-color`, que acompanham o `data-bs-theme` do template (dark ou claro). O `bg-white` forçava o fundo branco no tema dark. Corrigido em 2026-11-05.

Fotos dos candidatos: JPEG 200x200 (~10 KB, recorte quadrado central, q82) `menezes_22001.jpg`, `flavio_22.jpg` e `douglas_22.jpg` (2026-11-07, recorte do rosto de `ruas_22.jpeg`, que é WebP 1200x1600 e foi mantido) em `public/svg-2026/` (substituíram os originais grandes, de 220 KB e 111 KB). O campo `foto` de `Candidato`, em `eleicoes2026.ts`, aponta para elas; aparecem
redondas, com o nome abaixo, nos cards do modal e dos collapses.

Arquivos: `pages/v1/svg-2026/{eleicoes2026.ts, MunicipioModal.tsx, ResultadosMunicipio.tsx}` e
`public/svg-2026/rj_municipios_tse.json` (CD_MUN IBGE do mapa -> `CD_TSE` das views; 92 de 92 casados pelo nome
normalizado). Totais por município/RJ vêm das views `..._municipio` (carga única); bairros, ao marcar o município;
seções, ao abrir o bairro (`find` com `cd_municipio`, `nm_bairro`, `ds_cargo`, páginas de 1000).

**Acesso:** as rotas `eleicoes2026-*` são `adminonly`. Usuário que não é admin vê o mapa, mas o modal e os collapses
mostram aviso de acesso restrito (403). Collapse e modal são controlados por estado React (sem JS do Bootstrap). O modal é renderizado por `createPortal` no `document.body`: dentro do conteúdo do template o backdrop e o `position: fixed` ficavam presos ao contexto de empilhamento dele (cobriam só a área de conteúdo).

## Regra de visibilidade do menu

O backend filtra o menu por empresa (`temp_menu.company_manager`, lista de slugs) e por role
(`Builder::visibleForRole`: o superuser vê tudo). Resultado na empresa `menezes22001`:

| Quem | Vê no menu |
| ---- | ---------- |
| Admin, user e guest | só `SVG-2026` |
| Superuser (`gustavo.hammes`) | `SVG` e `SVG-2026` |

O item original `SVG` (id 26) continua listando só `default`, `tryikads` e `drsergiopsicologo`. Nenhum outro item de menu
lista `menezes22001`, por isso a empresa não mostra mais nada além do SVG-2026.

**Atenção:** a restrição é só de **menu**. A rota `/v1/svg-2026` não tem guarda por empresa; quem digitar a URL
estando logado em outra empresa abre a página.

## Template da empresa (Template 2 com cabeçalho e rodapé do default)

Situação atual (2026-11-04): a empresa usa o **Template 2** (visual sem bordas) com o **cabeçalho e o rodapé do
`default`** (modelos neutros: logo "LOGOMARCA" e textos genéricos). O template define só o visual; cabeçalho e
rodapé são por empresa (lista `company_manager` de cada linha). Histórico: primeiro a empresa foi ligada aos registros 2
(trouxe a marca da Tryik), depois ao Template 004 (cópia do 002, ver
[`README_template004_modelo.md`](README_template004_modelo.md)) e por fim a esta configuração.

| Tabela | Registro | Lista `company_manager` |
| ------ | -------- | ----------------------- |
| `temp_manager` | id 2, `template002` | `["tryikads","menezes22001"]` |
| `temp_header` | id 1 (Cabeçalho Template 1, neutro) | `["default"]` |
| `temp_header` | id 5 (Cabeçalho Menezes 22001, 2026-11-05) | `["menezes22001"]` |
| `temp_footer` | id 1 (Rodapé Template 1) | `["default"]` |
| `temp_footer` | id 5 (Rodapé Menezes 22001, 2026-11-05) | `["menezes22001"]` |
| `temp_nav` | id 1 (Menu) e id 2 (Nav) | `["default","tryikads","drsergiopsicologo","menezes22001"]` |
| `temp_manager`, `temp_header`, `temp_footer` | id 4 (Template 004) | `[]` e `status=inactive` (sem uso) |

- O `temp_nav` precisa listar a empresa: sem isso a casca de navegação nasce vazia e nenhum item de `temp_menu` aparece,
  mesmo com o slug no item.
- O rodapé da Menezes é o id 5 (próprio): col1 "Segurança com presença", col3 "Compromisso com o Rio", col4 "Participe", imagem central `img/menezes22001/rodape2.jpeg`. O rodapé 1 ficou só com o `default`. Desfazer: repor `["default","menezes22001"]` no id 1 e `status=inactive` no id 5.
- Cabeçalho e rodapé do `default` (id 1) e da Menezes (id 5) são registros separados; editar um não afeta o outro. Para a
  Menezes ter marca própria é preciso criar linhas próprias (como as do id 4, hoje inativas).
- O código do Template 004 (página, rota, imagens, variante) continua no frontend, sem empresa vinculada.
- Não foram tocados: Template 1 e 3, cabeçalhos e rodapés 2 e 3 (Tryik e Dr. Sérgio) e o `color_theme` da empresa (`NULL`).
- Desfazer: tirar `menezes22001` de `temp_manager` 2 e de `temp_header`/`temp_footer` 1; para voltar ao 004, repor
  `["menezes22001"]` e `status=active` nas linhas id 4.

## Pendências

- Validado em tela em 2026-11-04: login de `gustavo.admin` em `/menezes22001`, rota `/menezes22001/v1/svg-2026` abre o
  mapa, com o Template 2 e o cabeçalho/rodapé do `default`. Ainda não conferidos em tela: os logins `user` e `guest`,
  o superuser (`gustavo.hammes`, que deve ver `SVG` e `SVG-2026`) e as contas `lorena.*` e `cel.menezes.*`.
- Mudanças de banco só existem no DEV; entram no snapshot das migrations no fim do ciclo.

---

[← Base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
