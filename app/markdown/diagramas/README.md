[◄ Índice da base de conhecimento](../README.md)

---

# Pasta `diagramas` — diagramas vetoriais das telas

Um diagrama por tela: o caminho completo que uma requisição percorre para
construir aquela tela — do boot do SPA até as tabelas do banco — com os nomes
reais dos arquivos em cada camada e subcamada. Serve para onboarding, revisão de
arquitetura e para explicar uma tela sem abrir o código.

**Este documento é o método, não um diagrama.** Ele vale para qualquer página do
sistema, agora e com mil telas publicadas: cada diagrama é independente, porque
cada tela tem os seus próprios componentes, regras e modelo de negócio. Nenhuma
seção abaixo é ancorada em um módulo — os conjuntos já publicados aparecem
somente na seção 8, como exemplo, e podem ser trocados sem tocar no resto.

## 1. Convenção de nomes

| Artefato    | Nome                            | Papel                                                                                                            |
| ----------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| SVG         | `README_diagrama_<tela>.svg`    | **visualizar**: vetor autocontido, abre no VS Code e no navegador, imprime em PDF e entra em markdown por imagem |
| drawio      | `README_diagrama_<tela>.drawio` | **editar**: arrastar, recolorir e acrescentar caixas sem mexer em coordenada                                     |
| este README | `README.md`                     | método, métricas, validação e prompt                                                                             |

`<tela>` é um slug curto e estável derivado da rota (a rota
`/v1/<grupo>/<recurso>` vira `<grupo>_<recurso>`). Os dois artefatos saem do
**mesmo modelo de dados**: mudou um, o outro é regerado — senão eles divergem.

Onde publicar:

- os artefatos, nesta pasta (`src/app/markdown/diagramas/`);
- no markdown do módulo da tela, embutir a imagem com caminho **relativo** e, ao
  lado, um link para abrir em tamanho real (o preview reduz o SVG para a largura
  da janela);
- a legenda da imagem **não** deve conter parênteses.

## 2. Estrutura invariante de todo diagrama

O que não muda de tela para tela:

1. **Cabeçalho** — título, uma frase com o caminho da requisição e a legenda de cores.
2. **Pilha de camadas** — camadas numeradas de cima para baixo, na ordem real da
   requisição, com rótulo colorido à esquerda e caixa de conteúdo à direita.
3. **Subcamadas** — dentro de cada camada, caixas tracejadas com título em
   maiúsculas e os nomes reais dos arquivos.
4. **Separadores** — faixa indicando FRONTEND (SPA) e BACKEND (API).
5. **Fronteira HTTP** — faixa destacada entre os services do frontend e a entrada
   do backend, com método/rota e o cabeçalho de autorização.
6. **Setas verticais rotuladas** entre as camadas — o que passa de uma para a outra.
7. **Raias de fluxo** — colunas verticais com os fluxos concretos da tela, um
   passo por caixa, e cada passo terminando na classe ou na tabela de destino.

O conteúdo muda por tela; a espinha é sempre essa.

## 3. Roteiro da análise

Vale para qualquer página, sem pular camada:

1. **URL para página** — achar o path nas rotas do frontend e a página que entra
   por `lazy import`.
2. **Página para componentes** — tudo o que a página importa de verdade:
   componentes próprios, modais e os globais/de UI.
3. **Componentes para services** — cada chamada real, com o seu service e o seu
   endpoint.
4. **Frontend para backend** — grupo de rotas → arquivo de rotas → filtro →
   Controller → Request → Processor/Service → Model.
5. **Model para banco** — a view ou as tabelas de destino e os arquivos em disco.
6. **Tabelas de apoio** — as de infraestrutura do sistema (navegação, formulários,
   listagens, rotas, usuários).
7. **Fluxos concretos** — leitura, mídia, escrita e ações especiais, cada uma com
   endpoint e classe de destino.

Regra de ouro: **todo nome no diagrama tem que existir no repositório**. Se a
documentação do módulo divergir do código, o código manda.

## 4. Como executar

