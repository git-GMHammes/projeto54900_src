/**
 * =============================================================================
 * FILE HEADER — pages/v1/timeline/timeline-posts/GetAllPage.tsx
 * =============================================================================
 *
 * O QUE FAZ:
 *   Página `/v1/timeline-posts`: lista o feed da Timeline (`view_timeline_posts`,
 *   todas as publicações, mais recentes primeiro) e dá acesso às ações por
 *   linha (`list_actions`, slug `timeline-feed`). É a "listagem clássica" do
 *   módulo — a página inicial com feed misto/scroll infinito pedida pelo
 *   usuário é OUTRA tela (Home Feed, ainda não construída — ver
 *   `README_modulo_timeline.md` seção 9).
 *
 *   Espelha DOIS padrões já usados no projeto, combinados:
 *     - `pages/v1/calendar/calendar-list/GetAllPage.tsx` — lista simples com
 *       busca + paginação de SERVIDOR, sem agrupamento no cliente.
 *     - `pages/v1/form/FormConstructorListPage.tsx` — coluna de Ações a partir
 *       de `list_actions`, com `ActionButton` LOCAL (não é componente
 *       compartilhado — o projeto não tem um hoje; cada página de listagem
 *       escreve o seu, do jeito que Calendar e Form já fazem).
 *
 * CORPO DO `api_call` (lacuna resolvida aqui — ver README_modulo_timeline.md
 *   seção 8, decisão "corpo do api_call em aberto"): o motor genérico
 *   (`utils/listConstructor.tsx`) só resolve `{campo}` na URL — nenhuma
 *   página do projeto envia corpo em `api_call`. Como Curtir/Avaliar/
 *   Republicar são POST que EXIGEM corpo (`timeline_post_id` +
 *   `reaction_type`/`rating`/`repost_of_id`), o `ActionButton` desta página
 *   reconhece `action.dataAction` (`list_actions.data_action`, gravado na
 *   Fase 2) e monta o corpo certo antes de chamar `http.post`. Ações sem
 *   `data_action` reconhecido continuam no padrão sem corpo (Excluir).
 *
 * LACUNA CONHECIDA (documentada em `routes/v1/timeline.routes.tsx` e
 *   `README_rotas_frontend.md`, NÃO corrigida aqui): "Ver", "Comentar" e
 *   "Editar" apontam para rotas que ainda não existem (sem página de
 *   detalhe/comentários nem formulário de edição de post) — clicar cai no
 *   `NotFoundPage`. "Denunciar" já foi corrigido para o renderizador
 *   genérico real (`/v1/form/timeline-report`).
 *
 * DE ONDE VEM CADA COISA:
 *   definição -> `list_manager` (slug `timeline-feed`) + `list_columns` +
 *               `list_actions`, normalizados por `@/utils/listConstructor`
 *   dados     -> `api_get_endpoint`/`api_search_endpoint` do próprio manager
 *   paginação -> a URL (`page`/`limit`/`sort`/`order`), via `usePagination`;
 *               ordenação padrão (`tp_published_at`/`desc`) aplicada uma vez,
 *               a partir do próprio `manager`, se a URL não trouxer `sort`
 *   ação      -> `list_actions` (`link` navega; `api_call` faz HTTP de
 *               verdade, com corpo quando `data_action` é reconhecido)
 *
 * DEPENDÊNCIAS: `@/services/v1` (`listManagerTable`/`listColumnsTable`/
 *   `listActionsTable`), `@/utils/listConstructor` (motor), `@/services/http`,
 *   `@/hooks/{usePagination,useDebounce,useToast}`, `@/utils/{apiResult,
 *   formSubmit,pagination}`, `@/components/global` (`PageHeader`,
 *   `EmptyState`, `LoadingOverlay`).
 *
 * CONSUMIDORES: `routes/v1/timeline.routes.tsx` (`path: 'timeline-posts'`,
 *   lazy). Item de navbar "Feed" (`menu_manager.id=29`) aponta para cá.
 * =============================================================================
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { http, ApiError } from '@/services/http';
import { listManagerTable, listColumnsTable, listActionsTable } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { resolveEndpoint } from '@/utils/formSubmit';
import { paginationWindow } from '@/utils/pagination';
import {
  str,
  toManager,
  toColumn,
  toAction,
  renderCell,
  evalBusinessRule,
  resolveHrefTemplate,
} from '@/utils/listConstructor';
import type { ListManagerRow, ListColumnRow, ListActionRow } from '@/utils/listConstructor';
import type { QueryParams } from '@/types/api';

/** Único dado de configuração fixo no código — o slug do `list_manager` desta tela. */
const MANAGER_SLUG = 'timeline-feed';

