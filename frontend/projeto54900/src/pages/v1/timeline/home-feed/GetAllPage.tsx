/**
 * =========================================================================
 * FILE HEADER — pages/v1/timeline/home-feed/GetAllPage.tsx
 * =========================================================================
 *
 * PROPÓSITO: página `/v1/timeline` — a "Home Feed" pedida pelo usuário: feed
 * misto (posts de hoje + de outros usuários, aleatório; mais curtidos; mais
 * bem avaliados — algoritmo no backend, ver `README_modulo_timeline.md`
 * seção 5.1), carregado 10 em 10 por scroll infinito (`useInfiniteScroll`),
 * um `PostCard` por publicação, e um botão flutuante no canto superior
 * direito que abre `NewPostModal`.
 *
 * NÃO substitui a listagem clássica (`/v1/timeline-posts`,
 * `pages/v1/timeline/timeline-posts/GetAllPage.tsx`) — são duas telas
 * diferentes, pedido explícito do usuário.
 *
 * SEED: gerado uma única vez (`useState` com inicializador preguiçoso) ao
 * montar a página e reenviado em toda página seguinte — é o que dá paginação
 * aleatória estável e sem repetição durante o scroll (mesmo seed, `page`
 * crescente): o backend recalcula a MESMA ordem global a partir do seed e
 * devolve a fatia da página + `pagination.has_more` (desde 2026-09-28 — antes
 * o scroll parava quando um balde vinha vazio, porque `hasMore` era "veio 10
 * itens"). Desde 2026-09-28 o seed NÃO troca mais ao publicar — o post novo
 * vai para o topo por outro caminho (FIXADOS, abaixo).
 *
 * ORDEM (2026-09-28, pedido do usuário): a 1ª página traz 14 posts (rompe o
 * `PAGE_SIZE`) — 5 recentes aleatórios, 3 mais bem avaliados, 3 mais curtidos,
 * 3 mais comentados; as seguintes, 10 do feed misto. Posts denunciados nunca
 * vêm. Tudo decidido no backend (`Processor::homeFeed`).
 *
 * EDITAR/EXCLUIR (2026-09-28): o `PostCard` mostra lápis/lixeira só no post
 * do próprio usuário da sessão (`FeedPost.authorId` === `useAuth().user.id`);
 * `handleUpdated` troca o texto do card; a exclusão reaproveita
 * `handleReported` (o card sai da tela).
 *
 * FIXADOS: post publicado pelo usuário logado entra no estado `pinned` e é
 * renderizado ACIMA do feed até o F5 (o "Recarregar" não o tira); se o mesmo
 * id vier depois numa página do feed, é filtrado para não duplicar.
 *
 * DEPENDÊNCIAS (o que este arquivo consome):
 *   - `@/services/v1` -> `getHomeFeed(seed, page, limit)`
 *     (`services/v1/timelinePosts.table.ts`; é o endpoint EXTRA
 *     `timeline-posts-view/home-feed`, que lê a view `view_timeline_posts`).
 *   - `@/services/http` -> `ApiError` (erro tipado tratado no `loadPage`).
 *   - `@/hooks/useInfiniteScroll` -> `sentinelRef` (dispara a próxima página).
 *   - `@/utils/apiResult` -> `normalizeList` (extrai `{ rows }` da resposta).
 *   - `@/components/global` -> `PageHeader`, `EmptyState`, `LoadingOverlay`,
 *     `ScrollTopButton` (botao flutuante "voltar ao topo", 2026-09-28).
 *   - `./PostCard` (card de cada publicação) e `./NewPostModal` (modal do FAB).
 *
 * CONSUMIDORES (quem usa este arquivo):
 *   - `routes/v1/timeline.routes.tsx` (`path: 'timeline'`, carregado por lazy).
 *   - Item de navbar "Timeline -> Início" (`menu_manager`).
 *
 * COMO REPLICAR ESTE PADRÃO EM OUTRA PÁGINA (passo a passo):
 *   1. Criar `pages/v1/<modulo>/<recurso>/GetAllPage.tsx` com export default.
 *   2. Importar os componentes globais (`PageHeader`, `EmptyState`,
 *      `LoadingOverlay`) e os pacotes que a tela precisar
 *      (`useInfiniteScroll`, `useApi`, `useToast`, `normalizeList`, `ApiError`).
 *   3. Declarar as constantes de módulo (Bloco 1) e os helpers puros (Bloco 2)
 *      FORA do componente.
 *   4. Declarar o tipo do item que o card vai consumir e o conversor da linha
 *      crua da view para esse tipo (Bloco 3).
 *   5. Declarar os helpers de paginação e de seed (Blocos 4 e 5) e agrupar
 *      todo o estado em `useState` no topo do componente (Bloco 6).
 *   6. Escrever o carregamento com `useCallback`, tratando `ApiError` e
 *      diferenciando "substituir" de "acrescentar" (Bloco 7).
 *   7. Disparar a primeira página num `useEffect` de mount (só uma vez).
 *   8. Ligar o `useInfiniteScroll` a uma sentinela no fim da lista (Bloco 8).
 *   9. Implementar os handlers de ação, ex.: recarregar após criar (Bloco 9).
 *  10. Renderizar header, estados erro/vazio/loading, a lista e o modal
 *      (Bloco 10).
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import ScrollTopButton from '@/components/global/ScrollTopButton';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { ApiError } from '@/services/http';
import { getFeedPost, getHomeFeed } from '@/services/v1';
import { normalizeItem, normalizeList } from '@/utils/apiResult';
import PostCard from './PostCard';
import NewPostModal from './NewPostModal';

/**
 * =========================================================================
 * BLOCO 1 — CONSTANTES DE MÓDULO
 * =========================================================================
 *
 * O QUE FAZ: `PAGE_SIZE` é quantas publicações cada página do feed traz por
 * requisição (vai como `limit` para o `getHomeFeed`).
 * POR QUE É IMPORTANTE: além de limitar a resposta, é o fallback do cálculo
 * de "ainda tem mais?" — `readHasMore` (Bloco 4) usa este valor quando o
 * backend não devolve `pagination.has_more`.
 * CONEXÃO: lido no `loadPage` (Bloco 7) e no `readHasMore` (Bloco 4).
 * COMO REAPROVEITAR: em outra listagem paginada, declarar a constante de
 * tamanho de página aqui fora, no topo do módulo, e usá-la tanto no `limit`
 * do service quanto na checagem de "existe próxima página".
 * -------------------------------------------------------------------------
 */
