// Miolo COMUM das conversas do modo chat (privada e de grupo): lista de baloes com rolagem, separador por
// dia, rodape fixo e atualizacao automatica (polling de 5 s) enquanto o painel esta montado. Message NAO e
// sala de chat.
//
// O que muda entre as conversas fica em quem usa este componente (PrivateConversation, GroupConversation):
//   load(signal)                  busca as mensagens ja no formato PaneMessage — e, se for o caso, marca como lidas
//   send(texto, arquivo, data)    envia (na hora ou agendada), com anexo opcional
//   edit(id, texto, data) / remove(id)   regra de estado DO CHAT: editar so enquanto agendada; apagar a propria
// Aqui ficam so a apresentacao e o ciclo: carregar ao abrir, polling, rolar para o fim (so se a pessoa ja estava
// no fim), enviar e recarregar.
//
// Marcacao (@) — so quando a conversa informa `mentionCandidates` (conversa de grupo): digitar `@` abre as sugestoes
// (filtra pelo nome; setas/Tab/Enter escolhem, Esc fecha); escolher insere `@Nome ` e guarda o id. Ao enviar, so
// vao as marcacoes cujo `@Nome` continua no texto. Nos baloes os `@Nome` ficam destacados e a mensagem que MARCA o
// usuario logado ganha borda amarela.
// Rodape: textarea (Enter envia, Shift+Enter quebra a linha), clipe (anexar arquivo — um por mensagem) e relogio
// (agendar o envio, campo `datahora` do FormGrid). Mensagem so com anexo usa o nome do arquivo como texto (o texto
// e obrigatorio na API). Nos baloes MEUS: agendada tem Editar (em linha) e Cancelar; enviada tem Apagar.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';

import FormGrid from '@/components/ui/FormGrid/Input';
import type { FormGridSchema } from '@/components/ui/FormGrid/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/services/http';
import type { ChatAttachment } from '@/services/v1/messagesChat';
import { avisoPalavrasProibidas } from '@/utils/palavrasProibidas';
import ChatAttachmentView from './ChatAttachmentView';

/** Intervalo da atualizacao automatica (ms). */
const POLL_MS = 5000;
/** Folga (px) para considerar que a lista ja esta "no fim". */
const BOTTOM_SLACK = 80;

/** Mensagem pronta para desenhar (cada conversa monta a sua a partir da API). */
export interface PaneMessage {
  id: number;
  content: string;
  /** `scheduled` mostra "agendada <dia hora>" no lugar da hora. */
  status: string;
  /** Minha (balao a direita, azul) ou do outro (esquerda, cinza). */
  mine: boolean;
  /** Nome de quem enviou — exibido acima do texto nas mensagens dos outros (so nas conversas de grupo). */
  author: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  /** Marca nas minhas: um check (enviada) ou dois (lida); null = sem marca. */
  tick: 'sent' | 'read' | null;
  /** Texto curto ao lado da hora nas minhas (ex.: "1/2" = lida por 1 de 2). */
  note: string | null;
  attachments: ChatAttachment[];
  /** Usuarios marcados (@) na mensagem (so grupo). */
  mentions: PaneMention[];
  /** A mensagem marca o usuario logado (borda amarela). */
  mentionsMe: boolean;
}

/** Usuario marcado (@) numa mensagem. */
export interface PaneMention {
  userId: number;
  name: string;
}

/** Quem pode ser marcado na conversa (membros do grupo, sem o proprio usuario). */
export interface MentionCandidate {
  id: number;
  name: string;
}

/** Resultado do envio: a mensagem ja foi gravada; `attachmentError` avisa que so o anexo falhou. */
export interface PaneSendResult {
  attachmentError: string | null;
}

/** "AAAA-MM-DD HH:MM:SS" -> Date local (sem fuso). */
function parseDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(value);
  if (!m) return null;

  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
}

function hourLabel(value: string | null): string {
  const d = value ? parseDate(value) : null;

  return d ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
}

