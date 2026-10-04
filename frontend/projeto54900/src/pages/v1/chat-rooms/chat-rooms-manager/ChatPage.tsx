// Tela de chat de UMA sala, em tela cheia (rota /v1/chat-rooms-manager/chat/:id,
// fora do RootLayout: sem menu, sem atalhos de favoritos e sem rodapé).
//
// Layout: cabeçalho com o nome da sala e botão redondo de fechar (canto
// superior direito); área de mensagens com rolagem, a última mensagem embaixo
// e a primeira em cima (abre já na última); rodapé fixo com textarea de 3
// linhas e, na mesma linha, ícone de enviar e ícone de upload.
//
// Ao abrir: entra na sala (POST join, idempotente) e carrega as mensagens.
// Atualiza as mensagens a cada 5 segundos. Reusa o envio de mensagem
// (chatMessagesTable) e o upload de anexo (chatRoomAttachmentsUpload).

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';

import EmptyState from '@/components/global/EmptyState';
import MediaViewerModal from '@/components/global/MediaViewerModal';
import LoadingOverlay from '@/components/global/LoadingOverlay';
import Modal from '@/components/global/Modal';
import FormGrid from '@/components/ui/FormGrid/Input';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import { buildRenderSchema, type RenderForm } from '@/services/formSchema';
import {
  chatMessagesTable,
  chatRoomAttachmentReportsTable,
  chatRoomAttachmentsUpload,
  chatRoomsManagerTable,
  formManagerView,
} from '@/services/v1';
import { joinRoom, listRoomMessages, type RoomAttachment, type RoomMember, type RoomMessage } from '@/services/v1/chatRooms.chat';
import { normalizeItem, normalizeList } from '@/utils/apiResult';
import { formDataToPayload } from '@/utils/formSubmit';
import type { ApiRow } from '@/types/api';
import { toText } from '@/utils/format';
import { toMediaCategory } from '@/utils/mediaCategory';
import { palavrasProibidasEncontradas } from '@/utils/palavrasProibidas';
import { paths } from '@/routes/paths';

const REFRESH_MS = 5000;

