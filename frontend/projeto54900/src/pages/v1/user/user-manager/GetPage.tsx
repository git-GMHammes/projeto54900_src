/**
 * =============================================================================
 * FILE HEADER — GetPage (user-manager) — detalhe de UM usuário (só leitura)
 * =============================================================================
 *
 * O QUE FAZ:
 *   Rota de detalhe do módulo user-manager: busca UM usuário pelo `id` da URL e
 *   o exibe em modo LEITURA, campo a campo. É a tela de consulta — quem cria e
 *   edita são `CreatePage` e `UpdatePage`.
 *
 * FLUXO (3 etapas):
 *   1. `useApi` (BLOCO 1) dispara `userManagerView.get(id ?? '', { signal })` —
 *      o hook resolve `data`/`error`/`loading` e aborta a requisição na
 *      desmontagem;
 *   2. `normalizeItem(data)` extrai o registro de dentro do envelope da API
 *      (`{data}`/`{item}`/`{result}` — ver `@/utils/apiResult`);
 *   3. o JSX (BLOCO 2) percorre o registro com `Object.entries` e imprime tudo.
 *
 * VIEW, NÃO TABELA (a escolha de service que explica o endpoint):
 *   o service é `userManagerView` (endpoint `user-manager-view`), não
 *   `userManagerTable`. A view entrega o registro já enriquecido para leitura e
 *   NÃO aceita escrita — por isso o botão "Editar" navega para `UpdatePage`, que
 *   é quem usa a tabela real (`user-manager`).
 *
 * COMO O DETALHE É RENDERIZADO (a decisão que explica o resto do arquivo):
 *   NÃO existe lista de campos escrita à mão. O bloco é GERADO a partir das
 *   CHAVES do próprio registro, com um único tratamento especial: campo cujo
 *   nome termina em `_at` -> `formatDateTime`; todo o resto -> `toText`.
 *   Consequência prática: coluna nova na view aparece sozinha na tela — porém
 *   com o nome TÉCNICO (snake_case) como rótulo.
 *
 * DEPENDÊNCIAS:
 *   - `@/hooks/useApi` — estado de chamada assíncrona (`data`/`error`/`loading`/`run`).
 *   - `@/services/v1` (`userManagerView`) — o service REST de leitura.
 *   - `@/utils/apiResult` (`normalizeItem`) e `@/utils/format`
 *     (`formatDateTime`, `toText`).
 *   - `@/components/global` (`PageHeader`, `EmptyState`, `LoadingOverlay`) e
 *     `@/routes/paths` (rotas de volta e de edição).
 *
 * CONSUMIDORES: `src/routes/v1/user.routes.tsx` (rota de detalhe, lazy).
 *   É aberta pelos botões de ação da lista (`GetAllPage`), pelo redirect depois
 *   do create (`CreatePage`) e pelo redirect depois do update (`UpdatePage`).
 *
 * COMO CRIAR UMA TELA DE DETALHE SIMILAR (outro recurso):
 *   1. troque o service pelo recurso desejado (de preferência a `-view`);
 *   2. mantenha `useParams` + `useApi` + `run()` no efeito dependente de `id`;
 *   3. mantenha `normalizeItem` para extrair o registro do envelope;
 *   4. ajuste os rótulos/tratamentos especiais do `<dl>` (aqui, `_at`).
 *
 * REGRAS DE MANUTENÇÃO:
 *   1. O efeito depende de `[run, id]`, e o `id` está ali DE PROPÓSITO: trocar o
 *      usuário na URL recarrega o detalhe sem remontar a página.
 *   2. `id ?? ''` cobre o instante em que o parâmetro da rota ainda não está
 *      disponível — o mesmo padrão das outras telas de detalhe do projeto.
 *   3. Rótulos amigáveis exigiriam um mapa de campos (hoje não existe) — é
 *      mudança de produto, não de comentário.
 *   4. O `<dl>` não tem coluna de ações: qualquer ação nova (ex.: excluir) deve
 *      entrar no `<PageHeader>`, junto de "Voltar"/"Editar".
 * =============================================================================
 */

