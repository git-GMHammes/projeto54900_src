// Lista de uploads (view_upload_manager) — index do modulo upload-manager.
//
// Fork de GetAllPage.tsx (user-manager), mesmo padrao de producao do motor
// "Construtor de Listas" — list_manager/list_columns/list_actions -> ver
// README_list_constructor.md: colunas e acoes NAO estao fixas no codigo, vem
// da definicao gravada no banco (list_manager de slug 'upload-manager',
// table_name = view_upload_manager). Acoes executam de verdade (Link real /
// chamada HTTP real).
//
// Diferenca pro fork original: sem busca (list_manager.api_search_endpoint
// nao usado aqui ainda) e cabecalho com input de arquivo (envio real via
// uploadManagerUpload.upload), preservado da versao placeholder anterior.
//
// Espelha o padrao REST do backend:
//   /v1/upload-manager      -> esta lista (get-all de view_upload_manager)
//   /v1/upload-manager/:id  -> UploadViewPage (detalhe, com botao Baixar)

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { http, ApiError } from '@/services/http';
import { listManagerTable, listColumnsTable, listActionsTable, uploadManagerUpload } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { resolveEndpoint } from '@/utils/formSubmit';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { paginationWindow } from '@/utils/pagination';
import type { QueryParams } from '@/types/api';
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

const MANAGER_SLUG = 'upload-manager';

// -----------------------------------------------------------------------------
// Botao de acao — link real (react-router) ou chamada HTTP real (api_call)
// -----------------------------------------------------------------------------

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
    try {
      const path = resolveEndpoint(resolveHrefTemplate(action.apiEndpoint, row));
      const method = action.httpMethod.toUpperCase();
      if (method === 'DELETE') await http.delete(path);
      else if (method === 'PUT') await http.put(path);
      else if (method === 'PATCH') await http.patch(path);
      else if (method === 'POST') await http.post(path);
      else await http.get(path);
      onExecuted();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao executar a acao.', { title: action.label });
    }
  };

  return (
    <button
      type="button"
      className="btn btn-sm btn-outline-danger ms-2"
      disabled={disabled}
      onClick={() => void execute()}
    >
      {action.label}
    </button>
  );
}

// -----------------------------------------------------------------------------
// Pagina
// -----------------------------------------------------------------------------

export default function UploadListPage() {
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { params, setPage, setLimit, toggleSort } = usePagination();

  const [manager, setManager] = useState<ListManagerRow | null>(null);
  const [columns, setColumns] = useState<ListColumnRow[]>([]);
  const [actions, setActions] = useState<ListActionRow[]>([]);
  const [defsLoading, setDefsLoading] = useState(true);
  const [defsError, setDefsError] = useState<string | null>(null);

  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / params.limit)), [total, params.limit]);

  // 1) Carrega a definicao (list_manager + list_columns + list_actions) do slug upload-manager.
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

      const [colsRaw, actsRaw] = await Promise.all([
        listColumnsTable.find({ list_manager_id: found.id }, { sort: 'sort_order', order: 'ASC', limit: 100 }),
        listActionsTable.find({ list_manager_id: found.id }, { sort: 'sort_order', order: 'ASC', limit: 100 }),
      ]);
      setColumns(normalizeList<Record<string, unknown>>(colsRaw).rows.map(toColumn));
      setActions(normalizeList<Record<string, unknown>>(actsRaw).rows.map(toAction));
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

  // 2) Busca os dados reais (paginacao/sort da URL).
  const loadData = useCallback(async () => {
    if (!manager?.apiGetEndpoint) return;
    setDataLoading(true);
    setDataError(null);
    try {
      const path = resolveEndpoint(manager.apiGetEndpoint);
      const raw = await http.get(path, { params: params as unknown as QueryParams });
      const { rows: list, total: t } = normalizeList<Record<string, unknown>>(raw);
      setRows(list);
      setTotal(t);
    } catch (err) {
      setRows([]);
      setTotal(0);
      setDataError(err instanceof ApiError ? err.message : 'Falha ao carregar os anexos.');
    } finally {
      setDataLoading(false);
    }
  }, [manager, params]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleFile(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadManagerUpload.upload({ file });
      toast.success(`"${file.name}" enviado.`);
      void loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha no envio do arquivo.');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  const error = defsError ?? dataError;

  return (
    <>
      <PageHeader title={manager?.title || 'Uploads'} subtitle={manager?.apiGetEndpoint || 'api/v1/upload-manager'}>
        <button className="btn btn-outline-secondary me-2" onClick={() => void loadData()} disabled={dataLoading}>
          Recarregar
        </button>
        <button
          className="btn btn-primary"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
        >
          {uploading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
          Enviar arquivo
        </button>
        <input
          ref={fileInput}
          type="file"
          className="d-none"
          onChange={(e) => void handleFile(e)}
        />
      </PageHeader>

      {defsLoading && <LoadingOverlay />}

      {error && !defsLoading && <EmptyState title="Lista indisponivel" description={error} variant="danger" />}

      {!defsLoading && !error && !dataLoading && rows.length === 0 && (
        <EmptyState
          variant="warning"
          eyebrow="Lista vazia"
          title="Nenhum anexo"
          description="Envie o primeiro em 'Enviar arquivo'."
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
                  {actions.length > 0 && <th className="text-end">Acoes</th>}
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
              <span>{total} registro(s) · Por pagina</span>
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
