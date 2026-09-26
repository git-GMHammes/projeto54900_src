/**
 * =========================================================================
 * FILE HEADER — config/env.ts
 * =========================================================================
 *
 * PROPOSITO: leitura centralizada das variaveis de ambiente do Vite. E a
 * UNICA porta de entrada para configuracao de ambiente do frontend — nenhum
 * outro arquivo deve ler import.meta.env direto.
 *
 * O projeto NAO usa arquivo .env e nao ha mais container de frontend. Em
 * dev (`npm run dev`) e no build (`npm run build`) os valores usados sao os
 * DEFAULTS abaixo: basePath '/' (normalizado para string vazia — ver BLOCO
 * 4), apiBaseUrl '/api', apiVersion 'v1', wsUrl '/ws'; isDev e isProd vem
 * do modo de build do Vite. Para um deploy que precise de outros valores,
 * exportar as chaves VITE_ no ambiente do processo ANTES do build (o Vite
 * so expoe variaveis com esse prefixo).
 *
 * DEPENDENCIAS: nenhuma (arquivo autocontido; le so o import.meta.env nativo
 * do Vite).
 *
 * CONSUMIDORES:
 *   - constants/api.ts — env.apiVersion vira DEFAULT_API_VERSION;
 *   - services/http.ts — env.apiBaseUrl monta a URL de toda chamada;
 *   - utils/formSubmit.ts — env.apiBaseUrl, para remover o prefixo do
 *     endpoint antes de enviar;
 *   - context/AppConfigContext.tsx — expoe o objeto env inteiro no contexto;
 *   - services/v1/uploadManager.upload.ts — env.apiBaseUrl nas URLs de
 *     download e de serve;
 *   - routes/index.tsx — routerBasename no createBrowserRouter;
 *   - paginas que montam constantes de select remoto a partir de base da
 *     API: pages/v1/menu/CreatePage.tsx, pages/v1/menu/UpdatePage.tsx,
 *     pages/v1/form/FormBuilderPage.tsx, pages/v1/list/ListBuilderPage.tsx e
 *     pages/v1/calendar/calendar-manager/constants.ts;
 *   - pages/v1/svg-map/SvgMapPage.tsx — env.basePath como base dos assets.
 *
 * OBSERVACAO: config/envHost.ts NAO depende deste arquivo — a checagem de
 * host de desenvolvimento e separada e nao usa o modo de build (ver o
 * cabecalho de config/envHost.ts).
 *
 * COMO REAPROVEITAR: importar `env` (nunca import.meta.env direto) para ler
 * qualquer valor de ambiente; usar `routerBasename` especificamente na
 * montagem do `createBrowserRouter` (routes/index.tsx).
 *
 * COMO CRIAR UMA LEITURA DE AMBIENTE SIMILAR (passo a passo):
 *   1. declarar uma interface readonly com uma propriedade por valor que o
 *      app precisa (ex.: AppEnv) — o tipo e o contrato;
 *   2. montar UM unico objeto congelado (Object.freeze) lendo cada chave do
 *      import.meta.env, sempre com um default depois do operador logico OU;
 *   3. normalizar o que for concatenado adiante (ex.: trimTrailingSlash nas
 *      URLs, para nao gerar barra dupla ao juntar com um caminho);
 *   4. exportar apenas esse objeto e os valores derivados dele (como
 *      routerBasename) — nunca o import.meta.env cru;
 *   5. documentar aqui quem consome cada chave.
 * -------------------------------------------------------------------------
 */

/**
 * =========================================================================
 * BLOCO 1 — HELPER DE NORMALIZACAO
 * =========================================================================
 *
 * O QUE FAZ: remove a barra final de um path ou URL, quando existir. Um
 * valor composto so de barras (como a string com uma barra) vira string
 * vazia — e por isso que o BLOCO 4 existe.
 *
 * @param value path ou URL a normalizar
 * @returns o mesmo valor, sem a barra final
 *
 * POR QUE E IMPORTANTE: os valores deste arquivo sao concatenados adiante
 * com caminhos que ja comecam com barra (apiBaseUrl junto do caminho do
 * recurso; basePath junto de um asset). Sem a normalizacao, a juncao
 * produziria barra dupla.
 *
 * COMO REAPROVEITAR: e funcao pura e PRIVADA deste modulo — nao e
 * exportada. Se outro arquivo precisar do mesmo tratamento, avaliar mover
 * para utils/ em vez de copiar.
 * -------------------------------------------------------------------------
 */
function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