const PAGE_SIZE = 10;

/**
 * =========================================================================
 * BLOCO 2 — FUNÇÕES AUXILIARES DE NORMALIZAÇÃO (fora do componente)
 * =========================================================================
 *
 * O QUE FAZ: `str` devolve string vazia para qualquer valor que não seja
 * string nem número; `num` converte para número e cai no `fallback` quando o
 * valor não é finito (evita `NaN`).
 * POR QUE É IMPORTANTE: a view pode devolver `null`, `''` ou tipos variados
 * por coluna; sem essa tolerância o `PostCard` receberia `undefined`/`NaN` e
 * a tela quebraria. São puras e sem estado — por isso ficam fora do
 * componente, reaproveitáveis e testáveis isoladamente.
 * CONEXÃO: alimentam o `toFeedPost` (Bloco 3), que monta cada `FeedPost`.
 * COMO REAPROVEITAR: em qualquer tela que leia uma view e mapeie para um tipo
 * tipado, reaproveitar este par de helpers em vez de repetir a checagem de
 * tipo dentro do componente.
 * -------------------------------------------------------------------------
 */
function str(v: unknown): string {
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '';
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * =========================================================================
 * BLOCO 3 — TIPO E CONVERSOR DO ITEM DO FEED
 * =========================================================================
 *
 * O QUE FAZ: `FeedPost` é o formato já normalizado (snake_case da view ->
 * camelCase tipado) que o `PostCard` consome; `toFeedPost` traduz uma linha
 * crua de `view_timeline_posts` (home-feed) para esse formato.
 * POR QUE É IMPORTANTE: isola o "dialeto" do backend (prefixos `tp_`, `um_`,
 * `uc_`, `rp_`, `rc_`, `ru_`) num único ponto — se a view mudar, só este
 * conversor precisa mudar, e o `PostCard` segue estável.
 * CONEXÃO: `toFeedPost` é chamado no `loadPage` (Bloco 7) para cada linha
 * devolvida por `getHomeFeed`; o array resultante é o estado `posts`
 * (Bloco 6), renderizado pelo `PostCard` (Bloco 10).
 * COMO REAPROVEITAR EM OUTRA LISTA: declarar uma interface do item com os
 * campos que o componente de card espera e uma função `to<Item>(raw)` que
 * faça o de-para usando os helpers tolerantes `str`/`num` (Bloco 2) — nunca
 * entregar a linha crua da view direto ao componente.
 * -------------------------------------------------------------------------
 */

/** Formato já normalizado (snake_case da view -> camelCase tipado) que `PostCard.tsx` consome. */
export interface FeedPost {
  id: number;
  title: string;
  content: string;
  publishedAt: string;
  /** `tp_user_manager_id` — autor do post; o `PostCard` compara com o usuário da sessão para mostrar editar/excluir. */
  authorId: number;
  authorName: string;
  authorUsername: string;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  ratingsAvg: number | null;
  ratingsCount: number;
  repostsCount: number;
  attachmentsCount: number;
  repostOfId: number | null;
  repostAuthorName: string | null;
  repostContent: string | null;
  /** Reação ativa do PRÓPRIO usuário logado nesse post — id, ou null se nunca reagiu. */
  myReactionId: number | null;
  /** Tipo da reação ativa ('like'/'dislike'), ou null se nunca reagiu — 2026-09-28, junto do botão Descurtir. */
  myReactionType: 'like' | 'dislike' | null;
  /** Nota (1-5) que o PRÓPRIO usuário logado já deu a esse post, ou null se nunca avaliou. */
  myRating: number | null;
}

/**
 * Traduz uma linha crua de `view_timeline_posts` (home-feed) para `FeedPost`.
 * @param raw linha crua do endpoint home-feed (chaves em snake_case, com os
 *   prefixos `tp_`/`um_`/`uc_`/`rp_`/`rc_`/`ru_`).
 * @returns `FeedPost` tipado; campos ausentes viram `''`/`0` (via `str`/`num`)
 *   e os opcionais (`ratingsAvg`, `repostOfId`, `myReactionId`, `myRating`)
 *   viram `null` quando o backend não os envia.
 */
function toFeedPost(raw: Record<string, unknown>): FeedPost {
  const hasRepost = raw.rp_id !== null && raw.rp_id !== undefined;
  const ratingsAvgRaw = raw.ratings_avg;

  return {
    id: num(raw.id),
    title: str(raw.tp_title),
    content: str(raw.tp_content),
    publishedAt: str(raw.tp_published_at),
    authorId: num(raw.tp_user_manager_id),
    authorName: str(raw.uc_name) || str(raw.um_username) || 'Usuário',
    authorUsername: str(raw.um_username),
    likesCount: num(raw.likes_count),
    dislikesCount: num(raw.dislikes_count),
    commentsCount: num(raw.comments_count),
    ratingsAvg:
      ratingsAvgRaw === null || ratingsAvgRaw === undefined || ratingsAvgRaw === '' ? null : Number(ratingsAvgRaw),
    ratingsCount: num(raw.ratings_count),
    repostsCount: num(raw.reposts_count),
    attachmentsCount: num(raw.attachments_count),
    repostOfId: raw.tp_repost_of_id === null || raw.tp_repost_of_id === undefined ? null : num(raw.tp_repost_of_id),
    repostAuthorName: hasRepost ? str(raw.rc_name) || str(raw.ru_username) : null,
    repostContent: hasRepost ? str(raw.rp_content) : null,
    myReactionId: raw.my_reaction_id === null || raw.my_reaction_id === undefined ? null : num(raw.my_reaction_id),
    myReactionType: raw.my_reaction_type === 'like' || raw.my_reaction_type === 'dislike' ? raw.my_reaction_type : null,
    myRating: raw.my_rating === null || raw.my_rating === undefined ? null : num(raw.my_rating),
  };
}

/**
 * =========================================================================
 * BLOCO 4 — LEITURA DA PAGINAÇÃO (helper fora do componente)
 * =========================================================================
 *
 * O QUE FAZ: extrai `pagination.has_more` da resposta crua do home-feed e o
 * devolve como booleano; se o campo não vier, cai no fallback "veio página
 * cheia" (`pageLength >= PAGE_SIZE`).
 * POR QUE É IMPORTANTE: a última página pode vir cheia e ainda assim ser a
 * última — quem sabe o total é o backend, que decide pela ordem global do
 * seed. Usar a contagem de itens como critério (comportamento antigo) fazia o
 * scroll parar cedo quando um dos baldes do feed vinha vazio.
 * CONEXÃO: chamado no `loadPage` (Bloco 7) para alimentar o estado `hasMore`
 * (Bloco 6), que por sua vez controla o `useInfiniteScroll` (Bloco 8).
 * COMO REAPROVEITAR: em qualquer endpoint paginado que devolva
 * `pagination.has_more`, ler o campo com guarda de tipo (como aqui) em vez de
 * inferir "existe próxima página" pelo tamanho da lista.
 * -------------------------------------------------------------------------
 */

/**
 * `pagination.has_more` do home-feed (backend decide pela ordem global do
 * seed). Fallback "veio página cheia" só se o campo não vier.
 */
function readHasMore(raw: unknown, pageLength: number): boolean {
  const pagination =
    typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>).pagination : undefined;
  const hasMore =
    typeof pagination === 'object' && pagination !== null
      ? (pagination as Record<string, unknown>).has_more
      : undefined;
  return typeof hasMore === 'boolean' ? hasMore : pageLength >= PAGE_SIZE;
}

