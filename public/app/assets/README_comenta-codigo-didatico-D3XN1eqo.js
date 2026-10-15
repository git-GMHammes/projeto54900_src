const o=`[◄ Índice da base de conhecimento](../README.md)\r
\r
---\r
\r
# Comentar Código com Estilo Didático (React/TSX)\r
\r
> Adaptado de um roteiro equivalente usado em outro projeto (CakePHP + JS\r
> separados, "SAD v1/v1a"). Lá o HTML/PHP e o JS eram dois arquivos distintos\r
> que se conectavam por IDs e \`data-*\`. **Aqui não existe essa separação:** o\r
> componente \`.tsx\` já constrói o HTML (JSX) e a lógica no mesmo arquivo, e a\r
> "conexão" a documentar é entre **Page → hook → service → tipos → componente\r
> de campo**, não entre PHP e JS. A ideia (comentar em blocos, explicar o\r
> fluxo ponta a ponta, ensinar a replicar o padrão) é a mesma; os alvos foram\r
> remapeados para o stack real deste projeto (React + TypeScript + Vite).\r
\r
## Sumário\r
\r
0. [Alertas Críticos (LER ANTES DE QUALQUER COISA)](#0-alertas-críticos-ler-antes-de-qualquer-coisa)\r
1. [Objetivo Geral](#1-objetivo-geral)\r
2. [Regras Gerais (NÃO PULAR)](#2-regras-gerais-não-pular)\r
3. [Bloco A — Página (\`pages/v1/.../XPage.tsx\`)](#3-bloco-a--página-pagesv1xpagetsx)\r
4. [Bloco B — Camada Core (\`services/\`, \`hooks/\`, \`context/\`, \`utils/\`)](#4-bloco-b--camada-core-services-hooks-context-utils)\r
5. [Bloco C — Componente de Campo (\`components/ui/FormGrid/*\`)](#5-bloco-c--componente-de-campo-componentsuiformgrid)\r
6. [Checklist Consolidado de Qualidade](#6-checklist-consolidado-de-qualidade)\r
\r
---\r
\r
## 0. ⛔ ALERTAS CRÍTICOS (LER ANTES DE QUALQUER COISA)\r
\r
> Estes três alertas têm prioridade sobre qualquer outra seção deste\r
> arquivo. Uma IA que for aplicar este README precisa ler este bloco\r
> **primeiro**, mesmo que já conheça o resto do documento — e mesmo que\r
> não tenha acesso ao CLAUDE.md global do projeto.\r
\r
### 0.1 — Este README é sobre COMENTAR, nunca sobre corrigir/alterar código\r
\r
Esta tarefa é **documentação, não manutenção**. Ao seguir este roteiro:\r
\r
- **NUNCA** alterar lógica, corrigir bug, renomear variável, "melhorar"\r
  performance ou mexer em JSX/estrutura — nem "já que abri o arquivo".\r
- Encontrou algo errado (bug, tipo inconsistente, débito técnico)? **Não\r
  mexer.** Registrar o achado à parte na resposta ao usuário (arquivo/linha\r
  + 1-2 frases) e tratar como **tarefa nova, com seu próprio plano e\r
  autorização explícita** — nunca dentro do mesmo diff de comentários.\r
  Detalhes em [seção 2](#2-regras-gerais-não-pular).\r
\r
### 0.2 — \`*/\` dentro de um comentário QUEBRA o comentário — nunca escrever isso\r
\r
Comentários deste projeto usam o formato TSDoc \`/** ... */\`. **Não existe\r
escape para \`*/\` dentro de um bloco \`/** */\`** — o TypeScript/JS fecha o\r
comentário no primeiro \`*/\` que encontrar, não importa a intenção de quem\r
escreveu.\r
\r
Isso já causou um erro real: ao documentar uma rota, uma IA escreveu, no\r
meio de um bloco de comentário, o texto \`form-*/create\` (querendo dizer\r
"endpoint \`form-<recurso>\` seguido de \`/create\`"). O \`*/\` no meio da frase\r
fechou o comentário ali mesmo, e todo o texto seguinte passou a ser\r
interpretado como **código**, quebrando o arquivo inteiro\r
(\`formBuilder.model.ts\`).\r
\r
**Regra prática:** antes de escrever qualquer barra \`/\` dentro de um bloco\r
de comentário, checar se o caractere imediatamente anterior é um asterisco\r
\`*\`. Se for, **não escrever isso literalmente** — reformular a frase.\r
\r
\`\`\`tsx\r
// ERRADO — fecha o comentário no meio da frase, quebra o arquivo:\r
/**\r
 * Rota: POST form-*/create\r
 */\r
\r
// CERTO — reformular para não colocar "*" logo antes de "/":\r
/**\r
 * Rota: POST form-<recurso>/create\r
 * (ou: "Rota: POST /form/{recurso}/create")\r
 */\r
\`\`\`\r
\r
Depois de comentar, **sempre reabrir o arquivo (ou checar o editor/lint) e\r
confirmar que o comentário não fechou antes da hora**. Sinal típico: trecho\r
que deveria estar dentro do \`/** ... */\` aparece destacado como código ou\r
como erro de sintaxe.\r
\r
### 0.3 — Antes de criar, editar ou excluir qualquer arquivo: PLANO primeiro\r
\r
Regra herdada do fluxo obrigatório deste computador (CLAUDE.md global) —\r
copiada aqui porque uma IA "fraca" pode não ter acesso a esse arquivo, mas\r
vai ler este README antes de comentar código:\r
\r
1. **Propor o plano em texto** antes de tocar em qualquer arquivo: título,\r
   objetivo, passos planejados, critério de sucesso, rollback (quando\r
   aplicável), riscos/observações.\r
2. **Aguardar autorização explícita** do usuário ("sim" ou equivalente).\r
   Sem isso, não criar, editar nem excluir nada.\r
3. Só depois de autorizado, executar.\r
\r
Isso vale mesmo quando a tarefa "parece pequena" (ex.: só adicionar\r
comentários) — um comentário mal formado, como o caso do \`*/\` do item 0.2,\r
pode quebrar o arquivo inteiro.\r
\r
### 0.4 — Nunca usar emoji/ícone DENTRO do texto de um comentário de código\r
\r
Comentário de código (\`/** ... */\`, \`// ...\`) é texto técnico, não interface\r
visual. **Não usar emoji nem ícone decorativo no texto do comentário** (ex.:\r
\`✏️\` para "editar", \`🗑\` para "remover", \`[+]\` como substituto de "adicionar").\r
Escrever a palavra por extenso.\r
\r
\`\`\`tsx\r
// ERRADO:\r
/** Ações opcionais (✏️ editar, [+] adicionar filho, 🗑 remover). */\r
\r
// CERTO:\r
/** Ações opcionais (botão Editar, botão Adicionar filho, botão Remover). */\r
\`\`\`\r
\r
**Isso NÃO tem relação com os ícones reais de UI** (\`<i className="bi-pencil-square" />\`\r
e afins, do Bootstrap Icons) usados no JSX dos botões — esses continuam\r
normalmente, são parte da interface, não do comentário. A regra é só sobre o\r
texto que documenta o código.\r
\r
---\r
\r
## 1. Objetivo Geral\r
\r
Adicionar comentários **didáticos, em blocos, explicando cada conjunto de\r
variáveis, funções, hooks e componentes**, de forma que um **dev júnior** (ou\r
uma IA de baixo nível) entenda: o propósito de cada arquivo, como ele se\r
conecta com os demais (página ↔ hook ↔ service ↔ tipos ↔ componente de\r
campo), como os dados fluem do clique do usuário até a API e de volta, e\r
consiga **replicar o padrão em uma página/componente novo**. Comentários em\r
**BLOCOS**, nunca linha a linha; agrupar variáveis, funções e hooks\r
relacionados num mesmo bloco.\r
\r
---\r
\r
## 2. Regras Gerais (NÃO PULAR)\r
\r
1. **Incluir SEMPRE no cabeçalho do arquivo:** (a) propósito geral, (b)\r
   dependências que consome (imports próprios do projeto, não libs externas\r
   óbvias como \`react\`), (c) quais outros arquivos/páginas o consomem, (d)\r
   passo a passo para criar algo similar.\r
2. **Comentar em BLOCOS**, nunca linha a linha. Agrupar hooks de estado,\r
   funções auxiliares e handlers relacionados num mesmo bloco.\r
3. **Conectar os arquivos entre si** — mostrar o fluxo ponta a ponta (ex.:\r
   como a \`Page\` chama \`useApi(() => service.getAll(...))\`, como o \`schema\`\r
   de \`<FormGrid>\` vira \`<input>\` renderizado por \`CpfField\`/\`SelectField\`,\r
   como o \`FormData\` do submit vira o \`payload\` enviado a \`service.create()\`).\r
4. **Manter comentários existentes que fizerem sentido**; remover os que\r
   forem substituídos pelos blocos maiores.\r
5. **Não reformatar código** — só adicionar/remover comentários. Nunca\r
   alterar lógica, nomes de variáveis/props, tipos ou estrutura JSX.\r
6. **Preservar nomenclatura e convenções** do projeto (arquivo/pasta/variável\r
   sempre em inglês; comentário e texto visível ao usuário em português —\r
   ver [\`paginas\`](README_paginas_modulo.md); \`interface XxxSchema\` +\r
   \`export function XxxField\` nos componentes de campo).\r
7. **Nunca adicionar comentários inline** (ao lado do código) — sempre em\r
   bloco acima, no formato TSDoc (\`/** ... */\`).\r
8. **JSX não leva bloco de comentário por linha de markup.** Comentar a\r
   *intenção* de uma seção do JSX (ex.: "bloco do formulário do grupo",\r
   "estado vazio/erro/loading") com um único comentário curto acima da seção,\r
   não uma linha por tag.\r
9. **Escopo é só comentário — nunca corrigir bug nem "melhorar" código nesta\r
   tarefa.** Ler o arquivo inteiro para comentar frequentemente revela bug\r
   real, inconsistência ou oportunidade de refactor. Não corrigir ali: essa\r
   mistura (documentação + correção no mesmo diff) dificulta revisão e viola\r
   o princípio de menor mudança possível. Ver procedimento abaixo.\r
\r
### Bugs e melhorias encontrados durante a comentagem\r
\r
Encontrou algo que não é só "falta de comentário" (bug, inconsistência entre\r
tipos, condição que parece errada, débito técnico)?\r
\r
1. **Não alterar o código nesta tarefa** — nem "já que estou aqui".\r
2. **Registrar o achado à parte**, na resposta ao usuário (não como\r
   comentário TODO/FIXME dentro do código, para não confundir achado com\r
   documentação permanente) — descrever o arquivo/linha e o problema em 1-2\r
   frases.\r
3. Corrigir só depois, como **tarefa nova e separada**, com seu próprio plano\r
   e autorização explícita — nunca dentro do mesmo diff de comentários.\r
\r
---\r
\r
## 3. Bloco A — Página (\`pages/v1/.../XPage.tsx\`)\r
\r
> Aplica-se a **qualquer página** que segue a convenção\r
> \`pages/v1/<modulo>/<recurso>/<Acao>Page.tsx\` (ver\r
> [\`paginas\`](README_paginas_modulo.md)). \`FormConstructorPage.tsx\` é um bom\r
> modelo de referência: reúne carregamento de dados, submit para API e\r
> feedback ao usuário no mesmo arquivo — o equivalente ao antigo par\r
> PHP+JS, só que em um único componente \`.tsx\`.\r
\r
### Passo 1 — Ler o arquivo COMPLETO antes de comentar\r
\r
Identificar, antes de escrever qualquer bloco: quais hooks de estado existem\r
(\`useState\`), quais vêm de hooks de projeto (\`useApi\`, \`useToast\`,\r
\`usePagination\`), quais services são chamados (\`@/services/v1/*\` ou\r
\`@/services/http\`), quais componentes de UI são usados (\`FormGrid\`,\r
\`DataTable\`, \`PageHeader\`, \`LoadingOverlay\`, \`EmptyState\`) e qual é o\r
\`return\` (JSX) que amarra tudo isso na tela.\r
\r
### Passo 2 — Blocos de conteúdo de uma página\r
\r
| #   | Bloco                                       | Descrição                                                                          |\r
| --- | ------------------------------------------- | ---------------------------------------------------------------------------------- |\r
| 1   | **File Header**                             | Propósito da página, rota que a monta, dependências, passo a passo para replicar   |\r
| 2   | **Constantes de Módulo**                    | Valores fixos fora do componente (ex.: \`CONSTRUCTOR_SLUG\`, mapas \`Record<...>\`)    |\r
| 3   | **Funções Auxiliares (fora do componente)** | Transformações puras (ex.: \`formDataToPayload\`) reaproveitáveis sem estado         |\r
| 4   | **Estado do Componente**                    | Todos os \`useState\`/hooks de projeto declarados no topo do componente, em conjunto |\r
| 5   | **Carregamento de Dados**                   | \`useCallback\`/\`useEffect\` que chama o service e popula o estado (o \`load()\`)       |\r
| 6   | **Handlers de Ação**                        | Funções que respondem a evento do usuário (submit, clique, reload)                 |\r
| 7   | **Tratamento de Erro/Feedback**             | Como \`ApiError\` vira mensagem de \`toast\`/\`EmptyState\`                              |\r
| 8   | **Renderização (JSX)**                      | O \`return\`: header, estados de loading/erro/vazio, lista/formulário, ações         |\r
\r
### Passo 3 — Estrutura do comentário (Page)\r
\r
\`\`\`tsx\r
/**\r
 * =========================================================================\r
 * BLOCO N — NOME DO BLOCO\r
 * =========================================================================\r
 *\r
 * O QUE FAZ: (objetivo do bloco)\r
 * POR QUE É IMPORTANTE: (motivação)\r
 * CONEXÃO: (qual hook/service/componente este bloco alimenta ou consome)\r
 * COMO REAPROVEITAR EM OUTRA PÁGINA: (instruções objetivas)\r
 * -------------------------------------------------------------------------\r
 */\r
\`\`\`\r
\r
Para uma função ou handler específico, usar \`/** ... */\` acima dela com: o\r
que faz, parâmetros (tipo → descrição), retorno, por que é importante, como\r
reaproveitar. Exemplo mínimo (uma função pura de um bloco "Funções\r
Auxiliares"):\r
\r
\`\`\`tsx\r
/**\r
 * Converte o FormData do submit num objeto plano para o service.create().\r
 * @param form elemento <form> do evento de submit\r
 * @returns payload sem chaves vazias; \`name[]\` de checkbox vira 0/1 numérico\r
 */\r
function formDataToPayload(form: HTMLFormElement): Record<string, unknown> { ... }\r
\`\`\`\r
\r
### Padrão de fluxo a explicar sempre (o "PHP↔JS" de antes, aqui é isto)\r
\r
\`\`\`\r
Page.tsx (JSX)\r
  └─ dispara handler (onSubmit / onClick)\r
       └─ monta payload (FormData, estado local)\r
            └─ chama service (@/services/v1/*, via resourceFactory)\r
                 └─ service usa http.ts (fetch + headers + tratamento de erro)\r
                      └─ retorno normalizado (normalizeList / ApiError)\r
                           └─ setState() atualiza a tela (toast, lista, form.reset())\r
\`\`\`\r
\r
Todo bloco "Handlers de Ação" e "Tratamento de Erro/Feedback" deve deixar\r
claro em qual ponto desse fluxo ele atua.\r
\r
---\r
\r
## 4. Bloco B — Camada Core (\`services/\`, \`hooks/\`, \`context/\`, \`utils/\`)\r
\r
> Aplica-se a arquivos de infraestrutura reaproveitados por várias páginas —\r
> o equivalente ao antigo \`sad/v1a/core/\`. Aqui vivem em \`src/services/http.ts\`,\r
> \`src/services/resourceFactory.ts\`, \`src/hooks/*.ts\`, \`src/context/*.tsx\` e\r
> \`src/utils/*.ts\`.\r
\r
### Arquivos-modelo desta camada\r
\r
| Arquivo                                                            | Propósito resumido                                                                                                       |\r
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |\r
| \`services/http.ts\`                                                 | Camada \`fetch\` base: monta URL, headers, trata erro em \`ApiError\`                                                        |\r
| \`services/resourceFactory.ts\`                                      | \`createResource(group)\` gera o conjunto padrão de métodos REST (\`ResourceReader\`/\`ResourceWriter\`), espelhando o backend |\r
| \`hooks/useApi.ts\`                                                  | Estado genérico de chamada assíncrona (\`data\`/\`error\`/\`loading\`/\`run\`), com abort automático                             |\r
| \`hooks/usePagination.ts\`                                           | Estado de página/limite/ordenação para listagens                                                                         |\r
| \`hooks/useToast.ts\`                                                | Acesso ao \`ToastContext\` para disparar \`toast.success/error\`                                                             |\r
| \`hooks/useDebounce.ts\`                                             | Atraso de valor (ex.: busca) para não disparar 1 request por tecla                                                       |\r
| \`context/ToastContext.tsx\`                                         | Provider global da fila de toasts, consumida via \`useToast()\`                                                            |\r
| \`context/AppConfigContext.tsx\`                                     | Configuração global da aplicação disponível em qualquer componente                                                       |\r
| \`utils/apiResult.ts\`                                               | \`normalizeList\` e afins — extraem \`{ data, meta }\` de respostas variadas                                                 |\r
| \`utils/format.ts\` / \`validation.ts\` / \`slug.ts\` / \`querystring.ts\` | Utilitários puros de formatação/validação/URL                                                                            |\r
\r
### Grafo de dependências (entender antes de editar)\r
\r
\`\`\`\r
http.ts ─────────────────────────────→ ApiError (erro tipado consumido pelas páginas)\r
resourceFactory.ts ──(usa)───────────→ http.ts\r
services/v1/*.ts ──(chama)───────────→ resourceFactory.ts (createResource)\r
useApi.ts ──(recebe fn que chama)────→ services/v1/*.ts (ou http.ts direto)\r
useToast.ts ──(consome)──────────────→ ToastContext.tsx\r
Page.tsx ──(usa)──────────────────────→ useApi / useToast / usePagination / services/v1/*\r
\`\`\`\r
\r
### Estrutura de blocos por tipo de arquivo core\r
\r
- **Services de recurso** (\`services/v1/*.ts\`): File Header → Instância via\r
  \`createResource(...)\` → Tipos exportados (se houver) → Exportação nomeada.\r
  Normalmente são poucas linhas — o grosso da lógica mora em\r
  \`resourceFactory.ts\`; comentar apenas o que aquele arquivo acrescenta\r
  (grupo do endpoint, versão, se é \`-view\` só leitura).\r
- **Factories/serviços base** (\`http.ts\`, \`resourceFactory.ts\`): File Header\r
  → Tipos/Interfaces → Função(ões) pública(s) → Funções auxiliares privadas →\r
  Exportação.\r
- **Hooks** (\`useApi\`, \`usePagination\`, \`useDebounce\`, \`useToast\`): File\r
  Header (o que o hook resolve, assinatura de uso) → Estado interno (\`useState\`/\`useRef\`)\r
  → Efeitos (\`useEffect\`) → Funções retornadas (\`useCallback\`) → Retorno do hook.\r
- **Contexts** (\`ToastContext\`, \`AppConfigContext\`): File Header → Tipo do\r
  valor do contexto → \`createContext\` → Provider (estado + funções) → Hook de\r
  consumo (\`useToast\`, etc.) → Exportação.\r
- **Utilitários** (\`utils/*.ts\`): File Header → Função 1..N (cada uma com seu\r
  próprio \`/** ... */\` de parâmetros/retorno) → Exportação.\r
\r
### Estrutura do comentário (core)\r
\r
\`\`\`ts\r
/**\r
 * =========================================================================\r
 * BLOCO N — NOME DO BLOCO\r
 * =========================================================================\r
 *\r
 * PROPÓSITO: (o que faz)\r
 * DEPENDÊNCIAS: (arquivos/módulos que consome)\r
 * CONSUMIDORES: (quem chama ou importa — páginas, outros hooks/services)\r
 * COMO REAPROVEITAR EM OUTRO MÓDULO: (instruções)\r
 * -------------------------------------------------------------------------\r
 */\r
\`\`\`\r
\r
---\r
\r
## 5. Bloco C — Componente de Campo (\`components/ui/FormGrid/*\`)\r
\r
> Aplica-se a **todos os arquivos** de \`components/ui/FormGrid/\` —\r
> componentes de campo de formulário que seguem o padrão Factory: o\r
> componente \`<FormGrid>\` (\`FormGrid/Input/index.tsx\`) recebe um \`schema\`\r
> (JSON/objeto TypeScript) e, por \`field.type\`, delega a renderização a um\r
> componente especializado (\`CpfField\`, \`SelectField\`, \`CepField\`, etc.). O\r
> equivalente direto ao antigo \`FormFactory\` (PHP) + \`field_*.js\`, só que sem\r
> a travessia PHP→HTML→JS: aqui o \`schema\` é um objeto TS e o componente\r
> React já é o HTML final.\r
\r
### Arquivos alvo (\`components/ui/FormGrid/\`)\r
\r
| Arquivo                                                                                                                             | Propósito resumido                                                                                           |\r
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |\r
| \`Input/index.tsx\`                                                                                                                   | \`<FormGrid>\` — motor: recebe \`schema.rows\`, monta a grade Bootstrap (\`col-md-N\`) e despacha por \`field.type\` |\r
| \`cpf/index.tsx\`                                                                                                                     | CPF com máscara e validação de dígitos verificadores                                                         |\r
| \`cnpj/index.tsx\`                                                                                                                    | CNPJ com validação de dígitos verificadores                                                                  |\r
| \`cep/index.tsx\`                                                                                                                     | CEP com máscara e consulta automática à ViaCEP                                                               |\r
| \`email/index.tsx\`                                                                                                                   | E-mail com validação de formato                                                                              |\r
| \`phone/index.tsx\`                                                                                                                   | Celular/telefone com máscara dinâmica                                                                        |\r
| \`data/index.tsx\`                                                                                                                    | Data simples ou intervalo, com validação                                                                     |\r
| \`hora/index.tsx\`                                                                                                                    | Hora nativa (\`<input type="time">\`)                                                                          |\r
| \`radio/index.tsx\`                                                                                                                   | Grupo de botões radio                                                                                        |\r
| \`checkbox/index.tsx\`                                                                                                                | Grupo de checkboxes                                                                                          |\r
| \`select/index.tsx\`                                                                                                                  | Combobox com busca local + remota (\`src\`/\`findSrc\`/\`getSrc\`), single e \`multiple\`                            |\r
| \`moeda/index.tsx\`                                                                                                                   | Campo monetário R$ (display + hidden raw)                                                                    |\r
| \`pis/index.tsx\`, \`placa/index.tsx\`, \`processo/index.tsx\`, \`renavam/index.tsx\`, \`sei/index.tsx\`, \`titulo/index.tsx\`, \`cnh/index.tsx\` | Campos de máscara/validação específicos, mesmo padrão de \`cpf\`                                               |\r
| \`textarea/index.tsx\`                                                                                                                | \`<textarea>\` com contador de caracteres                                                                      |\r
| \`emitValue.ts\`                                                                                                                      | Helper compartilhado: dispara \`field.onChange\` com o valor já tratado (dígitos puros, etc.)                  |\r
\r
### Arquitetura — como os componentes de campo funcionam\r
\r
\`\`\`\r
┌───────────────────────────────┐\r
│           <FormGrid>           │\r
│   (FormGrid/Input/index.tsx)   │\r
│  Recebe schema.rows[].fields   │\r
│  Faz switch(field.type)        │\r
└──────────────┬─────────────────┘\r
               ▼\r
┌───────────────────────────────────────┐\r
│  field: { type: 'cpf', name: 'cpf',   │\r
│           label: 'CPF', required }    │\r
└──────────────┬─────────────────────────┘\r
               ▼\r
┌─────────────────────────────────────────────────┐\r
│  Componente de Campo (FormGrid/cpf/index.tsx)   │\r
│  1. Recebe \`field\` via props (não lê o DOM)     │\r
│  2. Estado local (não-controlado) OU controlado │\r
│     por \`field.value\`/\`field.onChange\`           │\r
│  3. Renderiza <input> visível (máscara) +        │\r
│     <input type="hidden" name={field.name}>      │\r
│     com o valor "cru" (dígitos puros)            │\r
└───────────────┬───────────────────────────────────┘\r
                ▼\r
      new FormData(form) na Page → payload → service.create()\r
\`\`\`\r
\r
### Contrato de cada componente de campo (\`FieldSchema\`)\r
\r
Cada componente exporta uma \`interface XxxFieldSchema\` com, no mínimo:\r
- \`type\` → discriminador obrigatório (usado pelo \`switch\` do \`<FormGrid>\`)\r
- \`col\` → largura da coluna Bootstrap (1-12)\r
- \`name\` → chave usada no \`FormData\`/\`coletarDados()\` da página (equivalente\r
  ao antigo \`data-name\`)\r
- \`label\`, \`required\`, \`value\`/\`defaultValue\`, \`onChange\`/\`onBlur\`\r
\r
**Antes de comentar, identificar**: quais props o campo aceita além do\r
mínimo (ex.: \`src\`/\`findSrc\`/\`getSrc\` do \`select\`), e se o valor exposto ao\r
\`FormData\` é "cru" (dígitos puros, via \`<input type="hidden">\`) ou o próprio\r
valor visível.\r
\r
### Blocos de conteúdo de um componente de campo\r
\r
| #   | Bloco                               | Descrição                                                                        |\r
| --- | ----------------------------------- | -------------------------------------------------------------------------------- |\r
| 1   | **File Header**                     | Propósito, como o \`<FormGrid>\` despacha para este componente, contrato do schema |\r
| 2   | **Interface \`XxxFieldSchema\`**      | Props aceitas, agrupadas por finalidade (não uma por comentário)                 |\r
| 3   | **Helpers de Formatação/Validação** | Máscara, conversão display↔raw, validação (fora do componente)                   |\r
| 4   | **Componente \`XxxField\`**           | Estado controlado/não-controlado, handlers, JSX final                            |\r
| 5   | **Exportação**                      | \`export default XxxField\` (padrão do diretório)                                  |\r
\r
### Estrutura do comentário (componente de campo)\r
\r
\`\`\`tsx\r
/**\r
 * =========================================================================\r
 * BLOCO N — NOME DO BLOCO\r
 * =========================================================================\r
 *\r
 * CONEXÃO COM O FORMGRID:\r
 *   - field.type que ativa este componente: 'xxx'\r
 *   - Props do schema lidas aqui: name, label, required, ...\r
 *\r
 * CONEXÃO COM A PÁGINA:\r
 *   - O valor é coletado via: (input hidden com dígitos puros / input visível)\r
 *   - A chave no FormData/payload é: (field.name)\r
 *\r
 * DEPENDÊNCIAS: (ex.: emitValue.ts)\r
 * COMO CRIAR UM COMPONENTE DE CAMPO SIMILAR: (passo a passo)\r
 * -------------------------------------------------------------------------\r
 */\r
\`\`\`\r
\r
**Atenções específicas:** para campos com display + hidden (\`moeda\`, \`sei\`,\r
\`cep\`, \`cpf\`, \`cnpj\`), documentar qual \`<input>\` é o "cru" (vai no\r
\`FormData\`) e qual é só visual; para \`select/index.tsx\`, documentar o modo\r
\`single\` vs \`multiple\` e os três canais de dados (\`options\` inline, \`src\`\r
remoto, \`findSrc\`/\`getSrc\` de fallback); para \`cep/index.tsx\`, documentar a\r
consulta automática à ViaCEP e o que acontece em caso de falha.\r
\r
---\r
\r
## 6. Checklist Consolidado de Qualidade\r
\r
- [ ] Cabeçalho do arquivo explica o **propósito geral**\r
- [ ] Cabeçalho lista **dependências** (o que o arquivo consome)\r
- [ ] Cabeçalho lista **consumidores** (quem usa este arquivo)\r
- [ ] Cabeçalho contém **passo a passo para criar algo similar**\r
- [ ] Cada grupo lógico de hooks/variáveis tem UM bloco de comentário (não um por linha)\r
- [ ] Cada função/handler tem UM bloco de comentário acima dela\r
- [ ] Blocos explicam: O QUE FAZ · DEPENDÊNCIAS · CONSUMIDORES · COMO REAPROVEITAR\r
- [ ] Conexões entre arquivos estão documentadas (Page ↔ hook ↔ service ↔ componente de campo)\r
- [ ] Comentários antigos substituídos foram **removidos**; os úteis foram **preservados**\r
- [ ] **Nenhuma linha de código ou JSX foi alterada** (só comentários)\r
- [ ] Nenhum erro de sintaxe/TypeScript nos arquivos alterados\r
- [ ] Numeração dos blocos consistente (Bloco 1, 2, 3... sem saltos)\r
- [ ] Bug/inconsistência/melhoria encontrado na leitura foi **registrado à\r
      parte na resposta**, não corrigido no código nem deixado como TODO solto\r
\r
### Exemplo de prompt para usar este README\r
\r
> Preciso de comentários DIDÁTICOS, claros como para um dev JÚNIOR, nestes\r
> arquivos:\r
> \`{path/to/XPage.tsx}\` \`{path/to/README_comenta-codigo-didatico.md}\`\r
> Explicando cada conjunto de hooks/variáveis e funções, o que se liga entre\r
> a página, o hook, o service e (se houver) o componente de campo, em\r
> BLOCOS de comentários.\r
> Não quero comentário linha a linha; agrupe a explicação de cada conjunto\r
> de hooks/variáveis num único bloco acima delas.\r
> O mesmo com cada função/handler: um bloco bem detalhado acima dela.\r
> Mantenha os comentários que fizerem sentido e remova os que podem ser\r
> substituídos por essa explicação mais completa.\r
> Importante: informar os passos para criar uma página/componente novo\r
> seguindo exatamente o mesmo padrão.\r
> Faça.\r
\r
---\r
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
`;export{o as default};
