// Conversa de GRUPO do modo chat (Etapas 4 e 5) — o corpo do ChatModal para um grupo. Message NAO e sala de
// chat: a mensagem de grupo e uma linha de messages_manager ligada ao grupo; os destinatarios sao os membros ativos.
//
// A apresentacao e o ciclo (baloes, rodape, polling de 5 s, rolagem, anexo, agendamento, editar/apagar) estao em
// ConversationPane. Aqui:
//   load    GET message-group-messages/chat/{groupId} (so membro ativo): as `sent` de todos e as minhas agendadas;
//           nas dos outros mostra o AUTOR; nas minhas, "lida por X de N" (read_count / readers_total) e check
//           duplo quando todos leram. Ao abrir, e a cada mensagem nova de outra pessoa, PATCH chat/{groupId}/read
//           (leitura por membro, idempotente)
//   send    POST message-group-messages/create (na hora ou agendada; so membro ativo) + upload do anexo, se houver;
//           com `mentions` (ids dos membros marcados com @, escolhidos entre os membros ativos do grupo)
//   edit    PUT messages-manager/chat/{id}    (a mensagem de grupo e uma linha de messages_manager; so agendada)
//   remove  DELETE messages-manager/chat/{id} (apaga a propria mensagem)
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { messageGroupMembersView } from '@/services/v1';
import { normalizeList } from '@/utils/apiResult';
import { toText } from '@/utils/format';

import { messagesChat } from '@/services/v1/messagesChat';
import type { GroupChatMessage } from '@/services/v1/messagesChat';
import ConversationPane from './ConversationPane';
import type { MentionCandidate, PaneMessage } from './ConversationPane';

export interface GroupConversationProps {
  groupId: number;
  groupName: string;
}

function toPane(m: GroupChatMessage, myId: number): PaneMessage {
  const allRead = m.readersTotal > 0 && m.readCount >= m.readersTotal;

  return {
    id: m.id,
    content: m.content,
    status: m.status,
    mine: m.mine,
    author: m.mine ? null : m.author,
    scheduledAt: m.scheduledAt,
    sentAt: m.sentAt,
    createdAt: m.createdAt,
    tick: m.mine ? (allRead ? 'read' : 'sent') : null,
    note: m.mine && m.readersTotal > 0 ? `${m.readCount}/${m.readersTotal}` : null,
    attachments: m.attachments,
    mentions: m.mentions,
    mentionsMe: !m.mine && m.mentions.some((x) => x.userId === myId),
  };
}

export default function GroupConversation({ groupId, groupName }: GroupConversationProps) {
  // Maior id de mensagem de OUTRA pessoa ja marcado como lido: so chama a API de leitura quando chega algo novo.
  const lastMarked = useRef(0);
  const { user } = useAuth();
  const myId = user ? Number(user.id) : 0;

  // Membros ativos do grupo (sem o proprio usuario): quem pode ser marcado com @.
  const [members, setMembers] = useState<MentionCandidate[]>([]);
  useEffect(() => {
    let cancelled = false;
    void messageGroupMembersView
      .find({ mgm_message_groups_manager_id: groupId, mgm_status: 'active' }, { page: 1, limit: 1000, sort: 'uc_name', order: 'ASC' })
      .then((raw) => {
        if (cancelled) return;
        setMembers(
          normalizeList<Record<string, unknown>>(raw)
            .rows.map((r) => ({
              id: Number(r.mgm_user_manager_id),
              name: toText(r.uc_name, '') || toText(r.um_username, ''),
            }))
            .filter((c) => c.id !== myId && c.name !== ''),
        );
      })
      .catch(() => {
        if (!cancelled) setMembers([]);
      });

    return () => {
      cancelled = true;
    };
  }, [groupId, myId]);
  const candidates = useMemo(() => members, [members]);

  const load = useCallback(
    async (signal: AbortSignal) => {
      const items = await messagesChat.listGroup(groupId, signal);
      const maxIncoming = items.filter((m) => !m.mine && m.status === 'sent').reduce((max, m) => Math.max(max, m.id), 0);
      if (!signal.aborted && maxIncoming > lastMarked.current) {
        lastMarked.current = maxIncoming;
        void messagesChat.markGroupRead(groupId).catch(() => {
          lastMarked.current = 0;
        });
      }

      return items.map((m) => toPane(m, myId));
    },
    [groupId, myId],
  );

  const send = useCallback(
    (content: string, file: File | null, scheduledAt: string | null, mentionIds: number[]) =>
      messagesChat.sendGroup(groupId, content, { file, scheduledAt, mentions: mentionIds }),
    [groupId],
  );

  const edit = useCallback(
    (id: number, content: string, scheduledAt: string | null) =>
      messagesChat.editMessage(id, scheduledAt ? { content, scheduledAt } : { content }),
    [],
  );

  const remove = useCallback((id: number) => messagesChat.removeMessage(id), []);

  return (
    <ConversationPane
      ariaLabel={`Conversa do grupo ${groupName}`}
      emptyText="Nenhuma mensagem no grupo ainda. Diga olá."
      load={load}
      send={send}
      mentionCandidates={candidates}
      edit={edit}
      remove={remove}
    />
  );
}
