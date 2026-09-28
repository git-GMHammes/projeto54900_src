/**
 * =========================================================================
 * FILE HEADER — pages/v1/timeline/home-feed/PostCard.tsx
 * =========================================================================
 *
 * O QUE FAZ: template ÚNICO de exibição de uma publicação da Timeline
 * (pedido do usuário: "modelo adaptável para esse nosso sistema"). Ordem
 * fixa: autor/data → indicador de republicação (se houver) → `MediaPreview`
 * (anexos, se houver) → título/descrição → linha de ferramentas (curtir,
 * descurtir, avaliar com estrelas, comentar, republicar, denunciar —
 * Curtir/Descurtir/Republicar/Denunciar são ícone-only, com tooltip do
 * Bootstrap mostrando o nome; Curtir/Descurtir/Comentar/Republicar têm badge
 * com a contagem; Avaliar mostra só as 5 estrelas, sem média/contagem — isso
 * fica só na página "Feed", `timeline-posts/GetAllPage.tsx`) → 3 comentários
 * MAIS RECENTES (o último no topo, antigos abaixo), com "ver mais"
 * expandindo em scroll infinito (`useInfiniteScroll`) por JANELA — ver o
 * bloco de comentários no corpo (2026-09-28: corrigido o loop que pulava
 * itens 4-10 e o "tremor" de "Carregando comentários...").
 *
 * CURTIR/DESCURTIR (2026-09-28): mutuamente exclusivos — a mesma UNIQUE
 * (timeline_post_id + user_manager_id) do backend garante 1 reação por
 * usuário por post; clicar no tipo oposto TROCA a reação existente (upsert
 * em `Processor::create`), nunca duplica. Estado inicial (qual botão fica
 * marcado ao recarregar) vem de `post.myReactionType`/`myReactionId`
 * (`Processor::homeFeed` → `attachMyState`, que agora devolve os dois tipos,
 * não só 'like').
 *
 * REPUBLICAR (2026-09-28): faltava nesta tela — só existia como ação nas
 * listas tabulares `timeline-posts`/`timeline-posts-get-all`
 * (`list_actions.data_action='repost'`), mas não na Home Feed (pedido do
 * usuário: "em todas as telas que tiverem o objetivo de like"). Cada clique
 * cria um post NOVO com `repost_of_id=post.id` (`timelinePostsTable.create`,
 * sem upsert — não é toggle, é sempre uma nova publicação, mesmo padrão das
 * listas). `content` vai preenchido com o texto do post original porque o
 * backend (`Processor::validateOnCreate`) exige título OU conteúdo mesmo em
 * repost.
 *
 * NOVO COMENTÁRIO: o botão "Comentar" do toolbar (ícone de balão) NÃO alterna
 * mais expandir/recolher — abre o `NewCommentModal` (form_manager
 * `timeline-comment` renderizado pelo FormGrid: tooltip, validação e fake
 * fill; desde 2026-09-28 — antes era um `<textarea>` escrito à mão), no lugar
 * da linha de input fixa que antes ocupava o rodapé do card (pedido do
 * usuário, 2026-09-27). Ao enviar
 * com sucesso, o modal fecha e a lista de comentários recarrega em modo
 * SILENCIOSO (`loadComments(..., silent: true)` — não liga `commentsLoading`,
 * então não pisca "Carregando comentários..."). Os links "Ver mais"/"Recolher
 * comentários" continuam funcionando à parte, para ver o que já existe.
 *
 * NÃO busca a lista de posts (isso é do `GetAllPage.tsx`, que passa `post`
 * já pronto) — só os dados PRÓPRIOS deste card: anexos e comentários.
 *
 * ANEXO: metadados por `timelinePostAttachmentsTable.find` e o binário por
 * `timelinePostAttachmentsUpload.fetchBlob` (serve com token) — o `fileUrl`
 * passado ao `MediaPreview` é um `blob:` URL, liberado ao desmontar. Nunca usar
 * `file_url` do banco direto em `<img src>`: a rota exige `Authorization`.
 *
 * CARREGAMENTO POR POST INTEIRO (2026-09-28, pedido do usuário): o card só
 * aparece quando anexos baixados + imagem/vídeo renderizados
 * (`MediaPreview.onReady`) + 1ª leva de comentários carregada; até lá mostra
 * um spinner no lugar. O card fica montado oculto (`visibility: hidden`, não
 * `display: none`) para a mídia carregar por baixo. Trava: `READY_TIMEOUT_MS`.
 *
 * DEPENDÊNCIAS: `@/services/v1` (`timelinePostAttachmentsTable`,
 * `timelinePostAttachmentsUpload`,
 * `timelinePostCommentsView`, `timelinePostReactionsTable`,
 * `timelinePostRatingsTable`), `@/hooks/useInfiniteScroll`,
 * `@/hooks/useBootstrapTooltips` (inicializa os tooltips da barra de
 * ferramentas), `@/components/global/MediaPreview`,
 * `@/utils/{apiResult,format}`, `./NewCommentModal` e `./NewReportModal`.
 *
 * ESTADO INICIAL (`myReaction`/`reactionId`/`myRating`) vem de
 * `post.myReactionType`/`post.myReactionId`/`post.myRating` —
 * `Processor::homeFeed` (backend) já devolve a reação/nota que O PRÓPRIO
 * usuário logado deu antes a cada post, então F5/reabrir o
 * sistema mantém os botões marcados (pedido do usuário, 2026-09-27: "o
 * sistema deve se lembrar do que fiz"). Curtir continua toggle: clique cria a
 * reação e guarda o `id` devolvido; clique seguinte remove (`deleteSoft`) com
 * esse `id`; próximo clique cria de novo (o backend restaura a linha
 * soft-deleted).
 *
 * DENUNCIAR (2026-09-28): a bandeira abre o `NewReportModal` NA PRÓPRIA
 * página (antes era link para `/v1/form/timeline-report`, que tirava o
 * usuário do feed). O id do post é injetado — sem o campo "Publicação".
 * Sucesso -> `onReported(post.id)`: a página tira o card do feed. A página
 * admin do form continua existindo para a moderação.
 *
 * EDITAR/EXCLUIR (2026-09-28): logo após a data/hora, dois ícones minúsculos
 * — lápis (abre `EditPostModal`, só o texto; upload não edita) e lixeira
 * vermelha (`ConfirmModal` -> `timelinePostsTable.deleteSoft`). Aparecem SÓ
 * quando o usuário da sessão (`useAuth().user.id`) é o autor do post
 * (`post.authorId` = `tp_user_manager_id`), inclusive para admin. O backend
 * repete a regra (`Processor::assertOwner` -> 404 para post alheio).
 * Sucesso -> `onUpdated(id, content)` / `onDeleted(id)` para a página.
 *
 * CONSUMIDORES: `pages/v1/timeline/home-feed/GetAllPage.tsx`.
 * -------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useBootstrapTooltips } from '@/hooks/useBootstrapTooltips';
import { ApiError } from '@/services/http';
import {
  timelinePostAttachmentsTable,
  timelinePostAttachmentsUpload,
  timelinePostCommentsView,
  timelinePostReactionsTable,
  timelinePostRatingsTable,
  timelinePostsTable,
} from '@/services/v1';
import { normalizeItem, normalizeList } from '@/utils/apiResult';
import { formatDateTime } from '@/utils/format';
import ConfirmModal from '@/components/global/ConfirmModal';
import MediaPreview from '@/components/global/MediaPreview';
import type { MediaAttachment, MediaCategory } from '@/components/global/MediaPreview';
import type { FeedPost } from './GetAllPage';
import EditPostModal from './EditPostModal';
import NewCommentModal from './NewCommentModal';
import NewReportModal from './NewReportModal';

const COMMENTS_INITIAL = 3;
const COMMENTS_PAGE_SIZE = 10;
/** Trava de seguranca: passado esse tempo, o card aparece mesmo que a midia nao tenha avisado. */
const READY_TIMEOUT_MS = 15_000;
/** Card montado mas invisivel e sem ocupar altura (visibility, nao display:none: a midia segue carregando). */
const HIDDEN_UNTIL_READY = { visibility: 'hidden', height: 0, overflow: 'hidden', margin: 0 } as const;
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

