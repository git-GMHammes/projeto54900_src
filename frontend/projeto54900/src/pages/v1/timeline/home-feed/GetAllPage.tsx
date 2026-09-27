/**
 * =========================================================================
 * FILE HEADER — pages/v1/timeline/home-feed/GetAllPage.tsx
 * =========================================================================
 *
 * O QUE FAZ: página `/v1/timeline` — a "Home Feed" pedida pelo usuário: feed
 * misto (posts de hoje + de outros usuários, aleatório; mais curtidos; mais
 * bem avaliados — algoritmo no backend, ver `README_modulo_timeline.md`
 * seção 5.1), carregado 10 em 10 por scroll infinito (`useInfiniteScroll`),
 * um `PostCard` por publicação, e um botão flutuante no canto superior
 * direito que abre `NewPostModal`.
 *
 * NÃO substitui a listagem clássica (`/v1/timeline-posts`,
 * `pages/v1/timeline/timeline-posts/GetAllPage.tsx`, Fase 2) — são duas
 * telas diferentes, pedido explícito do usuário.
 *
 * SEED: gerado uma única vez (`useState` com inicializador preguiçoso) ao
 * montar a página e reenviado em toda página seguinte — é o que dá
 * paginação aleatória estável e sem repetição durante o scroll (mesmo seed,
 * `page` crescente). Só troca quando o usuário publica um post novo
 * (`handleCreated`), pra dar uma chance boa de o post novo aparecer no
 * balde "hoje" da primeira leva.
 *
 * DEPENDÊNCIAS: `@/services/v1` (`getHomeFeed`), `@/hooks/useInfiniteScroll`,
 * `@/utils/apiResult`, `@/components/global` (`PageHeader`, `EmptyState`,
 * `LoadingOverlay`), `./PostCard`, `./NewPostModal`.
 * CONSUMIDORES: `routes/v1/timeline.routes.tsx` (`path: 'timeline'`, lazy).
 * Item de navbar "Timeline → Início" (`menu_manager`).
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';

import PageHeader from '@/components/global/PageHeader';
import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { ApiError } from '@/services/http';
import { getHomeFeed } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import PostCard from './PostCard';
import NewPostModal from './NewPostModal';

const PAGE_SIZE = 10;

function str(v: unknown): string {
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '';
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Formato já normalizado (snake_case da view -> camelCase tipado) que `PostCard.tsx` consome. */
export interface FeedPost {
  id: number;
  title: string;
  content: string;
  publishedAt: string;
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
}

/** Traduz uma linha crua de view_timeline_posts (home-feed) para FeedPost. */
function toFeedPost(raw: Record<string, unknown>): FeedPost {
  const hasRepost = raw.rp_id !== null && raw.rp_id !== undefined;
  const ratingsAvgRaw = raw.ratings_avg;

  return {
    id: num(raw.id),
    title: str(raw.tp_title),
    content: str(raw.tp_content),
    publishedAt: str(raw.tp_published_at),
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
  };
}

function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000);
}

export default function HomeFeedGetAllPage() {
  const [seed, setSeed] = useState(randomSeed);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadPage = useCallback(async (nextPage: number, currentSeed: number, replace: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getHomeFeed(currentSeed, nextPage, PAGE_SIZE);
      const { rows } = normalizeList<Record<string, unknown>>(raw);
      const mapped = rows.map(toFeedPost);
      setPosts((prev) => (replace ? mapped : [...prev, ...mapped]));
      setPage(nextPage);
      setHasMore(mapped.length >= PAGE_SIZE);
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

  const sentinelRef = useInfiniteScroll(() => void loadPage(page + 1, seed, false), {
    enabled: hasMore && !loading,
  });

  const handleCreated = useCallback(() => {
    const nextSeed = randomSeed();
    setSeed(nextSeed);
    setHasMore(true);
    void loadPage(1, nextSeed, true);
  }, [loadPage]);

  return (
    <>
      <PageHeader title="Timeline" subtitle="Feed misto — hoje, outros usuários, mais curtidos e mais bem avaliados">
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

      {error && posts.length === 0 && !loading && (
        <EmptyState title="Feed indisponível" description={error} variant="danger" />
      )}

      {!error && posts.length === 0 && !loading && (
        <EmptyState
          variant="warning"
          eyebrow="Feed vazio"
          title="Nenhuma publicação ainda"
          description="Seja o primeiro a publicar."
        />
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {loading && <LoadingOverlay label={posts.length > 0 ? 'Carregando mais publicações…' : 'Carregando…'} />}

      {hasMore && !loading && posts.length > 0 && <div ref={sentinelRef} style={{ height: 1 }} />}

      <NewPostModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />
    </>
  );
}
