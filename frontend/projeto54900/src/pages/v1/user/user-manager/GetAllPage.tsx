/**
 * =============================================================================
 * FILE HEADER — GetAllPage (user-manager) — lista de usuários (index do recurso)
 * =============================================================================
 *
 * O QUE FAZ:
 *   É a tela de LISTA do recurso user-manager (a rota raiz do recurso). A tabela
 *   não tem coluna nem ação escrita em código: colunas e ações vêm da DEFINIÇÃO
 *   gravada no banco, e os dados vêm da API indicada por essa definição.
 *   Acrescenta, em relação ao fork que a originou, uma CAIXA DE BUSCA.
 *
 * FORK DO MOTOR "CONSTRUTOR DE LISTAS" (o que isso significa na prática):
 *   `FormConstructorListPage.tsx` é a versão de produção do motor; esta página
 *   segue o mesmo desenho — `list_manager` (slug `user-manager`,
 *   `table_name = view_user_manager`) + `list_columns` + `list_actions` —, com
 *   uma diferença real: o campo `api_search_endpoint` da definição é usado pela
 *   primeira vez no projeto, com `useDebounce` de 400ms.
 *   Leitura de apoio: `README_list_constructor.md` e
 *   `README_render_via_list_constructor.md`.
 *
 * ESPELHO REST DO BACK-END (para não confundir as rotas):
 *   /v1/user-manager              -> esta lista (dados de view_user_manager)
 *   /v1/user-manager/create       -> `CreatePage.tsx`
 *   /v1/user-manager/:id          -> `GetPage.tsx` (detalhe)
 *   /v1/user-manager/update/:id   -> `UpdatePage.tsx`
 *
 * FLUXO (6 etapas):
 *   1. `loadDefinition` (BLOCO 4) lê a definição (manager + colunas + ações);
 *   2. `loadData` (BLOCO 5) busca as LINHAS, usando a URL como fonte da verdade
 *      (`page`/`limit`/`sort`/`order`) e o termo de busca quando houver;
 *   3. ações de linha executam de verdade — `link` navega, `api_call` faz HTTP
 *      (BLOCO 2) — e avisam a página, que recarrega a lista;
 *   4. `error` compõe os dois erros possíveis (BLOCO 6);
 *   5. o JSX (BLOCO 7) decide entre overlay, estado vazio e tabela;
 *   6. paginação, limite por página e ordenação são controlados por
 *      `usePagination` (URL) — não há estado de página no componente.
 *
 * DEPENDÊNCIAS:
 *   - `@/services/v1` (`listManagerTable`, `listColumnsTable`, `listActionsTable`)
 *     e `@/services/http` (`http`, `ApiError`) — definição e dados.
 *   - `@/utils/listConstructor` (`str`, `toManager`, `toColumn`, `toAction`,
 *     `renderCell`, `evalBusinessRule`, `resolveHrefTemplate`) — o motor:
 *     converte linhas cruas em tipos de UI, formata células e avalia regras.
 *   - `@/utils/apiResult` (`normalizeList`), `@/utils/formSubmit`
 *     (`resolveEndpoint`), `@/utils/pagination` (`paginationWindow`).
 *   - `@/hooks/usePagination`, `@/hooks/useDebounce`, `@/hooks/useToast`.
 *   - `@/components/global` (`PageHeader`, `EmptyState`, `LoadingOverlay`) e
 *     `@/routes/paths`.
 *
 * CONSUMIDORES: `src/routes/v1/user.routes.tsx` (rota raiz do recurso, lazy).
 *   É aberta pelo menu lateral e pelos botões "Voltar" de `CreatePage`,
 *   `GetPage` e `UpdatePage`.
 *
 * COMO CRIAR UMA LISTAGEM NOVA COM ESTE MOTOR:
 *   1. crie o `list_manager` no banco (slug, `table_name`, `api_get_endpoint`,
 *      ordenação/limite padrão e, se houver busca, `api_search_endpoint`);
 *   2. cadastre `list_columns` e `list_actions` desse manager;
 *   3. copie esta página, troque `MANAGER_SLUG` (BLOCO 1) e a rota;
 *   4. não escreva coluna nem ação em código: elas vêm da definição.
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. Coluna/ação nova NÃO se cria aqui: cria-se na definição do banco.
 *   2. As três origens de estado (definição, dados, busca) são INDEPENDENTES:
 *      erro de dados não derruba a definição, e vice-versa (BLOCO 6).
 *   3. A busca é debounced (400ms) e SEMPRE volta para a página 1 — sem isso a
 *      tela mostraria "página 3 sem resultados" com resultados na 1.
 *   4. Os caracteres de ordenação e de paginação visíveis (setas e reticências)
 *      são INTERFACE, definidos no JSX — não são comentário.
 * =============================================================================
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  renderCell,
  evalBusinessRule,
  resolveHrefTemplate,
} from '@/utils/listConstructor';
import type { ListManagerRow, ListColumnRow, ListActionRow } from '@/utils/listConstructor';

/**
 * =============================================================================
 * BLOCO 1 — CONSTANTE DE MÓDULO (a slug da listagem no banco)
 * =============================================================================
 *
 * O QUE FAZ: identifica QUAL definição de listagem esta tela usa em
 *   `list_manager`. É o filtro do BLOCO 4: carrega as definições e fica com a
 *   que tem este slug.
 *
 * POR QUE É CONSTANTE: a tela é de um recurso ESPECÍFICO (usuários), não uma
 *   listagem genérica por URL. Trocar a string troca a listagem inteira:
 *   colunas, ações, endpoint dos dados, ordenação padrão, limite e regras vêm
 *   todos do banco.
 *
 * O QUE A DEFINIÇÃO DO SLUG `user-manager` CARREGA:
 *   `table_name` = view_user_manager (a view de leitura),
 *   `api_get_endpoint` (quem lista), `api_search_endpoint` (quem busca),
 *   `default_sort`/`default_order`/`default_limit` e `limit_options`.
 * -------------------------------------------------------------------------
 */
