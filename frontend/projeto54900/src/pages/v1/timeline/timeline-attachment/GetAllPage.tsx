/**
 * =============================================================================
 * FILE HEADER — pages/v1/timeline/timeline-attachment/GetAllPage.tsx
 * =============================================================================
 *
 * O QUE FAZ:
 *   Página `/v1/timeline-attachment`: grid de CARDS dos anexos de publicação
 *   (`timeline_post_attachments`), não tabela — pedido explícito do usuário
 *   ("Cards de uploads, mini vídeos, mini imagens, ícones para documentos").
 *   Por isso NÃO é wrapper de `StandardListPage.tsx` (que só sabe desenhar
 *   tabela): página própria, busca+paginação de SERVIDOR no mesmo padrão
 *   (`usePagination`/`useDebounce`), preview de mídia via
 *   `components/global/MediaPreview.tsx`.
 *
 * DE ONDE VEM CADA COISA:
 *   definição -> `list_manager` (slug `timeline-attachment`, sem
 *               `list_columns` — não há tabela) + `list_actions` (só
 *               'Excluir', api_call) via `@/utils/listConstructor`
 *   dados     -> `api_get_endpoint`/`api_search_endpoint` do manager
 *               (`timeline-post-attachments-view/get-all|search`)
 *   binário   -> o grupo de anexos está sob `jwtauth`: `<img>/<video>/<a>`
 *               não mandam `Authorization` (dá 401). Cada card baixa o
 *               binário com token (`timelinePostAttachmentsUpload.fetchBlob`)
 *               e monta um `blob:` URL — mesmo padrão de
 *               `pages/v1/timeline/home-feed/PostCard.tsx`. URLs liberados
 *               (`revokeObjectURL`) a cada nova página/busca e ao desmontar.
 *   ação      -> só 'Excluir' (api_call, `delete-soft/{id}`, com confirmação
 *               vinda do banco) — sem 'Ver' (o próprio card já abre o
 *               arquivo) e sem 'Editar' (mesma decisão das outras 4 listas
 *               Timeline, ver `StandardListPage.tsx`).
 *
 * DEPENDÊNCIAS: `@/services/v1` (`listManagerTable`/`listActionsTable`/
 *   `timelinePostAttachmentsUpload`), `@/utils/listConstructor`,
 *   `@/services/http`, `@/hooks/{usePagination,useDebounce,useToast}`,
 *   `@/utils/{apiResult,formSubmit,pagination}`, `@/components/global`
 *   (`PageHeader`, `EmptyState`, `LoadingOverlay`, `MediaPreview`).
 *
 * CONSUMIDORES: `routes/v1/timeline.routes.tsx` (`path: 'timeline-attachment'`),
 *   item de menu "Anexos/Uploads" (`menu_manager.id=35`).
 * -----------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import MediaPreview from '@/components/global/MediaPreview';
import type { MediaAttachment, MediaCategory } from '@/components/global/MediaPreview';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { http, ApiError } from '@/services/http';
import { listManagerTable, listActionsTable, timelinePostAttachmentsUpload } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { resolveEndpoint } from '@/utils/formSubmit';
import { paginationWindow } from '@/utils/pagination';
import { toManager, toAction, resolveHrefTemplate } from '@/utils/listConstructor';
import type { ListManagerRow, ListActionRow } from '@/utils/listConstructor';
import type { QueryParams } from '@/types/api';

/** Único dado de configuração fixo no código — o slug do `list_manager` desta tela. */
const SLUG = 'timeline-attachment';

const MEDIA_CATEGORIES: readonly MediaCategory[] = [
  'image', 'video', 'audio', 'document', 'spreadsheet', 'presentation', 'pdf', 'archive', 'other',
];

