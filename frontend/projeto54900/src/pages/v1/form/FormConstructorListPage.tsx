/**
 * =============================================================================
 * FILE HEADER — FormConstructorListPage (índice do módulo Form)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Página `/v1/form-constructor`: lista os formulários cadastrados
 *   (`form_manager`) e dá acesso à criação (botão fixo "Novo formulário") e às
 *   ações por linha (definidas em `list_actions`). É a porta de entrada do
 *   módulo Form — não conhece os campos de cada formulário, só a lista deles.
 *
 *   ATENÇÃO — esta página NÃO tem colunas nem ações fixas no código. Ela é
 *   consumidora do MOTOR GENÉRICO do "Construtor de Listas": lê a definição
 *   gravada em `list_manager`/`list_columns`/`list_actions` (slug
 *   `form-manager`) e monta a grade a partir dela. Para mudar rótulo, ordem,
 *   ordenação, aparência da célula ou ação da lista, o lugar é o BANCO (tela do
 *   `ListBuilderPage` em `/v1/list-constructor/create`, ou o seeder) — não aqui.
 *   Ver `src/markdown/geral/README_list_constructor.md`.
 *
 * DE ONDE VEM CADA COISA:
 *   definição -> `list_manager` (slug `form-manager`) + `list_columns` +
 *               `list_actions`, normalizados por `@/utils/listConstructor`
 *   dados     -> `api_get_endpoint` do próprio manager (o cabeçalho mostra esse
 *               valor; o fallback exibido é `api/v1/form-manager`)
 *   paginação -> a URL (`page`/`limit`/`sort`/`order`), via `usePagination`
 *   célula    -> `renderCell(column, row)`: o `format` de cada `list_columns`
 *               escolhe um `CUSTOM_CELL_RENDERERS` do motor (`code` -> `<code>`,
 *               `status-badge` -> badge colorido, `roles-badges` -> chips)
 *   ação      -> `list_actions` (`link` navega; `api_call` faz HTTP de verdade)
 *
 * FLUXO (dois carregamentos encadeados, nesta ordem):
 *   1. `loadDefinition` (1x, no mount) -> acha o manager pelo slug → carrega
 *      `list_columns` e `list_actions` em paralelo -> alimenta `columns`/`actions`.
 *   2. `loadData` (reage a `manager` e à URL) -> GET no `api_get_endpoint`
 *      passando os params da URL -> alimenta `rows`/`total`.
 *   Falha em qualquer um dos dois vira o `error` composto (definição tem
 *   precedência) exibido no `<EmptyState>` — ver BLOCO 6.
 *
 * DEPENDÊNCIAS (arquivos deste projeto que esta página consome):
 *   - `@/services/v1` (`listManagerTable`/`listColumnsTable`/`listActionsTable`)
 *     — as 3 tabelas da DEFINIÇÃO; são as mesmas que o `ListBuilderPage` edita.
 *   - `@/utils/listConstructor` — o motor: `toManager`/`toColumn`/`toAction`
 *     (snake_case da API -> tipos de UI), `renderCell`, `evalBusinessRule`,
 *     `resolveHrefTemplate`, `str`.
 *   - `@/services/http` (`http`, `ApiError`) — a chamada dos DADOS (e das ações
 *     `api_call`) e o erro tipado que vira mensagem na tela.
 *   - `@/utils/formSubmit` (`resolveEndpoint`) — remove o prefixo
 *     `env.apiBaseUrl` do endpoint vindo do banco (o wrapper `http` já prefixa;
 *     sem isso, `/api` apareceria duas vezes).
 *   - `@/hooks/usePagination` — `params` vêm da URL (fonte da verdade:
 *     recarregar/voltar preservam o estado); `setLimit` e `toggleSort` voltam
 *     para a página 1.
 *   - `@/utils/pagination` (`paginationWindow`) — a matemática da janela de
 *     páginas (o JSX da paginação é desta página, não do motor).
 *   - `@/utils/apiResult` (`normalizeList`) — tolera os envelopes de resposta.
 *   - `@/components/global` (`PageHeader`, `EmptyState`, `LoadingOverlay`).
 *   - `@/routes/paths` (`paths.v1.form.create`) e `@/types/api` (`QueryParams`).
 *
 * CONSUMIDORES:
 *   - `src/routes/v1/form.routes.tsx` -> `{ path: 'form-constructor' }` (lazy).
 *   - `pages/v1/list/ListConstructorPage.tsx` é o PREVIEW do mesmo motor:
 *     mesma estrutura de leitura, mas as ações só emitem toast (não executam).
 *     Esta aqui é a tela de PRODUÇÃO — ao mudar comportamento comum, avalie as
 *     duas.
 *
 * COMO CRIAR OUTRA LISTA COM ESTE MOTOR (em vez de escrever uma grade nova):
 *   1. Crie a definição no banco (`/v1/list-constructor/create` ou seeder): um
 *      `list_manager` com o slug que a página vai procurar e o
 *      `api_get_endpoint`; os `list_columns` (label, field_key, format, sort) e
 *      os `list_actions` (label, action_type, template, business_rule_json).
 *   2. Copie esta página e troque a `MANAGER_SLUG` (BLOCO 1) pelo slug novo.
 *   3. Mantenha os DOIS carregamentos separados: é a definição que diz QUAL
 *      endpoint buscar e QUAIS colunas existem.
 *   4. Registre a rota lazy em `routes/v1/<modulo>.routes.tsx`.
 *   5. Só escreva componente de grade novo se precisar de algo que o motor não
 *      cobre — e, nesse caso, avalie acrescentar um `format`/`op` ao motor para
 *      a próxima lista herdar.
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. Não fixe coluna nem rótulo aqui: isso vive em `list_columns`.
 *   2. O comportamento de `link` x `api_call` é do padrão do motor — antes de
 *      mudar, veja o preview (`ListConstructorPage.tsx`).
 *   3. `error` é COMPOSTO (`defsError ?? dataError`): falha de DEFINIÇÃO esconde
 *      a de DADOS. Se as duas precisarem aparecer, separe os estados.
 *   4. Toda ação executada chama `onExecuted` -> `loadData()` para a tabela
 *      refletir a mudança; sem isso a lista fica "mentindo" na tela.
 * =============================================================================
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { http, ApiError } from '@/services/http';
import { listManagerTable, listColumnsTable, listActionsTable } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { resolveEndpoint } from '@/utils/formSubmit';
import { usePagination } from '@/hooks/usePagination';
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
 * BLOCO 1 — CONTRATO COM A DEFINIÇÃO (constante de módulo)
 * =============================================================================
 *
 * O QUE FAZ: é o ÚNICO dado de configuração da lista que vive no código — o
 *   slug do `list_manager` que descreve esta tela.
 *
 * POR QUE É IMPORTANTE: `loadDefinition` (BLOCO 4) procura EXATAMENTE este slug
 *   em `list_manager`; sem ele, a página não monta colunas nem ações e mostra
 *   erro com o comando do seeder. É o elo entre o código e a definição gravada
 *   pela tela `/v1/list-constructor/create` (ou pelo
 *   `ListConstructorRealTablesSeeder`).
 *
 * CUIDADOS:
 *   - Renomear o slug no banco sem mudar aqui (ou vice-versa) derruba a tela.
 *   - Cada lista do motor tem o seu slug (`ListConstructorPage.tsx` usa o dele).
 * =============================================================================
 */

