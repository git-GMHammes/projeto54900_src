/**
 * =============================================================================
 * FILE HEADER — GetAllPage (menu) — lista de itens de menu em DOIS modos
 * =============================================================================
 *
 * O QUE FAZ:
 *   Rota de lista do módulo menu. Renderiza os itens de `menu_manager` de duas
 *   formas, escolhidas pela QUERYSTRING:
 *     MODO TABELA (padrão) — grade paginada definida no banco, igual às outras
 *       listas do motor (slug `menu` em `list_manager`);
 *     MODO ÁRVORE (`?nav_manager_id=<id>`) — TODOS os itens de UM nav, montados
 *       em árvore por `parent_id` e indentados, porque a navegação de menu é
 *       hierárquica e o motor genérico só sabe desenhar `<table>` simples.
 *
 *   Em AMBOS os modos, a grade e as AÇÕES vêm da MESMA definição gravada no
 *   banco: `list_manager` (slug `menu`, `table_name = menu_manager`) +
 *   `list_columns` + `list_actions`. Não há coluna nem ação fixa no código — o
 *   que muda entre os modos é só o LAYOUT (tabela x árvore) e a origem dos dados.
 *
 * ORIGEM DOS DADOS:
 *   definição   -> `list-manager/get-no-pagination` + `list-columns/find` +
 *                 `list-actions/find`, normalizados por `toManager`/`toColumn`/
 *                 `toAction` do motor `@/utils/listConstructor`
 *   modo tabela -> `manager.api_get_endpoint` (endpoint gravado na definição),
 *                 com paginação/ordenação da URL (`usePagination`)
 *   modo árvore -> `menuManagerTable.find({ nav_manager_id })`, sem paginação
 *                 (`limit: 200`), ordenado por `sort_order`
 *
 * FLUXO (4 etapas):
 *   1. `loadDefinition` (BLOCO 4) — acha a definição pelo slug e carrega colunas
 *      e ações; sem ela não há o que renderizar.
 *   2. `loadFlat` (modo tabela) OU `runTree` (modo árvore) — disparados pelo
 *      efeito correspondente; só UM dos dois roda por render (BLOCO 4).
 *   3. `buildMenuTree` (BLOCO 2, só no modo árvore) — converte a lista achatada
 *      em árvore recursiva por `parent_id`.
 *   4. O JSX (BLOCO 5) escolhe entre `<table>` e o `<MenuTreeRow>` recursivo.
 *
 * DEPENDÊNCIAS:
 *   - `@/utils/listConstructor` — o MOTOR: normalização (`toManager`/`toColumn`/
 *     `toAction`), desenho da célula (`renderCell`, pelo `format` da coluna),
 *     avaliação de regra (`evalBusinessRule`) e template de href
 *     (`resolveHrefTemplate`).
 *   - `@/services/v1` (`menuManagerTable`, `listManagerTable`, `listColumnsTable`,
 *     `listActionsTable`), `@/services/http` (`http`, `ApiError`),
 *     `@/utils/apiResult` (`normalizeList`) e `@/utils/formSubmit`
 *     (`resolveEndpoint` — tira o prefixo `env.apiBaseUrl`).
 *   - `@/hooks/useApi` (só no modo árvore), `@/hooks/usePagination`,
 *     `@/hooks/useToast`, `@/utils/format` (`toText`), `@/utils/pagination`
 *     (`paginationWindow`) e `@/routes/paths`.
 *   - `@/components/global` (`PageHeader`, `EmptyState`, `LoadingOverlay`).
 *   - `react-router-dom` — `useSearchParams` (define o modo), `useNavigate`
 *     ("Novo item", que leva o `nav_manager_id` adiante) e `Link` (ação `link`).
 *
 * CONSUMIDORES:
 *   - `src/routes/v1/menu.routes.tsx` (rota de lista, lazy);
 *   - o botão "Itens" do módulo nav entra pela MESMA rota acrescentando
 *     `?nav_manager_id=` — é isso que liga o modo árvore.
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. Este arquivo é FORK de outro `GetAllPage` (user-manager/nav): correção
 *      aqui pede avaliação do original — e vice-versa.
 *   2. O modo é DERIVADO da URL (`isTreeMode`): `?nav_manager_id=` vazio NÃO é o
 *      mesmo que ausente. Não troque por flag de estado: a URL é a fonte da
 *      verdade e é ela que faz recarregar/voltar preservarem o modo.
 *   3. `ActionButton` (BLOCO 1) é o ÚNICO ponto que EXECUTA algo — aqui as ações
 *      são reais (diferente do `ListConstructorPage`, que só emite toast).
 *   4. O modo árvore IGNORA a paginação da URL: busca todos os itens do nav.
 * =============================================================================
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { paths } from '@/routes/paths';
import { menuManagerTable, listManagerTable, listColumnsTable, listActionsTable } from '@/services/v1';
import { http, ApiError } from '@/services/http';
import { useApi } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { normalizeList } from '@/utils/apiResult';
import { resolveEndpoint } from '@/utils/formSubmit';
import { paginationWindow } from '@/utils/pagination';
import { toText } from '@/utils/format';
import type { ApiRow, QueryParams } from '@/types/api';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
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
 * BLOCO 1 — CONTRATO COM A DEFINIÇÃO E O BOTÃO DE AÇÃO
 * =============================================================================
 *
 * `MANAGER_SLUG = 'menu'` — o ÚNICO dado de configuração que vive no código: é
 *   o slug procurado em `list_manager` pelo `loadDefinition` (BLOCO 4). Renomear
 *   o slug no banco sem mudar aqui (ou vice-versa) derruba a tela, que passa a
 *   mostrar o erro de "listagem não encontrada".
 *
 * `ActionButton` — desenha UMA ação de `list_actions`, decidindo pelo
 *   `action_type` gravado no banco:
 *     'link'     -> `<Link>` do react-router para `href_template` resolvido;
 *     'api_call' -> chamada HTTP REAL (`http.*`) no `api_endpoint`, com confirmação
 *                  opcional antes.
 *   Vive fora do componente da página porque é usado nos DOIS modos (célula da
 *   tabela e linha da árvore) — ver BLOCO 5.
 *
 * CONTRATO DAS PROPS:
 *   `action`     linha de `list_actions` já normalizada por `toAction`
 *   `row`        registro da linha — fonte dos `{campos}` do template
 *   `disabled`   vem de `evalBusinessRule` avaliado pela PÁGINA: a ação só recebe
 *                o booleano, mantendo a regra de negócio em um lugar só
 *   `onExecuted` callback para RECARREGAR a lista depois do sucesso — a página
 *                passa `reload`, que aponta para o carregador do modo ATIVO
 *
 * DETALHE DE UI: `<Link>`/`<a>` não têm `disabled` nativo, então o estado
 *   desabilitado é feito com a classe `.disabled`, `aria-disabled`,
 *   `tabIndex={-1}` e `preventDefault` no clique.
 * -------------------------------------------------------------------------
 */

