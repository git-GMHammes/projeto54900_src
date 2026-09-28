/**
 * =============================================================================
 * FILE HEADER — pages/v1/timeline/timeline-posts-get-all/GetAllPage.tsx
 * =============================================================================
 *
 * O QUE FAZ:
 *   Página `/v1/timeline-posts-get-all`: variante ADMIN da "listagem clássica"
 *   (`pages/v1/timeline/timeline-posts/GetAllPage.tsx`, slug `timeline-feed`),
 *   com as MESMAS colunas e ações (Ver/Comentar/Curtir/Avaliar/Republicar/
 *   Denunciar/Editar/Excluir — copiadas de `list_manager` id 20 para o novo
 *   slug `timeline-posts-get-all`, id 26), mas usando `get-all` (GET simples,
 *   paginação de servidor) em vez de `get-grouped` (POST, com corpo). Pedido
 *   explícito do usuário (2026-09-28): tela só para administradores verem
 *   TODAS as publicações de todos os usuários de forma direta — `roles` do
 *   `list_manager` é `["admin"]` (a diferença de `timeline-feed`, que é
 *   `["user","admin"]`, e cujo `get-grouped` restringe ao próprio usuário do
 *   JWT mesmo para admin).
 *
 *   Fork de `timeline-posts/GetAllPage.tsx` com UMA diferença de fato: aqui
 *   `loadData` nunca precisa do corpo POST de `get-grouped` (o manager deste
 *   slug sempre aponta pra `get-all`/`search`) — resto do arquivo idêntico
 *   (mesmo `ActionButton` local com `data_action` para Curtir/Avaliar/
 *   Republicar).
 *
 * AÇÕES POR MODAL (2026-09-28): "Ver", "Comentar", "Denunciar" e "Editar"
 *   eram `link` para rotas que não existem (ou que tiravam o usuário da
 *   lista) — corrigido trocando `list_actions.action_type` para `modal`,
 *   MESMA técnica e MESMOS 4 modais de `timeline-posts/GetAllPage.tsx`
 *   (`./PostDetailsModal.tsx` importado de lá + `home-feed/
 *   {EditPostModal,NewCommentModal,NewReportModal}.tsx`) — pedido explícito
 *   do usuário de compartilhar os modais entre as duas telas, ver o header de
 *   `timeline-posts/GetAllPage.tsx` para o detalhe completo do fix.
 *
 * DE ONDE VEM CADA COISA:
 *   definição -> `list_manager` (slug `timeline-posts-get-all`) + `list_columns`
 *               + `list_actions`, normalizados por `@/utils/listConstructor`
 *   dados     -> `api_get_endpoint`/`api_search_endpoint` do próprio manager
 *               (`get-all`/`search`, sempre GET — o backend já libera todos os
 *               autores para quem tem `role_slug`='admin', ver
 *               `Services/V1/Timeline/TimelinePosts/Processor::ownerScope`)
 *   paginação -> a URL (`page`/`limit`/`sort`/`order`), via `usePagination`
 *   ação      -> `list_actions` (`link` navega; `api_call` faz HTTP de
 *               verdade, com corpo quando `data_action` é reconhecido)
 *
 * DEPENDÊNCIAS: `@/services/v1` (`listManagerTable`/`listColumnsTable`/
 *   `listActionsTable`), `@/utils/listConstructor` (motor), `@/services/http`,
 *   `@/hooks/{usePagination,useDebounce,useToast}`, `@/utils/{apiResult,
 *   formSubmit,pagination}`, `@/components/global` (`PageHeader`,
 *   `EmptyState`, `LoadingOverlay`).
 *
 * CONSUMIDORES: `routes/v1/timeline.routes.tsx` (`path: 'timeline-posts-get-all'`,
 *   lazy). Item de menu "Publicações (Admin)" (`menu_manager`, `roles: ["admin"]`).
 * =============================================================================
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
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
  num,
  toManager,
  toColumn,
  toAction,
  renderCell,
  evalBusinessRule,
  resolveHrefTemplate,
} from '@/utils/listConstructor';
import type { ListManagerRow, ListColumnRow, ListActionRow } from '@/utils/listConstructor';
import type { QueryParams } from '@/types/api';
import PostDetailsModal from '../timeline-posts/PostDetailsModal';
import EditPostModal from '../home-feed/EditPostModal';
import NewCommentModal from '../home-feed/NewCommentModal';
import NewReportModal from '../home-feed/NewReportModal';

/** Único dado de configuração fixo no código — o slug do `list_manager` desta tela. */
const MANAGER_SLUG = 'timeline-posts-get-all';

