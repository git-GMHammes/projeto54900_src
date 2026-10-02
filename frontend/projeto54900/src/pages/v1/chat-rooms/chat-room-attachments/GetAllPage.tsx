// Lista de anexos das mensagens de chat (chat_room_attachments) — api/v1/chat-room-attachments
//
// Consumidor do MOTOR DE LISTAGENS (list_manager/list_columns/list_actions,
// slug 'chat-room-attachments'): colunas, rotulos, ordenacao e acoes vem do
// BANCO — nao existe <thead> fixo no codigo. Regra e receita completas em
// src/markdown/geral/README_render_via_list_constructor.md.
//
// Padrao visual espelhado de pages/v1/nav/GetAllPage.tsx (por sua vez
// espelho de pages/v1/user/user-manager/GetAllPage.tsx):
//   busca  -> input-group com bi-search (q no api_search_endpoint, view
//             view_chat_room_attachments: cra_original_name/cr_name/um_username/
//             uc_name/uc_email)
//   acoes  -> botao so-icone (list_actions.icon) + tooltip custom
//   rodape -> "{total} registro(s) · Por pagina" + limite + paginationWindow
//
// Acoes cadastradas em list_actions para este slug:
//   api_call  Baixar  -> GET /api/v1/chat-room-attachments/download/{id}
//                        (data_action 'download': baixa o binario como Blob com
//                        o token da sessao e salva com cra_original_name — o
//                        grupo esta sob jwtauth, <a href> daria 401)
//   link      Editar  -> /v1/chat-room-attachments/update/{id}
//   api_call  Excluir -> DELETE /api/v1/chat-room-attachments/delete-soft/{id}
//                        (window.confirm com o confirm_message do banco)

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { http, ApiError } from '@/services/http';
import { listManagerTable, listColumnsTable, listActionsTable } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { resolveEndpoint } from '@/utils/formSubmit';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { paginationWindow } from '@/utils/pagination';
import { paths } from '@/routes/paths';
import type { QueryParams } from '@/types/api';
import {
  str,
  toManager,
  toColumn,
  toAction,
  cellValue,
  renderCell,
  evalBusinessRule,
  resolveHrefTemplate,
} from '@/utils/listConstructor';
import type { ListManagerRow, ListColumnRow, ListActionRow } from '@/utils/listConstructor';

/** Dispara o "salvar como" do navegador para um Blob ja baixado (com token). */
function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Slug do list_manager que descreve esta tela (o resto da lista vem do banco). */
const MANAGER_SLUG = 'chat-room-attachments';

/**
 * Botao de UMA acao de list_actions na linha: 'link' navega pelo react-router
 * (href_template com {campos} da linha) e 'api_call' executa HTTP de verdade no
 * api_endpoint, com confirmacao opcional. 'modal' nao existe neste slug hoje —
 * se aparecer, avisa em vez de falhar em silencio.
 */
