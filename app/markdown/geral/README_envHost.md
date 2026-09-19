# envHost — o que `isDevHost() === true` libera

Volta para [README.md](../README.md).

`config/envHost.ts` (frontend, `src/frontend/projeto54900/src/config/envHost.ts`)
é o validador global de ambiente por **hostname**: espelho do `env_host.js`
legado. `isDevHost()` compara `window.location.hostname` (ou um hostname
passado explicitamente) contra a lista fixa `DEV_HOSTS` e devolve `true`/`false`.
Essa checagem é a fonte única usada pelo frontend para decidir se um
comportamento **dev-only** deve aparecer.

```ts
export const DEV_HOSTS: readonly string[] = [
  "localhost",
  "127.0.0.1",
  "::1",
  "podman.local",
  "172.21.75.197",
  "10.250.13.200",
  "diarias-diarias-dev.apps.ocp.qa2.detran.rj.gov.br",
  "diarias-diarias-hml.apps.ocp.qa2.detran.rj.gov.br",
];
```

## Por que hostname, e não modo de build

Existe também `env.isDev` (`config/env.ts`, lê `import.meta.env.DEV` do Vite e
é exposto em `AppConfigContext`). **Não é a mesma coisa** e não controla nada
do que está documentado aqui: `isDev` diz se o bundle foi buildado em modo dev;
`isDevHost()` diz se o host que está servindo o app **é** um ambiente de
desenvolvimento/homologação. Um build único roda tanto em dev quanto em
homolog — a distinção relevante é o host, não o modo de build. Nunca trocar
`isDevHost()` por `env.isDev` num comportamento dev-only sem revisar essa
diferença.

## O que `isDevHost() === true` libera hoje

### 1. DEBUG — painel de respostas de API (`ApiDebugPanel`)

É o **único** comportamento do projeto gateado por `isDevHost()` até o momento
desta escrita. Cadeia completa, na ordem em que os dados passam:

1. **`services/http.ts`** — único ponto que fala HTTP no front. Toda resposta
   (sucesso ou erro) passa por `parseBody()` e, antes de decidir entre sucesso
   e erro, chama `recordApiDebug({ method, path, status, ok, payload })`.
2. **`services/apiDebugLog.ts`** — store em memória (fora do React,
   `useSyncExternalStore`). `record()` começa checando `isDevHost()`: fora de
   host de desenvolvimento é **no-op total** — nada fica em memória, nenhum
   listener é avisado. É a barreira que garante que payload de resposta não é
   retido em produção. Quando dentro do host dev:
   - guarda a entrada na frente do histórico (`entries`), cortando em
     `MAX_ENTRIES = 50` (mais antigas saem pela ponta);
   - tenta achar um `access_token` em qualquer nível do payload
     (`utils/jwt.ts` → `findAccessToken`, busca recursiva até profundidade 6)
     e, se achar, decodifica o JWT (`decodeJwt` — **sem checar assinatura**,
     só header + payload em base64url; uso exclusivo de diagnóstico, a
     validação real do token é sempre do backend) e guarda em `latestToken`;
   - `clear()` esvazia histórico e token — é o botão "Limpar" do painel. O
     contador `seq` **não** reinicia no `clear()`, de propósito, para nunca
     repetir `id`/chave de lista.
3. **`hooks/useApiDebugLog.ts`** — assina o store com `useSyncExternalStore`
   (`useApiDebugLog()` para a lista de entradas, `useLatestAccessToken()` para
   o token mais recente decodificado). Único consumidor do store.
4. **`components/global/ApiDebugPanel.tsx`** — único consumidor do hook. Só
   renderiza (retorna `null` caso contrário) quando **ambas** as condições
   valem: `isDevHost()` é `true` **e** há pelo menos uma entrada capturada ou
   um `latestToken`. Quando renderiza, mostra:
   - um botão `DEBUG` (`btn-outline-danger`, ícone `bi-bug-fill`) que expande
     um `collapse` do Bootstrap;
   - o `access_token` mais recente, com header e payload do JWT decodificados
     em `<pre>`;
   - a lista de respostas capturadas (método, status com badge verde/vermelho,
     path, hora, payload bruto em JSON), mais recente primeiro;
   - botão "Limpar" que chama `clear()` do store.
5. **`layouts/RootLayout.tsx`** — monta `<ApiDebugPanel/>` **uma única vez**,
   sempre por último dentro de `<main>`, depois do `<Outlet/>` da rota. Padrão
   absoluto do layout: qualquer que seja o conteúdo da página, o DEBUG vem
   depois de tudo. Por isso nenhuma página precisa importar ou montar nada —
   o painel aparece automaticamente em qualquer rota, desde que o host seja de
   desenvolvimento e já exista alguma chamada de API capturada.

