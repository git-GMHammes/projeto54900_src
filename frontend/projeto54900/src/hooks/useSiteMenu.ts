// Busca o nav_manager ativo e sua arvore de itens (menu_manager) para popular
// o Navbar dinamicamente. menu_manager guarda SO o que aparece no Navbar real,
// espelhando 1:1 os grupos de modulo do backend (ver
// src/app/Database/Seeds/MenuManagerSeeder.php) — grupo com filho nao tem
// react_route (so agrupa, vira dropdown), item sem filho e link direto.
// Enforcement de roles fica fora desta fase — ver
// src/frontend/projeto54900/CLAUDE.md.
//
// Em erro ou lista vazia, `items` volta null: o Navbar decide usar o fallback
// estatico (FALLBACK_NAV).

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
  children?: SiteMenuLink[];
}

function toLink(item: MenuManagerItem): SiteMenuLink | null {
  if (!item.react_route) return null;
  return { to: item.react_route, label: item.title, end: item.react_route === '/' };
}

function buildTree(rows: MenuManagerItem[]): SiteMenuLink[] {
  const byParent = new Map<string, MenuManagerItem[]>();
  for (const item of rows) {
    const key = item.parent_id === null ? '' : String(item.parent_id);
    const siblings = byParent.get(key) ?? [];
    siblings.push(item);
    byParent.set(key, siblings);
  }
  for (const siblings of byParent.values()) {
    siblings.sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
  }

  const top = byParent.get('') ?? [];
  const links: SiteMenuLink[] = [];
  for (const item of top) {
    const childRows = byParent.get(String(item.id)) ?? [];
    if (childRows.length > 0) {
      const children = childRows.map(toLink).filter((l): l is SiteMenuLink => l !== null);
      if (children.length > 0) {
        links.push({ to: '#', label: item.title, end: false, children });
        continue;
      }
    }
    const link = toLink(item);
    if (link) links.push(link);
  }
  return links;
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

  return buildTree(menuRows);
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
