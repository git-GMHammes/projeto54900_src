/**
 * =========================================================================
 * FILE HEADER — GetAllPage (listagem administrativa de salas de chat)
 * =========================================================================
 *
 * PROPÓSITO GERAL
 *   Lista as salas de `chat_rooms_manager` via API
 *   (`api/v1/chat-rooms-manager-view/get-all` e `/search`), com busca,
 *   ordenação e paginação de servidor e ações por linha. A página NÃO tem
 *   colunas fixas: o que aparece na tabela vem do BANCO, pelo motor de
 *   listagens (`list_manager` + `list_columns` + `list_actions`, slug
 *   `chat-rooms-manager`). Regra completa em
 *   src/markdown/geral/README_render_via_list_constructor.md.
 *
 * ROTA QUE MONTA ESTA PÁGINA
 *   `/v1/chat-rooms-manager` (routes/v1/chat-rooms.routes.tsx, dentro do
 *   RequireAuth; qualquer usuário logado, sem RequireRole).
 *
 * DEPENDÊNCIAS (imports próprios do projeto consumidos aqui)
 *   - components/global/PageHeader, EmptyState, LoadingOverlay (chrome da tela)
 *   - services/http (`http`, `ApiError`) — camada fetch base
 *   - services/v1 (`listManagerTable`, `listColumnsTable`, `listActionsTable`)
 *   - utils/apiResult (`normalizeList`) e utils/formSubmit (`resolveEndpoint`)
 *   - hooks/usePagination, hooks/useDebounce, hooks/useToast
 *   - utils/pagination (`paginationWindow`), routes/paths, types/api
 *   - utils/listConstructor (`str`, `toManager`, `toColumn`, `toAction`,
 *     `cellValue`, `renderCell`, `evalBusinessRule`, `resolveHrefTemplate`)
 *
 * CONSUMIDORES
 *   - routes/v1/chat-rooms.routes.tsx importa este componente em lazy.
 *   - O botão "Nova sala" do PageHeader navega para `paths.v1.chatRooms.create`
 *     (CreatePage); as ações "Editar" levam à UpdatePage deste módulo.
 *
 * PASSO A PASSO PARA CRIAR UMA LISTAGEM SIMILAR (motor de listagens)
 *   1. No banco, criar o registro em `list_manager` (slug, title,
 *      api_get_endpoint, api_search_endpoint, limitOptions) e as linhas de
 *      `list_columns` e `list_actions` desse slug.
 *   2. Copiar este arquivo para `pages/v1/<modulo>/<recurso>/GetAllPage.tsx`
 *      e trocar apenas a constante MANAGER_SLUG pelo slug novo.
 *   3. Ajustar placeholder/EmptyState e as rotas de navegação (paths).
 *   4. Registrar a rota e o item de menu; nunca escrever <thead> à mão.
 *
 * FLUXO PONTA A PONTA
 *   GetAllPage → loadDefinition() (list_manager/list_columns/list_actions)
 *     → loadData() → http.get(apiGetEndpoint|apiSearchEndpoint)
 *     → normalizeList() → renderCell() por coluna → ActionButton
 *     (link ou api_call) → loadData() recarrega a lista.
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { CHAT_FAVORITES_EVENT } from '@/hooks/useChatFavoriteRooms';
import { myFavorites } from '@/services/v1/chatRooms.chat';

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
import { notifyActionDone } from '@/utils/listActionToast';

/**
 * Slug do `list_manager` que descreve esta tela. É a ÚNICA amarração fixa
 * desta página: o resto (título, endpoints, colunas, ações, options de limite)
 * vem do banco. Ao replicar para outro módulo, este é o valor a trocar.
 */
const MANAGER_SLUG = 'chat-rooms-manager';

