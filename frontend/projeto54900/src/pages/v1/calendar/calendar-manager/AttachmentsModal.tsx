import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import EmptyState from '@/components/global/EmptyState';
import Modal from '@/components/global/Modal';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import {
  calendarEventAttachmentsTable,
  formManagerView,
  uploadManagerTable,
  uploadManagerUpload,
} from '@/services/v1';
import { buildRenderSchema, isFormPublished } from '@/services/formSchema';
import type { RenderForm } from '@/services/formSchema';
import type { CalendarEventRow } from '@/services/calendarSchema';
import { normalizeList } from '@/utils/apiResult';
import { formDataToPayload, errorDetail, resolveEndpoint, senderFor } from '@/utils/formSubmit';

import { ATTACHMENT_ACCEPT, ATTACHMENT_FORM_SLUG, ATTACHMENT_UPLOAD_MODULE } from './constants';
import { withDefaultValues } from './helpers';

/** Anexo de um evento (calendar_event_attachments) — o arquivo em si está em `uploads` (fileId). */
interface AttachmentRow {
  id: number;
  fileId: number;
  title: string;
  mimeType: string;
}

function toAttachment(r: Record<string, unknown>): AttachmentRow {
  const text = (v: unknown) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');
  return {
    id: Number(r.id),
    fileId: Number(r.file_id) || 0,
    title: text(r.title),
    mimeType: text(r.mime_type),
  };
}

/** Ícone bootstrap-icons pelo MIME do anexo (PDF, imagem, planilha...). */
function attachmentIcon(mime: string): string {
  if (mime === 'application/pdf') return 'file-earmark-pdf';
  if (mime.startsWith('image/')) return 'file-earmark-image';
  if (mime.startsWith('video/')) return 'file-earmark-play';
  if (mime.startsWith('audio/')) return 'file-earmark-music';
  if (/sheet|excel|csv/.test(mime)) return 'file-earmark-spreadsheet';
  if (/presentation|powerpoint/.test(mime)) return 'file-earmark-slides';
  if (/word|opendocument\.text|rtf/.test(mime)) return 'file-earmark-word';
  if (/zip|rar|7z|tar|gzip/.test(mime)) return 'file-earmark-zip';
  if (mime.startsWith('text/')) return 'file-earmark-text';
  return 'file-earmark';
}

