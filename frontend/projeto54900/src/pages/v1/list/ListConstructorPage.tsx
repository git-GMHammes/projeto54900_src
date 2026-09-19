/**
 * =============================================================================
 * FILE HEADER — ListConstructorPage (PREVIEW do motor de listas)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Página `/v1/list-constructor`: mostra a lista das LISTAGENS semeadas
 *   (`list_manager`) e, para a escolhida no seletor, renderiza a grade REAL com
 *   os dados vindos do `api_get_endpoint` do próprio registro. É a tela de
 *   DEMONSTRAÇÃO/leitura do motor — quem cria e edita listagens é o
 *   `ListBuilderPage` (`/v1/list-constructor/create` e `/update/:id`), acessível
 *   pelo botão "Nova lista"/"Editar".
 *
 * DUAS DIFERENÇAS EM RELAÇÃO AO CONSTRUTOR (não confundir os papéis):
 *   1. aqui NADA é gravado: os `list_manager`/`list_columns`/`list_actions` são
 *      somente lidos (`getNoPagination` + `find`);
 *   2. as AÇÕES (`list_actions`) NUNCA executam de verdade — o clique vira um
 *      `toast.info` com o que SERIA chamado (`handleActionClick`, BLOCO 5).
 *      Motivos: (a) alguns `href_template` apontam para outro projeto
 *      (`/web/v1a/...`) e não existem neste app; (b) evita mutar dados reais num
 *      clique de demonstração. Quem EXECUTA é o `FormConstructorListPage`.
 *
 * FLUXO (três carregamentos em cascata):
 *   1. `loadManagers` (BLOCO 2) — GET dos managers semeados; escolhe o 1º como
 *      seleção inicial.
 *   2. efeito das DEFINIÇÕES (BLOCO 3) — ao mudar o manager: `list-columns/find`
 *      + `list-actions/find` (em paralelo) para montar cabeçalho e ações.
 *   3. efeito dos DADOS (BLOCO 4) — GET no `api_get_endpoint` passando os params
 *      da URL (page/limit/sort/order).
 *   Cada efeito tem o seu `loading`/`error`, o que dá à tela três níveis de
 *   falha distintos: listagens, definição e dados.
 *
 * DEPENDÊNCIAS (arquivos deste projeto que esta página consome):
 *   - `@/utils/listConstructor` — o MOTOR: `toManager`/`toColumn`/`toAction`
 *     (normalizam a linha crua nos tipos `List*Row`), `renderCell` (desenha a
 *     célula conforme o `format` da coluna) e `evalBusinessRule` (habilita /
 *     bloqueia a ação por registro).
 *   - `@/services/v1` (`listManagerTable`/`listColumnsTable`/`listActionsTable`),
 *     `@/services/http` (`http`, `ApiError`) e `@/utils/apiResult`
 *     (`normalizeList`).
 *   - `@/utils/formSubmit` (`resolveEndpoint`) — tira o prefixo `env.apiBaseUrl`
 *     do endpoint vindo do banco (o wrapper `http` já o adiciona).
 *   - `@/hooks/usePagination` (page/limit/sort/order NA URL), `@/hooks/useToast`,
 *     `@/utils/pagination` (`paginationWindow`) e `@/components/global`
 *     (`PageHeader`, `EmptyState`, `LoadingOverlay`).
 *   - `@/routes/paths` (`paths.v1.list.create`/`edit`).
 *   - NOTA: esta página NÃO usa `listBuilder.model.ts` — os tipos vêm do motor,
 *     porque aqui o dado é de LEITURA (o builder tem o seu próprio modelo).
 *
 * CONSUMIDORES:
 *   - `src/routes/v1/list.routes.tsx` -> `/v1/list-constructor` (lazy).
 *
 * COMO REAPROVEITAR: para uma tela de leitura de QUALQUER listagem definida no
 *   banco, o caminho é não escrever página nova — publicar a definição
 *   (ListBuilder) e abrir o preview. Se precisar de outra tela de produção, use
 *   como referência o `FormConstructorListPage.tsx` (mesmo motor, ações reais).
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. O seletor muda a listagem SEM trocar de rota: `selectedSlug` é estado
 *      local (`handleSelectManager`), e trocar de manager rebobina a paginação.
 *   2. Os efeitos 2 e 3 usam a guarda `cancelled` no cleanup do efeito — sem
 *      ela, resposta lenta de uma listagem antiga sobrescreveria a tela da nova.
 *   3. `handleActionClick` é o ÚNICO ponto que decide "não executar". Não
 *      transforme este arquivo em produção: copie o padrão do form.
 * =============================================================================
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { paths } from '@/routes/paths';
import { http, ApiError } from '@/services/http';
import { listManagerTable, listColumnsTable, listActionsTable } from '@/services/v1';
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
} from '@/utils/listConstructor';
import type { ListManagerRow, ListColumnRow, ListActionRow } from '@/utils/listConstructor';

/**
 * =============================================================================
 * BLOCO 1 — ESTADO DA PÁGINA (três níveis de dados + paginação da URL)
 * =============================================================================
 *
 * A página tem TRÊS conjuntos de dados independentes, cada um com o seu par
 * `loading`/`error` — é isso que permite mostrar "não carregou as listagens"
 * sem confundir com "não carregou os dados da listagem escolhida".
 *
 * NÍVEL 1 — LISTAGENS SEMEADAS:
 *   `managers`         `ListManagerRow[]` (do motor) — todas as definições
 *   `managersLoading`  overlay cheio enquanto busca
 *   `managersError`    falha ao buscar as definições
 *   `selectedSlug`     slug escolhido no `<select>`; `null` = nada escolhido
 *
 * NÍVEL 2 — DEFINIÇÃO DA LISTAGEM ESCOLHIDA:
 *   `columns`     `ListColumnRow[]` — cabeçalho e `format` de célula
 *   `actions`     `ListActionRow[]` — botões por linha
 *   `defsLoading` overlay DENTRO dos cards de definição
 *
 * NÍVEL 3 — DADOS REAIS:
 *   `dataRows`/`dataTotal`/`dataLoading`/`dataError` — a grade em si
 *
 * DERIVADOS: `manager` (o `ListManagerRow` do slug escolhido, via `useMemo` —
 *   é ele que os efeitos 2 e 3 observam) e `totalPages` (de `dataTotal` sobre o
 *   `params.limit` da URL, com `Math.max(1, ...)` para nunca ficar "0 de 0").
 *
 * PAGINAÇÃO: `params`/`setPage`/`setLimit`/`toggleSort` vêm do `usePagination`,
 *   que lê e escreve na URL — recarregar/voltar preservam a página escolhida.
 * -------------------------------------------------------------------------
 */