/**
 * =========================================================================
 * BLOCO 1 — ActionButton (botão de UMA ação da linha)
 * =========================================================================
 *
 * O QUE FAZ: renderiza a ação de `list_actions` da linha, decidindo pelo
 * `actionType` gravado no banco:
 *   - `link`     → <Link> do react-router para `href_template`, resolvido
 *                  contra os campos da própria linha (ex.: update/{id}).
 *   - `api_call` → dispara HTTP real contra `api_endpoint` (DELETE/PUT/PATCH/
 *                  POST/GET), com `window.confirm` opcional antes.
 *   - `modal`    → não existe neste slug hoje; se aparecer, avisa por toast
 *                  em vez de falhar em silêncio.
 * POR QUE É IMPORTANTE: é o único ponto que transforma a definição do banco em
 * navegação (link) ou escrita real na API (api_call).
 * CONEXÃO: chamado pelo <tbody> da renderização (Bloco 9), recebendo `action`
 * (ListActionRow), `row`, `subject` (1ª coluna, compõe o tooltip), `disabled`
 * (regra de negócio) e `onExecuted` (recarrega a lista).
 * COMO REAPROVEITAR: é genérico — não conhece o módulo chat-rooms, só o formato
 * de `ListActionRow`; serve a qualquer listagem do motor.
 * -------------------------------------------------------------------------
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
  /** Valor da 1a coluna da linha (ex.: nome da sala) — compoe o texto do tooltip. */
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

  // Favorito: um botão alternado. Vazado = não favorita (clique favorita);
  // preenchido = favorita (clique desfavorita). Estado vem de row.favorito.
  if (action.dataAction === 'favorito-toggle') {
    const isFavorite = row.favorito === 'sim';
    const roomId = str(row.id);
    const toggle = async () => {
      try {
        if (isFavorite) await http.delete(`/v1/chat-room-favorites/unfavorite/${roomId}`);
        else await http.post(`/v1/chat-room-favorites/favorite/${roomId}`);
        toast.success(
          isFavorite ? `${subject}: removida dos seus favoritos.` : `${subject}: adicionada aos seus favoritos.`,
          { title: 'Favoritos' },
        );
        onExecuted();
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Falha ao atualizar os favoritos.', {
          title: isFavorite ? 'Desfavoritar' : 'Favoritar',
        });
      }
    };
    return withTooltip(
      <button
        type="button"
        className={`btn btn-sm ${isFavorite ? 'btn-warning' : 'btn-outline-warning'}`}
        aria-label={isFavorite ? 'Desfavoritar sala' : 'Favoritar sala'}
        aria-pressed={isFavorite}
        disabled={disabled}
        onClick={() => void toggle()}
      >
        <i className={`bi bi-star${isFavorite ? '-fill' : ''}`} aria-hidden="true" />
      </button>,
    );
  }

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
      if (method === 'DELETE') await http.delete(path);
      else if (method === 'PUT') await http.put(path);
      else if (method === 'PATCH') await http.patch(path);
      else if (method === 'POST') await http.post(path);
      else await http.get(path);
      notifyActionDone(toast, action, subject);
      onExecuted();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao executar a acao.', { title: action.label });
    }
  };

  return withTooltip(
    <button
      type="button"
      className="btn btn-sm btn-outline-danger"
      aria-label={tip}
      disabled={disabled}
      onClick={() => void execute()}
    >
      {content}
    </button>,
  );
}

