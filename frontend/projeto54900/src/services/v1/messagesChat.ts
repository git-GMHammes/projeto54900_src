// PROPOSITO: chamadas do MODO CHAT 1 para 1 privado (Etapa 2) sobre rotas que ja existem em
// app/Config/Routes/Api/v1/Messages/MessagesManager/ (grupo api/v1/messages-manager):
//   GET   with/{userId}   -> mensagens entre o usuario logado e {userId} (ultimas 200, mais antigas primeiro)
//   PATCH read/{userId}   -> carimba read_at nas mensagens recebidas de {userId} (idempotente)
//   POST  create          -> envia uma mensagem (sem scheduled_at sai na hora, status `sent`)
//   GET   unread-count    -> total de mensagens recebidas (`sent`) ainda nao lidas pelo usuario logado (Etapa 3)
// Conversa de GRUPO (Etapa 4), rotas de app/Config/Routes/Api/v1/Messages/MessageGroupMessages/ (grupo
// api/v1/message-group-messages; so membro ativo):
//   GET   chat/{groupId}        -> conversa do grupo (ultimas 200) com autor, read_count e readers_total
//   PATCH chat/{groupId}/read   -> marca como lidas as mensagens do grupo (leitura por membro; idempotente)
//   POST  create                -> envia ao grupo (message_groups_manager_id + content; sai na hora)
// Regra de estado do CHAT (Etapa 5; a area administrativa segue irrestrita), rotas de messages-manager:
//   PUT    chat/{id}   -> edita a PROPRIA mensagem (texto e/ou data), SO enquanto agendada (409 depois)
//   DELETE chat/{id}   -> apaga a PROPRIA mensagem (status=removed), em qualquer status
// Anexo: gravada a mensagem, o arquivo sobe em seguida (messageAttachments.upload, multipart) com o id dela.
// Nao e recurso REST padrao (rotas extras), por isso NAO usa createResource. Message NAO e sala de chat.

import { http } from '@/services/http';
import { API_GROUPS } from '@/constants/api';
import { messageAttachmentsUpload } from '@/services/v1/messageAttachments.upload';
import { ApiError } from '@/services/http';

const base = `/v1/${API_GROUPS.messagesManager}`;
const groupBase = `/v1/${API_GROUPS.messageGroupMessages}`;

/** Anexo de uma mensagem, como devolvido junto da mensagem (so anexos ativos). */
export interface ChatAttachment {
  id: number;
  name: string;
  /** image, video, audio, document, spreadsheet, presentation, pdf, archive ou other. */
  category: string;
  size: number;
}

function toAttachments(raw: unknown): ChatAttachment[] {
  if (!Array.isArray(raw)) return [];

  return (raw as Record<string, unknown>[]).map((a) => ({
    id: Number(a.id),
    name: text(a.name),
    category: text(a.category),
    size: Number(a.size ?? 0),
  }));
}

/** Usuario marcado (@) numa mensagem de grupo. */
export interface ChatMention {
  userId: number;
  name: string;
}

function toMentions(raw: unknown): ChatMention[] {
  if (!Array.isArray(raw)) return [];

  return (raw as Record<string, unknown>[]).map((m) => ({ userId: Number(m.user_id), name: text(m.name) }));
}

/** Resultado de um envio: a mensagem ja foi gravada; `attachmentError` e o aviso se o anexo falhou. */
export interface SendResult {
  attachmentError: string | null;
}

export interface SendOptions {
  /** "AAAA-MM-DD HH:MM:SS" futuro: a mensagem fica agendada. */
  scheduledAt?: string | null;
  file?: File | null;
  /** Ids de usuario marcados (@) — so na conversa de grupo (membros ativos do grupo). */
  mentions?: number[];
}

/** Sobe o anexo da mensagem recem-gravada; devolve o aviso de erro (a mensagem ja existe) ou null. */
async function uploadAttachment(messageId: unknown, file: File | null | undefined): Promise<string | null> {
  if (!file) return null;
  if (typeof messageId !== 'number' && typeof messageId !== 'string') return 'A resposta nao trouxe o id da mensagem.';
  try {
    await messageAttachmentsUpload.upload({ file, messageId });

    return null;
  } catch (err) {
    return err instanceof ApiError ? err.message : 'Falha inesperada no anexo.';
  }
}

/** Mensagem da conversa, como devolvida por `with/{userId}`. */
export interface ChatMessage {
  id: number;
  content: string;
  status: string;
  /** A mensagem e do usuario logado (balao a direita). */
  mine: boolean;
  author: string;
  senderUserManagerId: number;
  scheduledAt: string | null;
  sentAt: string | null;
  readAt: string | null;
  createdAt: string;
  attachments: ChatAttachment[];
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
}

function textOrNull(value: unknown): string | null {
  const t = text(value);

  return t === '' ? null : t;
}

function toChatMessage(raw: Record<string, unknown>): ChatMessage {
  return {
    id: Number(raw.id),
    content: text(raw.content),
    status: text(raw.status),
    mine: raw.mine === true,
    author: text(raw.author),
    senderUserManagerId: Number(raw.sender_user_manager_id ?? 0),
    scheduledAt: textOrNull(raw.scheduled_at),
    sentAt: textOrNull(raw.sent_at),
    readAt: textOrNull(raw.read_at),
    createdAt: text(raw.created_at),
    attachments: toAttachments(raw.attachments),
  };
}