export default function ListConstructorPage() {
  const toast = useToast();
  // Paginação da URL (fonte da verdade) — usada nos efeitos 3 e no rodapé.
  const { params, setPage, setLimit, toggleSort } = usePagination();

  // NÍVEL 1 — listagens semeadas.
  const [managers, setManagers] = useState<ListManagerRow[]>([]);
  const [managersLoading, setManagersLoading] = useState(true);
  const [managersError, setManagersError] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  // NÍVEL 2 — colunas e ações da listagem escolhida.
  const [columns, setColumns] = useState<ListColumnRow[]>([]);
  const [actions, setActions] = useState<ListActionRow[]>([]);
  const [defsLoading, setDefsLoading] = useState(false);

  // NÍVEL 3 — dados reais do api_get_endpoint.
  const [dataRows, setDataRows] = useState<Record<string, unknown>[]>([]);
  const [dataTotal, setDataTotal] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Derivado: o manager selecionado é o gatilho dos efeitos 2 e 3.
  const manager = useMemo(
    () => managers.find((m) => m.slug === selectedSlug) ?? null,
    [managers, selectedSlug],
  );

  // Derivado: total de páginas para o rodapé (nunca menos de 1).
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(dataTotal / params.limit)),
    [dataTotal, params.limit],
  );

  /**
   * =============================================================================
   * BLOCO 2 — CARREGAMENTO DAS LISTAGENS SEMEADAS (`loadManagers`)
   * =============================================================================
   *
   * O QUE FAZ: busca TODAS as definições (`getNoPagination`, sem filtro) e as
   *   normaliza com `toManager` do motor.
   *
   * DETALHES:
   *   - `.filter((m) => m.id > 0)` descarta linhas sem id válido (a normalização
   *     devolve 0 quando o campo não veio) — sem isso a lista teria entradas
   *     "fantasma" de resposta vazia;
   *   - a seleção inicial só é definida se ainda não houver uma
   *     (`setSelectedSlug(prev => prev ?? list[0]?.slug ?? null)`): recarregar
   *     NÃO troca a listagem que o usuário está vendo;
   *   - erro -> `managersError` (a tela mostra o `EmptyState` com o comando do
   *     seeder, porque a causa provável é o seed não rodado).
   *
   * CONSUMIDOR: botão "Recarregar" do cabeçalho (BLOCO 6) e o efeito único de
   *   montagem.
   * -------------------------------------------------------------------------
   */
  const loadManagers = useCallback(async () => {
    setManagersLoading(true);
    setManagersError(null);
    try {
      const raw = await listManagerTable.getNoPagination({ sort: 'id', order: 'ASC' });
      const { rows } = normalizeList<Record<string, unknown>>(raw);
      // Descarta linhas sem id válido (a normalização devolve 0 nesse caso).
      const list = rows.map(toManager).filter((m) => m.id > 0);
      setManagers(list);
      // Mantém a seleção atual; só cai no 1º item se ainda não houver nenhum.
      setSelectedSlug((prev) => prev ?? list[0]?.slug ?? null);
    } catch (err) {
      setManagers([]);
      setManagersError(err instanceof ApiError ? err.message : 'Falha ao carregar as listagens.');
    } finally {
      setManagersLoading(false);
    }
  }, []);

  // Efeito único: carrega a lista de listagens na montagem (e no "Recarregar").
  useEffect(() => {
    void loadManagers();
  }, [loadManagers]);

  /**
   * =============================================================================
   * BLOCO 3 — EFEITO DAS DEFINIÇÕES (colunas + ações do manager escolhido)
   * =============================================================================
   *
   * O QUE FAZ: sempre que o `manager` selecionado muda, busca o que a listagem
   *   TEM de colunas e ações e joga em `columns`/`actions`. As duas buscas vão em
   *   PARALELO (`Promise.all`) porque dependem do mesmo `manager.id`.
   *
   * DETALHES:
   *   - sem manager, zera as duas listas e sai (estado limpo entre trocas);
   *   - a guarda `cancelled` (com `return` no cleanup) descarta a resposta de uma
   *     listagem ANTIGA que chegue depois de o usuário já ter trocado: sem isso,
   *     o resultado velho sobrescreveria a tela atual;
   *   - o `catch` esvazia as listas SEM mensagem — colunas/ações são detalhe da
   *     tela, e a grade de dados (BLOCO 4) continua sendo exibida. É uma falha
   *     silenciosa de propósito (só a grade some junto se o endpoint cair).
   *
   * POR QUE É UM EFEITO (e não uma função chamada no onChange do select): a
   *   dependência natural é o OBJETO `manager` — assim o carregamento também
   *   acontece quando a lista de managers chega depois (seleção inicial).
   * -------------------------------------------------------------------------
   */
  useEffect(() => {
    if (!manager) {
      setColumns([]);
      setActions([]);
      return;
    }
    // Guarda contra resposta atrasada de uma listagem já trocada.
    let cancelled = false;
    setDefsLoading(true);
    void (async () => {
      try {
        const [colsRaw, actsRaw] = await Promise.all([
          listColumnsTable.find({ list_manager_id: manager.id }, { sort: 'sort_order', order: 'ASC', limit: 100 }),
          listActionsTable.find({ list_manager_id: manager.id }, { sort: 'sort_order', order: 'ASC', limit: 100 }),
        ]);
        if (cancelled) return;
        // `toColumn`/`toAction` (motor) normalizam snake_case -> tipos de UI.
        setColumns(normalizeList<Record<string, unknown>>(colsRaw).rows.map(toColumn));
        setActions(normalizeList<Record<string, unknown>>(actsRaw).rows.map(toAction));
      } catch {
        // Falha nas definições não bloqueia a tela: só esvazia os cards.
        if (!cancelled) {
          setColumns([]);
          setActions([]);
        }
      } finally {
        if (!cancelled) setDefsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [manager]);

  /**
   * =============================================================================
   * BLOCO 4 — EFEITO DOS DADOS (grid real no `api_get_endpoint`)
   * =============================================================================
   *
   * O QUE FAZ: busca os REGISTROS no endpoint indicado pela própria definição e
   *   alimenta a grade. Roda quando o manager muda E quando a URL muda de
   *   página/limite/ordenação (por isso `params` está nas dependências).
   *
   * DETALHES:
   *   - sem `api_get_endpoint`, NÃO é erro de rede: a mensagem é específica
   *     ("não tem api_get_endpoint definido") e o resto do estado é zerado;
   *   - também usa a guarda `cancelled` (trocar de listagem/trocar de página
   *     rápido pode devolver resposta fora de ordem);
   *   - `resolveEndpoint` é obrigatório: o endpoint do banco começa com `/api`,
   *     que o wrapper `http` já prefixa;
   *   - em erro, `dataRows`/`dataTotal` são zerados de propósito — melhor grade
   *     vazia + erro do que dados antigos parecendo atuais.
   *
   * POR QUE A MENSAGEM CITA O ENDPOINT: as listas semeadas de exemplo apontam
   *   para endpoints que NÃO existem neste projeto — o texto transforma um erro
   *   esperado em explicação, em vez de parecer defeito da tela.
   * -------------------------------------------------------------------------
   */
  useEffect(() => {
    if (!manager?.apiGetEndpoint) {
      setDataRows([]);
      setDataTotal(0);
      setDataError(manager ? 'Esta listagem nao tem api_get_endpoint definido.' : null);
      return;
    }
    // Guarda contra resposta atrasada (troca de listagem/página fora de ordem).
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);
    void (async () => {
      try {
        const path = resolveEndpoint(manager.apiGetEndpoint);
        const raw = await http.get(path, { params: params as unknown as QueryParams });
        if (cancelled) return;
        const { rows, total } = normalizeList<Record<string, unknown>>(raw);
        setDataRows(rows);
        setDataTotal(total);
      } catch (err) {
        if (cancelled) return;
        setDataRows([]);
        setDataTotal(0);
        // Erro de endpoint inexistente é ESPERADO nas listas de exemplo: a
        // mensagem explica em vez de parecer defeito da tela.
        setDataError(
          err instanceof ApiError
            ? `${err.message} (endpoint ${manager.apiGetEndpoint} nao existe neste projeto — normal para listas de exemplo)`
            : 'Falha ao carregar os dados.',
        );
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [manager, params]);

  /**
   * =============================================================================
   * BLOCO 5 — HANDLERS DE INTERAÇÃO (seleção e clique em ação)
   * =============================================================================
   *
   * `handleSelectManager` — troca a listagem exibida. Além de guardar o slug no
   *   estado, REBOBINA a paginação (`setPage(1)`): a página 5 de uma lista não
   *   faz sentido na lista seguinte. Os dados são recarregados pelo efeito do
   *   BLOCO 4, que observa o `manager` derivado.
   *
   * `handleActionClick` — o coração do caráter PREVIEW desta página: NÃO executa
   *   nada. Monta o texto do que seria chamado (`href_template` para `link`,
   *   `VERBO endpoint` para `api_call`, trocando `{id}` pelo id da linha) e emite
   *   um `toast.info`. Quem executa de verdade é o `FormConstructorListPage`, com
   *   `<Link>`/`http.*`.
   *
   * POR QUE ESTE ARQUIVO NÃO DEVE EXECUTAR: ver FILE HEADER — os templates
   *   semeados apontam para outro projeto e o preview é usado para inspecionar
   *   definições, não para mutar dados.
   * -------------------------------------------------------------------------
   */
  const handleSelectManager = (slug: string) => {
    setSelectedSlug(slug);
    // Troca de lista sempre volta para a primeira página.
    setPage(1);
  };

  /**
   * Clique em uma ação da linha — apenas ANUNCIA o que seria chamado.
   * @param action ação definida em `list_actions` (já normalizada pelo motor)
   * @param row    registro da linha, fonte do `{id}` do template
   */
  const handleActionClick = (action: ListActionRow, row: Record<string, unknown>) => {
    const target =
      action.actionType === 'link'
        ? action.hrefTemplate.replace('{id}', str(row.id))
        : `${action.httpMethod} ${action.apiEndpoint.replace('{id}', str(row.id))}`;
    toast.info(`Pre-visualizacao — nao executa de verdade. Chamaria: ${target}`, {
      title: action.label,
    });
  };

  /**
   * =============================================================================
   * BLOCO 6 — RENDERIZAÇÃO (JSX)
   * =============================================================================
   *
   * O QUE FAZ, em 5 janelas:
   *   1. `<PageHeader>` — título/subtítulo fixos + "Recarregar" (refaz o BLOCO 2)
   *      e "Nova lista" (`/v1/list-constructor/create`, o construtor real).
   *   2. Erro/Vazio das LISTAGENS (BLOCO 2) — inclui o caso "nenhuma semeada",
   *      com o comando do seeder na descrição.
   *   3. Seletor da listagem (`<select>` ligado a `handleSelectManager`).
   *   4. Cards de LEITURA da definição escolhida: o `manager` (endpoints, roles,
   *      ordenação padrão) + `list_columns` + `list_actions`, com o
   *      `LoadingOverlay` de `defsLoading` dentro de cada card.
   *   5. Card da GRID real — cabeçalho ordenável (`sortable`/`sortKey`), células
   *      por `renderCell` e ações por `evalBusinessRule` — mais o rodapé com
   *      limite (`limit_options`) e `paginationWindow`.
   *
   * DETALHE QUE DEFINE O CARÁTER DESTA TELA: o botão de ação da linha chama
   *   `handleActionClick` (toast), NÃO uma chamada HTTP. Se este arquivo algum dia
   *   for promovido a produção, a mudança começa aqui — e o modelo a seguir é o
   *   `FormConstructorListPage` (mesmo motor, ações reais).
   *
   * COMO REAPROVEITAR: mantenha a ordem das janelas (listagens -> definição ->
   *   dados) e troque só o que é específico (títulos/rótulos). A paginação vive na
   *   URL, então não há estado extra a criar.
   * -------------------------------------------------------------------------
   */
  return (
    <>
      {/* Janela 1 — cabeçalho fixo + recarregar a lista de listagens. */}
      <PageHeader
        title="Construtor de Listas — preview"
        subtitle="api/v1/list-manager · api/v1/list-columns · api/v1/list-actions"
      >
        <button className="btn btn-outline-secondary me-2" onClick={() => void loadManagers()} disabled={managersLoading}>
          Recarregar
        </button>
        <Link className="btn btn-primary" to={paths.v1.list.create}>
          Nova lista
        </Link>
      </PageHeader>

      {/* Janela 2 — estados da carga das listagens (erro e vazio usam o mesmo texto do seeder). */}
      {managersLoading && <LoadingOverlay />}

      {managersError && !managersLoading && (
        <EmptyState title="Listagens indisponiveis" description={managersError} variant="danger" />
      )}

      {!managersLoading && !managersError && managers.length === 0 && (
        <EmptyState
          title="Nenhuma listagem semeada"
          description="Rode: podman exec codeigniter54900_php php spark db:seed ListConstructorRealTablesSeeder"
        />
      )}

      {!managersLoading && !managersError && managers.length > 0 && (
        <>
          {/* Janela 3 — seletor da listagem; trocar rebobina a paginação (BLOCO 5). */}
          <div className="mb-4" style={{ maxWidth: '24rem' }}>
            <label htmlFor="list-constructor-select" className="form-label small text-body-secondary mb-1">
              Escolher listagem
            </label>
            <select
              id="list-constructor-select"
              className="form-select"
              value={selectedSlug ?? ''}
              onChange={(e) => handleSelectManager(e.target.value)}
            >
              {managers.map((m) => (
                <option key={m.id} value={m.slug}>
                  {m.title} ({m.slug})
                </option>
              ))}
            </select>
          </div>

          {manager && (
            <div className="row g-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                      <h2 className="h6 mb-0">
                        list_manager · <code>{manager.slug}</code>{' '}
                        <span className="badge text-bg-light border">{manager.status}</span>
                      </h2>
                      <Link className="btn btn-sm btn-outline-secondary" to={paths.v1.list.edit(manager.id)}>
                        Editar
                      </Link>
                    </div>
                    {manager.description && <p className="text-body-secondary mb-2">{manager.description}</p>}
                    <dl className="row small mb-0">
                      <dt className="col-sm-3">api_get_endpoint</dt>
                      <dd className="col-sm-9"><code>{manager.apiGetEndpoint || '—'}</code></dd>
                      <dt className="col-sm-3">roles</dt>
                      <dd className="col-sm-9">{manager.roles.length ? manager.roles.join(', ') : '—'}</dd>
                      <dt className="col-sm-3">default_sort / order / limit</dt>
                      <dd className="col-sm-9">
                        {manager.defaultSort} · {manager.defaultOrder} · {manager.defaultLimit}
                        {manager.limitOptions.length > 0 && ` (opcoes: ${manager.limitOptions.join(', ')})`}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    {/* Card de LEITURA: o que está gravado em list_columns para esta listagem. */}
                    <h2 className="h6 mb-3">list_columns ({columns.length})</h2>
                    {defsLoading ? (
                      <LoadingOverlay />
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Label</th>
                              <th>Campo / concat</th>
                              <th>Formato</th>
                              <th>Sort</th>
                            </tr>
                          </thead>
                          <tbody>
                            {columns.map((c) => (
                              <tr key={c.id}>
                                <td>{c.label}</td>
                                <td className="small">
                                  {c.concat ? (
                                    <code>{c.concat.map((p) => (p.type === 'field' ? `{${p.key}}` : p.value)).join('')}</code>
                                  ) : (
                                    <code>{c.fieldKey}</code>
                                  )}
                                </td>
                                <td><span className="badge text-bg-light border">{c.format}</span></td>
                                <td>{c.sortable ? <code>{c.sortKey}</code> : <span className="text-body-secondary">—</span>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    {/* Card de LEITURA: ações gravadas + a regra de negócio que as habilita. */}
                    <h2 className="h6 mb-3">list_actions ({actions.length})</h2>
                    {defsLoading ? (
                      <LoadingOverlay />
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Label</th>
                              <th>Tipo</th>
                              <th>Alvo</th>
                              <th>Roles / regra</th>
                            </tr>
                          </thead>
                          <tbody>
                            {actions.map((a) => (
                              <tr key={a.id}>
                                <td>{a.label}</td>
                                <td><span className="badge text-bg-light border">{a.actionType}</span></td>
                                <td className="small"><code>{a.actionType === 'link' ? a.hrefTemplate : `${a.httpMethod} ${a.apiEndpoint}`}</code></td>
                                <td className="small">
                                  {a.roles.length > 0 && <div>roles: {a.roles.join(', ')}</div>}
                                  {a.businessRule && (
                                    <div className="text-body-secondary">
                                      regra: {a.businessRule.field} {a.businessRule.op} {String(a.businessRule.value)}
                                    </div>
                                  )}
                                  {a.roles.length === 0 && !a.businessRule && '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12">
                {/* Janela 5 — grid do MOTOR: renderCell por coluna, evalBusinessRule por ação. */}
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">Grid renderizada — dados reais de {manager.apiGetEndpoint || '—'}</span>
                    {dataTotal > 0 && <span className="text-body-secondary small">{dataTotal} registro(s)</span>}
                  </div>
                  <div className="card-body p-0 position-relative">
                    {dataLoading && <LoadingOverlay overlay />}

                    {dataError && !dataLoading && (
                      <div className="p-4">
                        <EmptyState title="Nao foi possivel carregar os dados" description={dataError} variant="danger" />
                      </div>
                    )}

                    {!dataLoading && !dataError && dataRows.length === 0 && (
                      <div className="p-4">
                        <EmptyState title="Nenhum registro" />
                      </div>
                    )}

                    {!dataLoading && !dataError && dataRows.length > 0 && (
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
                            {dataRows.map((row, i) => (
                              <tr key={str(row.id) || i}>
                                {columns.map((c) => (
                                  <td key={c.id}>{renderCell(c, row)}</td>
                                ))}
                                {/* Ação em PREVIEW: clicar só emite o toast (BLOCO 5); a regra só desabilita. */}
                                {actions.length > 0 && (
                                  <td className="text-end text-nowrap">
                                    {actions.map((a) => {
                                      const allowed = evalBusinessRule(a.businessRule, row);
                                      return (
                                        <button
                                          key={a.id}
                                          type="button"
                                          className="btn btn-sm btn-outline-secondary ms-2"
                                          disabled={!allowed}
                                          title={
                                            allowed
                                              ? a.label
                                              : `${a.label} — bloqueado pela regra (${a.businessRule?.field} ${a.businessRule?.op} ${String(a.businessRule?.value)})`
                                          }
                                          onClick={() => handleActionClick(a, row)}
                                        >
                                          {a.label}
                                        </button>
                                      );
                                    })}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  {/* Rodapé: limite (limit_options do manager) + janela de páginas, tudo na URL. */}
                  <div className="card-footer bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div className="d-flex align-items-center gap-2 small text-body-secondary">
                      <span>Por pagina</span>
                      <select
                        className="form-select form-select-sm w-auto"
                        value={params.limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                      >
                        {(manager.limitOptions.length > 0 ? manager.limitOptions : [10, 20, 50, 100]).map((n) => (
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
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
