// Lista SIMPLES de todos os calendarios (calendar_manager cru, sem agrupar
// com eventos) — busca + paginacao de servidor, nada mais (sem acoes, sem
// criar/editar aqui). Consome o motor generico do "Construtor de Listas"
// (list_manager/list_columns, slug 'calendar-list') — mesmo padrao de
// pages/v1/user/user-profiles/GetAllPage.tsx, so que sem list_actions e sem
// filtro extra (so o campo de busca). Colunas/ordem sao dado do banco, nao
// deste arquivo — mudar em /v1/list-constructor.
// Ver src/markdown/geral/README_list_constructor.md.
//
// ARRASTAR PARA REORDENAR (2026-09-26) — decisao de arquitetura: tratado
// EXCLUSIVAMENTE aqui (coluna do icone e a logica de drag/drop sao fixas
// deste arquivo), NAO no motor generico list_manager/list_columns/
// utils/listConstructor.tsx. Colocar isso no motor exigiria inventar um tipo
// de coluna novo + convencao de endpoint de reordenacao para uma necessidade
// que hoje e de UMA lista so — quebraria a simplicidade do Construtor de
// Listas. Se outra lista precisar do mesmo no futuro, ai sim generalizar.
// Regras: (1) so o icone de grip inicia o arrasto (draggable), o resto da
// linha so recebe o drop; (2) so funciona ordenado por "Ordem" crescente e
// sem busca ativa (fora disso o icone fica inativo); (3) ao soltar, os
// calendarios da JANELA atual (a pagina exibida) sao renumerados
// sequencialmente pela posicao absoluta (offset da pagina + indice) e
// gravados via PUT silencioso (sem LoadingOverlay) — nenhum outro registro
// fora da pagina e tocado.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useToast } from '@/hooks/useToast';
import { http, ApiError } from '@/services/http';
import { listManagerTable, listColumnsTable, calendarManagerTable } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { resolveEndpoint } from '@/utils/formSubmit';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { paginationWindow } from '@/utils/pagination';
import type { QueryParams } from '@/types/api';
import { str, toManager, toColumn, renderCell } from '@/utils/listConstructor';
import type { ListManagerRow, ListColumnRow } from '@/utils/listConstructor';

const MANAGER_SLUG = 'calendar-list';
const ORDER_FIELD = 'sort_order';

