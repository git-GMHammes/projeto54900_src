/**
 * =============================================================================
 * FILE HEADER — GetPage (menu) — detalhe de UM item de menu
 * =============================================================================
 *
 * O QUE FAZ:
 *   Rota de detalhe do módulo menu: busca UM item de `menu_manager` pelo `id` da
 *   rota e o exibe em modo LEITURA, campo a campo. É a tela de consulta — quem
 *   cria/edita são os placeholders `CreatePage` e `UpdatePage`.
 *
 * FLUXO (3 etapas):
 *   1. `useApi` (BLOCO 1) dispara `menuManagerTable.get(id)` — o hook resolve
 *      `data`/`error`/`loading` e aceita `signal` para abortar na desmontagem;
 *   2. `normalizeItem(data)` extrai o registro de dentro do envelope da API
 *      (`{data}`/`{item}`/`{result}` — ver `@/utils/apiResult`);
 *   3. o JSX (BLOCO 2) percorre o registro com `Object.entries` e imprime tudo.
 *
 * COMO O DETALHE É RENDERIZADO (a decisão que explica o resto do arquivo):
 *   NÃO existe lista de campos escrita à mão. A tabela é GERADA a partir das
 *   CHAVES do próprio registro, com dois tratamentos especiais:
 *     terminados em `_at` -> `formatDateTime` (timestamps)
 *     `roles`             -> `parseStringList(...).join(', ')` (campo de lista JSON)
 *   Consequência prática: qualquer coluna nova em `menu_manager` aparece sozinha
 *   na tela — porém com o nome TÉCNICO (snake_case) como rótulo.
 *
 * DEPENDÊNCIAS:
 *   - `@/hooks/useApi` — estado de chamada assíncrona (`data`/`error`/`loading`/`run`).
 *   - `@/services/v1` (`menuManagerTable`) — o service REST do recurso.
 *   - `@/utils/apiResult` (`normalizeItem`), `@/utils/jsonList`
 *     (`parseStringList`) e `@/utils/format` (`formatDateTime`, `toText`).
 *   - `@/components/global` (`PageHeader`, `EmptyState`, `LoadingOverlay`) e
 *     `@/routes/paths` (rotas de volta e de edição).
 *
 * CONSUMIDORES: `src/routes/v1/menu.routes.tsx` (rota de detalhe, lazy).
 *   Chamada pelo botão de ação "Ver" (definido em `list_actions` do slug
 *   `menu`) e pelo `GetAllPage.tsx` no modo árvore.
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. O efeito depende de `[run, id]`, e o `id` está ali DE PROPÓSITO: trocar o
 *      item na URL recarrega o detalhe sem remontar a página.
 *   2. O botão "Voltar" é CONTEXTUAL: com `nav_manager_id` no registro, volta
 *      para a lista DAQUELE nav; sem ele, para a lista geral.
 *   3. Rótulos amigáveis exigiriam um mapa de campos (hoje não existe) — mudança
 *      de produto, não de comentário.
 * =============================================================================
 */

import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { paths } from '@/routes/paths';
import { menuManagerTable } from '@/services/v1';
import { useApi } from '@/hooks/useApi';
import { normalizeItem } from '@/utils/apiResult';
import { parseStringList } from '@/utils/jsonList';
import { formatDateTime, toText } from '@/utils/format';

import PageHeader from '@/components/global/PageHeader';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import EmptyState from '@/components/global/EmptyState';

/**
 * =============================================================================
 * BLOCO 1 — DADOS (rota -> useApi -> normalizeItem)
 * =============================================================================
 *
 * O QUE FAZ, na ordem:
 *   - `useParams()` dá o `id` da URL e ele vai direto para
 *     `menuManagerTable.get(id ?? '', { signal })`; o `?? ''` cobre o instante
 *     em que o parâmetro da rota ainda não está disponível;
 *   - `useApi` recebe uma FUNÇÃO que devolve a promise e expõe
 *     `data`/`error`/`loading`/`run`; o `signal` permite abortar a requisição;
 *   - o efeito chama `run()` na montagem e a cada mudança de `id`;
 *   - `normalizeItem(data)` (memoizado) extrai o registro do envelope;
 *   - `navManagerId` sai do PRÓPRIO registro e decide o destino do "Voltar"
 *     (BLOCO 2) — `toText(..., '')` normaliza o valor para string.
 *
 * POR QUE `useApi` (e não `useState` + `fetch` à mão): ele centraliza o ciclo
 *   `loading`/`error`/abort, o mesmo hook usado nas outras telas de detalhe.
 * -------------------------------------------------------------------------
 */