/** Mensagem da conversa de grupo, como devolvida por `chat/{groupId}`. */
export interface GroupChatMessage {
  /** Id da MENSAGEM (messages_manager). */
  id: number;
  content: string;
  status: string;
  mine: boolean;
  author: string;
  senderUserManagerId: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  /** Quantos membros ja leram (sem o remetente). */
  readCount: number;
  /** Quantos membros deveriam ler (membros ativos sem o remetente). */
  readersTotal: number;
  attachments: ChatAttachment[];
  /** Usuarios marcados (@) na mensagem. */
  mentions: ChatMention[];
}

function toGroupChatMessage(raw: Record<string, unknown>): GroupChatMessage {
  return {
    id: Number(raw.id),
    content: text(raw.content),
    status: text(raw.status),
    mine: raw.mine === true,
    author: text(raw.author),
    senderUserManagerId: Number(raw.sender_user_manager_id ?? 0),
    scheduledAt: textOrNull(raw.scheduled_at),
    sentAt: textOrNull(raw.sent_at),
    createdAt: text(raw.created_at),
    readCount: Number(raw.read_count ?? 0),
    readersTotal: Number(raw.readers_total ?? 0),
    attachments: toAttachments(raw.attachments),
    mentions: toMentions(raw.mentions),
  };
}

/** Conversa com {userId}: as mensagens, das mais antigas para as mais novas. */
export async function listWith(userId: number | string, signal?: AbortSignal): Promise<ChatMessage[]> {
  const raw = await http.get<unknown>(`${base}/with/${userId}`, signal ? { signal } : undefined);
  const data = (raw as { data?: { items?: unknown } } | null)?.data;
  const items = Array.isArray(data?.items) ? (data.items as Record<string, unknown>[]) : [];

  return items.map(toChatMessage);
}

/** Marca como lidas as mensagens recebidas de {userId}. */
export function markRead(userId: number | string): Promise<unknown> {
  return http.patch(`${base}/read/${userId}`);
}

/** Envia uma mensagem ao usuario (na hora ou agendada), com anexo opcional. O remetente e o usuario da sessao. */
export async function send(userId: number | string, content: string, options: SendOptions = {}): Promise<SendResult> {
  const body: Record<string, unknown> = { recipient_user_manager_id: Number(userId), content };
  if (options.scheduledAt) body.scheduled_at = options.scheduledAt;

  const res = await http.post<unknown>(`${base}/create`, body);
  const id = (res as { data?: { id?: unknown } } | null)?.data?.id;

  return { attachmentError: await uploadAttachment(id, options.file) };
}

/** Conversa do grupo {groupId}: as mensagens, das mais antigas para as mais novas (so membro ativo). */
export async function listGroup(groupId: number | string, signal?: AbortSignal): Promise<GroupChatMessage[]> {
  const raw = await http.get<unknown>(`${groupBase}/chat/${groupId}`, signal ? { signal } : undefined);
  const data = (raw as { data?: { items?: unknown } } | null)?.data;
  const items = Array.isArray(data?.items) ? (data.items as Record<string, unknown>[]) : [];

  return items.map(toGroupChatMessage);
}

/** Marca como lidas (por este membro) as mensagens do grupo. */
export function markGroupRead(groupId: number | string): Promise<unknown> {
  return http.patch(`${groupBase}/chat/${groupId}/read`);
}

/** Envia uma mensagem ao grupo (na hora ou agendada), com anexo opcional. O remetente e o usuario da sessao. */
export async function sendGroup(groupId: number | string, content: string, options: SendOptions = {}): Promise<SendResult> {
  const body: Record<string, unknown> = { message_groups_manager_id: Number(groupId), content };
  if (options.scheduledAt) body.scheduled_at = options.scheduledAt;
  if (options.mentions && options.mentions.length > 0) body.mentions = options.mentions;

  const res = await http.post<unknown>(`${groupBase}/create`, body);
  // No grupo, o id da resposta e o da LIGACAO; o anexo pertence a MENSAGEM (messages_manager_id).
  const messageId = (res as { data?: { messages_manager_id?: unknown } } | null)?.data?.messages_manager_id;

  return { attachmentError: await uploadAttachment(messageId, options.file) };
}

/** Edita a PROPRIA mensagem no chat (so enquanto agendada): texto e/ou data de envio. Vale para privada e grupo. */
export function editMessage(messageId: number | string, changes: { content?: string; scheduledAt?: string }): Promise<unknown> {
  const body: Record<string, unknown> = {};
  if (changes.content !== undefined) body.content = changes.content;
  if (changes.scheduledAt !== undefined) body.scheduled_at = changes.scheduledAt;

  return http.put(`${base}/chat/${messageId}`, body);
}

/** Apaga a PROPRIA mensagem no chat (em qualquer status). Vale para privada e grupo. */
export function removeMessage(messageId: number | string): Promise<unknown> {
  return http.delete(`${base}/chat/${messageId}`);
}

/** Total de mensagens nao lidas do usuario logado, privadas + de grupo (contador do menu). */
export async function unreadCount(): Promise<number> {
  const raw = await http.get<unknown>(`${base}/unread-count`);
  const total = Number((raw as { data?: { total?: unknown } } | null)?.data?.total ?? 0);

  return Number.isFinite(total) && total > 0 ? total : 0;
}

export const messagesChat = { listWith, markRead, send, listGroup, markGroupRead, sendGroup, editMessage, removeMessage, unreadCount };
export default messagesChat;
