// Salas favoritas do usuário da sessão (chat), para a barra superior. Busca em
// /v1/chat-room-favorites/mine. Recarrega quando alguém dispara o evento
// 'chat-favorites-changed' (ação Favoritar/Desfavoritar na listagem de salas).
// Sem sessao: lista vazia.

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { myFavorites, type FavoriteRoom } from '@/services/v1/chatRooms.chat';

export const CHAT_FAVORITES_EVENT = 'chat-favorites-changed';

export function useChatFavoriteRooms(): FavoriteRoom[] {
  const { isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState<FavoriteRoom[]>([]);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const onChange = () => setReload((n) => n + 1);
    window.addEventListener(CHAT_FAVORITES_EVENT, onChange);
    return () => window.removeEventListener(CHAT_FAVORITES_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setRooms([]);
      return undefined;
    }
    const controller = new AbortController();
    myFavorites(controller.signal)
      .then((payload) => setRooms(payload.items))
      .catch(() => {
        if (!controller.signal.aborted) setRooms([]);
      });
    return () => controller.abort();
  }, [isAuthenticated, reload]);

  return rooms;
}
