// Conversa 1 para 1 PRIVADA do modo chat (Etapas 2 e 5) — o corpo do ChatModal para um usuario.
// Message NAO e sala de chat: sao mensagens diretas entre o usuario logado e o outro.
//
// A apresentacao e o ciclo (baloes, rodape, polling de 5 s, rolagem, anexo, agendamento, editar/apagar) estao em
// ConversationPane, comum com a conversa de grupo. Aqui ficam so as chamadas da conversa privada:
//   load    GET messages-manager/with/{userId}; se ha mensagem recebida ainda nao lida, PATCH read/{userId}
//           (marca como lidas as recebidas); nas minhas, marca de enviada ou lida (read_at)
//   send    POST messages-manager/create (na hora ou agendada) + upload do anexo, se houver
//   edit    PUT messages-manager/chat/{id}    (regra do chat: so enquanto agendada)
//   remove  DELETE messages-manager/chat/{id} (apaga a propria mensagem)
import { useCallback } from 'react';

import { messagesChat } from '@/services/v1/messagesChat';
import type { ChatMessage } from '@/services/v1/messagesChat';
import ConversationPane from './ConversationPane';
import type { PaneMessage } from './ConversationPane';

export interface PrivateConversationProps {
  userId: number;
  userName: string;
}

function toPane(m: ChatMessage): PaneMessage {
  return {
    id: m.id,
    content: m.content,
    status: m.status,
    mine: m.mine,
    author: null,
    scheduledAt: m.scheduledAt,
    sentAt: m.sentAt,
    createdAt: m.createdAt,
    tick: m.mine ? (m.readAt ? 'read' : 'sent') : null,
    note: null,
    attachments: m.attachments,
    mentions: [],
    mentionsMe: false,
  };
}

export default function PrivateConversation({ userId, userName }: PrivateConversationProps) {
  const load = useCallback(
    async (signal: AbortSignal) => {
      const items = await messagesChat.listWith(userId, signal);
      if (!signal.aborted && items.some((m) => !m.mine && m.readAt === null)) {
        void messagesChat.markRead(userId).catch(() => undefined);
      }

      return items.map(toPane);
    },
    [userId],
  );

  const send = useCallback(
    (content: string, file: File | null, scheduledAt: string | null) => messagesChat.send(userId, content, { file, scheduledAt }),
    [userId],
  );

  const edit = useCallback(
    (id: number, content: string, scheduledAt: string | null) =>
      messagesChat.editMessage(id, scheduledAt ? { content, scheduledAt } : { content }),
    [],
  );

  const remove = useCallback((id: number) => messagesChat.removeMessage(id), []);

  return <ConversationPane ariaLabel={`Conversa com ${userName}`} load={load} send={send} edit={edit} remove={remove} />;
}