const ATTACHMENT_ICON: Record<string, string> = {
  image: 'file-earmark-image',
  video: 'file-earmark-play',
  audio: 'file-earmark-music',
  document: 'file-earmark-text',
  spreadsheet: 'file-earmark-spreadsheet',
  presentation: 'file-earmark-ppt',
  pdf: 'file-earmark-pdf',
  archive: 'file-earmark-zip',
  other: 'file-earmark',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

/** Frase única do aviso de anexo denunciado (bolha e toast usam a mesma). */
function blockedNoticeText(author: string): string {
  return `O arquivo encaminhado por ${author} recebeu uma denúncia.`;
}

/** No lugar de um anexo denunciado: ícone de proibido e o aviso. */
function BlockedNotice({ author }: { author: string }) {
  return (
    <div className="d-flex align-items-center gap-2 border rounded p-2 mt-2 bg-body text-body">
      <i className="bi bi-slash-circle-fill text-danger fs-4 flex-shrink-0" aria-hidden="true" />
      <span className="small">{blockedNoticeText(author)}</span>
    </div>
  );
}

/** O que a denúncia serve e o que pode ser denunciado (tooltip do ícone e modal). */
const REPORT_HELP =
  'Denunciar serve para reportar conteúdo impróprio neste arquivo: nudez, violência, discurso de ódio, assédio ou spam. O anexo e o autor são bloqueados na hora.';

/** Botão de denúncia com tooltip explicativo (padrão icon-action-tooltip do projeto). */
function ReportButton({
  wrapperClass,
  buttonClass,
  icon,
  onClick,
}: {
  wrapperClass: string;
  buttonClass: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <span className={`icon-action-tooltip ${wrapperClass}`}>
      <button type="button" className={buttonClass} aria-label={REPORT_HELP} onClick={onClick}>
        <i className={`bi bi-${icon}`} aria-hidden="true" />
      </button>
      <span className="icon-action-tooltip-bubble" role="tooltip">
        {REPORT_HELP}
      </span>
    </span>
  );
}

/**
 * Um anexo dentro da bolha. Imagem e vídeo: miniatura (binário com token, carregado
 * uma vez por anexo) que abre no visualizador. Demais tipos: cartão com ícone do
 * tipo e botão de download.
 */
function MessageAttachment({
  attachment,
  onOpen,
  canReport,
  onReport,
}: {
  attachment: RoomAttachment;
  onOpen: (a: RoomAttachment) => void;
  /** Anexo de outro membro: mostra o ícone de denúncia. */
  canReport: boolean;
  onReport: (a: RoomAttachment) => void;
}) {
  const toast = useToast();
  const isMedia = attachment.category === 'image' || attachment.category === 'video';
  const [thumb, setThumb] = useState<string | null>(null);

  useEffect(() => {
    if (!isMedia) return undefined;
    const controller = new AbortController();
    let objectUrl: string | null = null;
    chatRoomAttachmentsUpload
      .fetchServe(attachment.id, controller.signal)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setThumb(objectUrl);
      })
      .catch(() => undefined);
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.id, isMedia]);

  if (isMedia) {
    return (
      <div className="position-relative d-inline-block mt-2" style={{ maxWidth: '100%' }}>
      <button
        type="button"
        className="btn p-0 border-0 d-block text-start"
        onClick={() => onOpen(attachment)}
        aria-label={`Abrir ${attachment.name}`}
        title={attachment.name}
        style={{ maxWidth: '100%' }}
      >
        {thumb === null ? (
          <span className="placeholder-glow d-block" style={{ width: 180, height: 120 }}>
            <span className="placeholder col-12 h-100 rounded" />
          </span>
        ) : attachment.category === 'image' ? (
          <img src={thumb} alt={attachment.name} className="img-fluid rounded" style={{ maxHeight: 220 }} />
        ) : (
          <video
            src={thumb}
            className="rounded"
            style={{ maxHeight: 220, maxWidth: '100%', pointerEvents: 'none' }}
            muted
            preload="metadata"
          />
        )}
      </button>
      {canReport && (
        <ReportButton
          wrapperClass="position-absolute top-0 end-0 m-1"
          buttonClass="btn btn-sm btn-danger"
          icon="flag-fill"
          onClick={() => onReport(attachment)}
        />
      )}
      </div>
    );
  }

  const download = async () => {
    try {
      const blob = await chatRoomAttachmentsUpload.fetchDownload(attachment.id);
      saveBlob(blob, attachment.name);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao baixar o arquivo.', { title: 'Download' });
    }
  };

  return (
    <div className="d-flex align-items-center gap-2 border rounded p-2 mt-2 bg-body text-body">
      <i className={`bi bi-${ATTACHMENT_ICON[attachment.category] ?? 'file-earmark'} fs-3 flex-shrink-0`} aria-hidden="true" />
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <div className="text-truncate small fw-semibold">{attachment.name}</div>
        <div className="small text-body-secondary">{formatSize(attachment.size)}</div>
      </div>
      {canReport && (
        <ReportButton
          wrapperClass="flex-shrink-0"
          buttonClass="btn btn-sm btn-outline-danger"
          icon="flag"
          onClick={() => onReport(attachment)}
        />
      )}
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary flex-shrink-0"
        aria-label={`Baixar ${attachment.name}`}
        title="Baixar"
        onClick={() => void download()}
      >
        <i className="bi bi-download" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Cores dos balões dos outros membros (uma por membro, na ordem em que aparecem). */
const MEMBER_BUBBLE_COLORS = [
  'bg-success-subtle',
  'bg-warning-subtle',
  'bg-info-subtle',
  'bg-danger-subtle',
  'bg-secondary-subtle',
  'bg-light',
];

/** Aviso de termos: mostrado quando a pessoa insiste em enviar palavra proibida. */
const TERMOS_AVISO =
  'Você escreveu uma palavra que vai contra os Termos de Responsabilidade e Confidencialidade, aceitos junto ao Moderador. Se insistir, seu usuário poderá ser banido do chat.';

function formatWhen(value: string): string {
  const date = new Date(value.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('pt-BR');
}

/**
 * Formulário de denúncia (build denunciar-anexo, pelo schema). O campo do anexo
 * vem preenchido e desabilitado. Ao confirmar, cria a denúncia: o anexo e o autor
 * ficam bloqueados na hora.
 */
function ReportAttachmentModal({
  attachment,
  onClose,
  onDone,
}: {
  attachment: RoomAttachment;
  onClose: () => void;
  onDone: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<RenderForm | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    formManagerView
      .getGrouped({ fm_slug: ['denunciar-anexo'] }, { limit: 1000, sort: 'fc_sort_order', order: 'ASC' })
      .then((raw) => {
        if (!active) return;
        const built = buildRenderSchema(normalizeList(raw).rows);
        if (!built) {
          setLoadError('Formulário de denúncia não está publicado.');
          return;
        }
        const value = String(attachment.id);
        const schema = {
          rows: built.schema.rows.map((row) => ({
            ...row,
            fields: row.fields.map((f) => {
              if (f.name !== 'chat_room_attachment_id' || f.type !== 'select') return f;
              return { ...f, defaultValue: value, values: [value], disabled: true };
            }),
          })),
        };
        setForm({ meta: built.meta, schema });
      })
      .catch((err: unknown) => {
        if (active) setLoadError(err instanceof ApiError ? err.message : 'Falha ao carregar o formulário.');
      });
    return () => {
      active = false;
    };
  }, [attachment.id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const el = event.currentTarget;
    if (!el.checkValidity()) {
      el.reportValidity();
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...formDataToPayload(el), chat_room_attachment_id: attachment.id };
      await chatRoomAttachmentReportsTable.create(payload);
      toast.success('Denúncia registrada. O anexo foi bloqueado.', { title: 'Denúncia' });
      onDone();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao registrar a denúncia.', { title: 'Denúncia' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open title={`Denunciar: ${attachment.name}`} onClose={onClose} size="lg">
      <div className="alert alert-warning small">
        <p className="mb-1">{REPORT_HELP}</p>
        <p className="mb-0">Escolha o motivo que melhor descreve o conteúdo e, se quiser, explique em poucas palavras.</p>
      </div>
      {loadError && <EmptyState title="Denúncia indisponível" description={loadError} variant="danger" />}
      {!loadError && !form && <LoadingOverlay />}
      {form && (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <FormGrid schema={form.schema} />
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-danger" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Denunciar'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Voltar
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/** Texto da mensagem com cada @nome mencionado destacado. */
function MessageText({ content, mentionNames }: { content: string; mentionNames: string[] }) {
  if (mentionNames.length === 0) return <>{content}</>;
  const escaped = mentionNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = content.split(new RegExp(`(@(?:${escaped.join('|')}))`, 'g'));
  return (
    <>
      {parts.map((part, i) =>
        mentionNames.some((n) => part === `@${n}`) ? (
          <span key={i} className="fw-semibold text-decoration-underline">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function ChatPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const myId = user?.id ?? null;
  const navigate = useNavigate();
  const toast = useToast();
  const roomId = Number(id);

  const [roomName, setRoomName] = useState('');
  const [roomStatus, setRoomStatus] = useState<'open' | 'closed'>('open');
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [openAttachment, setOpenAttachment] = useState<RoomAttachment | null>(null);
  const [reportAttachment, setReportAttachment] = useState<RoomAttachment | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  // Membros escolhidos com @ nesta mensagem: membership_id -> nome.
  const [pickedMentions, setPickedMentions] = useState<Map<number, string>>(new Map());
  const seenMentions = useRef<Set<number> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMessages = useCallback(async (signal?: AbortSignal) => {
    const payload = await listRoomMessages(roomId, signal);
    setMessages(payload.items);
    setMembers(payload.members);
  }, [roomId]);

  // Entra na sala, carrega o cabeçalho e as mensagens.
  useEffect(() => {
    if (!id || Number.isNaN(roomId)) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        await joinRoom(roomId);
        const roomRaw = await chatRoomsManagerTable.get(roomId, { signal: controller.signal });
        const room = normalizeItem<ApiRow>(roomRaw);
        if (room) {
          setRoomName(toText(room.name, 'Sala'));
          setRoomStatus(room.status === 'closed' ? 'closed' : 'open');
        }
        await loadMessages(controller.signal);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Não foi possível abrir o chat desta sala.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id, roomId, loadMessages]);

  // Atualização periódica enquanto a tela estiver aberta.
  useEffect(() => {
    if (error || loading) return undefined;
    const timer = window.setInterval(() => {
      void loadMessages().catch(() => undefined);
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [error, loading, loadMessages]);

  // Sempre mostra a última mensagem: rola até o fim quando a lista muda.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Toast amarelo para todos quando um anexo é denunciado: uma vez por anexo.
  // A primeira carga só registra os bloqueios que já existiam (sem toast).
  const seenBlocked = useRef<Set<number> | null>(null);
  useEffect(() => {
    if (loading) return;
    const blocked = messages.flatMap((m) =>
      m.attachments.filter((a) => a.status === 'blocked').map((a) => ({ id: a.id, author: m.author })),
    );
    if (seenBlocked.current === null) {
      seenBlocked.current = new Set(blocked.map((b) => b.id));
      return;
    }
    for (const b of blocked) {
      if (seenBlocked.current.has(b.id)) continue;
      seenBlocked.current.add(b.id);
      toast.warning(blockedNoticeText(b.author), { title: 'Denúncia' });
    }
  }, [messages, loading, toast]);

  // Toast amarelo quando alguém menciona você: uma vez por mensagem (a 1ª carga só registra).
  useEffect(() => {
    if (loading || myId === null) return;
    const mentioningMe = messages.filter((m) => m.mentions.some((x) => x.user_manager_id === myId));
    if (seenMentions.current === null) {
      seenMentions.current = new Set(mentioningMe.map((m) => m.id));
      return;
    }
    for (const m of mentioningMe) {
      if (seenMentions.current.has(m.id)) continue;
      seenMentions.current.add(m.id);
      toast.warning(`Usuário: ${m.author}, mencionou você no chat.`, { title: 'Menção' });
    }
  }, [messages, loading, myId, toast]);

  // Sugestões do @: membros ativos (exceto eu) cujo nome contém o texto digitado.
  const mentionOptions =
    mentionQuery === null
      ? []
      : members
          .filter((mb) => mb.user_manager_id !== myId && mb.name.toLowerCase().includes(mentionQuery.toLowerCase()))
          .slice(0, 8);

  const chooseMember = (mb: RoomMember) => {
    setText((prev) => prev.replace(/@([^\s@]*)$/, `@${mb.name} `));
    setPickedMentions((prev) => new Map(prev).set(mb.membership_id, mb.name));
    setMentionQuery(null);
    setMentionIndex(0);
  };

  const onTextChange = (value: string) => {
    setText(value);
    const match = /@([^\s@]*)$/.exec(value);
    setMentionQuery(match ? (match[1] ?? '') : null);
    setMentionIndex(0);
  };

  const onComposerKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionOptions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMentionIndex((i) => (i + 1) % mentionOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMentionIndex((i) => (i - 1 + mentionOptions.length) % mentionOptions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const pick = mentionOptions[mentionIndex] ?? mentionOptions[0];
      if (pick) chooseMember(pick);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setMentionQuery(null);
    }
  };

  /** Menções a enviar: só os membros escolhidos que ainda aparecem no texto como @nome. */
  const mentionIdsFor = (content: string): number[] =>
    [...pickedMentions].filter(([, name]) => content.includes(`@${name}`)).map(([membershipId]) => membershipId);

  /** Cria a mensagem e devolve o id dela (para anexar arquivo depois). */
  const createMessage = async (content: string): Promise<number> => {
    const mentions = mentionIdsFor(content);
    const raw = await chatMessagesTable.create({
      chat_rooms_manager_id: roomId,
      content,
      ...(mentions.length > 0 ? { mentions } : {}),
    });
    const row = normalizeItem<ApiRow>(raw);
    const messageId = row?.id;
    if (typeof messageId !== 'number' && typeof messageId !== 'string') {
      throw new Error('Mensagem criada sem id na resposta.');
    }
    return Number(messageId);
  };

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = text.trim();
    if (content === '') {
      toast.error('Escreva uma mensagem antes de enviar.', { title: 'Mensagem vazia' });
      return;
    }
    if (palavrasProibidasEncontradas(content).length > 0) {
      toast.error(TERMOS_AVISO, { title: 'Termos de responsabilidade' });
      return;
    }
    setSending(true);
    try {
      await createMessage(content);
      setText('');
      setPickedMentions(new Map());
      await loadMessages();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao enviar a mensagem.', { title: 'Erro ao enviar' });
    } finally {
      setSending(false);
    }
  };

  const handleFile = async (file: File) => {
    if (palavrasProibidasEncontradas(text).length > 0) {
      toast.error(TERMOS_AVISO, { title: 'Termos de responsabilidade' });
      return;
    }
    setSending(true);
    try {
      // Sem texto, a mensagem leva o nome do arquivo como conteúdo.
      const content = text.trim() !== '' ? text.trim() : `Arquivo: ${file.name}`;
      const messageId = await createMessage(content);
      await chatRoomAttachmentsUpload.upload({ file, chatMessageId: messageId });
      setText('');
      setPickedMentions(new Map());
      toast.success('Arquivo enviado.', { title: 'Upload' });
      await loadMessages();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao enviar o arquivo.', { title: 'Erro no upload' });
      await loadMessages().catch(() => undefined);
    } finally {
      setSending(false);
    }
  };

  const onPickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void handleFile(file);
  };

  const closed = roomStatus === 'closed';

  // Dicionário: palavra proibida no texto bloqueia o envio (botões desabilitados).
  // Atraso de 700 ms: a verificação roda depois que o usuário para de digitar.
  // O envio confere o texto atual de novo (ver handleSend), então não há brecha.
  const textoVerificado = useDebounce(text, 700);
  const proibidas = palavrasProibidasEncontradas(textoVerificado);
  const bloqueado = proibidas.length > 0;
  // Ao digitar palavra proibida: só o aviso discreto embaixo do campo (sem toast).
  // O toast com os termos aparece quando a pessoa insiste e tenta enviar.

  // Cor de cada membro (exceto eu): a ordem de primeira aparição define a cor.
  const memberColor = new Map<number, string>();
  for (const m of messages) {
    if (m.user_manager_id === myId || memberColor.has(m.user_manager_id)) continue;
    memberColor.set(m.user_manager_id, MEMBER_BUBBLE_COLORS[memberColor.size % MEMBER_BUBBLE_COLORS.length] ?? 'bg-light');
  }

  return (
    <div className="d-flex flex-column bg-body" style={{ height: '100dvh' }}>
      <header className="d-flex justify-content-between align-items-center gap-3 px-3 py-2 border-bottom">
        <div style={{ minWidth: 0 }}>
          <h1 className="h5 mb-0 text-truncate">{roomName || `Sala #${id ?? ''}`}</h1>
          <span className="small text-body-secondary">{closed ? 'Sala fechada' : 'Sala aberta'}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: '2.5rem', height: '2.5rem' }}
          aria-label="Fechar chat"
          title="Fechar chat"
          onClick={() => void navigate(paths.v1.chatRooms.list)}
        >
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>
      </header>

      {loading && <LoadingOverlay />}

      {error && !loading && (
        <div className="p-3">
          <EmptyState title="Chat indisponível" description={error} variant="danger" />
        </div>
      )}

      {!loading && !error && (
        <>
          <div ref={listRef} className="flex-grow-1 overflow-auto px-3 py-3" style={{ minHeight: 0 }}>
            {messages.length === 0 && (
              <p className="text-body-secondary mb-0">Nenhuma mensagem ainda. Escreva a primeira.</p>
            )}
            {messages.map((m) => {
              const mine = m.user_manager_id === myId;
              return (
                <div key={m.id} className={`d-flex mb-2 ${mine ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div
                    className={`rounded-3 px-3 py-2 ${mine ? 'bg-primary text-white' : memberColor.get(m.user_manager_id) ?? 'bg-light'}${m.mentions.some((x) => x.user_manager_id === myId) ? ' border border-2 border-warning' : ''}`}
                    style={{ maxWidth: '80%', minWidth: 0 }}
                  >
                    {!mine && <div className="small fw-semibold">{m.author}</div>}
                    <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                      <MessageText content={m.content} mentionNames={m.mentions.map((x) => x.name)} />
                    </div>
                    {m.attachments.map((a) =>
                      a.status === 'blocked' ? (
                        <BlockedNotice key={a.id} author={m.author} />
                      ) : (
                        <MessageAttachment
                          key={a.id}
                          attachment={a}
                          onOpen={setOpenAttachment}
                          canReport={!mine}
                          onReport={setReportAttachment}
                        />
                      ),
                    )}
                    <div className={`small text-end ${mine ? 'text-white-50' : 'text-body-secondary'}`}>
                      {formatWhen(m.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <footer className="border-top p-2 position-relative">
            {closed && (
              <p className="small text-danger mb-2">
                Sala fechada: não é possível enviar mensagens. Procure o moderador da sala.
              </p>
            )}
            {mentionOptions.length > 0 && (
              <div
                className="list-group position-absolute bottom-100 start-0 ms-2 mb-1 shadow-sm"
                style={{ maxHeight: 220, overflowY: 'auto', minWidth: 240, zIndex: 10 }}
                role="listbox"
                aria-label="Membros para mencionar"
              >
                {mentionOptions.map((mb, i) => (
                  <button
                    key={mb.membership_id}
                    type="button"
                    role="option"
                    aria-selected={i === mentionIndex}
                    className={`list-group-item list-group-item-action ${i === mentionIndex ? 'active' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      chooseMember(mb);
                    }}
                  >
                    @{mb.name}
                  </button>
                ))}
              </div>
            )}
            {bloqueado && (
              <p className="small text-danger mb-2">
                Palavra não permitida: <strong>{proibidas.join(', ')}</strong>. Ajuste a mensagem para enviar.
              </p>
            )}
            <form onSubmit={(e) => void handleSend(e)} className="d-flex align-items-stretch gap-2">
              <textarea
                className="form-control flex-grow-1"
                rows={3}
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                onKeyDown={onComposerKeyDown}
                placeholder="Escreva sua mensagem... (use @ para mencionar)"
                aria-label="Mensagem"
                disabled={closed || sending}
                style={{ minWidth: 0, resize: 'none' }}
              />
              <div className="d-flex flex-column gap-2 flex-shrink-0" style={{ width: '2.75rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1 d-inline-flex align-items-center justify-content-center"
                  aria-label="Enviar mensagem"
                  title="Enviar mensagem"
                  disabled={closed || sending}
                >
                  <i className="bi bi-send" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-grow-1 d-inline-flex align-items-center justify-content-center"
                  aria-label="Upload de arquivos e mídias"
                  title="Upload de arquivos e mídias"
                  disabled={closed || sending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="bi bi-paperclip" aria-hidden="true" />
                </button>
              </div>
              <input ref={fileInputRef} type="file" className="d-none" onChange={onPickFile} />
            </form>
          </footer>
        </>
      )}

      {openAttachment && (
        <MediaViewerModal
          title={openAttachment.name}
          load={() =>
            Promise.resolve([
              {
                id: openAttachment.id,
                category: toMediaCategory(openAttachment.category),
                name: openAttachment.name,
                fetchBlob: (signal: AbortSignal) => chatRoomAttachmentsUpload.fetchServe(openAttachment.id, signal),
              },
            ])
          }
          onClose={() => setOpenAttachment(null)}
        />
      )}

      {reportAttachment && (
        <ReportAttachmentModal
          attachment={reportAttachment}
          onClose={() => setReportAttachment(null)}
          onDone={() => {
            setReportAttachment(null);
            void loadMessages().catch(() => undefined);
          }}
        />
      )}
    </div>
  );
}
