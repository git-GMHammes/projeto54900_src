/**
 * =========================================================================
 * FILE HEADER — components/global/MediaPreview.tsx
 * =========================================================================
 *
 * PROPOSITO: componente GLOBAL de carregamento/preview de anexo — imagem e
 * vídeo tocam INLINE; qualquer outra categoria (PDF, Office, planilha,
 * áudio, arquivo compactado, "outro") vira um ÍCONE Bootstrap num card médio
 * (tamanho de card de celular), clicável, abrindo o arquivo em nova aba.
 * Pedido explícito do usuário: "COMPONENTE GLOBAL de CARREGAMENTO (no post)
 * de Imagem, Vídeo, Documentos Office" — este é ESSE componente, reaproveitável
 * por qualquer tela que precise mostrar anexo, não só a Timeline.
 *
 *   <MediaPreview attachments={attachments} />
 *
 * FUNDO: imagem e vídeo usam `bg-black` (faixas ao redor de mídia vertical ou
 * com proporção diferente ficam pretas, não claras). Cartões de arquivo mantêm
 * o fundo do tema.
 *
 * NÃO faz chamada de rede: recebe os anexos JÁ carregados pelo componente
 * pai (ex.: `PostCard.tsx`, via `timelinePostAttachmentsTable.find(...)`) —
 * mantém este componente puro e reaproveitável fora do módulo Timeline.
 *
 * FORMATO ESPERADO DE CADA ANEXO (`MediaAttachment`): campos mínimos comuns a
 * qualquer tabela de anexo do projeto (`category`, `file_url`, nome) — não é
 * o tipo exato de `timeline_post_attachments`, é um subconjunto, para o
 * componente não ficar acoplado a UM módulo específico.
 *
 * `fileUrl` PRECISA ser carregável sem cabeçalho: se a rota do binário exige
 * `Authorization` (caso da Timeline, sob `jwtauth`), o pai baixa o `Blob` com
 * token e passa um `blob:` URL (`URL.createObjectURL`) — ver `PostCard.tsx`.
 *
 * DEPENDÊNCIAS: nenhuma (Bootstrap Icons já carregado globalmente pelo
 * projeto — `bootstrap-icons`, ver `bootstrap.ts`).
 * CONSUMIDORES: `pages/v1/timeline/home-feed/PostCard.tsx`. Qualquer módulo
 * futuro com anexo (Upload, Calendar) pode importar daqui em vez de escrever
 * a própria lógica de categoria → ícone.
 *
 * COMO REAPROVEITAR EM OUTRO MÓDULO: mapeie o registro de anexo do seu
 * módulo para `MediaAttachment` (mesma forma de `category`/`fileUrl`/`name`)
 * antes de passar para este componente — não precisa ser exatamente
 * `timeline_post_attachments`.
 * -------------------------------------------------------------------------
 */

import { useCallback, useLayoutEffect, useRef } from 'react';

export type MediaCategory =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'pdf'
  | 'archive'
  | 'other';

export interface MediaAttachment {
  id: number | string;
  category: MediaCategory;
  fileUrl: string;
  name: string;
}

/** Ícone Bootstrap por categoria — só para as categorias que NÃO tocam inline (tudo, exceto image/video). */
const ICON_BY_CATEGORY: Record<Exclude<MediaCategory, 'image' | 'video'>, string> = {
  audio: 'file-earmark-music',
  document: 'file-earmark-word',
  spreadsheet: 'file-earmark-excel',
  presentation: 'file-earmark-ppt',
  pdf: 'file-earmark-pdf',
  archive: 'file-earmark-zip',
  other: 'file-earmark',
};

/** Categorias que tocam inline e, por isso, têm evento de "terminou de carregar". */
function isInlineMedia(attachment: MediaAttachment): boolean {
  return attachment.category === 'image' || attachment.category === 'video';
}

/**
 * Um anexo: imagem/vídeo inline, os demais um card com ícone + nome, clicável (abre em nova aba).
 * `onDone` dispara quando a imagem/vídeo termina de carregar OU falha (erro também conta, para
 * quem espera o carregamento nunca ficar preso).
 */
function AttachmentItem({ attachment, onDone }: { attachment: MediaAttachment; onDone: () => void }) {
  if (attachment.category === 'image') {
    return (
      <img
        src={attachment.fileUrl}
        alt={attachment.name}
        className="img-fluid rounded bg-black"
        style={{ maxHeight: '420px', width: '100%', objectFit: 'cover' }}
        onLoad={onDone}
        onError={onDone}
      />
    );
  }

  if (attachment.category === 'video') {
    return (
      <video
        src={attachment.fileUrl}
        controls
        preload="auto"
        className="w-100 rounded bg-black"
        style={{ maxHeight: '420px' }}
        onLoadedData={onDone}
        onError={onDone}
      />
    );
  }

  const icon = ICON_BY_CATEGORY[attachment.category];

  return (
    <a
      href={attachment.fileUrl}
      target="_blank"
      rel="noreferrer"
      className="d-flex flex-column align-items-center justify-content-center text-decoration-none border rounded bg-body-tertiary p-3 mx-auto"
      style={{ width: '220px', height: '220px' }}
      title={attachment.name}
    >
      <i className={`bi bi-${icon}`} style={{ fontSize: '3.5rem' }} />
      <span className="small text-truncate w-100 text-center mt-2 text-body">{attachment.name}</span>
    </a>
  );
}

/**
 * Preview de 1 ou mais anexos de um post/registro — imagem/vídeo inline, demais em ícone. Sem anexo,
 * não renderiza nada.
 *
 * `onReady` (opcional, 2026-09-28): chamado UMA vez por lista de anexos, quando TODAS as imagens e
 * vídeos terminaram de carregar (ou falharam). Sem imagem/vídeo, é chamado logo após montar. Usado
 * pelo `PostCard` para só exibir o post quando a mídia já está pronta.
 */
export default function MediaPreview({
  attachments,
  onReady,
}: {
  attachments: MediaAttachment[];
  onReady?: () => void;
}) {
  const onReadyRef = useRef(onReady);
  const doneRef = useRef<Set<MediaAttachment['id']>>(new Set());
  const firedRef = useRef(false);
  const mediaCount = attachments.filter(isInlineMedia).length;

  useLayoutEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  // Lista nova => recomeça a contagem; sem mídia inline, já está pronto. useLayoutEffect (e não
  // useEffect): roda antes de qualquer onLoad da mídia — senão um load rápido (blob:) podia cair
  // ANTES do reset e o onReady nunca disparava.
  useLayoutEffect(() => {
    doneRef.current = new Set();
    firedRef.current = false;
    if (mediaCount === 0) {
      firedRef.current = true;
      onReadyRef.current?.();
    }
  }, [attachments, mediaCount]);

  const handleDone = useCallback(
    (id: MediaAttachment['id']) => {
      doneRef.current.add(id);
      if (!firedRef.current && doneRef.current.size >= mediaCount) {
        firedRef.current = true;
        onReadyRef.current?.();
      }
    },
    [mediaCount],
  );

  if (attachments.length === 0) return null;

  return (
    <div className={attachments.length > 1 ? 'd-flex flex-wrap gap-2 mb-3' : 'mb-3'}>
      {attachments.map((a) => (
        <AttachmentItem key={a.id} attachment={a} onDone={() => handleDone(a.id)} />
      ))}
    </div>
  );
}