import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { paths } from '@/routes/paths';
import { userManagerView } from '@/services/v1';
import { useApi } from '@/hooks/useApi';
import { normalizeItem } from '@/utils/apiResult';
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
 *     `userManagerView.get(id ?? '', { signal })`;
 *   - `useApi` recebe uma FUNÇÃO que devolve a promise (e não a promise pronta:
 *     assim o `run()` pode ser chamado de novo, ex.: no "Tentar novamente") e
 *     expõe `data`/`error`/`loading`/`run`; o `signal` aborta na desmontagem;
 *   - o efeito chama `run()` na montagem e a cada mudança de `id`;
 *   - `normalizeItem(data)` (memoizado) extrai o registro do envelope da API e
 *     vira `user`, consumido pelo JSX do BLOCO 2.
 *
 * POR QUE `useApi` (e não `useState` + `fetch` à mão): ele centraliza o ciclo
 *   `loading`/`error`/abort, e é o mesmo hook das outras telas do projeto —
 *   trocar o mecanismo aqui quebraria a consistência da camada.
 * -------------------------------------------------------------------------
 */
export default function GetPage() {
  const { id } = useParams();
  const { data, error, loading, run } = useApi((signal) =>
    userManagerView.get(id ?? '', { signal }),
  );

  // Recarrega na montagem e sempre que o `id` da rota mudar.
  useEffect(() => {
    void run();
  }, [run, id]);

  // Registro do envelope da API (usado pelo JSX do BLOCO 2).
  const user = useMemo(() => normalizeItem(data), [data]);

  /**
   * =============================================================================
   * BLOCO 2 — RENDERIZAÇÃO (JSX)
   * =============================================================================
   *
   * O QUE FAZ, em 4 janelas — e a ordem delas importa:
   *   1. `<PageHeader>` — título com o id + "Voltar" (lista) e "Editar" (rota de
   *      update do MESMO registro);
   *   2. `loading` -> `<LoadingOverlay />` cheio;
   *   3. `error` -> `<EmptyState variant="danger">` com botão "Tentar novamente"
   *      (chama `run()` de novo — o mesmo hook do BLOCO 1). Quando a API responde
   *      sem registro (`!user`), o estado é OUTRO: `<EmptyState>` "Usuario nao
   *      encontrado", sem botão — não é falha de rede, é ausência de dado;
   *   4. registro carregado -> cartão com `<dl>` gerado por
   *      `Object.entries(user)` (nome da chave como rótulo, valor formatado).
   *
   * COMO REAPROVEITAR: este é o esqueleto padrão de tela de detalhe do projeto
   *   (header + estados de tela + conteúdo). Para exibir apenas campos
   *   escolhidos, troque a `<dl>` genérica por uma lista explícita de `<dt>/<dd>`.
   * -------------------------------------------------------------------------
   */
  return (
    <>
      <PageHeader title={`Usuario #${id ?? ''}`} subtitle="api/v1/user-manager-view">
        <Link className="btn btn-outline-secondary" to={paths.v1.user.profilesList}>
          Voltar
        </Link>
        <Link className="btn btn-primary" to={paths.v1.user.update(id ?? '')}>
          Editar
        </Link>
      </PageHeader>

      {/* 2. Carga em andamento: overlay cheio (o detalhe ainda não existe). */}
      {loading && <LoadingOverlay />}

      {/* 3a. Falha de rede/API: EmptyState com botão de nova tentativa. */}
      {!loading && error && (
        <EmptyState variant="danger" title="Falha ao carregar" description={error.message}>
          <button className="btn btn-outline-danger btn-sm" onClick={() => void run()}>
            Tentar novamente
          </button>
        </EmptyState>
      )}

      {/* 3b. A API respondeu, mas sem registro para o id da rota. */}
      {!loading && !error && !user && <EmptyState title="Usuario nao encontrado" />}

      {!loading && !error && user && (
        <div className="card">
          <div className="card-body">
            {/* 4. Detalhe gerado a partir das CHAVES do registro (sem lista fixa de campos). */}
            <dl className="row mb-0">
              {Object.entries(user).map(([field, value]) => (
                <div className="col-12 col-sm-6" key={field}>
                  <dt className="text-body-secondary small text-uppercase">{field}</dt>
                  <dd>{field.includes('_at') ? formatDateTime(value) : toText(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
