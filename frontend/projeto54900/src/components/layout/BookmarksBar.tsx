// Linha de icones-favoritos, renderizada pelo RootLayout entre a Navbar e o
// titulo de cada pagina (PageHeader). So mostra itens de menu_manager com
// is_bookmark = 1 (useBookmarkedMenu.ts). Sem nenhum favorito marcado, ou sem
// sessao, o componente devolve null — nao sobra espaco vazio no layout.
//
// Tooltip sem JS: reaproveita as classes globais .icon-action-tooltip /
// .icon-action-tooltip-bubble (styles/_custom.scss), mesmo padrao ja usado em
// varias GetAllPage.tsx do projeto (ex.: pages/v1/menu/GetAllPage.tsx).

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useBookmarkedMenu } from '@/hooks/useBookmarkedMenu';
import { useChatFavoriteRooms } from '@/hooks/useChatFavoriteRooms';
import { paths } from '@/routes/paths';

function WithTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="icon-action-tooltip">
      {children}
      <span className="icon-action-tooltip-bubble" role="tooltip">
        {label}
      </span>
    </span>
  );
}

export default function BookmarksBar() {
  const { items } = useBookmarkedMenu();
  const chatRooms = useChatFavoriteRooms();

  if (items.length === 0 && chatRooms.length === 0) return null;

  const iconLink = (key: string, label: string, to: string, icon: string) => (
    <WithTooltip key={key} label={label}>
      <Link
        to={to}
        className="btn btn-outline-secondary btn-sm rounded-circle d-inline-flex align-items-center justify-content-center"
        style={{ width: '2.25rem', height: '2.25rem' }}
        aria-label={label}
      >
        <i className={`bi bi-${icon} fs-5`} aria-hidden="true" />
      </Link>
    </WithTooltip>
  );

  return (
    <div className="d-flex justify-content-center flex-wrap gap-3 pb-2 mb-3 border-bottom">
      {items.map((item) => iconLink(String(item.id), item.title, item.to, item.icon))}
      {chatRooms.map((room) =>
        iconLink(
          `room-${room.chat_rooms_manager_id}`,
          `Chat: ${room.name}`,
          paths.v1.chatRooms.chat(room.chat_rooms_manager_id),
          'chat-dots',
        ),
      )}
    </div>
  );
}
