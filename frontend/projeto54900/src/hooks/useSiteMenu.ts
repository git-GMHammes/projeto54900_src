/**
 * =========================================================================
 * FILE HEADER — hooks/useSiteMenu.ts
 * =========================================================================
 *
 * PROPOSITO: busca o nav_manager ativo e sua arvore de itens (menu_manager)
 * para popular o Navbar dinamicamente. menu_manager guarda SO o que aparece
 * no Navbar real, espelhando 1:1 os grupos de modulo do backend (ver
 * src/app/Database/Seeds/MenuManagerSeeder.php) — grupo com filho nao tem
 * react_route (so agrupa, vira dropdown), item sem filho e link direto.
 * Enforcement de roles fica fora desta fase (ver
 * src/frontend/projeto54900/CLAUDE.md).
 *
 * Em erro ou lista vazia, `items` volta null: o Navbar decide usar o
 * fallback estatico (FALLBACK_NAV).
 *
 * DEPENDENCIAS: hooks/useApi (estado assincrono generico),
 * services/v1/navManager.table.ts, services/v1/menuManager.table.ts,
 * utils/apiResult (normalizeList) e types/menu (MenuManagerItem,
 * NavManagerItem).
 * CONSUMIDORES: components/layout/Navbar.tsx (unico consumidor).
 *
 * COMO REAPROVEITAR: chamar useSiteMenu() em qualquer componente que
 * precise da mesma arvore de navegacao; a normalizacao de flat rows ->
 * arvore (buildTree) e especifica de menu_manager, nao generica.
 * -------------------------------------------------------------------------
 */

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

/** Converte 1 item de menu_manager num link de navbar; null se nao tiver react_route (item so-agrupador). */
function toLink(item: MenuManagerItem): SiteMenuLink | null {
  if (!item.react_route) return null;
  return { to: item.react_route, label: item.title, end: item.react_route === '/' };
}

/**
 * Monta a arvore de navbar (grupo -> filhos) a partir das linhas planas de
 * menu_manager, agrupando por parent_id e ordenando por sort_order. Item
 * top-level com filhos (que tenham react_route) vira dropdown; sem filhos
 * navegaveis, cai no comportamento de link direto de toLink().
 */
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

/** Busca o nav ativo e, se existir, sua arvore de itens de menu; lista vazia se nao houver nav ativo. */
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

/** items === null em erro/lista vazia — o consumidor (Navbar) decide o fallback. */
export function useSiteMenu(): UseSiteMenuResult {
  const { data, loading, error }: UseApiResult<SiteMenuLink[]> = useApi(fetchSiteMenu, {
    immediate: true,
  });

  return { items: error ? null : data, loading };
}
