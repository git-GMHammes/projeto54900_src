// Busca os itens de menu_manager marcados como favorito (is_bookmark = 1) do
// nav_manager ativo, pra alimentar a barra de icones entre a Navbar e o
// titulo da pagina (components/layout/BookmarksBar.tsx).
//
// Diferente de useSiteMenu.ts (que so devolve itens de TOPO com sort_order <
// 100, pra montar o dropdown da Navbar), aqui o item favorito pode ser
// qualquer linha da tabela — filho, item de catalogo (sort_order >= 1000)
// etc. — por isso a consulta e propria, direto por is_bookmark.
//
// Filtro por role reaproveita isRoleAllowed de useSiteMenu.ts (mesma regra:
// roles null libera pra qualquer autenticado). Item sem react_route ou sem
// icon e descartado — nao ha como virar um icone clicavel sem os dois.
//
// Sessao: so busca autenticado, mesmo padrao de useSiteMenu. Sem sessao,
// items fica [].

import { useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import type { UseApiResult } from '@/hooks/useApi';
import { isRoleAllowed } from '@/hooks/useSiteMenu';
import { navManagerTable } from '@/services/v1/navManager.table';
import { menuManagerTable } from '@/services/v1/menuManager.table';
import { normalizeList } from '@/utils/apiResult';
import type { MenuManagerItem, NavManagerItem } from '@/types/menu';

export interface BookmarkItem {
  id: number | string;
  title: string;
  icon: string;
  to: string;
}

async function fetchBookmarkedMenu(signal: AbortSignal, roleSlug: string | null): Promise<BookmarkItem[]> {
  const navPayload = await navManagerTable.find({ status: 'active' }, { limit: 1 }, { signal });
  const { rows: navRows } = normalizeList<NavManagerItem>(navPayload);
  const nav = navRows[0];
  if (!nav) return [];

  const bookmarkPayload = await menuManagerTable.find(
    { nav_manager_id: nav.id, status: 'active', is_bookmark: 1 },
    { limit: 50, sort: 'sort_order', order: 'ASC' },
    { signal },
  );
  const { rows } = normalizeList<MenuManagerItem>(bookmarkPayload);

  return rows
    .filter((item) => isRoleAllowed(item.roles, roleSlug) && item.react_route && item.icon)
    .map((item) => ({ id: item.id, title: item.title, icon: item.icon!, to: item.react_route! }));
}

export interface UseBookmarkedMenuResult {
  items: BookmarkItem[];
  loading: boolean;
}

export function useBookmarkedMenu(): UseBookmarkedMenuResult {
  const { isAuthenticated, user } = useAuth();
  const roleSlug = user?.role?.slug ?? null;
  const { data, loading, error, run, reset }: UseApiResult<BookmarkItem[]> = useApi(
    (signal) => fetchBookmarkedMenu(signal, roleSlug),
  );

  useEffect(() => {
    if (isAuthenticated) void run();
    else reset();
  }, [isAuthenticated, run, reset]);

  return { items: error ? [] : (data ?? []), loading };
}