/**
 * `list_actions.data_action` reconhecidos por este `ActionButton` — os únicos
 * três `api_call` deste módulo que exigem corpo. Qualquer outro valor (ou
 * `null`) cai no comportamento padrão do motor (sem corpo).
 */
const DATA_ACTION_REACTION_LIKE = 'reaction-like';
const DATA_ACTION_RATING = 'rating';
const DATA_ACTION_REPOST = 'repost';

/** Sinaliza que o usuário cancelou o prompt da nota (Avaliar) — aborta sem chamar a API, sem toast de erro. */
const RATING_CANCELLED = Symbol('rating-cancelled');

/**
 * Monta o corpo da chamada `api_call` a partir de `data_action` + a linha
 * clicada. `undefined` = comportamento padrão do motor (sem corpo).
 */
function buildActionBody(
  dataAction: string,
  row: Record<string, unknown>,
  toast: ReturnType<typeof useToast>,
): Record<string, unknown> | undefined | typeof RATING_CANCELLED {
  const postId = Number(row.id);

  if (dataAction === DATA_ACTION_REACTION_LIKE) {
    return { timeline_post_id: postId, reaction_type: 'like' };
  }

  if (dataAction === DATA_ACTION_REPOST) {
    return { repost_of_id: postId };
  }

  if (dataAction === DATA_ACTION_RATING) {
    const raw = window.prompt('Sua nota para esta publicação (1 a 5):', '5');
    if (raw === null) return RATING_CANCELLED;
    const rating = Number(raw);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      toast.error('Informe um número inteiro de 1 a 5.', { title: 'Avaliar' });
      return RATING_CANCELLED;
    }
    return { timeline_post_id: postId, rating };
  }

  return undefined;
}

/**
 * Ação de linha: `link` navega (rota do próprio front, inclusive o
 * renderizador genérico `/v1/form/:slug`); `api_call` executa de verdade,
 * com corpo quando `data_action` é reconhecido (ver `buildActionBody`).
 * Mesmo padrão de `FormConstructorListPage.tsx` (`ActionButton` local, não
 * compartilhado — este projeto ainda não tem esse componente global).
 */
function ActionButton({
  action,
  row,
  disabled,
  onExecuted,
}: {
  action: ListActionRow;
  row: Record<string, unknown>;
  disabled: boolean;
  onExecuted: () => void;
}) {
  const toast = useToast();

  if (action.actionType === 'link') {
    const href = resolveHrefTemplate(action.hrefTemplate, row);
    return (
      <Link
        className={`btn btn-sm btn-outline-primary ms-2${disabled ? ' disabled' : ''}`}
        to={href}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        onClick={(e) => {
          if (disabled) e.preventDefault();
        }}
      >
        {action.label}
      </Link>
    );
  }

  const execute = async () => {
    if (action.confirm && !window.confirm(action.confirmMessage || `Confirma ${action.label}?`)) {
      return;
    }

    const body = buildActionBody(action.dataAction, row, toast);
    if (body === RATING_CANCELLED) return;

    try {
      const path = resolveEndpoint(resolveHrefTemplate(action.apiEndpoint, row));
      const method = action.httpMethod.toUpperCase();
      if (method === 'DELETE') await http.delete(path);
      else if (method === 'PUT') await http.put(path, body);
      else if (method === 'PATCH') await http.patch(path, body);
      else if (method === 'POST') await http.post(path, body);
      else await http.get(path);
      onExecuted();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao executar a ação.', { title: action.label });
    }
  };

  return (
    <button type="button" className="btn btn-sm btn-outline-secondary ms-2" disabled={disabled} onClick={() => void execute()}>
      {action.label}
    </button>
  );
}