const MANAGER_SLUG = 'menu';

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

  /**
   * Ramo de EXECUÇÃO (`api_call`): faz a chamada HTTP descrita pela ação.
   * Ordem: confirmação -> resolve o endpoint -> escolhe o método -> avisa a página.
   * O método vem do banco (`http_method`), com GET como default.
   * Só `onExecuted()` no SUCESSO (a lista recarrega); falha vira toast com a
   * mensagem da API, sem derrubar a tabela.
   */
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

/**
 * =============================================================================
 * BLOCO 2 — MODO ÁRVORE: TIPOS E MONTAGEM (`?nav_manager_id=`)
 * =============================================================================
 *
 * POR QUE ESTE MODO EXISTE: a navegação de menu é HIERÁRQUICA (um item pode ter
 *   itens filhos via `parent_id`), e o motor de listas só sabe desenhar uma
 *   `<table>` sem recursão. Então, quando a página é aberta a partir de um nav,
 *   ela busca TODOS os itens daquele nav e os desenha como árvore indentada —
 *   mantendo as AÇÕES vindas da mesma `list_actions` do modo tabela.
 *
 * `MenuTreeNode` — nó da árvore: o registro CRU (`ApiRow`, porque aqui os campos
 *   vêm da API do recurso e não da definição) + os filhos já resolvidos.
 *
 * `idKey` — converte id para string de forma tolerante (`number` ou `string`;
 *   qualquer outra coisa vira `null`). É a chave usada no mapa de nós — os ids
 *   chegam como `unknown` da API.
 *
 * `buildMenuTree` — duas passagens sobre as linhas:
 *   1. cria um nó para CADA linha (mapa `id -> nó`), ignorando linhas sem id;
 *   2. liga cada nó ao pai (`parent_id`) quando o pai ESTÁ no conjunto;
 *      quem não tem pai (ou tem pai fora do conjunto) vira RAIZ.
 *   Depois ordena RECURSIVAMENTE por `sort_order` (a API não garante ordem
 *   entre irmãos), de modo que a árvore sai pronta para renderizar.
 *
 * CONSUMIDORES: `tree` (uso `useMemo`, BLOCO 4) e `<MenuTreeRow>`, que se chama
 *   recursivamente para os filhos.
 * =============================================================================
 */

