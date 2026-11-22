// Componente global reutilizavel: ANEXOS de um registro de QUALQUER modulo, por PROPS -- nao le useParams() e nao conhece
// nenhum modulo. Os arquivos ficam em `uploads` (polimorfico): o dono e identificado por `module` + `reference_id` (+ `collection`).
// Lista os anexos do registro, envia (multipart), visualiza (MediaViewerModal), baixa e exclui (delete-soft). A pagina de
// detalhe de cada recurso so informa o `module` e o id; `canEdit` esconde enviar e excluir (so visualizar e baixar).
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import EmptyState from '@/components/global/EmptyState';
import MediaViewerModal from '@/components/global/MediaViewerModal';
import type { MediaSource } from '@/components/global/MediaViewerModal';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { uploadManagerTable, uploadManagerUpload } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { formatBytes, toText } from '@/utils/format';
import { toMediaCategory } from '@/utils/mediaCategory';
import type { ApiRow } from '@/types/api';

export interface AttachmentsPanelProps {
  /** Valor de uploads.module do dono (ex.: 'HealthRecords'). */
  module: string;
  /** Id do registro dono (uploads.reference_id). */
  referenceId: string | number;
  /** Com false, so visualiza e baixa (sem enviar nem excluir). Padrao: true. */
  canEdit?: boolean;
  /** Agrupador opcional (uploads.collection). */
  collection?: string;
  /** Filtro do seletor de arquivo (ex.: 'image/*,application/pdf'). */
  accept?: string;
  /** Titulo da secao. Padrao: 'Anexos'. */
  title?: string;
}

/** Dispara o "salvar como" do navegador para um Blob ja baixado (com token). */
function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const toSource = (row: ApiRow): MediaSource => ({
  id: toText(row.id, ''),
  category: toMediaCategory(row.category),
  name: toText(row.original_name, 'anexo'),
  fetchBlob: (signal: AbortSignal) => uploadManagerUpload.fetchBlob(toText(row.id, ''), signal),
});

export default function AttachmentsPanel({ module, referenceId, canEdit = true, collection, accept, title = 'Anexos' }: AttachmentsPanelProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState<MediaSource | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await uploadManagerTable.find({ module, reference_id: String(referenceId) }, { sort: 'id', order: 'ASC', limit: 100 });
      setRows(normalizeList(raw).rows);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [module, referenceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fields: Record<string, string> = { module, reference_id: String(referenceId) };
      if (collection) fields.collection = collection;
      await uploadManagerUpload.upload({ file, fields });
      toast.success('Anexo enviado.', { title });
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao enviar o anexo.', { title });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const download = async (row: ApiRow) => {
    try {
      const blob = await uploadManagerUpload.fetchBlob(toText(row.id, ''));
      saveBlob(blob, toText(row.original_name, 'anexo'));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao baixar o anexo.', { title });
    }
  };

  const remove = async (row: ApiRow) => {
    if (!window.confirm(`Excluir o anexo ${toText(row.original_name, '')}?`)) return;
    try {
      await uploadManagerTable.deleteSoft(toText(row.id, ''));
      toast.success('Anexo excluído.', { title });
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao excluir o anexo.', { title });
    }
  };

  return (
    <section className="mt-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h2 className="h5 mb-0">
          {title} ({rows.length})
        </h2>
        {canEdit && (
          <>
            <input ref={inputRef} type="file" className="d-none" accept={accept} onChange={(e) => void onPick(e)} />
            <button type="button" className="btn btn-outline-primary btn-sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
              <i className="bi bi-paperclip me-1" aria-hidden="true" />
              {uploading ? 'Enviando...' : 'Anexar arquivo'}
            </button>
          </>
        )}
      </div>

      {loading ? (
        <p className="text-body-secondary">Carregando anexos...</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Sem anexos" description={canEdit ? 'Use "Anexar arquivo" para enviar o primeiro.' : 'Nenhum arquivo anexado.'} />
      ) : (
        <ul className="list-group mb-2">
          {rows.map((row) => (
            <li className="list-group-item d-flex align-items-center justify-content-between" key={toText(row.id, '')}>
              <span>
                <i className="bi bi-file-earmark me-2" aria-hidden="true" />
                {toText(row.original_name, '')}
                <span className="text-body-secondary ms-2">{formatBytes(row.file_size)}</span>
              </span>
              <span className="text-nowrap">
                <button type="button" className="btn btn-sm btn-outline-primary ms-1" aria-label="Visualizar" onClick={() => setViewing(toSource(row))}>
                  <i className="bi bi-eye" aria-hidden="true" />
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary ms-1" aria-label="Baixar" onClick={() => void download(row)}>
                  <i className="bi bi-download" aria-hidden="true" />
                </button>
                {canEdit && (
                  <button type="button" className="btn btn-sm btn-outline-danger ms-1" aria-label="Excluir" onClick={() => void remove(row)}>
                    <i className="bi bi-trash" aria-hidden="true" />
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {viewing && <MediaViewerModal title={`Anexo: ${viewing.name}`} load={() => Promise.resolve([viewing])} onClose={() => setViewing(null)} />}
    </section>
  );
}

/*
CODE/NEW - Gustavo Hammes - 22-11-2026 - 15:10:00
Plano: C:\laragon\www\php\habilidade\projeto54900\src\writable\claude\20261122180000_saude_midia_plano.json
Objetivo: painel global de anexos de um registro (listar, enviar, visualizar, baixar e excluir) sobre a tabela uploads.
Proposito: dar a prontuarios e exames onde anexar arquivos, base do Visualizador de Midias; reutilizavel por qualquer modulo informando module e referenceId.
Motivo: pedido do usuario (Visualizador de Midias de Prontuarios e Exames); sem anexos o visualizador abriria vazio.
Ligacoes: services/v1 uploadManagerTable e uploadManagerUpload (api/v1/upload-manager), MediaViewerModal, pages/v1/health/health-records/GetPage.tsx e health-exams/GetPage.tsx.
Arquivo: C:\laragon\www\php\habilidade\projeto54900\src\frontend\projeto54900\src\components\global\AttachmentsPanel.tsx
*/