export default function GetAllPage() {
  /**
   * -----------------------------------------------------------------------
   * BLOCO 2 — usePagination (página/limite/ordenação refletidos na URL)
   * -----------------------------------------------------------------------
   * `params` = { page, limit, sort, order } lidos da query string;
   * `setPage`/`setLimit`/`toggleSort` reescrevem a URL. Como `loadData`
   * depende de `params`, cada mudança aqui dispara nova busca — a paginação é
   * de SERVIDOR (limit/offset), não filtra a lista em memória.
   * -----------------------------------------------------------------------
   */
  const { params, setPage, setLimit, toggleSort } = usePagination();

  /**
   * -----------------------------------------------------------------------
   * BLOCO 3 — GRUPO 1: DEFINIÇÃO (o que a lista é)
   * -----------------------------------------------------------------------
   * Carregado UMA vez no mount por loadDefinition(): o registro do
   * `list_manager` (`manager`) e as listas de `list_columns` (`columns`) e
   * `list_actions` (`actions`). `defsLoading`/`defsError` controlam o
   * LoadingOverlay e o EmptyState de erro SÓ da definição — separados do
   * loading/erro dos dados (Grupo 2), porque definição ausente é erro fatal
   * (não há tabela para montar) e dado ausente é apenas lista vazia.
   * -----------------------------------------------------------------------
   */
  const [manager, setManager] = useState<ListManagerRow | null>(null);
  const [columns, setColumns] = useState<ListColumnRow[]>([]);
  const [actionsAll, setActionsAll] = useState<ListActionRow[]>([]);
  const { user } = useAuth();
  // Ação sem `roles` vale para todos; com `roles`, só quem tem o papel.
  const userRole = user?.role?.slug ?? '';
  const actions = useMemo(
    () => actionsAll.filter((a) => a.roles.length === 0 || (userRole !== '' && a.roles.includes(userRole))),
    [actionsAll, userRole],
  );
  const [defsLoading, setDefsLoading] = useState(true);
  const [defsError, setDefsError] = useState<string | null>(null);

  /**
   * -----------------------------------------------------------------------
   * BLOCO 4 — GRUPO 2: DADOS listados
   * -----------------------------------------------------------------------
   * `rows`/`total` guardam o retorno da API e alimentam a tabela e o rodapé.
   * Recarregam a cada mudança de URL (page/limit/sort), de termo de busca ou
   * depois de uma ação api_call. `dataLoading` usa o LoadingOverlay em modo
   * overlay, para não sumir com a tabela anterior durante a recarga.
   * -----------------------------------------------------------------------
   */
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  // Salas favoritas do usuário da sessão. Cada linha recebe 'favorito' (sim/nao)
  // para as regras das ações Favoritar (nao) e Desfavoritar (sim).
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [favoriteReload, setFavoriteReload] = useState(0);
  const rowsView = useMemo(
    () => rows.map((r): Record<string, unknown> => ({ ...r, favorito: favoriteIds.has(Number(r.id)) ? 'sim' : 'nao' })),
    [rows, favoriteIds],
  );

  useEffect(() => {
    const onChange = () => setFavoriteReload((n) => n + 1);
    window.addEventListener(CHAT_FAVORITES_EVENT, onChange);
    return () => window.removeEventListener(CHAT_FAVORITES_EVENT, onChange);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    myFavorites(controller.signal)
      .then((payload) => setFavoriteIds(new Set(payload.items.map((i) => i.chat_rooms_manager_id))))
      .catch(() => {
        if (!controller.signal.aborted) setFavoriteIds(new Set());
      });
    return () => controller.abort();
  }, [favoriteReload]);
  const [total, setTotal] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  /** Última página possível (mínimo 1); alimenta o rodapé de paginação. */
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / params.limit)), [total, params.limit]);

  /**
   * =========================================================================
   * BLOCO 5 — loadDefinition (carrega a definição da listagem do banco)
   * =========================================================================
   *
   * O QUE FAZ: busca todo o `list_manager` (`getNoPagination`), localiza a
   * linha cujo `slug === MANAGER_SLUG` e, com o id dela, carrega em paralelo
   * `list_columns` e `list_actions` (ordenados por `sort_order`). Tudo é
   * convertido pelos mapeadores `toManager`/`toColumn`/`toAction`.
   * POR QUE É IMPORTANTE: sem definição não há colunas nem ações; os erros
   * apontam exatamente qual slug não foi encontrado.
   * CONEXÃO: roda no mount (useEffect logo abaixo); alimenta `loadData` (que
   * usa `manager.apiGetEndpoint`/`apiSearchEndpoint`) e a renderização.
   * COMO REAPROVEITAR: igual para outra listagem — só muda MANAGER_SLUG.
   * -------------------------------------------------------------------------
   */
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
      setActionsAll(normalizeList<Record<string, unknown>>(actsRaw).rows.map(toAction));
    } catch (err) {
      setManager(null);
      setDefsError(err instanceof ApiError ? err.message : 'Falha ao carregar a definicao da listagem.');
    } finally {
      setDefsLoading(false);
    }
  }, []);

  /** Dispara a definição uma única vez no mount (fn estável, deps vazias). */
  useEffect(() => {
    void loadDefinition();
  }, [loadDefinition]);

  /**
   * -----------------------------------------------------------------------
   * BLOCO 6 — Busca (input local, atraso de digitação e reset de página)
   * -----------------------------------------------------------------------
   * `searchInput` é o texto cru do input; `term` é o valor já passado pelo
   * useDebounce (400 ms) e sem espaços. Só `term` dispara request: com texto,
   * a página chama `api_search_endpoint` com `?q=`; vazio, volta ao
   * `api_get_endpoint`. `prevTerm` guarda o termo anterior para NÃO resetar a
   * página a cada tecla — só quando o termo efetivamente muda.
   * -----------------------------------------------------------------------
   */
  const [searchInput, setSearchInput] = useState('');
  const term = useDebounce(searchInput, 400).trim();

  const prevTerm = useRef(term);
  /** Termo novo sempre recomeça da página 1 (a página atual pode não existir
      no novo resultado). */
  useEffect(() => {
    if (prevTerm.current === term) return;
    prevTerm.current = term;
    if (params.page !== 1) setPage(1);
  }, [term, params.page, setPage]);

  /**
   * -----------------------------------------------------------------------
   * BLOCO 7 — requestSeq (descarte de resposta obsoleta)
   * -----------------------------------------------------------------------
   * Contador incremental: cada carga guarda o `seq` do momento e, ao voltar,
   * só aplica o resultado se ainda for o mais recente. Evita que uma resposta
   * lenta (digitação rápida, troca de página) sobrescreva uma resposta nova.
   * -----------------------------------------------------------------------
   */
  const requestSeq = useRef(0);

  /**
   * =========================================================================
   * BLOCO 8 — loadData (busca as linhas reais na API)
   * =========================================================================
   *
   * O QUE FAZ: escolhe o endpoint (`api_search_endpoint` quando há termo,
   * senão `api_get_endpoint`), chama via `http.get` com os parâmetros de
   * paginação/ordenação (`params`) e, no modo busca, `q`; publica o resultado
   * com `normalizeList` em `rows`/`total`.
   * POR QUE É IMPORTANTE: é o único ponto que lê dados de verdade; roda quando
   * `manager`, `params` (page/limit/sort) ou `term` mudam, e de novo após
   * cada ação executada por ActionButton.
   * CONEXÃO: depende de `manager` (Blocos 3 e 5); alimenta a tabela e o rodapé
   * (Bloco 9). Respeita `requestSeq` (Bloco 7) para descartar respostas velhas.
   * COMO REAPROVEITAR: o endpoint não é fixo no código — vem do `list_manager`;
   * a única customização por tela costuma ser a mensagem de erro do catch.
   * -------------------------------------------------------------------------
   */
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
      setDataError(err instanceof ApiError ? err.message : 'Falha ao carregar as salas de chat.');
    } finally {
      if (seq === requestSeq.current) setDataLoading(false);
    }
  }, [manager, params, term]);

  /** Recarrega os dados quando page/limit/sort, termo ou manager mudarem. */
  useEffect(() => {
    void loadData();
  }, [loadData]);

  /** Erro exibido na tela: o da definição (fatal) tem prioridade sobre o dos dados. */
  const error = defsError ?? dataError;

  /**
   * =========================================================================
   * BLOCO 9 — Renderização (JSX)
   * =========================================================================
   *
   * Ordem dos estados: (1) LoadingOverlay da definição; (2) busca; (3) erro;
   * (4) vazio, com variante "busca sem resultado" e variante "nada cadastrado";
   * (5) tabela + rodapé. As colunas vêm de `columns` e as ações de `actions`
   * (Bloco 5) — nada de <thead> fixo no código.
   * -------------------------------------------------------------------------
   */
  return (
    <>
      <PageHeader title={manager?.title || 'Salas de Chat'} subtitle={manager?.apiGetEndpoint || 'api/v1/chat-rooms-manager'}>
        <button className="btn btn-outline-secondary me-2" onClick={() => void loadData()} disabled={dataLoading}>
          Recarregar
        </button>
        <Link className="btn btn-primary" to={paths.v1.chatRooms.create}>
          Nova sala
        </Link>
      </PageHeader>

      {defsLoading && <LoadingOverlay />}

      {/* Campo de busca: só aparece com a definição carregada; o botão de
          limpar só existe com texto digitado. O valor é debounced (Bloco 6). */}
      {!defsLoading && !defsError && (
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search" aria-hidden="true" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nome, descricao ou dono"
              aria-label="Buscar salas de chat por nome, descricao ou dono"
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
            title="Nenhuma sala encontrada"
            description={`Nada corresponde a '${searchInput.trim()}'.`}
          />
        ) : (
          <EmptyState title="Nenhuma sala de chat cadastrada" description="Crie a primeira sala para comecar." />
        ))}

      {!defsLoading && !error && (dataLoading || rows.length > 0) && (
        <div className="card border-0 shadow-sm position-relative">
          {dataLoading && <LoadingOverlay overlay />}

          {/* Cabeçalho montado de `columns`; coluna sortável usa
              toggleSort(sortKey) e marca seta conforme params.sort/order. */}
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
                {rowsView.map((row, i) => (
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
                            onExecuted={() => {
                              void loadData();
                              // Favoritar/Desfavoritar atualiza a barra superior (salas favoritas).
                              window.dispatchEvent(new Event(CHAT_FAVORITES_EVENT));
                            }}
                          />
                        ))}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rodapé: total de registros, seletor de limite (limitOptions do
              list_manager) e janela de paginação (paginationWindow). */}
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
