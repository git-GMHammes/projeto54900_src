// PROPOSITO: total de mensagens recebidas (conversa 1 para 1 do modo chat) ainda nao lidas, para o
// contador (badge) do menu. Consulta `GET messages-manager/unread-count` ao montar, a cada 20 s (pausa
// com a aba escondida) e quando alguem chama `notifyUnreadChanged()` — ex.: a lista de conversas, ao
// fechar o modal depois de ler. Desligado (`enabled=false`, ex.: sem sessao ou guest) devolve 0 sem consultar.
// Consulta periodica, nao tempo real (WebSocket ainda nao decidido).
//
// Usado por: components/layout/Navbar.tsx.

import { useEffect, useState } from 'react';

import { messagesChat } from '@/services/v1/messagesChat';

const EVENT_NAME = 'messages:unread-changed';
const POLL_MS = 20000;

/** Pede a todos os consumidores do hook que recarreguem o total agora. */
export function notifyUnreadChanged(): void {
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useUnreadMessages(enabled: boolean): number {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setTotal(0);
      return;
    }

    let cancelled = false;
    const load = async (force: boolean) => {
      if (!force && document.hidden) return;
      try {
        const n = await messagesChat.unreadCount();
        if (!cancelled) setTotal(n);
      } catch {
        // Falha pontual: mantem o ultimo total (o badge nao deve piscar nem quebrar o menu).
      }
    };
    const onChanged = () => void load(true);

    void load(true);
    const timer = window.setInterval(() => void load(false), POLL_MS);
    window.addEventListener(EVENT_NAME, onChanged);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener(EVENT_NAME, onChanged);
    };
  }, [enabled]);

  return total;
}

export default useUnreadMessages;