/**
 * =========================================================================
 * BLOCO 5 — GERAÇÃO DO SEED (helper fora do componente)
 * =========================================================================
 *
 * O QUE FAZ: devolve um inteiro aleatório de 6 dígitos (0 a 999999) usado
 * como "semente" da ordem do feed.
 * POR QUE É IMPORTANTE: o backend embaralha os baldes do feed a partir do
 * seed; gerar o seed UMA vez (no `useState`, Bloco 6) e reenviá-lo a cada
 * página é o que faz a paginação ser estável e sem repetição durante o
 * scroll. Um seed novo a cada requisição embaralharia tudo de novo.
 * CONEXÃO: usado como inicializador preguiçoso do estado `seed` (Bloco 6) e
 * trocado pelo `handleCreated` (Bloco 9) quando o usuário publica um post.
 * COMO REAPROVEITAR: em qualquer listagem com ordem aleatória vinda do
 * backend, gerar o seed aqui fora e passá-lo ao service junto com `page`.
 * -------------------------------------------------------------------------
 */
function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000);
}

/**
 * =========================================================================
 * BLOCO 6 — ESTADO DO COMPONENTE
 * =========================================================================
 *
 * O QUE FAZ: concentra todo o estado da página no topo do componente:
 *   - `seed`      -> semente da ordem do feed (inicializador preguiçoso;
 *                    gerada uma vez, estável até o F5).
 *   - `posts`     -> lista acumulada de `FeedPost` já normalizados.
 *   - `page`      -> última página carregada (o scroll pede `page + 1`).
 *   - `hasMore`   -> há próxima página? (vem do `readHasMore`, Bloco 4).
 *   - `loading`   -> requisição em andamento (liga o `LoadingOverlay`).
 *   - `error`     -> mensagem de falha a exibir no `EmptyState`.
 *   - `modalOpen`  -> controla a abertura do `NewPostModal` (FAB).
 *   - `pinned`    -> posts publicados pelo usuário nesta sessão, fixados no
 *                    topo até o F5 (ver FIXADOS no header).
 * POR QUE É IMPORTANTE: é este conjunto que amarra a tela — `loading`/
 * `hasMore` ligam e desligam o scroll infinito, `posts`/`error` decidem qual
 * bloco o JSX mostra (Bloco 10).
 * CONEXÃO: lido e alterado pelo `loadPage` (Bloco 7) e pelo `handleCreated`
 * (Bloco 9); renderizado no JSX (Bloco 10).
 * COMO REAPROVEITAR: em outra página de lista infinita, manter este mesmo
 * esqueleto de estados (data/loading/error/page/hasMore) e trocar só o tipo
 * do item; para listas simples de uma página, dispensar `page`/`hasMore`.
 * -------------------------------------------------------------------------
 */