const MANAGER_SLUG = 'user-manager';

// -----------------------------------------------------------------------------
// Botao de acao — link real (react-router) ou chamada HTTP real (api_call)
// -----------------------------------------------------------------------------

/**
 * =============================================================================
 * BLOCO 2 — ActionButton: UMA ação de linha da listagem
 * =============================================================================
 *
 * O QUE FAZ: renderiza UMA ação definida em `list_actions` (vinda do banco, não
 *   escrita em código) e a executa quando clicada. O `actionType` decide o
 *   elemento renderizado:
 *   - `link` -> `<Link>` do react-router para o `hrefTemplate` resolvido com os
 *     dados da LINHA (ex.: abrir a edição daquele registro). `aria-disabled`,
 *     `tabIndex` e `preventDefault` fazem o botão desabilitado se comportar como
 *     desabilitado também pelo teclado;
 *   - qualquer outro tipo (hoje `api_call`) -> `<button>` que dispara HTTP de
 *     VERDADE (`http.delete`/`put`/`patch`/`post`/`get`, conforme `httpMethod`),
 *     com `window.confirm` antes quando a ação tiver `confirm` e `confirmMessage`.
 *
 * PONTOS DE ATENÇÃO (é onde este componente costuma ser mexido):
 *   1. endpoint e href saem de TEMPLATES (`resolveHrefTemplate`) e passam por
 *      `resolveEndpoint`, que aplica o prefixo/versão da API — a ordem dessas
 *      duas chamadas importa: inverter quebra a URL;
 *   2. `onExecuted()` avisa a PÁGINA, e é ele que faz a lista recarregar depois
 *      de uma ação de escrita (BLOCO 5);
 *   3. `disabled` NÃO é decidido aqui: vem de `evalBusinessRule(businessRule,
 *      row)` na página (BLOCO 7) — a regra é da definição, por linha;
 *   4. falha de rede/API vira `toast.error` (o toast é do próprio componente,
 *      via `useToast`): ação que falha nunca derruba a tabela.
 *
 * COMO REAPROVEITAR: é o renderizador de ação padrão das listagens do projeto
 *   (o `ListConstructorPage.tsx` tem o irmão dele). Ao criar um TIPO novo de
 *   ação, acrescente aqui E no banco, mantendo o nome do tipo igual nos dois
 *   lados — a comparação é por string.
 * -------------------------------------------------------------------------
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

/**
 * =============================================================================
 * BLOCO 3 — ESTADO DA PÁGINA (definição x dados x busca)
 * =============================================================================
 *
 * A tela tem TRÊS origens de estado independentes, e é isso que explica os
 *   `useState` logo abaixo:
 *   1. DEFINIÇÃO (manager/columns/actions/defsLoading/defsError) — colunas e
 *      ações lidas do banco UMA vez (BLOCO 4); sem ela a tela não monta;
 *   2. DADOS (rows/total/dataLoading/dataError) — as linhas da página atual
 *      (BLOCO 5); `total` é o que alimenta a paginação;
 *   3. BUSCA (termo + `termoDebounced`) — o termo digitado e a versão atrasada em
 *      400ms (`useDebounce`), que é a que dispara a requisição: sem o debounce
 *      haveria uma chamada por tecla.
 *
 * DE ONDE VEM PAGINAÇÃO/ORDENAÇÃO: `usePagination()` devolve `params`
 *   (`page`/`limit`/`sort`/`order`) sincronizados com a URL, mais os setters
 *   `setPage`, `setLimit` e `toggleSort`. A URL é a fonte da verdade: recarregar
 *   a página ou usar o botão "voltar" do navegador preserva a tela.
 *
 * DERIVADOS (calculados, nunca guardados em estado):
 *   `buscando`   -> há termo de busca ativo? decide o ENDPOINT no BLOCO 5;
 *   `totalPages` -> `Math.max(1, ceil(total / params.limit))`; o `Math.max`
 *                   evita "página 0" quando a lista está vazia;
 *   `error`      -> erro da definição OU dos dados (BLOCO 6).
 * -------------------------------------------------------------------------
 */