export default function GetAllPage() {
  const toast = useToast();
  const { params, setPage, setLimit, toggleSort, patch } = usePagination();

  // Sem ?sort= na URL, o default global da app e 'id' (PAGINATION_DEFAULTS),
  // nao 'sort_order' — forcamos o default desta lista uma unica vez no
  // primeiro carregamento, sem sobrescrever se o usuario ja tiver escolhido
  // outra coluna (inclusive ao voltar por um link com sort proprio).
  const [rawSearchParams] = useSearchParams();
  const didInitSort = useRef(false);
  useEffect(() => {
    if (didInitSort.current) return;
    didInitSort.current = true;
    if (!rawSearchParams.has('sort')) {
      patch({ sort: ORDER_FIELD, order: 'ASC' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [manager, setManager] = useState<ListManagerRow | null>(null);
  const [columns, setColumns] = useState<ListColumnRow[]>([]);
  const [defsLoading, setDefsLoading] = useState(true);
  const [defsError, setDefsError] = useState<string | null>(null);

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
        setDefsError(`Listagem '${MANAGER_SLUG}' nao encontrada em list_manager.`);
        return;
      }
      setManager(found);

      const colsRaw = await listColumnsTable.find(
        { list_manager_id: found.id },
        { sort: 'sort_order', order: 'ASC', limit: 100 },
      );
      setColumns(normalizeList<Record<string, unknown>>(colsRaw).rows.map(toColumn));
    } catch (err) {
      setManager(null);
      setDefsError(err instanceof ApiError ? err.message : 'Falha ao carregar a definicao da listagem.');
    } finally {
      setDefsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDefinition();
  }, [loadDefinition]);

  // Busca ao digitar: com termo, consulta list_manager.api_search_endpoint
  // (?q=); vazio, volta ao api_get_endpoint. Sem filtro extra (lista simples).
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
      setDataError(err instanceof ApiError ? err.message : 'Falha ao carregar os calendarios.');
    } finally {
      if (seq === requestSeq.current) setDataLoading(false);
    }
  }, [manager, params, term]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Arrastar para reordenar — so faz sentido olhando a lista ordenada por
  // "Ordem" crescente e sem busca ativa (fora disso a janela exibida nao
  // corresponde a um intervalo contiguo de sort_order).
  const canDrag = params.sort === ORDER_FIELD && params.order === 'ASC' && term === '';
  const draggedIdRef = useRef<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  /**
   * Grava o sort_order novo de cada linha alterada — sem loading (pedido do
   * usuario, a UI ja reordenou otimisticamente), mas com toast de sucesso ou
   * erro ao final da gravacao.
   */
  const persistOrder = useCallback(
    async (changes: { id: number; sortOrder: number }[]) => {
      try {
        await Promise.all(changes.map((c) => calendarManagerTable.update(c.id, { [ORDER_FIELD]: c.sortOrder })));
        toast.success('Ordem atualizada.', { title: 'Reordenar' });
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Falha ao salvar a nova ordem.', { title: 'Reordenar' });
      }
    },
    [toast],
  );

  const handleDrop = useCallback(
    (targetId: number) => {
      const sourceId = draggedIdRef.current;
      draggedIdRef.current = null;
      setDragOverId(null);
      if (!canDrag || sourceId === null || sourceId === targetId) return;

      // O efeito colateral (persistOrder/API) fica FORA da funcao de
      // atualizacao do setRows: em StrictMode (dev) o React chama essa
      // funcao 2x de proposito para checar pureza — um efeito colateral
      // dentro dela dispara 2x e duplica o toast. `changes` so e lido depois
      // que o setRows sincrono termina.
      let changes: { id: number; sortOrder: number }[] = [];

      setRows((prev) => {
        const sourceIndex = prev.findIndex((r) => Number(r.id) === sourceId);
        const targetIndex = prev.findIndex((r) => Number(r.id) === targetId);
        if (sourceIndex === -1 || targetIndex === -1) return prev;

        const reordered = [...prev];
        const [moved] = reordered.splice(sourceIndex, 1);
        if (!moved) return prev;
        reordered.splice(targetIndex, 0, moved);

        // Renumera pela posicao ABSOLUTA (offset da pagina + indice) — a
        // janela exibida passa a ocupar exatamente o intervalo de sort_order
        // correspondente a ela, sem tocar em nenhum registro de outra pagina.
        const offset = (params.page - 1) * params.limit;
        const localChanges: { id: number; sortOrder: number }[] = [];
        const next = reordered.map((row, i) => {
          const newOrder = offset + i + 1;
          if (Number(row[ORDER_FIELD]) !== newOrder) {
            localChanges.push({ id: Number(row.id), sortOrder: newOrder });
          }
          return { ...row, [ORDER_FIELD]: newOrder };
        });

        changes = localChanges;
        return next;
      });

      if (changes.length > 0) void persistOrder(changes);
    },
    [canDrag, params.page, params.limit, persistOrder],
  );

  const error = defsError ?? dataError;

  return (
    <>
      <PageHeader title={manager?.title || 'Calendários'} subtitle={manager?.apiGetEndpoint || 'api/v1/calendar-manager'} />

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
              placeholder="Buscar por nome, descrição ou local"
              aria-label="Buscar calendários"
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

      {error && !defsLoading && <EmptyState title="Lista indisponivel" description={error} variant="danger" />}

      {!defsLoading && !error && !dataLoading && rows.length === 0 && (
        <EmptyState
          variant="warning"
          eyebrow={term !== '' ? 'Busca' : 'Lista vazia'}
          title="Nenhum calendário encontrado"
          description={term !== '' ? `Nada corresponde a '${searchInput.trim()}'.` : 'Nenhum calendário cadastrado ainda.'}
        />
      )}

      {!defsLoading && !error && (dataLoading || rows.length > 0) && (
        <div className="card border-0 shadow-sm position-relative">
          {dataLoading && <LoadingOverlay overlay />}

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '2.5rem' }} aria-label="Arrastar para reordenar" />
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
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const rowId = Number(row.id);
                  return (
                    <tr
                      key={str(row.id) || i}
                      className={dragOverId === rowId ? 'table-active' : undefined}
                      onDragOver={canDrag ? (e) => e.preventDefault() : undefined}
                      onDragEnter={canDrag ? () => setDragOverId(rowId) : undefined}
                      onDragLeave={canDrag ? () => setDragOverId((cur) => (cur === rowId ? null : cur)) : undefined}
                      onDrop={canDrag ? () => handleDrop(rowId) : undefined}
                    >
                      <td>
                        {/* So este icone inicia o arrasto — o resto da linha nunca vira draggable. */}
                        <i
                          className="bi bi-grip-vertical"
                          draggable={canDrag}
                          onDragStart={canDrag ? () => { draggedIdRef.current = rowId; } : undefined}
                          onDragEnd={() => { draggedIdRef.current = null; setDragOverId(null); }}
                          role="button"
                          tabIndex={canDrag ? 0 : -1}
                          aria-label={canDrag ? 'Arrastar para reordenar' : 'Ordene pela coluna Ordem (crescente), sem busca ativa, para arrastar'}
                          title={canDrag ? 'Arraste para reordenar' : 'Ordene pela coluna Ordem (crescente), sem busca ativa, para arrastar'}
                          style={{ cursor: canDrag ? 'grab' : 'not-allowed', opacity: canDrag ? 1 : 0.35 }}
                        />
                      </td>
                      {columns.map((c) => (
                        <td key={c.id}>{renderCell(c, row)}</td>
                      ))}
                    </tr>
                  );
                })}
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
    </>
  );
}
