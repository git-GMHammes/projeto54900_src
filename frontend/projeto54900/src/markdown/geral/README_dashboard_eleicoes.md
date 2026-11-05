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

Filtros: botões **Presidente / Dep. Estadual** (abre com Dep. Estadual selecionado; afetam top 10, treemap, rosca e ranking) e **Votos / % do eleitorado**
(só o top 10). Presidente = Flávio Bolsonaro (22); Dep. Estadual = Coronel Menezes (22001). Os cargos só se distinguem
por `ds_cargo`.

## Regras e cuidados

- **Bootstrap primeiro:** cards, grid, botões, tabela, placeholders e barras são classes do Bootstrap; não há SCSS novo.
  Só ficaram `style` inline para tamanhos pontuais e cores do gráfico.
- **Sem `any`:** respostas entram como `unknown` e passam por `normalizeList`; tooltips escapam texto da API (`esc`).
- **Falha de API:** o painel mostra alerta com "Tentar de novo"; a Home não quebra.
- **Desempenho:** cada view leva cerca de 1 s no DEV; as chamadas rodam em paralelo com esqueleto de carregamento. O
  treemap usa 12 municípios x 10 bairros; a dispersão, 1.200 pontos.
- **Heatmap:** a cor é relativa ao maior % de cada cargo (Presidente e Dep. Estadual têm escalas muito diferentes); o
  tooltip mostra o % real.
- **Medidores:** escalas distintas por cargo (0–100% e 0–1%), indicadas no rótulo de cada um.

## Validação (2026-11-05)

`tsc -b` e ESLint sem erro; `npm run build` (com `VITE_BASE_PATH=/projeto54900/public/app/`) ok; Home conferida em
`localhost:54910/menezes22001` (tema escuro) com os totais das views (12.857.000 eleitores, 4.966.844 e 46.700 votos).
Modo claro e celular **não** conferidos em tela.

---

[◄ Índice da base de conhecimento](../README.md)
