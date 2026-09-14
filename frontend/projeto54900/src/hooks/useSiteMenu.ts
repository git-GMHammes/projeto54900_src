// Busca o nav_manager ativo e seus itens do navbar principal para popular o
// Navbar dinamicamente. menu_manager guarda TODAS as rotas do site (inclusive
// sub-rotas de CRUD como /v1/user-manager/create) na mesma tabela, sem campo
// dedicado para "aparece no navbar" — a convencao adotada e sort_order: itens
// do navbar principal ficam abaixo de NAVBAR_SORT_ORDER_LIMIT, o restante do
// catalogo de rotas fica em sort_order >= 1000. Hierarquia (submenu) e
// enforcement de roles ficam fora desta fase — ver
// src/frontend/projeto54900/CLAUDE.md.
//
// Em erro ou lista vazia, `items` volta null: o Navbar decide usar o fallback
// estatico (FALLBACK_NAV).

const NAVBAR_SORT_ORDER_LIMIT = 100;

import { useApi } from '@/hooks/useApi';
import type { UseApiResult } from '@/hooks/useApi';
import { navManagerTable } from '@/services/v1/navManager.table';
import { menuManagerTable } from '@/services/v1/menuManager.table';
import { normalizeList } from '@/utils/apiResult';
import type { MenuManagerItem, NavManagerItem } from '@/types/menu';

export interface SiteMenuLink {
  to: string;
  label: string;
  end: boolean;
}

async function fetchSiteMenu(signal: AbortSignal): Promise<SiteMenuLink[]> {
  const navPayload = await navManagerTable.find({ status: 'active' }, { limit: 1 }, { signal });
  const { rows: navRows } = normalizeList<NavManagerItem>(navPayload);
  const nav = navRows[0];
  if (!nav) return [];

  const menuPayload = await menuManagerTable.find(
    { nav_manager_id: nav.id, status: 'active' },
    { limit: 100 },
    { signal },
  );
  const { rows: menuRows } = normalizeList<MenuManagerItem>(menuPayload);

  return menuRows
    .filter((item) => item.parent_id === null && Number(item.sort_order) < NAVBAR_SORT_ORDER_LIMIT)
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
    .filter((item): item is MenuManagerItem & { react_route: string } => Boolean(item.react_route))
    .map((item) => ({
      to: item.react_route,
      label: item.title,
      end: item.react_route === '/',
    }));
}

export interface UseSiteMenuResult {
  items: SiteMenuLink[] | null;
  loading: boolean;
}

export function useSiteMenu(): UseSiteMenuResult {
  const { data, loading, error }: UseApiResult<SiteMenuLink[]> = useApi(fetchSiteMenu, {
    immediate: true,
  });

  return { items: error ? null : data, loading };
}