interface MenuTreeNode {
  row: ApiRow;
  children: MenuTreeNode[];
}

/**
 * Converte um id cru (`unknown`) em chave de string, ou `null` quando não é
 * utilizável como chave.
 */
function idKey(value: unknown): string | null {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : null;
}

/**
 * Monta a árvore de itens a partir das linhas achatadas da API.
 * @param rows linhas de `menu_manager` (todos os itens do nav)
 * @returns raízes ordenadas por `sort_order` (filhos ordenados em cada nível)
 * Duas passagens + ordenação recursiva — ver BLOCO 2.
 */
function buildMenuTree(rows: ApiRow[]): MenuTreeNode[] {
  const byId = new Map<string, MenuTreeNode>();
  rows.forEach((row) => {
    const key = idKey(row.id);
    if (key) byId.set(key, { row, children: [] });
  });

  const roots: MenuTreeNode[] = [];
  rows.forEach((row) => {
    const key = idKey(row.id);
    const node = key ? byId.get(key) : undefined;
    if (!node) return;
    const parentKey = idKey(row.parent_id);
    const parent = parentKey ? byId.get(parentKey) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });

  const bySortOrder = (a: MenuTreeNode, b: MenuTreeNode): number =>
    Number(a.row.sort_order ?? 0) - Number(b.row.sort_order ?? 0);
  const sortRecursive = (nodes: MenuTreeNode[]): void => {
    nodes.sort(bySortOrder);
    nodes.forEach((node) => sortRecursive(node.children));
  };
  sortRecursive(roots);

  return roots;
}

/**
 * Uma LINHA da árvore (recursiva): chevron de abrir/fechar, título, rota, os
 * "badges" de status e roles, a pill de contagem de filhos e as AÇÕES.
 * @param node       nó com o registro cru (`row`) e os filhos já montados
 * @param depth      profundidade (0 = raiz) — vira o recuo à esquerda
 * @param actions    `list_actions` da definição (as MESMAS do modo tabela)
 * @param onExecuted callback de recarga repassado ao `ActionButton`
 * Notas de manutenção:
 *   - o estado `open` é LOCAL por linha (começa aberta) e não é persistido —
 *     diferente do colapso da árvore do construtor (que vive em contexto);
 *   - status e roles são desenhados chamando `renderCell` com uma coluna
 *     SINTÉTICA (`id: 0`, `format: 'status-badge'`/`'roles-badges'`): reaproveita
 *     os renderers do motor sem precisar de uma coluna real na definição.
 */
