// Anexo dentro de um balao do chat. Imagem e video tocam inline (componente global MediaPreview, com o
// binario baixado via `serve` COM o token da sessao e exibido como `blob:` URL — o jwtauth so le o cabecalho
// Authorization, entao <img src> direto daria 401). Os demais tipos (documento, planilha, PDF, audio, arquivo
// compactado...) aparecem como uma linha com icone, nome e tamanho; clicar baixa o arquivo.
import { useEffect, useState } from 'react';

import MediaPreview from '@/components/global/MediaPreview';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { messageAttachmentsUpload } from '@/services/v1/messageAttachments.upload';
import type { ChatAttachment } from '@/services/v1/messagesChat';
import { saveBlob } from '@/utils/formFile';
import { formatBytes } from '@/utils/format';
import { toMediaCategory } from '@/utils/mediaCategory';

const ICON_BY_CATEGORY: Record<string, string> = {
  audio: 'file-earmark-music',
  document: 'file-earmark-word',
  spreadsheet: 'file-earmark-excel',
  presentation: 'file-earmark-ppt',
  pdf: 'file-earmark-pdf',
  archive: 'file-earmark-zip',
  other: 'file-earmark',
};

export interface ChatAttachmentViewProps {
  attachment: ChatAttachment;
  /** Balao meu (fundo azul): ajusta as cores da linha de download. */
  mine: boolean;
}

export default function ChatAttachmentView({ attachment, mine }: ChatAttachmentViewProps) {
  const toast = useToast();
  const category = toMediaCategory(attachment.category);
  const inline = category === 'image' || category === 'video';
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  // Midia inline: baixa o binario (serve + token) e libera o blob URL ao desmontar.
  useEffect(() => {
    if (!inline) return;
    let cancelled = false;
    let created: string | null = null;
    setFailed(false);
    messageAttachmentsUpload
      .fetchServe(attachment.id)
      .then((blob) => {
        if (cancelled) return;
        created = URL.createObjectURL(blob);
        setBlobUrl(created);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [attachment.id, inline]);

  const download = async () => {
    try {
      saveBlob(await messageAttachmentsUpload.fetchDownload(attachment.id), attachment.name);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao baixar o anexo.', { title: 'Anexo' });
    }
  };

  if (inline && !failed) {
    if (blobUrl === null) {
      return (
        <div className="d-flex align-items-center gap-2 small my-1" role="status">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          Carregando mídia...
        </div>
      );
    }

    return (
      <div className="my-1" style={{ maxWidth: '320px' }}>
        <MediaPreview attachments={[{ id: attachment.id, category, fileUrl: blobUrl, name: attachment.name }]} />
      </div>
    );
  }

  const icon = ICON_BY_CATEGORY[category] ?? 'file-earmark';

  return (
    <button
      type="button"
      className={`btn btn-sm d-flex align-items-center gap-2 text-start my-1 ${mine ? 'btn-light' : 'btn-outline-secondary'}`}
      onClick={() => void download()}
      title={`Baixar ${attachment.name}`}
    >
      <i className={`bi bi-${icon} fs-5`} aria-hidden="true" />
      <span className="text-break" style={{ minWidth: 0 }}>
        {attachment.name}
        <small className="d-block opacity-75">{formatBytes(attachment.size)}</small>
      </span>
      <i className="bi bi-download ms-auto" aria-hidden="true" />
    </button>
  );
}