### 2. Preenchimento automático de formulário para teste (`FakeFillButton`)

Botão flutuante que preenche o formulário aberto com dados fake **válidos**
(respeitando as regras de negócio do backend/banco daquele formulário
específico), para agilizar teste manual sem digitar campo por campo.

1. **`dev/fakeFill/domUtils.ts`** — helpers DEV-ONLY compartilhados por todo
   script de preenchimento:
   - `setReactValue(el, value)`: escreve num `<input>`/`<textarea>` usando o
     setter nativo do prototype + `dispatchEvent('input')`, porque um campo
     React (controlado ou não) ignora `el.value = x` direto quando o valor
     não "passa" pelo próprio React;
   - `selectComboboxOption(fieldId, value)`: o campo `select` do FormGrid
     (`components/ui/FormGrid/select`) não é um `<select>` simples — é um
     combobox com busca cujo valor vai para um `<input type="hidden">`
     atualizado só quando o `<select>` NATIVO interno (que só existe no DOM
     com o dropdown aberto) dispara `change`. A função foca o campo, espera
     o próximo frame (o React monta o dropdown) e dispara o `change` com o
     valor certo;
   - geradores aleatórios simples (`randomItem`, `randomHexColor`,
     `randomToken`, `randomSentence`) — sem lib externa, o projeto não usa
     `faker`.
2. **`dev/fakeFill/<slug>.ts`** (ex.: `calendario.ts`) — **um arquivo por
   formulário**, cada um com as regras de negócio daquele formulário
   específicas (ENUM aceito, coluna `UNIQUE` que precisa de valor sempre
   novo, campos `NOT NULL`, formato esperado) — confirmadas sempre pela API
   (`POST /api/v1/form-manager-view/get-grouped` com o `fm_slug`) e pelo
   Model/Processor do módulo, nunca advinhadas.
3. **`dev/fakeFill/registry.ts`** — mapa `slug -> função de preenchimento`.
   Ponto único para registrar o próximo formulário; `FakeFillButton` só
   pergunta "existe script para esta slug?".
4. **`components/global/FakeFillButton.tsx`** — botão fixo no canto inferior
   esquerdo, semi-transparente (opacidade baixa em repouso, 1 no hover). Só
   renderiza com **as duas condições**: `isDevHost()` verdadeiro **e**
   `getFakeFillScript(slug)` encontrar um script registrado. Mesmo padrão de
   dupla condição do `ApiDebugPanel`.
5. Montado em **`pages/v1/form/FormRendererPage.tsx`**, só enquanto o modal
   do formulário está aberto (`showFormModal && form`) — os campos só
   existem no DOM nesse momento.

**Como registrar o próximo formulário:** copiar `calendario.ts` como base,
levantar as regras de negócio reais do novo formulário (API + Model +
Processor do módulo) e acrescentar uma linha em `registry.ts` com a mesma
slug da rota `/v1/form/<slug>`. Não criar um segundo botão nem uma segunda
forma de detectar ambiente — reaproveitar `FakeFillButton`.

**Ponto frágil, atenção ao mexer no `SelectField`:** `selectComboboxOption`
depende da estrutura interna atual do combobox custom (`<select>` nativo só
existe com o dropdown aberto, hidden input só atualiza via `change` daquele
`<select>`). Se `components/ui/FormGrid/select/index.tsx` mudar essa mecânica,
`selectComboboxOption` para de funcionar silenciosamente (é dev-only, falha
não quebra a tela, mas o campo fica sem preencher) — revisar junto de
qualquer mudança nesse componente.

## Como estender

- **Novo host de desenvolvimento/homologação:** acrescentar em `DEV_HOSTS`
  (`config/envHost.ts`). Não checar hostname manualmente em outro arquivo.
- **Nova feature dev-only:** condicionar a renderização/execução chamando
  `isDevHost()` diretamente (mesmo padrão de `ApiDebugPanel`/`apiDebugLog`/
  `FakeFillButton`). Não inventar uma segunda forma de detectar ambiente de
  desenvolvimento.
- **Este documento cobre só o que existe hoje.** Se uma nova feature passar a
  depender de `isDevHost()`, adicionar uma seção numerada aqui (mesmo padrão
  das seções "1. DEBUG" e "2. Preenchimento automático") — este README existe
  para listar **tudo** que o `true` libera.

Volta para [README.md](../README.md).
