const a=`[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
# Pasta \`diagramas\` — diagramas vetoriais das telas\r
\r
Um diagrama por tela: o caminho completo que uma requisição percorre para\r
construir aquela tela — do boot do SPA até as tabelas do banco — com os nomes\r
reais dos arquivos em cada camada e subcamada. Serve para onboarding, revisão de\r
arquitetura e para explicar uma tela sem abrir o código.\r
\r
**Este documento é o método, não um diagrama.** Ele vale para qualquer página do\r
sistema, agora e com mil telas publicadas: cada diagrama é independente, porque\r
cada tela tem os seus próprios componentes, regras e modelo de negócio. Nenhuma\r
seção abaixo é ancorada em um módulo — os conjuntos já publicados aparecem\r
somente na seção 8, como exemplo, e podem ser trocados sem tocar no resto.\r
\r
## 1. Convenção de nomes\r
\r
| Artefato    | Nome                            | Papel                                                                                                            |\r
| ----------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |\r
| SVG         | \`README_diagrama_<tela>.svg\`    | **visualizar**: vetor autocontido, abre no VS Code e no navegador, imprime em PDF e entra em markdown por imagem |\r
| drawio      | \`README_diagrama_<tela>.drawio\` | **editar**: arrastar, recolorir e acrescentar caixas sem mexer em coordenada                                     |\r
| este README | \`README.md\`                     | método, métricas, validação e prompt                                                                             |\r
\r
\`<tela>\` é um slug curto e estável derivado da rota (a rota\r
\`/v1/<grupo>/<recurso>\` vira \`<grupo>_<recurso>\`). Os dois artefatos saem do\r
**mesmo modelo de dados**: mudou um, o outro é regerado — senão eles divergem.\r
\r
Onde publicar:\r
\r
- os artefatos, nesta pasta (\`src/app/markdown/geral/diagramas/\`);\r
- no markdown do módulo da tela, embutir a imagem com caminho **relativo** e, ao\r
  lado, um link para abrir em tamanho real (o preview reduz o SVG para a largura\r
  da janela);\r
- a legenda da imagem **não** deve conter parênteses.\r
\r
## 2. Estrutura invariante de todo diagrama\r
\r
O que não muda de tela para tela:\r
\r
1. **Cabeçalho** — título, uma frase com o caminho da requisição e a legenda de cores.\r
2. **Pilha de camadas** — camadas numeradas de cima para baixo, na ordem real da\r
   requisição, com rótulo colorido à esquerda e caixa de conteúdo à direita.\r
3. **Subcamadas** — dentro de cada camada, caixas tracejadas com título em\r
   maiúsculas e os nomes reais dos arquivos.\r
4. **Separadores** — faixa indicando FRONTEND (SPA) e BACKEND (API).\r
5. **Fronteira HTTP** — faixa destacada entre os services do frontend e a entrada\r
   do backend, com método/rota e o cabeçalho de autorização.\r
6. **Setas verticais rotuladas** entre as camadas — o que passa de uma para a outra.\r
7. **Raias de fluxo** — colunas verticais com os fluxos concretos da tela, um\r
   passo por caixa, e cada passo terminando na classe ou na tabela de destino.\r
\r
O conteúdo muda por tela; a espinha é sempre essa.\r
\r
## 3. Roteiro da análise\r
\r
Vale para qualquer página, sem pular camada:\r
\r
1. **URL para página** — achar o path nas rotas do frontend e a página que entra\r
   por \`lazy import\`.\r
2. **Página para componentes** — tudo o que a página importa de verdade:\r
   componentes próprios, modais e os globais/de UI.\r
3. **Componentes para services** — cada chamada real, com o seu service e o seu\r
   endpoint.\r
4. **Frontend para backend** — grupo de rotas → arquivo de rotas → filtro →\r
   Controller → Request → Processor/Service → Model.\r
5. **Model para banco** — a view ou as tabelas de destino e os arquivos em disco.\r
6. **Tabelas de apoio** — as de infraestrutura do sistema (navegação, formulários,\r
   listagens, rotas, usuários).\r
7. **Fluxos concretos** — leitura, mídia, escrita e ações especiais, cada uma com\r
   endpoint e classe de destino.\r
\r
Regra de ouro: **todo nome no diagrama tem que existir no repositório**. Se a\r
documentação do módulo divergir do código, o código manda.\r
\r
## 4. Como executar\r
\r
1. **Plano antes de tudo** — apresentar o plano em texto e aguardar autorização.\r
2. **Registrar o plano** — \`AAAAMMDDHHMMSS_titulo_plano.json\` e um\r
   \`..._no_plano.json\` por ação, em \`C:\\laragon\\www\\Claude\\plano\\\`.\r
3. **Gerar por script, não à mão** — um gerador **descartável, fora do\r
   repositório**, com um modelo de dados único que emite o SVG e o \`.drawio\` com\r
   a mesma geometria. Com muitas camadas, coordenada escrita à mão erra.\r
4. **Conferir visualmente** antes de entregar — topo e fim do arquivo.\r
5. **Substituir o artefato anterior** (se houver) só depois de validar o novo e\r
   com autorização.\r
\r
Formato **proibido**: HTML com caixas em \`div\`/CSS, ASCII art, lista em texto,\r
mermaid ou imagem raster. O que se entrega é vetor (SVG) + editável (drawio).\r
\r
## 5. Métricas de layout\r
\r
Calibradas nos diagramas já publicados; mantê-las dá o mesmo acabamento.\r
\r
| Item             | Regra                                                                             |\r
| ---------------- | --------------------------------------------------------------------------------- |\r
| Largura de texto | monospace ≈ \`0,6 x font-size\` por caractere — evita texto estourando a caixa      |\r
| Altura de linha  | 17 px para fonte de 12,5 nas listas de arquivos                                   |\r
| Subcaixa         | \`12 + 17 x (linhas - 1) + 12\`, borda tracejada e título em maiúsculas             |\r
| Camada           | \`12 + soma das subcaixas (+ 8 entre elas) + 12\`, rótulo colorido da mesma altura  |\r
| Conector         | 40 px entre camadas, seta centrada na coluna de conteúdo e rótulo ao lado da seta |\r
| Cores            | uma por grupo de camada, com legenda no topo                                      |\r
| Raias de fluxo   | uma coluna por fluxo, um passo por caixa, seta curta entre os passos              |\r
| Texto            | português técnico, sem emoji e sem ícone dentro do desenho                        |\r
\r
## 6. Validação obrigatória e armadilhas\r
\r
Antes de dizer "pronto":\r
\r
1. **XML bem formado** nos dois artefatos.\r
2. **Zero referência externa** (\`href="http\`, \`src="http\`, \`url(http\`) — o\r
   \`xmlns\` do SVG é namespace e não conta.\r
3. **Conferência visual** de todas as seções, inclusive o fim. SVG alto não se\r
   confere por captura comum: ajustar \`viewBox\` + \`width\`/\`height\` e capturar com\r
   \`clip\`.\r
4. **Relatório final** — arquivos criados, convenção adotada, lacunas\r
   encontradas e o que foi validado.\r
\r
Armadilhas já pagas:\r
\r
- Quadros em \`div\`/CSS **não** são diagrama.\r
- Seta em SVG exige \`<marker>\` declarado em \`<defs>\`; \`marker-end\` sozinho não\r
  desenha a ponta.\r
- Sem medir o texto, caixa e conteúdo desalinham — e o erro só aparece na\r
  conferência visual.\r
- Parênteses na legenda da imagem (\`![...]\`) atrapalham o parser do markdown.\r
- Um modelo de dados por artefato gera divergência entre o SVG e o \`.drawio\`.\r
- Documentação de módulo pode estar desatualizada em relação ao código.\r
\r
## 7. Como pedir (prompt)\r
\r
Cole o bloco abaixo trocando \`<URL_DA_TELA>\`. Ele pede a análise completa **e** o\r
gráfico correspondente, no mesmo padrão dos exemplos publicados.\r
\r
\`\`\`json\r
{\r
  "nome": "diagrama-vetorial-de-tela",\r
  "versao": "1.1",\r
  "criado_em": "2026-09-29",\r
  "quando_usar": "Sempre que eu pedir o diagrama de camadas/fluxo de uma tela, no padrao da pasta src/app/markdown/geral/diagramas.",\r
  "template_de_pedido": "Gere o diagrama vetorial da tela <URL_DA_TELA> seguindo o metodo de src/app/markdown/geral/diagramas/README.md e executando o prompt JSON da secao 7.",\r
  "prompt": {\r
    "papel": "Engenheiro de software que documenta arquitetura em diagrama vetorial legivel, sem inventar nada.",\r
    "tarefa": "Levantar no codigo-fonte TODAS as camadas e subcamadas da requisicao que constroi a tela <URL_DA_TELA> e entregar um diagrama vetorial no padrao da pasta src/app/markdown/geral/diagramas.",\r
    "entradas": {\r
      "tela": "<URL_DA_TELA, ex.: http://localhost:54910/v1/<grupo>/<recurso>>",\r
      "repositorio": "c:\\\\laragon\\\\www\\\\js\\\\habilidade\\\\projeto54900",\r
      "pasta_de_saida": "src/app/markdown/geral/diagramas",\r
      "documentacao_de_apoio": [\r
        "src/app/markdown/geral/**",\r
        "src/frontend/projeto54900/src/markdown/geral/**"\r
      ],\r
      "referencia_de_qualidade": "os artefatos ja publicados na pasta de saida (mesmo nome base em .svg e .drawio)"\r
    },\r
    "processo_obrigatorio": [\r
      "1. Resolver a URL nas rotas do frontend (src/frontend/projeto54900/src/routes/**) e achar a pagina pelo lazy import.",\r
      "2. Listar TODOS os componentes usados pela pagina: modais, componentes globais e componentes de UI.",\r
      "3. Listar os services do frontend chamados e o endpoint de cada chamada (services/v1/*.table.ts | *.view.ts | *.upload.ts).",\r
      "4. No backend, seguir rota -> EndpointTable/EndPointView/EndpointUpload -> filtro -> Controller -> Request -> Processor/Service -> Model -> view/tabela.",\r
      "5. Listar tabelas de apoio (navegacao, formularios, listagens, rotas, usuarios) e arquivos em disco (writable/uploads/**).",\r
      "6. Descrever os fluxos concretos da tela (leitura, midia, escrita, acoes especiais) com endpoint e classe de destino de cada passo.",\r
      "7. Apresentar o plano em texto e AGUARDAR autorizacao explicita antes de criar qualquer arquivo.",\r
      "8. Depois do sim, registrar o plano em C:\\\\laragon\\\\www\\\\Claude\\\\plano (AAAAMMDDHHMMSS_titulo_plano.json + um _no_plano.json por acao) e so entao executar."\r
    ],\r
    "formato_de_saida": {\r
      "principal": "SVG vetorial puro: viewBox + width/height, rect/line/text, setas com marker em defs, autocontido, sem CDN e sem build.",\r
      "secundario": "arquivo .drawio (mxGraphModel) com o MESMO conteudo, gerado do mesmo modelo de dados.",\r
      "nomes": "README_diagrama_<tela>.svg e README_diagrama_<tela>.drawio na pasta de saida.",\r
      "proibido": "HTML com divs/CSS, ASCII art, lista em texto, mermaid ou imagem raster. Se o pedido nao disser o formato, perguntar antes de gerar."\r
    },\r
    "estrutura_obrigatoria": {\r
      "cabecalho": "titulo, frase de uma linha com o caminho da requisicao e legenda de cores no topo.",\r
      "secao_1": "pilha vertical das camadas numeradas (0..N): rotulo colorido a esquerda e caixa de conteudo a direita.",\r
      "subcamadas": "dentro de cada camada, subcaixas tracejadas com titulo em maiusculas e os nomes REAIS dos arquivos.",\r
      "separadores": "faixas cinzas separando FRONTEND (SPA React/Vite) de BACKEND (API CodeIgniter).",\r
      "fronteira": "faixa destacada entre os services do frontend e a entrada HTTP do backend, com metodo/rota/Authorization.",\r
      "setas": "seta vertical entre cada camada com rotulo curto do que passa (ex.: 'chama os services da v1').",\r
      "secao_2": "raias verticais dos fluxos concretos: um passo por caixa, seta para o proximo, ultimo passo sempre na classe PHP ou na tabela de destino."\r
    },\r
    "regras_de_layout": [\r
      "Medir largura de texto (monospace = 0,6 x font-size por caractere) e nunca deixar texto estourar a caixa.",\r
      "Uma cor por grupo de camada, fundo neutro, caixa branca e traco fino.",\r
      "Rotulo de fluxo ao lado da seta, nunca sobre a caixa.",\r
      "Caminhos relativos a raiz declarada (frontend/ e app/), nunca caminho absoluto de disco no desenho.",\r
      "Sem emoji e sem icone dentro do diagrama; portugues tecnico e direto."\r
    ],\r
    "validacao_obrigatoria": [\r
      "Parsear os dois arquivos como XML (deve terminar sem erro).",\r
      "Conferir zero referencia externa (href= ou src= com http); o xmlns do SVG nao conta.",\r
      "Abrir o SVG e conferir visualmente TODAS as secoes, inclusive o fim de um SVG alto (ajustar viewBox + width/height e capturar com clip).",\r
      "Reportar ao final: arquivos criados, convencao adotada, lacunas encontradas e o que foi validado."\r
    ],\r
    "nao_fazer": [\r
      "Nao inventar arquivo, rota, classe ou tabela: todo nome do diagrama tem que existir no repositorio.",\r
      "Nao usar Composer/vendor e nao tocar em pastas de nucleo ou de sistema.",\r
      "Nao escrever em banco; leitura de schema so com autorizacao explicita.",\r
      "Nao entregar SVG e drawio com conteudo divergente.",\r
      "Nao alterar codigo do sistema para 'facilitar' o diagrama."\r
    ],\r
    "criterios_de_aceite": [\r
      "A analise cobre frontend e backend sem pular camada.",\r
      "Cada nome do desenho existe no repositorio.",\r
      "Os dois artefatos abrem (SVG no navegador, drawio no draw.io) e tem o mesmo conteudo.",\r
      "O relatorio final diz o que foi validado e o que ficou em lacuna."\r
    ]\r
  }\r
}\r
\`\`\`\r
\r
## 8. Exemplos publicados\r
\r
Não fazem parte do método: são o padrão de acabamento a repetir. Cada linha é um\r
conjunto independente — trocar por outra tela não exige mexer em nenhuma seção\r
acima.\r
\r
| Tela                                | SVG (visualizar)                                                                                 | drawio (editar)                                                                                    |\r
| ----------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |\r
| \`/v1/timeline\` (Home Feed)          | [\`README_diagrama_timeline_home_feed.svg\`](README_diagrama_timeline_home_feed.svg)               | [\`README_diagrama_timeline_home_feed.drawio\`](README_diagrama_timeline_home_feed.drawio)           |\r
| \`/v1/calendar-manager\`              | [\`README_diagrama_calendar_manager.svg\`](README_diagrama_calendar_manager.svg)                   | [\`README_diagrama_calendar_manager.drawio\`](README_diagrama_calendar_manager.drawio)               |\r
| \`/v1/chat-rooms-manager/create\`     | [\`README_diagrama_chat_rooms_manager_create.svg\`](README_diagrama_chat_rooms_manager_create.svg) | [\`README_diagrama_chat_rooms_manager_create.drawio\`](README_diagrama_chat_rooms_manager_create.drawio) |\r
| Módulo Map (visão geral em quadros) | [\`README_diagrama_map_modulo.svg\`](README_diagrama_map_modulo.svg)                               | [\`README_diagrama_map_modulo.drawio\`](README_diagrama_map_modulo.drawio)                               |\r
\r
![Diagrama de camadas da tela /v1/timeline - Home Feed](README_diagrama_timeline_home_feed.svg)\r
\r
*14 camadas, faixa de fronteira HTTP e 4 raias de fluxo. O preview reduz a imagem para a largura da janela — [abrir o SVG em tamanho real](README_diagrama_timeline_home_feed.svg).*\r
\r
![Diagrama de camadas da tela /v1/chat-rooms-manager/create - Nova Sala de Chat](README_diagrama_chat_rooms_manager_create.svg)\r
\r
*13 camadas, faixa de fronteira HTTP e 4 raias de fluxo. O preview reduz a imagem para a largura da janela — [abrir o SVG em tamanho real](README_diagrama_chat_rooms_manager_create.svg).*\r
\r
[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
### 📌 Metadados do Autor\r
\r
| Campo               | Informação                                                                                                                   |\r
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |\r
| **Nome**            | Gustavo Hammes                                                                                                               |\r
| **Local**           | Rio de Janeiro                                                                                                               |\r
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |\r
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |\r
`;export{a as default};
