// Busca o nav_manager ativo e seus itens do navbar principal para popular o
// Navbar dinamicamente. menu_manager guarda TODAS as rotas do site (inclusive
// sub-rotas de CRUD como /v1/user-manager/create) na mesma tabela, sem campo
// dedicado para "aparece no navbar" — a convencao adotada e sort_order: itens
// do navbar principal ficam abaixo de NAVBAR_SORT_ORDER_LIMIT, o restante do
// catalogo de rotas fica em sort_order >= 1000.
//
// Hierarquia: um item de topo (parent_id null) pode ter filhos (parent_id =
// id do pai) — vira dropdown no Navbar. Um item de topo sem react_route
// propria (organizacional, so agrupa filhos) tambem vira dropdown, so que sem
// link no proprio toggle. Enforcement de roles fica fora desta fase — ver
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

export interface SiteMenuItem {
  label: string;
  link: SiteMenuLink | null;
  children: SiteMenuLink[];
}

function toLink(item: MenuManagerItem): SiteMenuLink | null {
  if (!item.react_route) return null;
  // end: true sempre — cada item aponta pra uma pagina distinta (nao um layout
  // pai), entao so deve marcar .active na rota exata. Sem isso, "/v1/user-manager"
  // (Listar) ficava marcado ativo tambem em "/v1/user-manager/create".
  return { to: item.react_route, label: item.title, end: true };
}

async function fetchSiteMenu(signal: AbortSignal): Promise<SiteMenuItem[]> {
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

  const byParent = new Map<string, MenuManagerItem[]>();
  for (const item of menuRows) {
    if (item.parent_id === null) continue;
    const key = String(item.parent_id);
    (byParent.get(key) ?? byParent.set(key, []).get(key)!).push(item);
  }

  return menuRows
    .filter((item) => item.parent_id === null && Number(item.sort_order) < NAVBAR_SORT_ORDER_LIMIT)
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
    .map((item) => {
      const children = (byParent.get(String(item.id)) ?? [])
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
        .map(toLink)
        .filter((link): link is SiteMenuLink => link !== null);
      return { label: item.title, link: toLink(item), children };
    })
    .filter((item) => item.link !== null || item.children.length > 0);
}

export interface UseSiteMenuResult {
  items: SiteMenuItem[] | null;
  loading: boolean;
}

export function useSiteMenu(): UseSiteMenuResult {
  const { data, loading, error }: UseApiResult<SiteMenuItem[]> = useApi(fetchSiteMenu, {
    immediate: true,
  });

  return { items: error ? null : data, loading };
}
