/**
 * =========================================================================
 * FILE HEADER — components/global/ApiDebugPanel.tsx
 * =========================================================================
 *
 * PROPOSITO: painel DEV-ONLY (card Bootstrap com collapse) que lista o JSON
 * bruto das respostas de API capturadas em services/http.ts — TODA chamada
 * do sistema passa por la — mais o access_token mais recente ja decodificado
 * (header + payload do JWT). So renderiza em host de desenvolvimento
 * (config/envHost.ts -> isDevHost) E quando ha algo a mostrar (pelo menos uma
 * entrada capturada ou um token). Sem rolagem interna deliberadamente: o
 * painel cresce com a pagina, sem scrollbars aninhadas (card > lista > pre).
 *
 * POR QUE EXISTE: sem ele, conferir o corpo de uma resposta de API exigiria
 * abrir o DevTools a cada chamada. Aqui o historico ja chega pronto, vindo do
 * store em memoria alimentado por services/http.ts.
 *
 * DEPENDENCIAS: config/envHost (isDevHost — gate de ambiente),
 * hooks/useApiDebugLog (useApiDebugLog, useLatestAccessToken — assinatura do
 * store de respostas e do ultimo token), hooks/useDevToolsExtra
 * (useDevToolsExtra — slot opcional de botao extra ao lado do DEBUG) e
 * services/apiDebugLog (clear — apaga o historico em memoria).
 *
 * CONSUMIDORES: layouts/RootLayout.tsx monta <ApiDebugPanel/> por ULTIMO
 * dentro de <main>, logo depois do <Outlet/> — padrao absoluto: qualquer que
 * seja o conteudo da rota (lista, paginacao, indice, card), o DEBUG vem
 * depois de tudo. O slot extra renderizado ao lado do botao DEBUG e
 * preenchido por services/devToolsExtra.ts, registrado pela pagina aberta
 * (ver pages/v1/user/user-manager/PasswordHashPreviewButton.tsx, que registra
 * o botao HASH).
 *
 * COMO REAPROVEITAR / COMO CRIAR UM COMPONENTE GLOBAL DEV-ONLY SIMILAR:
 *   1. ler o estado de um store externo por hook (useSyncExternalStore — ver
 *      hooks/useApiDebugLog.ts) em vez de duplicar estado local com useState;
 *   2. gate de ambiente logo no inicio do componente: if (!isDevHost())
 *      return null — nunca condicionar por env.isDev, que diz apenas se o
 *      BUNDLE foi buildado em modo dev (ver config/envHost.ts);
 *   3. retornar null tambem quando nao houver nada a exibir, para nao deixar
 *      UI vazia na tela;
 *   4. comentar a INTENCAO de cada secao do JSX, nunca tag a tag (regra 8 do
 *      README_comenta-codigo-didatico.md);
 *   5. montar o componente no RootLayout, no fim do <main>, e nao dentro de
 *      uma pagina especifica — assim ele aparece em qualquer rota.
 * Nao chamar services/apiDebugLog diretamente de outro lugar: a captura fica
 * centralizada em http.ts + este painel + hooks/useApiDebugLog.
 * -------------------------------------------------------------------------
 */

import { isDevHost } from '@/config/envHost';
import { useApiDebugLog, useLatestAccessToken } from '@/hooks/useApiDebugLog';
import { useDevToolsExtra } from '@/hooks/useDevToolsExtra';
import { clear as clearApiDebugLog } from '@/services/apiDebugLog';

/**
 * =========================================================================
 * BLOCO 1 — HELPER DE STATUS HTTP (funcao pura, fora do componente)
 * =========================================================================
 *
 * O QUE FAZ: traduz o booleano `ok` do fetch (isto e, `response.ok`, ja
 * gravado em cada entrada pelo store) na classe Bootstrap do badge de status:
 * text-bg-success (verde) para resposta 2xx, text-bg-danger (vermelho) para
 * o resto.
 *
 * POR QUE E IMPORTANTE: e o unico ponto que decide a cor do badge da lista,
 * o que mantem a expressao dentro do JSX curta e legivel.
 *
 * COMO REAPROVEITAR: por ser funcao pura (sem estado e sem dependencia de
 * modulo), pode ser copiada para qualquer painel que precise pintar
 * sucesso/erro a partir de um booleano.
 *
 * @param ok valor de `response.ok` da resposta registrada
 * @returns classe Bootstrap aplicada ao badge de status da entrada
 * -------------------------------------------------------------------------
 */
function statusBadgeClass(ok: boolean): string {
  return ok ? 'text-bg-success' : 'text-bg-danger';
}