/** Bytes em texto curto pt-BR (ex.: "34 B", "1,2 MB"). */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${units[unit]}`;
}

/**
 * Modal "Anexos" — lista via API calendar-event-attachments; arquivo físico
 * via API de uploads (writable/uploads/calendar_events/<evento>/), com
 * Visualizar (serve) e Baixar (download).
 */
export default function AttachmentsModal({
  event,
  showBackButton,
  onClose,
}: {
  event: CalendarEventRow | null;
  showBackButton: boolean;
  onClose: () => void;
}) {
  const toast = useToast();

  const [form, setForm] = useState<RenderForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentRow[]>([]);
  // Tamanho por id de upload (vem de uploads.file_size, não da tabela de anexos).
  const [attachmentSizes, setAttachmentSizes] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    formManagerView
      .getGrouped({ fm_slug: [ATTACHMENT_FORM_SLUG] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' })
      .then((raw) => {
        const { rows } = normalizeList(raw);
        const built = buildRenderSchema(rows);
        setForm(built);
        if (!built) setFormError(`Nenhum formulario publicado para a slug "${ATTACHMENT_FORM_SLUG}".`);
      })
      .catch((err) => {
        setForm(null);
        setFormError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulario.');
      });
  }, []);

  /**
   * Anexos ativos de um evento (API calendar-event-attachments) + tamanho de cada arquivo
   * (API de uploads, filtrada por module/reference_id do evento). Tamanho é opcional: se a
   * segunda chamada falhar, a lista sai sem ele.
   */
  const loadAttachments = useCallback(
    async (eventId: number) => {
      setLoading(true);
      try {
        const raw = await calendarEventAttachmentsTable.find(
          { calendar_event_id: eventId },
          { sort: 'id', order: 'ASC', limit: 500 },
        );
        setAttachments(normalizeList<Record<string, unknown>>(raw).rows.map(toAttachment));
      } catch (err) {
        setAttachments([]);
        toast.error(err instanceof ApiError ? err.message : 'Falha ao carregar os anexos.', { title: 'Anexos' });
      } finally {
        setLoading(false);
      }
      try {
        const rawUploads = await uploadManagerTable.find(
          { module: ATTACHMENT_UPLOAD_MODULE, reference_id: eventId },
          { limit: 500 },
        );
        const sizes: Record<number, number> = {};
        for (const u of normalizeList<Record<string, unknown>>(rawUploads).rows) {
          sizes[Number(u.id)] = Number(u.file_size) || 0;
        }
        setAttachmentSizes(sizes);
      } catch {
        setAttachmentSizes({});
      }
    },
    [toast],
  );

  useEffect(() => {
    if (!event) return;
    setAttachments([]);
    setAttachmentSizes({});
    setFile(null);
    setFormKey((k) => k + 1);
    void loadAttachments(event.id);
  }, [event, loadAttachments]);

  /**
   * Envio em 2 chamadas, cada uma na API da própria tabela:
   * 1) POST upload-manager/upload (arquivo físico em writable/uploads/calendar_events/<evento>/);
   * 2) POST calendar-event-attachments/create com file_id = id do upload.
   * Se (2) falhar, apaga o upload de (1) — não deixa arquivo órfão no disco.
   */
  const handleSubmit = useCallback(
    async (submitEvent: FormEvent<HTMLFormElement>) => {
      submitEvent.preventDefault();
      if (!event) return;
      if (!form?.meta.submitEndpoint) {
        toast.error('Este formulario nao tem submit_endpoint definido.', { title: 'Sem destino' });
        return;
      }
      if (!file) {
        toast.error('Escolha um arquivo para anexar.', { title: 'Anexos' });
        return;
      }

      const payload = formDataToPayload(submitEvent.currentTarget);
      const send = senderFor(form.meta.httpMethod);
      const path = resolveEndpoint(form.meta.submitEndpoint);
      const eventId = event.id;

      setSubmitting(true);
      let uploadId = 0;
      try {
        const rawUpload = await uploadManagerUpload.upload({
          file,
          fields: {
            module: ATTACHMENT_UPLOAD_MODULE,
            reference_id: String(eventId),
            collection: 'attachments',
          },
        });
        uploadId = Number((rawUpload as { data?: { id?: unknown } } | null)?.data?.id) || 0;
        if (uploadId < 1) throw new Error('Upload sem id na resposta.');

        await send(path, { ...payload, calendar_event_id: eventId, file_id: uploadId });
        toast.success('Anexo enviado.', { title: form.meta.title });
        setFile(null);
        setFormKey((k) => k + 1);
        void loadAttachments(eventId);
      } catch (err) {
        if (uploadId > 0) {
          await uploadManagerTable.deleteHard(uploadId).catch(() => undefined);
        }
        if (err instanceof ApiError) {
          toast.error(`${err.message}${errorDetail(err)}`, { title: 'Erro ao enviar' });
        } else {
          toast.error('Falha inesperada ao enviar o anexo.', { title: 'Erro ao enviar' });
        }
      } finally {
        setSubmitting(false);
      }
    },
    [form, event, file, loadAttachments, toast],
  );

  /** Remove o anexo (soft delete na API da própria tabela — o arquivo físico fica, restaurável). */
  const removeAttachment = useCallback(
    async (attachment: AttachmentRow) => {
      if (!event) return;
      if (!window.confirm(`Remover o anexo "${attachment.title}"?`)) return;
      try {
        await calendarEventAttachmentsTable.deleteSoft(attachment.id);
        toast.success('Anexo removido.', { title: 'Anexos' });
        void loadAttachments(event.id);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Falha ao remover o anexo.', { title: 'Anexos' });
      }
    },
    [event, loadAttachments, toast],
  );

  return (
    <Modal open={!!event} title={event ? `Anexos — ${event.summary}` : 'Anexos'} onClose={onClose} size="lg">
      {event && (
        <>
          {loading && <p className="text-body-secondary small mb-3">Carregando anexos...</p>}

          {!loading && attachments.length === 0 && (
            <EmptyState
              variant="warning"
              title="Nenhum anexo"
              description="Este evento ainda nao tem anexos. Use o formulario abaixo."
            />
          )}

          {!loading && attachments.length > 0 && (
            <div className="d-flex flex-column gap-2 mb-3">
              {attachments.map((a) => {
                const size = attachmentSizes[a.fileId];
                return (
                  <div key={a.id} className="card shadow-sm">
                    <div className="card-body p-2 ps-3 d-flex flex-wrap align-items-center gap-2">
                      <i className={`bi bi-${attachmentIcon(a.mimeType)} fs-4 text-body-secondary`} aria-hidden="true" />
                      <div className="flex-grow-1 text-break" style={{ minWidth: '10rem' }}>
                        <div className="fw-semibold">{a.title}</div>
                        <div className="small text-body-secondary">
                          {[a.mimeType, size !== undefined ? formatBytes(size) : ''].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      <div className="d-flex gap-1 ms-auto">
                        <a
                          className="btn btn-sm btn-outline-secondary"
                          href={uploadManagerUpload.serveUrl(a.fileId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Visualizar ${a.title}`}
                        >
                          <i className="bi bi-eye" />
                        </a>
                        <a
                          className="btn btn-sm btn-outline-secondary"
                          href={uploadManagerUpload.downloadUrl(a.fileId)}
                          aria-label={`Baixar ${a.title}`}
                        >
                          <i className="bi bi-download" />
                        </a>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          aria-label={`Remover ${a.title}`}
                          onClick={() => void removeAttachment(a)}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {formError && !form && <EmptyState title="Formulario indisponivel" description={formError} />}

      {form && !isFormPublished(form) && (
        <EmptyState
          title="Formulario indisponivel"
          description={`Status "${form.meta.status ?? 'draft'}" — este formulario ainda nao foi publicado (status "active").`}
        />
      )}

      {form && isFormPublished(form) && event && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate className="border-top pt-3">
          {/* Seletor de arquivo fora do FormGrid: field_type não tem 'file' (mesmo padrão de UploadListPage). */}
          <div className="mb-3">
            <label htmlFor={`anexo-arquivo-${formKey}`} className="form-label fw-semibold">
              Arquivo<span className="text-danger ms-1">*</span>
            </label>
            <input
              key={formKey}
              id={`anexo-arquivo-${formKey}`}
              type="file"
              className="form-control"
              accept={ATTACHMENT_ACCEPT}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <FormGrid
            key={`${event.id}-${formKey}`}
            schema={withDefaultValues(form.schema, { calendar_event_id: String(event.id) })}
          />
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary" disabled={submitting || !file}>
              {submitting ? 'Enviando...' : 'Enviar anexo'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              {showBackButton ? 'Voltar aos eventos' : 'Fechar'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
