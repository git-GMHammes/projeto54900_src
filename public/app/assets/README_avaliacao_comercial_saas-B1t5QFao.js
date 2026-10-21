const e=`[\`README.md\`](../README.md)\r
\r
# Avaliação comercial do sistema — venda de código-fonte x SaaS mensal\r
\r
Avaliação de mercado do projeto54900, feita a pedido do usuário em 2026-10-12.\r
Cobre os dois modelos de monetização possíveis para o sistema: venda única do\r
código-fonte e assinatura mensal como SaaS.\r
\r
> **Nota de uso interno:** os valores abaixo representam a **faixa máxima\r
> recomendada** para cada modelo. "Teto"/"máximo" é terminologia de\r
> bastidor, de planejamento interno — **nunca repassar essa expressão a um\r
> cliente**. Na proposta comercial, apresentar sempre como "investimento",\r
> "plano" ou "licenciamento" — nunca como limite superior de uma negociação.\r
\r
## Card de investimento (apresentação ao cliente)\r
\r
Um único card por oferta: **infraestrutura, banco, APIs, chaves, licenças, fileserver, IA, suporte e o lucro\r
estão diluídos no valor total**. O cliente vê só o investimento e o que está incluso — nenhuma linha de custo\r
separada, nenhum markup, nenhuma palavra "teto". A composição interna fica na seção seguinte.\r
\r
| COMPRA DO SISTEMA (licenciamento) | USO DO SISTEMA (plano mensal) |\r
| --- | --- |\r
| **Investimento: R$ 238.500 a R$ 374.400** (pagamento único) | **Investimento: R$ 3.000 a R$ 8.700 por mês** (por empresa) |\r
| Código-fonte completo dos 9 módulos | Sistema hospedado, pronto para usar |\r
| Implantação e 12 meses de operação assistida | Servidor, banco dedicado e backup automatizado |\r
| Infraestrutura, banco e fileserver da implantação | Fileserver para anexos (áudio, vídeo, Office, PDF) |\r
| APIs de mapa, chaves e licenças configuradas | APIs de mapa, geocodificação, chaves, domínio, SSL e e-mail |\r
| Reserva de IA para automações | Reserva de IA para automações |\r
| Suporte, atualização e handover | Suporte, monitoramento, atualização e SLA |\r
| O valor varia com exclusividade, suporte e escopo | O valor varia com o porte da empresa e o volume de uso |\r
\r
### Diluição do valor total (uso interno — não mostrar ao cliente)\r
\r
Preço = (soma dos custos) × (1 + markup). Cenário padrão, markup 50%: cada custo vira **1,5×** seu valor e o lucro\r
(33,3% do preço) está distribuído dentro de cada linha. Mensal, por empresa:\r
\r
| Componente                          | Leve: custo → no preço | Pesado: custo → no preço |\r
| ----------------------------------- | ---------------------: | -----------------------: |\r
| Servidor de aplicação               | 400 → 600              | 900 → 1.350              |\r
| Banco de dados dedicado             | 300 → 450              | 800 → 1.200              |\r
| Fileserver                          | 300 → 450              | 1.200 → 1.800            |\r
| APIs de mapa                        | 150 → 225              | 500 → 750                |\r
| Chaves, licenças, domínio e e-mail  | 150 → 225              | 500 → 750                |\r
| Reserva para IA                     | 300 → 450              | 1.000 → 1.500            |\r
| Suporte e monitoramento             | 400 → 600              | 900 → 1.350              |\r
| **Total do card**                   | **2.000 → 3.000**      | **5.800 → 8.700**        |\r
| Composição do preço                 | custo 66,7% · lucro 33,3% | custo 66,7% · lucro 33,3% |\r
\r
Cenário de necessidade extrema (markup 100%): custo 50% · lucro 50% do preço (R$ 4.000 a 11.600/mês; compra\r
R$ 318.000 a 499.200). Compra: o mesmo fator 1,5× sobre desenvolvimento + operação assistida (ver memória de cálculo).\r
\r
## O que é o sistema\r
\r
Plataforma multitenant tipo **low-code builder** (comparável a Retool/Appsmith\r
verticalizado):\r
\r
| Módulo        | O que faz                                                                 |\r
| ------------- | -------------------------------------------------------------------------- |\r
| Form/List     | Formulários e listagens dinâmicos persistidos no banco (\`form_manager\`/\`list_manager\`), renderizados por fábrica genérica (\`FormGrid\`), sem reimplementar tela por tela |\r
| Map           | Leaflet + OpenStreetMap + OpenRouteService (rota/tempo) + Nominatim (geocodificação) + ViaCEP, vínculo universal a qualquer registro de qualquer módulo |\r
| Messages      | Mensagens diretas/grupo com agendamento, anexo, menção, modo chat completo (271 rotas) |\r
| ChatRooms     | Salas de chat moderadas, filtro de palavrão, bloqueio automático, denúncia de anexo |\r
| Timeline      | Feed social com posts, reações, avaliação, republicação                   |\r
| Companies     | Multi-tenant real: empresa, acesso por usuário, permissão individual a form/list |\r
| Calendar      | Agenda com convite por e-mail/token, anexos, participantes                |\r
| Upload        | Anexos polimórficos para qualquer módulo                                  |\r
| Nav/Menu      | Navbar e árvore administrativa configuráveis no banco                     |\r
\r
Característica relevante para o preço: **nada é hardcoded** — form, lista,\r
menu, mapa-vínculo e rota de endpoint são todos dirigidos por configuração no\r
banco, o que reduz o custo de manutenção e justifica cobrar como plataforma,\r
não como sistema sob medida.\r
\r
## Comparáveis de mercado usados na estimativa\r
\r
| Comparável                                              | Faixa praticada                  | Observação                                        |\r
| --------------------------------------------------------- | --------------------------------- | -------------------------------------------------- |\r
| Retool / Appsmith / Budibase (low-code internal tools)   | US$ 10.000 – 50.000/ano           | Licenciamento self-hosted, empresa média, mais add-ons por módulo |\r
| SaaS vertical B2B com mapa + mensageria + multi-tenant    | R$ 800 – 6.000/mês por empresa    | Ex.: plataformas de gestão de campo/field service, varia com geocodificação e storage |\r
| Venda de código-fonte "white-label" (ERP/CRM modular)     | R$ 80.000 – 400.000               | Mercado brasileiro, depende de exclusividade, suporte e handover |\r
\r
## Custo operacional mensal por cliente (ainda sem lucro)\r
\r
A tabela abaixo é **custo**, não preço de venda. A linha "suporte e\r
monitoramento" é operação (SRE, SLA, atualização), **não é lucro** — o lucro\r
é aplicado depois, na seção seguinte.\r
\r
| Item                                    | Custo mensal (R$) | Observação                                                        |\r
| ---------------------------------------- | ------------------: | ------------------------------------------------------------------ |\r
| Servidor de aplicação (PHP+Node+nginx)  |          400 – 900 | VPS robusta (4–8 vCPU) para suportar WebSocket do chat + CI4       |\r
| Banco de dados dedicado (MySQL)         |          300 – 800 | Por cliente/instância, com backup automatizado                    |\r
| Fileserver pesado (uploads/anexos)      |        300 – 1.200 | Áudio/vídeo/Office/PDF, cresce com Chat/Timeline/Messages/Calendar |\r
| APIs de mapa (ORS + Nominatim/ViaCEP)   |          150 – 500 | ORS tem limite de taxa; acima do free tier exige plano pago ou self-host |\r
| Chaves, licenças, domínio e e-mail      |          150 – 500 | Domínio + SSL, e-mail transacional (SMTP), chaves de API (ORS, geocodificação) e licenças de terceiros; as bibliotecas do projeto são open source (sem licença por cliente) |\r
| Reserva para IA (uso futuro)            |        300 – 1.000 | Tokens de LLM para automações futuras (sugestão de preenchimento, triagem) |\r
| Suporte e monitoramento (operação)      |          400 – 900 | SRE básico, atualização de dependências, SLA                      |\r
| **Custo operacional total por cliente** |  **2.000 – 5.800** | Varia com volume de uso (mensagens, geocodificação, storage). Valores são estimativas de mercado, não cotação de fornecedor |\r
\r
## Lucro — benchmark de mercado (pesquisa em 2026-10-12)\r
\r
Pesquisa sobre precificação SaaS (*cost-plus pricing*), para responder\r
diretamente: **o custo acima não cobre lucro — é só custo operacional.** O\r
markup é aplicado em cima dele, pela fórmula padrão de mercado:\r
\r
\`\`\`\r
Preço de venda = Custo × (1 + markup%)\r
\`\`\`\r
\r
| Perfil de empresa                              | Markup recomendado | Margem bruta equivalente |\r
| ------------------------------------------------ | -------------------: | --------------------------: |\r
| Startup em crescimento agressivo / ganho de mercado | 15 – 20%           | —                            |\r
| **Empresa madura e lucrativa, produto consolidado** (nosso caso) | **30 – 50%** | — |\r
| SaaS multi-tenant raso (1 servidor para milhares de clientes) | 200 – 900%  | 70 – 90%                     |\r
| Benchmark geral da indústria SaaS                | —                     | 70 – 80% sobre o preço de venda |\r
\r
Não aplicamos o markup de 200–900% (linha "SaaS raso") porque este sistema\r
tem custo marginal mais alto por cliente — banco e fileserver dedicados, não\r
multi-tenant raso. O markup correto aqui é o de "empresa madura".\r
\r
**Decisão aplicada neste documento:** markup de **50% no cenário padrão** e\r
**100% no cenário de necessidade extrema** (urgência do cliente,\r
exclusividade pedida, SLA crítico, pouca concorrência no fechamento).\r
\r
Fontes: [PayPro Global — Cost-plus pricing em SaaS](https://payproglobal.com/how-to/implement-cost-plus-pricing/), [Withorb — Cost-based pricing in SaaS](https://withorb.com/blog/cost-based-pricing).\r
\r
## Memória de cálculo — SaaS mensal (custo + lucro)\r
\r
| Cenário                        | Custo mensal (R$) | Markup | Preço final (R$) |\r
| -------------------------------- | -------------------: | -------: | ------------------: |\r
| Leve (uso baixo)                |              2.000 |    50% |          **3.000** |\r
| Leve (uso baixo, extremo)       |              2.000 |   100% |          **4.000** |\r
| Pesado (uso intenso)            |              5.800 |    50% |          **8.700** |\r
| Pesado (uso intenso, extremo)   |              5.800 |   100% |         **11.600** |\r
\r
**Faixa final de venda: R$ 3.000 – 11.600/mês**, dependendo do porte do\r
cliente (custo) e da situação de negociação (markup 50% ou 100%). O valor de\r
R$ 3.500–5.000/mês citado na resposta anterior ao usuário já está **dentro**\r
dessa faixa — era o preço de um cliente de porte médio/pesado com markup\r
próximo de 50%, mas sem o lucro explícito.\r
\r
## Memória de cálculo — venda de código-fonte (custo + lucro)\r
\r
A compra também **dilui no preço** os custos de colocar o sistema no ar: implantação e **12 meses de operação\r
assistida** (infraestrutura, banco, fileserver, APIs, chaves, licenças, suporte), calculados com o mesmo custo\r
operacional mensal da seção SaaS (R$ 2.000 – 5.800).\r
\r
| Etapa                                             | Valor (R$)               |\r
| --------------------------------------------------- | -------------------------: |\r
| Custo de desenvolvimento por módulo (9 módulos)     | 15.000 – 20.000 cada      |\r
| **Custo total de desenvolvimento**                  | **135.000 – 180.000**     |\r
| Implantação + 12 meses de operação assistida (12 × 2.000 – 5.800) | 24.000 – 69.600 |\r
| **Custo total da compra (desenvolvimento + operação)** | **159.000 – 249.600**  |\r
| Preço com markup 50% (padrão)                       | **238.500 – 374.400**     |\r
| Preço com markup 100% (extremo)                     | 318.000 – 499.200         |\r
| Faixa de mercado comparável (white-label)           | 250.000 – 350.000         |\r
\r
A faixa de mercado comparável cai dentro do cruzamento dos preços com markup\r
50–100% sobre o custo real — confirma que a faixa já embute lucro saudável,\r
não é preço "na marra" nem subavaliado. A faixa de mercado (preço de venda\r
observado) já inclui, por definição, a margem de quem vende — não é cost-plus\r
puro, mas bate com o cálculo cost-plus.\r
\r
## Ressalva\r
\r
Esta é uma estimativa de mercado, de uso interno para planejamento de\r
proposta — não é uma proposta comercial fechada, e as expressões "teto" ou\r
"máximo" não devem ser repassadas ao cliente (ver nota no início deste\r
documento). Valores reais dependem de negociação, exclusividade, SLA e\r
volume real de uso de cada cliente.\r
\r
[\`README.md\`](../README.md)\r
`;export{e as default};