export default function HomeFeedGetAllPage() {
  const [seed] = useState(randomSeed);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pinned, setPinned] = useState<FeedPost[]>([]);

  /**
   * =======================================================================
   * BLOCO 7 — CARREGAMENTO DE DADOS
   * =======================================================================
   *
   * O QUE FAZ: `loadPage(nextPage, currentSeed, replace)` chama o
   * `getHomeFeed`, normaliza as linhas (`normalizeList` + `toFeedPost`) e
   * decide como atualizar a tela. O `useEffect` abaixo dispara SÓ a primeira
   * página no mount.
   * PARÂMETROS:
   *   - `nextPage`    -> página a buscar (o scroll pede `page + 1`).
   *   - `currentSeed` -> seed da ordem do feed (estável durante o scroll).
   *   - `replace`     -> `true` substitui a lista (mount/recarregar/pós-post);
   *                      `false` acrescenta ao fim (scroll infinito).
   * POR QUE É IMPORTANTE: é o ponto onde "página -> service -> estado" se
   * fecha; separar `replace` de "acrescentar" é o que evita duplicar itens ou
   * perder o feed no scroll.
   * CONEXÃO: consome `getHomeFeed` (`@/services/v1`), `normalizeList`
   * (`@/utils/apiResult`) e `ApiError` (`@/services/http`); alimenta `posts`,
   * `page`, `hasMore`, `loading` e `error` (Bloco 6). É chamado pelo
   * `useEffect` de mount, pelo `useInfiniteScroll` (Bloco 8), pelo botão
   * "Recarregar" e pelo `handleCreated` (Bloco 9).
   * COMO REAPROVEITAR: repetir o formato `useCallback(fn, [])` com
   * `setLoading`/`setError` no `try`/`catch`/`finally` e um fluxo "substituir
   * x acrescentar" sempre que a lista crescer por scroll.
   * -----------------------------------------------------------------------
   */
  const loadPage = useCallback(async (nextPage: number, currentSeed: number, replace: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getHomeFeed(currentSeed, nextPage, PAGE_SIZE);
      const { rows } = normalizeList<Record<string, unknown>>(raw);
      const mapped = rows.map(toFeedPost);
      setPosts((prev) => (replace ? mapped : [...prev, ...mapped]));
      setPage(nextPage);
      // NÃO usar "veio 10 itens": a última página pode vir cheia e ainda assim
      // ser a última — quem sabe o total é o backend (`has_more`).
      setHasMore(readHasMore(raw, mapped.length));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar o feed.');
      if (replace) setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(1, seed, true);
    // Só no mount — trocar de página não deve reiniciar o feed; quem troca o
    // seed é handleCreated, que já chama loadPage(1, ...) sozinho.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * =======================================================================
   * BLOCO 8 — SCROLL INFINITO (ligação com o hook global)
   * =======================================================================
   *
   * O QUE FAZ: cria a `sentinelRef` do `useInfiniteScroll`; quando a sentinela
   * (um `<div>` de 1px no fim da lista, no JSX do Bloco 10) entra na área
   * visível, o hook chama "carregar a próxima página" — `loadPage(page + 1,
   * seed, false)`, ou seja, ACRESCENTANDO, nunca substituindo.
   * POR QUE É IMPORTANTE: o `enabled: hasMore && !loading` evita duas coisas:
   * pedir página além da última (`hasMore` falso) e disparar um novo pedido
   * enquanto o anterior ainda está em voo (`loading` verdadeiro) — sem isso o
   * scroll poderia duplicar itens.
   * CONEXÃO: usa `useInfiniteScroll` (`@/hooks/useInfiniteScroll`), que não
   * conhece este feed — só avisa "chegou perto do fim"; quem decide carregar é
   * o `loadPage` (Bloco 7). O resultado é anexado à sentinela no JSX (Bloco 10).
   * COMO REAPROVEITAR: em qualquer lista longa, criar a ref com
   * `useInfiniteScroll(() => carregarMais(), { enabled: temMais && !carregando })`
   * e anexá-la a um elemento vazio depois do último item renderizado.
   * -----------------------------------------------------------------------
   */
  const sentinelRef = useInfiniteScroll(() => void loadPage(page + 1, seed, false), {
    enabled: hasMore && !loading,
  });

  /**
   * =======================================================================
   * BLOCO 9 — HANDLERS DE AÇÃO
   * =======================================================================
   *
   * O QUE FAZ: `handleCreated(postId)` é o callback disparado pelo
   * `NewPostModal` quando o usuário publica um post com sucesso. Busca a
   * linha do post novo (`getFeedPost`) e a coloca no TOPO (`pinned`), sem
   * reembaralhar o feed (2026-09-28 — antes trocava o seed e recarregava).
   * Sem id ou com falha na busca, recarrega a 1ª página com o mesmo seed.
   * POR QUE É IMPORTANTE: o post do usuário logado fica no topo até o F5,
   * pedido do usuário; o resto do feed não muda sob os olhos dele.
   * CONEXÃO: recebido como prop `onCreated` pelo `NewPostModal` (Bloco 10);
   * usa `toFeedPost` (Bloco 3) e o `loadPage` (Bloco 7).
   * COMO REAPROVEITAR: em página com modal de criação, passar um callback
   * deste tipo (`onCreated`/`onSaved`) que invalida o que precisa e recarrega
   * a primeira página — evitando pedir ao usuário um refresh manual.
   * -----------------------------------------------------------------------
   */
  const handleCreated = useCallback(
    async (postId: number | null) => {
      if (postId === null) {
        void loadPage(1, seed, true);
        return;
      }
      try {
        const row = normalizeItem<Record<string, unknown>>(await getFeedPost(postId));
        if (!row) return;
        const created = toFeedPost(row);
        setPinned((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // Sem a linha do post novo: recarrega o feed como fallback (mesmo seed).
        void loadPage(1, seed, true);
      }
    },
    [loadPage, seed],
  );

  // Denúncia enviada (NewReportModal via PostCard) ou post excluído pelo dono: o card sai da tela na hora — denunciado nunca é
  // exibido; o backend já o exclui das próximas páginas (SqlViewModel::feedBase).
  const handleReported = useCallback((postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setPinned((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  // Edição salva (EditPostModal via PostCard): troca o texto do card no feed e nos fixados, sem F5.
  const handleUpdated = useCallback((postId: number, content: string) => {
    const patch = (list: FeedPost[]) => list.map((p) => (p.id === postId ? { ...p, content } : p));
    setPosts(patch);
    setPinned(patch);
  }, []);

  // Feed sem os fixados (evita o mesmo post duas vezes na tela).
  const pinnedIds = new Set(pinned.map((p) => p.id));
  const feedPosts = posts.filter((p) => !pinnedIds.has(p.id));

  /**
   * =======================================================================
   * BLOCO 10 — RENDERIZAÇÃO (JSX)
   * =======================================================================
   *
   * O QUE FAZ: monta a tela a partir do estado do Bloco 6, em seções:
   *   1. `PageHeader` "Timeline" + botão "Recarregar" (recarrega a 1ª página).
   *   2. Botão flutuante (FAB) que abre o `NewPostModal`.
   *   3. Estados de tela: erro sem itens -> `EmptyState` danger; feed vazio sem
   *      erro -> `EmptyState` warning; carregando -> `LoadingOverlay`.
   *   4. Lista: `pinned` no topo, depois `feedPosts` (`posts` sem os fixados).
   *   5. Sentinela do scroll infinito (só quando há mais e não está carregando).
   *   6. `NewPostModal` (montado sempre; visibilidade pela prop `open`).
   *   7. `ScrollTopButton` (botão flutuante "voltar ao topo", canto inferior
   *      direito — só aparece depois de rolar; 2026-09-28).
   * POR QUE É IMPORTANTE: é a única camada que o usuário vê; as condições
   * (`!loading`, `posts.length === 0`) garantem que nunca apareça erro e lista
   * ao mesmo tempo, nem "loading" sobre a lista já carregada sem necessidade.
   * CONEXÃO: lê o estado do Bloco 6; dispara `loadPage` (recarregar),
   * `handleCreated` (novo post) e o `sentinelRef` (Bloco 8).
   * COMO REAPROVEITAR: manter esta ordem de seções (header -> feedback ->
   * lista -> sentinela -> modal) em qualquer página de lista; comentar a
   * INTENÇÃO de cada seção com um comentário curto acima dela, sem comentário
   * por tag do JSX.
   * -----------------------------------------------------------------------
   */
  return (
    <>
      <PageHeader title="Timeline" subtitle="Recentes, mais bem avaliados, mais curtidos e mais comentados">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => void loadPage(1, seed, true)}
          disabled={loading}
        >
          Recarregar
        </button>
      </PageHeader>

      {/* Botão flutuante de novo post — canto superior direito, pedido do usuário. */}
      <button
        type="button"
        className="btn btn-primary rounded-circle shadow position-fixed"
        style={{ top: '5.5rem', right: '1.5rem', width: '3.25rem', height: '3.25rem', zIndex: 1030 }}
        aria-label="Nova publicação"
        title="Nova publicação"
        onClick={() => setModalOpen(true)}
      >
        <i className="bi bi-plus-lg fs-5" />
      </button>

      {/* Estados de tela: erro sem itens, feed vazio e carregando. */}
      {error && posts.length === 0 && pinned.length === 0 && !loading && (
        <EmptyState title="Feed indisponível" description={error} variant="danger" />
      )}

      {!error && posts.length === 0 && pinned.length === 0 && !loading && (
        <EmptyState
          variant="warning"
          eyebrow="Feed vazio"
          title="Nenhuma publicação ainda"
          description="Seja o primeiro a publicar."
        />
      )}

      {/* Fixados (posts do usuário nesta sessão) no topo, depois o feed — um PostCard por item. */}
      {pinned.map((post) => (
        <PostCard
          key={`pinned-${post.id}`}
          post={post}
          onReported={handleReported}
          onUpdated={handleUpdated}
          onDeleted={handleReported}
        />
      ))}

      {feedPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onReported={handleReported}
          onUpdated={handleUpdated}
          onDeleted={handleReported}
        />
      ))}

      {loading && <LoadingOverlay label={posts.length > 0 ? 'Carregando mais publicações…' : 'Carregando…'} />}

      {/* Sentinela do scroll infinito: ao entrar na viewport, pede a próxima página. */}
      {hasMore && !loading && posts.length > 0 && <div ref={sentinelRef} style={{ height: 1 }} />}

      <NewPostModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={(postId) => void handleCreated(postId)} />

      {/* Botão flutuante "voltar ao topo" — canto inferior direito, pedido do usuário. */}
      <ScrollTopButton />
    </>
  );
}
