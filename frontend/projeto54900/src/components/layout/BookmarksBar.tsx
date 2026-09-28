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

  if (items.length === 0) return null;

  return (
    <div className="d-flex justify-content-center flex-wrap gap-3 pb-2 mb-3 border-bottom">
      {items.map((item) => (
        <WithTooltip key={item.id} label={item.title}>
          <Link
            to={item.to}
            className="btn btn-outline-secondary btn-sm rounded-circle d-inline-flex align-items-center justify-content-center"
            style={{ width: '2.25rem', height: '2.25rem' }}
            aria-label={item.title}
          >
            <i className={`bi bi-${item.icon} fs-5`} aria-hidden="true" />
          </Link>
        </WithTooltip>
      ))}
    </div>
  );
}