function str(v: unknown): string {
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '';
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

interface AttachmentCard {
  /** Linha crua da view (`view_timeline_post_attachments`) — usada nos templates de `list_actions`. */
  row: Record<string, unknown>;
  /** Metadado + `fileUrl` já resolvido para `blob:` (ver header). */
  media: MediaAttachment;
}

function toMedia(raw: Record<string, unknown>): MediaAttachment {
  const category = str(raw.ta_category);
  return {
    id: num(raw.id),
    category: (MEDIA_CATEGORIES as readonly string[]).includes(category) ? (category as MediaCategory) : 'other',
    fileUrl: '',
    name: str(raw.ta_title) || str(raw.ta_original_name) || 'Anexo',
  };
}

export default function TimelineAttachmentGetAllPage() {
  const toast = useToast();
  const { params, setPage, setLimit } = usePagination();

  // GRUPO 1 — definição (endpoint + ação de excluir).
  const [manager, setManager] = useState<ListManagerRow | null>(null);
  const [deleteAction, setDeleteAction] = useState<ListActionRow | null>(null);
  const [defsLoading, setDefsLoading] = useState(true);
  const [defsError, setDefsError] = useState<string | null>(null);

  // GRUPO 2 — cards carregados (metadado + binário já em blob:).
  const [cards, setCards] = useState<AttachmentCard[]>([]);
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
      const found = managerRows.map(toManager).find((m) => m.slug === SLUG) ?? null;

      if (!found) {
        setManager(null);
        setDefsError(`Listagem '${SLUG}' não encontrada em list_manager.`);
        return;
      }
      setManager(found);

      const actionsRaw = await listActionsTable.find(
        { list_manager_id: found.id },
        { sort: 'sort_order', order: 'ASC', limit: 10 },
      );
      const actions = normalizeList<Record<string, unknown>>(actionsRaw).rows.map(toAction);
      setDeleteAction(actions.find((a) => a.actionType === 'api_call') ?? null);
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
  // blob: URLs da página atual — liberados antes de trocar de página/busca e ao desmontar.
  const objectUrlsRef = useRef<string[]>([]);

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

      // Metadado (síncrono, já na view) + binário autenticado por card (serve/{id} -> blob:).
      const loaded = await Promise.all(
        list.map(async (row) => {
          const media = toMedia(row);
          try {
            const blob = await timelinePostAttachmentsUpload.fetchBlob(media.id);
            return { row, media: { ...media, fileUrl: URL.createObjectURL(blob) } };
          } catch {
            return null; // binário indisponível: some só este card, não a página inteira
          }
        }),
      );
      if (seq !== requestSeq.current) {
        loaded.forEach((c) => c && URL.revokeObjectURL(c.media.fileUrl));
        return;
      }

      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      const valid = loaded.filter((c): c is AttachmentCard => c !== null);
      objectUrlsRef.current = valid.map((c) => c.media.fileUrl);
      setCards(valid);
      setTotal(t);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setCards([]);
      setTotal(0);
      setDataError(err instanceof ApiError ? err.message : 'Falha ao carregar os anexos.');
    } finally {
      if (seq === requestSeq.current) setDataLoading(false);
    }
  }, [manager, params, term]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Libera os blob: URLs da última página exibida ao desmontar a tela.
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleDelete = useCallback(
    async (row: Record<string, unknown>) => {
      if (!deleteAction) return;
      const message = resolveHrefTemplate(deleteAction.confirmMessage, row) || `Confirma ${deleteAction.label}?`;
      if (deleteAction.confirm && !window.confirm(message)) return;
      try {
        const path = resolveEndpoint(resolveHrefTemplate(deleteAction.apiEndpoint, row));
        await http.delete(path);
        toast.success('Ação concluída.', { title: deleteAction.label });
        void loadData();
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Falha ao executar a ação.', { title: deleteAction.label });
      }
    },
    [deleteAction, toast, loadData],
  );

  const error = defsError ?? dataError;

  return (
    <>
      <PageHeader title={manager?.title || SLUG} subtitle={manager?.apiGetEndpoint || `slug: ${SLUG}`} />

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
              placeholder="Buscar anexos"
              aria-label="Buscar anexos"
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

      {!defsLoading && !error && !dataLoading && cards.length === 0 && (
        <EmptyState
          variant="warning"
          eyebrow={term !== '' ? 'Busca' : 'Lista vazia'}
          title={term !== '' ? 'Nada encontrado' : 'Nenhum anexo encontrado'}
          description={term !== '' ? `Nada corresponde a '${searchInput.trim()}'.` : 'Nenhum anexo cadastrado ainda.'}
        />
      )}

      {!defsLoading && !error && (dataLoading || cards.length > 0) && (
        <div className="position-relative">
          {dataLoading && <LoadingOverlay overlay />}

          <div className="d-flex flex-wrap gap-3">
            {cards.map(({ row, media }) => (
              <div key={media.id} className="card border-0 shadow-sm" style={{ width: '240px' }}>
                <div className="card-body p-2 position-relative">
                  {deleteAction && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-1"
                      style={{ zIndex: 1 }}
                      aria-label={deleteAction.label}
                      title={deleteAction.label}
                      onClick={() => void handleDelete(row)}
                    >
                      <i className={`bi bi-${deleteAction.icon}`} />
                    </button>
                  )}
                  <MediaPreview attachments={[media]} />
                  <div className="small text-truncate" title={str(row.tp_title)}>
                    {str(row.tp_title) || '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
            <div className="d-flex align-items-center gap-2 small text-body-secondary">
              <span>{total} anexo(s) · Por página</span>
              <select
                className="form-select form-select-sm w-auto"
                value={params.limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                {(manager?.limitOptions.length ? manager.limitOptions : [12, 24, 48, 96]).map((n) => (
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
