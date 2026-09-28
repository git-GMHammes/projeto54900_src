/**
 * =============================================================================
 * FILE HEADER — pages/v1/timeline/StandardListPage.tsx
 * =============================================================================
 *
 * O QUE FAZ:
 *   Página de LISTAGEM PADRÃO do módulo Timeline, reaproveitada pelas 5 rotas
 *   de recurso (`/v1/timeline-post`, `/v1/timeline-manager`,
 *   `/v1/timeline-comment`, `/v1/timeline-report`, `/v1/timeline-attachment`).
 *   Cada uma passa apenas o `slug` do registro correspondente em
 *   `list_manager`; título, endpoint, colunas, ordenação padrão, limites e
 *   busca vêm TODOS do banco — nada de coluna fixa no código e NENHUM
 *   formulário (as telas de form continuam no renderizador genérico
 *   `/v1/form/<slug>`).
 *
 *   Espelha `pages/v1/calendar/calendar-list/GetAllPage.tsx` (lista simples:
 *   busca + paginação de SERVIDOR, sem agrupamento no cliente e sem
 *   `list_actions`), com duas diferenças deliberadas:
 *     1. o slug é PROP (o mesmo componente serve as 5 rotas), no lugar de uma
 *        constante de módulo;
 *     2. a ordenação padrão é aplicada a partir do próprio `list_manager`
 *        (`default_sort`/`default_order`), como faz
 *        `pages/v1/timeline/timeline-posts/GetAllPage.tsx` — porque aqui o
 *        campo de ordenação não é conhecido em tempo de compilação.
 *
 * DE ONDE VEM CADA COISA:
 *   definição -> `list_manager` (slug da prop) + `list_columns`
 *               (`list_manager_id`), normalizados por `@/utils/listConstructor`
 *   dados     -> `api_get_endpoint` (GET) ou `api_search_endpoint` (GET, com
 *               `?q=`) quando há termo de busca — os dois vêm do manager
 *   paginação -> a URL (`page`/`limit`/`sort`/`order`), via `usePagination`
 *   célula    -> `renderCell(coluna, linha)` (concat_json/fallback do motor)
 *
 * DEPENDÊNCIAS: `@/services/v1` (`listManagerTable`/`listColumnsTable`),
 *   `@/utils/listConstructor`, `@/services/http`, `@/hooks/{usePagination,
 *   useDebounce}`, `@/utils/{apiResult,formSubmit,pagination}`,
 *   `@/components/global` (`PageHeader`, `EmptyState`, `LoadingOverlay`).
 *
 * CONSUMIDORES: `pages/v1/timeline/{timeline-post,timeline-manager,
 *   timeline-comment,timeline-report,timeline-attachment}/GetAllPage.tsx`
 *   (wrappers finos, um por rota) e, por tabela, `routes/v1/timeline.routes.tsx`.
 *
 * REGRAS DE MANUTENÇÃO / ARMADILHAS:
 *   1. A listagem em si (slug, `table_name`, endpoints, colunas) vive no BANCO:
 *      enquanto o registro em `list_manager` não existir, a página mostra
 *      "Listagem '<slug>' não encontrada em list_manager" — criar/ajustar em
 *      `/v1/list-constructor`.
 *   2. O motor aqui é GET apenas (como `calendar-list`). Se a listagem usar um
 *      endpoint POST (ex.: `get-grouped`), este componente NÃO serve: a página
 *      do recurso precisa do caminho próprio — ver
 *      `timeline-posts/GetAllPage.tsx` (POST com corpo).
 *   3. `list_actions` (Ver/Excluir/...): carregadas do mesmo `list_manager_id`,
 *      renderizadas pelo `ActionButton` local (mesmo padrão de
 *      `calendar-manager/RowActionButton.tsx` e `FormConstructorListPage.tsx`
 *      — o projeto não tem um componente de ação compartilhado). 'modal' avisa
 *      esta página por uma chave fixa em `href_template`: `ver-detalhes` abre
 *      as colunas da própria linha; `ver-anexos` busca (autenticado, blob:) os
 *      anexos da publicação referenciada pela linha (`tp_id`, ou `id` se a
 *      própria linha já for um post — pedido na lista `timeline-report`, para
 *      moderar denúncia vendo o anexo denunciado). 'api_call' executa direto
 *      (com `confirm`, se configurado). 'link' NÃO é suportado de propósito
 *      (anti-padrão documentado em `timeline-feed`: Ver/Comentar/Editar
 *      linkam para rotas que não existem).
 *   4. `slug` é a ÚNICA configuração desta página: mudar a rota sem mudar o
 *      slug (ou vice-versa) deixa a tela vazia sem erro de compilação.
 * -----------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import Modal from '@/components/global/Modal';
import MediaPreview from '@/components/global/MediaPreview';
import type { MediaAttachment, MediaCategory } from '@/components/global/MediaPreview';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { http, ApiError } from '@/services/http';
import {
  listManagerTable,
  listColumnsTable,
  listActionsTable,
  timelinePostAttachmentsTable,
  timelinePostAttachmentsUpload,
} from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { resolveEndpoint } from '@/utils/formSubmit';
import { paginationWindow } from '@/utils/pagination';
import { str, num, toManager, toColumn, toAction, renderCell, resolveHrefTemplate } from '@/utils/listConstructor';
import type { ListManagerRow, ListColumnRow, ListActionRow } from '@/utils/listConstructor';
import type { QueryParams } from '@/types/api';

const MEDIA_CATEGORIES: readonly MediaCategory[] = [
  'image', 'video', 'audio', 'document', 'spreadsheet', 'presentation', 'pdf', 'archive', 'other',
];

function toMedia(raw: Record<string, unknown>): MediaAttachment {
  const category = str(raw.category);
  return {
    id: num(raw.id),
    category: (MEDIA_CATEGORIES as readonly string[]).includes(category) ? (category as MediaCategory) : 'other',
    fileUrl: '',
    name: str(raw.title) || str(raw.original_name) || 'Anexo',
  };
}

/**
 * Botão só-ícone de uma ação de `list_actions` para uma linha da lista
 * padrão. Mesma divisão de responsabilidade de
 * `calendar-manager/RowActionButton.tsx`: 'modal' avisa a página (que decide
 * o que abrir, pelo slug em `hrefTemplate`); 'api_call' executa de verdade,
 * com `{campo}` do endpoint/mensagem resolvido a partir da própria `row`.
 * 'link' não é tratado (retorna `null`) — decisão do módulo, ver header.
 */
