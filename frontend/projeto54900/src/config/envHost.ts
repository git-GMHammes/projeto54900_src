/**
 * =========================================================================
 * FILE HEADER — config/envHost.ts
 * =========================================================================
 *
 * PROPOSITO: validador global de ambiente por HOSTNAME — espelho do
 * env_host.js (core legado). E a fonte unica de duas coisas: a lista de hosts
 * tratados como ambiente de desenvolvimento (DEV_HOSTS) e a checagem
 * (isDevHost) usada pelo frontend para decidir se um comportamento dev-only
 * (ex.: painel de debug de respostas de API, botao de preenchimento
 * automatico de formulario, previa de hash de senha) deve aparecer.
 *
 * POR QUE HOSTNAME, E NAO MODO DE BUILD: existe tambem env.isDev
 * (config/env.ts), que le import.meta.env.DEV do Vite e diz se o BUNDLE foi
 * buildado em modo dev. Nao e a mesma coisa: isDevHost() diz se o HOST que
 * esta servindo o app e um ambiente de desenvolvimento/homologacao. Um mesmo
 * build roda tanto em dev quanto em homolog, entao a distincao relevante e o
 * host, nao o modo de build. Nao trocar um pelo outro dentro de um
 * comportamento dev-only sem revisar essa diferenca.
 *
 * Uso:
 *   isDevHost()                     // usa window.location.hostname
 *   isDevHost('172.21.75.197')
 *   DEV_HOSTS                       // lista, para overrides pontuais
 *
 * DEPENDENCIAS: nenhuma (arquivo autocontido; le window.location quando
 * disponivel).
 * CONSUMIDORES: components/global/ApiDebugPanel.tsx,
 * components/global/FakeFillButton.tsx,
 * pages/v1/user/user-manager/PasswordHashPreviewButton.tsx e
 * services/apiDebugLog.ts — todos para gate de comportamento dev-only.
 *
 * COMO REAPROVEITAR: chamar isDevHost() para condicionar qualquer feature
 * dev-only nova; adicionar um host novo em DEV_HOSTS em vez de checar o
 * hostname manualmente dentro de outro arquivo.
 *
 * COMO CRIAR UM VALIDADOR DE AMBIENTE SIMILAR (passo a passo):
 *   1. declarar a lista de valores aceitos como constante exportada, do tipo
 *      readonly string[], com uma entrada por ambiente;
 *   2. escrever uma funcao pura que aceita o valor opcionalmente e cai no
 *      valor do browser quando nada for passado;
 *   3. concentrar a decisao numa unica checagem de pertencimento a lista —
 *      nunca repetir um if de host espalhado pelos consumidores;
 *   4. listar no cabecalho quem consome o validador.
 * -------------------------------------------------------------------------
 */

/**
 * =========================================================================
 * BLOCO 1 — LISTA DE HOSTS DE DESENVOLVIMENTO
 * =========================================================================
 *
 * O QUE FAZ: relaciona os hostnames tratados como ambiente de
 * desenvolvimento. E a unica fonte dessa regra — isDevHost() compara por
 * igualdade exata contra esta lista, e nenhum outro arquivo deve repetir a
 * comparacao.
 *
 * POR QUE E IMPORTANTE: e o gate de todo comportamento dev-only do projeto.
 * Um host faltando faz o recurso sumir do ambiente; um host sobrando expoe o
 * recurso fora de desenvolvimento.
 *
 * COMO ADICIONAR UM HOST: incluir a string nesta lista, nada mais. Nao e
 * preciso mexer em isDevHost() nem nos consumidores.
 * -------------------------------------------------------------------------
 */
export const DEV_HOSTS: readonly string[] = [
  'localhost',
  '127.0.0.1',
  '::1',
  'podman.local',
  '172.21.75.197',
];

/**
 * =========================================================================
 * BLOCO 2 — CHECAGEM DE HOST
 * =========================================================================
 *
 * O QUE FAZ: diz se um hostname (ou o hostname atual do browser) esta em
 * DEV_HOSTS, por comparacao de igualdade exata.
 *
 * @param hostname host a testar; quando omitido, usa o hostname do browser
 *   (window.location.hostname)
 * @returns true apenas em host de desenvolvimento; false tambem quando nao
 *   ha window (execucao fora do browser: SSR/teste) e quando o host nao esta
 *   na lista
 *
 * POR QUE E IMPORTANTE: e o gate dos comportamentos dev-only do projeto —
 * painel de debug de API (ApiDebugPanel), preenchimento automatico de
 * formulario para teste (FakeFillButton), previa de hash de senha
 * (PasswordHashPreviewButton) e registro do log de diagnostico de API
 * (services/apiDebugLog.ts).
 *
 * COMO REAPROVEITAR: importar do modulo config/envHost (o alias @ aponta
 * para src) e usar como condicao de renderizacao ou de execucao — nunca
 * reescrever a comparacao de hostname dentro do consumidor.
 * -------------------------------------------------------------------------
 */
export function isDevHost(hostname?: string): boolean {
  const h = hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
  return DEV_HOSTS.includes(h);
}