/**
 * `list_actions.data_action` reconhecidos por este `ActionButton` — os
 * `api_call` deste módulo que exigem corpo. Qualquer outro valor (ou `null`)
 * cai no comportamento padrão do motor (sem corpo).
 */
const DATA_ACTION_REACTION_LIKE = 'reaction-like';
const DATA_ACTION_REACTION_DISLIKE = 'reaction-dislike';
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

  if (dataAction === DATA_ACTION_REACTION_DISLIKE) {
    return { timeline_post_id: postId, reaction_type: 'dislike' };
  }

  if (dataAction === DATA_ACTION_REPOST) {
    // POST /timeline-posts/create exige titulo OU conteudo mesmo em repost
    // (Processor::validateOnCreate) — sem isso a API sempre devolvia 422 e
    // "Republicar" nunca funcionava. Reaproveita o conteudo do post original.
    return { repost_of_id: postId, content: str(row.tp_content) };
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

// Tooltip custom (bolha CSS) a esquerda do botao — mesmo `WithTooltip` local
// de timeline-posts/GetAllPage.tsx (acoes ficam na borda direita da tabela).
function WithTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="icon-action-tooltip">
      {children}
      <span className="icon-action-tooltip-bubble icon-action-tooltip-bubble--start" role="tooltip">
        {label}
      </span>
    </span>
  );
}

/**
 * Ação de linha: `link` navega (rota do próprio front); `modal` avisa a
 * página (`onOpenModal`, chave fixa em `href_template` — mesmo padrão de
 * `StandardListPage.tsx`), que decide qual dos 4 modais abrir; `api_call`
 * executa de verdade, com corpo quando `data_action` é reconhecido (ver
 * `buildActionBody`). Botão só-ícone (`list_actions.icon`) com tooltip do
 * rótulo; sem ícone cadastrado, cai no rótulo. Mesmo padrão de
 * `timeline-posts/GetAllPage.tsx` (`ActionButton` local, não compartilhado).
 */
function ActionButton({
  action,
  row,
  disabled,
  myReaction,
  onReacted,
  onOpenModal,
  onExecuted,
}: {
  action: ListActionRow;
  row: Record<string, unknown>;
  disabled: boolean;
  /** Curtir/Descurtir já registrado NESTA sessão para esta linha, ou `null` (a view não devolve o estado do usuário — ver `buildActionBody`). Mutuamente exclusivo, como no backend. */
  myReaction: 'like' | 'dislike' | null;
  onReacted: (type: 'like' | 'dislike') => void;
  onOpenModal: (targetSlug: string, row: Record<string, unknown>) => void;
  onExecuted: () => void;
}) {
  const toast = useToast();

  const content = action.icon ? <i className={`bi bi-${action.icon}`} aria-hidden="true" /> : action.label;
  const tip = `${action.label}${disabled ? ' (indisponível)' : ''}`;

  if (action.actionType === 'link') {
    const href = resolveHrefTemplate(action.hrefTemplate, row);
    return (
      <WithTooltip label={tip}>
        <Link
          className={`btn btn-sm btn-outline-primary ms-1${disabled ? ' disabled' : ''}`}
          to={href}
          aria-label={tip}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : undefined}
          onClick={(e) => {
            if (disabled) e.preventDefault();
          }}
        >
          {content}
        </Link>
      </WithTooltip>
    );
  }

  if (action.actionType === 'modal') {
    return (
      <WithTooltip label={tip}>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary ms-1"
          aria-label={tip}
          disabled={disabled}
          onClick={() => onOpenModal(action.hrefTemplate, row)}
        >
          {content}
        </button>
      </WithTooltip>
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
      if (action.dataAction === DATA_ACTION_REACTION_LIKE) onReacted('like');
      else if (action.dataAction === DATA_ACTION_REACTION_DISLIKE) onReacted('dislike');
      onExecuted();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao executar a ação.', { title: action.label });
    }
  };

  // Curtir/Descurtir marcado (reação já registrada nesta sessão) vira botão
  // preenchido; Excluir fica outline-danger (mesmo padrão de
  // StandardListPage.tsx); o resto (Avaliar/Republicar) mantém outline-secondary.
  const isLike = action.dataAction === DATA_ACTION_REACTION_LIKE;
  const isDislike = action.dataAction === DATA_ACTION_REACTION_DISLIKE;
  const isDelete = action.httpMethod.toUpperCase() === 'DELETE';
  const btnClass = isLike
    ? `btn btn-sm ${myReaction === 'like' ? 'btn-primary' : 'btn-outline-primary'} ms-1`
    : isDislike
      ? `btn btn-sm ${myReaction === 'dislike' ? 'btn-secondary' : 'btn-outline-secondary'} ms-1`
      : isDelete
        ? 'btn btn-sm btn-outline-danger ms-1'
        : 'btn btn-sm btn-outline-secondary ms-1';

  return (
    <WithTooltip label={tip}>
      <button
        type="button"
        className={btnClass}
        aria-label={tip}
        disabled={disabled}
        onClick={() => void execute()}
      >
        {content}
      </button>
    </WithTooltip>
  );
}

