const e=`[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
# Dashboard de Eleições 2026 — Home da empresa \`menezes22001\`\r
\r
Criado em 2026-11-05. Título da Home: "Sistema Eleitoral 2026". Painel eleitoral na Home \`/menezes22001\`, **sem login**: lê as views \`view_dash_*\` do domínio\r
Eleicoes2026 pelo token especial (\`typ=eleicoes\`, ver \`services/v1/eleicoes2026.public.ts\` e o README do backend\r
\`README_modulo_eleicoes2026.md\`). Substitui os cards informativos que essa Home mostrava; as demais empresas seguem\r
com a \`DefaultHome\`.\r
\r
## Pacotes\r
\r
| Pacote | Versão | Licença | Uso |\r
| ------ | ------ | ------- | --- |\r
| \`echarts\` | ^6.1.0 | Apache 2.0 | motor dos gráficos (import modular, renderer Canvas) |\r
| \`echarts-for-react\` | ^3.0.6 | MIT | adaptador React (\`lib/core\`, sem o pacote inteiro) |\r
\r
Instalados em 2026-11-05 por pedido do usuário. Gráfico novo = registrar o tipo em \`echarts.use([...])\` no\r
\`components/charts/EChart.tsx\`; nunca importar \`echarts\` inteiro.\r
\r
## Arquivos\r
\r
\`\`\`\r
components/charts/EChart.tsx                 base: build(theme) -> opções; tema Bootstrap claro/escuro (data-bs-theme + --bs-*)\r
services/v1/eleicoes2026.dash.ts             leitura tipada das views (números da API vêm como texto -> number)\r
constants/api.ts                             12 grupos eleicoes2026-dash-*-view em API_GROUPS\r
pages/Home/company/Menezes22001Home.tsx      renderiza o dashboard\r
pages/Home/company/menezes22001/\r
  EleicoesDashboard.tsx                      layout, filtros (cargo, métrica) e painéis\r
  useDashboardData.ts                        5 chamadas em paralelo, estados loading/error/ok, reload\r
  chartOptions.ts                            opções de cada gráfico (funções puras)\r
  KpiCard.tsx / RankingBairros.tsx           indicador com contagem animada; tabela com busca e páginas\r
  dashFormat.ts                              formatadores pt-BR, cores e rótulos por cargo\r
\`\`\`\r
\r
## O que o painel mostra e de qual view vem\r
\r
| Bloco | View |\r
| ----- | ---- |\r
| KPIs (eleitores, votos por cargo, municípios, zonas, locais) e medidores (% dos votos sobre o eleitorado) | \`view_dash_resumo_geral\` |\r
| Top 10 municípios (votos ou % do eleitorado) e rosca de participação | \`view_dash_votos_municipio\` |\r
| Treemap município › bairro e tabela de ranking de bairros | \`view_dash_votos_bairro\` |\r
| Mapa de calor das 20 maiores zonas | \`view_dash_votos_zona\` |\r
| Dispersão eleitores x votos por local (600 maiores de cada cargo, eixo Y próprio por cargo) | \`view_dash_votos_local_votacao\` (\`search\` com \`filters[ds_cargo]\`) |\r
\r
Filtros: botões **Presidente / Dep. Estadual** (abre com Dep. Estadual selecionado; afetam top 10, treemap, rosca e ranking) e **Votos / % do eleitorado**\r
(só o top 10). Presidente = Flávio Bolsonaro (22); Dep. Estadual = Coronel Menezes (22001). Os cargos só se distinguem\r
por \`ds_cargo\`.\r
\r
## Regras e cuidados\r
\r
- **Bootstrap primeiro:** cards, grid, botões, tabela, placeholders e barras são classes do Bootstrap; não há SCSS novo.\r
  Só ficaram \`style\` inline para tamanhos pontuais e cores do gráfico.\r
- **Sem \`any\`:** respostas entram como \`unknown\` e passam por \`normalizeList\`; tooltips escapam texto da API (\`esc\`).\r
- **Falha de API:** o painel mostra alerta com "Tentar de novo"; a Home não quebra.\r
- **Desempenho:** cada view leva cerca de 1 s no DEV; as chamadas rodam em paralelo com esqueleto de carregamento. O\r
  treemap usa 12 municípios x 10 bairros; a dispersão, 1.200 pontos.\r
- **Heatmap:** a cor é relativa ao maior % de cada cargo (Presidente e Dep. Estadual têm escalas muito diferentes); o\r
  tooltip mostra o % real.\r
- **Medidores:** escalas distintas por cargo (0–100% e 0–1%), indicadas no rótulo de cada um.\r
\r
## Validação (2026-11-05)\r
\r
\`tsc -b\` e ESLint sem erro; \`npm run build\` (com \`VITE_BASE_PATH=/projeto54900/public/app/\`) ok; Home conferida em\r
\`localhost:54910/menezes22001\` (tema escuro) com os totais das views (12.857.000 eleitores, 4.966.844 e 46.700 votos).\r
Modo claro e celular **não** conferidos em tela.\r
\r
---\r
\r
[◄ Índice da base de conhecimento](../README.md)\r
`;export{e as default};
