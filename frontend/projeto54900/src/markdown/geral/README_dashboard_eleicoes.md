[◄ Índice da base de conhecimento](../README.md)

---

# Dashboard de Eleições 2026 — Home da empresa `menezes22001`

Criado em 2026-11-05. Título da Home: "Sistema Eleitoral 2026". Painel eleitoral na Home `/menezes22001`, **sem login**: lê as views `view_dash_*` do domínio
Eleicoes2026 pelo token especial (`typ=eleicoes`, ver `services/v1/eleicoes2026.public.ts` e o README do backend
`README_modulo_eleicoes2026.md`). Substitui os cards informativos que essa Home mostrava; as demais empresas seguem
com a `DefaultHome`.

## Pacotes

| Pacote | Versão | Licença | Uso |
| ------ | ------ | ------- | --- |
| `echarts` | ^6.1.0 | Apache 2.0 | motor dos gráficos (import modular, renderer Canvas) |
| `echarts-for-react` | ^3.0.6 | MIT | adaptador React (`lib/core`, sem o pacote inteiro) |

Instalados em 2026-11-05 por pedido do usuário. Gráfico novo = registrar o tipo em `echarts.use([...])` no
`components/charts/EChart.tsx`; nunca importar `echarts` inteiro.

## Arquivos

```
components/charts/EChart.tsx                 base: build(theme) -> opções; tema Bootstrap claro/escuro (data-bs-theme + --bs-*)
services/v1/eleicoes2026.dash.ts             leitura tipada das views (números da API vêm como texto -> number)
constants/api.ts                             12 grupos eleicoes2026-dash-*-view em API_GROUPS
pages/Home/company/Menezes22001Home.tsx      renderiza o dashboard
pages/Home/company/menezes22001/
  EleicoesDashboard.tsx                      layout, filtros (cargo, métrica) e painéis
  useDashboardData.ts                        5 chamadas em paralelo, estados loading/error/ok, reload
  chartOptions.ts                            opções de cada gráfico (funções puras)
  KpiCard.tsx / RankingBairros.tsx           indicador com contagem animada; tabela com busca e páginas
  dashFormat.ts                              formatadores pt-BR, cores e rótulos por cargo
```

## O que o painel mostra e de qual view vem

| Bloco | View |
| ----- | ---- |
| KPIs (eleitores, votos por cargo, municípios, zonas, locais) e medidores (% dos votos sobre o eleitorado) | `view_dash_resumo_geral` |
| Top 10 municípios (votos ou % do eleitorado) e rosca de participação | `view_dash_votos_municipio` |
| Treemap município › bairro e tabela de ranking de bairros | `view_dash_votos_bairro` |
| Mapa de calor das 20 maiores zonas | `view_dash_votos_zona` |
| Dispersão eleitores x votos por local (600 maiores de cada cargo, eixo Y próprio por cargo) | `view_dash_votos_local_votacao` (`search` com `filters[ds_cargo]`) |

Filtros: botões **Presidente / Governador / Dep. Estadual** (abre com Dep. Estadual selecionado; afetam top 10, treemap, rosca e ranking) e **Votos / % do eleitorado**
(só o top 10). Presidente = Flávio Bolsonaro (22); Governador = Douglas Ruas (22, incluído em 2026-11-07, cor `#2ecc71`); Dep. Estadual = Coronel Menezes (22001). Dep. Estadual da empresa `helcio-angelo-70222` = Hélcio Ângelo (70222). Desde 2026-11-08 as views têm a coluna `nr_votavel` e os candidatos se distinguem por
`ds_cargo` + `nr_votavel` (Dep. Estadual tem dois: 22001 e 70222).

## Cargos por empresa (2026-11-07)

O mesmo `EleicoesDashboard` serve mais de uma empresa. `dashFormat.ts` define `CARGOS_POR_EMPRESA` (slug da URL ->
cargos); empresa sem entrada mostra os 3. `CARGOS` (já filtrado), `CARGO_INICIAL` e `temCargo()` comandam botões,
KPIs, medidores (um por cargo, centros distribuídos por igual), heatmap, dispersão (o eixo Y do Dep. Estadual só existe
com o cargo) e o texto do cabeçalho (`CargoInfo.descricao`).

| Empresa | Home | Cargos | Abre com |
| ------- | ---- | ------ | -------- |
| `menezes22001` | `Menezes22001Home.tsx` | Presidente, Governador, Dep. Estadual | Dep. Estadual |
| `helcio-angelo-70222` | `HelcioAngelo70222Home.tsx` | Presidente, Governador, Dep. Estadual (Hélcio 70222; sem Coronel Menezes) | Dep. Estadual |

**Filtro por candidato:** `dashFormat.ts` define, por empresa, os cargos (`CARGOS_POR_EMPRESA`) e o `numero` (nr_votavel) de cada
um (`DEPUTADO_POR_EMPRESA` troca o Menezes pelo Hélcio). `useDashboardData` descarta as linhas fora de `ehCandidatoExibido(cargo, numero)`
e `fetchDashVotosLocais` consulta só os candidatos da empresa. **Limite:** o filtro é só de tela; as views inteiras (inclui os dois
deputados) continuam nas respostas da API (DevTools). Validado em tela em 2026-11-08: `/helcio-angelo-70222` mostra Dep. Estadual
0,02% do eleitorado (Hélcio) e nenhum texto "Menezes"; `/menezes22001` segue com 46.700 votos.

## Regras e cuidados

- **Bootstrap primeiro:** cards, grid, botões, tabela, placeholders e barras são classes do Bootstrap; não há SCSS novo.
  Só ficaram `style` inline para tamanhos pontuais e cores do gráfico.
- **Sem `any`:** respostas entram como `unknown` e passam por `normalizeList`; tooltips escapam texto da API (`esc`).
- **Falha de API:** o painel mostra alerta com "Tentar de novo"; a Home não quebra.
- **Desempenho:** cada view leva cerca de 1 s no DEV; as chamadas rodam em paralelo com esqueleto de carregamento. O
  treemap usa 12 municípios x 10 bairros; a dispersão, 1.200 pontos.
- **Heatmap:** a cor é relativa ao maior % de cada cargo (Presidente e Dep. Estadual têm escalas muito diferentes); o
  tooltip mostra o % real.
- **Medidores:** um por cargo exibido (Presidente e Governador 0–100%, Dep. Estadual 0–1%), indicados no rótulo de cada um.
- **KPIs:** 7 cards (6 sem o Dep. Estadual) (`col-xxl` divide a linha por igual), incluindo "Votos Governador".
- **Dispersão:** Presidente e Governador dividem o eixo Y da esquerda (mesma ordem de grandeza); Dep. Estadual tem eixo próprio. `fetchDashVotosLocais` busca 3 x 600 locais.
- **Candidato novo:** nova constante `CARGO_*` em `eleicoes2026.dash.ts`, entrada em `TODOS_CARGOS` (`dashFormat.ts`, com `descricao` e `gaugeMax`; o medidor sai sozinho) e KPI em `EleicoesDashboard.tsx`; as views `view_dash_*` já devolvem todo `ds_cargo` da tabela do candidato.

## Validação (2026-11-05)

`tsc -b` e ESLint sem erro; `npm run build` (com `VITE_BASE_PATH=/projeto54900/public/app/`) ok; Home conferida em
`localhost:54910/menezes22001` (tema escuro) com os totais das views (12.857.000 eleitores, 4.966.844 e 46.700 votos).
Modo claro e celular **não** conferidos em tela.

---

[◄ Índice da base de conhecimento](../README.md)