const MANAGER_SLUG = 'form-manager';

/**
 * =============================================================================
 * BLOCO 2 — ActionButton (ação de linha: navegação real ou HTTP real)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Renderiza UMA ação de `list_actions` na coluna "Ações" da linha. A decisão
 *   vem do `action_type` gravado no banco:
 *     'link'     -> `<Link>` do react-router para `href_template`, com os campos
 *                  da linha substituídos (`{id}`, `{slug}` — `resolveHrefTemplate`)
 *     'api_call' -> chamada HTTP de verdade (`http.*`) no `api_endpoint`, com
 *                  confirmação opcional antes
 *
 * POR QUE ESTA PÁGINA EXECUTA DE VERDADE (e o preview não):
 *   aqui é a tela de PRODUÇÃO do cadastro de formulários — as ações precisam
 *   editar/remover registros reais. Em `ListConstructorPage.tsx` (preview) os
 *   cliques só mostram um toast do que SERIA chamado.
 *
 * CONTRATO DE CADA PROP:
 *   `action`     linha de `list_actions` já normalizada por `toAction`
 *   `row`        registro da linha da tabela — fonte dos `{campos}` do template
 *   `disabled`   vem do `business_rule_json` da ação, avaliado pela PÁGINA com
 *                `evalBusinessRule(rule, row)`; a ação só recebe o booleano, o
 *                que mantém a regra de negócio num lugar só
 *   `onExecuted` callback para a página RECARREGAR a lista após o sucesso
 *                (`loadData()`), para a tela refletir a mudança
 *
 * COMO REAPROVEITAR: este é o par botão/link que o motor NÃO entrega — o motor
 *   decide o que renderizar NA CÉLULA, a página decide o que fazer NO CLIQUE.
 *   Para um tipo de ação novo (ex.: abrir modal), acrescente um ramo aqui e o
 *   valor correspondente em `action_type` no banco.
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

  // Ramo de NAVEGAÇÃO: `href_template` é rota CLIENT (react-router), então vai
  // direto no `to` — NÃO passa por `resolveEndpoint` (isso é para endpoint de
  // API). Como <Link>/<a> não têm `disabled` nativo, o "desabilitado" é feito
  // com classe `.disabled`, `aria-disabled`, `tabIndex={-1}` e preventDefault.
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
   * Ordem deliberada: confirmação -> resolve o endpoint -> escolhe o método ->
   * avisa a página. O método vem do banco (`http_method`), com GET como
   * default quando não é um dos verbos tratados.
   * Só `onExecuted()` no SUCESSO (a página recarrega a lista); falha vira toast
   * com a mensagem da API (`ApiError.message`), sem derrubar a tabela.
   */
  const execute = async () => {
    if (action.confirm && !window.confirm(action.confirmMessage || `Confirma ${action.label}?`)) {
      return;
    }
    try {
      // O endpoint do banco vem como "/api/v1/...": `resolveEndpoint` tira o
      // prefixo `env.apiBaseUrl` porque o wrapper `http` já o adiciona.
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

  // Render do ramo `api_call`: botão comum; a confirmação (quando houver) é
  // tratada dentro de `execute`, para valer também se o clique vier do teclado.
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
 * BLOCO 3 — ESTADO DA PÁGINA (definição x dados x paginação)
 * =============================================================================
 *
 * O QUE FAZ: guarda os três grupos de estado que esta tela usa. Separar os
 *   grupos é o que permite a UI distinguir "não sei o QUE listar" (definição)
 *   de "não consegui LISTAR" (dados) — e escolher qual overlay/erro mostrar.
 *
 * GRUPO 1 — DEFINIÇÃO (o que a lista É; carregada uma vez no mount):
 *   `manager`     linha de `list_manager` (slug, título, endpoint, limites)
 *   `columns`     `list_columns` — cabeçalho, ordenação e `format` de célula
 *   `actions`     `list_actions` — botões por linha
 *   `defsLoading` começa `true`: a tela nasce mostrando o overlay
 *   `defsError`   falha ao carregar a definição (inclui "slug não encontrado")
 *
 * GRUPO 2 — DADOS (o conteúdo listado; recarrega a cada mudança de página,
 *   limite, ordenação ou ação executada):
 *   `rows`        registros crus da API (renderizados por `renderCell`)
 *   `total`       total informado pela API — base do `totalPages`
 *   `dataLoading` overlay DENTRO do card (não bloqueia a tela toda)
 *   `dataError`   falha na busca dos dados
 *
 * GRUPO 3 — PAGINAÇÃO: NÃO é estado local. `params` (page/limit/sort/order) vêm
 *   da URL via `usePagination`, e é ela a fonte da verdade: recarregar a página
 *   ou usar o botão "voltar" do browser preserva o que o usuário estava vendo.
 *   Por isso `setLimit`/`toggleSort` são chamados direto no JSX (BLOCO 7).
 *
 * DERIVADO: `totalPages` é calculado de `total`/`params.limit` — `Math.max(1, ...)`
 *   garante 1 página mesmo com lista vazia (o rodapé nunca fica "0 de 0").
 *
 * COMO REAPROVEITAR: em outra lista com o motor, copie os DOIS grupos como
 *   estão — eles espelham exatamente as duas chamadas do BLOCO 4/5.
 * -------------------------------------------------------------------------
 */
export default function FormConstructorListPage() {
  // Paginação da URL (fonte da verdade) — ver GRUPO 3 acima.
  const { params, setPage, setLimit, toggleSort } = usePagination();

  // GRUPO 1 — definição (o que a lista é).
  const [manager, setManager] = useState<ListManagerRow | null>(null);
  const [columns, setColumns] = useState<ListColumnRow[]>([]);
  const [actions, setActions] = useState<ListActionRow[]>([]);
  const [defsLoading, setDefsLoading] = useState(true);
  const [defsError, setDefsError] = useState<string | null>(null);

  // GRUPO 2 — dados listados (o conteúdo).
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Derivado: o `Math.max(1, …)` evita "página 0" quando a lista está vazia.
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / params.limit)), [total, params.limit]);

  /**
   * =============================================================================
   * BLOCO 4 — CARREGAMENTO DA DEFINIÇÃO (`loadDefinition`)
   * =============================================================================
   *
   * O QUE FAZ: monta a lista em si, em 3 passos:
   *   1. busca TODOS os `list_manager` (`getNoPagination`) e acha o do
   *      `MANAGER_SLUG` (BLOCO 1) — não há endpoint "por slug", a busca é local
   *      sobre `toManager`;
   *   2. sem o manager, para e explica o comando do seeder no `defsError`;
   *   3. com o manager, busca `list_columns` e `list_actions` em PARALELO
   *      (`Promise.all`), sempre ordenados por `sort_order` — as duas usam
   *      `found.id` como FK, por isso só podem rodar depois do passo 1.
   *
   * POR QUE É IMPORTANTE: nada é fixo no código; se este passo falhar, a página
   *   não sabe o que listar (não há grade de fallback) e mostra o erro.
   *
   * DETALHES DE MANUTENÇÃO:
   *   - `limit: 100` nas duas buscas é o teto da definição (colunas/ações de uma
   *     lista não deveriam passar disso; se passar, aumente aqui).
   *   - `setDefsLoading(false)` fica no `finally`: a UI sempre sai do overlay,
   *     com sucesso ou erro.
   *   - Roda UMA vez (efeito com dependência estável) — a definição não muda
   *     enquanto a página está aberta; quem muda é o DADO (BLOCO 5).
   *
   * COMO REAPROVEITAR: em outra lista, só o `MANAGER_SLUG` muda. Se a definição
   *   passar a ser editável na mesma tela, este é o ponto que precisa de um
   *   "recarregar definição" (hoje não existe).
   * -------------------------------------------------------------------------
   */
  const loadDefinition = useCallback(async () => {
    setDefsLoading(true);
    setDefsError(null);
    try {
      // Passo 1 — acha o manager pelo slug (traduzido por `toManager`).
      const raw = await listManagerTable.getNoPagination({ sort: 'id', order: 'ASC' });
      const { rows: managerRows } = normalizeList<Record<string, unknown>>(raw);
      const found = managerRows.map(toManager).find((m) => m.slug === MANAGER_SLUG) ?? null;

      // Passo 2 — sem definição não há lista: mensagem acionável (o comando do
      // seeder) em vez de uma grade vazia sem explicação.
      if (!found) {
        setManager(null);
        setDefsError(
          `Listagem '${MANAGER_SLUG}' nao encontrada em list_manager. Rode: podman exec codeigniter54900_php php spark db:seed ListConstructorRealTablesSeeder`,
        );
        return;
      }
      setManager(found);

      // Passo 3 — colunas e ações em paralelo: as duas dependem apenas do
      // `found.id`, então uma não espera a outra.
      const [colsRaw, actsRaw] = await Promise.all([
        listColumnsTable.find({ list_manager_id: found.id }, { sort: 'sort_order', order: 'ASC', limit: 100 }),
        listActionsTable.find({ list_manager_id: found.id }, { sort: 'sort_order', order: 'ASC', limit: 100 }),
      ]);
      // `toColumn`/`toAction` normalizam snake_case -> tipos de UI (o JSX usa
      // `c.label`, `c.sortable`, `a.actionType`... e nunca o campo cru da API).
      setColumns(normalizeList<Record<string, unknown>>(colsRaw).rows.map(toColumn));
      setActions(normalizeList<Record<string, unknown>>(actsRaw).rows.map(toAction));
    } catch (err) {
      // Falha da definição zera `manager`: a grade sai da tela e o `defsError`
      // passa a ser o `error` composto (BLOCO 6).
      setManager(null);
      setDefsError(err instanceof ApiError ? err.message : 'Falha ao carregar a definicao da listagem.');
    } finally {
      setDefsLoading(false);
    }
  }, []);

  // Efeito 1 — só no mount: a definição descreve a tela e não muda com a
  // navegação de páginas (quem reage à URL é o efeito do BLOCO 5).
  useEffect(() => {
    void loadDefinition();
  }, [loadDefinition]);

  /**
   * =============================================================================
   * BLOCO 5 — CARREGAMENTO DOS DADOS (`loadData`)
   * =============================================================================
   *
   * O QUE FAZ: busca os REGISTROS no endpoint indicado pela definição
   *   (`manager.apiGetEndpoint`) e joga em `rows`/`total`.
   *
   * ENCADEAMENTO (o detalhe que mais confunde):
   *   - A 1ª linha (`if (!manager?.apiGetEndpoint) return`) é o SEQUENCIADOR: no
   *     primeiro render o manager ainda é `null`, então não há como buscar dados.
   *     Quando `loadDefinition` termina e chama `setManager(found)`, este
   *     `useCallback` é recriado (o `manager` entrou nas dependências) e o efeito
   *     roda — é assim que os dados só carregam DEPOIS da definição, sem
   *     "esperar" explícito.
   *   - O efeito depende de `params`: mudar página/limite/ordenação pela UI
   *     altera a URL -> `params` muda -> recarrega. Refresh e botão "voltar" do
   *     browser caem no mesmo caminho (por isso a paginação vive na URL).
   *
   * DETALHES DE MANUTENÇÃO:
   *   - `resolveEndpoint` é obrigatório aqui: o endpoint do banco começa com
   *     `/api`, que o wrapper `http` já prefixa.
   *   - `params` vão como query string (`?page=...&limit=...&sort=...&order=...`) — o
   *     cast para `QueryParams` é só para o tipo aceitar o objeto de `PageParams`.
   *   - Em erro, `rows`/`total` são ZERADOS de propósito: melhor uma tabela
   *     vazia + erro do que a lista antiga parecendo atual.
   *   - `dataLoading` alimenta um overlay DENTRO do card (a tela não pisca o
   *     overlay cheio, que é só da definição).
   *
   * COMO REAPROVEITAR: em outra lista, nada muda — o endpoint vem do banco. Se a
   *   listagem ganhar filtros próprios, eles entram como mais um item de `params`
   *   (via `patch` do `usePagination`), mantendo a URL como fonte da verdade.
   * -------------------------------------------------------------------------
   */
  const loadData = useCallback(async () => {
    // Sequenciador: só existe dado a buscar quando a definição já chegou.
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
      setDataError(err instanceof ApiError ? err.message : 'Falha ao carregar os formularios.');
    } finally {
      setDataLoading(false);
    }
  }, [manager, params]);

  // Efeito 2 — roda quando a definição chega e a cada mudança de URL.
  useEffect(() => {
    void loadData();
  }, [loadData]);

  /**
   * =============================================================================
   * BLOCO 6 — ERRO COMPOSTO (um `error` para duas origens)
   * =============================================================================
   *
   * O QUE FAZ: junta a falha da DEFINIÇÃO e a falha dos DADOS num único valor
   *   para o `<EmptyState>`, com a definição tendo PRECEDÊNCIA: sem definição
   *   nem chega a existir grade — mostrar o erro dos dados seria secundário.
   *
   * CONSEQUÊNCIA A TER EM CONTA: se as duas falharem, a mensagem dos dados fica
   *   oculta até a definição voltar. Para exibir as duas, separe os estados (hoje
   *   não é o caso: a tela mostra uma coisa por vez de propósito).
   *
   * CONSUMIDORES: usado nas 3 condições de janela do JSX (BLOCO 7) — overlay da
   *   definição, `EmptyState` de erro e `EmptyState` de lista vazia.
   * -------------------------------------------------------------------------
   */
  const error = defsError ?? dataError;

  /**
   * =============================================================================
   * BLOCO 7 — RENDERIZAÇÃO (JSX)
   * =============================================================================
   *
   * O QUE FAZ: desenha a tela em 6 janelas MUTUAMENTE EXCLUSIVAS (por isso cada
   *   bloco tem uma condição completa, e não só `else`):
   *   1. `<PageHeader>` — título/subtítulo vêm da DEFINIÇÃO (com fallback, caso a
   *      definição ainda não tenha chegado) + "Recarregar" (só o DADO) e "Novo
   *      formulário" (rota fixa `paths.v1.form.create`).
   *   2. `defsLoading` -> `<LoadingOverlay />` cheio: sem definição não há o que
   *      mostrar e nada é clicável.
   *   3. `error` -> `<EmptyState variant="danger">` com a mensagem do BLOCO 6.
   *   4. Lista VAZIA (`!dataLoading && rows.length === 0`) -> `<EmptyState>` de
   *      orientação (não é erro: mandou usar "Novo formulário").
   *   5. Card da TABELA — aparece com dados ou enquanto recarrega
   *      (`dataLoading || rows.length > 0`), com overlay INTERNO na recarga.
   *   6. Rodapé do card — contagem, seletor de limite e janela de páginas.
   *
   * ORDEM IMPORTA: as condições são avaliadas de cima para baixo e são
   *   exclusivas entre si; a tabela só aparece quando a definição carregou SEM
   *   erro — se você acrescentar uma janela nova, replique o padrão
   *   (`!defsLoading && !error && ...`) para ela não aparecer por cima das outras.
   *
   * DE ONDE VEM O CONTEÚDO DA GRADE:
   *   cabeçalho -> `columns` (`label`, `sortable`, `sortKey`)
   *   células   -> `renderCell(c, row)` — o `format` da coluna decide o visual
   *   ações     -> `actions` -> `<ActionButton>` (BLOCO 2), habilitado por
   *               `evalBusinessRule(a.businessRule, row)`
   *   página    -> `paginationWindow(params.page, totalPages)` (utils/pagination)
   *
   * COMO REAPROVEITAR: para outra lista, mantenha esta ordem de janelas e troque
   *   só o que a definição não cobre (hoje: o botão de criar e o texto do vazio).
   * -------------------------------------------------------------------------
   */
  return (
    <>
      {/* Cabeçalho: título/subtítulo vêm da definição; as duas ações são fixas. */}
      <PageHeader title={manager?.title || 'Formularios'} subtitle={manager?.apiGetEndpoint || 'api/v1/form-manager'}>
        <button className="btn btn-outline-secondary me-2" onClick={() => void loadData()} disabled={dataLoading}>
          Recarregar
        </button>
        <Link className="btn btn-primary" to={paths.v1.form.create}>
          Novo formulario
        </Link>
      </PageHeader>

      {/* Janela 2 — definição em carga: bloqueia a tela (nada é clicável ainda). */}
      {defsLoading && <LoadingOverlay />}

      {/* Janela 3 — erro (definição OU dados), resumido pelo BLOCO 6. */}
      {error && !defsLoading && <EmptyState title="Lista indisponivel" description={error} variant="danger" />}

      {/* Janela 4 — sem erro, sem carga e sem registro: orientação, não erro. */}
      {!defsLoading && !error && !dataLoading && rows.length === 0 && (
        <EmptyState
          variant="warning"
          eyebrow="Lista vazia"
          title="Nenhum formulario"
          description="Crie o primeiro em 'Novo formulario'."
        />
      )}

      {/* Janela 5 — card da tabela: com dados, ou recarregando sobre os antigos. */}
      {!defsLoading && !error && (dataLoading || rows.length > 0) && (
        <div className="card border-0 shadow-sm position-relative">
          {/* Recarga: overlay só sobre o card (a definição é que usa o overlay cheio). */}
          {dataLoading && <LoadingOverlay overlay />}

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  {/* Cabeçalho 100% da definição: rótulo, sortable e sortKey vêm de list_columns. */}
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
                    {/* Ações da linha: o business_rule_json decide se o botão nasce desabilitado. */}
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

          {/* Janela 6 (rodapé) — escrita no card e LIGADA à URL, não a estado local. */}
          <div className="card-footer bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div className="d-flex align-items-center gap-2 small text-body-secondary">
              <span>{total} registro(s) · Por pagina</span>
              <select
                className="form-select form-select-sm w-auto"
                value={params.limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                {/* Limite por página: opções vêm do manager; fallback cobre definição sem limit_options_json. */}
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
                {/* Janela de páginas: os dois extremos e `delta` em volta da atual; buraco vira '...'. */}
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
