/**
 * =========================================================================
 * FILE HEADER — pages/v1/timeline/home-feed/PostCard.tsx
 * =========================================================================
 *
 * O QUE FAZ: template ÚNICO de exibição de uma publicação da Timeline
 * (pedido do usuário: "modelo adaptável para esse nosso sistema"). Ordem
 * fixa: autor/data → indicador de republicação (se houver) → `MediaPreview`
 * (anexos, se houver) → título/descrição → linha de ferramentas (curtir,
 * avaliar com estrelas, comentar, denunciar) → 3 primeiros comentários, com
 * "ver mais" expandindo em scroll infinito (`useInfiniteScroll`) + caixa de
 * novo comentário.
 *
 * NÃO busca a lista de posts (isso é do `GetAllPage.tsx`, que passa `post`
 * já pronto) — só os dados PRÓPRIOS deste card: anexos e comentários.
 *
 * DEPENDÊNCIAS: `@/services/v1` (`timelinePostAttachmentsTable`,
 * `timelinePostCommentsTable`/`.View`, `timelinePostReactionsTable`,
 * `timelinePostRatingsTable`), `@/hooks/useInfiniteScroll`,
 * `@/components/global/MediaPreview`, `@/utils/{apiResult,format}`,
 * `@/routes/paths` (link de Denunciar → renderizador genérico de
 * formulário).
 *
 * LACUNAS CONHECIDAS (registradas em README_modulo_timeline.md, não
 * resolvidas aqui):
 *   - Curtir/Avaliar são "write-only": a API não devolve a reação/nota que
 *     O PRÓPRIO usuário já deu a este post, então o estado local (`liked`,
 *     `myRating`) só reflete cliques feitos NESTA sessão de tela — recarregar
 *     a página perde essa marcação (o valor no banco continua correto).
 *   - "Denunciar" abre o formulário genérico (`/v1/form/timeline-report`)
 *     sem pré-preencher a publicação — o usuário escolhe no select remoto.
 *
 * CONSUMIDORES: `pages/v1/timeline/home-feed/GetAllPage.tsx`.
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useToast } from '@/hooks/useToast';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { ApiError } from '@/services/http';
import {
  timelinePostAttachmentsTable,
  timelinePostCommentsTable,
  timelinePostCommentsView,
  timelinePostReactionsTable,
  timelinePostRatingsTable,
} from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { formatDateTime } from '@/utils/format';
import { paths } from '@/routes/paths';
import MediaPreview from '@/components/global/MediaPreview';
import type { MediaAttachment, MediaCategory } from '@/components/global/MediaPreview';
import type { FeedPost } from './GetAllPage';

const COMMENTS_INITIAL = 3;
const COMMENTS_PAGE_SIZE = 10;
const MEDIA_CATEGORIES: readonly MediaCategory[] = [
  'image', 'video', 'audio', 'document', 'spreadsheet', 'presentation', 'pdf', 'archive', 'other',
];

function str(v: unknown): string {
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '';
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

interface FeedComment {
  id: number;
  content: string;
  authorName: string;
  createdAt: string;
}

function toFeedComment(raw: Record<string, unknown>): FeedComment {
  return {
    id: num(raw.id),
    content: str(raw.tc_content),
    authorName: str(raw.uc_name) || str(raw.um_username) || 'Usuário',
    createdAt: str(raw.created_at),
  };
}

function toMediaAttachment(raw: Record<string, unknown>): MediaAttachment {
  const category = str(raw.category);
  return {
    id: num(raw.id),
    category: (MEDIA_CATEGORIES as readonly string[]).includes(category) ? (category as MediaCategory) : 'other',
    fileUrl: str(raw.file_url),
    name: str(raw.title) || str(raw.original_name) || 'Anexo',
  };
}

export default function PostCard({ post }: { post: FeedPost }) {
  const toast = useToast();

  // Anexos — so busca se o post tiver algum (attachments_count > 0).
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  useEffect(() => {
    if (post.attachmentsCount <= 0) return undefined;
    let active = true;
    timelinePostAttachmentsTable
      .find({ timeline_post_id: post.id }, { limit: 20, sort: 'sort_order', order: 'ASC' })
      .then((raw) => {
        if (!active) return;
        setAttachments(normalizeList<Record<string, unknown>>(raw).rows.map(toMediaAttachment));
      })
      .catch(() => {
        // Sem anexo visivel em caso de falha - nao quebra o card inteiro por causa disso.
      });
    return () => {
      active = false;
    };
  }, [post.id, post.attachmentsCount]);

  // Curtir — otimista: 1o clique soma 1 na exibicao local; cliques seguintes so reenviam (upsert no backend).
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const handleLike = useCallback(async () => {
    try {
      await timelinePostReactionsTable.create({ timeline_post_id: post.id, reaction_type: 'like' });
      setLiked(true);
      setLikesCount((c) => (liked ? c : c + 1));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao curtir.', { title: 'Curtir' });
    }
  }, [post.id, liked, toast]);

  // Avaliar — 5 estrelas clicaveis; mostra a media do post (do carregamento da pagina) e a nota que o usuario acabou de dar (local).
  const [myRating, setMyRating] = useState<number | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const handleRate = useCallback(
    async (rating: number) => {
      setSubmittingRating(true);
      try {
        await timelinePostRatingsTable.create({ timeline_post_id: post.id, rating });
        setMyRating(rating);
        toast.success('Avaliação registrada.', { title: 'Avaliar' });
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Falha ao avaliar.', { title: 'Avaliar' });
      } finally {
        setSubmittingRating(false);
      }
    },
    [post.id, toast],
  );

  // Comentarios — os 3 primeiros carregam no mount; "ver mais" expande com scroll infinito proprio.
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(post.commentsCount);
  const [commentsPage, setCommentsPage] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadComments = useCallback(
    async (page: number, limit: number) => {
      setCommentsLoading(true);
      try {
        const raw = await timelinePostCommentsView.find(
          { tc_timeline_post_id: post.id },
          { page, limit, sort: 'id', order: 'ASC' },
        );
        const { rows, total } = normalizeList<Record<string, unknown>>(raw);
        const mapped = rows.map(toFeedComment);
        setCommentsTotal(total);
        setComments((prev) => (page === 1 ? mapped : [...prev, ...mapped]));
        setCommentsPage(page);
      } catch {
        // Feed nao quebra por falha ao carregar comentario - so fica sem a lista.
      } finally {
        setCommentsLoading(false);
      }
    },
    [post.id],
  );

  useEffect(() => {
    void loadComments(1, COMMENTS_INITIAL);
    // Roda so no mount deste card — loadComments muda de identidade so se post.id mudar (nao acontece).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMoreComments = expanded && comments.length < commentsTotal;
  const sentinelRef = useInfiniteScroll(
    () => void loadComments(commentsPage + 1, COMMENTS_PAGE_SIZE),
    { enabled: hasMoreComments && !commentsLoading },
  );

  // Novo comentario.
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const handleAddComment = useCallback(async () => {
    const content = newComment.trim();
    if (content === '') return;
    setSubmittingComment(true);
    try {
      await timelinePostCommentsTable.create({ timeline_post_id: post.id, content });
      setNewComment('');
      setExpanded(true);
      await loadComments(1, Math.max(COMMENTS_INITIAL, comments.length + 1));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao comentar.', { title: 'Comentar' });
    } finally {
      setSubmittingComment(false);
    }
  }, [newComment, post.id, comments.length, loadComments, toast]);

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <div className="mb-2">
          <strong>{post.authorName}</strong>
          <div className="small text-body-secondary">{formatDateTime(post.publishedAt)}</div>
        </div>

        {post.repostOfId !== null && (
          <div className="border-start border-3 ps-3 mb-3 text-body-secondary small">
            <i className="bi bi-arrow-repeat me-1" />
            Republicado de <strong>{post.repostAuthorName ?? 'publicação removida'}</strong>
            {post.repostContent && <div className="mt-1">{post.repostContent}</div>}
          </div>
        )}

        <MediaPreview attachments={attachments} />

        {post.title !== '' && <h6 className="mb-1">{post.title}</h6>}
        <p className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>
          {post.content}
        </p>

        <div className="d-flex flex-wrap align-items-center gap-3 border-top border-bottom py-2 mb-3">
          <button
            type="button"
            className={`btn btn-sm ${liked ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => void handleLike()}
          >
            <i className="bi bi-hand-thumbs-up me-1" /> Curtir ({likesCount})
          </button>

          <div className="d-flex align-items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="btn btn-sm btn-link p-0"
                disabled={submittingRating}
                aria-label={`Avaliar com ${n} estrela(s)`}
                onClick={() => void handleRate(n)}
              >
                <i className={`bi ${myRating !== null && n <= myRating ? 'bi-star-fill text-warning' : 'bi-star'}`} />
              </button>
            ))}
            {post.ratingsAvg !== null && (
              <span className="small text-body-secondary ms-1">
                {post.ratingsAvg.toFixed(1)} ({post.ratingsCount})
              </span>
            )}
          </div>

          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setExpanded((v) => !v)}>
            <i className="bi bi-chat-dots me-1" /> Comentar ({commentsTotal})
          </button>

          <Link to={paths.v1.form.render('timeline-report')} className="btn btn-sm btn-outline-danger ms-auto">
            <i className="bi bi-flag me-1" /> Denunciar
          </Link>
        </div>

        <div>
          {comments.map((c) => (
            <div key={c.id} className="mb-2">
              <strong className="small">{c.authorName}</strong>{' '}
              <span className="small text-body-secondary">{formatDateTime(c.createdAt)}</span>
              <div className="small">{c.content}</div>
            </div>
          ))}

          {commentsLoading && <div className="small text-body-secondary">Carregando comentários…</div>}

          {!expanded && commentsTotal > comments.length && (
            <button type="button" className="btn btn-sm btn-link ps-0" onClick={() => setExpanded(true)}>
              Ver mais {commentsTotal - comments.length} comentário(s)
            </button>
          )}

          {expanded && comments.length > COMMENTS_INITIAL && !hasMoreComments && (
            <button type="button" className="btn btn-sm btn-link ps-0" onClick={() => setExpanded(false)}>
              Recolher comentários
            </button>
          )}

          {hasMoreComments && <div ref={sentinelRef} style={{ height: 1 }} />}

          <div className="d-flex gap-2 mt-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Escreva um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleAddComment();
              }}
            />
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={submittingComment || newComment.trim() === ''}
              onClick={() => void handleAddComment()}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