export default function TimelinePostsGetAllAdminPage() {
  const { params, setPage, setLimit, toggleSort, patch } = usePagination();

  // GRUPO 1 — definição (o que a lista é; carregada uma vez no mount).
  const [manager, setManager] = useState<ListManagerRow | null>(null);
  const [columns, setColumns] = useState<ListColumnRow[]>([]);
  const [actions, setActions] = useState<ListActionRow[]>([]);
  const [defsLoading, setDefsLoading] = useState(true);
  const [defsError, setDefsError] = useState<string | null>(null);

  // Estado dos 4 modais por linha (Ver/Comentar/Denunciar/Editar) — `null` = fechado.
  const [viewingRow, setViewingRow] = useState<Record<string, unknown> | null>(null);
  const [commentRow, setCommentRow] = useState<Record<string, unknown> | null>(null);
  const [reportRow, setReportRow] = useState<Record<string, unknown> | null>(null);
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);

  // Curtir/Descurtir registrados NESTA sessão, por linha (a view não devolve o estado do usuário) — marca o botão certo.
  const [reactions, setReactions] = useState<Map<number, 'like' | 'dislike'>>(new Map());

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
  // timeline-posts/GetAllPage.tsx.
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
      // Sempre GET (get-all/search) — diferente de timeline-posts/GetAllPage.tsx,
      // este manager nunca aponta pra get-grouped.
      const raw = await http.get(path, { params: query });
      if (seq !== requestSeq.current) return;
      const { rows: list, total: t } = normalizeList<Record<string, unknown>>(raw);
      setRows(list);
      setTotal(t);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setRows([]);
      setTotal(0);
      setDataError(err instanceof ApiError ? err.message : 'Falha ao carregar as publicações.');
    } finally {
      if (seq === requestSeq.current) setDataLoading(false);
    }
  }, [manager, params, term]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /** Ramo 'modal' de list_actions: cada chave abre um dos 4 modais por linha. */
  const handleOpenModal = useCallback((targetSlug: string, row: Record<string, unknown>) => {
    if (targetSlug === 'ver-detalhes') setViewingRow(row);
    else if (targetSlug === 'comentar') setCommentRow(row);
    else if (targetSlug === 'denunciar') setReportRow(row);
    else if (targetSlug === 'editar') setEditRow(row);
  }, []);

  const error = defsError ?? dataError;

  return (
    <>
      <PageHeader title={manager?.title || 'Todas as Publicações (Admin)'} subtitle={manager?.apiGetEndpoint || 'api/v1/timeline-posts-view/get-all'}>
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

      {error && !defsLoading && <EmptyState title="Listagem indisponível" description={error} variant="danger" />}

      {!defsLoading && !error && !dataLoading && rows.length === 0 && (
        <EmptyState
          variant="warning"
          eyebrow={term !== '' ? 'Busca' : 'Lista vazia'}
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
                            myReaction={reactions.get(num(row.id)) ?? null}
                            onReacted={(type) => setReactions((prev) => new Map(prev).set(num(row.id), type))}
                            onOpenModal={handleOpenModal}
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

      <PostDetailsModal row={viewingRow} columns={columns} onClose={() => setViewingRow(null)} />

      <NewCommentModal
        open={!!commentRow}
        postId={num(commentRow?.id)}
        onClose={() => setCommentRow(null)}
        onCreated={() => void loadData()}
      />

      <NewReportModal
        open={!!reportRow}
        postId={num(reportRow?.id)}
        onClose={() => setReportRow(null)}
        onReported={() => void loadData()}
      />

      <EditPostModal
        open={!!editRow}
        postId={num(editRow?.id)}
        content={str(editRow?.tp_content)}
        onClose={() => setEditRow(null)}
        onUpdated={() => void loadData()}
      />
    </>
  );
}