/**
 * =========================================================================
 * BLOCO 2 — ESTADO LIDO DOS STORES DEV-ONLY
 * =========================================================================
 *
 * O QUE FAZ: assina, no topo do componente, os tres stores externos que
 * alimentam o painel. Nao existe nenhum useState aqui: o estado mora fora do
 * React (services/apiDebugLog.ts e services/devToolsExtra.ts) e estes hooks
 * apenas o reexpoem, via useSyncExternalStore — o componente re-renderiza
 * sozinho a cada mudanca do store.
 *
 * VARIAVEL A VARIAVEL:
 *   entries     -> useApiDebugLog(): historico das respostas de API
 *                  capturadas por services/http.ts, da mais recente para a
 *                  mais antiga;
 *   latestToken -> useLatestAccessToken(): ultimo access_token capturado, ja
 *                  decodificado (header + payload), ou null enquanto nenhum
 *                  JWT tiver passado pelas respostas;
 *   extra       -> useDevToolsExtra(): elemento (botao) que a pagina aberta
 *                  registrou em services/devToolsExtra.ts para aparecer ao
 *                  lado do DEBUG; null quando nenhuma pagina registrou.
 *
 * GATE DE AMBIENTE: a linha `if (!isDevHost() || (entries.length === 0 &&
 * !latestToken)) return null;` faz duas coisas de uma vez — fora de
 * DEV_HOSTS o painel nao existe na arvore (config/envHost.ts), e mesmo em
 * dev ele some enquanto nao houver nem resposta capturada nem token, para
 * nao exibir um painel DEBUG vazio.
 * -------------------------------------------------------------------------
 */
export default function ApiDebugPanel() {
  const entries = useApiDebugLog();
  const latestToken = useLatestAccessToken();
  const extra = useDevToolsExtra();

  if (!isDevHost() || (entries.length === 0 && !latestToken)) return null;

  /**
   * =======================================================================
   * BLOCO 3 — RENDERIZACAO (JSX)
   * =======================================================================
   *
   * Estrutura, de fora para dentro:
   *   1. botao DEBUG (btn-outline-danger) com data-bs-toggle="collapse"
   *      apontando para o id #apiDebugPanelCollapse — quem abre e fecha o
   *      painel e o proprio Bootstrap, sem estado React; ao lado dele vem
   *      {extra}, o slot da pagina aberta (BLOCO 2);
   *   2. card colapsavel: cabecalho com o titulo "DEBUG — respostas de API"
   *      seguido da contagem de entradas e o botao Limpar, que chama
   *      clearApiDebugLog() (services/apiDebugLog) — limpar o store notifica
   *      os hooks do BLOCO 2 e a lista desaparece na hora;
   *   3. bloco do token, renderizado so quando latestToken existe: badge
   *      access_token, path da requisicao de origem, hora da captura e os
   *      JSONs de Header e Payload, formatados com JSON.stringify(..., 2);
   *   4. lista das entradas, uma por resposta: badge do metodo (GET, POST...),
   *      badge de status pintado por statusBadgeClass (BLOCO 1), path, hora e
   *      o payload da resposta.
   *
   * CONEXAO COM O FLUXO: este JSX e a PONTA da cadeia — http.ts chama
   * record() no store, o store notifica, os hooks do BLOCO 2 re-renderizam e
   * estes elementos apenas exibem o que ja foi capturado (nada aqui dispara
   * requisicao nova).
   *
   * COMO REAPROVEITAR: e o padrao de card/collapse do Bootstrap usado no
   * resto do projeto — comentar a intencao de cada secao, nunca tag a tag
   * (regra 8 do README_comenta-codigo-didatico.md). A hora de cada item usa
   * toLocaleTimeString('pt-BR'), para casar com o restante da interface.
   * -----------------------------------------------------------------------
   */
  return (
    <div className="mt-3">
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
          data-bs-toggle="collapse"
          data-bs-target="#apiDebugPanelCollapse"
          aria-expanded="false"
          aria-controls="apiDebugPanelCollapse"
        >
          <i className="bi bi-bug-fill" />
          DEBUG
        </button>
        {extra}
      </div>

      <div className="collapse" id="apiDebugPanelCollapse">
        <div className="card border border-danger shadow-sm mt-2">
          <div className="card-header d-flex justify-content-between align-items-center bg-danger-subtle">
            <h6 className="mb-0">
              <i className="bi bi-bug-fill me-2" />
              DEBUG — respostas de API ({entries.length})
            </h6>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => clearApiDebugLog()}>
              Limpar
            </button>
          </div>

          <div className="card-body p-3">
            {latestToken && (
              <div className="border rounded p-2 mb-2">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1 small">
                  <span className="badge text-bg-primary">access_token</span>
                  <code className="text-body-secondary">{latestToken.sourcePath}</code>
                  <span className="text-body-secondary ms-auto">
                    {new Date(latestToken.capturedAt).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
                <div className="small fw-semibold mb-1">Header</div>
                <pre className="bg-body-tertiary p-2 rounded small">{JSON.stringify(latestToken.header, null, 2)}</pre>
                <div className="small fw-semibold mb-1">Payload</div>
                <pre className="bg-body-tertiary p-2 rounded mb-0 small">
                  {JSON.stringify(latestToken.payload, null, 2)}
                </pre>
              </div>
            )}

            <div className="d-flex flex-column gap-2">
              {entries.map((entry) => (
                <div key={entry.id} className="border rounded p-2">
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1 small">
                    <span className="badge text-bg-secondary">{entry.method}</span>
                    <span className={`badge ${statusBadgeClass(entry.ok)}`}>{entry.status}</span>
                    <code className="text-body-secondary">{entry.path}</code>
                    <span className="text-body-secondary ms-auto">
                      {new Date(entry.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <pre className="bg-body-tertiary p-2 rounded mb-0 small">{JSON.stringify(entry.payload, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