export default function GetPage() {
  const { id } = useParams();
  const { data, error, loading, run } = useApi((signal) =>
    menuManagerTable.get(id ?? '', { signal }),
  );

  // Recarrega na montagem e sempre que o `id` da rota mudar.
  useEffect(() => {
    void run();
  }, [run, id]);

  // Registro do envelope da API + o nav de origem (define o destino do "Voltar").
  const item = useMemo(() => normalizeItem(data), [data]);
  const navManagerId = item ? toText((item as Record<string, unknown>).nav_manager_id, '') : '';

  /**
   * =============================================================================
   * BLOCO 2 — RENDERIZAÇÃO (JSX)
   * =============================================================================
   *
   * O QUE FAZ, em 5 janelas:
   *   1. `<PageHeader>` — título com o id + "Voltar" (contextual: lista do nav,
   *      quando o registro tem `nav_manager_id`; senão, lista geral) e "Editar"
   *      (rota de update).
   *   2. `loading` -> `<LoadingOverlay />`.
   *   3. `error` -> `<EmptyState variant="danger">` com botão "Tentar novamente"
   *      (chama `run()` de novo — o mesmo hook do BLOCO 1).
   *   4. registro inexistente (`!item`) -> `<EmptyState>` "Item nao encontrado".
   *   5. registro carregado -> `<dl>` gerado por `Object.entries(item)`.
   *
   * DETALHE DA `<dl>`: cada campo vira `<dt>` (nome técnico, em maiúsculas) +
   *   `<dd>` (valor), em duas colunas a partir de `sm`. Os dois casos especiais
   *   (`*_at` e `roles`) estão comentados no ponto exato do JSX, e o `text-break`
   *   do `<dd>` evita estourar a largura com valores longos (JSON).
   *
   * COMO REAPROVEITAR: é o esqueleto padrão de tela de detalhe do projeto
   *   (header + 4 estados + conteúdo). Para campos escolhidos em vez de todos, o
   *   caminho é trocar a `<dl>` genérica por uma lista explícita.
   * -------------------------------------------------------------------------
   */
  return (
    <>
      <PageHeader title={`Item de menu #${id ?? ''}`} subtitle="api/v1/menu-manager">
        <Link
          className="btn btn-outline-secondary"
          to={navManagerId ? paths.v1.menu.listByNav(navManagerId) : paths.v1.menu.list}
        >
          Voltar
        </Link>
        <Link className="btn btn-primary" to={paths.v1.menu.update(id ?? '')}>
          Editar
        </Link>
      </PageHeader>

      {loading && <LoadingOverlay />}

      {/* Erro de carga: mantém o botão de nova tentativa ligado ao mesmo `run`. */}
      {!loading && error && (
        <EmptyState variant="danger" title="Falha ao carregar" description={error.message}>
          <button className="btn btn-outline-danger btn-sm" onClick={() => void run()}>
            Tentar novamente
          </button>
        </EmptyState>
      )}

      {/* 404 do recurso: a API respondeu, mas sem registro para o id. */}
      {!loading && !error && !item && <EmptyState title="Item nao encontrado" />}

      {!loading && !error && item && (
        <div className="card">
          <div className="card-body">
            {/* Detalhe gerado a partir das CHAVES do registro (sem lista fixa de campos). */}
            <dl className="row mb-0">
              {Object.entries(item).map(([field, value]) => {
                // Casos especiais: timestamps e o campo de lista JSON `roles`.
                let shown = toText(value);
                if (field.includes('_at')) shown = formatDateTime(value);
                else if (field === 'roles') shown = parseStringList(toText(value, '')).join(', ') || '-';
                return (
                  <div className="col-12 col-sm-6" key={field}>
                    <dt className="text-body-secondary small text-uppercase">{field}</dt>
                    <dd className="text-break">{shown}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