export default function GetAllPage() {
  const navigate = useNavigate();
  const { params, setPage, setLimit, toggleSort } = usePagination();

  // Estado da DEFINIÇÃO (colunas e ações). Ver BLOCO 4.
  const [manager, setManager] = useState<ListManagerRow | null>(null);
  const [columns, setColumns] = useState<ListColumnRow[]>([]);
  const [actions, setActions] = useState<ListActionRow[]>([]);
  const [defsLoading, setDefsLoading] = useState(true);
  const [defsError, setDefsError] = useState<string | null>(null);

  // 2) Estado dos DADOS da página atual. Ver BLOCO 5.
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // 3) Estado da BUSCA: o termo digitado e a versão atrasada (a que dispara a requisição).
  const [termo, setTermo] = useState('');
  const termoDebounced = useDebounce(termo, 400);
  const buscando = termoDebounced.trim() !== '';

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / params.limit)), [total, params.limit]);

  /**
   * =============================================================================
   * BLOCO 4 — CARREGAMENTO DA DEFINIÇÃO (uma vez, na montagem)
   * =============================================================================
   *
   * O QUE FAZ, na ordem:
   *   1. `listManagerTable.getNoPagination({ sort: 'id', order: 'ASC' })` — todas
   *      as definições de listagem, SEM paginação (é um catálogo pequeno) e
   *      passadas por `toManager` (snake_case da API -> tipo de UI);
   *   2. acha a definição do `MANAGER_SLUG` (BLOCO 1). Se não achar, o erro não é
   *      genérico: traz a instrução do seeder que popula a tabela — mensagem
   *      acionável, porque sem definição esta tela não existe;
   *   3. com o `id` da definição em mãos, busca em PARALELO (`Promise.all`)
   *      `list_columns` e `list_actions` do manager, ordenados por `sort_order`
   *      e convertidos por `toColumn`/`toAction`.
   *
   * POR QUE COLUNAS E AÇÕES VÊM DO BANCO: é o motor "Construtor de Listas" —
   *   a página não conhece o nome de nenhum campo. Consequência prática: coluna
   *   ou ação nova aparece sozinha na tela, sem deploy, depois de gravada na
   *   definição.
   *
   * O `finally` sempre desliga `defsLoading`, inclusive nos `return` antecipados
   *   de erro — sem isso a tela ficaria no overlay para sempre.
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
        setDefsError(
          `Listagem '${MANAGER_SLUG}' nao encontrada em list_manager. Rode: podman exec codeigniter54900_php php spark db:seed ListConstructorRealTablesSeeder`,
        );
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

  /**
   * =============================================================================
   * BLOCO 5 — CARREGAMENTO DOS DADOS (reage à definição, à URL e à busca)
   * =============================================================================
   *
   * O QUE FAZ, na ordem:
   *   1. sem `manager.apiGetEndpoint` não há o que buscar — sai cedo (é também o
   *      que evita chamar a API antes de a definição chegar);
   *   2. escolhe o ENDPOINT: `api_search_endpoint` quando há busca ativa E a
   *      definição oferece esse campo, senão `api_get_endpoint`. É ESTA a
   *      diferença em relação ao `FormConstructorListPage.tsx`, que originou o
   *      fork — e o motivo de a caixa de busca só aparecer para definições que
   *      declarem `api_search_endpoint` (BLOCO 7);
   *   3. `resolveEndpoint(endpoint)` aplica o prefixo/versão da API e `http.get`
   *      faz a chamada levando: os params da URL (`page`/`limit`/`sort`/`order`)
   *      e, quando a busca está ativa, `q` com o termo JÁ DEBOUNCED;
   *   4. `normalizeList(raw)` devolve `{ rows, total }` e alimenta o estado;
   *   5. falha -> `rows`/`total` voltam a vazio e a mensagem vai para
   *      `dataError`: erro de DADOS não apaga a definição já carregada.
   *
   * QUEM DISPARA: o `useEffect([loadData])` logo abaixo. Como `loadData` depende
   *   de `manager`, `params` (a URL) e `buscando`/`termoDebounced`, mudar de
   *   página, mudar o limite, ordenar ou buscar refaz a requisição sozinho —
   *   NÃO existe botão "buscar".
   *
   * EFEITO SEPARADO (depois do `useEffect` dos dados): ao mudar o termo
   *   debounced, a página volta para 1. Sem isso, buscar estando na página 3
   *   mostraria "página 3 sem resultados" mesmo havendo resultado na página 1.
   * -------------------------------------------------------------------------
   */
  const loadData = useCallback(async () => {
    if (!manager?.apiGetEndpoint) return;
    const endpoint = buscando && manager.apiSearchEndpoint ? manager.apiSearchEndpoint : manager.apiGetEndpoint;
    setDataLoading(true);
    setDataError(null);
    try {
      const path = resolveEndpoint(endpoint);
      const queryParams: QueryParams = buscando
        ? { ...(params as unknown as QueryParams), q: termoDebounced.trim() }
        : (params as unknown as QueryParams);
      const raw = await http.get(path, { params: queryParams });
      const { rows: list, total: t } = normalizeList<Record<string, unknown>>(raw);
      setRows(list);
      setTotal(t);
    } catch (err) {
      setRows([]);
      setTotal(0);
      setDataError(err instanceof ApiError ? err.message : 'Falha ao carregar os usuarios.');
    } finally {
      setDataLoading(false);
    }
  }, [manager, params, buscando, termoDebounced]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Trocar o termo de busca reseta pra pagina 1 (evita "pagina 3 sem resultado").
  useEffect(() => {
    if (params.page !== 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termoDebounced]);

  /**
   * =============================================================================
   * BLOCO 6 — ERRO COMPOSTO / FEEDBACK
   * =============================================================================
   *
   * Dois erros de origens diferentes viram UM só para a tela: `defsError` (a
   *   DEFINIÇÃO não carregou) tem prioridade sobre `dataError` (os dados
   *   falharam, mas a definição está ok).
   *
   * A ORDEM IMPORTA: sem definição não existem colunas, ações nem endpoint —
   *   mostrar o erro das linhas seria secundário e confuso. Erros de AÇÃO de
   *   linha são outro caminho: viram `toast` dentro do `ActionButton` (BLOCO 2),
   *   sem mexer neste estado.
   * -------------------------------------------------------------------------
   */
  const error = defsError ?? dataError;

  /**
   * =============================================================================
   * BLOCO 7 — RENDERIZAÇÃO (JSX)
   * =============================================================================
   *
   * O QUE FAZ, em 5 janelas (a ordem é a ordem das condições):
   *   1. `<PageHeader>` — título e subtítulo saem da DEFINIÇÃO (`manager.title` e
   *      o endpoint), com "Recarregar" (chama `loadData`) e "Novo usuario"
   *      (navega para a rota de create);
   *   2. caixa de busca — só aparece se a definição tiver
   *      `api_search_endpoint`; é controlada (valor = `termo`);
   *   3. `defsLoading` -> `<LoadingOverlay />` cheio; `error` (do BLOCO 6) ->
   *      `<EmptyState variant="danger">`;
   *   4. lista VAZIA (sem busca: "Nenhum usuario"; com busca: "Nenhum usuario
   *      encontrado" + o termo pesquisado) -> `<EmptyState variant="warning">`;
   *   5. tabela: cabeçalho gerado de `columns` (coluna `sortable` vira botão de
   *      ordenação, com indicador de direção), corpo gerado de `rows` com
   *      `renderCell(c, row)` formatando cada célula, e a coluna de Ações com um
   *      `<ActionButton>` por ação, habilitado por `evalBusinessRule`. O rodapé
   *      traz o total, o seletor de limite (`limit_options` da definição, com
   *      fallback `[10, 20, 50, 100]`) e a paginação de `paginationWindow`.
   *
   * DURANTE UMA TROCA DE PÁGINA o overlay é o MODAL (`<LoadingOverlay overlay
   *   />`), não o cheio: a tabela anterior continua visível e a tela não pisca.
   *
   * COMO REAPROVEITAR: mantendo as cinco janelas na mesma ordem, qualquer
   *   listagem do motor funciona — o que muda por recurso é só a definição no
   *   banco e a `MANAGER_SLUG` (BLOCO 1).
   * -------------------------------------------------------------------------
   */
  return (
    <>
      <PageHeader title={manager?.title || 'Usuarios'} subtitle={manager?.apiGetEndpoint || 'api/v1/user-manager'}>
        <button className="btn btn-outline-secondary me-2" onClick={() => void loadData()} disabled={dataLoading}>
          Recarregar
        </button>
        <button className="btn btn-primary" onClick={() => void navigate(paths.v1.user.create)}>
          Novo usuario
        </button>
      </PageHeader>

      {/* 2. Busca: só aparece se a definição tiver `api_search_endpoint`. */}
      {manager?.apiSearchEndpoint && !defsLoading && (
        <div className="mb-3" style={{ maxWidth: 360 }}>
          <input
            type="search"
            className="form-control"
            placeholder="Buscar por usuario, nome, e-mail, CPF..."
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
          />
        </div>
      )}

      {/* 3a. Carga da definição: overlay cheio (sem ela não há tabela). */}
      {defsLoading && <LoadingOverlay />}

      {/* 3b. Erro composto (definição ou dados). Ver BLOCO 6. */}
      {error && !defsLoading && <EmptyState title="Lista indisponivel" description={error} variant="danger" />}

      {/* 4. Lista vazia: a mensagem muda quando existe busca ativa. */}
      {!defsLoading && !error && !dataLoading && rows.length === 0 && (
        <EmptyState
          variant="warning"
          eyebrow="Lista vazia"
          title={buscando ? 'Nenhum usuario encontrado' : 'Nenhum usuario'}
          description={buscando ? `Sem resultados para "${termoDebounced}".` : "Crie o primeiro em 'Novo usuario'."}
        />
      )}

      {/* 5. Tabela (colunas/ações da definição) + rodapé de limite e paginação. */}
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