1. **Plano antes de tudo** — apresentar o plano em texto e aguardar autorização.
2. **Registrar o plano** — `AAAAMMDDHHMMSS_titulo_plano.json` e um
   `..._no_plano.json` por ação, em `C:\laragon\www\Claude\plano\`.
3. **Gerar por script, não à mão** — um gerador **descartável, fora do
   repositório**, com um modelo de dados único que emite o SVG e o `.drawio` com
   a mesma geometria. Com muitas camadas, coordenada escrita à mão erra.
4. **Conferir visualmente** antes de entregar — topo e fim do arquivo.
5. **Substituir o artefato anterior** (se houver) só depois de validar o novo e
   com autorização.

Formato **proibido**: HTML com caixas em `div`/CSS, ASCII art, lista em texto,
mermaid ou imagem raster. O que se entrega é vetor (SVG) + editável (drawio).

## 5. Métricas de layout

Calibradas nos diagramas já publicados; mantê-las dá o mesmo acabamento.

| Item             | Regra                                                                             |
| ---------------- | --------------------------------------------------------------------------------- |
| Largura de texto | monospace ≈ `0,6 x font-size` por caractere — evita texto estourando a caixa      |
| Altura de linha  | 17 px para fonte de 12,5 nas listas de arquivos                                   |
| Subcaixa         | `12 + 17 x (linhas - 1) + 12`, borda tracejada e título em maiúsculas             |
| Camada           | `12 + soma das subcaixas (+ 8 entre elas) + 12`, rótulo colorido da mesma altura  |
| Conector         | 40 px entre camadas, seta centrada na coluna de conteúdo e rótulo ao lado da seta |
| Cores            | uma por grupo de camada, com legenda no topo                                      |
| Raias de fluxo   | uma coluna por fluxo, um passo por caixa, seta curta entre os passos              |
| Texto            | português técnico, sem emoji e sem ícone dentro do desenho                        |

## 6. Validação obrigatória e armadilhas

Antes de dizer "pronto":

1. **XML bem formado** nos dois artefatos.
2. **Zero referência externa** (`href="http`, `src="http`, `url(http`) — o
   `xmlns` do SVG é namespace e não conta.
3. **Conferência visual** de todas as seções, inclusive o fim. SVG alto não se
   confere por captura comum: ajustar `viewBox` + `width`/`height` e capturar com
   `clip`.
4. **Relatório final** — arquivos criados, convenção adotada, lacunas
   encontradas e o que foi validado.

Armadilhas já pagas:

- Quadros em `div`/CSS **não** são diagrama.
- Seta em SVG exige `<marker>` declarado em `<defs>`; `marker-end` sozinho não
  desenha a ponta.
- Sem medir o texto, caixa e conteúdo desalinham — e o erro só aparece na
  conferência visual.
- Parênteses na legenda da imagem (`![...]`) atrapalham o parser do markdown.
- Um modelo de dados por artefato gera divergência entre o SVG e o `.drawio`.
- Documentação de módulo pode estar desatualizada em relação ao código.

## 7. Como pedir (prompt)

Cole o bloco abaixo trocando `<URL_DA_TELA>`. Ele pede a análise completa **e** o
gráfico correspondente, no mesmo padrão dos exemplos publicados.

```json
{
  "nome": "diagrama-vetorial-de-tela",
  "versao": "1.1",
  "criado_em": "2026-09-29",
  "quando_usar": "Sempre que eu pedir o diagrama de camadas/fluxo de uma tela, no padrao da pasta src/app/markdown/diagramas.",
  "template_de_pedido": "Gere o diagrama vetorial da tela <URL_DA_TELA> seguindo o metodo de src/app/markdown/diagramas/README.md e executando o prompt JSON da secao 7.",
  "prompt": {
    "papel": "Engenheiro de software que documenta arquitetura em diagrama vetorial legivel, sem inventar nada.",
    "tarefa": "Levantar no codigo-fonte TODAS as camadas e subcamadas da requisicao que constroi a tela <URL_DA_TELA> e entregar um diagrama vetorial no padrao da pasta src/app/markdown/diagramas.",
    "entradas": {
      "tela": "<URL_DA_TELA, ex.: http://localhost:54910/v1/<grupo>/<recurso>>",
      "repositorio": "c:\\laragon\\www\\js\\habilidade\\projeto54900",
      "pasta_de_saida": "src/app/markdown/diagramas",
      "documentacao_de_apoio": [
        "src/app/markdown/geral/**",
        "src/frontend/projeto54900/src/markdown/geral/**"
      ],
      "referencia_de_qualidade": "os artefatos ja publicados na pasta de saida (mesmo nome base em .svg e .drawio)"
    },
    "processo_obrigatorio": [
      "1. Resolver a URL nas rotas do frontend (src/frontend/projeto54900/src/routes/**) e achar a pagina pelo lazy import.",
      "2. Listar TODOS os componentes usados pela pagina: modais, componentes globais e componentes de UI.",
      "3. Listar os services do frontend chamados e o endpoint de cada chamada (services/v1/*.table.ts | *.view.ts | *.upload.ts).",
      "4. No backend, seguir rota -> EndpointTable/EndPointView/EndpointUpload -> filtro -> Controller -> Request -> Processor/Service -> Model -> view/tabela.",
      "5. Listar tabelas de apoio (navegacao, formularios, listagens, rotas, usuarios) e arquivos em disco (writable/uploads/**).",
      "6. Descrever os fluxos concretos da tela (leitura, midia, escrita, acoes especiais) com endpoint e classe de destino de cada passo.",
      "7. Apresentar o plano em texto e AGUARDAR autorizacao explicita antes de criar qualquer arquivo.",
      "8. Depois do sim, registrar o plano em C:\\laragon\\www\\Claude\\plano (AAAAMMDDHHMMSS_titulo_plano.json + um _no_plano.json por acao) e so entao executar."
    ],
    "formato_de_saida": {
      "principal": "SVG vetorial puro: viewBox + width/height, rect/line/text, setas com marker em defs, autocontido, sem CDN e sem build.",
      "secundario": "arquivo .drawio (mxGraphModel) com o MESMO conteudo, gerado do mesmo modelo de dados.",
      "nomes": "README_diagrama_<tela>.svg e README_diagrama_<tela>.drawio na pasta de saida.",
      "proibido": "HTML com divs/CSS, ASCII art, lista em texto, mermaid ou imagem raster. Se o pedido nao disser o formato, perguntar antes de gerar."
    },
    "estrutura_obrigatoria": {
      "cabecalho": "titulo, frase de uma linha com o caminho da requisicao e legenda de cores no topo.",
      "secao_1": "pilha vertical das camadas numeradas (0..N): rotulo colorido a esquerda e caixa de conteudo a direita.",
      "subcamadas": "dentro de cada camada, subcaixas tracejadas com titulo em maiusculas e os nomes REAIS dos arquivos.",
      "separadores": "faixas cinzas separando FRONTEND (SPA React/Vite) de BACKEND (API CodeIgniter).",
      "fronteira": "faixa destacada entre os services do frontend e a entrada HTTP do backend, com metodo/rota/Authorization.",
      "setas": "seta vertical entre cada camada com rotulo curto do que passa (ex.: 'chama os services da v1').",
      "secao_2": "raias verticais dos fluxos concretos: um passo por caixa, seta para o proximo, ultimo passo sempre na classe PHP ou na tabela de destino."
    },
    "regras_de_layout": [
      "Medir largura de texto (monospace = 0,6 x font-size por caractere) e nunca deixar texto estourar a caixa.",
      "Uma cor por grupo de camada, fundo neutro, caixa branca e traco fino.",
      "Rotulo de fluxo ao lado da seta, nunca sobre a caixa.",
      "Caminhos relativos a raiz declarada (frontend/ e app/), nunca caminho absoluto de disco no desenho.",
      "Sem emoji e sem icone dentro do diagrama; portugues tecnico e direto."
    ],
    "validacao_obrigatoria": [
      "Parsear os dois arquivos como XML (deve terminar sem erro).",
      "Conferir zero referencia externa (href= ou src= com http); o xmlns do SVG nao conta.",
      "Abrir o SVG e conferir visualmente TODAS as secoes, inclusive o fim de um SVG alto (ajustar viewBox + width/height e capturar com clip).",
      "Reportar ao final: arquivos criados, convencao adotada, lacunas encontradas e o que foi validado."
    ],
    "nao_fazer": [
      "Nao inventar arquivo, rota, classe ou tabela: todo nome do diagrama tem que existir no repositorio.",
      "Nao usar Composer/vendor e nao tocar em pastas de nucleo ou de sistema.",
      "Nao escrever em banco; leitura de schema so com autorizacao explicita.",
      "Nao entregar SVG e drawio com conteudo divergente.",
      "Nao alterar codigo do sistema para 'facilitar' o diagrama."
    ],
    "criterios_de_aceite": [
      "A analise cobre frontend e backend sem pular camada.",
      "Cada nome do desenho existe no repositorio.",
      "Os dois artefatos abrem (SVG no navegador, drawio no draw.io) e tem o mesmo conteudo.",
      "O relatorio final diz o que foi validado e o que ficou em lacuna."
    ]
  }
}
```

## 8. Exemplos publicados

Não fazem parte do método: são o padrão de acabamento a repetir. Cada linha é um
conjunto independente — trocar por outra tela não exige mexer em nenhuma seção
acima.

| Tela                       | SVG (visualizar)                                                                   | drawio (editar)                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `/v1/timeline` (Home Feed) | [`README_diagrama_timeline_home_feed.svg`](README_diagrama_timeline_home_feed.svg) | [`README_diagrama_timeline_home_feed.drawio`](README_diagrama_timeline_home_feed.drawio) |
| `/v1/calendar-manager`     | [`README_diagrama_calendar_manager.svg`](README_diagrama_calendar_manager.svg)     | [`README_diagrama_calendar_manager.drawio`](README_diagrama_calendar_manager.drawio)     |

![Diagrama de camadas da tela /v1/timeline - Home Feed](README_diagrama_timeline_home_feed.svg)

*14 camadas, faixa de fronteira HTTP e 4 raias de fluxo. O preview reduz a imagem para a largura da janela — [abrir o SVG em tamanho real](README_diagrama_timeline_home_feed.svg).*

[◄ Índice da base de conhecimento](../README.md)

---

### 📌 Metadados do Autor

| Campo               | Informação                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Nome**            | Gustavo Hammes                                                                                                               |
| **Local**           | Rio de Janeiro                                                                                                               |
| **LinkedIn**        | [linkedin.com/in/gustavo-hammes](https://www.linkedin.com/in/gustavo-hammes)                                                 |
| **Stack principal** | PHP (Laravel, Symfony, Cake, Codeigniter), Java Spring Boot, JS/TS (React, Angular, Node.js), Mobile (React Native, Flutter) |