function ActionButton({
  action,
  row,
  onOpenModal,
  onExecuted,
}: {
  action: ListActionRow;
  row: Record<string, unknown>;
  onOpenModal: (targetSlug: string, row: Record<string, unknown>) => void;
  onExecuted: (action: ListActionRow) => void;
}) {
  const toast = useToast();

  if (action.actionType === 'link') return null;

  const withTooltip = (button: ReactNode) => (
    <span className="icon-action-tooltip">
      {button}
      <span className="icon-action-tooltip-bubble" role="tooltip">
        {action.label}
      </span>
    </span>
  );

  if (action.actionType === 'modal') {
    return withTooltip(
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        aria-label={action.label}
        onClick={() => onOpenModal(action.hrefTemplate, row)}
      >
        <i className={`bi bi-${action.icon}`} />
      </button>,
    );
  }

  const execute = async () => {
    const message = resolveHrefTemplate(action.confirmMessage, row) || `Confirma ${action.label}?`;
    if (action.confirm && !window.confirm(message)) return;
    try {
      const path = resolveEndpoint(resolveHrefTemplate(action.apiEndpoint, row));
      const method = action.httpMethod.toUpperCase();
      if (method === 'DELETE') await http.delete(path);
      else if (method === 'PUT') await http.put(path);
      else if (method === 'PATCH') await http.patch(path);
      else if (method === 'POST') await http.post(path);
      else await http.get(path);
      onExecuted(action);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao executar a ação.', { title: action.label });
    }
  };

  return withTooltip(
    <button
      type="button"
      className="btn btn-sm btn-outline-danger"
      aria-label={action.label}
      onClick={() => void execute()}
    >
      <i className={`bi bi-${action.icon}`} />
    </button>,
  );
}

/**
 * =============================================================================
 * BLOCO 1 — PROPS
 * =============================================================================
 *
 * Só o `slug` é obrigatório (o resto tem default genérico). Os textos são
 * props para cada rota ajustar o vazio ao seu recurso sem duplicar a página.
 * -----------------------------------------------------------------------------
 */
export interface StandardListPageProps {
  /** Slug do registro em `list_manager` que define esta listagem. */
  slug: string;
  /** Placeholder do campo de busca (default genérico). */
  searchPlaceholder?: string;
  /** Título do `EmptyState` quando a lista não tem registros. */
  emptyTitle?: string;
  /** Descrição do `EmptyState` quando a lista não tem registros. */
  emptyDescription?: string;
}