export default function PostCard({
  post,
  onReported,
  onUpdated,
  onDeleted,
}: {
  post: FeedPost;
  /** Denúncia enviada com sucesso — a página tira o card do feed (denunciado nunca é exibido). */
  onReported?: (postId: number) => void;
  /** Edição salva pelo dono — a página troca o texto do card. */
  onUpdated?: (postId: number, content: string) => void;
  /** Exclusão confirmada pelo dono — a página tira o card do feed. */
  onDeleted?: (postId: number) => void;
}) {
  // Denunciar — NewReportModal (form_manager 'timeline-report' sem o campo Publicacao; o id vem daqui).
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const toast = useToast();
  const toolbarRef = useBootstrapTooltips<HTMLDivElement>();
  const ownerActionsRef = useBootstrapTooltips<HTMLDivElement>();

  // Editar/Excluir — SO o autor do post (id da sessao === tp_user_manager_id), inclusive admin.
  // O backend repete a regra (Processor::assertOwner -> 404 para post alheio).
  const { user } = useAuth();
  const isOwner = user !== null && post.authorId > 0 && user.id === post.authorId;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await timelinePostsTable.deleteSoft(post.id);
      toast.success('Publicação excluída.', { title: 'Excluir publicação' });
      setConfirmDeleteOpen(false);
      onDeleted?.(post.id);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao excluir.', { title: 'Excluir publicação' });
    } finally {
      setDeleting(false);
    }
  }, [post.id, toast, onDeleted]);

  // Anexos — so busca se o post tiver algum (attachments_count > 0). 2 passos: metadados (find)
  // e, para cada anexo, o BINARIO via serve com token (fetchBlob) -> `blob:` URL no fileUrl.
  // Motivo: o grupo esta sob jwtauth, e <img>/<video>/<a> nao mandam Authorization (401).
  // Os blob: URLs sao liberados (revokeObjectURL) quando o card desmonta ou o post muda.
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  // Prontidao do card (2026-09-28): o post so aparece quando anexos baixados + imagem/video
  // renderizados (MediaPreview.onReady) + 1a leva de comentarios carregada; ate la, spinner.
  // READY_TIMEOUT_MS e a trava de seguranca para o spinner nunca ficar preso.
  const [attachmentsFetched, setAttachmentsFetched] = useState(post.attachmentsCount <= 0);
  const [mediaReady, setMediaReady] = useState(post.attachmentsCount <= 0);
  const [commentsReady, setCommentsReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const ready = timedOut || (attachmentsFetched && mediaReady && commentsReady);
  const handleMediaReady = useCallback(() => setMediaReady(true), []);

  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), READY_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (post.attachmentsCount <= 0) return undefined;
    let active = true;
    const controller = new AbortController();
    const objectUrls: string[] = [];

    timelinePostAttachmentsTable
      .find({ timeline_post_id: post.id }, { limit: 20, sort: 'sort_order', order: 'ASC' })
      .then(async (raw) => {
        const metas = normalizeList<Record<string, unknown>>(raw).rows.map(toMediaAttachment);
        const loaded = await Promise.all(
          metas.map(async (meta) => {
            try {
              const blob = await timelinePostAttachmentsUpload.fetchBlob(meta.id, controller.signal);
              const url = URL.createObjectURL(blob);
              objectUrls.push(url);
              return { ...meta, fileUrl: url };
            } catch {
              return null; // binario indisponivel: some so este anexo, nao o card
            }
          }),
        );
        if (!active) return;
        setAttachments(loaded.filter((a): a is MediaAttachment => a !== null));
        // Lista nova: espera o onReady do MediaPreview (imediato se nao houver imagem/video).
        setMediaReady(false);
        setAttachmentsFetched(true);
      })
      .catch(() => {
        // Sem anexo visivel em caso de falha - nao quebra o card inteiro por causa disso.
        if (!active) return;
        setMediaReady(true);
        setAttachmentsFetched(true);
      });
    return () => {
      active = false;
      controller.abort();
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [post.id, post.attachmentsCount]);

  // Curtir/Descurtir — mutuamente exclusivos (UNIQUE timeline_post_id+user no
  // backend): 1o clique cria a reacao (upsert) e guarda o id devolvido; clicar
  // no MESMO tipo de novo remove (deleteSoft); clicar no tipo OPOSTO troca o
  // reaction_type NA MESMA linha (Processor::create ja faz upsert) — nunca
  // duplica. Estado INICIAL vem de post.myReactionType/post.myReactionId
  // (Processor::homeFeed ja devolve a reacao ativa do usuario logado, os dois
  // tipos desde 2026-09-28) — sem isso os botoes voltavam "apagados" a cada F5
  // mesmo ja tendo reagido antes.
  const [myReaction, setMyReaction] = useState<'like' | 'dislike' | null>(post.myReactionType);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [dislikesCount, setDislikesCount] = useState(post.dislikesCount);
  const [reactionId, setReactionId] = useState<number | null>(post.myReactionId);
  const [reacting, setReacting] = useState(false);
  const handleReact = useCallback(
    async (type: 'like' | 'dislike') => {
      if (reacting) return;
      setReacting(true);

      const prevReaction = myReaction;
      const removing = prevReaction === type;

      // Otimista: ajusta estado local e os 2 contadores antes de chamar a API.
      setMyReaction(removing ? null : type);
      if (removing) {
        if (type === 'like') setLikesCount((c) => Math.max(0, c - 1));
        else setDislikesCount((c) => Math.max(0, c - 1));
      } else {
        if (type === 'like') setLikesCount((c) => c + 1);
        else setDislikesCount((c) => c + 1);
        if (prevReaction === 'like') setLikesCount((c) => Math.max(0, c - 1));
        if (prevReaction === 'dislike') setDislikesCount((c) => Math.max(0, c - 1));
      }

      try {
        if (removing && reactionId !== null) {
          await timelinePostReactionsTable.deleteSoft(reactionId);
          setReactionId(null);
        } else {
          const row = normalizeItem<Record<string, unknown>>(
            await timelinePostReactionsTable.create({ timeline_post_id: post.id, reaction_type: type }),
          );
          if (row?.id !== undefined) setReactionId(num(row.id));
        }
      } catch (err) {
        // Reverte o otimismo.
        setMyReaction(prevReaction);
        if (removing) {
          if (type === 'like') setLikesCount((c) => c + 1);
          else setDislikesCount((c) => c + 1);
        } else {
          if (type === 'like') setLikesCount((c) => Math.max(0, c - 1));
          else setDislikesCount((c) => Math.max(0, c - 1));
          if (prevReaction === 'like') setLikesCount((c) => c + 1);
          if (prevReaction === 'dislike') setDislikesCount((c) => c + 1);
        }
        toast.error(err instanceof ApiError ? err.message : `Falha ao ${type === 'like' ? 'curtir' : 'descurtir'}.`, {
          title: type === 'like' ? 'Curtir' : 'Descurtir',
        });
      } finally {
        setReacting(false);
      }
    },
    [post.id, myReaction, reactionId, reacting, toast],
  );

  // Avaliar — 5 estrelas clicaveis; estado INICIAL vem de post.myRating (Processor::homeFeed ja
  // devolve a nota que o usuario logado deu antes), atualizado localmente a cada novo clique.
  const [myRating, setMyRating] = useState<number | null>(post.myRating);
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

  // Republicar — cria um post novo com repost_of_id apontando pra este (upsert
  // nao existe aqui: cada clique republica de novo, mesmo padrao das listas
  // timeline-posts/timeline-posts-get-all). content vai preenchido porque o
  // backend (Processor::validateOnCreate) exige titulo OU conteudo mesmo em
  // repost — sem isso a API sempre devolve 422.
  const [repostsCount, setRepostsCount] = useState(post.repostsCount);
  const [reposting, setReposting] = useState(false);
  const handleRepost = useCallback(async () => {
    setReposting(true);
    try {
      await timelinePostsTable.create({ repost_of_id: post.id, content: post.content });
      setRepostsCount((c) => c + 1);
      toast.success('Publicação republicada.', { title: 'Republicar' });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao republicar.', { title: 'Republicar' });
    } finally {
      setReposting(false);
    }
  }, [post.id, post.content, toast]);

  // Comentarios — MAIS RECENTE NO TOPO (id DESC). Os 3 mais recentes carregam no mount; "ver mais"
  // expande com scroll infinito proprio, trazendo os mais antigos abaixo.
  //
  // JANELA (2026-09-28): toda carga pede page=1 com limit = quantos ja estao na tela + 10 e
  // SUBSTITUI a lista. Antes a 1a carga era page=1/limit=3 e o "ver mais" page=2/limit=10 — para a
  // API isso e offset 10, entao os itens 4-10 eram pulados, a lista nunca alcancava o total e a
  // sentinela pedia paginas vazias em loop ("tremendo"). `commentsExhausted` e a trava: se a carga
  // voltou menor que o pedido (ou ja cobriu o total), o scroll nao reabre.
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(post.commentsCount);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsExhausted, setCommentsExhausted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  /** Carrega os `windowSize` comentarios mais recentes. `silent=true` (apos publicar) nao liga `commentsLoading` — sem piscar "Carregando comentários...". */
  const loadComments = useCallback(
    async (windowSize: number, silent = false) => {
      if (!silent) setCommentsLoading(true);
      try {
        const raw = await timelinePostCommentsView.find(
          { tc_timeline_post_id: post.id },
          { page: 1, limit: windowSize, sort: 'id', order: 'DESC' },
        );
        const { rows, total } = normalizeList<Record<string, unknown>>(raw);
        const mapped = rows.map(toFeedComment);
        setCommentsTotal(total);
        setComments(mapped);
        setCommentsExhausted(mapped.length < windowSize || mapped.length >= total);
      } catch {
        // Feed nao quebra por falha ao carregar comentario - so fica sem a lista (e sem loop).
        setCommentsExhausted(true);
      } finally {
        if (!silent) setCommentsLoading(false);
      }
    },
    [post.id],
  );

  useEffect(() => {
    // loadComments nunca rejeita (trata o erro por dentro) — o finally so libera a prontidao.
    void loadComments(COMMENTS_INITIAL).finally(() => setCommentsReady(true));
    // Roda so no mount deste card — loadComments muda de identidade so se post.id mudar (nao acontece).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recolhido = so os COMMENTS_INITIAL mais recentes, mesmo que mais ja tenham sido carregados.
  const visibleComments = expanded ? comments : comments.slice(0, COMMENTS_INITIAL);
  const hasMoreComments = expanded && !commentsExhausted && comments.length < commentsTotal;
  const sentinelRef = useInfiniteScroll(
    () => void loadComments(comments.length + COMMENTS_PAGE_SIZE),
    { enabled: hasMoreComments && !commentsLoading },
  );

  // Novo comentario — NewCommentModal (form_manager 'timeline-comment' via FormGrid: tooltip,
  // validacao e fake fill). Depois de enviar, so recarrega a lista aqui.
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const handleCommentCreated = useCallback(() => {
    setExpanded(true);
    // silent=true: atualiza a lista sem exibir "Carregando comentários..." (pedido do usuário).
    // Janela = o que ja estava na tela + o novo (que entra no topo, por ser o id mais recente).
    void loadComments(Math.max(COMMENTS_INITIAL, comments.length + 1), true);
  }, [comments.length, loadComments]);

  return (
    <>
    {/* Spinner no lugar do card enquanto midia/comentarios nao estao prontos. */}
    {!ready && (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando publicação…</span>
          </div>
        </div>
      </div>
    )}

    {/* O card ja fica montado (oculto, sem display:none) para a imagem/video carregar por baixo. */}
    <div className="card border-0 shadow-sm mb-4" style={ready ? undefined : HIDDEN_UNTIL_READY} aria-hidden={!ready}>
      <div className="card-body">
        <div className="mb-2">
          <strong>{post.authorName}</strong>
          <div ref={ownerActionsRef} className="d-flex align-items-center gap-2 small text-body-secondary">
            <span>{formatDateTime(post.publishedAt)}</span>
            {isOwner && (
              <>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 lh-1 text-body-secondary"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => setEditModalOpen(true)}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Editar"
                  aria-label="Editar publicação"
                >
                  <i className="bi bi-pencil" />
                </button>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 lh-1 text-danger"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => setConfirmDeleteOpen(true)}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Excluir"
                  aria-label="Excluir publicação"
                >
                  <i className="bi bi-trash" />
                </button>
              </>
            )}
          </div>
        </div>

        {post.repostOfId !== null && (
          <div className="border-start border-3 ps-3 mb-3 text-body-secondary small">
            <i className="bi bi-arrow-repeat me-1" />
            Republicado de <strong>{post.repostAuthorName ?? 'publicação removida'}</strong>
            {post.repostContent && <div className="mt-1">{post.repostContent}</div>}
          </div>
        )}

        <MediaPreview attachments={attachments} onReady={handleMediaReady} />

        {post.title !== '' && <h6 className="mb-1">{post.title}</h6>}
        <p className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>
          {post.content}
        </p>

        <div
          ref={toolbarRef}
          className="d-flex flex-wrap align-items-center gap-3 border-top border-bottom py-2 mb-3"
        >
          <button
            type="button"
            className={`btn btn-sm position-relative ${myReaction === 'like' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => void handleReact('like')}
            disabled={reacting}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Curtir"
            aria-label="Curtir"
          >
            <i className="bi bi-hand-thumbs-up" />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-secondary">
              {likesCount}
            </span>
          </button>

          <button
            type="button"
            className={`btn btn-sm position-relative ${myReaction === 'dislike' ? 'btn-secondary' : 'btn-outline-secondary'}`}
            onClick={() => void handleReact('dislike')}
            disabled={reacting}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Descurtir"
            aria-label="Descurtir"
          >
            <i className="bi bi-hand-thumbs-down" />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-secondary">
              {dislikesCount}
            </span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary position-relative"
            onClick={() => setCommentModalOpen(true)}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Comentar"
            aria-label="Comentar"
          >
            <i className="bi bi-chat-dots" />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-secondary">
              {commentsTotal}
            </span>
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
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary position-relative"
            onClick={() => void handleRepost()}
            disabled={reposting}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Republicar"
            aria-label="Republicar"
          >
            <i className="bi bi-arrow-repeat" />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-secondary">
              {repostsCount}
            </span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-auto"
            onClick={() => setReportModalOpen(true)}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Denunciar"
            aria-label="Denunciar"
          >
            <i className="bi bi-flag" />
          </button>
        </div>

        <div>
          {visibleComments.map((c) => (
            <div key={c.id} className="mb-2">
              <strong className="small">{c.authorName}</strong>{' '}
              <span className="small text-body-secondary">{formatDateTime(c.createdAt)}</span>
              <div className="small">{c.content}</div>
            </div>
          ))}

          {commentsLoading && <div className="small text-body-secondary">Carregando comentários…</div>}

          {!expanded && commentsTotal > visibleComments.length && (
            <button type="button" className="btn btn-sm btn-link ps-0" onClick={() => setExpanded(true)}>
              Ver mais {commentsTotal - visibleComments.length} comentário(s)
            </button>
          )}

          {expanded && comments.length > COMMENTS_INITIAL && !hasMoreComments && (
            <button type="button" className="btn btn-sm btn-link ps-0" onClick={() => setExpanded(false)}>
              Recolher comentários
            </button>
          )}

          {hasMoreComments && <div ref={sentinelRef} style={{ height: 1 }} />}
        </div>
      </div>

      <NewCommentModal
        open={commentModalOpen}
        postId={post.id}
        onClose={() => setCommentModalOpen(false)}
        onCreated={handleCommentCreated}
      />

      <NewReportModal
        open={reportModalOpen}
        postId={post.id}
        onClose={() => setReportModalOpen(false)}
        onReported={() => onReported?.(post.id)}
      />

      {isOwner && (
        <>
          <EditPostModal
            open={editModalOpen}
            postId={post.id}
            content={post.content}
            onClose={() => setEditModalOpen(false)}
            onUpdated={(content) => onUpdated?.(post.id, content)}
          />

          <ConfirmModal
            open={confirmDeleteOpen}
            title="Excluir publicação"
            message="Deseja realmente excluir esta publicação?"
            confirmLabel="Excluir"
            variant="danger"
            busy={deleting}
            onConfirm={() => void handleDelete()}
            onClose={() => setConfirmDeleteOpen(false)}
          />
        </>
      )}
    </div>
    </>
  );
}
