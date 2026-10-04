/**
 * =========================================================================
 * FILE HEADER — components/global/MediaViewerModal.tsx
 * =========================================================================
 *
 * PROPOSITO: "Visualizador de Mídias" reutilizável. Abre um modal com um ou
 * mais anexos (imagem e vídeo tocam inline, o resto vira cartão de arquivo),
 * usando o MediaPreview global. Quem chama passa a lista de anexos (`load`) e,
 * para cada um, como baixar o binário com token (`fetchBlob`). O componente
 * cria os blob: URLs e libera ao fechar.
 *
 *   <MediaViewerModal
 *     title="Mídias: Sala X"
 *     load={(signal) => loadSources(id, signal)}
 *     onClose={() => setOpen(false)}
 *   />
 *
 * FUNDO: `dark` (padrão true) põe a área da mídia em fundo preto, com
 * `data-bs-theme="dark"` para o texto dos cartões de arquivo continuar legível.
 *
 * CONSUMIDORES: chat-messages/GetAllPage (todas as mídias da mensagem) e
 * chat-room-attachments/GetAllPage (um anexo).
 * -------------------------------------------------------------------------
 */

import { useEffect, useState } from 'react';

import EmptyState from '@/components/global/EmptyState';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import MediaPreview from '@/components/global/MediaPreview';
import type { MediaAttachment } from '@/components/global/MediaPreview';
import Modal from '@/components/global/Modal';
import { ApiError } from '@/services/http';
import type { MediaCategory } from '@/components/global/MediaPreview';

/** Um item a exibir: metadados e como obter o binário (com token). */
export interface MediaSource {
  id: number | string;
  category: MediaCategory;
  name: string;
  fetchBlob: (signal: AbortSignal) => Promise<Blob>;
}

export interface MediaViewerModalProps {
  title: string;
  /** Carrega a lista de anexos (chamado ao abrir). */
  load: (signal: AbortSignal) => Promise<MediaSource[]>;
  onClose: () => void;
  /** Fundo preto atrás da mídia. Padrão: true. */
  dark?: boolean;
}

export default function MediaViewerModal({ title, load, onClose, dark = true }: MediaViewerModalProps) {
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const objectUrls: string[] = [];

    setLoading(true);
    setError(null);

    load(controller.signal)
      .then(async (sources) => {
        const loaded = await Promise.all(
          sources.map(async (source) => {
            try {
              const blob = await source.fetchBlob(controller.signal);
              const url = URL.createObjectURL(blob);
              objectUrls.push(url);
              return { id: source.id, category: source.category, name: source.name, fileUrl: url };
            } catch {
              return null; // binário indisponível: some só este item
            }
          }),
        );
        if (!active) return;
        setAttachments(loaded.filter((a): a is MediaAttachment => a !== null));
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : 'Falha ao carregar as mídias.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
    // `load` é estável por quem chama (recriado só ao trocar o item).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal open title={title} onClose={onClose} size="lg">
      {loading && <LoadingOverlay />}
      {error && !loading && <EmptyState title="Mídias indisponíveis" description={error} variant="danger" />}
      {!loading && !error && attachments.length === 0 && (
        <EmptyState title="Sem mídias" description="Não há arquivos para exibir." />
      )}
      {!loading && !error && attachments.length > 0 && (
        <div className={dark ? 'bg-black rounded p-2' : undefined} data-bs-theme={dark ? 'dark' : undefined}>
          <MediaPreview attachments={attachments} />
        </div>
      )}
    </Modal>
  );
}