function ActionButton({
  action,
  row,
  subject,
  disabled,
  onExecuted,
}: {
  action: ListActionRow;
  row: Record<string, unknown>;
  /** Valor da 1a coluna da linha (ex.: nome do arquivo) — compoe o texto do tooltip. */
  subject: string;
  disabled: boolean;
  onExecuted: () => void;
}) {
  const toast = useToast();

  // Botao so-icone (list_actions.icon); sem icone cadastrado, cai no rotulo.
  const content = action.icon ? <i className={`bi bi-${action.icon}`} aria-hidden="true" /> : action.label;
  const tip = `${action.label}${subject ? `: ${subject}` : ''}${disabled ? ' (indisponivel)' : ''}`;

  // Tooltip custom (bolha CSS, styles/_custom.scss) em vez do `title` nativo —
  // o wrapper recebe o hover mesmo com o botao desabilitado. Variante --start
  // (bolha a esquerda): a coluna de acoes fica na borda direita da tabela.
  const withTooltip = (button: ReactNode) => (
    <span className="icon-action-tooltip ms-2">
      {button}
      <span className="icon-action-tooltip-bubble icon-action-tooltip-bubble--start" role="tooltip">
        {tip}
      </span>
    </span>
  );

  if (action.actionType === 'link') {
    const href = resolveHrefTemplate(action.hrefTemplate, row);
    return withTooltip(
      <Link
        className={`btn btn-sm btn-outline-primary${disabled ? ' disabled' : ''}`}
        to={href}
        aria-label={tip}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        onClick={(e) => {
          if (disabled) e.preventDefault();
        }}
      >
        {content}
      </Link>,
    );
  }

  if (action.actionType === 'modal') {
    return withTooltip(
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        aria-label={tip}
        disabled={disabled}
        onClick={() =>
          toast.error(`Acao '${action.dataAction || action.label}' sem tratamento nesta lista.`, {
            title: action.label,
          })
        }
      >
        {content}
      </button>,
    );
  }

  const execute = async () => {
    if (action.confirm && !window.confirm(action.confirmMessage || `Confirma ${action.label}?`)) {
      return;
    }
    try {
      // O endpoint do banco vem como "/api/v1/...": resolveEndpoint tira o
      // prefixo que o wrapper http ja adiciona.
      const path = resolveEndpoint(resolveHrefTemplate(action.apiEndpoint, row));
      const method = action.httpMethod.toUpperCase();
      if (action.dataAction === 'download') {
        const blob = await http.get<Blob>(path, { responseType: 'blob' });
        saveBlob(blob, str(row.cra_original_name) || `anexo-${str(row.id)}`);
        return;
      }
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

  return withTooltip(
    <button
      type="button"
      className={`btn btn-sm ${action.dataAction === 'download' ? 'btn-outline-secondary' : 'btn-outline-danger'}`}
      aria-label={tip}
      disabled={disabled}
      onClick={() => void execute()}
    >
      {content}
    </button>,
  );
}

export default function GetAllPage() {
  const { params, setPage, setLimit, toggleSort } = usePagination();

  // GRUPO 1 — DEFINICAO (o que a lista e), carregada uma vez no mount.
  const [manager, setManager] = useState<ListManagerRow | null>(null);
  const [columns, setColumns] = useState<ListColumnRow[]>([]);
  const [actions, setActions] = useState<ListActionRow[]>([]);
  const [defsLoading, setDefsLoading] = useState(true);
  const [defsError, setDefsError] = useState<string | null>(null);

  // GRUPO 2 — DADOS listados (recarrega a cada mudanca de URL, busca ou acao).
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

  // Busca ao digitar: com termo, consulta o api_search_endpoint (?q=); vazio,
  // volta ao api_get_endpoint.
  const [searchInput, setSearchInput] = useState('');
  const term = useDebounce(searchInput, 400).trim();

  // Termo novo sempre recomeca da pagina 1.
  const prevTerm = useRef(term);
  useEffect(() => {
    if (prevTerm.current === term) return;
    prevTerm.current = term;
    if (params.page !== 1) setPage(1);
  }, [term, params.page, setPage]);

  // Descarta resposta de requisicao antiga (digitacao rapida / troca de pagina).
  const requestSeq = useRef(0);

  const loadData = useCallback(async () => {
    // Sequenciador: so existe dado a buscar quando a definicao ja chegou.
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
      setDataError(err instanceof ApiError ? err.message : 'Falha ao carregar os anexos do chat.');
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
      <PageHeader title={manager?.title || 'Anexos do Chat'} subtitle={manager?.apiGetEndpoint || 'api/v1/chat-room-attachments'}>
        <button className="btn btn-outline-secondary me-2" onClick={() => void loadData()} disabled={dataLoading}>
          Recarregar
        </button>
        <Link className="btn btn-primary" to={paths.v1.chatRoomAttachments.create}>
          Novo anexo
        </Link>
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
              placeholder="Buscar por arquivo, sala ou usuario"
              aria-label="Buscar anexos por arquivo, sala ou usuario"
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

      {!defsLoading && !error && !dataLoading && rows.length === 0 &&
        (term !== '' ? (
          <EmptyState
            variant="warning"
            eyebrow="Busca"
            title="Nenhum anexo encontrado"
            description={`Nada corresponde a '${searchInput.trim()}'.`}
          />
        ) : (
          <EmptyState title="Nenhum anexo cadastrado" description="Envie o primeiro anexo a uma mensagem para comecar." />
        ))}

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
                            subject={columns[0] ? cellValue(columns[0], row) : ''}
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