function dayLabel(value: string): string {
  const d = parseDate(value);
  if (!d) return '';
  const today = new Date();
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (same(d, today)) return 'Hoje';
  if (same(d, yesterday)) return 'Ontem';

  return d.toLocaleDateString('pt-BR');
}

/** Data de referencia da mensagem para hora e separador: envio, senao agendamento, senao criacao. */
function refDate(m: PaneMessage): string {
  return m.sentAt ?? m.scheduledAt ?? m.createdAt;
}

/** Texto da mensagem com os `@Nome` marcados em destaque. */
function MessageText({ content, names }: { content: string; names: string[] }) {
  if (names.length === 0) return <>{content}</>;
  const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = content.split(new RegExp(`(@(?:${escaped.join('|')}))`, 'gi'));
  const lower = names.map((n) => `@${n}`.toLowerCase());

  return (
    <>
      {parts.map((part, i) =>
        lower.includes(part.toLowerCase()) ? (
          <mark key={i} className="px-1 py-0 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/** Campo de data e hora (FormGrid `datahora`, controlado) usado para agendar e para reagendar. */
function scheduleSchema(label: string, value: string, onChange: (value: string) => void): FormGridSchema {
  return {
    rows: [
      {
        fields: [
          {
            type: 'datahora',
            col: 12,
            label,
            name: 'scheduled_at',
            value,
            onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
          },
        ],
      },
    ],
  };
}

export interface ConversationPaneProps {
  /** Rotulo de acessibilidade da area de mensagens (ex.: "Conversa com Fulano"). */
  ariaLabel: string;
  /** Texto da conversa vazia. */
  emptyText?: string;
  /** Busca as mensagens (das mais antigas para as mais novas); roda ao abrir e a cada 5 s. */
  load: (signal: AbortSignal) => Promise<PaneMessage[]>;
  /** Envia o texto (na hora ou agendado, com anexo opcional). Falha vira toast; sucesso limpa o rodape e recarrega. */
  send: (content: string, file: File | null, scheduledAt: string | null, mentionIds: number[]) => Promise<PaneSendResult>;
  /** Membros que podem ser marcados com `@` (conversa de grupo); sem a lista, `@` e so texto. */
  mentionCandidates?: MentionCandidate[];
  /** Edita a propria mensagem agendada (texto e data). */
  edit: (id: number, content: string, scheduledAt: string | null) => Promise<unknown>;
  /** Apaga a propria mensagem. */
  remove: (id: number) => Promise<unknown>;
}

export default function ConversationPane({
  ariaLabel,
  emptyText = 'Nenhuma mensagem ainda. Diga olá.',
  load,
  send,
  mentionCandidates = [],
  edit,
  remove,
}: ConversationPaneProps) {
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role?.slug === 'admin';
  const [messages, setMessages] = useState<PaneMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [sending, setSending] = useState(false);
  // Edicao em linha (so mensagem agendada minha).
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editWhen, setEditWhen] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  // Marcacao (@): ids escolhidos nas sugestoes, consulta aberta e item destacado.
  const [picked, setPicked] = useState<Map<number, string>>(new Map());
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const draftRef = useRef<HTMLTextAreaElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const stickToBottom = useRef(true);
  const lastSignature = useRef('');

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  /** Recarrega a conversa; so atualiza o estado se algo mudou (evita redesenhar e mexer no scroll a cada 5 s). */
  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      const controller = signal ? null : new AbortController();
      const effective = signal ?? controller!.signal;
      try {
        const items = await load(effective);
        if (effective.aborted) return;

        const signature = items
          .map((m) => `${m.id}:${m.status}:${m.tick ?? ''}:${m.note ?? ''}:${m.content}:${m.scheduledAt ?? ''}:${m.attachments.map((a) => a.id).join(',')}`)
          .join('|');
        if (signature !== lastSignature.current) {
          lastSignature.current = signature;
          setMessages(items);
        }
        setError(null);
      } catch (err) {
        if (effective.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Falha ao carregar a conversa.');
      } finally {
        if (!effective.aborted) setLoading(false);
      }
    },
    [load],
  );

  // Ao abrir (ou trocar de conversa): carrega e inicia o polling; ao fechar, para.
  useEffect(() => {
    const controller = new AbortController();
    stickToBottom.current = true;
    lastSignature.current = '';
    setMessages([]);
    setLoading(true);
    setError(null);
    void refresh(controller.signal);
    const timer = window.setInterval(() => void refresh(controller.signal), POLL_MS);

    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [refresh]);

  // Depois de desenhar mensagens novas, rola para o fim se a pessoa ja estava la.
  useEffect(() => {
    if (stickToBottom.current) scrollToBottom();
  }, [messages, scrollToBottom]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_SLACK;
  };

  // Filtro de palavrao (admin isento): aviso e Enviar desabilitado; o backend confere de novo (422 + advertencia).
  const draftWarning = avisoPalavrasProibidas(draft, isAdmin);
  const editWarning = editingId !== null ? avisoPalavrasProibidas(editText, isAdmin) : null;
  const canSend = !sending && draftWarning === null && (draft.trim() !== '' || file !== null);

  // Sugestoes de marcacao para o "@consulta" digitado.
  const suggestions = useMemo(() => {
    if (mentionQuery === null || mentionCandidates.length === 0) return [];
    const q = mentionQuery.toLowerCase();

    return mentionCandidates.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
  }, [mentionQuery, mentionCandidates]);

  /** Detecta "@consulta" imediatamente antes do cursor; fora disso, fecha as sugestoes. */
  const detectMention = (text: string, caret: number) => {
    if (mentionCandidates.length === 0) return;
    const match = /(^|\s)@([^\s@]{0,30})$/.exec(text.slice(0, caret));
    setMentionQuery(match ? (match[2] ?? '') : null);
    setMentionIndex(0);
  };

  const pickMention = (candidate: MentionCandidate) => {
    const el = draftRef.current;
    const caret = el?.selectionStart ?? draft.length;
    const start = caret - ((mentionQuery ?? '').length + 1);
    const next = `${draft.slice(0, start)}@${candidate.name} ${draft.slice(caret)}`;
    const position = start + candidate.name.length + 2;
    setDraft(next);
    setPicked((prev) => new Map(prev).set(candidate.id, candidate.name));
    setMentionQuery(null);
    window.requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(position, position);
    });
  };

  const handleSend = async () => {
    if (!canSend) return;
    // Mensagem so com anexo: o texto da API e obrigatorio, entao usa o nome do arquivo.
    const content = draft.trim() !== '' ? draft.trim() : (file?.name ?? '');
    setSending(true);
    try {
      // So vao as marcacoes cujo "@Nome" continua no texto final.
      const lowered = content.toLowerCase();
      const mentionIds = [...picked.entries()].filter(([, name]) => lowered.includes(`@${name.toLowerCase()}`)).map(([id]) => id);
      const result = await send(content, file, scheduledAt !== '' ? scheduledAt : null, mentionIds);
      if (result.attachmentError) {
        toast.error(`A mensagem foi gravada, mas o anexo não. ${result.attachmentError}`, { title: 'Anexo não enviado' });
      }
      setDraft('');
      setPicked(new Map());
      setMentionQuery(null);
      setFile(null);
      setScheduledAt('');
      setScheduleOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      stickToBottom.current = true;
      await refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao enviar a mensagem.', { title: 'Mensagem' });
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((i) => (i + (e.key === 'ArrowDown' ? 1 : suggestions.length - 1)) % suggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const chosen = suggestions[mentionIndex];
        if (chosen) pickMention(chosen);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const startEdit = (m: PaneMessage) => {
    setEditingId(m.id);
    setEditText(m.content);
    setEditWhen(m.scheduledAt ?? '');
  };

  const saveEdit = async (m: PaneMessage) => {
    setBusyId(m.id);
    try {
      await edit(m.id, editText.trim(), editWhen !== '' ? editWhen : null);
      setEditingId(null);
      await refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao editar a mensagem.', { title: 'Mensagem' });
    } finally {
      setBusyId(null);
    }
  };

  const removeMessage = async (m: PaneMessage) => {
    const scheduled = m.status === 'scheduled';
    if (!window.confirm(scheduled ? 'Cancelar esta mensagem agendada?' : 'Apagar esta mensagem?')) return;
    setBusyId(m.id);
    try {
      await remove(m.id);
      await refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao apagar a mensagem.', { title: 'Mensagem' });
    } finally {
      setBusyId(null);
    }
  };

  let lastDay = '';

  return (
    <div className="d-flex flex-column" style={{ height: '65vh' }}>
      <div ref={listRef} onScroll={onScroll} className="flex-grow-1 overflow-auto px-1" aria-live="polite" aria-label={ariaLabel}>
        {loading && (
          <div className="text-center text-body-secondary py-4" role="status">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            Carregando conversa...
          </div>
        )}
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {!loading && !error && messages.length === 0 && (
          <div className="text-center text-body-secondary py-5">
            <i className="bi bi-chat-dots fs-1 d-block mb-2" aria-hidden="true" />
            {emptyText}
          </div>
        )}

        {messages.map((m) => {
          const day = dayLabel(refDate(m));
          const showDay = day !== '' && day !== lastDay;
          lastDay = day || lastDay;
          const scheduled = m.status === 'scheduled';
          const editing = editingId === m.id;
          const busy = busyId === m.id;

          return (
            <div key={m.id}>
              {showDay && (
                <div className="text-center my-2">
                  <span className="badge text-bg-light border fw-normal">{day}</span>
                </div>
              )}
              <div className={`d-flex mb-2 ${m.mine ? 'justify-content-end' : 'justify-content-start'}`}>
                <div
                  className={`rounded-3 px-3 py-2 ${m.mine ? 'bg-primary text-white' : 'bg-body-secondary'}${m.mentionsMe ? ' border border-2 border-warning' : ''}`}
                  style={{ maxWidth: '78%', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                >
                  {!m.mine && m.author && <div className="small fw-semibold text-primary-emphasis">{m.author}</div>}

                  {editing ? (
                    <div className="text-body" style={{ whiteSpace: 'normal', minWidth: '260px' }}>
                      <textarea
                        className="form-control form-control-sm mb-2"
                        rows={3}
                        aria-label="Editar mensagem"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        disabled={busy}
                      />
                      {editWarning && <div className="alert alert-danger py-1 small mb-2">{editWarning}</div>}
                      <FormGrid schema={scheduleSchema('Enviar em', editWhen, setEditWhen)} />
                      <div className="d-flex gap-2 justify-content-end mt-2">
                        <button type="button" className="btn btn-sm btn-light" disabled={busy} onClick={() => setEditingId(null)}>
                          Cancelar
                        </button>
                        <button type="button" className="btn btn-sm btn-success" disabled={busy || editText.trim() === '' || editWarning !== null} onClick={() => void saveEdit(m)}>
                          {busy ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <MessageText content={m.content} names={m.mentions.map((x) => x.name)} />
                      </div>
                      {m.attachments.map((a) => (
                        <ChatAttachmentView key={a.id} attachment={a} mine={m.mine} />
                      ))}
                    </>
                  )}

                  {!editing && (
                    <div className={`small text-end mt-1 ${m.mine ? 'text-white-50' : 'text-body-secondary'}`}>
                      {scheduled ? (
                        <>
                          <i className="bi bi-clock me-1" aria-hidden="true" />
                          agendada {m.scheduledAt ? `${dayLabel(m.scheduledAt)} ${hourLabel(m.scheduledAt)}` : ''}
                        </>
                      ) : (
                        <>
                          {hourLabel(refDate(m))}
                          {m.mine && m.note && <span className="ms-1">{m.note}</span>}
                          {m.mine && m.tick && (
                            <i
                              className={`bi ${m.tick === 'read' ? 'bi-check2-all' : 'bi-check2'} ms-1`}
                              aria-label={m.tick === 'read' ? 'Lida' : 'Enviada'}
                              title={m.tick === 'read' ? 'Lida' : 'Enviada'}
                            />
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {m.mine && !editing && (
                    <div className="d-flex gap-1 justify-content-end mt-1">
                      {scheduled && (
                        <button type="button" className="btn btn-sm btn-light py-0 px-2" disabled={busy} onClick={() => startEdit(m)} title="Editar enquanto agendada">
                          <i className="bi bi-pencil" aria-hidden="true" /> Editar
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-light py-0 px-2"
                        disabled={busy}
                        onClick={() => void removeMessage(m)}
                        title={scheduled ? 'Cancelar o envio' : 'Apagar a mensagem'}
                      >
                        <i className={`bi ${scheduled ? 'bi-x-lg' : 'bi-trash'}`} aria-hidden="true" /> {scheduled ? 'Cancelar' : 'Apagar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-top pt-2 mt-2">
        {scheduleOpen && (
          <div className="mb-2">
            <FormGrid schema={scheduleSchema('Agendar envio (data e hora futuras)', scheduledAt, setScheduledAt)} />
          </div>
        )}
        {file && (
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge text-bg-light border d-inline-flex align-items-center gap-2 fw-normal text-wrap text-start">
              <i className="bi bi-paperclip" aria-hidden="true" />
              {file.name}
              <button
                type="button"
                className="btn-close btn-close-sm"
                aria-label="Remover anexo"
                style={{ fontSize: '0.6rem' }}
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              />
            </span>
          </div>
        )}
        {draftWarning && <div className="alert alert-danger py-1 small mb-2">{draftWarning}</div>}
        {suggestions.length > 0 && (
          <div className="list-group shadow-sm mb-2" role="listbox" aria-label="Membros do grupo">
            {suggestions.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={i === mentionIndex}
                className={`list-group-item list-group-item-action py-1 ${i === mentionIndex ? 'active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pickMention(c);
                }}
              >
                <i className="bi bi-at me-1" aria-hidden="true" />
                {c.name}
              </button>
            ))}
          </div>
        )}
        <div className="d-flex gap-2 align-items-end">
          <textarea
            ref={draftRef}
            className="form-control"
            rows={3}
            placeholder={mentionCandidates.length > 0 ? 'Digite uma mensagem (@ marca alguém do grupo; Enter envia, Shift+Enter quebra a linha)' : 'Digite uma mensagem (Enter envia, Shift+Enter quebra a linha)'}
            aria-label="Mensagem"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              detectMention(e.target.value, e.target.selectionStart);
            }}
            onKeyDown={onKeyDown}
            disabled={sending}
          />
          <div className="d-flex flex-column gap-1">
            <input ref={fileInputRef} type="file" className="d-none" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <div className="d-flex gap-1">
              <button type="button" className="btn btn-outline-secondary" title="Anexar arquivo" aria-label="Anexar arquivo" disabled={sending} onClick={() => fileInputRef.current?.click()}>
                <i className="bi bi-paperclip" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`btn ${scheduledAt !== '' ? 'btn-warning' : 'btn-outline-secondary'}`}
                title="Agendar envio"
                aria-label="Agendar envio"
                aria-pressed={scheduleOpen}
                disabled={sending}
                onClick={() => setScheduleOpen((open) => !open)}
              >
                <i className="bi bi-clock" aria-hidden="true" />
              </button>
            </div>
            <button type="button" className="btn btn-primary" disabled={!canSend} onClick={() => void handleSend()}>
              {sending ? <span className="spinner-border spinner-border-sm" aria-hidden="true" /> : <i className="bi bi-send" aria-hidden="true" />}
              <span className="visually-hidden">Enviar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