/**
 * =============================================================================
 * BLOCO 2 — PÁGINA
 * =============================================================================
 *
 * Mesma divisão de `calendar-list/GetAllPage.tsx`: GRUPO 1 (definição,
 * carregada uma vez no mount) e GRUPO 2 (dados, recarregados a cada mudança de
 * página/busca/ordenação).
 * -----------------------------------------------------------------------------
 */
export default function StandardListPage({
  slug,
  searchPlaceholder = 'Buscar',
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription = 'Nenhum registro cadastrado ainda.',
}: StandardListPageProps) {
  const { params, setPage, setLimit, toggleSort, patch } = usePagination();
  const toast = useToast();

  // GRUPO 1 — definição (o que a lista é).
  const [manager, setManager] = useState<ListManagerRow | null>(null);
  const [columns, setColumns] = useState<ListColumnRow[]>([]);
  const [actions, setActions] = useState<ListActionRow[]>([]);
  const [defsLoading, setDefsLoading] = useState(true);
  const [defsError, setDefsError] = useState<string | null>(null);

  // Modal "Ver" (única chave de modal deste módulo, ver header) — guarda a
  // linha clicada; suas colunas vêm de `columns` (mesma definição da tabela).
  const [viewingRow, setViewingRow] = useState<Record<string, unknown> | null>(null);

  // Modal "Ver anexo" (2a chave de modal, pedida na lista timeline-report):
  // anexos da PUBLICAÇÃO referenciada pela linha (campo `tp_id`, ou `id` se a
  // própria linha já for um post) — binário autenticado, mesmo padrão de
  // `timeline-attachment/GetAllPage.tsx` (fetchBlob + blob: URL).
  const [attachmentsRow, setAttachmentsRow] = useState<Record<string, unknown> | null>(null);
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);
  const attachmentUrlsRef = useRef<string[]>([]);

  // GRUPO 2 — dados listados (o conteúdo).
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
      const found = managerRows.map(toManager).find((m) => m.slug === slug) ?? null;

      if (!found) {
        setManager(null);
        setDefsError(`Listagem '${slug}' não encontrada em list_manager.`);
        return;
      }
      setManager(found);

      const colsRaw = await listColumnsTable.find(
        { list_manager_id: found.id },
        { sort: 'sort_order', order: 'ASC', limit: 100 },
      );
      setColumns(normalizeList<Record<string, unknown>>(colsRaw).rows.map(toColumn));

      const actionsRaw = await listActionsTable.find(
        { list_manager_id: found.id },
        { sort: 'sort_order', order: 'ASC', limit: 50 },
      );
      setActions(normalizeList<Record<string, unknown>>(actionsRaw).rows.map(toAction));
    } catch (err) {
      setManager(null);
      setDefsError(err instanceof ApiError ? err.message : 'Falha ao carregar a definição da listagem.');
    } finally {
      setDefsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadDefinition();
  }, [loadDefinition]);

  // Busca + blob de cada anexo da publicação em `attachmentsRow` (ver estado
  // acima) sempre que o modal "Ver anexo" abre; libera os blob: URLs da leva
  // anterior antes de trocar e ao desmontar.
  useEffect(() => {
    if (!attachmentsRow) return undefined;
    let active = true;
    const controller = new AbortController();
    const postId = num(attachmentsRow.tp_id, num(attachmentsRow.id));

    setAttachmentsLoading(true);
    setAttachmentsError(null);
    setAttachments([]);

    timelinePostAttachmentsTable
      .find({ timeline_post_id: postId }, { limit: 20, sort: 'sort_order', order: 'ASC' })
      .then(async (raw) => {
        const metas = normalizeList<Record<string, unknown>>(raw).rows.map(toMedia);
        const loaded = await Promise.all(
          metas.map(async (meta) => {
            try {
              const blob = await timelinePostAttachmentsUpload.fetchBlob(meta.id, controller.signal);
              return { ...meta, fileUrl: URL.createObjectURL(blob) };
            } catch {
              return null;
            }
          }),
        );
        if (!active) return;
        const valid = loaded.filter((a): a is MediaAttachment => a !== null);
        attachmentUrlsRef.current = valid.map((a) => a.fileUrl);
        setAttachments(valid);
      })
      .catch((err) => {
        if (!active) return;
        setAttachmentsError(err instanceof ApiError ? err.message : 'Falha ao carregar os anexos.');
      })
      .finally(() => {
        if (active) setAttachmentsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
      attachmentUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      attachmentUrlsRef.current = [];
    };
  }, [attachmentsRow]);

  // Ordenação padrão do PRÓPRIO manager (`default_sort`/`default_order`),
  // aplicada UMA vez, só se a URL ainda não trouxer `?sort=` — o campo não é
  // conhecido em tempo de compilação (vem do banco).
  const [rawSearchParams] = useSearchParams();
  const didInitSort = useRef(false);
  useEffect(() => {
    if (didInitSort.current || !manager) return;
    didInitSort.current = true;
    if (!rawSearchParams.has('sort') && manager.defaultSort !== '') {
      patch({ sort: manager.defaultSort, order: manager.defaultOrder.toUpperCase() });
    }
  }, [manager, rawSearchParams, patch]);

  // Busca ao digitar: com termo, consulta `api_search_endpoint` (?q=); vazio,
  // volta ao `api_get_endpoint`.
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
      setDataError(err instanceof ApiError ? err.message : 'Falha ao carregar os registros.');
    } finally {
      if (seq === requestSeq.current) setDataLoading(false);
    }
  }, [manager, params, term]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /** Ramo 'modal' de list_actions: 'ver-detalhes' (colunas da linha) ou 'ver-anexos' (mídia da publicação). */
  const handleOpenModal = useCallback((targetSlug: string, row: Record<string, unknown>) => {
    if (targetSlug === 'ver-detalhes') setViewingRow(row);
    if (targetSlug === 'ver-anexos') setAttachmentsRow(row);
  }, []);

  const handleActionExecuted = useCallback(
    (action: ListActionRow) => {
      toast.success('Ação concluída.', { title: action.label });
      void loadData();
    },
    [toast, loadData],
  );

  const error = defsError ?? dataError;

  return (
    <>
      <PageHeader
        title={manager?.title || slug}
        subtitle={manager?.apiGetEndpoint || `slug: ${slug}`}
      />

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
              placeholder={searchPlaceholder}
              aria-label="Buscar registros"
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

      {error && !defsLoading && <EmptyState title="Lista indisponível" description={error} variant="danger" />}

      {!defsLoading && !error && !dataLoading && rows.length === 0 && (
        <EmptyState
          variant="warning"
          eyebrow={term !== '' ? 'Busca' : 'Lista vazia'}
          title={term !== '' ? 'Nada encontrado' : emptyTitle}
          description={term !== '' ? `Nada corresponde a '${searchInput.trim()}'.` : emptyDescription}
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
                  {actions.length > 0 && <th>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={str(row.id) || i}>
                    {columns.map((c) => (
                      <td key={c.id}>{renderCell(c, row)}</td>
                    ))}
                    {actions.length > 0 && (
                      <td>
                        <div className="d-flex gap-1" role="group" aria-label="Ações">
                          {actions.map((a) => (
                            <ActionButton
                              key={a.id}
                              action={a}
                              row={row}
                              onOpenModal={handleOpenModal}
                              onExecuted={handleActionExecuted}
                            />
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div className="d-flex align-items-center gap-2 small text-body-secondary">
              <span>{total} registro(s) · Por página</span>
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

      <Modal open={!!viewingRow} title="Detalhes" onClose={() => setViewingRow(null)}>
        {viewingRow && (
          <dl className="row mb-0">
            {columns.map((c) => (
              <div key={c.id} className="col-12 mb-2">
                <dt className="text-body-secondary small mb-0">{c.label}</dt>
                <dd className="mb-0">{renderCell(c, viewingRow)}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>

      <Modal open={!!attachmentsRow} title="Anexos da publicação" onClose={() => setAttachmentsRow(null)} size="lg">
        {attachmentsLoading && <LoadingOverlay />}
        {attachmentsError && !attachmentsLoading && (
          <EmptyState title="Anexos indisponíveis" description={attachmentsError} variant="danger" />
        )}
        {!attachmentsLoading && !attachmentsError && attachments.length === 0 && (
          <EmptyState variant="warning" title="Sem anexos" description="Esta publicação não tem anexos." />
        )}
        {!attachmentsLoading && !attachmentsError && attachments.length > 0 && (
          <MediaPreview attachments={attachments} />
        )}
      </Modal>
    </>
  );
}