function MenuTreeRow({
  node,
  depth,
  actions,
  onExecuted,
}: {
  node: MenuTreeNode;
  depth: number;
  actions: ListActionRow[];
  onExecuted: () => void;
}) {
  const [open, setOpen] = useState(true);
  const { row, children } = node;
  // Filhos determinam o chevron (folha fica com o espaço reservado, invisível).
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        className="d-flex align-items-center gap-2 rounded px-2 py-1 border-bottom"
        style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
      >
        <button
          type="button"
          className="btn btn-sm btn-link p-0 text-decoration-none"
          style={{ width: '1.25rem', visibility: hasChildren ? 'visible' : 'hidden' }}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Recolher' : 'Expandir'}
        >
          <i className={`bi ${open ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
        </button>
        <span className="fw-semibold">{toText(row.title)}</span>
        {row.react_route ? (
          <code className="text-body-secondary small">{toText(row.react_route)}</code>
        ) : null}
        {renderCell({ id: 0, sortOrder: 0, label: '', fieldKey: 'status', concat: null, format: 'status-badge', fallback: '—', sortable: false, sortKey: 'status' }, row)}
        {renderCell({ id: 0, sortOrder: 0, label: '', fieldKey: 'roles', concat: null, format: 'roles-badges', fallback: '—', sortable: false, sortKey: 'roles' }, row)}
        {hasChildren && (
          <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">
            {children.length}
          </span>
        )}
        <div className="ms-auto d-flex">
          {actions.map((a) => (
            <ActionButton
              key={a.id}
              action={a}
              row={row}
              disabled={!evalBusinessRule(a.businessRule, row)}
              onExecuted={onExecuted}
            />
          ))}
        </div>
      </div>
      {hasChildren && open && (
        <div>
          {children.map((child) => (
            <MenuTreeRow key={toText(child.row.id)} node={child} depth={depth + 1} actions={actions} onExecuted={onExecuted} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * =============================================================================
 * BLOCO 3 — MODO, ESTADO E PAGINAÇÃO
 * =============================================================================
 *
 * O MODO VEM DA URL: `useSearchParams` lê `?nav_manager_id=` e
 *   `isTreeMode = navManagerId !== null`. É derivado, e não estado — de novo:
 *   ausente difere de vazio, e a URL é a fonte da verdade (recarregar/voltar preservam o
 *   modo). `useNavigate` só é usado no botão "Novo item" (BLOCO 5).
 *
 * PAGINAÇÃO: `usePagination` dá `params`/`setPage`/`setLimit`/`toggleSort`, todos
 *   lendo/escrevendo na URL. Ela só tem efeito no MODO TABELA (a árvore busca
 *   tudo); no modo árvore os botões de página simplesmente não são renderizados.
 *
 * ESTADO EM DOIS GRUPOS, como nas outras telas de lista:
 *   DEFINIÇÃO  `manager`/`columns`/`actions` + `defsLoading`/`defsError`
 *   DADOS      `flatRows`/`flatTotal`/`flatLoading`/`flatError` — SÓ do modo
 *              tabela. O modo árvore usa o estado do próprio `useApi` (BLOCO 4),
 *              por isso não há um segundo conjunto de `useState` para ele.
 *
 * DERIVADO: `totalPages` (de `flatTotal` sobre o limite da URL) — usado apenas
 *   pelo rodapé do modo tabela.
 * -------------------------------------------------------------------------
 */
export default function GetAllPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const navManagerId = searchParams.get('nav_manager_id');
  const isTreeMode = navManagerId !== null;
  const { params, setPage, setLimit, toggleSort } = usePagination();

  const [manager, setManager] = useState<ListManagerRow | null>(null);
  const [columns, setColumns] = useState<ListColumnRow[]>([]);
  const [actions, setActions] = useState<ListActionRow[]>([]);
  const [defsLoading, setDefsLoading] = useState(true);
  const [defsError, setDefsError] = useState<string | null>(null);

  /**
   * =============================================================================
   * BLOCO 4 — CARREGAMENTOS (definição + UM dos dois modos de dados)
   * =============================================================================
   *
   * `loadDefinition` — mesma sequência do `FormConstructorListPage`: busca todos
   *   os `list_manager`, acha o do `MANAGER_SLUG` (BLOCO 1) e carrega colunas e
   *   ações em PARALELO (`Promise.all`), com `limit: 100` (teto da definição).
   *   Roda UMA vez, no mount; sem definição, `defsError` explica a causa.
   *
   * `loadFlat` (MODO TABELA) — GET no `api_get_endpoint` da definição, com os
   *   params da URL. A primeira linha é o GATE dos dois modos: em modo árvore ou
   *   sem endpoint, sai sem chamar nada.
   *
   * `runTree` (MODO ÁRVORE) — vem do `useApi`, que já entrega
   *   `data`/`error`/`loading`; o filtro `{ nav_manager_id: Number(navManagerId) }`
   *   e o `limit: 200` sem paginação são o que definem "todos os itens do nav".
   *
   * POR QUE SÓ UM CARREGA: cada efeito checa o modo (o `loadFlat` pelo `if`
   *   inicial e o da árvore pelo `if (isTreeMode)`) — e os 4 derivados abaixo
   *   (`dataLoading`/`dataError`/`rows`/`reload`) fazem o JSX e os handlers
   *   falarem com o modo ATIVO sem saber qual é. Essa é a peça que mantém os dois
   *   modos no mesmo componente sem `if` espalhado pela tela.
   *
   * `error` é COMPOSTO (`defsError ?? dataError`): falha de definição tem
   *   precedência, porque sem definição não existe grade.
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
      setActions(normalizeList<Record<string, unknown>>(actsRaw).rows.map(toAction));
    } catch (err) {
      setManager(null);
      setDefsError(err instanceof ApiError ? err.message : 'Falha ao carregar a definicao da listagem.');
    } finally {
      setDefsLoading(false);
    }
  }, []);

  // Efeito único: a definição descreve a tela e não muda com a navegação.
  useEffect(() => {
    void loadDefinition();
  }, [loadDefinition]);

  // --- MODO TABELA: estado próprio (o modo árvore usa o estado do `useApi`) ---
  const [flatRows, setFlatRows] = useState<Record<string, unknown>[]>([]);
  const [flatTotal, setFlatTotal] = useState(0);
  const [flatLoading, setFlatLoading] = useState(false);
  const [flatError, setFlatError] = useState<string | null>(null);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(flatTotal / params.limit)), [flatTotal, params.limit]);

  /** GATE dos modos: só busca a grade paginada quando NÃO é árvore e há endpoint. */
  const loadFlat = useCallback(async () => {
    if (isTreeMode || !manager?.apiGetEndpoint) return;
    setFlatLoading(true);
    setFlatError(null);
    try {
      const path = resolveEndpoint(manager.apiGetEndpoint);
      const raw = await http.get(path, { params: params as unknown as QueryParams });
      const { rows: list, total: t } = normalizeList<Record<string, unknown>>(raw);
      setFlatRows(list);
      setFlatTotal(t);
    } catch (err) {
      setFlatRows([]);
      setFlatTotal(0);
      setFlatError(err instanceof ApiError ? err.message : 'Falha ao carregar os itens de menu.');
    } finally {
      setFlatLoading(false);
    }
  }, [isTreeMode, manager, params]);

  useEffect(() => {
    void loadFlat();
  }, [loadFlat]);

  // --- MODO ÁRVORE: `useApi` + `find` sem paginação (todos os itens do nav) ---
  const { data: treeData, error: treeApiError, loading: treeLoading, run: runTree } = useApi((signal) =>
    menuManagerTable.find(
      { nav_manager_id: Number(navManagerId) },
      { limit: 200, sort: 'sort_order', order: 'ASC' },
      { signal },
    ),
  );

  // Só dispara a busca da árvore quando o modo está ativo (a URL manda).
  useEffect(() => {
    if (isTreeMode) void runTree();
  }, [isTreeMode, navManagerId, runTree]);

  // Linhas cruas para árvore (memoizada: `buildMenuTree` percorre tudo).
  const { rows: treeRows } = normalizeList<ApiRow>(treeData);
  const tree = useMemo(() => (isTreeMode ? buildMenuTree(treeRows) : []), [isTreeMode, treeRows]);

  // ---- Derivados que unificam os modos para o JSX e para os handlers ----
  // `dataLoading`/`dataError`/`rows`/`reload` apontam para o modo ATIVO; assim o
  // JSX (BLOCO 5) e o `onExecuted` do botão de ação não precisam saber qual é.
  const dataLoading = isTreeMode ? treeLoading : flatLoading;
  const dataError = isTreeMode ? treeApiError?.message ?? null : flatError;
  const rows = isTreeMode ? treeRows : flatRows;
  const reload = isTreeMode ? () => void runTree() : () => void loadFlat();

  // Erro composto: falha da definição tem precedência sobre a dos dados.
  const error = defsError ?? dataError;

  /**
   * =============================================================================
   * BLOCO 5 — RENDERIZAÇÃO (JSX): UM cabeçalho, CINCO janelas e DOIS layouts
   * =============================================================================
   *
   * O QUE FAZ:
   *   1. `<PageHeader>` — título e subtítulo MUDAM com o modo (nav x lista), e os
   *      botões também: "Voltar ao nav" (só no modo árvore) e "Novo item", que
   *      navega PROGRAMATICAMENTE levando o `nav_manager_id` adiante, para o novo
   *      item nascer no mesmo nav (ver `CreatePage.tsx`).
   *   2. `defsLoading` -> overlay cheio (a definição manda na tela).
   *   3. `error` (composto, BLOCO 4) -> `<EmptyState variant="danger">`.
   *   4. Vazio (`rows.length === 0`) -> `<EmptyState variant="warning">`.
   *   5. Conteúdo — DOIS layouts exclusivos:
   *      MODO ÁRVORE -> `<MenuTreeRow>` recursivo (BLOCO 2), com as ações por linha;
   *      MODO TABELA -> `<table>` com cabeçalho vindo de `columns` (ordenável por
   *                    `sortable`/`sortKey`), células por `renderCell` e rodapé
   *                    com limite + `paginationWindow`.
   *
   * POR QUE AS CONDIÇÕES REPETEM `!defsLoading && !error`: cada janela é
   *   MUTUAMENTE EXCLUSIVA e escrita por completo (sem `else`) — é o padrão das
   *   listas do projeto. Ao acrescentar uma janela, replique o padrão.
   *
   * COMO REAPROVEITAR: para outro recurso hierárquico, troque `MANAGER_SLUG` e o
   *   filtro do modo árvore; o resto (definição no banco, ações, desenho das
   *   células) vem do motor.
   * -------------------------------------------------------------------------
   */
  return (
    <>
      <PageHeader
        title={navManagerId ? `Itens do nav #${navManagerId}` : manager?.title || 'Itens de menu'}
        subtitle={navManagerId ? `api/v1/menu-manager?nav_manager_id=${navManagerId}` : manager?.apiGetEndpoint || 'api/v1/menu-manager'}
      >
        {navManagerId && (
          <Link className="btn btn-outline-secondary" to={paths.v1.nav.view(navManagerId)}>
            Voltar ao nav
          </Link>
        )}
        <button
          className="btn btn-primary"
          onClick={() =>
            void navigate(navManagerId ? paths.v1.menu.createForNav(navManagerId) : paths.v1.menu.create)
          }
        >
          Novo item
        </button>
      </PageHeader>

      {/* Janela 2 — definição em carga: sem ela, nada na tela é clicável. */}
      {defsLoading && <LoadingOverlay />}

      {/* Janela 3 — erro (definição OU dados), já composto no BLOCO 4. */}
      {error && !defsLoading && <EmptyState title="Lista indisponivel" description={error} variant="danger" />}

      {/* Janela 4 — sem erro, sem carga e sem registro. */}
      {!defsLoading && !error && !dataLoading && rows.length === 0 && (
        <EmptyState
          variant="warning"
          eyebrow="Lista vazia"
          title="Nenhum item cadastrado"
          description="Crie o primeiro item para comecar."
        />
      )}

      {/* Janela 5a — MODO ÁRVORE: recursão por `parent_id`, ações da mesma definição. */}
      {!defsLoading && !error && !dataLoading && rows.length > 0 && isTreeMode && (
        <div className="border rounded">
          {tree.map((node) => (
            <MenuTreeRow key={toText(node.row.id)} node={node} depth={0} actions={actions} onExecuted={reload} />
          ))}
        </div>
      )}

      {/* Janela 5b — MODO TABELA: grade 100% dirigida por `list_columns`/`list_actions`. */}
      {!defsLoading && !error && !isTreeMode && (dataLoading || rows.length > 0) && (
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
                {flatRows.map((row, i) => (
                  <tr key={str(row.id) || i}>
                    {columns.map((c) => (
                      <td key={c.id}>{renderCell(c, row)}</td>
                    ))}
                    {/* Ações da linha: `evalBusinessRule` decide o `disabled` de cada botão. */}
                    {actions.length > 0 && (
                      <td className="text-end text-nowrap">
                        {actions.map((a) => (
                          <ActionButton
                            key={a.id}
                            action={a}
                            row={row}
                            disabled={!evalBusinessRule(a.businessRule, row)}
                            onExecuted={reload}
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
              <span>{flatTotal} registro(s) · Por pagina</span>
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