export default function TimelinePostsGetAllPage() {
  const { params, setPage, setLimit, toggleSort, patch } = usePagination();

  // GRUPO 1 — definição (o que a lista é; carregada uma vez no mount).
  const [manager, setManager] = useState<ListManagerRow | null>(null);
  const [columns, setColumns] = useState<ListColumnRow[]>([]);
  const [actions, setActions] = useState<ListActionRow[]>([]);
  const [defsLoading, setDefsLoading] = useState(true);
  const [defsError, setDefsError] = useState<string | null>(null);

  // GRUPO 2 — dados listados (o conteúdo; recarrega a cada mudança de página/busca/ordenação/ação).
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / params.limit)), [total, params.limit]);

  const loadDefinition = useCallback(async () => {
    setDefsLoading(true);
    setDefsError(null);
    try {
      const raw = await listManagerTable.getNoPagination({ sort: 'id', order: 'ASC' });
      const { rows: managerRows } = normalizeList<Record<string, unknown>>(raw);
      const found = managerRows.map(toManager).find((m) => m.slug === MANAGER_SLUG) ?? null;

      if (!found) {
        setManager(null);
        setDefsError(`Listagem '${MANAGER_SLUG}' não encontrada em list_manager.`);
        return;
      }
      setManager(found);

      const [colsRaw, actsRaw] = await Promise.all([
        listColumnsTable.find({ list_manager_id: found.id }, { sort: 'sort_order', order: 'ASC', limit: 100 }),
        listActionsTable.find({ list_manager_id: found.id }, { sort: 'sort_order', order: 'ASC', limit: 100 }),
      ]);
      setColumns(normalizeList<Record<string, unknown>>(colsRaw).rows.map(toColumn));
      setActions(normalizeList<Record<string, unknown>>(actsRaw).rows.map(toAction));
    } catch (err) {
      setManager(null);
      setDefsError(err instanceof ApiError ? err.message : 'Falha ao carregar a definição da listagem.');
    } finally {
      setDefsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDefinition();
  }, [loadDefinition]);

  // Ordenação padrão (tp_published_at/desc, do próprio `manager`) aplicada
  // UMA vez, só se a URL ainda não trouxer `?sort=` — mesmo truque de
  // calendar-list/GetAllPage.tsx, adaptado porque aqui o campo de ordenação
  // não é conhecido em tempo de compilação (vem do banco).
  const [rawSearchParams] = useSearchParams();
  const didInitSort = useRef(false);
  useEffect(() => {
    if (didInitSort.current || !manager) return;
    didInitSort.current = true;
    if (!rawSearchParams.has('sort')) {
      patch({ sort: manager.defaultSort, order: manager.defaultOrder.toUpperCase() });
    }
  }, [manager, rawSearchParams, patch]);

  // Busca ao digitar: com termo, consulta `api_search_endpoint` (?q=); vazio, volta ao `api_get_endpoint`.
  const [searchInput, setSearchInput] = useState('');
  const term = useDebounce(searchInput, 400).trim();

  const prevTerm = useRef(term);
  useEffect(() => {
    if (prevTerm.current === term) return;
    prevTerm.current = term;
    if (params.page !== 1) setPage(1);
  }, [term, params.page, setPage]);

  const requestSeq = useRef(0);

  const loadData = useCallback(async () => {
    if (!manager?.apiGetEndpoint) return;
    const seq = ++requestSeq.current;
    const searching = term !== '' && manager.apiSearchEndpoint !== '';
    setDataLoading(true);
    setDataError(null);
    try {
      const path = resolveEndpoint(searching ? manager.apiSearchEndpoint : manager.apiGetEndpoint);
      const query: QueryParams = searching ? { ...params, q: term } : { ...params };
      const raw = await http.get(path, { params: query });
      if (seq !== requestSeq.current) return;
      const { rows: list, total: t } = normalizeList<Record<string, unknown>>(raw);
      setRows(list);
      setTotal(t);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setRows([]);
      setTotal(0);
      setDataError(err instanceof ApiError ? err.message : 'Falha ao carregar o feed.');
    } finally {
      if (seq === requestSeq.current) setDataLoading(false);
    }
  }, [manager, params, term]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const error = defsError ?? dataError;

  return (
    <>
      <PageHeader title={manager?.title || 'Feed da Timeline'} subtitle={manager?.apiGetEndpoint || 'api/v1/timeline-posts-view'}>
        <button className="btn btn-outline-secondary" onClick={() => void loadData()} disabled={dataLoading}>
          Recarregar
        </button>
      </PageHeader>

      {defsLoading && <LoadingOverlay />}

      {!defsLoading && !defsError && (
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search" aria-hidden="true" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar publicações"
              aria-label="Buscar publicações"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput !== '' && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                aria-label="Limpar busca"
                onClick={() => setSearchInput('')}
              >
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}

      {error && !defsLoading && <EmptyState title="Feed indisponível" description={error} variant="danger" />}

      {!defsLoading && !error && !dataLoading && rows.length === 0 && (
        <EmptyState
          variant="warning"
          eyebrow={term !== '' ? 'Busca' : 'Feed vazio'}
          title="Nenhuma publicação encontrada"
          description={term !== '' ? `Nada corresponde a '${searchInput.trim()}'.` : 'Ninguém publicou nada ainda.'}
        />
      )}

      {!defsLoading && !error && (dataLoading || rows.length > 0) && (
        <div className="card border-0 shadow-sm position-relative">
          {dataLoading && <LoadingOverlay overlay />}

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.id}
                      role={c.sortable ? 'button' : undefined}
                      onClick={c.sortable ? () => toggleSort(c.sortKey) : undefined}
                      className={c.sortable ? 'user-select-none' : undefined}
                    >
                      {c.label}
                      {c.sortable && params.sort === c.sortKey && (
                        <span className="ms-1">{params.order === 'ASC' ? '▲' : '▼'}</span>
                      )}
                    </th>
                  ))}
                  {actions.length > 0 && <th className="text-end">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={str(row.id) || i}>
                    {columns.map((c) => (
                      <td key={c.id}>{renderCell(c, row)}</td>
                    ))}
                    {actions.length > 0 && (
                      <td className="text-end text-nowrap">
                        {actions.map((a) => (
                          <ActionButton
                            key={a.id}
                            action={a}
                            row={row}
                            disabled={!evalBusinessRule(a.businessRule, row)}
                            onExecuted={() => void loadData()}
                          />
                        ))}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div className="d-flex align-items-center gap-2 small text-body-secondary">
              <span>{total} publicação(ões) · Por página</span>
              <select
                className="form-select form-select-sm w-auto"
                value={params.limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                {(manager?.limitOptions.length ? manager.limitOptions : [10, 20, 50, 100]).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <nav aria-label="Paginação">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item${params.page <= 1 ? ' disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    disabled={params.page <= 1}
                    onClick={() => setPage(params.page - 1)}
                  >
                    Anterior
                  </button>
                </li>
                {paginationWindow(params.page, totalPages).map((tok, i) =>
                  tok === '...' ? (
                    <li key={`ellipsis-${i}`} className="page-item disabled">
                      <span className="page-link">…</span>
                    </li>
                  ) : (
                    <li key={tok} className={`page-item${tok === params.page ? ' active' : ''}`}>
                      <button
                        type="button"
                        className="page-link"
                        aria-current={tok === params.page ? 'page' : undefined}
                        onClick={() => setPage(tok)}
                      >
                        {tok}
                      </button>
                    </li>
                  ),
                )}
                <li className={`page-item${params.page >= totalPages ? ' disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    disabled={params.page >= totalPages}
                    onClick={() => setPage(params.page + 1)}
                  >
                    Próxima
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
