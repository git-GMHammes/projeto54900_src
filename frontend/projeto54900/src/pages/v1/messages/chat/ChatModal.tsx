// Modal da CONVERSA do modo chat (Message NAO e sala de chat: e conversa 1 para 1 privada ou com um grupo).
// Abre ao clicar num card da lista (ChatHomePage). Para um USUARIO mostra a conversa privada
// (PrivateConversation, Etapa 2); para um GRUPO, a conversa do grupo (GroupConversation, Etapa 4).
import Modal from '@/components/global/Modal';
import GroupConversation from './GroupConversation';
import PrivateConversation from './PrivateConversation';

/** Alvo de uma conversa: um usuario (1 para 1 privado) ou um grupo. */
export interface ChatTarget {
  kind: 'user' | 'group';
  id: number;
  title: string;
}

export interface ChatModalProps {
  target: ChatTarget | null;
  onClose: () => void;
}

export default function ChatModal({ target, onClose }: ChatModalProps) {
  return (
    <Modal
      open={target !== null}
      size="lg"
      title={
        target ? (
          <>
            <i className={`bi bi-${target.kind === 'group' ? 'people' : 'person'} me-2`} aria-hidden="true" />
            {target.title}
          </>
        ) : undefined
      }
      onClose={onClose}
    >
      {target?.kind === 'user' && <PrivateConversation userId={target.id} userName={target.title} />}

      {target?.kind === 'group' && <GroupConversation groupId={target.id} groupName={target.title} />}
    </Modal>
  );
}
