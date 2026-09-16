[◄ Índice da base de conhecimento](../README.md)

---

# Comentar Código com Estilo Didático (React/TSX)

> Adaptado de um roteiro equivalente usado em outro projeto (CakePHP + JS
> separados, "SAD v1/v1a"). Lá o HTML/PHP e o JS eram dois arquivos distintos
> que se conectavam por IDs e `data-*`. **Aqui não existe essa separação:** o
> componente `.tsx` já constrói o HTML (JSX) e a lógica no mesmo arquivo, e a
> "conexão" a documentar é entre **Page → hook → service → tipos → componente
> de campo**, não entre PHP e JS. A ideia (comentar em blocos, explicar o
> fluxo ponta a ponta, ensinar a replicar o padrão) é a mesma; os alvos foram
> remapeados para o stack real deste projeto (React + TypeScript + Vite).

## Sumário

1. [Objetivo Geral](#1-objetivo-geral)
2. [Regras Gerais (NÃO PULAR)](#2-regras-gerais-não-pular)
3. [Bloco A — Página (`pages/v1/.../XPage.tsx`)](#3-bloco-a--página-pagesv1xpagetsx)
4. [Bloco B — Camada Core (`services/`, `hooks/`, `context/`, `utils/`)](#4-bloco-b--camada-core-services-hooks-context-utils)
5. [Bloco C — Componente de Campo (`components/ui/FormGrid/*`)](#5-bloco-c--componente-de-campo-componentsuiformgrid)
6. [Checklist Consolidado de Qualidade](#6-checklist-consolidado-de-qualidade)

---

## 1. Objetivo Geral

Adicionar comentários **didáticos, em blocos, explicando cada conjunto de
variáveis, funções, hooks e componentes**, de forma que um **dev júnior** (ou
uma IA de baixo nível) entenda: o propósito de cada arquivo, como ele se
conecta com os demais (página ↔ hook ↔ service ↔ tipos ↔ componente de
campo), como os dados fluem do clique do usuário até a API e de volta, e
consiga **replicar o padrão em uma página/componente novo**. Comentários em
**BLOCOS**, nunca linha a linha; agrupar variáveis, funções e hooks
relacionados num mesmo bloco.

---

## 2. Regras Gerais (NÃO PULAR)

1. **Incluir SEMPRE no cabeçalho do arquivo:** (a) propósito geral, (b)
   dependências que consome (imports próprios do projeto, não libs externas
   óbvias como `react`), (c) quais outros arquivos/páginas o consomem, (d)
   passo a passo para criar algo similar.
2. **Comentar em BLOCOS**, nunca linha a linha. Agrupar hooks de estado,
   funções auxiliares e handlers relacionados num mesmo bloco.
3. **Conectar os arquivos entre si** — mostrar o fluxo ponta a ponta (ex.:
   como a `Page` chama `useApi(() => service.getAll(...))`, como o `schema`
   de `<FormGrid>` vira `<input>` renderizado por `CpfField`/`SelectField`,
   como o `FormData` do submit vira o `payload` enviado a `service.create()`).
4. **Manter comentários existentes que fizerem sentido**; remover os que
   forem substituídos pelos blocos maiores.
5. **Não reformatar código** — só adicionar/remover comentários. Nunca
   alterar lógica, nomes de variáveis/props, tipos ou estrutura JSX.
6. **Preservar nomenclatura e convenções** do projeto (arquivo/pasta/variável
   sempre em inglês; comentário e texto visível ao usuário em português —
   ver [`paginas`](README_paginas_modulo.md); `interface XxxSchema` +
   `export function XxxField` nos componentes de campo).
7. **Nunca adicionar comentários inline** (ao lado do código) — sempre em
   bloco acima, no formato TSDoc (`/** ... */`).
8. **JSX não leva bloco de comentário por linha de markup.** Comentar a
   *intenção* de uma seção do JSX (ex.: "bloco do formulário do grupo",
   "estado vazio/erro/loading") com um único comentário curto acima da seção,
   não uma linha por tag.
9. **Escopo é só comentário — nunca corrigir bug nem "melhorar" código nesta
   tarefa.** Ler o arquivo inteiro para comentar frequentemente revela bug
   real, inconsistência ou oportunidade de refactor. Não corrigir ali: essa
   mistura (documentação + correção no mesmo diff) dificulta revisão e viola
   o princípio de menor mudança possível. Ver procedimento abaixo.

### Bugs e melhorias encontrados durante a comentagem

Encontrou algo que não é só "falta de comentário" (bug, inconsistência entre
tipos, condição que parece errada, débito técnico)?

1. **Não alterar o código nesta tarefa** — nem "já que estou aqui".
2. **Registrar o achado à parte**, na resposta ao usuário (não como
   comentário TODO/FIXME dentro do código, para não confundir achado com
   documentação permanente) — descrever o arquivo/linha e o problema em 1-2
   frases.
3. Corrigir só depois, como **tarefa nova e separada**, com seu próprio plano
   e autorização explícita — nunca dentro do mesmo diff de comentários.

---

## 3. Bloco A — Página (`pages/v1/.../XPage.tsx`)

> Aplica-se a **qualquer página** que segue a convenção
> `pages/v1/<modulo>/<recurso>/<Acao>Page.tsx` (ver
> [`paginas`](README_paginas_modulo.md)). `FormConstructorPage.tsx` é um bom
> modelo de referência: reúne carregamento de dados, submit para API e
> feedback ao usuário no mesmo arquivo — o equivalente ao antigo par
> PHP+JS, só que em um único componente `.tsx`.

### Passo 1 — Ler o arquivo COMPLETO antes de comentar

Identificar, antes de escrever qualquer bloco: quais hooks de estado existem
(`useState`), quais vêm de hooks de projeto (`useApi`, `useToast`,
`usePagination`), quais services são chamados (`@/services/v1/*` ou
`@/services/http`), quais componentes de UI são usados (`FormGrid`,
`DataTable`, `PageHeader`, `LoadingOverlay`, `EmptyState`) e qual é o
`return` (JSX) que amarra tudo isso na tela.

### Passo 2 — Blocos de conteúdo de uma página

| #   | Bloco                                       | Descrição                                                                          |
| --- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | **File Header**                             | Propósito da página, rota que a monta, dependências, passo a passo para replicar   |
| 2   | **Constantes de Módulo**                    | Valores fixos fora do componente (ex.: `CONSTRUCTOR_SLUG`, mapas `Record<...>`)    |
| 3   | **Funções Auxiliares (fora do componente)** | Transformações puras (ex.: `formDataToPayload`) reaproveitáveis sem estado         |
| 4   | **Estado do Componente**                    | Todos os `useState`/hooks de projeto declarados no topo do componente, em conjunto |
| 5   | **Carregamento de Dados**                   | `useCallback`/`useEffect` que chama o service e popula o estado (o `load()`)       |
| 6   | **Handlers de Ação**                        | Funções que respondem a evento do usuário (submit, clique, reload)                 |
| 7   | **Tratamento de Erro/Feedback**             | Como `ApiError` vira mensagem de `toast`/`EmptyState`                              |
| 8   | **Renderização (JSX)**                      | O `return`: header, estados de loading/erro/vazio, lista/formulário, ações         |

### Passo 3 — Estrutura do comentário (Page)

```tsx
/**
 * =========================================================================
 * BLOCO N — NOME DO BLOCO
 * =========================================================================
 *
 * O QUE FAZ: (objetivo do bloco)
 * POR QUE É IMPORTANTE: (motivação)
 * CONEXÃO: (qual hook/service/componente este bloco alimenta ou consome)
 * COMO REAPROVEITAR EM OUTRA PÁGINA: (instruções objetivas)
 * -------------------------------------------------------------------------
 */
```

Para uma função ou handler específico, usar `/** ... */` acima dela com: o
que faz, parâmetros (tipo → descrição), retorno, por que é importante, como
reaproveitar. Exemplo mínimo (uma função pura de um bloco "Funções
Auxiliares"):

```tsx
/**
 * Converte o FormData do submit num objeto plano para o service.create().
 * @param form elemento <form> do evento de submit
 * @returns payload sem chaves vazias; `name[]` de checkbox vira 0/1 numérico
 */
function formDataToPayload(form: HTMLFormElement): Record<string, unknown> { ... }
```

### Padrão de fluxo a explicar sempre (o "PHP↔JS" de antes, aqui é isto)

```
Page.tsx (JSX)
  └─ dispara handler (onSubmit / onClick)
       └─ monta payload (FormData, estado local)
            └─ chama service (@/services/v1/*, via resourceFactory)
                 └─ service usa http.ts (fetch + headers + tratamento de erro)
                      └─ retorno normalizado (normalizeList / ApiError)
                           └─ setState() atualiza a tela (toast, lista, form.reset())
```

Todo bloco "Handlers de Ação" e "Tratamento de Erro/Feedback" deve deixar
claro em qual ponto desse fluxo ele atua.

---

## 4. Bloco B — Camada Core (`services/`, `hooks/`, `context/`, `utils/`)

> Aplica-se a arquivos de infraestrutura reaproveitados por várias páginas —
> o equivalente ao antigo `sad/v1a/core/`. Aqui vivem em `src/services/http.ts`,
> `src/services/resourceFactory.ts`, `src/hooks/*.ts`, `src/context/*.tsx` e
> `src/utils/*.ts`.

### Arquivos-modelo desta camada

| Arquivo                                                            | Propósito resumido                                                                                                       |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `services/http.ts`                                                 | Camada `fetch` base: monta URL, headers, trata erro em `ApiError`                                                        |
| `services/resourceFactory.ts`                                      | `createResource(group)` gera o conjunto padrão de métodos REST (`ResourceReader`/`ResourceWriter`), espelhando o backend |
| `hooks/useApi.ts`                                                  | Estado genérico de chamada assíncrona (`data`/`error`/`loading`/`run`), com abort automático                             |
| `hooks/usePagination.ts`                                           | Estado de página/limite/ordenação para listagens                                                                         |
| `hooks/useToast.ts`                                                | Acesso ao `ToastContext` para disparar `toast.success/error`                                                             |
| `hooks/useDebounce.ts`                                             | Atraso de valor (ex.: busca) para não disparar 1 request por tecla                                                       |
| `context/ToastContext.tsx`                                         | Provider global da fila de toasts, consumida via `useToast()`                                                            |
| `context/AppConfigContext.tsx`                                     | Configuração global da aplicação disponível em qualquer componente                                                       |
| `utils/apiResult.ts`                                               | `normalizeList` e afins — extraem `{ data, meta }` de respostas variadas                                                 |
| `utils/format.ts` / `validation.ts` / `slug.ts` / `querystring.ts` | Utilitários puros de formatação/validação/URL                                                                            |

### Grafo de dependências (entender antes de editar)

```
http.ts ─────────────────────────────→ ApiError (erro tipado consumido pelas páginas)
resourceFactory.ts ──(usa)───────────→ http.ts
services/v1/*.ts ──(chama)───────────→ resourceFactory.ts (createResource)
useApi.ts ──(recebe fn que chama)────→ services/v1/*.ts (ou http.ts direto)
useToast.ts ──(consome)──────────────→ ToastContext.tsx
Page.tsx ──(usa)──────────────────────→ useApi / useToast / usePagination / services/v1/*
```

### Estrutura de blocos por tipo de arquivo core

- **Services de recurso** (`services/v1/*.ts`): File Header → Instância via
  `createResource(...)` → Tipos exportados (se houver) → Exportação nomeada.
  Normalmente são poucas linhas — o grosso da lógica mora em
  `resourceFactory.ts`; comentar apenas o que aquele arquivo acrescenta
  (grupo do endpoint, versão, se é `-view` só leitura).
- **Factories/serviços base** (`http.ts`, `resourceFactory.ts`): File Header
  → Tipos/Interfaces → Função(ões) pública(s) → Funções auxiliares privadas →
  Exportação.
- **Hooks** (`useApi`, `usePagination`, `useDebounce`, `useToast`): File
  Header (o que o hook resolve, assinatura de uso) → Estado interno (`useState`/`useRef`)
  → Efeitos (`useEffect`) → Funções retornadas (`useCallback`) → Retorno do hook.
- **Contexts** (`ToastContext`, `AppConfigContext`): File Header → Tipo do
  valor do contexto → `createContext` → Provider (estado + funções) → Hook de
  consumo (`useToast`, etc.) → Exportação.
- **Utilitários** (`utils/*.ts`): File Header → Função 1..N (cada uma com seu
  próprio `/** ... */` de parâmetros/retorno) → Exportação.

### Estrutura do comentário (core)

```ts
/**
 * =========================================================================
 * BLOCO N — NOME DO BLOCO
 * =========================================================================
 *
 * PROPÓSITO: (o que faz)
 * DEPENDÊNCIAS: (arquivos/módulos que consome)
 * CONSUMIDORES: (quem chama ou importa — páginas, outros hooks/services)
 * COMO REAPROVEITAR EM OUTRO MÓDULO: (instruções)
 * -------------------------------------------------------------------------
 */
```

---

## 5. Bloco C — Componente de Campo (`components/ui/FormGrid/*`)

> Aplica-se a **todos os arquivos** de `components/ui/FormGrid/` —
> componentes de campo de formulário que seguem o padrão Factory: o
> componente `<FormGrid>` (`FormGrid/Input/index.tsx`) recebe um `schema`
> (JSON/objeto TypeScript) e, por `field.type`, delega a renderização a um
> componente especializado (`CpfField`, `SelectField`, `CepField`, etc.). O
> equivalente direto ao antigo `FormFactory` (PHP) + `field_*.js`, só que sem
> a travessia PHP→HTML→JS: aqui o `schema` é um objeto TS e o componente
> React já é o HTML final.

### Arquivos alvo (`components/ui/FormGrid/`)

| Arquivo                                                                                                                             | Propósito resumido                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `Input/index.tsx`                                                                                                                   | `<FormGrid>` — motor: recebe `schema.rows`, monta a grade Bootstrap (`col-md-N`) e despacha por `field.type` |
| `cpf/index.tsx`                                                                                                                     | CPF com máscara e validação de dígitos verificadores                                                         |
| `cnpj/index.tsx`                                                                                                                    | CNPJ com validação de dígitos verificadores                                                                  |
| `cep/index.tsx`                                                                                                                     | CEP com máscara e consulta automática à ViaCEP                                                               |
| `email/index.tsx`                                                                                                                   | E-mail com validação de formato                                                                              |
| `phone/index.tsx`                                                                                                                   | Celular/telefone com máscara dinâmica                                                                        |
| `data/index.tsx`                                                                                                                    | Data simples ou intervalo, com validação                                                                     |
| `hora/index.tsx`                                                                                                                    | Hora nativa (`<input type="time">`)                                                                          |
| `radio/index.tsx`                                                                                                                   | Grupo de botões radio                                                                                        |
| `checkbox/index.tsx`                                                                                                                | Grupo de checkboxes                                                                                          |
| `select/index.tsx`                                                                                                                  | Combobox com busca local + remota (`src`/`findSrc`/`getSrc`), single e `multiple`                            |
| `moeda/index.tsx`                                                                                                                   | Campo monetário R$ (display + hidden raw)                                                                    |
| `pis/index.tsx`, `placa/index.tsx`, `processo/index.tsx`, `renavam/index.tsx`, `sei/index.tsx`, `titulo/index.tsx`, `cnh/index.tsx` | Campos de máscara/validação específicos, mesmo padrão de `cpf`                                               |
| `textarea/index.tsx`                                                                                                                | `<textarea>` com contador de caracteres                                                                      |
| `emitValue.ts`                                                                                                                      | Helper compartilhado: dispara `field.onChange` com o valor já tratado (dígitos puros, etc.)                  |

### Arquitetura — como os componentes de campo funcionam

```
┌───────────────────────────────┐
│           <FormGrid>           │
│   (FormGrid/Input/index.tsx)   │
│  Recebe schema.rows[].fields   │
│  Faz switch(field.type)        │
└──────────────┬─────────────────┘
               ▼
┌───────────────────────────────────────┐
│  field: { type: 'cpf', name: 'cpf',   │
│           label: 'CPF', required }    │
└──────────────┬─────────────────────────┘
               ▼
┌─────────────────────────────────────────────────┐
│  Componente de Campo (FormGrid/cpf/index.tsx)   │
│  1. Recebe `field` via props (não lê o DOM)     │
│  2. Estado local (não-controlado) OU controlado │
│     por `field.value`/`field.onChange`           │
│  3. Renderiza <input> visível (máscara) +        │
│     <input type="hidden" name={field.name}>      │
│     com o valor "cru" (dígitos puros)            │
└───────────────┬───────────────────────────────────┘
                ▼
      new FormData(form) na Page → payload → service.create()
```

### Contrato de cada componente de campo (`FieldSchema`)

Cada componente exporta uma `interface XxxFieldSchema` com, no mínimo:
- `type` → discriminador obrigatório (usado pelo `switch` do `<FormGrid>`)
- `col` → largura da coluna Bootstrap (1-12)
- `name` → chave usada no `FormData`/`coletarDados()` da página (equivalente
  ao antigo `data-name`)
- `label`, `required`, `value`/`defaultValue`, `onChange`/`onBlur`

**Antes de comentar, identificar**: quais props o campo aceita além do
mínimo (ex.: `src`/`findSrc`/`getSrc` do `select`), e se o valor exposto ao
`FormData` é "cru" (dígitos puros, via `<input type="hidden">`) ou o próprio
valor visível.

### Blocos de conteúdo de um componente de campo

| #   | Bloco                               | Descrição                                                                        |
| --- | ----------------------------------- | -------------------------------------------------------------------------------- |
| 1   | **File Header**                     | Propósito, como o `<FormGrid>` despacha para este componente, contrato do schema |
| 2   | **Interface `XxxFieldSchema`**      | Props aceitas, agrupadas por finalidade (não uma por comentário)                 |
| 3   | **Helpers de Formatação/Validação** | Máscara, conversão display↔raw, validação (fora do componente)                   |
| 4   | **Componente `XxxField`**           | Estado controlado/não-controlado, handlers, JSX final                            |
| 5   | **Exportação**                      | `export default XxxField` (padrão do diretório)                                  |

### Estrutura do comentário (componente de campo)

```tsx
/**
 * =========================================================================
 * BLOCO N — NOME DO BLOCO
 * =========================================================================
 *
 * CONEXÃO COM O FORMGRID:
 *   - field.type que ativa este componente: 'xxx'
 *   - Props do schema lidas aqui: name, label, required, ...
 *
 * CONEXÃO COM A PÁGINA:
 *   - O valor é coletado via: (input hidden com dígitos puros / input visível)
 *   - A chave no FormData/payload é: (field.name)
 *
 * DEPENDÊNCIAS: (ex.: emitValue.ts)
 * COMO CRIAR UM COMPONENTE DE CAMPO SIMILAR: (passo a passo)
 * -------------------------------------------------------------------------
 */
```

**Atenções específicas:** para campos com display + hidden (`moeda`, `sei`,
`cep`, `cpf`, `cnpj`), documentar qual `<input>` é o "cru" (vai no
`FormData`) e qual é só visual; para `select/index.tsx`, documentar o modo
`single` vs `multiple` e os três canais de dados (`options` inline, `src`
remoto, `findSrc`/`getSrc` de fallback); para `cep/index.tsx`, documentar a
consulta automática à ViaCEP e o que acontece em caso de falha.

---

## 6. Checklist Consolidado de Qualidade

- [ ] Cabeçalho do arquivo explica o **propósito geral**
- [ ] Cabeçalho lista **dependências** (o que o arquivo consome)
- [ ] Cabeçalho lista **consumidores** (quem usa este arquivo)
- [ ] Cabeçalho contém **passo a passo para criar algo similar**
- [ ] Cada grupo lógico de hooks/variáveis tem UM bloco de comentário (não um por linha)
- [ ] Cada função/handler tem UM bloco de comentário acima dela
- [ ] Blocos explicam: O QUE FAZ · DEPENDÊNCIAS · CONSUMIDORES · COMO REAPROVEITAR
- [ ] Conexões entre arquivos estão documentadas (Page ↔ hook ↔ service ↔ componente de campo)
- [ ] Comentários antigos substituídos foram **removidos**; os úteis foram **preservados**
- [ ] **Nenhuma linha de código ou JSX foi alterada** (só comentários)
- [ ] Nenhum erro de sintaxe/TypeScript nos arquivos alterados
- [ ] Numeração dos blocos consistente (Bloco 1, 2, 3... sem saltos)
- [ ] Bug/inconsistência/melhoria encontrado na leitura foi **registrado à
      parte na resposta**, não corrigido no código nem deixado como TODO solto

### Exemplo de prompt para usar este README

> Preciso de comentários DIDÁTICOS, claros como para um dev JÚNIOR, nestes
> arquivos:
> `{path/to/XPage.tsx}` `{path/to/README_comenta-codigo-didatico.md}`
> Explicando cada conjunto de hooks/variáveis e funções, o que se liga entre
> a página, o hook, o service e (se houver) o componente de campo, em
> BLOCOS de comentários.
> Não quero comentário linha a linha; agrupe a explicação de cada conjunto
> de hooks/variáveis num único bloco acima delas.
> O mesmo com cada função/handler: um bloco bem detalhado acima dela.
> Mantenha os comentários que fizerem sentido e remova os que podem ser
> substituídos por essa explicação mais completa.
> Importante: informar os passos para criar uma página/componente novo
> seguindo exatamente o mesmo padrão.
> Faça.

---

[◄ Índice da base de conhecimento](../README.md)