/**
 * =========================================================================
 * BLOCO 2 — CONTRATO DE AMBIENTE (AppEnv)
 * =========================================================================
 *
 * O QUE FAZ: descreve, como tipo readonly, o conjunto de valores de
 * ambiente que o app consome. Cada propriedade e preenchida em um unico
 * ponto — o objeto `env` do BLOCO 3 — e nunca lida direto do import.meta.env
 * pelo restante do codigo.
 *
 * POR QUE E IMPORTANTE: o tipo E o contrato. Um valor novo de ambiente entra
 * aqui primeiro, e o TypeScript passa a cobrar o preenchimento no BLOCO 3.
 *
 * AS PROPRIEDADES (cada uma mantem o comentario de campo logo abaixo, para
 * aparecer no hover do editor):
 *   - basePath e apiBaseUrl: strings de URL ja normalizadas, sem barra
 *     final;
 *   - apiVersion: versao da API usada pelos services (vira
 *     DEFAULT_API_VERSION em constants/api.ts);
 *   - wsUrl: endpoint do WebSocket servido pelo Node;
 *   - isDev e isProd: modo de BUILD do Vite (DEV e PROD), que NAO e a mesma
 *     coisa que "host de desenvolvimento" — essa distincao mora no
 *     config/envHost.ts.
 *
 * COMO REAPROVEITAR: declarar aqui qualquer valor novo de ambiente, e
 * preencher no BLOCO 3; consumir sempre pelo objeto `env`, nunca pelo
 * import.meta.env.
 * -------------------------------------------------------------------------
 */
export interface AppEnv {
  /** Prefixo publico do app (ex.: "/frontend/projeto54900"). Sem barra final. */
  readonly basePath: string;
  /** Base de todas as chamadas de API (ex.: "/api"). Sem barra final. */
  readonly apiBaseUrl: string;
  /** Versao default da API usada pelos services (ex.: "v1"). */
  readonly apiVersion: string;
  /** Endpoint do WebSocket (Node). */
  readonly wsUrl: string;
  readonly isDev: boolean;
  readonly isProd: boolean;
}

/**
 * =========================================================================
 * BLOCO 3 — INSTANCIA UNICA DE AMBIENTE (env)
 * =========================================================================
 *
 * O QUE FAZ: monta, uma unica vez, o objeto de ambiente consumido pelo app
 * inteiro. Nenhuma outra leitura de import.meta.env deve existir fora daqui.
 *
 * CHAVE         VARIAVEL VITE_        DEFAULT
 * basePath      VITE_BASE_PATH        barra sozinha, normalizada para vazio
 * apiBaseUrl    VITE_API_BASE_URL     /api
 * apiVersion    VITE_API_VERSION      v1
 * wsUrl         VITE_WS_URL           /ws
 * isDev         nativo do Vite        import.meta.env.DEV
 * isProd        nativo do Vite        import.meta.env.PROD
 *
 * POR QUE Object.freeze: ambiente nao muda em tempo de execucao. Congelar
 * converte uma escrita acidental (ex.: atribuir a env.apiBaseUrl dentro de
 * um teste ou de uma pagina) em erro visivel, em vez de um bug silencioso
 * que so apareceria em outra tela.
 *
 * COMO REAPROVEITAR: para um deploy com valores proprios, exportar as chaves
 * VITE_ no ambiente do processo antes do build — nao editar este arquivo.
 * Em codigo de aplicacao, importar `env` e ler a chave desejada.
 * -------------------------------------------------------------------------
 */
export const env: AppEnv = Object.freeze({
  basePath: trimTrailingSlash(import.meta.env.VITE_BASE_PATH || '/'),
  apiBaseUrl: trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '/api'),
  apiVersion: import.meta.env.VITE_API_VERSION || 'v1',
  wsUrl: import.meta.env.VITE_WS_URL || '/ws',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
});

/**
 * =========================================================================
 * BLOCO 4 — BASENAME DO ROUTER
 * =========================================================================
 *
 * O QUE FAZ: entrega o prefixo publico usado como basename do react-router.
 * E valor DERIVADO de env.basePath: quando basePath ficou vazio — o default
 * e a barra sozinha, que o BLOCO 1 normaliza para vazio — devolve a barra,
 * porque o router NAO aceita string vazia como basename.
 *
 * POR QUE E IMPORTANTE: e o que permite o MESMO codigo rodar na raiz ou em
 * subpasta (deploy com VITE_BASE_PATH apontando para uma subpasta), sem
 * alterar nenhuma rota escrita no codigo.
 *
 * @see routes/index.tsx — consumidor unico, no createBrowserRouter.
 *
 * COMO REAPROVEITAR: importar daqui — nunca recalcular o basename a partir
 * de env.basePath em outro arquivo, ou a regra do valor vazio se perde.
 * -------------------------------------------------------------------------
 */
export const routerBasename: string = env.basePath === '' ? '/' : env.basePath;
