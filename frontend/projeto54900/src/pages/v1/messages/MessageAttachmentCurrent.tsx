// Anexo atual de uma mensagem (privada ou de grupo), mostrado nos formularios de EDICAO abaixo do
// campo "Anexo": o CARREGAMENTO DA MIDIA (componente global MediaPreview — imagem e video tocam inline,
// os demais tipos viram um card com icone), mais nome, tamanho, Baixar e Remover. Enquanto o binario
// baixa, aparece um indicador de carregamento. Enviar um arquivo novo no campo substitui o atual (o
// formulario manda `replace`). Area administrativa irrestrita: ver, baixar e remover valem em qualquer
// status da mensagem; quem pode remover (remetente ou admin) e decidido pelo backend (403 vira toast).
// Fonte: message-attachments-view (find por mat_messages_manager_id); binario: serve com token (Blob ->
// `blob:` URL liberado ao desmontar, pois o jwtauth so le o cabecalho Authorization); remocao: delete-soft.
import { useCallback, useEffect, useMemo, useState } from 'react';

import MediaPreview from '@/components/global/MediaPreview';
import type { MediaAttachment } from '@/components/global/MediaPreview';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { messageAttachmentsTable, messageAttachmentsUpload, messageAttachmentsView } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { saveBlob } from '@/utils/formFile';
import { formatBytes, toText } from '@/utils/format';
import { toMediaCategory } from '@/utils/mediaCategory';

interface AttachmentRow {
  id: string;
  name: string;
  size: string;
  category: MediaAttachment['category'];
}

export interface MessageAttachmentCurrentProps {
  /** Id da mensagem (messages_manager.id) dona do anexo; vazio = nada a mostrar. */
  messageId: string;
}

export default function MessageAttachmentCurrent({ messageId }: MessageAttachmentCurrentProps) {
  const toast = useToast();
  const [items, setItems] = useState<AttachmentRow[]>([]);
  const [busy, setBusy] = useState(false);
  // Midia: `blob:` URL por anexo (baixado com token) e se a midia inline ja terminou de carregar.
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});
  const [blobsLoading, setBlobsLoading] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);

  const load = useCallback(async () => {
    if (messageId === '') {
      setItems([]);
      return;
    }
    try {
      const raw = await messageAttachmentsView.find(
        { mat_messages_manager_id: messageId },
        { page: 1, limit: 20, sort: 'created_at', order: 'DESC' },
      );
      setItems(
        normalizeList<Record<string, unknown>>(raw).rows.map((r) => ({
          id: toText(r.id, ''),
          name: toText(r.mat_original_name, 'Anexo'),
          size: formatBytes(r.mat_file_size),
          category: toMediaCategory(r.mat_category),
        })),
      );
    } catch {
      setItems([]);
    }
  }, [messageId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Baixa o binario de cada anexo (serve + token) e monta o blob URL; libera ao trocar a lista/desmontar.
  useEffect(() => {
    if (items.length === 0) {
      setBlobUrls({});
      setBlobsLoading(false);
      return;
    }
    let cancelled = false;
    const created: string[] = [];
    setBlobsLoading(true);
    setMediaReady(false);

    void Promise.all(
      items.map(async (item) => {
        try {
          const url = URL.createObjectURL(await messageAttachmentsUpload.fetchServe(item.id));
          created.push(url);

          return [item.id, url] as const;
        } catch {
          return null;
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setBlobUrls(Object.fromEntries(entries.filter((e): e is readonly [string, string] => e !== null)));
      setBlobsLoading(false);
    });

    return () => {
      cancelled = true;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [items]);

  const attachments = useMemo<MediaAttachment[]>(
    () =>
      items.flatMap((item) => {
        const url = blobUrls[item.id];

        return url ? [{ id: item.id, category: item.category, fileUrl: url, name: item.name }] : [];
      }),
    [items, blobUrls],
  );

  const handleReady = useCallback(() => setMediaReady(true), []);

  if (items.length === 0) return null;

  const download = async (item: AttachmentRow) => {
    setBusy(true);
    try {
      saveBlob(await messageAttachmentsUpload.fetchDownload(item.id), item.name);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao baixar o anexo.', { title: 'Anexo' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: AttachmentRow) => {
    if (!window.confirm(`Remover o anexo "${item.name}"?`)) return;
    setBusy(true);
    try {
      await messageAttachmentsTable.deleteSoft(item.id);
      toast.success('Anexo removido.', { title: 'Anexo' });
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao remover o anexo.', { title: 'Anexo' });
    } finally {
      setBusy(false);
    }
  };

  const loading = blobsLoading || !mediaReady;

  return (
    <div className="mt-3" aria-label="Anexo atual da mensagem">
      <div className="small text-body-secondary mb-1">Anexo atual</div>

      {loading && (
        <div className="d-flex align-items-center gap-2 text-body-secondary mb-2" role="status">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          <span className="small">Carregando mídia...</span>
        </div>
      )}
      {!blobsLoading && <MediaPreview attachments={attachments} onReady={handleReady} />}

      <ul className="list-group">
        {items.map((item) => (
          <li key={item.id} className="list-group-item d-flex align-items-center gap-2">
            <i className="bi bi-paperclip" aria-hidden="true" />
            <span className="flex-grow-1 text-truncate">
              {item.name}
              <small className="text-body-secondary ms-2">{item.size}</small>
            </span>
            <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => void download(item)}>
              <i className="bi bi-download" aria-hidden="true" /> Baixar
            </button>
            <button type="button" className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => void remove(item)}>
              <i className="bi bi-trash" aria-hidden="true" /> Remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
