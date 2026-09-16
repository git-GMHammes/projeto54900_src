// Painel dev-only: lista o JSON bruto das respostas de API capturadas em
// services/http.ts (todas as chamadas passam por la). So renderiza em hosts
// de desenvolvimento (config/envHost.ts) e quando ha pelo menos uma entrada.
//
// Sem rolagem interna deliberadamente — o painel cresce com a pagina, sem
// scrollbars aninhadas (card > lista > pre).

import { isDevHost } from '@/config/envHost';
import { useApiDebugLog, useLatestAccessToken } from '@/hooks/useApiDebugLog';
import { clear as clearApiDebugLog } from '@/services/apiDebugLog';

function statusBadgeClass(ok: boolean): string {
  return ok ? 'text-bg-success' : 'text-bg-danger';
}

export default function ApiDebugPanel() {
  const entries = useApiDebugLog();
  const latestToken = useLatestAccessToken();

  if (!isDevHost() || (entries.length === 0 && !latestToken)) return null;

  return (
    <div className="mt-3">
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
